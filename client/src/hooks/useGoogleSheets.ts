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

function parseGoogleSheetsJSON(jsonText: string): { headers: string[]; rows: SheetRow[] } {
  // Google Sheets gviz/tq returns JS: /*O_o*/ google.visualization.Query.setResponse({...})
  const match = jsonText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
  if (!match) throw new Error('Formato de resposta inválido');

  const data = JSON.parse(match[1]);
  const table = data.table;

  if (!table || !table.cols) throw new Error('Tabela não encontrada na planilha');

  const headers: string[] = table.cols.map((col: { label?: string; id?: string }) => col.label || col.id || '');

  const rows: SheetRow[] = (table.rows || []).map((row: { c: Array<{ v?: unknown; f?: string } | null> }) => {
    const obj: SheetRow = {};
    (row.c || []).forEach((cell, i: number) => {
      const header = headers[i];
      if (header) {
        obj[header] = cell ? (cell.f ?? (cell.v !== null && cell.v !== undefined ? String(cell.v) : '')) : '';
      }
    });
    return obj;
  });

  return { headers, rows };
}

export function useGoogleSheets(
  spreadsheetId: string,
  gid?: string,
  pollingInterval = 30000
): SheetData & { refresh: () => void } {
  const [data, setData] = useState<SheetData>({
    headers: [],
    rows: [],
    lastUpdated: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async () => {
    if (!spreadsheetId) return;
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const gidParam = gid ? `&gid=${gid}` : '';
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json${gidParam}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const text = await response.text();
      const { headers, rows } = parseGoogleSheetsJSON(text);
      setData({ headers, rows, lastUpdated: new Date(), loading: false, error: null });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setData((prev) => ({
        ...prev,
        loading: false,
        error: `Não foi possível carregar os dados: ${msg}. Verifique se a planilha está publicada.`,
      }));
    }
  }, [spreadsheetId, gid]);

  useEffect(() => {
    fetchData();
    if (pollingInterval > 0) {
      const interval = setInterval(fetchData, pollingInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, pollingInterval]);

  return { ...data, refresh: fetchData };
}

// ─── Parsed helper types ────────────────────────────────────────────────────

export interface ClienteRow {
  nome: string;
  email?: string;
  telefone?: string;
  status?: string;
  etapa?: string;
  valorPago?: string;
  dataInicio?: string;
  observacoes?: string;
  [key: string]: string | undefined;
}

export interface VendaRow {
  data?: string;
  cliente?: string;
  valor?: string;
  status?: string;
  tipo?: string;
  descricao?: string;
  [key: string]: string | undefined;
}

/** Map the first non-empty match from a list of possible column names */
function pick(row: SheetRow, candidates: string[]): string {
  for (const c of candidates) {
    const val = row[c];
    if (val !== undefined && val !== '') return val;
    // case-insensitive fallback
    const key = Object.keys(row).find((k) => k.toLowerCase() === c.toLowerCase());
    if (key && row[key] !== undefined && row[key] !== '') return row[key];
  }
  return '';
}

export function normalizeClientes(rows: SheetRow[]): ClienteRow[] {
  return rows
    .filter((r) => Object.values(r).some((v) => v !== ''))
    .map((r) => ({
      nome: pick(r, ['Nome', 'nome', 'NOME', 'Cliente', 'cliente', 'Name']),
      email: pick(r, ['Email', 'E-mail', 'email', 'EMAIL']),
      telefone: pick(r, ['Telefone', 'telefone', 'Phone', 'Fone', 'Celular']),
      status: pick(r, ['Status', 'status', 'Situação', 'Situacao']),
      etapa: pick(r, ['Etapa', 'etapa', 'Fase', 'Estágio', 'Stage']),
      valorPago: pick(r, ['Valor', 'valor', 'Valor Pago', 'Pagamento', 'Value']),
      dataInicio: pick(r, ['Data', 'data', 'Data Início', 'Data de Início', 'Created', 'Data Entrada']),
      observacoes: pick(r, ['Observações', 'Observacoes', 'obs', 'Notes', 'Notas']),
      ...r,
    }));
}

export function normalizeVendas(rows: SheetRow[]): VendaRow[] {
  return rows
    .filter((r) => Object.values(r).some((v) => v !== ''))
    .map((r) => ({
      data: pick(r, ['Data', 'data', 'Date']),
      cliente: pick(r, ['Cliente', 'cliente', 'Nome', 'Name']),
      valor: pick(r, ['Valor', 'valor', 'Value', 'Receita']),
      status: pick(r, ['Status', 'status', 'Situação']),
      tipo: pick(r, ['Tipo', 'tipo', 'Type', 'Categoria']),
      descricao: pick(r, ['Descrição', 'Descricao', 'Obs', 'Notes']),
      ...r,
    }));
}
