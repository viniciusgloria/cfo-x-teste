# CFO X SaaS - Frontend

Interface web moderna desenvolvida em React + TypeScript para a plataforma CFO X SaaS.

## Arquitetura

O frontend segue uma arquitetura component-based com hooks e gerenciamento de estado global:

```
frontend/
├── public/              # Assets estáticos
├── src/
│   ├── main.tsx        # Entry point
│   ├── App.tsx         # Componente raiz e rotas
│   ├── index.css       # Estilos globais
│   │
│   ├── components/     # Componentes reutilizáveis
│   │   ├── Avatar.tsx
│   │   ├── BuscaGlobal.tsx
│   │   ├── CollaboratorCard.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── FileUpload.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── pages/          # Páginas/Views
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Colaboradores.tsx
│   │   ├── Ponto.tsx
│   │   ├── Documentos.tsx
│   │   ├── Tarefas.tsx
│   │   └── ...
│   │
│   ├── contexts/       # Contextos React
│   │   ├── AuthContext.tsx
│   │   ├── EmpresaContext.tsx
│   │   └── ...
│   │
│   ├── hooks/          # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── ...
│   │
│   ├── services/       # Chamadas API
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── colaboradorService.ts
│   │   └── ...
│   │
│   ├── store/          # Zustand stores
│   │   ├── authStore.ts
│   │   ├── empresaStore.ts
│   │   └── ...
│   │
│   ├── types/          # TypeScript types/interfaces
│   │   ├── index.ts
│   │   ├── user.ts
│   │   ├── colaborador.ts
│   │   └── ...
│   │
│   └── utils/          # Funções utilitárias
│       ├── formatters.ts
│       ├── validators.ts
│       └── ...
│
├── eslint.config.js
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## Tecnologias

### Core
- **React 18.2.0** - Biblioteca UI
- **TypeScript 5.2.2** - Tipagem estática
- **Vite 5.4.0** - Build tool e dev server

### UI & Styling
- **TailwindCSS 3.3.3** - Framework CSS utility-first
- **Lucide React 0.293.0** - Ícones
- **React Icons 5.0.1** - Biblioteca de ícones adicional
- **@radix-ui/react-tooltip** - Tooltips acessíveis

### Roteamento & Estado
- **React Router DOM 6.21.2** - Roteamento
- **Zustand 4.4.1** - Gerenciamento de estado global

### Visualização & UX
- **Recharts 2.10.3** - Gráficos e charts
- **React Hot Toast 2.4.1** - Notificações toast
- **React Joyride 2.7.2** - Tour guiado

### Markdown & Content
- **React Markdown 9.1.0** - Renderização de Markdown
- **Remark GFM 4.0.1** - GitHub Flavored Markdown

### Exportação (Opcional)
- **file-saver 2.0.5** - Download de arquivos
- **xlsx 0.18.5** - Exportação para Excel

## Funcionalidades

### Implementadas

#### Autenticação
- Login/Logout com JWT
- Refresh token automático
- Proteção de rotas
- Tela de login responsiva

#### Dashboard
- KPIs principais
- Gráficos de vendas
- Métricas de RH
- Atividades recentes

#### Colaboradores
- Listagem com filtros
- Cadastro/Edição
- Upload de foto
- Visualização de detalhes
- Gestão de cargos/setores

#### Ponto
- Registro de entrada/saída
- Visualização de histórico
- Banco de horas
- Relatórios

#### Folha de Pagamento
- Visualização de holerites
- Histórico de folhas
- Download de comprovantes

#### Documentos
- Upload de arquivos
- Organização em pastas
- Compartilhamento
- Preview de documentos

#### Tarefas
- Kanban board
- Lista de tarefas
- Atribuição
- Comentários
- Prioridades

#### OKRs
- Criação de objetivos
- Definição de KRs
- Acompanhamento de progresso
- Bloqueadores

#### Chat
- Mensagens em tempo real
- Canais por empresa
- Histórico

#### Notificações
- Centro de notificações
- Badge de contadores
- Alertas do sistema

#### Clientes & CPA
- Dashboard de análise
- Métricas de aquisição
- Gráficos de vendas

### Design System

- Paleta de cores consistente
- Componentes reutilizáveis
- Responsivo (mobile-first)
- Modo escuro (planejado)
- Animações suaves
- Feedback visual

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta frontend:

```env
# API Backend
VITE_API_URL=http://localhost:8000

# Outras configurações
VITE_APP_NAME=CFO X SaaS
VITE_ENABLE_ANALYTICS=false
```

### Instalação

1. **Instalar dependências:**
```bash
cd frontend
npm install
```

2. **Executar em desenvolvimento:**
```bash
npm run dev
```

3. **Build para produção:**
```bash
npm run build
```

4. **Preview do build:**
```bash
npm run preview
```

### Scripts Disponíveis

```json
{
  "dev": "vite",              // Servidor de desenvolvimento
  "build": "vite build",      // Build de produção
  "preview": "vite preview"   // Preview do build
}
```

## Estrutura de Rotas

```tsx
/                        → Dashboard
/login                   → Login
/colaboradores           → Listagem de colaboradores
/colaboradores/:id       → Detalhes do colaborador
/ponto                   → Registro de ponto
/folha                   → Folha de pagamento
/documentos              → Gestão de documentos
/tarefas                 → Tarefas
/okrs                    → OKRs
/chat                    → Chat interno
/clientes                → Gestão de clientes
/cpa-dashboard           → Dashboard CPA
/empresa                 → Configurações da empresa
/perfil                  → Perfil do usuário
/configuracoes           → Configurações
```

## Componentes Principais

### Layout Components
- **Layout** - Container principal com navegação
- **Sidebar** - Menu lateral
- **Header** - Cabeçalho com notificações e perfil
- **BuscaGlobal** - Busca global

### Form Components
- **Input, Select, Textarea** - Componentes de formulário
- **FileUpload** - Upload de arquivos
- **DatePicker** - Seletor de data
- **MultiSelect** - Seleção múltipla

### Display Components
- **DashboardCard** - Cards de métricas
- **CollaboratorCard** - Card de colaborador
- **TaskCard** - Card de tarefa
- **DocumentCard** - Card de documento

### Modal Components
- **Modal** - Modal base
- **ConfirmDialog** - Diálogo de confirmação
- **ColaboradorModal** - Modal de colaborador
- **TaskModal** - Modal de tarefa

### Utility Components
- **LoadingSpinner** - Indicador de carregamento
- **ErrorBoundary** - Tratamento de erros
- **ProtectedRoute** - Proteção de rotas

## Autenticação

### AuthContext

```tsx
const { user, login, logout, isAuthenticated } = useAuth();

// Login
await login(email, password);

// Logout
logout();

// Verificar autenticação
if (isAuthenticated) {
  // Usuário logado
}
```

### Protected Routes

```tsx
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## API Service

### Uso Básico

```tsx
import api from '@/services/api';

// GET
const colaboradores = await api.get('/colaboradores');

// POST
const novoColab = await api.post('/colaboradores', data);

// PUT
await api.put(`/colaboradores/${id}`, data);

// DELETE
await api.delete(`/colaboradores/${id}`);
```

### Interceptors

- **Request:** Adiciona token JWT automaticamente
- **Response:** Trata erros e refresh token

## Estilização

### TailwindCSS

Utilitários principais usados:
```tsx
// Layout
className="flex items-center justify-between"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Cores
className="bg-blue-500 text-white"
className="border border-gray-300"

// Responsividade
className="hidden md:block"
className="text-sm md:text-base lg:text-lg"

// Estados
className="hover:bg-gray-100 active:bg-gray-200"
className="focus:ring-2 focus:ring-blue-500"
```

### Custom CSS

Localizado em `src/index.css`:
- Variáveis CSS
- Animações personalizadas
- Reset de estilos

## State Management

### Zustand Stores

```tsx
// authStore.ts
import create from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null })
}));

// Uso
const { user, setUser } = useAuthStore();
```

## Boas Práticas

### TypeScript

```tsx
// Definir tipos
interface Colaborador {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

// Usar tipos em componentes
interface Props {
  colaborador: Colaborador;
  onEdit: (id: number) => void;
}

const ColaboradorCard: React.FC<Props> = ({ colaborador, onEdit }) => {
  // ...
};
```

### Hooks Customizados

```tsx
// useApi.ts
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Fetch logic
  }, [url]);

  return { data, loading, error };
}
```

### Error Handling

```tsx
try {
  await api.post('/colaboradores', data);
  toast.success('Colaborador criado com sucesso!');
} catch (error) {
  toast.error('Erro ao criar colaborador');
  console.error(error);
}
```

## Performance

### Code Splitting

```tsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<LoadingSpinner />}>
  <Dashboard />
</Suspense>
```

### Memoization

```tsx
import { useMemo, useCallback } from 'react';

// useMemo para cálculos pesados
const filteredData = useMemo(() => {
  return data.filter(item => item.active);
}, [data]);

// useCallback para funções
const handleClick = useCallback(() => {
  // handler logic
}, [dependencies]);
```

## Responsividade

Breakpoints TailwindCSS:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards responsivos */}
</div>
```

## Debugging

### React DevTools
- Instale a extensão React DevTools
- Inspecione componentes e props
- Analise o profiler

### Console Logs
```tsx
console.log('Debug:', { user, isAuthenticated });
```

### Network
- Verifique chamadas API no DevTools > Network
- Analise payloads e responses

## Build & Deploy

### Build Local

```bash
npm run build
# Output em: dist/
```

### Variáveis de Produção

```env
VITE_API_URL=https://api.seudominio.com
VITE_ENABLE_ANALYTICS=true
```

### Nginx Config

Ver `nginx.conf` para configuração de servidor.

## Contribuindo

### Padrões

1. **Nomenclatura:**
   - Componentes: PascalCase (`ColaboradorCard.tsx`)
   - Funções: camelCase (`handleSubmit`)
   - Constantes: UPPER_CASE (`API_URL`)

2. **Estrutura de Componente:**
```tsx
import React from 'react';

interface Props {
  // props definition
}

export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  // hooks
  // handlers
  // render
  return <div>...</div>;
};
```

3. **Commits:**
   - Use mensagens descritivas
   - Formato: `feat: add login page`
   - Tipos: `feat`, `fix`, `refactor`, `style`, `docs`