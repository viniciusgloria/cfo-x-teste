import {
  Home,
  Clock,
  FileText,
  Target,
  MessageCircle,
  MessageSquare,
  Users,
  UserCog,
  Settings,
  LogOut,
  X,

  FolderOpen,
  BarChart,
  Calendar,
  Award,
  DollarSign,
  Receipt,
  Gift,
  Bell,
  CheckSquare
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEmpresaStore } from '../../store/empresaStore';
import { useCargosSetoresStore } from '../../store/cargosSetoresStore';
import { NavItem } from '../../types';
import { getAllowedPaths } from '../../utils/permissions';
import { useEffect, useRef, useState } from 'react';


// Menu principal na ordem solicitada
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Notificações', path: '/notificacoes', icon: Bell },
  { label: 'Tarefas', path: '/tarefas', icon: CheckSquare },
  { label: 'Ponto', path: '/ponto', icon: Clock },
  { label: 'Mural', path: '/mural', icon: MessageSquare },
  { label: 'Calendário', path: '/calendario', icon: Calendar },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Documentos', path: '/documentos', icon: FolderOpen },
  { label: 'Feedbacks', path: '/feedbacks', icon: MessageCircle },
  { label: 'Solicitações', path: '/solicitacoes', icon: FileText },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];

// Menu secundário (visualizações por nível de acesso) na ordem solicitada
const navItemsGestor: NavItem[] = [
  { label: 'Benefícios', path: '/beneficios', icon: Gift },
  { label: 'Colaboradores', path: '/colaboradores', icon: UserCog },
  { label: 'Folha de Pagamento', path: '/folha-pagamento', icon: DollarSign },
  { label: 'Folha de Clientes', path: '/folha-clientes', icon: Receipt },
  { label: 'Avaliações', path: '/avaliacoes', icon: Award },
  { label: 'Desenvolvimento', path: '/okrs', icon: Target },
  { label: 'Relatórios', path: '/relatorios', icon: BarChart },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean; // desktop collapsed (icons only)
}

export function Sidebar({ isOpen = true, onClose, collapsed = false }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const { logo, miniLogo, nomeEmpresa, aplicarInversaoLogo } = useEmpresaStore();
  const { cargos, setores } = useCargosSetoresStore();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const cargoNome = cargos.find(c => c.id === user?.cargoId)?.nome;
  const setorNome = setores.find(s => s.id === user?.setorId)?.nome;
  const allowedPaths = getAllowedPaths(user, cargoNome, setorNome);
  
  const isGestor = user?.role === 'admin' || user?.role === 'gestor';
  // Inverter somente se: dark mode está ativo E opção está selecionada
  const shouldInvert = isDarkMode && aplicarInversaoLogo === true;

  // Monitorar mudanças de dark mode
  useEffect(() => {
    // Verificar estado inicial
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Criar observer para mudanças de classe
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // trap basic focus to close button when opened on small screens
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        // focus trap: keep focus inside the panel when open
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKey);

    // focus the close button for mobile keyboard users
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={panelRef}
        role={isOpen && onClose ? 'dialog' : undefined}
        aria-modal={isOpen && onClose ? 'true' : undefined}
        aria-label={isOpen && onClose ? 'Menu de navegação' : undefined}
        className={`
  fixed md:static top-0 left-0 h-screen ${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-white dark:bg-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} transition-all`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 flex-1 justify-center'} w-full`}>
              {logo || miniLogo ? (
                <div className="flex items-center justify-center w-full">
                  <img
                    src={collapsed ? (miniLogo || logo) : (logo || miniLogo)}
                    alt={nomeEmpresa || 'Logo da Empresa'}
                    className={`${collapsed ? 'h-8 w-8 object-contain rounded' : 'h-[55px] w-[246px] object-contain'} transition-all mx-auto`}
                    style={{
                      filter: shouldInvert ? 'invert(1)' : 'none',
                    }}
                  />
                </div>
              ) : (
                <h1 className={`text-gray-800 dark:text-white font-bold text-center w-full ${collapsed ? 'text-xs hidden' : 'text-lg'} transition-all`}>
                  {nomeEmpresa || 'CFO Hub'}
                </h1>
              )}
              {/* Editing the company logo was moved to Configurações (Empresa) for admin users. */}
            </div>
            {/* Mobile close */}
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="md:hidden ml-2 text-gray-600 dark:text-white hover:text-gray-800 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
            >
              <X size={24} />
            </button>
            {/* Collapse control moved to Header (menu button) */}
          </div>

          <nav className={`flex-1 px-3 ${collapsed ? 'space-y-1' : 'p-4 space-y-2'} transition-all`} data-tour="menu">
            {navItems.filter((item) => allowedPaths.includes(item.path)).map((item) => {
              const getTourAttr = () => {
                if (item.path === '/ponto') return 'ponto';
                if (item.path === '/solicitacoes') return 'solicitacoes';
                if (item.path === '/okrs') return 'okrs';
                if (item.path === '/feedbacks') return 'feedbacks';
                if (item.path === '/tarefas') return 'tarefas';
                return undefined;
              };
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-tour={getTourAttr()}
                  title={item.label}
                  className={({ isActive }) => `
                    group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-all relative
                    ${isActive
                      ? 'bg-[#10B981]/20 border-l-4 border-[#10B981] text-gray-800 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon size={collapsed ? 28 : 22} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              );
            })}
            
            {isGestor && (
              <>
                <div className={collapsed ? 'mx-3 my-3 border-t border-gray-700' : 'mx-4 my-3 border-t border-gray-700'} />
                {navItemsGestor.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={({ isActive }) => `
                      group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-all
                      ${isActive
                        ? 'bg-[#10B981]/20 border-l-4 border-[#10B981] text-gray-800 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                      }
                    `}
                    onClick={onClose}
                  >
                    <item.icon size={collapsed ? 28 : 22} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </NavLink>
                ))}
              </>
            )}
            {/* bottom divider: keep inside nav so both dividers have same container width */}
            <div className={collapsed ? 'mx-3 my-3 border-t border-gray-700' : 'mx-4 my-3 border-t border-gray-700'} />
          </nav>
          <div className={`p-4 ${collapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={logout}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 w-full transition-all`}
              title={collapsed ? "Sair" : undefined}
            >
              <LogOut size={20} />
              {!collapsed && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
