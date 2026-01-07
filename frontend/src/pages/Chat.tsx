import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Search, MoreVertical, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/Avatar';
import { PageBanner } from '../components/ui/PageBanner';
import { useChatStore } from '../store/chatStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';

export function Chat() {
  const { user } = useAuthStore();
  const { conversas, mensagens, conversaAtiva, setConversaAtiva, enviarMensagem, marcarComoLida, getMensagensDaConversa } = useChatStore();
  const { colaboradores } = useColaboradoresStore();
  const [novaMensagem, setNovaMensagem] = useState('');
  const [busca, setBusca] = useState('');
  const mensagensRef = useRef<HTMLDivElement>(null);

  const conversaSelecionada = conversas.find((c) => c.id === conversaAtiva);
  const mensagensDaConversa = conversaAtiva ? getMensagensDaConversa(conversaAtiva) : [];

  const getColaboradorInfo = (id: string) => {
    const colab = colaboradores.find((c) => c.id.toString() === id);
    return colab || { id, nome: 'Usuário', avatar: '', cargo: '' };
  };

  const getOutroParticipante = (participantes: string[]) => {
    const outroId = participantes.find((p) => p !== user?.id);
    return outroId ? getColaboradorInfo(outroId) : null;
  };

  const handleEnviar = () => {
    if (!novaMensagem.trim() || !conversaAtiva || !user) return;

    enviarMensagem(conversaAtiva, novaMensagem, user.id);
    setNovaMensagem('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEnviar();
    }
  };

  useEffect(() => {
    if (conversaAtiva) {
      marcarComoLida(conversaAtiva);
      // Scroll para o fim das mensagens
      setTimeout(() => {
        if (mensagensRef.current) {
          mensagensRef.current.scrollTop = mensagensRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [conversaAtiva, mensagens.length]);

  const conversasFiltradas = conversas.filter((c) => {
    if (!busca) return true;
    const outro = getOutroParticipante(c.participantes);
    return outro?.nome.toLowerCase().includes(busca.toLowerCase());
  });

  const formatarHora = (timestamp: string) => {
    const data = new Date(timestamp);
    return data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarData = (timestamp: string) => {
    const data = new Date(timestamp);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);

    if (data.toDateString() === hoje.toDateString()) {
      return 'Hoje';
    } else if (data.toDateString() === ontem.toDateString()) {
      return 'Ontem';
    } else {
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] space-y-6">
      <PageBanner
        title="Chat"
        icon={<MessageSquare size={32} />}
        style={{ minHeight: '64px' }}
      />

      <div className="grid grid-cols-12 gap-4 h-[calc(100%-5rem)]">
        {/* Lista de conversas */}
        <Card className="col-span-12 md:col-span-4 p-4 flex flex-col">
          <div className="mb-4">
            <Input
              placeholder="Buscar conversas..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {conversasFiltradas.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 dark:text-slate-300 mb-3" />
                <p className="text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 text-sm">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              conversasFiltradas.map((conversa) => {
                const outro = getOutroParticipante(conversa.participantes);
                if (!outro) return null;

                return (
                  <button
                    key={conversa.id}
                    onClick={() => setConversaAtiva(conversa.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      conversaAtiva === conversa.id
                        ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                        : 'hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar src={outro.avatar} alt={outro.nome} size="md" />
                        {conversa.naoLidas > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {conversa.naoLidas}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-gray-800 dark:text-gray-100 truncate">
                            {outro.nome}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 flex-shrink-0">
                            {formatarData(conversa.ultimaAtualizacao)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-300 dark:text-gray-400 dark:text-slate-500 truncate">
                          {conversa.ultimaMensagem || 'Sem mensagens'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        {/* Área de mensagens */}
        <Card className="col-span-12 md:col-span-8 flex flex-col">
          {conversaSelecionada ? (
            <>
              {/* Header da conversa */}
              <div className="p-4 border-b border-gray-200 dark:border-slate-700 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(() => {
                    const outro = getOutroParticipante(conversaSelecionada.participantes);
                    return outro ? (
                      <>
                        <Avatar src={outro.avatar} alt={outro.nome} size="md" />
                        <div>
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                            {outro.nome}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">{outro.cargo}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>
                <button
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 dark:bg-slate-800/80 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  onClick={() => toast('Opções da conversa em breve')}
                  title="Mais opções"
                >
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Mensagens */}
              <div ref={mensagensRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensagensDaConversa.map((msg) => {
                  const ehMinha = msg.remetenteId === user?.id;
                  const remetente = getColaboradorInfo(msg.remetenteId);

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${ehMinha ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {!ehMinha && <Avatar src={remetente.avatar} alt={remetente.nome} size="sm" />}
                      <div className={`flex flex-col ${ehMinha ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`max-w-md px-4 py-2 rounded-lg ${
                            ehMinha
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100'
                          }`}
                        >
                          <p className="text-sm break-words">{msg.texto}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500 mt-1">
                          {formatarHora(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input de nova mensagem */}
              <div className="p-4 border-t border-gray-200 dark:border-slate-700 dark:border-gray-700">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button onClick={handleEnviar} disabled={!novaMensagem.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={64} className="mx-auto text-gray-300 dark:text-gray-600 dark:text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-500 dark:text-slate-400 dark:text-gray-400 dark:text-slate-500">
                  Escolha um contato para começar a conversar
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}




