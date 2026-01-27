import { useState, useRef, useEffect, createElement } from 'react';
import { Bell, Menu, X, CheckCircle, MessageSquare, Clock, User, Settings, LogOut, Search, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { resetAll } from '../../store/resetHelpers';
import { useAuthStore } from '../../store/authStore';
import { useNotificacoesStore } from '../../store/notificacoesStore';
import { useThemeStore } from '../../store/themeStore';
import { Avatar } from '../Avatar';
import { BuscaGlobal } from '../BuscaGlobal';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

const iconMap: Record<string, any> = {
  CheckCircle,
  MessageSquare,
  Clock,
  Bell,
};

export function Header({ title, onMenuClick }: HeaderProps) {
  const { user, logout, updateAvatar } = useAuthStore();
  const navigate = useNavigate();
  const { notificacoes, marcarComoLida, marcarTodasComoLidas, getNotificacoesNaoLidas } = useNotificacoesStore();
  const { theme, toggleTheme } = useThemeStore();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [buscaOpen, setBuscaOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const naoLidas = getNotificacoesNaoLidas();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };

    if (notifOpen || profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notifOpen, profileOpen]);

  // Atalho Ctrl+K para busca
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setBuscaOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNotifClick = (notif: any) => {
    marcarComoLida(notif.id);
    if (notif.link) {
      navigate(notif.link);
      setNotifOpen(false);
    }
  };

  const formatTempo = (dataISO: string) => {
    const agora = new Date().getTime();
    const data = new Date(dataISO).getTime();
    const diffMinutos = Math.floor((agora - data) / (1000 * 60));

    if (diffMinutos < 60) return `${diffMinutos}m atrás`;
    const diffHoras = Math.floor(diffMinutos / 60);
    if (diffHoras < 24) return `${diffHoras}h atrás`;
    const diffDias = Math.floor(diffHoras / 24);
    return `${diffDias}d atrás`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      toast.error('Apenas arquivos JPG ou PNG são permitidos');
      return;
    }

    // Validar tamanho (500KB)
    if (file.size > 500 * 1024) {
      toast.error('A imagem deve ter no máximo 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Redimensionar para 200x200
        canvas.width = 200;
        canvas.height = 200;
        ctx.drawImage(img, 0, 0, 200, 200);

        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        updateAvatar(resizedDataUrl);
        toast.success('Foto atualizada com sucesso!');
        setProfileOpen(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 z-30 transition-colors">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            title="Abrir/Fechar menu"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Tema */}
          <button
            data-tour="theme"
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            title={theme === 'light' ? 'Modo escuro' : 'Modo claro'}
          >
            {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
          </button>

          {/* Busca Global */}
          <button
            data-tour="search"
            onClick={() => setBuscaOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Buscar (Ctrl+K)"
          >
            <Search size={22} />
          </button>

          <div className="relative" ref={notifRef}>
            <button
              data-tour="notifications"
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Bell size={22} />
              {naoLidas.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {naoLidas.length}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[500px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notificações</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNotifOpen(false);
                        navigate('/notificacoes');
                      }}
                      className="text-xs text-[#10B981] hover:underline"
                    >
                      Ver todas
                    </button>
                    {naoLidas.length > 0 && (
                      <button
                        onClick={marcarTodasComoLidas}
                        className="text-xs text-[#10B981] hover:underline"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto flex-1">
                  {notificacoes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                      <Bell size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm">Nenhuma notificação</p>
                    </div>
                  ) : (
                    notificacoes.map((notif) => {
                      const Icon = iconMap[notif.icone || 'Bell'];
                      return (
                        <button
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`w-full text-left p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            !notif.lida ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {Icon && (
                              <div className={`flex-shrink-0 ${notif.cor || 'text-gray-600'}`}>
                                {createElement(Icon, { size: 20 })}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                  {notif.titulo}
                                </p>
                                {!notif.lida && (
                                  <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.mensagem}</p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatTempo(notif.criadoEm)}</p>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <button
              data-tour="profile"
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Avatar src={user?.avatar} alt={user?.name} className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700" />
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 py-1">
                <button
                  onClick={() => {
                    navigate('/perfil');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <User size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Meu Perfil</span>
                </button>
                {/* Opção 'Editar Foto' removida conforme solicitação do projeto */}
                <button
                  onClick={() => {
                    navigate('/configuracoes');
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3"
                >
                  <Settings size={18} className="text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Configurações</span>
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-3"
                >
                  <LogOut size={18} className="text-red-600 dark:text-red-400" />
                  <span className="text-sm text-red-600 dark:text-red-400">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Busca Global Modal */}
      <BuscaGlobal isOpen={buscaOpen} onClose={() => setBuscaOpen(false)} />
      
      {/* Input para upload de foto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handlePhotoUpload}
        className="hidden"
      />
    </header>
  );
}
