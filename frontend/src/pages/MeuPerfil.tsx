import { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Camera, Save, Eye, EyeOff, UserCog } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { toast } from 'react-hot-toast';
import { SiDiscord } from 'react-icons/si';
import { FaWhatsapp } from 'react-icons/fa';

export function MeuPerfil() {
  const user = useAuthStore((state) => state.user);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [nomeUsuario, setNomeUsuario] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cargo, setCargo] = useState('Desenvolvedor');
  const [celular, setCelular] = useState('');
  const [discord, setDiscord] = useState('');
  const [usarNomeSocial, setUsarNomeSocial] = useState(false);
  const [nomeSocial, setNomeSocial] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  
  const fotoInputRef = useRef<HTMLInputElement>(null);

  const handleFotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validação de tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG ou PNG.');
      return;
    }

    // Validação de tamanho (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Arquivo muito grande. Máximo: 2MB.');
      return;
    }

    setUploadingFoto(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar para 200x200 (centro crop quadrado)
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 200;
        
        canvas.width = size;
        canvas.height = size;

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        
        ctx?.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        const resizedDataUrl = canvas.toDataURL(file.type);
        setAvatar(resizedDataUrl);
        // Atualizar avatar no auth store (perfil) e nos colaboradores (se houver colaborador com mesmo email)
        useAuthStore.getState().updateAvatar(resizedDataUrl);
        if (email) {
          useColaboradoresStore.getState().updateAvatarByEmail(email, resizedDataUrl);
        }
        toast.success('Foto atualizada com sucesso!');
        setUploadingFoto(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSalvarPerfil = () => {
    // Validações
    if (!nomeUsuario.trim()) {
      toast.error('Nome de usuário é obrigatório');
      return;
    }

    if (!email.trim()) {
      toast.error('E-mail é obrigatório');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('E-mail inválido');
      return;
    }

    if (celular && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(celular)) {
      toast.error('Celular inválido. Use o formato (XX) XXXXX-XXXX');
      return;
    }

    // Validação de senha (se preencheu algum campo de senha)
    if (senhaAtual || novaSenha || confirmarSenha) {
      if (!senhaAtual) {
        toast.error('Informe a senha atual para alterar a senha');
        return;
      }
      if (!novaSenha) {
        toast.error('Informe a nova senha');
        return;
      }
      if (novaSenha.length < 6) {
        toast.error('A nova senha deve ter pelo menos 6 caracteres');
        return;
      }
      if (novaSenha !== confirmarSenha) {
        toast.error('As senhas não coincidem');
        return;
      }
    }

    // Simular salvamento
    toast.success('Perfil atualizado com sucesso!');
    
    // Limpar campos de senha
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
  };

  const handleWhatsAppClick = () => {
    if (!celular) {
      toast.error('Celular não cadastrado');
      return;
    }
    const phone = celular.replace(/\D/g, '');
    window.open(`https://wa.me/55${phone}`, '_blank');
  };

  const handleDiscordClick = () => {
    if (!discord) {
      toast.error('Discord não cadastrado');
      return;
    }
    // Copiar para área de transferência
    navigator.clipboard.writeText(discord);
    toast.success('Usuário do Discord copiado!');
  };

  const formatCelular = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <PageBanner title="Meu Perfil" icon={<UserCog size={32} />} />
        <p className="text-gray-600 dark:text-slate-300 mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Foto de Perfil */}
      <Card>
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-gray-200 dark:border-slate-700">
                  {nomeUsuario.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => fotoInputRef.current?.click()}
                disabled={uploadingFoto}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition-colors disabled:opacity-50"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input
                ref={fotoInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFotoUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Foto de Perfil</h3>
            <div className="text-sm text-gray-600 dark:text-slate-300 space-y-1">
              <p>• <strong>Tamanho ideal:</strong> 200x200 pixels (quadrado)</p>
              <p>• <strong>Formatos aceitos:</strong> JPG, PNG</p>
              <p>• <strong>Tamanho máximo:</strong> 2MB</p>
              <p className="text-gray-500 dark:text-slate-400 mt-2">A imagem será automaticamente redimensionada e cortada para o formato ideal.</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Informações Pessoais */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Informações Pessoais</h3>
        
        <div className="space-y-4">
          {/* Nome Completo (não editável) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Nome Completo
            </label>
            <Input
              value={user?.name || 'João Silva'}
              disabled
              className="bg-gray-50 dark:bg-slate-900/50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Nome cadastrado no sistema (não editável)</p>
          </div>

          {/* Nome de Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Nome de Usuário
            </label>
            <Input
              value={nomeUsuario}
              onChange={(e) => setNomeUsuario(e.target.value)}
              placeholder="Como você quer ser chamado"
            />
          </div>

          {/* Nome Social */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="usarNomeSocial"
                checked={usarNomeSocial}
                onChange={(e) => setUsarNomeSocial(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="usarNomeSocial" className="text-sm font-medium text-gray-700 dark:text-slate-200 cursor-pointer">
                Usar nome social
              </label>
            </div>
            {usarNomeSocial && (
              <Input
                value={nomeSocial}
                onChange={(e) => setNomeSocial(e.target.value)}
                placeholder="Digite seu nome social"
              />
            )}
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              E-mail
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          {/* Cargo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Cargo
            </label>
            <Input
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              placeholder="Seu cargo"
            />
          </div>
        </div>
      </Card>

      {/* Contato */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Informações de Contato</h3>
        
        <div className="space-y-4">
          {/* Celular/WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Celular / WhatsApp
            </label>
            <div className="flex gap-2">
              <Input
                value={celular}
                onChange={(e) => setCelular(formatCelular(e.target.value))}
                placeholder="(XX) XXXXX-XXXX"
                className="flex-1"
              />
              {celular && (
                <Button
                  variant="outline"
                  onClick={handleWhatsAppClick}
                  className="flex-shrink-0"
                  title="Abrir WhatsApp"
                >
                  <FaWhatsapp className="w-5 h-5 text-green-600" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Outros usuários poderão entrar em contato via WhatsApp
            </p>
          </div>

          {/* Discord */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Usuário do Discord
            </label>
            <div className="flex gap-2">
              <Input
                value={discord}
                onChange={(e) => setDiscord(e.target.value)}
                placeholder="usuario#1234"
                className="flex-1"
              />
              {discord && (
                <Button
                  variant="outline"
                  onClick={handleDiscordClick}
                  className="flex-shrink-0"
                  title="Copiar Discord"
                >
                  <SiDiscord className="w-5 h-5 text-[#5865F2]" />
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Outros usuários poderão copiar seu Discord para contato
            </p>
          </div>
        </div>
      </Card>

      {/* Alterar Senha */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Alterar Senha</h3>
        
        <div className="space-y-4">
          {/* Senha Atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Senha Atual
            </label>
            <div className="relative">
              <Input
                type={showSenhaAtual ? 'text' : 'password'}
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSenhaAtual(!showSenhaAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300"
              >
                {showSenhaAtual ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showNovaSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Digite sua nova senha"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNovaSenha(!showNovaSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300"
              >
                {showNovaSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Nova Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <Input
                type={showConfirmarSenha ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmarSenha(!showConfirmarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300"
              >
                {showConfirmarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-slate-400">
            A senha deve ter no mínimo 6 caracteres
          </p>
        </div>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={handleSalvarPerfil} className="min-w-[150px]">
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}





