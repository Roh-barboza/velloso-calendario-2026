import type { VercelRequest, VercelResponse } from '@vercel/node';

// URLs CSV públicas das planilhas (publicadas via Arquivo → Publicar na Web → CSV)
const SHEET_URLS: Record<string, string> = {
  vendas:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSLRDqgcYE4QpXZ3WeGzr5nDeeEVvIDPOVmTdshA0lZEGZA9m3PZSVRBZh30_sROKFJFd4Ll3l-Ar_v/pub?output=csv',
  clientes:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSDxyW-yoO1Y9YngZEL5L4uAKx8Vd9A18Y7oF7OdqvjIUJJBGdnuakVX6FJz63m1kb2TnkpFyuGNAuVz/pub?output=csv',
  calendario:
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRkhaBtnf2pTwGdZh8VroPSlvAjgfikS2pzrswllPTBJuYQrrB8PEJXKRUvqdzl7oLsU37gMGTEd-qC/pub?output=csv',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers — permite que o frontend (mesmo domínio ou preview) acesse
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const sheet = (req.query.sheet as string) ?? '';

  if (!sheet || !SHEET_URLS[sheet]) {
    return res.status(400).json({
      error: `Parâmetro "sheet" inválido. Use: ${Object.keys(SHEET_URLS).join(', ')}`,
    });
  }

  try {
    const upstream = await fetch(SHEET_URLS[sheet], {
      headers: {
        // Impede que o Google retorne HTML de aviso em vez do CSV
        Accept: 'text/csv,text/plain,*/*',
      },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: `Google Sheets retornou ${upstream.status}: ${upstream.statusText}`,
      });
    }

    const text = await upstream.text();

    // Repassa o CSV com cache de 2 minutos
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=60');
    return res.status(200).send(text);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: `Erro ao buscar planilha: ${msg}` });
  }
}
