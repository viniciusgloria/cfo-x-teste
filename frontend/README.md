# Frontend - CFO-X SaaS

Interface moderna e responsiva para o sistema CFO-X SaaS. Aplicação React com TypeScript, Tailwind CSS e Vite para uma experiência de usuário excepcional.

[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0+-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC.svg)](https://tailwindcss.com/)

---

## Índice

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Desenvolvimento](#desenvolvimento)
- [Build](#build)
- [Features](#features)
- [Componentes](#componentes)
- [Estilização](#estilização)
- [Deploy](#deploy)

---

## Sobre

Frontend moderno e responsivo para o CFO-X SaaS. Interface intuitiva construída com React e TypeScript, oferecendo experiência de usuário fluida com gestão de estado eficiente, roteamento otimizado e design system consistente.

### Características:
- OK Interface responsiva e moderna
- OK TypeScript para type safety
- OK State management com Zustand
- OK Roteamento com React Router v6
- OK Tailwind CSS para estilização
- OK Componentes reutilizáveis
- OK Hot Module Replacement (HMR)
- OK Build otimizado com Vite
- OK Code splitting automático
- OK PWA ready

---

## Tecnologias

### Core
- **React 18.2** - Biblioteca UI
- **TypeScript 5.0** - Tipagem estática
- **Vite 5.0** - Build tool moderna e rápida
- **React Router 6** - Roteamento

### State Management
- **Zustand 4.4** - State management leve e eficiente
- **React Context** - Estado compartilhado

### Styling
- **Tailwind CSS 3.0** - Framework CSS utility-first
- **PostCSS** - Processador CSS
- **Lucide React** - Ícones modernos

### UI Components
- **Radix UI** - Componentes acessíveis
- **React Hot Toast** - Notificações
- **Recharts** - Gráficos e visualizações
- **React Joyride** - Tours e onboarding

### Utilities
- **React Markdown** - Renderizar markdown
- **remark-gfm** - GitHub Flavored Markdown
- **file-saver** - Download de arquivos
- **xlsx** - Exportar para Excel

### Development
- **ESLint** - Linting
- **TypeScript ESLint** - Lint para TS
- **Vite PWA** - Progressive Web App

---

## Estrutura

```
frontend/
├── public/                  # Assets estáticos
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── components/          # Componentes React
│   │   ├── ApprovarSolicitacaoModal.tsx
│   │   ├── AtestadoModal.tsx
│   │   ├── Avatar.tsx
│   │   ├── BeneficioCard.tsx
│   │   ├── BeneficioModal.tsx
│   │   ├── BulkActions.tsx
│   │   ├── BuscaGlobal.tsx
│   │   ├── CalendarView.tsx
│   │   ├── CargoModal.tsx
│   │   ├── CollaboratorCard.tsx
│   │   ├── DashboardCustomizer.tsx
│   │   ├── EditarFolhaModal.tsx
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── Modal.tsx
│   │   ├── Sidebar.tsx
│   │   └── ... (mais componentes)
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Colaboradores.tsx
│   │   ├── Ponto.tsx
│   │   ├── Folha.tsx
│   │   ├── Documentos.tsx
│   │   ├── Tarefas.tsx
│   │   ├── OKRs.tsx
│   │   ├── Chat.tsx
│   │   ├── Configuracoes.tsx
│   │   └── ... (outras páginas)
│   │
│   ├── contexts/            # Context API
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── NotificationContext.tsx
│   │
│   ├── hooks/               # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── usePagination.ts
│   │
│   ├── services/            # Serviços de API
│   │   ├── api.ts           # Cliente axios
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── colaborador.service.ts
│   │   ├── ponto.service.ts
│   │   └── ... (outros services)
│   │
│   ├── store/               # Zustand stores
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   └── uiStore.ts
│   │
│   ├── types/               # TypeScript types
│   │   ├── index.ts
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── colaborador.types.ts
│   │   └── ... (outros types)
│   │
│   ├── utils/               # Utilitários
│   │   ├── formatters.ts    # Formatação de dados
│   │   ├── validators.ts    # Validações
│   │   ├── constants.ts     # Constantes
│   │   └── helpers.ts       # Helpers gerais
│   │
│   ├── App.tsx              # Componente principal
│   ├── main.tsx             # Entry point
│   ├── index.css            # Estilos globais
│   └── vite-env.d.ts        # Vite types
│
├── .env.example             # Template variáveis de ambiente
├── eslint.config.js         # Configuração ESLint
├── index.html               # HTML template
├── package.json             # Dependências
├── postcss.config.js        # PostCSS config
├── tailwind.config.js       # Tailwind config
├── tsconfig.json            # TypeScript config
├── tsconfig.app.json        # TS config app
├── tsconfig.node.json       # TS config node
├── vite.config.ts           # Vite config
└── README.md                # Este arquivo
```

---

## Instalação

### Opção 1: Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d frontend

# Acessar
# http://localhost:5173
```

### Opção 2: Desenvolvimento Local

```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o .env com a URL do backend

# Rodar dev server
npm run dev

# Acessar
# http://localhost:5173
```

---

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
# API Backend URL
VITE_API_URL=http://localhost:8000/api/v1

# Environment
VITE_ENVIRONMENT=development

# App Name
VITE_APP_NAME=CFO Hub

# Feature Flags (opcional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_CHAT=true
```

### Configuração do Vite

`vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

---

## Desenvolvimento

### Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse http://localhost:5173

### Scripts disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia dev server com HMR

# Build
npm run build            # Build de produção
npm run preview          # Preview do build

# Linting
npm run lint             # Executar ESLint

# Type checking
npx tsc --noEmit         # Verificar erros de tipo
```

### Hot Module Replacement (HMR)

Vite oferece HMR nativo. Qualquer alteração no código atualiza instantaneamente no browser sem perder o estado da aplicação.

---

## Features

### Autenticação
- Login/Logout com JWT
- Refresh token automático
- Rotas protegidas
- Sessão persistente

### Dashboard
- Cards informativos
- Gráficos interativos (Recharts)
- Métricas em tempo real
- Dashboard customizável

### Gestão de Colaboradores
- Lista com filtros e busca
- Cadastro completo
- Edição em massa
- Exportação para Excel
- Importação de dados

### Controle de Ponto
- Registro de ponto
- Visualização de calendário
- Solicitações de ajuste
- Relatórios de frequência
- Gestão de atestados

### Folha de Pagamento
- Geração automática
- Visualização detalhada
- Edição de folhas
- Exportação de relatórios
- Histórico completo

### Documentos
- Upload de arquivos
- Organização por pastas
- Compartilhamento
- Controle de versões
- Visualização inline

### Tarefas
- Criação e atribuição
- Kanban board
- Dependências entre tarefas
- Notificações
- Filtros avançados

### OKRs
- Definição de objetivos
- Key results mensuráveis
- Acompanhamento de progresso
- Timeline visual
- Relatórios de performance

### Chat
- Mensagens em tempo real
- Chat individual e em grupo
- Compartilhamento de arquivos
- Histórico de mensagens
- Notificações push

### Notificações
- Sistema de notificações
- Preferências de notificação
- Marcação de lido/não lido
- Agrupamento inteligente

---

## Componentes

### Principais Componentes

#### Layout
```tsx
<Layout>
  <Header />
  <Sidebar />
  <main>{children}</main>
</Layout>
```

#### Modal
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Título"
>
  {content}
</Modal>
```

#### DataTable
```tsx
<DataTable
  data={data}
  columns={columns}
  onRowClick={handleRowClick}
  loading={loading}
/>
```

#### Card
```tsx
<Card
  title="Título"
  subtitle="Subtítulo"
  icon={<Icon />}
  actions={<Button />}
>
  {content}
</Card>
```

### Componentes Reutilizáveis

- **Avatar** - Avatar de usuário
- **Button** - Botões estilizados
- **Input** - Campos de formulário
- **Select** - Seleção com busca
- **DatePicker** - Seletor de data
- **FileUpload** - Upload de arquivos
- **LoadingSpinner** - Indicador de loading
- **Toast** - Notificações toast
- **Tooltip** - Tooltips informativos
- **Badge** - Badges e tags
- **Pagination** - Paginação de listas

---

## Estilização

### Tailwind CSS

Utilizamos Tailwind CSS para estilização rápida e consistente:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
  <h2 className="text-xl font-bold text-gray-800">Título</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
    Ação
  </button>
</div>
```

### Design System

Cores principais definidas no `tailwind.config.js`:

```javascript
colors: {
  primary: '#3B82F6',    // Blue
  secondary: '#8B5CF6',  // Purple
  success: '#10B981',    // Green
  warning: '#F59E0B',    // Orange
  danger: '#EF4444',     // Red
  gray: colors.gray,
}
```

### Dark Mode

Suporte a dark mode (futuro):

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Conteúdo
</div>
```

---

## Integração com API

### Cliente API

`services/api.ts`:
```typescript
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

### Service Example

`services/colaborador.service.ts`:
```typescript
import api from './api'
import { Colaborador } from '../types'

export const colaboradorService = {
  getAll: () => api.get<Colaborador[]>('/colaboradores'),
  
  getById: (id: number) => api.get<Colaborador>(`/colaboradores/${id}`),
  
  create: (data: Partial<Colaborador>) => 
    api.post<Colaborador>('/colaboradores', data),
  
  update: (id: number, data: Partial<Colaborador>) =>
    api.put<Colaborador>(`/colaboradores/${id}`, data),
  
  delete: (id: number) => 
    api.delete(`/colaboradores/${id}`)
}
```

---

## Build

### Build de Produção

```bash
npm run build
```

Gera otimizado na pasta `dist/`:
- Code splitting automático
- Minificação de JS/CSS
- Tree shaking
- Asset optimization
- Source maps (opcional)

### Preview do Build

```bash
npm run preview
```

Testa o build localmente antes do deploy.

### Otimizações

- **Code Splitting**: Carregamento sob demanda
- **Lazy Loading**: Componentes lazy
- **Image Optimization**: Imagens otimizadas
- **Bundle Size**: Analisado com Rollup

---

## Deploy

### Azure Static Web Apps

#### Configurações:
- **App location**: `/frontend`
- **Output location**: `dist`
- **Build command**: `npm run build`

#### Application Settings (Portal Azure):
```
VITE_API_URL=https://cfohub-backend.azurewebsites.net/api/v1
VITE_ENVIRONMENT=production
VITE_APP_NAME=CFO Hub
```

### Build para Azure

`staticwebapp.config.json` já está configurado com:
- Rewrite para SPA routing
- Security headers
- MIME types
- API routes

---

## Boas Práticas

### TypeScript

```typescript
// Sempre use tipos
interface User {
  id: number
  name: string
  email: string
}

// Props de componentes
interface ButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

const Button: React.FC<ButtonProps> = ({ label, onClick, variant = 'primary' }) => {
  // implementação
}
```

### Hooks Customizados

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Verificar autenticação
    checkAuth()
  }, [])
  
  return { user, loading, login, logout }
}
```

### State Management (Zustand)

```typescript
// store/authStore.ts
import create from 'zustand'

interface AuthState {
  user: User | null
  token: string | null
  setUser: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, token: null })
}))
```

---

## Troubleshooting

### Erro de CORS

Verifique se o backend permite a origem do frontend no CORS.

### Build falha

```bash
# Limpar cache
rm -rf node_modules dist
npm install
npm run build
```

### Tipos TypeScript

```bash
# Reinstalar types
npm install --save-dev @types/react @types/react-dom
```

---

## Recursos

- [React Docs](https://react.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com/)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)

---

<div align="center">

[⬆ Voltar ao topo](#frontend---cfo-x-saas-)

</div>
