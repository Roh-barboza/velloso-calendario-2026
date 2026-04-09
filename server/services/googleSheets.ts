/**
 * Serviço de leitura do Google Sheets via CSV publicado
 * As planilhas precisam estar publicadas em Arquivo > Publicar na Web > CSV
 */

export interface SheetRow {
  [key: string]: string;
}

/**
 * Faz parse de uma string CSV respeitando campos entre aspas com vírgulas
 */
function parseCSV(csvText: string): SheetRow[] {
  function splitLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitLine(lines[0]);

  return lines
    .slice(1)
    .map((line) => {
      const cells = splitLine(line);
      const row: SheetRow = {};
      headers.forEach((header, i) => {
        row[header] = cells[i] ?? '';
      });
      return row;
    })
    .filter((row) => Object.values(row).some((v) => v !== ''));
}

/**
 * Busca e faz parse de uma planilha CSV pública do Google Sheets
 */
async function readSheetCSV(csvUrl: string): Promise<SheetRow[]> {
  const response = await fetch(csvUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!response.ok) {
    throw new Error(`Erro ao acessar planilha: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseCSV(text);
}

// URLs CSV publicadas via Arquivo > Publicar na Web > CSV
const SHEET_URLS = {
  processos:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLRDqgcYE4QpXZ3WeGzr5nDeeEVvIDPOVmTdshA0lZEGZA9m3PZSVRBZh30_sROKFJFd4Ll3l-Ar_v/pub?output=csv',
  vendas:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkhaBtnf2pTwGdZh8VroPSlvAjgfikS2pzrswllPTBJuYQrrB8PEJXKRUvqdzl7oLsU37gMGTEd-qC/pub?output=csv',
  calendario:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDxyW-yoO1Y9YngZEL5L4uAKx8Vd9A18Y7oF7OdqvjIUJBGdnuakVX6FJz63m1kb2TnkpFyuGNAuVz/pub?output=csv',
};

export const GoogleSheetsService = {
  /**
   * Lê a planilha de processos
   * Colunas: Nº Pasta, Família, Tipo de Serviço, Vendedor, Responsável,
   *          Data Contrato, ETAPA ATUAL, Próximo Prazo, Próxima Ação,
   *          Docs Pendentes, Total Contrato, Total Pago, Saldo Devedor,
   *          Taxa 700€, Qtd Requerentes, Últ. Contato Cliente, Últ. Atualização,
   *          Observações, Arquivo Drive
   */
  async getProcessos(): Promise<SheetRow[]> {
    const rows = await readSheetCSV(SHEET_URLS.processos);
    // Remove a linha de título (primeira linha é o cabeçalho da planilha com o nome da empresa)
    return rows.filter((row) => {
      const firstVal = Object.values(row)[0] ?? '';
      return !firstVal.includes('VELLOSO') && !firstVal.includes('Nº');
    });
  },

  /**
   * Lê a planilha de calendário
   * Colunas: Data, Nome, Tipo, País, Natureza
   */
  async getCalendario(): Promise<SheetRow[]> {
    return readSheetCSV(SHEET_URLS.calendario);
  },

  /**
   * Lê a planilha de vendas do mês
   * Colunas: Vendedor (col A), Cliente (col B), Serviço Contratado (col C), Valor (col D)
   */
  async getVendas(): Promise<SheetRow[]> {
    const rows = await readSheetCSV(SHEET_URLS.vendas);
    // Filtra apenas linhas com cliente e valor preenchidos, ignorando títulos e totais
    return rows.filter((row) => {
      const vals = Object.values(row);
      const cliente = vals[1] ?? '';
      const valor = vals[3] ?? '';
      return (
        cliente !== '' &&
        cliente !== 'Cliente' &&
        valor !== '' &&
        valor !== 'Valor' &&
        !cliente.match(/^\d+$/) // ignora linhas de total (ex: "4", "14")
      );
    });
  },
};
