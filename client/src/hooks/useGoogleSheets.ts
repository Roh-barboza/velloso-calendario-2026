import { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface ClienteRow {
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
  etapa?: string;
  valorPago?: string;
  dataInicio?: string;
  observacoes?: string;
  tipoServico?: string;
  vendedor?: string;
  [key: string]: string | undefined;
}

export interface VendaRow {
  data?: string;
  cliente?: string;
  valor?: string;
  status?: string;
  tipo?: string;
  descricao?: string;
  vendedor?: string;
  [key: string]: string | undefined;
}

export interface CalendarioRow {
  data?: string;
  name?: string;
  tipo?: string;
  pais?: string;
  natureza?: string;
  dateKey?: string;
  [key: string]: string | undefined;
}

// ─── Sheet names e URLs padrão ────────────────────────────────────────────────

export const SHEET_STORAGE_KEYS = {
  vendas:     'sheet_url_vendas',
  clientes:   'sheet_url_clientes',
  processos:  'sheet_url_processos',
  calendario: 'sheet_url_calendario',
} as const;

export type SheetName = keyof typeof SHEET_STORAGE_KEYS;

// URLs CSV publicadas via "Publicar na Web" do Google Sheets
const DEFAULT_CSV_URLS: Record<SheetName, string> = {
  calendario: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDxyW-yoO1Y9YngZEL5L4uAKx8Vd9A18Y7oF7OdqvjIUJBGdnuakVX6FJz63m1kb2TnkpFyuGNAuVz/pub?output=csv',
  vendas:     'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkhaBtnf2pTwGdZh8VroPSlvAjgfikS2pzrswllPTBJuYQrrB8PEJXKRUvqdzl7oLsU37gMGTEd-qC/pub?output=csv',
  processos:  'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLRDqgcYE4QpXZ3WeGzr5nDeeEVvIDPOVmTdshA0lZEGZA9m3PZSVRBZh30_sROKFJFd4Ll3l-Ar_v/pub?output=csv',
  clientes:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLRDqgcYE4QpXZ3WeGzr5nDeeEVvIDPOVmTdshA0lZEGZA9m3PZSVRBZh30_sROKFJFd4Ll3l-Ar_v/pub?output=csv',
};

// Planilha de processos tem linha de título antes do cabeçalho real → pular 1
const SKIP_ROWS: Partial<Record<SheetName, number>> = {
  processos: 1,
  clientes:  1,
};

export const SHEET_URLS = DEFAULT_CSV_URLS; // backward compat

// ─── localStorage helpers ─────────────────────────────────────────────────────

function getStoredUrl(name: SheetName): string {
  try { return localStorage.getItem(SHEET_STORAGE_KEYS[name]) ?? ''; }
  catch { return ''; }
}

export function setStoredUrl(name: SheetName, url: string): void {
  try { localStorage.setItem(SHEET_STORAGE_KEYS[name], url.trim()); }
  catch { /* ignore */ }
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

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
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text: string, skipRows = 0): { headers: string[]; rows: SheetRow[] } {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length <= skipRows) return { headers: [], rows: [] };

  const headers = splitCsvLine(lines[skipRows]);
  const rows: SheetRow[] = lines.slice(skipRows + 1).map(line => {
    const cells = splitCsvLine(line);
    const obj: SheetRow = {};
    headers.forEach((h, i) => { if (h) obj[h] = cells[i] ?? ''; });
    return obj;
  });
  return { headers, rows };
}

// ─── useSheetByName — hook principal ─────────────────────────────────────────
// Busca direto da URL CSV publicada (sem proxy). Funciona em sites estáticos.

export function useSheetByName(
  sheetName: SheetName,
  pollingInterval = 60000
): SheetData & { refresh: () => void } {
  const [data, setData] = useState<SheetData>({
    headers: [], rows: [], lastUpdated: null, loading: false, error: null, notConfigured: false,
  });

  const fetchData = useCallback(async () => {
    const csvUrl = getStoredUrl(sheetName) || DEFAULT_CSV_URLS[sheetName];
    if (!csvUrl) {
      setData(prev => ({ ...prev, loading: false, notConfigured: true }));
      return;
    }

    setData(prev => ({ ...prev, loading: true, error: null, notConfigured: false }));
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const skip = SKIP_ROWS[sheetName] ?? 0;
      const { headers, rows } = parseCsv(text, skip);
      console.info(`[Sheet:${sheetName}] headers:`, headers, `| rows:${rows.length}`);
      setData({ headers, rows, lastUpdated: new Date(), loading: false, error: null, notConfigured: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setData(prev => ({ ...prev, loading: false, error: msg, notConfigured: false }));
    }
  }, [sheetName]);

  useEffect(() => {
    fetchData();
    if (pollingInterval > 0) {
      const t = setInterval(fetchData, pollingInterval);
      return () => clearInterval(t);
    }
  }, [fetchData, pollingInterval]);

  return { ...data, refresh: fetchData };
}

// ─── useGoogleSheetsCsv — wrapper de compatibilidade ─────────────────────────

export function useGoogleSheetsCsv(
  _url: string,
  pollingInterval = 60000,
  sheetName: SheetName = 'vendas'
): SheetData & { refresh: () => void } {
  return useSheetByName(sheetName, pollingInterval);
}

// ─── useGoogleSheets — wrapper legado ────────────────────────────────────────

export function useGoogleSheets(
  _spreadsheetId: string,
  _gid?: string,
  pollingInterval = 60000
): SheetData & { refresh: () => void } {
  return useSheetByName('processos', pollingInterval);
}

// ─── useCSVSheet — alias direto por URL ──────────────────────────────────────

export function useCSVSheet(
  csvUrl: string,
  pollingInterval = 60000,
  skipRows = 0
): SheetData & { refresh: () => void } {
  const [data, setData] = useState<SheetData>({
    headers: [], rows: [], lastUpdated: null, loading: false, error: null, notConfigured: false,
  });

  const fetchData = useCallback(async () => {
    if (!csvUrl) { setData(prev => ({ ...prev, notConfigured: true })); return; }
    setData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await fetch(csvUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const { headers, rows } = parseCsv(text, skipRows);
      setData({ headers, rows, lastUpdated: new Date(), loading: false, error: null, notConfigured: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro';
      setData(prev => ({ ...prev, loading: false, error: msg, notConfigured: false }));
    }
  }, [csvUrl, skipRows]);

  useEffect(() => {
    fetchData();
    if (pollingInterval > 0) { const t = setInterval(fetchData, pollingInterval); return () => clearInterval(t); }
  }, [fetchData, pollingInterval]);

  return { ...data, refresh: fetchData };
}

// ─── Normalize helpers ────────────────────────────────────────────────────────

function pick(row: SheetRow, candidates: string[]): string {
  for (const c of candidates) {
    if (row[c]?.trim()) return row[c].trim();
    const key = Object.keys(row).find(k => k.toLowerCase() === c.toLowerCase());
    if (key && row[key]?.trim()) return row[key].trim();
  }
  return '';
}

export function normalizeProcessos(rows: SheetRow[]): ClienteRow[] {
  return rows
    .filter(r => {
      if (Object.values(r).every(v => !v.trim())) return false;
      const nome = pick(r, ['Família','familia','Nome','nome','Name']);
      if (!nome) return false;
      const lower = nome.toLowerCase();
      if (['família','familia','nome','cliente','name','n°','nº'].includes(lower)) return false;
      if (lower.includes('velloso') || lower.includes('controle') || lower.includes('cidadan')) return false;
      return true;
    })
    .map(r => ({
      nome:        pick(r, ['Família','familia','Nome','nome']),
      status:      pick(r, ['Status','status','ETAPA Ação','Situação']),
      etapa:       pick(r, ['ETAPA Ação','Etapa Ação','etapa','Fase']),
      valorPago:   pick(r, ['Total Contrato','Total Contratado','Valor','valor']),
      dataInicio:  pick(r, ['Data','data','Data Início','Data de Início']),
      observacoes: pick(r, ['Docs Pendentes','Próxima Ação','Observações','Obs']),
      tipoServico: pick(r, ['Tipo de Serviço','Tipo','tipo']),
      vendedor:    pick(r, ['Vendedor','vendedor']),
      ...r,
    }));
}

export function normalizeClientes(rows: SheetRow[]): ClienteRow[] {
  return normalizeProcessos(rows);
}

export function normalizeVendas(rows: SheetRow[]): VendaRow[] {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  console.info('[normalizeVendas] headers:', headers, '| total rows:', rows.length);
  console.info('[normalizeVendas] row[0]:', rows[0]);
  console.info('[normalizeVendas] row[1]:', rows[1]);

  // Mapeia índice de cada campo pelo nome do cabeçalho (case-insensitive + normalizado)
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const findIdx = (candidates: string[]) => {
    const c = candidates.map(norm);
    return headers.findIndex(h => c.some(k => norm(h).includes(k)));
  };

  const idxVendedor = findIdx(['vendedor','seller','consultor']);
  const idxCliente  = findIdx(['cliente','familia','nome','name','lead']);
  const idxServico  = findIdx(['servico','tipo','service','contrato']);
  const idxValor    = findIdx(['valor','total','value','price','preco']);
  const idxData     = findIdx(['data','date','entrada']);
  const idxStatus   = findIdx(['status','situacao','situação','estado']);

  console.info('[normalizeVendas] col indices →', { idxVendedor, idxCliente, idxServico, idxValor, idxData, idxStatus });

  const getCol = (row: SheetRow, idx: number, fallbackIdx?: number): string => {
    if (idx >= 0 && row[headers[idx]]?.trim()) return row[headers[idx]].trim();
    if (fallbackIdx !== undefined && fallbackIdx >= 0 && row[headers[fallbackIdx]]?.trim())
      return row[headers[fallbackIdx]].trim();
    return '';
  };

  let currentVendedor = '';
  const result: VendaRow[] = [];

  for (const r of rows) {
    // Pula linhas completamente vazias
    if (Object.values(r).every(v => !v?.trim())) continue;

    // Detecta linha de cabeçalho repetida
    const firstVal = Object.values(r).find(v => v?.trim()) ?? '';
    if (['vendedor','seller','cliente','client','nome'].includes(firstVal.trim().toLowerCase())) continue;
    if (firstVal.trim().toLowerCase().includes('vendedor') && Object.values(r).filter(v => v?.trim()).length <= 2) continue;

    const vendedor = getCol(r, idxVendedor);
    // Usa fallback posicional para cliente: col 1 se não tiver coluna dedicada
    const cliente  = getCol(r, idxCliente, idxCliente < 0 ? 1 : undefined);
    const servico  = getCol(r, idxServico,  idxServico  < 0 ? 2 : undefined);
    const valor    = getCol(r, idxValor,    idxValor    < 0 ? 3 : undefined);
    const data     = getCol(r, idxData,     idxData     < 0 ? 4 : undefined);
    const status   = getCol(r, idxStatus,   idxStatus   < 0 ? 5 : undefined);

    // Linha de vendedor (col 0 preenchida, col 1 vazia)
    if (vendedor && !cliente && !valor) {
      if (!norm(vendedor).includes('total')) currentVendedor = vendedor;
      continue;
    }

    // Ignora totais
    if (norm(cliente).includes('total') || norm(vendedor).includes('total')) continue;
    if (!cliente && !valor) continue;

    result.push({
      cliente:   cliente  || vendedor,
      valor:     valor    || '',
      tipo:      servico  || '',
      vendedor:  vendedor || currentVendedor,
      data:      data     || '',
      status:    status   || '',
      descricao: pick(r, ['Descrição','Descricao','Observações','Obs','obs']),
      ...r,
    });
  }

  console.info('[normalizeVendas] parsed rows:', result.length, result.slice(0, 3));
  return result;
}

export function normalizeCalendario(rows: SheetRow[]): CalendarioRow[] {
  return rows
    .filter(r => {
      const d = pick(r, ['Data','data','DATE','Date']);
      if (!d || !/\d/.test(d)) return false;
      if (['data','date'].includes(d.toLowerCase())) return false;
      return true;
    })
    .map(r => {
      const dataStr = pick(r, ['Data','data','DATE','Date']);
      let dateKey = '';
      const m1 = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      const m2 = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const m3 = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);
      if (m1) dateKey = `${m1[3]}-${m1[2].padStart(2,'0')}-${m1[1].padStart(2,'0')}`;
      else if (m2) dateKey = dataStr;
      else if (m3) dateKey = `${2000+parseInt(m3[3])}-${m3[2].padStart(2,'0')}-${m3[1].padStart(2,'0')}`;
      return {
        data:     dataStr,
        name:     pick(r, ['Name','name','Nome','Evento','evento','Título','titulo']),
        tipo:     pick(r, ['Tipo','tipo','Type','Categoria','categoria']),
        pais:     pick(r, ['País','Pais','pais','Country','country']),
        natureza: pick(r, ['Natureza','natureza','Nature','nature']),
        dateKey,
        ...r,
      };
    });
}
