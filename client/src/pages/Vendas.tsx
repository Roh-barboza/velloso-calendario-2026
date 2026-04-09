import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useGoogleSheetsCsv, normalizeVendas, SHEET_URLS } from '@/hooks/useGoogleSheets';
import { cn } from '@/lib/utils';

const CHART_COLORS = ['#592343', '#C9A84C', '#00924a', '#ce2b37', '#4a90d9', '#8b6b7d'];

// ─── Mock fallback data ───────────────────────────────────────────────────────────────────────────────────

const MOCK_MONTHLY = [
  { mes: 'Jan', vendas: 32000, leads: 48, conversoes: 12 },
  { mes: 'Fev', vendas: 28500, leads: 42, conversoes: 10 },
  { mes: 'Mar', vendas: 45200, leads: 67, conversoes: 18 },
  { mes: 'Abr', vendas: 38700, leads: 55, conversoes: 15 },
  { mes: 'Mai', vendas: 52100, leads: 71, conversoes: 22 },
  { mes: 'Jun', vendas: 47800, leads: 63, conversoes: 19 },
];

const MOCK_DAILY = Array.from({ length: 30 }, (_, i) => ({
  dia: i + 1,
  valor: 800 + ((i * 137 + 500) % 2200),
}));

const MOCK_CATEGORIES = [
  { name: 'Cidadania Italiana', value: 58 },
  { name: 'Cidadania Portuguesa', value: 24 },
  { name: 'Consultoria', value: 12 },
  { name: 'Outros', value: 6 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────────────────────────────────

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  color: string;
  delay?: number;
}

function KPICard({ title, value, change, icon: Icon, color, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 mt-1 text-xs font-semibold', change >= 0 ? 'text-emerald-600' : 'text-red-500')}>
              {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(change)}% vs. mês anterior
            </div>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Custom Tooltip ─────────────────────────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-gray-600">
          {p.name}: <span className="font-semibold">{typeof p.value === 'number' && (p.name.toLowerCase().includes('valor') || p.name.toLowerCase().includes('venda'))
            ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────────────────────

export default function Vendas() {
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');
  const { rows, loading, error, refresh, lastUpdated } = useGoogleSheetsCsv(SHEET_URLS.vendas, 60000);
  const vendas = useMemo(() => normalizeVendas(rows), [rows]);

  const hasRealData = vendas.length > 0;

  const totalVendas = useMemo(() => {
    if (!hasRealData) return 'R$ 244.300';
    const sum = vendas.reduce((acc, v) => {
      const val = parseFloat((v.valor || '0').replace(/[^0-9.,]/g, '').replace(',', '.'));
      return acc + (isNaN(val) ? 0 : val);
    }, 0);
    return `R$ ${sum.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
  }, [vendas, hasRealData]);

  const totalLeads = hasRealData ? vendas.length : 346;
  const totalConversoes = hasRealData
    ? vendas.filter((v) => ['fechado', 'pago', 'concluído'].some((s) => v.status?.toLowerCase().includes(s))).length
    : 96;
  const taxaConversao = totalLeads > 0 ? ((totalConversoes / totalLeads) * 100).toFixed(1) : '0';

  const monthlyData = useMemo(() => {
    if (!hasRealData) return MOCK_MONTHLY;
    const grouped: Record<string, { vendas: number; leads: number; conversoes: number }> = {};
    vendas.forEach((v) => {
      const raw = v.data || '';
      const match = raw.match(/(\d{1,2})[\/\-](\d{1,2})/);
      const month = match ? parseInt(match[2], 10) : 0;
      if (!month) return;
      const label = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'][month - 1] || '';
      if (!grouped[label]) grouped[label] = { vendas: 0, leads: 0, conversoes: 0 };
      const val = parseFloat((v.valor || '0').replace(/[^0-9.,]/g, '').replace(',', '.'));
      grouped[label].vendas += isNaN(val) ? 0 : val;
      grouped[label].leads++;
      if (['fechado','pago','concluído'].some((s) => v.status?.toLowerCase().includes(s))) grouped[label].conversoes++;
    });
    return Object.entries(grouped).map(([mes, data]) => ({ mes, ...data }));
  }, [vendas, hasRealData]);

  const recentVendas = hasRealData ? vendas.slice(0, 8) : [
    { data: '08/04/2026', cliente: 'João Silva', valor: 'R$ 3.500', status: 'Pago', tipo: 'Cidadania Italiana' },
    { data: '07/04/2026', cliente: 'Maria Santos', valor: 'R$ 4.200', status: 'Aguardando', tipo: 'Consultoria' },
    { data: '06/04/2026', cliente: 'Carlos Oliveira', valor: 'R$ 2.800', status: 'Pago', tipo: 'Cidadania Portuguesa' },
    { data: '05/04/2026', cliente: 'Ana Lima', valor: 'R$ 5.100', status: 'Pago', tipo: 'Cidadania Italiana' },
    { data: '04/04/2026', cliente: 'Pedro Costa', valor: 'R$ 3.200', status: 'Em análise', tipo: 'Cidadania Italiana' },
  ];

  const statusColors: Record<string, string> = {
    pago: 'bg-emerald-100 text-emerald-700',
    aguardando: 'bg-amber-100 text-amber-700',
    'em análise': 'bg-blue-100 text-blue-700',
    cancelado: 'bg-red-100 text-red-700',
  };

  function getStatusColor(status?: string) {
    const s = status?.toLowerCase() || '';
    for (const [key, cls] of Object.entries(statusColors)) {
      if (s.includes(key)) return cls;
    }
    return 'bg-gray-100 text-gray-600';
  }

  return (
    <Layout title="Dashboard de Vendas">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#2D1B29]">Dashboard de Vendas</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasRealData ? `${vendas.length} registros` : 'Dados de exemplo'} • 
              {lastUpdated
                ? `Atualizado às ${lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                : loading ? 'Carregando planilha…' : 'Conectando…'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {error && (
              <span className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                <AlertCircle className="w-3 h-3" />Planilha offline — dados de exemplo
              </span>
            )}
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#592343] text-white rounded-lg text-xs font-semibold hover:bg-[#7a2f52] transition-colors"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Atualizar
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard title="Receita Total" value={totalVendas} change={23} icon={DollarSign} color="bg-[#592343]" delay={0} />
          <KPICard title="Total de Leads" value={String(totalLeads)} change={8} icon={Users} color="bg-[#C9A84C]" delay={0.07} />
          <KPICard title="Conversões" value={String(totalConversoes)} change={15} icon={Target} color="bg-emerald-600" delay={0.14} />
          <KPICard title="Taxa de Conversão" value={`${taxaConversao}%`} change={5} icon={BarChart3} color="bg-blue-600" delay={0.21} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#2D1B29] text-sm">Evolução de Vendas</h3>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                {(['monthly', 'daily'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md font-semibold transition-all',
                      period === p ? 'bg-white text-[#592343] shadow-sm' : 'text-gray-500'
                    )}
                  >
                    {p === 'monthly' ? 'Mensal' : 'Diário'}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {period === 'monthly' ? (
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="vendas" name="Vendas (R$)" stroke="#592343" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              ) : (
                <BarChart data={MOCK_DAILY}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="valor" name="Valor (R$)" fill="#592343" radius={[3, 3, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-[#2D1B29] text-sm mb-4">Por Categoria</h3>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={MOCK_CATEGORIES}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {MOCK_CATEGORIES.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Participação']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-2">
              {MOCK_CATEGORIES.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i] }} />
                  <span className="text-gray-600 flex-1 truncate">{c.name}</span>
                  <span className="font-semibold text-gray-800">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-[#2D1B29] text-sm mb-4">Leads × Conversões por Mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="leads" name="Leads" fill="#C9A84C" radius={[3, 3, 0, 0]} />
              <Bar dataKey="conversoes" name="Conversões" fill="#592343" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent sales table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-[#2D1B29] text-sm">Vendas Recentes</h3>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />{new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Data', 'Cliente', 'Tipo', 'Valor', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentVendas.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-600 text-xs">{v.data}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{v.cliente}</td>
                    <td className="px-4 py-3 text-gray-600">{v.tipo}</td>
                    <td className="px-4 py-3 font-semibold text-[#592343]">{v.valor}</td>
                    <td className="px-4 py-3">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(v.status))}>
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
