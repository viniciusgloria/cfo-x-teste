import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './pages/Layout';
import { Ponto } from './pages/Ponto';
import { Clientes } from './pages/Clientes';
import { CadastroCliente } from './pages/CadastroCliente';
import { Solicitacoes } from './pages/Solicitacoes';
import { OKRs } from './pages/OKRs';
import { Feedbacks } from './pages/Feedbacks';
import { Mural } from './pages/Mural';
import { Colaboradores } from './pages/Colaboradores';
import { CadastroUsuario } from './pages/CadastroUsuario';
import { Configuracoes } from './pages/Configuracoes';
import { MeuPerfil } from './pages/MeuPerfil';
import { Relatorios } from './pages/Relatorios';
import { Calendario } from './pages/Calendario';
import { Chat } from './pages/Chat';
import { Avaliacoes } from './pages/Avaliacoes';
import FolhaPagamento from './pages/FolhaPagamento';
import FolhaClientes from './pages/FolhaClientes';
import { Documentos } from './pages/Documentos';
import Beneficios from './pages/Beneficios';
import { Notificacoes } from './pages/Notificacoes';
import Tarefas from './pages/Tarefas';
import Automacoes from './pages/Automacoes';
import { NavigationProgress } from './components/ui/NavigationProgress';
import { GuidedTour } from './components/GuidedTour';
import { useThemeStore } from './store/themeStore';
import { useEmpresaStore } from './store/empresaStore';

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Aplica o tema salvo ao carregar
    setTheme(theme);
  }, []);

  // Carregar favicon do store
  useEffect(() => {
    const favicon = localStorage.getItem('cfo:empresa');
    if (favicon) {
      try {
        const empresaData = JSON.parse(favicon);
        // Procurar por favicon em diferentes estruturas possíveis
        const faviconUrl = empresaData.favicon || 
                          (empresaData.state && empresaData.state.favicon) ||
                          (empresaData.state && empresaData.state.identidadeVisual && empresaData.state.identidadeVisual.favicon);
        
        if (faviconUrl) {
          const faviconElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
          if (faviconElement) {
            faviconElement.href = faviconUrl;
          } else {
            const newFavicon = document.createElement('link');
            newFavicon.rel = 'icon';
            newFavicon.href = faviconUrl;
            document.head.appendChild(newFavicon);
          }
        }
      } catch (error) {
        console.log('Favicon não encontrado no localStorage');
      }
    }
  }, []);

  /**
   * Router selection logic:
   * - Uses HashRouter if running from file:// (static file) or VITE_ROUTER_MODE=hash is set in .env
   * - Otherwise uses BrowserRouter (default for dev/preview)
   * - This preserves SPA navigation in static environments without server rewrites
   */
  const useHash = import.meta.env.VITE_ROUTER_MODE === 'hash' || window.location.protocol === 'file:';
  const Router = useHash ? HashRouter : BrowserRouter;

  return (
    <ToastProvider>
      <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
        <NavigationProgress />
        <GuidedTour />
        <Routes>
          <Route path="/" element={<Login />} />


        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ponto" element={<Ponto />} />
          <Route path="/solicitacoes" element={<Solicitacoes />} />
          <Route path="/okrs" element={<OKRs />} />
          <Route path="/tarefas" element={<Tarefas />} />
          <Route path="/automacoes" element={<Automacoes />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/mural" element={<Mural />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/cadastro-cliente" element={<CadastroCliente />} />
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/colaboradores/cadastro" element={<CadastroUsuario />} />
          <Route path="/perfil" element={<MeuPerfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
          <Route path="/folha-pagamento" element={<FolhaPagamento />} />
          <Route path="/folha-clientes" element={<FolhaClientes />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/beneficios" element={<Beneficios />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </ToastProvider>
  );
}

export default App;

