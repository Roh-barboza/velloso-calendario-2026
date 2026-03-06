import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw, Search, X, FileText, ChevronDown, ChevronUp, User, Phone, Mail, Briefcase, Clock, CheckCircle, Circle } from 'lucide-react';
import { useLocation } from 'wouter';

interface ProcessStep {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  date?: string;
  notes?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: string;
  nationality?: string;
  process_stage?: string;
  process_steps?: ProcessStep[];
  notes?: string;
  created_at?: string;
}

const MOCK_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '(11) 98765-4321',
    company: 'Tech Solutions',
    job_title: 'Gerente de Projetos',
    status: 'Ativo',
    nationality: 'Italiana',
    process_stage: 'Documentação',
    notes: 'Cliente aguardando documentos do cartório.',
    created_at: '2026-01-15',
    process_steps: [
      { id: 1, title: 'Consulta inicial', status: 'completed', date: '2026-01-15', notes: 'Reunião realizada com sucesso.' },
      { id: 2, title: 'Levantamento de documentos', status: 'completed', date: '2026-01-20', notes: 'Documentos listados e enviados ao cliente.' },
      { id: 3, title: 'Envio de documentos ao consulado', status: 'in_progress', date: '2026-02-10', notes: 'Aguardando apostilamento.' },
      { id: 4, title: 'Análise pelo consulado', status: 'pending' },
      { id: 5, title: 'Emissão da cidadania', status: 'pending' },
    ]
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@example.com',
    phone: '(11) 99876-5432',
    company: 'Inovação Digital',
    job_title: 'Diretora Executiva',
    status: 'Ativo',
    nationality: 'Italiana',
    process_stage: 'Análise',
    notes: 'Processo em análise no consulado de São Paulo.',
    created_at: '2025-11-05',
    process_steps: [
      { id: 1, title: 'Consulta inicial', status: 'completed', date: '2025-11-05', notes: 'Reunião online.' },
      { id: 2, title: 'Levantamento de documentos', status: 'completed', date: '2025-11-20', notes: 'Todos os documentos coletados.' },
      { id: 3, title: 'Envio de documentos ao consulado', status: 'completed', date: '2025-12-10', notes: 'Protocolo nº 12345.' },
      { id: 4, title: 'Análise pelo consulado', status: 'in_progress', date: '2026-01-08', notes: 'Previsão de 90 dias.' },
      { id: 5, title: 'Emissão da cidadania', status: 'pending' },
    ]
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    email: 'carlos@example.com',
    phone: '(21) 97654-3210',
    company: 'Consultoria Empresarial',
    job_title: 'Consultor Sênior',
    status: 'Ativo',
    nationality: 'Portuguesa',
    process_stage: 'Documentação',
    notes: 'Aguardando certidão de nascimento do avô.',
    created_at: '2026-02-01',
    process_steps: [
      { id: 1, title: 'Consulta inicial', status: 'completed', date: '2026-02-01', notes: 'Reunião presencial.' },
      { id: 2, title: 'Levantamento de documentos', status: 'in_progress', date: '2026-02-15', notes: 'Falta certidão de nascimento do avô paterno.' },
      { id: 3, title: 'Envio de documentos ao consulado', status: 'pending' },
      { id: 4, title: 'Análise pelo consulado', status: 'pending' },
      { id: 5, title: 'Emissão da cidadania', status: 'pending' },
    ]
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@example.com',
    phone: '(31) 96543-2109',
    company: 'Desenvolvimento Web',
    job_title: 'Líder de Desenvolvimento',
    status: 'Concluído',
    nationality: 'Italiana',
    process_stage: 'Cidadania Emitida',
    notes: 'Processo concluído com sucesso em fevereiro de 2026.',
    created_at: '2025-06-10',
    process_steps: [
      { id: 1, title: 'Consulta inicial', status: 'completed', date: '2025-06-10', notes: 'Reunião online.' },
      { id: 2, title: 'Levantamento de documentos', status: 'completed', date: '2025-07-05', notes: 'Todos os documentos coletados.' },
      { id: 3, title: 'Envio de documentos ao consulado', status: 'completed', date: '2025-08-20', notes: 'Protocolo nº 98765.' },
      { id: 4, title: 'Análise pelo consulado', status: 'completed', date: '2025-11-15', notes: 'Aprovado sem pendências.' },
      { id: 5, title: 'Emissão da cidadania', status: 'completed', date: '2026-02-03', notes: 'Passaporte italiano emitido.' },
    ]
  },
  {
    id: '5',
    name: 'Roberto Ferreira',
    email: 'roberto@example.com',
    phone: '(41) 95432-1098',
    company: 'Agro Negócios',
    job_title: 'Proprietário',
    status: 'Ativo',
    nationality: 'Italiana',
    process_stage: 'Consulta',
    notes: 'Novo cliente, aguardando envio de documentos iniciais.',
    created_at: '2026-03-01',
    process_steps: [
      { id: 1, title: 'Consulta inicial', status: 'in_progress', date: '2026-03-01', notes: 'Reunião agendada para 10/03.' },
      { id: 2, title: 'Levantamento de documentos', status: 'pending' },
      { id: 3, title: 'Envio de documentos ao consulado', status: 'pending' },
      { id: 4, title: 'Análise pelo consulado', status: 'pending' },
      { id: 5, title: 'Emissão da cidadania', status: 'pending' },
    ]
  },
];

const STATUS_COLORS: Record<string, string> = {
  'Ativo': 'bg-green-100 text-green-800',
  'Concluído': 'bg-blue-100 text-blue-800',
  'Pendente': 'bg-yellow-100 text-yellow-800',
  'Inativo': 'bg-gray-100 text-gray-800',
};

const STAGE_COLORS: Record<string, string> = {
  'Consulta': 'bg-purple-100 text-purple-800',
  'Documentação': 'bg-yellow-100 text-yellow-800',
  'Análise': 'bg-blue-100 text-blue-800',
  'Cidadania Emitida': 'bg-green-100 text-green-800',
};

function ProcessModal({ contact, onClose }: { contact: Contact; onClose: () => void }) {
  const completedSteps = contact.process_steps?.filter(s => s.status === 'completed').length || 0;
  const totalSteps = contact.process_steps?.length || 0;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#592343] to-[#7a2f52] p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{contact.name}</h2>
                <p className="text-white/70 text-sm">{contact.job_title} — {contact.company}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                  {contact.nationality}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-5">
            <div className="flex justify-between text-white/80 text-xs mb-1">
              <span>Progresso do Processo</span>
              <span>{progress}% concluído</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-white/70 text-xs mt-1">{completedSteps} de {totalSteps} etapas concluídas</p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#592343]" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-sm font-medium text-slate-900 truncate">{contact.email}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#592343]" />
              <div>
                <p className="text-xs text-slate-500">Telefone</p>
                <p className="text-sm font-medium text-slate-900">{contact.phone || '—'}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-[#592343]" />
              <div>
                <p className="text-xs text-slate-500">Etapa Atual</p>
                <p className="text-sm font-medium text-slate-900">{contact.process_stage || '—'}</p>
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#592343]" />
              <div>
                <p className="text-xs text-slate-500">Cliente desde</p>
                <p className="text-sm font-medium text-slate-900">
                  {contact.created_at ? new Date(contact.created_at).toLocaleDateString('pt-BR') : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {contact.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-700 mb-1">📌 Observações</p>
              <p className="text-sm text-amber-900">{contact.notes}</p>
            </div>
          )}

          {/* Process Steps */}
          {contact.process_steps && contact.process_steps.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#592343]" />
                Etapas do Processo
              </h3>
              <div className="space-y-3">
                {contact.process_steps.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    {/* Step Icon */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.status === 'completed' ? 'bg-green-100' :
                        step.status === 'in_progress' ? 'bg-[#592343]' :
                        'bg-slate-100'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : step.status === 'in_progress' ? (
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      {index < (contact.process_steps?.length || 0) - 1 && (
                        <div className={`w-0.5 h-full min-h-4 mt-1 ${
                          step.status === 'completed' ? 'bg-green-200' : 'bg-slate-200'
                        }`} />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className={`pb-4 flex-1 ${index === (contact.process_steps?.length || 0) - 1 ? 'pb-0' : ''}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium ${
                          step.status === 'completed' ? 'text-green-700' :
                          step.status === 'in_progress' ? 'text-[#592343]' :
                          'text-slate-500'
                        }`}>
                          {step.title}
                        </p>
                        {step.date && (
                          <span className="text-xs text-slate-400">
                            {new Date(step.date).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      {step.notes && (
                        <p className="text-xs text-slate-500 mt-0.5">{step.notes}</p>
                      )}
                      {step.status === 'in_progress' && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-[#592343]/10 text-[#592343] text-xs rounded-full font-medium">
                          Em andamento
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm font-medium"
          >
            Fechar
          </button>
          <button
            className="px-4 py-2 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors text-sm font-medium"
          >
            Editar Processo
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CRM() {
  const [, navigate] = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Filtros
  const [searchName, setSearchName] = useState('');
  const [searchCompany, setSearchCompany] = useState('');
  const [searchJob, setSearchJob] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchContacts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    await new Promise(resolve => setTimeout(resolve, 1200));
    setContacts(MOCK_CONTACTS);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filtrar contatos
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchName = c.name.toLowerCase().includes(searchName.toLowerCase());
      const matchCompany = c.company?.toLowerCase().includes(searchCompany.toLowerCase()) ?? true;
      const matchJob = c.job_title?.toLowerCase().includes(searchJob.toLowerCase()) ?? true;
      const matchStatus = filterStatus ? c.status === filterStatus : true;
      return matchName && matchCompany && matchJob && matchStatus;
    });
  }, [contacts, searchName, searchCompany, searchJob, filterStatus]);

  const clearFilters = () => {
    setSearchName('');
    setSearchCompany('');
    setSearchJob('');
    setFilterStatus('');
  };

  const hasActiveFilters = searchName || searchCompany || searchJob || filterStatus;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Modal */}
      {selectedContact && (
        <ProcessModal contact={selectedContact} onClose={() => setSelectedContact(null)} />
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CRM — Gestão de Clientes</h1>
              <p className="text-sm text-slate-500">Velloso Cidadania · RD Station Integration</p>
            </div>
          </div>
          <button
            onClick={() => fetchContacts(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-[#592343]" />
              <span className="font-semibold text-slate-900">Filtros de Busca</span>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 bg-[#592343] text-white text-xs rounded-full">
                  Ativo
                </span>
              )}
            </div>
            {showFilters ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>

          {showFilters && (
            <div className="px-6 pb-5 border-t border-slate-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                      placeholder="Buscar por nome..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Empresa</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchCompany}
                      onChange={e => setSearchCompany(e.target.value)}
                      placeholder="Buscar por empresa..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cargo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchJob}
                      onChange={e => setSearchJob(e.target.value)}
                      placeholder="Buscar por cargo..."
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#592343]/30 focus:border-[#592343] bg-white"
                  >
                    <option value="">Todos os status</option>
                    <option value="Ativo">Ativo</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 flex items-center gap-1 text-sm text-[#592343] hover:underline"
                >
                  <X className="w-4 h-4" />
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[#592343] to-[#7a2f52] rounded-full opacity-20 animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-[#592343] animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Carregando clientes do RD Station...</p>
            <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns momentos</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erro ao carregar clientes</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => fetchContacts()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#592343] to-[#7a2f52] text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cliente</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Telefone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cargo / Empresa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Etapa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">Processo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                        <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium">Nenhum cliente encontrado</p>
                        <p className="text-sm mt-1">Tente ajustar os filtros de busca</p>
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact, index) => (
                      <tr
                        key={contact.id}
                        className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#592343] to-[#7a2f52] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                              {contact.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{contact.name}</p>
                              <p className="text-xs text-slate-500">{contact.nationality}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <a href={`mailto:${contact.email}`} className="text-[#592343] hover:underline text-sm">
                            {contact.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{contact.phone || '—'}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-900">{contact.job_title || '—'}</p>
                          <p className="text-xs text-slate-500">{contact.company || '—'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STAGE_COLORS[contact.process_stage || ''] || 'bg-slate-100 text-slate-700'}`}>
                            {contact.process_stage || '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[contact.status || ''] || 'bg-gray-100 text-gray-700'}`}>
                            {contact.status || 'Ativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#592343] text-white text-xs font-medium rounded-lg hover:bg-[#4a1d35] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Ver Processo
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Exibindo <span className="font-semibold text-slate-900">{filteredContacts.length}</span> de{' '}
                <span className="font-semibold text-slate-900">{contacts.length}</span> clientes
              </p>
              <p className="text-xs text-slate-500">
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
