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
  pollingInterval = 30000,
  headersRow = 1
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
      const headersParam = headersRow > 1 ? `&headers=${headersRow}` : '';
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json${gidParam}${headersParam}`;
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
  }, [spreadsheetId, gid, headersRow]);

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
  data?: string;       // DD/MM/YYYY from sheet
  name?: string;       // Event name
  tipo?: string;       // Aniversário / Feriado / Evento Especial
  pais?: string;       // País
  natureza?: string;   // Natureza
  dateKey?: string;    // YYYY-MM-DD (parsed)
  [key: string]: string | undefined;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

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

// ─── Processos sheet (title in row 1, actual headers in row 2) ──────────────
// Real columns: N°, Família, Tipo de Serviço, Vendedor, Cidades, Data,
//               ETAPA Ação, Próxima Ação, Docs Pendentes, Total Contrato, Total Contratado

export function normalizeProcessos(rows: SheetRow[]): ClienteRow[] {
  return rows
    .filter((r) => {
      if (Object.values(r).every((v) => v === '')) return false;
      const nome = pick(r, ['Família', 'familia', 'Nome', 'nome', 'Name']);
      // Skip header-repeat rows and title rows
      if (!nome) return false;
      const lower = nome.toLowerCase();
      if (lower === 'família' || lower === 'nome' || lower.includes('velloso') || lower.includes('controle')) return false;
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

// ─── Clientes sheet (same sheet as processos, same column structure) ────────

export function normalizeClientes(rows: SheetRow[]): ClienteRow[] {
  return rows
    .filter((r) => {
      if (Object.values(r).every((v) => v === '')) return false;
      const nome = pick(r, ['Família', 'familia', 'Nome', 'nome', 'Cliente', 'cliente', 'Name']);
      if (!nome) return false;
      const lower = nome.toLowerCase();
      if (lower === 'família' || lower === 'nome' || lower === 'cliente' || lower.includes('velloso') || lower.includes('controle')) return false;
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
      observacoes: pick(r, ['Docs Pendentes', 'Próxima Ação', 'Observações', 'Obs', 'Notes']),
      tipoServico: pick(r, ['Tipo de Serviço', 'Tipo', 'tipo']),
      vendedor: pick(r, ['Vendedor', 'vendedor']),
      ...r,
    }));
}

// ─── Vendas sheet ────────────────────────────────────────────────────────────
// Real structure: col A = Vendedor (section header, sparse), B = Cliente,
//                 C = Serviço Contratado, D = Valor
// Has repeating header rows and total rows that must be skipped.

export function normalizeVendas(rows: SheetRow[]): VendaRow[] {
  let currentVendedor = '';
  const result: VendaRow[] = [];

  for (const r of rows) {
    if (Object.values(r).every((v) => v === '')) continue;

    // Use direct column names as primary, then fall back to positional
    const keys = Object.keys(r);
    const vendedorCol = r['Vendedor'] ?? r['vendedor'] ?? (keys[0] ? r[keys[0]] : '') ?? '';
    const clienteCol  = r['Cliente']  ?? r['cliente']  ?? (keys[1] ? r[keys[1]] : '') ?? '';
    const servicoCol  = r['Serviço Contratado'] ?? r['Serviço'] ?? r['servico'] ?? r['Tipo'] ?? (keys[2] ? r[keys[2]] : '') ?? '';
    const valorCol    = r['Valor']    ?? r['valor']    ?? r['Value'] ?? (keys[3] ? r[keys[3]] : '') ?? '';

    // Skip header-repeat rows (where B = "Cliente")
    if (clienteCol.toLowerCase() === 'cliente') continue;

    // If col A has a non-total, non-empty value, update current vendedor
    if (vendedorCol && !vendedorCol.toLowerCase().includes('total') &&
        vendedorCol.toLowerCase() !== 'vendedor') {
      currentVendedor = vendedorCol;
    }

    // Skip rows with no client name or that are total/subtotal rows
    if (!clienteCol ||
        clienteCol.toLowerCase().includes('total') ||
        vendedorCol.toLowerCase().includes('total')) continue;

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

// ─── Calendário sheet ────────────────────────────────────────────────────────
// Real columns: Data (DD/MM/YYYY), Name, Tipo, País, Natureza

export function normalizeCalendario(rows: SheetRow[]): CalendarioRow[] {
  return rows
    .filter((r) => {
      if (Object.values(r).every((v) => v === '')) return false;
      const data = pick(r, ['Data', 'data', 'DATE', 'Date']);
      // Must have a date with digits
      if (!data || !/\d/.test(data)) return false;
      // Skip header rows
      if (data.toLowerCase() === 'data' || data.toLowerCase() === 'date') return false;
      return true;
    })
    .map((r) => {
      const dataStr = pick(r, ['Data', 'data', 'DATE', 'Date']);
      let dateKey = '';
      // Parse DD/MM/YYYY → YYYY-MM-DD
      const m = dataStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
      if (m) {
        dateKey = `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
      }
      return {
        data: dataStr,
        name: pick(r, ['Name', 'name', 'Nome', 'Evento', 'evento']),
        tipo: pick(r, ['Tipo', 'tipo', 'Type', 'Categoria']),
        pais: pick(r, ['País', 'Pais', 'pais', 'Country']),
        natureza: pick(r, ['Natureza', 'natureza', 'Nature']),
        dateKey,
        ...r,
      };
    });
}
