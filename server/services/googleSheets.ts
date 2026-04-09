/**
 * Serviço de leitura do Google Sheets via endpoint público (gviz/tq)
 * As planilhas precisam estar com compartilhamento "Qualquer pessoa com o link"
 */

export interface SheetRow {
  [key: string]: string | number | null;
}

/**
 * Faz o parse do JSON retornado pelo endpoint gviz/tq do Google Sheets
 * O endpoint retorna um JSONP que precisamos limpar antes de parsear
 */
function parseGvizResponse(raw: string): SheetRow[] {
  // Remove o wrapper "google.visualization.Query.setResponse(...);"
  const jsonString = raw
    .replace(/^[^{]*/, '')
    .replace(/[^}]*$/, '');

  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch {
    throw new Error('Falha ao parsear resposta do Google Sheets');
  }

  const table = data?.table;
  if (!table) throw new Error('Estrutura de tabela não encontrada na resposta');

  const cols: string[] = (table.cols || []).map((c: any) => c.label || c.id || '');
  const rows: SheetRow[] = (table.rows || []).map((r: any) => {
    const row: SheetRow = {};
    (r.c || []).forEach((cell: any, i: number) => {
      row[cols[i]] = cell ? (cell.v ?? null) : null;
    });
    return row;
  });

  // Filtra linhas completamente vazias
  return rows.filter(row => Object.values(row).some(v => v !== null && v !== ''));
}

/**
 * Lê uma planilha do Google Sheets pelo ID e GID da aba
 */
async function readSheet(spreadsheetId: string, gid: string): Promise<SheetRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&gid=${gid}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao acessar planilha (${spreadsheetId}): ${response.status} ${response.statusText}`);
  }

  const raw = await response.text();
  return parseGvizResponse(raw);
}

// IDs das planilhas
const SHEET_IDS = {
  processos: {
    id: '1Gkhy7jcxTb96NgrM7m2b1giu6zE7LE7GhEYxngyuALY',
    gid: '2009268709',
  },
  calendario: {
    id: '18X1WBzD_3NqHT7hS0F4SXTPQxgPb8yJkBZYpRTvzWqs',
    gid: '0',
  },
  vendas: {
    id: '1VFidJZwkNA2irqhvtp13B-kB_jOqt85cAXKVfkExJC4',
    gid: '0',
  },
};

export const GoogleSheetsService = {
  /**
   * Lê a planilha de processos
   */
  async getProcessos(): Promise<SheetRow[]> {
    return readSheet(SHEET_IDS.processos.id, SHEET_IDS.processos.gid);
  },

  /**
   * Lê a planilha de calendário (aniversários e eventos)
   */
  async getCalendario(): Promise<SheetRow[]> {
    return readSheet(SHEET_IDS.calendario.id, SHEET_IDS.calendario.gid);
  },

  /**
   * Lê a planilha de vendas do mês
   */
  async getVendas(): Promise<SheetRow[]> {
    return readSheet(SHEET_IDS.vendas.id, SHEET_IDS.vendas.gid);
  },
};
