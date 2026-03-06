import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Home,
  FolderOpen,
  Users,
  Calendar,
  LogOut,
  Menu,
  X,
  Bell,
  Upload,
  Link,
  Image,
  FileText,
  ChevronRight,
  Globe
} from 'lucide-react';

type Section = 'inicio' | 'arquivos' | 'crm' | 'calendario';

const highlights = [
  { id: 1, title: 'Dia da Mulher', date: '08/03/2026', type: 'Evento', color: 'from-pink-500 to-rose-600', icon: '👩' },
  { id: 2, title: 'Dia do Consumidor', date: '15/03/2026', type: 'Evento', color: 'from-blue-500 to-cyan-600', icon: '🛍️' },
  { id: 3, title: 'Vendas - Março', value: 'R$ 45.320', growth: '+23%', color: 'from-green-500 to-emerald-600', icon: '📈' },
  { id: 4, title: 'Novos Clientes', value: '12', growth: '+8%', color: 'from-purple-500 to-indigo-600', icon: '👥' },
  { id: 5, title: 'Processos Concluídos', value: '8', growth: '+15%', color: 'from-orange-500 to-amber-600', icon: '✅' },
];

export default function Intranet() {
  const [, navigate] = useLocation();
  const [activeSection, setActiveSection] = useState<Section>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHighlightIndex((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'inicio' as Section, label: 'Início', icon: Home },
    { id: 'arquivos' as Section, label: 'Arquivos', icon: FolderOpen },
    { id: 'crm' as Section, label: 'Processos / CRM', icon: Users },
    { id: 'calendario' as Section, label: 'Calendário', icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'inicio':
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-[#592343] to-[#7a2f52] rounded-2xl p-8 text-white">
              <div className="flex items-center gap-4 mb-3">
                <img
                  src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/globo_transparente_b89ad2b6.png"
                  alt="Globo"
                  className="h-14 w-auto"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
                <div>
                  <h2 className="text-2xl font-bold">Bem-vindo à Intranet</h2>
                  <p className="text-white/80">Velloso Cidadania — Painel Interno da Equipe</p>
                </div>
              </div>
              <p className="text-white/70 text-sm mt-2">
                Gerencie arquivos, acompanhe processos e mantenha sua equipe sincronizada.
              </p>
            </div>

            {/* Carousel de Destaques */}
            <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200">
              <div className="relative h-48 flex items-center justify-center">
                {highlights.map((highlight, index) => (
                  <div
                    key={highlight.id}
                    className={`absolute inset-0 bg-gradient-to-r ${highlight.color} transition-opacity duration-1000 flex items-center justify-center ${
                      index === currentHighlightIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="text-center text-white">
                      <div className="text-6xl mb-2">{highlight.icon}</div>
                      <h3 className="text-2xl font-bold mb-1">{highlight.title}</h3>
                      {highlight.type ? (
                        <p className="text-white/80">{highlight.date} • {highlight.type}</p>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-2xl font-bold">{highlight.value}</p>
                          <span className="bg-white/20 px-2 py-1 rounded text-sm font-semibold">{highlight.growth}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {/* Indicadores */}
              <div className="flex items-center justify-center gap-2 p-4 bg-slate-50">
                {highlights.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentHighlightIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentHighlightIndex
                        ? 'w-8 bg-[#592343]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#592343]/10 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-[#592343]" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">12</p>
                  <p className="text-sm text-slate-500">Arquivos</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">5</p>
                  <p className="text-sm text-slate-500">Processos Ativos</p>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">8</p>
                  <p className="text-sm text-slate-500">Eventos este mês</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Ações Rápidas</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveSection('arquivos')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-[#592343]/5 hover:border-[#592343]/20 border border-transparent transition-all"
                >
                  <Upload className="w-6 h-6 text-[#592343]" />
                  <span className="text-xs font-medium text-slate-700">Enviar Arquivo</span>
                </button>
                <button
                  onClick={() => setActiveSection('crm')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-[#592343]/5 hover:border-[#592343]/20 border border-transparent transition-all"
                >
                  <Users className="w-6 h-6 text-[#592343]" />
                  <span className="text-xs font-medium text-slate-700">Ver Processos</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-[#592343]/5 hover:border-[#592343]/20 border border-transparent transition-all"
                >
                  <Calendar className="w-6 h-6 text-[#592343]" />
                  <span className="text-xs font-medium text-slate-700">Calendário</span>
                </button>
                <button
                  onClick={() => navigate('/crm')}
                  className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-xl hover:bg-[#592343]/5 hover:border-[#592343]/20 border border-transparent transition-all"
                >
                  <Globe className="w-6 h-6 text-[#592343]" />
                  <span className="text-xs font-medium text-slate-700">CRM Completo</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Atividade Recente</h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, text: 'Documento de Ana Costa atualizado', time: 'Hoje, 10:30', color: 'text-blue-600 bg-blue-100' },
                  { icon: Users, text: 'Novo cliente: Roberto Ferreira adicionado', time: 'Hoje, 09:15', color: 'text-green-600 bg-green-100' },
                  { icon: Calendar, text: 'Evento "Dia da Mulher" em 2 dias', time: 'Ontem, 16:00', color: 'text-[#592343] bg-[#592343]/10' },
                  { icon: Upload, text: 'Certidão de João Silva enviada', time: 'Ontem, 14:20', color: 'text-purple-600 bg-purple-100' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 truncate">{item.text}</p>
                      <p className="text-xs text-slate-500">{item.time}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'arquivos':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Arquivos</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors text-sm font-medium">
                <Upload className="w-4 h-4" />
                Enviar Arquivo
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Image, label: 'Imagens', count: 5, color: 'bg-pink-100 text-pink-600' },
                { icon: FileText, label: 'Documentos', count: 4, color: 'bg-blue-100 text-blue-600' },
                { icon: Link, label: 'Links', count: 3, color: 'bg-green-100 text-green-600' },
              ].map((cat, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 cursor-pointer hover:border-[#592343]/30 transition-colors">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cat.color}`}>
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{cat.count} itens</p>
                    <p className="text-sm text-slate-500">{cat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Arquivos Recentes</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {[
                  { name: 'Certidão de Nascimento - João Silva.pdf', type: 'PDF', size: '2.3 MB', date: '06/03/2026' },
                  { name: 'Foto Passaporte - Maria Santos.jpg', type: 'Imagem', size: '1.1 MB', date: '05/03/2026' },
                  { name: 'Contrato de Serviços - Carlos Oliveira.docx', type: 'Documento', size: '450 KB', date: '04/03/2026' },
                  { name: 'Apostila - Ana Costa.pdf', type: 'PDF', size: '3.7 MB', date: '03/03/2026' },
                ].map((file, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 bg-[#592343]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-[#592343]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{file.type} · {file.size}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{file.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'crm':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Processos / CRM</h2>
              <button
                onClick={() => navigate('/crm')}
                className="flex items-center gap-2 px-4 py-2 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors text-sm font-medium"
              >
                <Users className="w-4 h-4" />
                Abrir CRM Completo
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Users className="w-12 h-12 text-[#592343] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Gestão de Processos</h3>
              <p className="text-slate-500 mb-6">Acesse o CRM completo para visualizar e gerenciar todos os processos de cidadania dos seus clientes.</p>
              <button
                onClick={() => navigate('/crm')}
                className="px-6 py-3 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors font-semibold"
              >
                Acessar CRM
              </button>
            </div>
          </div>
        );

      case 'calendario':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Calendário</h2>
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors text-sm font-medium"
              >
                <Calendar className="w-4 h-4" />
                Abrir Calendário Completo
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <Calendar className="w-12 h-12 text-[#592343] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Calendário de Eventos 2026</h3>
              <p className="text-slate-500 mb-6">Acesse o calendário completo com todos os aniversários, feriados e eventos especiais do ano.</p>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-[#592343] text-white rounded-lg hover:bg-[#4a1d35] transition-colors font-semibold"
              >
                Ver Calendário
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-[#592343] text-white flex flex-col transition-all duration-300 flex-shrink-0 min-h-screen`}>
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/globo_transparente_b89ad2b6.png"
                alt="Globo"
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div>
                <p className="font-bold text-sm leading-tight">VELLOSO</p>
                <p className="text-white/60 text-xs tracking-widest">CIDADANIA</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left ${
                activeSection === item.id
                  ? 'bg-white/20 text-white font-semibold'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title={!sidebarOpen ? 'Sair' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">
            {menuItems.find(m => m.id === activeSection)?.label || 'Intranet'}
          </h1>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ce2b37] rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#592343] to-[#7a2f52] flex items-center justify-center text-white font-bold text-sm">
              V
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
