import { useState, useMemo } from 'react';
import {
  Search, RefreshCw, AlertCircle, CheckCircle, Circle,
  Clock, ChevronDown, ChevronUp, Filter, X, FileText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useGoogleSheets, normalizeClientes, ClienteRow } from '@/hooks/useGoogleSheets';
import { cn } from '@/lib/utils';

const SHEET_ID = '1Gkhy7jcxTb96NgrM7m2b1giu6zE7LE7GhEYxngyuALY';
const SHEET_GID = '2009268709';

type StepStatus = 'completed' | 'in_progress' | 'pending';

interface ProcessStep {
  label: string;
  status: StepStatus;
}

const PROCESS_STAGES = [
  'Consulta inicial',
  'Pesquisa genealógica',
  'Levantamento de documentos',
  'Apostilamento',
  'Tradução',
  'Protocolo no consulado',
  'Análise consular',
  'Emissão da cidadania',
];

function buildSteps(etapa?: string): ProcessStep[] {
  const currentIdx = PROCESS_STAGES.findIndex((s) =>
    s.toLowerCase().includes((etapa || '').toLowerCase().slice(0, 6))
  );
  return PROCESS_STAGES.map((label, i) => ({
    label,
    status: i < currentIdx ? 'completed' : i === currentIdx ? 'in_progress' : 'pending',
  }));
}

const MOCK_PROCESSOS: ClienteRow[] = [
  { nome: 'João Silva', status: 'Em andamento', etapa: 'Apostilamento', valorPago: 'R$ 3.500', dataInicio: '15/01/2026', observacoes: 'Certidões enviadas para apostilamento' },
  { nome: 'Maria Santos', status: 'Análise', etapa: 'Protocolo no consulado', valorPago: 'R$ 4.200', dataInicio: '05/11/2025', observacoes: 'Protocolo nº 45821' },
  { nome: 'Carlos Oliveira', status: 'Em andamento', etapa: 'Tradução', valorPago: 'R$ 2.800', dataInicio: '01/02/2026' },
  { nome: 'Ana Lima', status: 'Concluído', etapa: 'Emissão da cidadania', valorPago: 'R$ 5.100', dataInicio: '10/08/2025', observacoes: 'Cidadania emitida em 15/03/2026' },
  { nome: 'Pedro Costa', status: 'Em andamento', etapa: 'Pesquisa genealógica', valorPago: 'R$ 1.500', dataInicio: '20/03/2026' },
];

function stepIcon(status: StepStatus) {
  if (status === 'completed') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === 'in_progress') return <Clock className="w-4 h-4 text-[#C9A84C]" />;
  return <Circle className="w-4 h-4 text-gray-300" />;
}

function ProcessCard({ client }: { client: ClienteRow }) {
  const [expanded, setExpanded] = useState(false);
  const steps = buildSteps(client.etapa);
  const completedCount = steps.filter((s) => s.status === 'completed').length;
  const progress = Math.round((completedCount / steps.length) * 100);
  const isCompleted = client.status?.toLowerCase().includes('conclu') || client.status?.toLowerCase().includes('final');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#592343]/10 flex items-center justify-center shrink-0 text-[#592343] font-bold text-sm">
            {client.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-gray-900">{client.nome}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold',
                isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                {client.status}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
              <span className="font-medium text-[#592343]">{client.etapa}</span>
              <span>{completedCount}/{steps.length} etapas</span>
              {client.valorPago && <span className="font-semibold text-gray-700">{client.valorPago}</span>}
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-gradient-to-r from-[#592343] to-[#C9A84C] transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">{progress}% concluído</p>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-gray-100">
              {client.observacoes && (
                <p className="text-xs text-gray-600 mt-3 mb-3 bg-gray-50 p-2.5 rounded-lg">{client.observacoes}</p>
              )}
              <div className="mt-3 space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {stepIcon(step.status)}
                    <span className={cn('text-xs', step.status === 'completed' ? 'text-gray-600 line-through opacity-70' :
                      step.status === 'in_progress' ? 'text-gray-900 font-semibold' : 'text-gray-400')}>
                      {step.label}
                    </span>
                    {step.status === 'in_progress' && (
                      <span className="text-[10px] bg-[#C9A84C]/20 text-[#8B6B00] px-1.5 rounded font-semibold ml-auto">Atual</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Processos() {
  const [search, setSearch] = useState('');
  const [etapaFilter, setEtapaFilter] = useState('');
  const { rows, loading, error, refresh } = useGoogleSheets(SHEET_ID, SHEET_GID, 60000);
  const rawClients = rows.length > 0 ? normalizeClientes(rows) : MOCK_PROCESSOS;

  const filtered = useMemo(() => rawClients.filter((c) => {
    const ms = !search || c.nome.toLowerCase().includes(search.toLowerCase()) || c.etapa?.toLowerCase().includes(search.toLowerCase());
    const me = !etapaFilter || c.etapa?.toLowerCase().includes(etapaFilter.toLowerCase());
    return ms && me;
  }), [rawClients, search, etapaFilter]);

  const stats = useMemo(() => ({
    total: rawClients.length,
    emAndamento: rawClients.filter((c) => !['conclu','final'].some((s) => c.status?.toLowerCase().includes(s))).length,
    concluidos: rawClients.filter((c) => ['conclu','final'].some((s) => c.status?.toLowerCase().includes(s))).length,
  }), [rawClients]);

  return (
    <Layout title="Processos">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2D1B29]">Processos</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {rows.length > 0 ? `${rows.length} processos da planilha` : 'Dados de exemplo'}
            </p>
          </div>
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#592343] text-white rounded-lg text-xs font-semibold hover:bg-[#7a2f52] transition-colors">
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Atualizar
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'border-l-[#592343]' },
            { label: 'Em andamento', value: stats.emAndamento, color: 'border-l-amber-500' },
            { label: 'Concluídos', value: stats.concluidos, color: 'border-l-emerald-500' },
          ].map((k) => (
            <div key={k.label} className={cn('bg-white rounded-xl border border-gray-100 border-l-4 p-3 shadow-sm', k.color)}>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-xl font-bold text-gray-900">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar cliente ou etapa..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
          </div>
          <select value={etapaFilter} onChange={(e) => setEtapaFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none bg-white focus:ring-2 focus:ring-[#592343]/30">
            <option value="">Todas as etapas</option>
            {PROCESS_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {(search || etapaFilter) && (
            <button onClick={() => { setSearch(''); setEtapaFilter(''); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors">
              <X className="w-3.5 h-3.5" />Limpar
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />Planilha offline — exibindo dados de exemplo
          </div>
        )}

        {loading && !rows.length ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />Carregando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum processo encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c, i) => <ProcessCard key={`${c.nome}-${i}`} client={c} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
