import { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useLocation } from 'wouter';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  status?: string;
}

interface CRMResponse {
  success: boolean;
  data: Contact[];
  message: string;
}

export default function CRM() {
  const [, navigate] = useLocation();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContacts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    
    try {
      // Simulando chamada à API tRPC
      // Em produção, isso seria: const response = await trpc.crm.getContacts.useQuery();
      const mockResponse: CRMResponse = {
        success: true,
        data: [
          {
            id: '1',
            name: 'João Silva',
            email: 'joao@example.com',
            phone: '(11) 98765-4321',
            company: 'Tech Solutions',
            job_title: 'Gerente de Projetos',
            status: 'Ativo'
          },
          {
            id: '2',
            name: 'Maria Santos',
            email: 'maria@example.com',
            phone: '(11) 99876-5432',
            company: 'Inovação Digital',
            job_title: 'Diretora Executiva',
            status: 'Ativo'
          },
          {
            id: '3',
            name: 'Carlos Oliveira',
            email: 'carlos@example.com',
            phone: '(21) 97654-3210',
            company: 'Consultoria Empresarial',
            job_title: 'Consultor Sênior',
            status: 'Ativo'
          },
          {
            id: '4',
            name: 'Ana Costa',
            email: 'ana@example.com',
            phone: '(31) 96543-2109',
            company: 'Desenvolvimento Web',
            job_title: 'Líder de Desenvolvimento',
            status: 'Ativo'
          },
        ],
        message: 'Contatos carregados com sucesso'
      };

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (mockResponse.success) {
        setContacts(mockResponse.data);
        setError(null);
      } else {
        setError(mockResponse.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar contatos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/intranet')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CRM - Gestão de Contatos</h1>
              <p className="text-sm text-slate-500">RD Station CRM Integration</p>
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-[#592343] to-[#7a2f52] rounded-full opacity-20 animate-pulse"></div>
              <Loader2 className="w-16 h-16 text-[#592343] animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Carregando contatos do RD Station...</p>
            <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns momentos</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Erro ao carregar contatos</h3>
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
        {!loading && !error && contacts.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#592343] to-[#7a2f52] text-white">
                    <th className="px-6 py-4 text-left text-sm font-semibold">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Telefone</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Cargo/Empresa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {contacts.map((contact, index) => (
                    <tr
                      key={contact.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#592343] to-[#7a2f52] flex items-center justify-center text-white font-semibold text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-900">{contact.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-[#592343] hover:underline text-sm"
                        >
                          {contact.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {contact.phone || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-slate-900">{contact.job_title || '-'}</p>
                          <p className="text-slate-500">{contact.company || '-'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {contact.status || 'Ativo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Total de <span className="font-semibold text-slate-900">{contacts.length}</span> contatos
              </p>
              <p className="text-xs text-slate-500">
                Última atualização: {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && contacts.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Nenhum contato encontrado</h3>
            <p className="text-slate-600 mb-6">
              Não há contatos disponíveis no RD Station CRM no momento.
            </p>
            <button
              onClick={() => fetchContacts()}
              className="px-4 py-2 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
