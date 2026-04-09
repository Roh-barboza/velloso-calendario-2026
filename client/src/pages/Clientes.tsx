import { useState, useMemo } from 'react';
import {
  Search, RefreshCw, AlertCircle, User, Phone, Mail,
  Clock, CheckCircle, Circle, ChevronDown, ChevronUp,
  Filter, X, Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import { useGoogleSheetsCsv, normalizeClientes, ClienteRow, SHEET_URLS } from '@/hooks/useGoogleSheets';
import { cn } from '@/lib/utils';

// ─── Mock fallback ───────────────────────────────────────────────────────────────────────────────

const MOCK_CLIENTS: ClienteRow[] = [
  { nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 98765-4321', status: 'Em andamento', etapa: 'Documentação', valorPago: 'R$ 3.500', dataInicio: '15/01/2026', observacoes: 'Aguardando certidão do consulado' },
  { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99876-5432', status: 'Análise', etapa: 'Consulado', valorPago: 'R$ 4.200', dataInicio: '05/11/2025', observacoes: 'Processo em análise há 90 dias' },
  { nome: 'Carlos Oliveira', email: 'carlos@email.com', telefone: '(21) 97654-3210', status: 'Documentação', etapa: 'Apostilamento', valorPago: 'R$ 2.800', dataInicio: '01/02/2026' },
  { nome: 'Ana Lima', email: 'ana@email.com', telefone: '(11) 96543-2109', status: 'Concluído', etapa: 'Finalizado', valorPago: 'R$ 5.100', dataInicio: '10/08/2025' },
  { nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '(31) 95432-1098', status: 'Em andamento', etapa: 'Pesquisa', valorPago: 'R$ 1.500', dataInicio: '20/03/2026' },
  { nome: 'Fernanda Rocha', email: 'fernanda@email.com', telefone: '(41) 94321-0987', status: 'Novo', etapa: 'Consulta inicial', valorPago: 'R$ 800', dataInicio: '01/04/2026' },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────────────────────────────

function calcDaysActive(dataInicio?: string): number {
  if (!dataInicio) return 0;
  const match = dataInicio.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (!match) return 0;
  const [, d, m, y] = match;
  const year = y.length === 2 ? `20${y}` : y;
  const start = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
  const diff = Date.now() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatDuration(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  if (days < 365) return `${Math.floor(days / 30)} mês${Math.floor(days / 30) > 1 ? 'es' : ''}`;
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  return `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} mês${months > 1 ? 'es' : ''}` : ''}`;
}

function statusStyle(status?: string): { badge: string; icon: React.ReactNode } {
  const s = status?.toLowerCase() || '';
  if (s.includes('conclu') || s.includes('final') || s.includes('fechad'))
    return { badge: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle className="w-3 h-3" /> };
  if (s.includes('análise') || s.includes('analise') || s.includes('consulado'))
    return { badge: 'bg-blue-100 text-blue-700', icon: <Clock className="w-3 h-3" /> };
  if (s.includes('novo') || s.includes('inicial'))
    return { badge: 'bg-purple-100 text-purple-700', icon: <Circle className="w-3 h-3" /> };
  return { badge: 'bg-amber-100 text-amber-700', icon: <Clock className="w-3 h-3" /> };
}

// ─── Client Card ─────────────────────────────────────────────────────────────────────────────────────

function ClientCard({ client }: { client: ClienteRow }) {
  const [expanded, setExpanded] = useState(false);
  const days = calcDaysActive(client.dataInicio);
  const { badge, icon } = statusStyle(client.status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      <div className="p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#592343]/10 flex items-center justify-center shrink-0">
            <span className="text-[#592343] font-bold text-sm">
              {client.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{client.nome}</h3>
              <span className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', badge)}>
                {icon}{client.status || 'Sem status'}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
              {client.etapa && (
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">{client.etapa}</span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />{formatDuration(days)}
              </span>
              {client.valorPago && (
                <span className="font-semibold text-[#592343]">{client.valorPago}</span>
              )}
            </div>
          </div>
          <button className="p-1 text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 border-t border-gray-100 mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                {client.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />{client.email}
                  </div>
                )}
                {client.telefone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />{client.telefone}
                  </div>
                )}
                {client.dataInicio && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />Início: {client.dataInicio}
                  </div>
                )}
                {client.observacoes && (
                  <div className="flex items-start gap-2 text-gray-600 sm:col-span-2">
                    <User className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />{client.observacoes}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────────────────────

export default function Clientes() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { rows, loading, error, refresh, lastUpdated } = useGoogleSheetsCsv(SHEET_URLS.clientes, 60000);
  const rawClients = rows.length > 0 ? normalizeClientes(rows) : MOCK_CLIENTS;

  const allStatuses = useMemo(() => {
    const set = new Set(rawClients.map((c) => c.status || '').filter(Boolean));
    return Array.from(set);
  }, [rawClients]);

  const filtered = useMemo(() => {
    return rawClients.filter((c) => {
      const matchesSearch = !search || [c.nome, c.email, c.telefone, c.etapa]
        .some((v) => v?.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = !statusFilter || c.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [rawClients, search, statusFilter]);

  const total = rawClients.length;
  const ativos = rawClients.filter((c) =>
    !['concluído', 'fechado', 'finalizado'].some((s) => c.status?.toLowerCase().includes(s))
  ).length;
  const concluidos = total - ativos;
  const avgDays =
    rawClients.length > 0
      ? Math.floor(rawClients.reduce((acc, c) => acc + calcDaysActive(c.dataInicio), 0) / rawClients.length)
      : 0;

  return (
    <Layout title="Clientes">
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2D1B29]">Gestão de Clientes</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {rows.length > 0 ? `${rows.length} registros da planilha` : 'Exibindo dados de exemplo'} •{' '}
              {lastUpdated
                ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : loading ? 'Carregando…' : 'Offline'}
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#592343] text-white rounded-lg text-xs font-semibold hover:bg-[#7a2f52] transition-colors"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: total, color: 'border-l-[#592343]' },
            { label: 'Ativos', value: ativos, color: 'border-l-amber-500' },
            { label: 'Concluídos', value: concluidos, color: 'border-l-emerald-500' },
            { label: 'Média ativa', value: formatDuration(avgDays), color: 'border-l-blue-500' },
          ].map((k) => (
            <div
              key={k.label}
              className={cn('bg-white rounded-xl border border-gray-100 border-l-4 p-3 shadow-sm', k.color)}
            >
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">{k.value}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, email, etapa..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343] bg-white"
            >
              <option value="">Todos os status</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpar filtros
            </button>
          )}
          <span className="text-xs text-gray-400 ml-auto">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Planilha offline — exibindo dados de exemplo.</span>
          </div>
        )}

        {loading && !rows.length ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Carregando…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {filtered.map((c, i) => (
              <ClientCard key={`${c.nome}-${i}`} client={c} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
