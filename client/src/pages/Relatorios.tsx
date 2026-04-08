import { useState, useMemo } from 'react';
import {
  Download, Calendar, CheckCircle, Users, FileText, RefreshCw,
  BarChart3, Clock, TrendingUp,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useGoogleSheets, normalizeClientes } from '@/hooks/useGoogleSheets';
import { cn } from '@/lib/utils';

const SHEET_ID = '1Gkhy7jcxTb96NgrM7m2b1giu6zE7LE7GhEYxngyuALY';
const SHEET_GID = '2009268709';

// ─── Task storage (same key as Calendario) ────────────────────────────────────

interface Task {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: string;
  notes?: string;
  completed: boolean;
  fromSheet?: boolean;
}

function loadTasks(): Task[] {
  try { return JSON.parse(localStorage.getItem('velloso_tasks_v2') || '[]'); }
  catch { return []; }
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CATEGORY_LABELS: Record<string, string> = {
  eventos: 'Evento', clientes: 'Cliente', operacional: 'Operacional', pessoal: 'Pessoal',
};

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(rows: string[][], filename: string) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const csv = BOM + rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Relatorios() {
  const [reportDate, setReportDate] = useState(toDateKey(new Date()));
  const tasks = useMemo(loadTasks, []);
  const { rows, loading, error, refresh } = useGoogleSheets(SHEET_ID, SHEET_GID, 60000);
  const clientes = useMemo(() => normalizeClientes(rows), [rows]);

  // Tasks for selected date
  const dayTasks = useMemo(() => tasks.filter((t) => t.date === reportDate), [tasks, reportDate]);
  const doneTasks = dayTasks.filter((t) => t.completed);
  const pendingTasks = dayTasks.filter((t) => !t.completed);

  // Clients active on selected date
  const dateObj = new Date(reportDate + 'T12:00:00');
  const activeClients = clientes.filter((c) => {
    if (!c.dataInicio) return false;
    const match = c.dataInicio.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (!match) return false;
    const [, d, m, y] = match;
    const year = y.length === 2 ? `20${y}` : y;
    const start = new Date(`${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T12:00:00`);
    return start <= dateObj;
  });

  // Stats by category
  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    dayTasks.forEach((t) => { map[t.category] = (map[t.category] || 0) + 1; });
    return map;
  }, [dayTasks]);

  // Last 7 days summary
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(dateObj); d.setDate(dateObj.getDate() - i);
      const key = toDateKey(d);
      const dt = tasks.filter((t) => t.date === key);
      return { date: key, label: d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' }), total: dt.length, done: dt.filter((t) => t.completed).length };
    }).reverse();
  }, [tasks, reportDate]);

  function handleExport() {
    const dateFormatted = new Date(reportDate + 'T12:00:00').toLocaleDateString('pt-BR');
    const rows: string[][] = [
      [`RELATÓRIO DIÁRIO — VELLOSO CIDADANIA`],
      [`Data: ${dateFormatted}`],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
      [],
      ['RESUMO'],
      ['Total de tarefas', String(dayTasks.length)],
      ['Concluídas', String(doneTasks.length)],
      ['Pendentes', String(pendingTasks.length)],
      ['Clientes ativos', String(activeClients.length)],
      [],
      ['TAREFAS CONCLUÍDAS'],
      ['Título', 'Categoria', 'Horário', 'Observações'],
      ...doneTasks.map((t) => [t.title, CATEGORY_LABELS[t.category] || t.category, t.time || '—', t.notes || '—']),
      [],
      ['TAREFAS PENDENTES'],
      ['Título', 'Categoria', 'Horário', 'Observações'],
      ...pendingTasks.map((t) => [t.title, CATEGORY_LABELS[t.category] || t.category, t.time || '—', t.notes || '—']),
      [],
      ['CLIENTES ATIVOS'],
      ['Nome', 'Etapa', 'Status', 'Valor Pago', 'Data Início'],
      ...activeClients.map((c) => [c.nome, c.etapa || '—', c.status || '—', c.valorPago || '—', c.dataInicio || '—']),
    ];
    exportCSV(rows, `relatorio-velloso-${reportDate}.csv`);
  }

  return (
    <Layout title="Relatórios">
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#2D1B29]">Relatório Diário</h2>
            <p className="text-sm text-gray-500 mt-0.5">Gere e exporte relatórios das atividades do dia</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors">
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Atualizar
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#592343] text-white rounded-lg text-xs font-semibold hover:bg-[#7a2f52] transition-colors">
              <Download className="w-3.5 h-3.5" /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Date picker */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 shadow-sm">
          <Calendar className="w-5 h-5 text-[#592343] shrink-0" />
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Data do Relatório</p>
            <p className="text-sm text-gray-700 font-medium">
              {new Date(reportDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)}
            className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]" />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total de tarefas', value: dayTasks.length, icon: FileText, color: 'bg-[#592343]' },
            { label: 'Concluídas', value: doneTasks.length, icon: CheckCircle, color: 'bg-emerald-600' },
            { label: 'Pendentes', value: pendingTasks.length, icon: Clock, color: 'bg-amber-500' },
            { label: 'Clientes ativos', value: activeClients.length, icon: Users, color: 'bg-blue-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', color)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main report content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Completed tasks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <h3 className="font-semibold text-sm text-gray-800">Tarefas Concluídas ({doneTasks.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {doneTasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma tarefa concluída</p>
              ) : doneTasks.map((t) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-700 font-medium line-through opacity-70 truncate">{t.title}</span>
                    {t.time && <span className="text-xs text-gray-400 ml-auto shrink-0">{t.time}</span>}
                  </div>
                  <div className="ml-5 mt-0.5 flex items-center gap-2">
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                    {t.notes && <span className="text-[11px] text-gray-400 truncate">{t.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending tasks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-sm text-gray-800">Tarefas Pendentes ({pendingTasks.length})</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma tarefa pendente</p>
              ) : pendingTasks.map((t) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-sm text-gray-700 font-medium truncate">{t.title}</span>
                    {t.time && <span className="text-xs text-gray-400 ml-auto shrink-0">{t.time}</span>}
                  </div>
                  <div className="ml-5 mt-0.5 flex items-center gap-2">
                    <span className="text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      {CATEGORY_LABELS[t.category] || t.category}
                    </span>
                    {t.notes && <span className="text-[11px] text-gray-400 truncate">{t.notes}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active clients on this date */}
        {activeClients.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#592343]" />
              <h3 className="font-semibold text-sm text-gray-800">Clientes Ativos ({activeClients.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Cliente', 'Etapa', 'Status', 'Valor Pago'].map((h) => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {activeClients.slice(0, 10).map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{c.nome}</td>
                      <td className="px-4 py-2.5 text-gray-600">{c.etapa || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold',
                          c.status?.toLowerCase().includes('conclu') ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>
                          {c.status || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-[#592343]">{c.valorPago || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7-day summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#592343]" />
            <h3 className="font-semibold text-sm text-gray-800">Resumo dos últimos 7 dias</h3>
          </div>
          <div className="grid grid-cols-7 divide-x divide-gray-100">
            {last7Days.map((d) => {
              const pct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
              const isSelected = d.date === reportDate;
              return (
                <button key={d.date}
                  onClick={() => setReportDate(d.date)}
                  className={cn('p-3 text-center hover:bg-gray-50 transition-colors', isSelected && 'bg-[#592343]/5')}>
                  <p className="text-[10px] text-gray-400 uppercase">{d.label.split(',')[0]}</p>
                  <p className={cn('text-base font-bold', isSelected ? 'text-[#592343]' : 'text-gray-700')}>{d.done}</p>
                  <p className="text-[10px] text-gray-400">/{d.total}</p>
                  <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1">
                    <div className="h-1 rounded-full bg-[#592343] transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category breakdown */}
        {Object.keys(byCategory).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#592343]" />
              <h3 className="font-semibold text-sm text-gray-800">Por Categoria</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(byCategory).map(([cat, count]) => (
                <div key={cat} className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">{CATEGORY_LABELS[cat] || cat}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Export note */}
        <div className="bg-[#2D1B29] rounded-xl p-4 text-white text-sm flex items-start gap-3">
          <Download className="w-5 h-5 text-[#C9A84C] shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Exportar Relatório</p>
            <p className="text-white/70 text-xs mt-0.5">
              O arquivo CSV gerado é compatível com Google Sheets e Microsoft Excel.
              Inclui tarefas, clientes e resumo do dia selecionado.
            </p>
          </div>
          <button onClick={handleExport}
            className="ml-auto shrink-0 px-4 py-2 bg-[#C9A84C] text-[#2D1B29] rounded-lg text-xs font-bold hover:bg-[#e0bc5e] transition-colors">
            Exportar
          </button>
        </div>
      </div>
    </Layout>
  );
}
