import { useState, useEffect } from 'react';
import { Settings, Link2, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Info } from 'lucide-react';
import Layout from '@/components/Layout';
import { SHEET_STORAGE_KEYS, setStoredUrl, type SheetName } from '@/hooks/useGoogleSheets';

const SHEETS_CONFIG: { key: SheetName; label: string; description: string; icon: string }[] = [
  {
    key: 'vendas',
    label: 'Planilha de Vendas',
    description: 'Usada na página /vendas — registros de vendas, receita e gráficos.',
    icon: '📈',
  },
  {
    key: 'clientes',
    label: 'Planilha de Clientes',
    description: 'Usada na página /clientes — lista de clientes e status.',
    icon: '👥',
  },
  {
    key: 'processos',
    label: 'Planilha de Processos',
    description: 'Usada na página /processos — andamento de processos de cidadania.',
    icon: '📋',
  },
  {
    key: 'calendario',
    label: 'Planilha do Calendário',
    description: 'Usada na página /calendario — eventos, aniversários e feriados.',
    icon: '📅',
  },
];

function getStored(key: SheetName): string {
  try { return localStorage.getItem(SHEET_STORAGE_KEYS[key]) ?? ''; }
  catch { return ''; }
}

interface TestStatus {
  status: 'idle' | 'loading' | 'ok' | 'error';
  message: string;
  rows?: number;
}

export default function Configuracoes() {
  const [urls, setUrls] = useState<Record<SheetName, string>>({
    vendas: '', clientes: '', processos: '', calendario: '',
  });
  const [saved, setSaved] = useState<Record<SheetName, boolean>>({
    vendas: false, clientes: false, processos: false, calendario: false,
  });
  const [tests, setTests] = useState<Record<SheetName, TestStatus>>({
    vendas: { status: 'idle', message: '' },
    clientes: { status: 'idle', message: '' },
    processos: { status: 'idle', message: '' },
    calendario: { status: 'idle', message: '' },
  });

  useEffect(() => {
    setUrls({
      vendas: getStored('vendas'),
      clientes: getStored('clientes'),
      processos: getStored('processos'),
      calendario: getStored('calendario'),
    });
  }, []);

  function handleChange(key: SheetName, value: string) {
    setUrls((prev) => ({ ...prev, [key]: value }));
    setSaved((prev) => ({ ...prev, [key]: false }));
    setTests((prev) => ({ ...prev, [key]: { status: 'idle', message: '' } }));
  }

  function handleSave(key: SheetName) {
    setStoredUrl(key, urls[key]);
    setSaved((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSaved((prev) => ({ ...prev, [key]: false })), 3000);
  }

  async function handleTest(key: SheetName) {
    const url = urls[key].trim();
    if (!url) {
      setTests((prev) => ({ ...prev, [key]: { status: 'error', message: 'Cole a URL antes de testar.' } }));
      return;
    }
    setTests((prev) => ({ ...prev, [key]: { status: 'loading', message: 'Testando conexão…' } }));
    try {
      const proxyUrl = `/api/sheets-proxy?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxyUrl);
      if (!res.ok) {
        const body = await res.text();
        let msg = `Erro ${res.status}`;
        try { msg = JSON.parse(body).error ?? msg; } catch { /* ignore */ }
        setTests((prev) => ({ ...prev, [key]: { status: 'error', message: msg } }));
        return;
      }
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      const rows = Math.max(0, lines.length - 1);
      setTests((prev) => ({
        ...prev,
        [key]: { status: 'ok', message: `Conexão OK! ${rows} linha(s) encontrada(s).`, rows },
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      setTests((prev) => ({ ...prev, [key]: { status: 'error', message: msg } }));
    }
  }

  function handleSaveAndTest(key: SheetName) {
    handleSave(key);
    handleTest(key);
  }

  return (
    <Layout title="Configurações de Planilhas">
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#592343] flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2D1B29]">Configurações de Planilhas</h2>
            <p className="text-sm text-gray-500">Cole o link CSV de cada planilha do Google Sheets</p>
          </div>
        </div>

        {/* Instrução */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 space-y-1">
            <p className="font-semibold">Como obter o link CSV da planilha:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Abra a planilha no Google Sheets</li>
              <li>Clique em <strong>Arquivo → Publicar na Web</strong></li>
              <li>Selecione a aba desejada e escolha o formato <strong>CSV</strong></li>
              <li>Clique em <strong>Publicar</strong> e copie o link gerado</li>
              <li>Cole o link no campo abaixo e clique em <strong>Salvar e Testar</strong></li>
            </ol>
          </div>
        </div>

        {/* Cards de planilhas */}
        {SHEETS_CONFIG.map((sheet) => {
          const test = tests[sheet.key];
          const isSaved = saved[sheet.key];
          const hasUrl = !!urls[sheet.key].trim();

          return (
            <div key={sheet.key} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
                <span className="text-2xl">{sheet.icon}</span>
                <div>
                  <h3 className="font-bold text-[#2D1B29] text-sm">{sheet.label}</h3>
                  <p className="text-xs text-gray-500">{sheet.description}</p>
                </div>
                {hasUrl && test.status === 'idle' && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    <Link2 className="w-3 h-3" /> Configurada
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Link CSV da planilha</span>
                  <div className="mt-1 flex gap-2">
                    <input
                      type="url"
                      value={urls[sheet.key]}
                      onChange={(e) => handleChange(sheet.key, e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/e/…/pub?output=csv"
                      className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343] transition-all font-mono text-xs"
                    />
                    {urls[sheet.key].trim() && (
                      <a
                        href={urls[sheet.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Abrir link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </label>

                {/* Feedback de teste */}
                {test.status !== 'idle' && (
                  <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                    test.status === 'loading' ? 'bg-gray-50 text-gray-600'
                    : test.status === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {test.status === 'loading' && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {test.status === 'ok' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {test.status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                    {test.message}
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveAndTest(sheet.key)}
                    disabled={!urls[sheet.key].trim() || test.status === 'loading'}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#592343] text-white rounded-lg text-xs font-semibold hover:bg-[#7a2f52] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {test.status === 'loading'
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testando…</>
                      : isSaved
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> Salvo!</>
                      : <><CheckCircle2 className="w-3.5 h-3.5" /> Salvar e Testar</>}
                  </button>
                  {hasUrl && (
                    <button
                      onClick={() => { handleChange(sheet.key, ''); setStoredUrl(sheet.key, ''); }}
                      className="px-4 py-2 border border-gray-200 text-gray-500 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Nota sobre atualização */}
        <div className="text-xs text-gray-400 text-center pb-4">
          As URLs ficam salvas no seu navegador. Após salvar, as páginas carregarão os dados automaticamente a cada 60 segundos.
        </div>
      </div>
    </Layout>
  );
}
