import { useEffect, useState, FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Mail, Lock, Sparkles, ShieldCheck, LineChart, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useEmpresaStore } from '../store/empresaStore';

const FALLBACK_BRAND_MARK = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Center Flow mark">
    <defs>
      <linearGradient id="flow" x1="60" y1="60" x2="452" y2="452" gradientUnits="userSpaceOnUse">
        <stop stop-color="#24D1FF" />
        <stop offset="0.5" stop-color="#11D8C0" />
        <stop offset="1" stop-color="#00C16A" />
      </linearGradient>
    </defs>
    <circle cx="256" cy="256" r="240" fill="#041d1d" />
    <path d="M92 186c68-94 206-102 296-7" stroke="url(#flow)" stroke-width="52" stroke-linecap="round" fill="none" />
    <path d="M92 263c68-94 206-102 296-7" stroke="url(#flow)" stroke-width="46" stroke-linecap="round" fill="none" />
    <path d="M92 340c68-94 206-102 296-7" stroke="url(#flow)" stroke-width="40" stroke-linecap="round" fill="none" />
  </svg>
`)}
`;

const SIGNATURE_ASSET = '/centerflow-mark.svg';

export function Login() {
  const { logo, nomeEmpresa } = useEmpresaStore();
  const [email, setEmail] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('cfo:last-email') || '' : ''));
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('cfo:remember-login') === 'true' : false));
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const { login, isAuth } = useAuthStore();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cfo:remember-login', String(remember));
    if (!remember) {
      localStorage.removeItem('cfo:last-email');
    }
  }, [remember]);

  useEffect(() => {
    if (typeof window === 'undefined' || !remember) return;
    localStorage.setItem('cfo:last-email', email);
  }, [remember, email]);

  if (isAuth) {
    return <Navigate to="/dashboard" replace />;
  }

  const brandMark = logo || SIGNATURE_ASSET;
  const companyName = nomeEmpresa || 'CFO Hub';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha email e senha para continuar.');
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      login(email, password);
      toast.success('Login realizado com sucesso.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 480));
      login('google@cfocompany.com', 'oauth-google');
      toast.success('Login via Google simulado.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleForgotPassword = () => {
    toast('Enviaremos um link seguro para redefinir sua senha.');
  };

  const handleAutofillDemo = () => {
    setEmail('demo@cfocompany.com');
    setPassword('123456');
    toast.success('Credenciais de demonstração preenchidas.');
  };

  const featureCards = [
    {
      icon: ShieldCheck,
      title: 'Acesso seguro',
      description: 'SSO e MFA prontos para ativação, com auditoria de sessão.',
    },
    {
      icon: LineChart,
      title: 'Indicadores ao vivo',
      description: 'Monitoramento do financeiro, folha e indicadores de RH.',
    },
    {
      icon: Clock3,
      title: 'Operação contínua',
      description: 'Status 24/7 com failover e alertas em tempo real.',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0a2c2a] via-[#0d3635] to-[#092725] text-slate-50">
      <div className="pointer-events-none absolute -left-10 top-10 h-64 w-64 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-10 bottom-0 h-72 w-72 rounded-full bg-cyan-300/8 blur-3xl" />

      <div className="relative flex min-h-screen flex-col">
        <div className="flex-1 grid gap-10 px-6 py-10 lg:grid-cols-5 lg:px-16 lg:py-12">
          <section className="flex flex-col justify-center gap-6 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
            <div className="h-24 w-24 rounded-2xl border-2 border-white/30 bg-white dark:bg-slate-900 p-3.5 shadow-xl">
              <img
                src={brandMark}
                alt="Logotipo"
                className="h-full w-full rounded-xl object-cover"
                onError={(e) => {
                  if (e.currentTarget.src !== FALLBACK_BRAND_MARK) {
                    e.currentTarget.src = FALLBACK_BRAND_MARK;
                  }
                }}
              />
            </div>
            <div className="min-w-[240px]">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <Sparkles className="h-4 w-4" /> Acesso exclusivo
              </p>
              <h1 className="text-4xl font-bold leading-tight text-white">{companyName}</h1>
              <p className="text-sm font-medium text-slate-200">Sistema de Gestão Interna com identidade configurada pelo admin.</p>
            </div>
            <div className="ml-auto flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-5 py-2.5 text-sm font-semibold text-emerald-50 shadow-lg">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-300 shadow-lg shadow-emerald-500/50" />
              Disponibilidade monitorada em tempo real
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {featureCards.map(({ icon: Icon, title, description }) => (
              <Card key={title} className="border-white/20 bg-white/10 p-5 text-slate-50 shadow-xl backdrop-blur-md">
                <div className="mb-3 flex items-center gap-2.5 text-emerald-300">
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-bold">{title}</span>
                </div>
                <p className="text-sm font-medium leading-relaxed text-slate-200">{description}</p>
              </Card>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-md">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="flex flex-wrap items-center gap-6">
              <div className="h-28 w-28 rounded-3xl border-2 border-white/20 bg-white dark:bg-slate-900 p-4 shadow-xl">
                <img
                  src={brandMark}
                  alt="Marca destaque"
                  className="h-full w-full rounded-2xl object-cover"
                  onError={(e) => {
                    if (e.currentTarget.src !== FALLBACK_BRAND_MARK) {
                      e.currentTarget.src = FALLBACK_BRAND_MARK;
                    }
                  }}
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-300">Portal seguro</p>
                <h2 className="text-xl font-bold text-white">Autenticação protegida e personalizável</h2>
                <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-200">Experiência alinhada à identidade da sua empresa, com dispositivos lembrados e avisos rápidos.</p>
              </div>
              <div className="flex flex-col gap-2.5 text-sm font-medium text-slate-100">
                <div className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50" />Monitoração ativa</div>
                <div className="flex items-center gap-2.5"><span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-500/50" />Logs cifrados</div>
              </div>
            </div>
          </div>
          </section>

          <section className="flex items-center lg:col-span-2">
          <Card className="w-full border-white/20 bg-white/95 p-8 text-slate-900 shadow-2xl backdrop-blur-sm">
            <div className="mb-6">
              <p className="text-sm font-semibold text-emerald-600">Bem-vindo de volta</p>
              <h2 className="text-2xl font-bold text-gray-900">Entre para continuar</h2>
              <p className="text-sm text-gray-600 dark:text-slate-300">Use suas credenciais ou conecte com o Google.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200">E-mail</label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  leftIcon={<Mail size={18} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200">Senha</label>
                <Input
                  isPassword
                  placeholder="••••••••"
                  leftIcon={<Lock size={18} />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-400 text-emerald-600 focus:ring-emerald-500"
                  />
                  Lembrar deste dispositivo
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Esqueci a senha
                </button>
              </div>

              <Button type="submit" fullWidth loading={loading}>
                Entrar
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-slate-900 px-2 font-medium text-gray-500 dark:text-slate-400">ou</span>
              </div>
            </div>

            <Button
              variant="outline"
              fullWidth
              className="flex items-center justify-center gap-2 border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900/50"
              onClick={handleGoogleLogin}
              loading={loadingGoogle}
            >
              {!loadingGoogle && (
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18Z" />
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17Z" />
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07Z" />
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3Z" />
                </svg>
              )}
              Continuar com Google
            </Button>

            <div className="mt-6 flex flex-wrap gap-2.5 text-xs font-medium text-gray-600 dark:text-slate-300">
              <span className="rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-3 py-1.5">Suporte 24/7</span>
              <span className="rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-3 py-1.5">Logs criptografados</span>
              <span className="rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-3 py-1.5">Último login salvo</span>
            </div>
          </Card>
          </section>
        </div>

        <div className="flex items-center justify-center gap-3 bg-white/95 px-4 py-4 shadow-lg backdrop-blur">
          <img
            src={SIGNATURE_ASSET}
            alt="Center Flow"
            className="h-10 w-10 rounded-full border-2 border-emerald-500/30 bg-white dark:bg-slate-900 object-cover shadow-sm"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_BRAND_MARK) {
                e.currentTarget.src = FALLBACK_BRAND_MARK;
              }
            }}
          />
          <span className="text-sm font-semibold text-slate-800">Desenvolvido por Center Flow - 2025</span>
        </div>
      </div>
    </div>
  );
}




