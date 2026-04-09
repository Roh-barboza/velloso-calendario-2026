import { useState, useEffect, useCallback } from 'react';

export interface SheetRow {
  [key: string]: string;
}

export interface SheetData {
  headers: string[];
  rows: SheetRow[];
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
}

// ─── Chaves de armazenamento local das URLs ───────────────────────────────────
export const SHEET_STORAGE_KEYS = {
  vendas: 'sheet_url_vendas',
  clientes: 'sheet_url_clientes',
  processos: 'sheet_url_processos',
  calendario: 'sheet_url_calendario',
} as const;

export type SheetName = keyof typeof SHEET_STORAGE_KEYS;

function getStoredUrl(name: SheetName): string {
  try { return localStorage.getItem(SHEET_STORAGE_KEYS[name]) ?? ''; }
  catch { return ''; }
}

export function setStoredUrl(name: SheetName, url: string): void {
  try { localStorage.setItem(SHEET_STORAGE_KEYS[name], url.trim()); }
  catch { /* ignore */ }
}

function buildProxyUrl(name: SheetName): string {
  const stored = getStoredUrl(name);
  if (stored) {
    return `/api/sheets-proxy?url=${encodeURIComponent(stored)}`;
  }
  return `/api/sheets-proxy?sheet=${name}`;
}

// ─── CSV parser ───────────────────────────────────────────────────────────────
function parseCsv(text: string): { headers: string[]; rows: SheetRow[] } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim()); current = '';
      } else { current += ch; }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitCsvLine(lines[0]);
  const rows: SheetRow[] = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const obj: SheetRow = {};
    headers.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
    return obj;
  });
  return { headers, rows };
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useSheetByName(
  sheetName: SheetName,
  pollingInterval = 60000
): SheetData & { refresh: () => void } {
  const [data, setData] = useState<SheetData>({
    headers: [], rows: [], lastUpdated: null, loading: false, error: null, notConfigured: false,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null, notConfigured: false }));
    try {
      const url = buildProxyUrl(sheetName);
      const response = await fetch(url);
      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        const body = await response.text();
        let parsed: { error?: string; notConfigured?: boolean } = {};
        try { parsed = JSON.parse(body); } catch { /* não é JSON */ }
        setData((prev) => ({
          ...prev, loading: false,
          error: parsed.error ?? `HTTP ${response.status}`,
          notConfigured: parsed.notConfigured ?? false,
        }));
        return;
      }

      const text = await response.text();
      if (!contentType.includes('csv') && !contentType.includes('text')) {
        setData((prev) => ({ ...prev, loading: false, error: 'Resposta inesperada do servidor', notConfigured: false }));
        return;
      }

      const { headers, rows } = parseCsv(text);
      setData({ headers, rows, lastUpdated: new Date(), loading: false, error: null, notConfigured: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setData((prev) => ({ ...prev, loading: false, error: msg, notConfigured: false }));
    }
  }, [sheetName]);

  useEffect(() => {
    fetchData();
    if (pollingInterval > 0) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval]);

  return { ...data, refresh: fetchData };
}

// ─── Hook legado ──────────────────────────────────────────────────────────────
export function useGoogleSheetsCsv(
  _unused: string,
  pollingInterval = 60000
): SheetData & { refresh: () => void } {
  return useSheetByName('vendas', pollingInterval);
}

export const SHEET_URLS = { vendas: '', clientes: '', processos: '', calendario: '' };

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ClienteRow {
  nome: string; email?: string; telefone?: string; status?: string;
  etapa?: string; valorPago?: string; dataInicio?: string;
  observacoes?: string; tipoServico?: string; vendedor?: string;
  [key: string]: string | undefined;
}
export interface VendaRow {
  data?: string; cliente?: string; valor?: string; status?: string;
  tipo?: string; descricao?: string; vendedor?: string;
  [key: string]: string | undefined;
}
export interface CalendarioRow {
  data?: string; name?: string; tipo?: string; pais?: string;
  natureza?: string; dateKey?: string;
  [key: string]: string | undefined;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pick(row: SheetRow, candidates: string[]): string {
  for (const c of candidates) {
    const val = row[c];
    if (val !== undefined && val !== '') return val;
    const key = Object.keys(row).find((k) => k.toLowerCase() === c.toLowerCase());
    if (key && row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

export function normalizeProcessos(rows: SheetRow[]): ClienteRow[] {
  return rows.filter((r) => {
    if (Object.values(r).every((v) => v === '')) return false;
    const nome = pick(r, ['Família','familia','Nome','nome','Name']);
    if (!nome) return false;
    const lower = nome.toLowerCase();
    return !['família','nome'].includes(lower) && !lower.includes('velloso') && !lower.includes('controle');
  }).map((r) => ({
    nome: pick(r, ['Família','familia','Nome','nome']),
    status: pick(r, ['Status','status','ETAPA Ação','Situação']),
    etapa: pick(r, ['ETAPA Ação','Etapa','etapa','Fase']),
    valorPago: pick(r, ['Total Contrato','Total Contratado','Valor','valor']),
    dataInicio: pick(r, ['Data','data','Data Início','Data de Início']),
    observacoes: pick(r, ['Docs Pendentes','Próxima Ação','Observações','Obs']),
    tipoServico: pick(r, ['Tipo de Serviço','Tipo','tipo']),
    vendedor: pick(r, ['Vendedor','vendedor']),
    ...r,
  }));
}

export function normalizeClientes(rows: SheetRow[]): ClienteRow[] {
  return rows.filter((r) => {
    if (Object.values(r).every((v) => v === '')) return false;
    const nome = pick(r, ['Família','familia','Nome','nome','Cliente','cliente','Name']);
    if (!nome) return false;
    const lower = nome.toLowerCase();
    return !['família','nome','cliente'].includes(lower) && !lower.includes('velloso') && !lower.includes('controle');
  }).map((r) => ({
    nome: pick(r, ['Família','familia','Nome','nome','Cliente','cliente','Name']),
    email: pick(r, ['Email','E-mail','email','EMAIL']),
    telefone: pick(r, ['Telefone','telefone','Phone','Fone','Celular']),
    status: pick(r, ['Status','status','ETAPA Ação','Situação','Situacao']),
    etapa: pick(r, ['ETAPA Ação','Etapa','etapa','Fase','Stage']),
    valorPago: pick(r, ['Total Contrato','Total Contratado','Valor','valor','Pagamento']),
    dataInicio: pick(r, ['Data','data','Data Início','Data de Início','Created']),
    observacoes: pick(r, ['Docs Pendentes','Próxima Ação','Observações','Obs','Notes']),
    tipoServico: pick(r, ['Tipo de Serviço','Tipo','tipo']),
    vendedor: pick(r, ['Vendedor','vendedor']),
    ...r,
  }));
}

export function normalizeVendas(rows: SheetRow[]): VendaRow[] {
  let currentVendedor = '';
  const result: VendaRow[] = [];
  for (const r of rows) {
    if (Object.values(r).every((v) => v === '')) continue;
    const keys = Object.keys(r);
    const vendedorCol = r['Vendedor'] ?? r['vendedor'] ?? (keys[0] ? r[keys[0]] : '') ?? '';
    const clienteCol = r['Cliente'] ?? r['cliente'] ?? (keys[1] ? r[keys[1]] : '') ?? '';
    const servicoCol = r['Serviço Contratado'] ?? r['Serviço'] ?? r['servico'] ?? r['Tipo'] ?? (keys[2] ? r[keys[2]] : '') ?? '';
    const valorCol = r['Valor'] ?? r['valor'] ?? r['Value'] ?? (keys[3] ? r[keys[3]] : '') ?? '';
    if (clienteCol.toLowerCase() === 'cliente') continue;
    if (vendedorCol && !vendedorCol.toLowerCase().includes('total') && vendedorCol.toLowerCase() !== 'vendedor') {
      currentVendedor = vendedorCol;
    }
    if (!clienteCol || clienteCol.toLowerCase().includes('total') || vendedorCol.toLowerCase().includes('total')) continue;
    result.push({
      cliente: clienteCol, valor: valorCol, tipo: servicoCol, vendedor: currentVendedor,
      data: pick(r, ['Data','data','Date']),
      status: pick(r, ['Status','status','Situação']),
      descricao: pick(r, ['Descrição','Descricao','Observações','Obs']),
      ...r,
    });
  }
  return result;
}

export function normalizeCalendario(rows: SheetRow[]): CalendarioRow[] {
  return rows.filter((r) => {
    if (Object.values(r).every((v) => v === '')) return false;
    const data = pick(r, ['Data','data','DATE','Date']);
    if (!data || !/\d/.test(data)) return false;
    return !['data','date'].includes(data.toLowerCase());
  }).map((r) => {
    const dataStr = pick(r, ['Data','data','DATE','Date']);
    let dateKey = '';
    const m1 = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    const m2 = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const m3 = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
    if (m1) dateKey = `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
    else if (m2) dateKey = dataStr;
    else if (m3) { const year = parseInt(m3[3]) + 2000; dateKey = `${year}-${m3[2].padStart(2,'0')}-${m3[1].padStart(2,'0')}`; }
    return {
      data: dataStr,
      name: pick(r, ['Name','name','Nome','Evento','evento','Título','titulo']),
      tipo: pick(r, ['Tipo','tipo','Type','Categoria','categoria']),
      pais: pick(r, ['País','Pais','pais','Country','country']),
      natureza: pick(r, ['Natureza','natureza','Nature','nature']),
      dateKey, ...r,
    };
  });
}
