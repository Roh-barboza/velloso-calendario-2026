import Relatorios from "./pages/Relatorios";
import Calendario from "./pages/Calendario";
import Vendas from "./pages/Vendas";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import TaskGenerator from "./pages/TaskGenerator";
import CRM from "./pages/CRM";
import Intranet from "./pages/Intranet";
import Login from "./pages/Login";
import Clientes from "./pages/Clientes";
import Documentos from "./pages/Documentos";
import Processos from "./pages/Processos";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/calendario" component={Calendario} />
      <Route path="/clientes" component={Clientes} />
      <Route path="/processos" component={Processos} />
      <Route path="/vendas" component={Vendas} />
      <Route path="/relatorios" component={Relatorios} />
      <Route path="/documentos" component={Documentos} />
      <Route path="/intranet" component={Intranet} />
      <Route path="/tarefas" component={TaskGenerator} />
      <Route path="/crm" component={CRM} />
      <Route path="/login" component={Login} />
      <Route path="/configuracoes" component={Configuracoes} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
