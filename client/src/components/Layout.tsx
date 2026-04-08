import { useState } from 'react';
import { useLocation } from 'wouter';
import {
  Home,
  Calendar,
  Users,
  TrendingUp,
  FileText,
  FolderOpen,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Globe,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Início', path: '/', icon: Home },
  { label: 'Calendário', path: '/calendario', icon: Calendar },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Processos', path: '/processos', icon: FileText },
  { label: 'Vendas', path: '/vendas', icon: TrendingUp },
  { label: 'Relatórios', path: '/relatorios', icon: BarChart3 },
  { label: 'Documentos', path: '/documentos', icon: FolderOpen },
  { label: 'Intranet', path: '/intranet', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-[#FAF8F6] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col bg-[#2D1B29] text-white transition-all duration-300 shrink-0 z-30',
          sidebarOpen ? 'w-60' : 'w-16'
        )}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-[#C9A84C] flex items-center justify-center">
            <Globe className="w-4 h-4 text-white" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <p className="font-bold text-sm leading-tight text-white">Velloso</p>
              <p className="text-[10px] text-[#C9A84C] tracking-widest uppercase">Cidadania</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 group',
                  isActive
                    ? 'bg-[#C9A84C]/20 text-[#C9A84C] border-r-2 border-[#C9A84C]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isActive && <ChevronRight className="w-3 h-3" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-4">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 text-white/50 hover:text-white/80 text-xs transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {title && (
              <h1 className="text-lg font-semibold text-[#2D1B29]">{title}</h1>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <div className="w-8 h-8 rounded-full bg-[#592343] flex items-center justify-center text-white text-xs font-bold">
              V
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
