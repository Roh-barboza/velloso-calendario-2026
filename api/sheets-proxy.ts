import type { VercelRequest, VercelResponse } from '@vercel/node';

// URLs padrão — sobrescritas pelas env vars da Vercel ou pelo parâmetro ?url=
const DEFAULT_URLS: Record<string, string> = {
  vendas: process.env.SHEET_URL_VENDAS ?? '',
  clientes: process.env.SHEET_URL_CLIENTES ?? '',
  processos: process.env.SHEET_URL_PROCESSOS ?? '',
  calendario: process.env.SHEET_URL_CALENDARIO ?? '',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Aceita ?url=<csv_url_direta> OU ?sheet=<nome>
  const directUrl = req.query.url as string | undefined;
  const sheetName = req.query.sheet as string | undefined;

  let targetUrl = '';

  if (directUrl) {
    // Valida que é uma URL do Google Sheets
    if (!directUrl.includes('docs.google.com') && !directUrl.includes('spreadsheets')) {
      return res.status(400).json({ error: 'URL inválida. Use uma URL do Google Sheets.' });
    }
    // Garante que retorna CSV
    targetUrl = directUrl.includes('output=csv') ? directUrl : directUrl + (directUrl.includes('?') ? '&output=csv' : '?output=csv');
  } else if (sheetName && DEFAULT_URLS[sheetName]) {
    targetUrl = DEFAULT_URLS[sheetName];
    if (!targetUrl) {
      return res.status(404).json({
        error: `URL para "${sheetName}" não configurada. Acesse /configuracoes para definir.`,
        notConfigured: true,
      });
    }
  } else {
    return res.status(400).json({
      error: 'Informe ?sheet=<nome> ou ?url=<csv_url>. Nomes válidos: ' + Object.keys(DEFAULT_URLS).join(', '),
    });
  }

  try {
    const upstream = await fetch(targetUrl, {
      headers: { Accept: 'text/csv,text/plain,*/*' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Google Sheets retornou ${upstream.status}. Verifique se a planilha está publicada como CSV.`,
      });
    }

    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');
    return res.status(200).send(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `Erro ao buscar planilha: ${msg}` });
  }
}
