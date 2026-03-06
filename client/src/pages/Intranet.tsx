import { useState } from 'react';
import { Home, FileText, CheckSquare, LogOut, Menu, X, Bell, Settings, User } from 'lucide-react';
import { useLocation } from 'wouter';

type MenuItemType = 'inicio' | 'arquivos' | 'tarefas' | 'sair';

export default function Intranet() {
  const [, navigate] = useLocation();
  const [activeMenu, setActiveMenu] = useState<MenuItemType>('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    // TODO: Implementar logout via tRPC quando backend estiver pronto
    navigate('/login');
  };

  const menuItems = [
    {
      id: 'inicio' as MenuItemType,
      label: 'Início',
      icon: Home,
      description: 'Dashboard principal'
    },
    {
      id: 'arquivos' as MenuItemType,
      label: 'Arquivos',
      icon: FileText,
      description: 'Documentos e mídia'
    },
    {
      id: 'tarefas' as MenuItemType,
      label: 'Tarefas RD Station',
      icon: CheckSquare,
      description: 'Gerenciar tarefas'
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-white transition-all duration-300 flex flex-col shadow-lg`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-primary/20 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663399377122/PxMC8QzTeavCuPqp6NYMem/globo_transparent_214d48ec.png"
                alt="Velloso"
                className="h-8 w-auto"
              />
              <div>
                <h1 className="font-bold text-sm">VELLOSO</h1>
                <p className="text-xs text-white/60">Cidadania</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <div className="text-left">
                    <p className="font-semibold text-sm">{item.label}</p>
                    <p className="text-xs text-white/50">{item.description}</p>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-3 border-t border-primary/20">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
            title={!sidebarOpen ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <div className="text-left">
                <p className="font-semibold text-sm">Sair</p>
                <p className="text-xs text-white/50">Fazer logout</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-border px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {activeMenu === 'inicio' && 'Dashboard'}
              {activeMenu === 'arquivos' && 'Arquivos'}
              {activeMenu === 'tarefas' && 'Tarefas RD Station'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {activeMenu === 'inicio' && 'Bem-vindo à sua intranet'}
              {activeMenu === 'arquivos' && 'Gerencie documentos e mídia'}
              {activeMenu === 'tarefas' && 'Acompanhe tarefas integradas com RD Station'}
            </p>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors relative">
              <Bell className="w-6 h-6 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
              <Settings className="w-6 h-6 text-foreground" />
            </button>
            <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-primary/90 transition-colors">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          {activeMenu === 'inicio' && (
            <div className="p-8 space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-8">
                <h3 className="text-3xl font-bold text-primary mb-2">Bem-vindo à Intranet Velloso!</h3>
                <p className="text-muted-foreground text-lg">
                  Aqui você pode gerenciar arquivos, tarefas e colaborar com sua equipe de forma integrada.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Arquivos</h4>
                    <FileText className="w-8 h-8 text-primary/30" />
                  </div>
                  <p className="text-3xl font-bold text-primary">12</p>
                  <p className="text-sm text-muted-foreground mt-2">Documentos compartilhados</p>
                </div>

                <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Tarefas Ativas</h4>
                    <CheckSquare className="w-8 h-8 text-primary/30" />
                  </div>
                  <p className="text-3xl font-bold text-primary">5</p>
                  <p className="text-sm text-muted-foreground mt-2">Aguardando conclusão</p>
                </div>

                <div className="bg-white rounded-lg border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-foreground">Notificações</h4>
                    <Bell className="w-8 h-8 text-primary/30" />
                  </div>
                  <p className="text-3xl font-bold text-primary">3</p>
                  <p className="text-sm text-muted-foreground mt-2">Novas mensagens</p>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-border p-6 shadow-sm">
                <h4 className="text-xl font-bold text-foreground mb-6">Atividade Recente</h4>
                <div className="space-y-4">
                  {[
                    { title: 'Documento atualizado', description: 'Relatório Q1 2026', time: 'há 2 horas' },
                    { title: 'Tarefa criada', description: 'Design da página de login', time: 'há 5 horas' },
                    { title: 'Arquivo compartilhado', description: 'Guia de Cidadania Italiana', time: 'há 1 dia' },
                  ].map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-3 h-3 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'arquivos' && (
            <div className="p-8">
              <div className="bg-white rounded-lg border border-border p-12 text-center">
                <FileText className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Seção de Arquivos</h3>
                <p className="text-muted-foreground mb-6">
                  Aqui você poderá visualizar, fazer upload e compartilhar documentos com a equipe.
                </p>
                <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Enviar Arquivo
                </button>
              </div>
            </div>
          )}

          {activeMenu === 'tarefas' && (
            <div className="p-8">
              <div className="bg-white rounded-lg border border-border p-12 text-center">
                <CheckSquare className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">Tarefas RD Station</h3>
                <p className="text-muted-foreground mb-6">
                  Integração com RD Station para gerenciar tarefas e acompanhar o progresso dos projetos.
                </p>
                <button className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Conectar RD Station
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
