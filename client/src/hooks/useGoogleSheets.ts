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
}

// Nomes válidos de planilhas disponíveis no proxy
export type SheetName = 'vendas' | 'clientes' | 'calendario';

// URL do proxy serverless — funciona tanto em dev (Vite proxy) quanto em produção (Vercel)
function getProxyUrl(sheet: SheetName): string {
  return `/api/sheets-proxy?sheet=${sheet}`;
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCsv(text: string): { headers: string[]; rows: SheetRow[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return { headers: [], rows: [] };

  function splitCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitCsvLine(lines[0]);
  const rows: SheetRow[] = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    const obj: SheetRow = {};
    headers.forEach((h, i) => {
      obj[h] = cells[i] ?? '';
    });
    return obj;
  });

  return { headers, rows };
}

// ─── Hook principal — busca via proxy serverless ──────────────────────────────

export function useSheetByName(
  sheetName: SheetName,
  pollingInterval = 60000
): SheetData & { refresh: () => void } {
  const [data, setData] = useState<SheetData>({
    headers: [],
    rows: [],
    lastUpdated: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const url = getProxyUrl(sheetName);
      const response = await fetch(url);
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`HTTP ${response.status} — ${body}`);
      }
      const text = await response.text();
      const { headers, rows } = parseCsv(text);
      setData({ headers, rows, lastUpdated: new Date(), loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setData((prev) => ({
        ...prev,
        loading: false,
        error: `Não foi possível carregar os dados: ${msg}`,
      }));
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

// ─── Hook legado (compatibilidade) — mapeia para useSheetByName ───────────────

const LEGACY_ID_MAP: Record<string, SheetName> = {
  '18X1WBzD_3NqHT7hS0F4SXTPQxgPb8yJkBZYpRTvzWqs': 'vendas',
  '1SDxyW-yoO1Y9YngZEL5L4uAKx8Vd9A18Y7oF7OdqvjI': 'clientes',
  '1RkhaBtnf2pTwGdZh8VroPSlvAjgfikS2pzrswllPTBJu': 'calendario',
};

export function useGoogleSheets(
  spreadsheetId: string,
  _gid?: string,
  pollingInterval = 60000,
  _headersRow = 1
): SheetData & { refresh: () => void } {
  const key = LEGACY_ID_MAP[spreadsheetId] ?? 'vendas';
  return useSheetByName(key, pollingInterval);
}

// ─── Parsed helper types ──────────────────────────────────────────────────────

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

// ─── normalizeProcessos ───────────────────────────────────────────────────────

export function normalizeProcessos(rows: SheetRow[]): ClienteRow[] {
  return rows
    .filter((r) => {
      if (Object.values(r).every((v) => v === '')) return false;
      const nome = pick(r, ['Família', 'familia', 'Nome', 'nome', 'Name']);
      if (!nome) return false;
      const lower = nome.toLowerCase();
      if (
        lower === 'família' ||
        lower === 'nome' ||
        lower.includes('velloso') ||
        lower.includes('controle')
      )
        return false;
      return true;
    })
    .map((r) => ({
      nome: pick(r, ['Família', 'familia', 'Nome', 'nome']),
      status: pick(r, ['Status', 'status', 'ETAPA Ação', 'Situação']),
      etapa: pick(r, ['ETAPA Ação', 'Etapa', 'etapa', 'Fase']),
      valorPago: pick(r, ['Total Contrato', 'Total Contratado', 'Valor', 'valor']),
      dataInicio: pick(r, ['Data', 'data', 'Data Início', 'Data de Início']),
      observacoes: pick(r, ['Docs Pendentes', 'Próxima Ação', 'Observações', 'Obs']),
      tipoServico: pick(r, ['Tipo de Serviço', 'Tipo', 'tipo']),
      vendedor: pick(r, ['Vendedor', 'vendedor']),
      ...r,
    }));
}

// ─── normalizeClientes ────────────────────────────────────────────────────────

export function normalizeClientes(rows: SheetRow[]): ClienteRow[] {
  return rows
    .filter((r) => {
      if (Object.values(r).every((v) => v === '')) return false;
      const nome = pick(r, ['Família', 'familia', 'Nome', 'nome', 'Cliente', 'cliente', 'Name']);
      if (!nome) return false;
      const lower = nome.toLowerCase();
      if (
        lower === 'família' ||
        lower === 'nome' ||
        lower === 'cliente' ||
        lower.includes('velloso') ||
        lower.includes('controle')
      )
        return false;
      return true;
    })
    .map((r) => ({
      nome: pick(r, ['Família', 'familia', 'Nome', 'nome', 'Cliente', 'cliente', 'Name']),
      email: pick(r, ['Email', 'E-mail', 'email', 'EMAIL']),
      telefone: pick(r, ['Telefone', 'telefone', 'Phone', 'Fone', 'Celular']),
      status: pick(r, ['Status', 'status', 'ETAPA Ação', 'Situação', 'Situacao']),
      etapa: pick(r, ['ETAPA Ação', 'Etapa', 'etapa', 'Fase', 'Stage']),
      valorPago: pick(r, ['Total Contrato', 'Total Contratado', 'Valor', 'valor', 'Pagamento']),
      dataInicio: pick(r, ['Data', 'data', 'Data Início', 'Data de Início', 'Created']),
      observacoes: pick(r, [
        'Docs Pendentes',
        'Próxima Ação',
        'Observações',
        'Obs',
        'Notes',
      ]),
      tipoServico: pick(r, ['Tipo de Serviço', 'Tipo', 'tipo']),
      vendedor: pick(r, ['Vendedor', 'vendedor']),
      ...r,
    }));
}

// ─── normalizeVendas ──────────────────────────────────────────────────────────

export function normalizeVendas(rows: SheetRow[]): VendaRow[] {
  let currentVendedor = '';
  const result: VendaRow[] = [];

  for (const r of rows) {
    if (Object.values(r).every((v) => v === '')) continue;

    const keys = Object.keys(r);
    const vendedorCol =
      r['Vendedor'] ?? r['vendedor'] ?? (keys[0] ? r[keys[0]] : '') ?? '';
    const clienteCol =
      r['Cliente'] ?? r['cliente'] ?? (keys[1] ? r[keys[1]] : '') ?? '';
    const servicoCol =
      r['Serviço Contratado'] ??
      r['Serviço'] ??
      r['servico'] ??
      r['Tipo'] ??
      (keys[2] ? r[keys[2]] : '') ??
      '';
    const valorCol =
      r['Valor'] ?? r['valor'] ?? r['Value'] ?? (keys[3] ? r[keys[3]] : '') ?? '';

    if (clienteCol.toLowerCase() === 'cliente') continue;

    if (
      vendedorCol &&
      !vendedorCol.toLowerCase().includes('total') &&
      vendedorCol.toLowerCase() !== 'vendedor'
    ) {
      currentVendedor = vendedorCol;
    }

    if (
      !clienteCol ||
      clienteCol.toLowerCase().includes('total') ||
      vendedorCol.toLowerCase().includes('total')
    )
      continue;

    result.push({
      cliente: clienteCol,
      valor: valorCol,
      tipo: servicoCol,
      vendedor: currentVendedor,
      data: pick(r, ['Data', 'data', 'Date']),
      status: pick(r, ['Status', 'status', 'Situação']),
      descricao: pick(r, ['Descrição', 'Descricao', 'Observações', 'Obs']),
      ...r,
    });
  }

  return result;
}

// ─── normalizeCalendario ──────────────────────────────────────────────────────

export function normalizeCalendario(rows: SheetRow[]): CalendarioRow[] {
  return rows
    .filter((r) => {
      if (Object.values(r).every((v) => v === '')) return false;
      const data = pick(r, ['Data', 'data', 'DATE', 'Date']);
      if (!data || !/\d/.test(data)) return false;
      if (data.toLowerCase() === 'data' || data.toLowerCase() === 'date') return false;
      return true;
    })
    .map((r) => {
      const dataStr = pick(r, ['Data', 'data', 'DATE', 'Date']);
      let dateKey = '';

      // Formato DD/MM/YYYY ou DD-MM-YYYY
      const m1 = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      // Formato YYYY-MM-DD (ISO)
      const m2 = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      // Formato DD/MM/YY
      const m3 = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})$/);

      if (m1) {
        dateKey = `${m1[3]}-${m1[2].padStart(2, '0')}-${m1[1].padStart(2, '0')}`;
      } else if (m2) {
        dateKey = dataStr;
      } else if (m3) {
        const year = parseInt(m3[3]) + 2000;
        dateKey = `${year}-${m3[2].padStart(2, '0')}-${m3[1].padStart(2, '0')}`;
      }

      return {
        data: dataStr,
        name: pick(r, ['Name', 'name', 'Nome', 'Evento', 'evento', 'Título', 'titulo']),
        tipo: pick(r, ['Tipo', 'tipo', 'Type', 'Categoria', 'categoria']),
        pais: pick(r, ['País', 'Pais', 'pais', 'Country', 'country']),
        natureza: pick(r, ['Natureza', 'natureza', 'Nature', 'nature']),
        dateKey,
        ...r,
      };
    });
}
