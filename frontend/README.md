# Frontend - CFO Hub Interface

Interface web construída com React 18, TypeScript, Tailwind CSS e Zustand.

---

## Arquitetura

### Stack Tecnológico

- **Framework UI:** React 18.2
- **Linguagem:** TypeScript 5.2
- **Build Tool:** Vite 7.3
- **Estilização:** Tailwind CSS 3.3
- **State Management:** Zustand 4.4
- **Routing:** React Router 6
- **Ícones:** Lucide React
- **Formulários:** React Hook Form (futuro)

### Estrutura de Pastas

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Router principal
├── index.css                 # Estilos globais + Tailwind
│
├── components/               # 50+ componentes reutilizáveis
│   ├── layout/
│   │   ├── Sidebar.tsx       # Menu lateral
│   │   ├── Header.tsx        # Cabeçalho com user menu
│   │   └── Layout.tsx        # Layout wrapper
│   │
│   ├── ui/                   # Componentes base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   │
│   ├── TarefaCard.tsx        # Card de tarefa
│   ├── KanbanBoard.tsx       # Quadro Kanban
│   ├── CalendarView.tsx      # Calendário
│   ├── GanttView.tsx         # Gráfico Gantt
│   ├── PostCard.tsx          # Post do mural
│   ├── NotificationPanel.tsx # Painel de notificações
│   └── ...                   # 40+ outros componentes
│
├── pages/                    # 30+ páginas do sistema
│   ├── Dashboard.tsx         # Dashboard principal
│   ├── Login.tsx             # Tela de login
│   ├── CadastroUsuario.tsx   # Cadastro de usuários
│   │
│   ├── Ponto.tsx             # Ponto eletrônico
│   ├── Colaboradores.tsx     # Lista de colaboradores
│   ├── Tarefas.tsx           # Gestão de tarefas
│   ├── Calendario.tsx        # Calendário geral
│   ├── OKRs.tsx              # OKRs
│   ├── Solicitacoes.tsx      # Solicitações
│   ├── Mural.tsx             # Mural social
│   ├── Chat.tsx              # Chat interno
│   ├── Clientes.tsx          # CRM
│   ├── Configuracoes.tsx     # Configurações
│   └── ...                   # 20+ outras páginas
│
├── store/                    # 28 stores Zustand
│   ├── authStore.ts          # Autenticação (login, tokens)
│   ├── userStore.ts          # Dados do usuário
│   ├── pontoStore.ts         # Registros de ponto
│   ├── tarefaStore.ts        # Tarefas
│   ├── okrStore.ts           # OKRs
│   ├── muralStore.ts         # Posts do mural
│   ├── notificationStore.ts  # Notificações
│   └── ...                   # 21 outros stores
│
├── hooks/                    # Custom hooks
│   ├── useAuth.ts            # Hook de autenticação
│   ├── useDebounce.ts        # Debounce para inputs
│   ├── usePageTitle.ts       # Atualiza título da página
│   └── useAttachmentUploader.ts
│
├── utils/                    # Utilities e helpers
│   ├── api.ts                # Cliente HTTP (fetch wrapper)
│   ├── formatters.ts         # Formatação de data, moeda, etc
│   ├── validators.ts         # Validações
│   └── constants.ts          # Constantes
│
├── types/                    # TypeScript types
│   ├── user.ts
│   ├── tarefa.ts
│   ├── ponto.ts
│   └── ...
│
└── contexts/                 # React Contexts
    └── ToastContext.tsx      # Sistema de notificações toast
```

---

## Páginas Principais (30+)

### Autenticação
- **Login** - Autenticação com email/senha
- **CadastroUsuario** - Criar novo usuário (Admin)

### Dashboard e Início
- **Dashboard** - Visão geral com widgets personalizáveis
- **TarefasDashboard** - Dashboard específico de tarefas

### Gestão de Pessoas
- **Colaboradores** - Lista e gerenciamento de funcionários
- **Ponto** - Registro de ponto eletrônico
- **Solicitacoes** - Férias, atestados, ajustes
- **Avaliacoes** - Avaliações de desempenho
- **Beneficios** - Catálogo de benefícios

### Projetos e Tarefas
- **Tarefas** - Gestão completa com 4 visualizações:
  - Kanban (colunas arrastáveis)
  - Gantt (timeline)
  - Calendário (eventos)
  - Lista (tabela filtrada)
- **OKRs** - Objetivos e Key Results
- **Calendario** - Calendário geral integrado

### Comunicação
- **Mural** - Posts sociais com comentários e reações
- **Chat** - Mensagens em tempo real
- **Notificacoes** - Central de notificações

### CRM e Clientes
- **Clientes** - Cadastro de clientes
- **CadastroCliente** - Formulário de novo cliente
- **FolhaClientes** - BPO - Folha de pagamento para clientes

### Configurações
- **Configuracoes** - Painel de configurações gerais
- **Empresa** - Dados da empresa
- **CargosSetores** - Gerenciar cargos e setores

### Documentos
- **Documentos** - Upload, compartilhamento, pastas

### Automações (Futuro)
- **Automacoes** - Criador de automações no-code

---

## Componentes Principais

### Layout
- **Sidebar** - Menu lateral com navegação hierárquica
- **Header** - Busca global, notificações, menu usuário
- **Layout** - Wrapper com sidebar + header

### UI Base (Tailwind)
- **Button** - Botões com variantes (primary, secondary, danger)
- **Input** - Inputs de texto, email, password
- **Modal** - Modais com overlay
- **Card** - Cards com header/footer
- **Badge** - Tags coloridas (status, categorias)
- **Avatar** - Avatar do usuário com fallback

### Específicos de Negócio
- **TarefaCard** - Card de tarefa com drag & drop
- **KanbanBoard** - Quadro Kanban com colunas customizáveis
- **CalendarView** - Calendário mensal/semanal
- **GanttView** - Gráfico Gantt com dependências
- **PostCard** - Post do mural com comentários/reações
- **NotificationPanel** - Painel lateral de notificações
- **BuscaGlobal** - Busca global multi-entidade
- **DashboardCustomizer** - Editor de widgets do dashboard

---

## State Management (Zustand)

### Padrão de Store

```typescript
// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  
  login: async (email, senha) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });
    
    const data = await response.json();
    
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    
    set({ 
      user: data.user, 
      token: data.access_token,
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
  
  refreshToken: async () => {
    // Implementar refresh token
  }
}));
```

### Stores Disponíveis

- **authStore** - Autenticação e sessão
- **userStore** - Lista de usuários
- **pontoStore** - Registros de ponto
- **tarefaStore** - Tarefas e projetos
- **okrStore** - OKRs
- **solicitacaoStore** - Solicitações
- **muralStore** - Posts sociais
- **chatStore** - Mensagens
- **notificationStore** - Notificações
- **clienteStore** - CRM
- **documentoStore** - Documentos
- **avaliacaoStore** - Avaliações
- **beneficioStore** - Benefícios
- **empresaStore** - Configurações empresa
- **cargoStore** / **setorStore** - Cargos e setores

---

## Estilização (Tailwind CSS)

### Tema Customizado

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        // ... outras cores
      }
    }
  }
}
```

### Padrões de Uso

```tsx
// Botão primário
<button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
  Salvar
</button>

// Card
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold mb-4">Título</h2>
  <p className="text-gray-600">Conteúdo</p>
</div>

// Badge de status
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Ativo
</span>
```

---

## Integração com Backend

### Cliente HTTP

```typescript
// utils/api.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options?.headers
    }
  });
  
  if (response.status === 401) {
    // Token expirado, tentar refresh
    await refreshToken();
    // Retry request
  }
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
}
```

### Exemplo de Uso

```typescript
// store/tarefaStore.ts
import { fetchAPI } from '../utils/api';

export const useTarefaStore = create((set) => ({
  tarefas: [],
  loading: false,
  
  fetchTarefas: async () => {
    set({ loading: true });
    try {
      const tarefas = await fetchAPI('/tarefas');
      set({ tarefas, loading: false });
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
      set({ loading: false });
    }
  },
  
  createTarefa: async (data) => {
    const novaTarefa = await fetchAPI('/tarefas', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    set((state) => ({ 
      tarefas: [...state.tarefas, novaTarefa] 
    }));
  }
}));
```

---

## Como Rodar

### Com Docker (Recomendado)

```bash
cd ..
docker-compose up
```

Frontend estará em: http://localhost:5173

### Manual

**1. Instalar dependências:**
```bash
npm install
```

**2. Configurar variáveis de ambiente:**

Crie `.env`:
```env
VITE_API_URL=http://localhost:8000
```

**3. Rodar em desenvolvimento:**
```bash
npm run dev
```

**4. Build para produção:**
```bash
npm run build
npm run preview  # Testar build localmente
```

---

## Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento (hot reload)
npm run build        # Build de produção
npm run preview      # Preview do build
npm run lint         # Linting com ESLint
npm run type-check   # Verificação de tipos TypeScript
```

---

## Padrões de Código

### Nomenclatura
- **Componentes:** PascalCase (`TarefaCard.tsx`)
- **Hooks:** camelCase com prefixo `use` (`useAuth.ts`)
- **Stores:** camelCase com sufixo `Store` (`authStore.ts`)
- **Utils:** camelCase (`formatters.ts`)

### Estrutura de Componente

```tsx
// components/TarefaCard.tsx
import React from 'react';
import { Tarefa } from '../types/tarefa';

interface TarefaCardProps {
  tarefa: Tarefa;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export function TarefaCard({ tarefa, onEdit, onDelete }: TarefaCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold">{tarefa.titulo}</h3>
      <p className="text-gray-600 text-sm">{tarefa.descricao}</p>
      
      <div className="flex gap-2 mt-4">
        {onEdit && (
          <button onClick={() => onEdit(tarefa.id)}>
            Editar
          </button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(tarefa.id)}>
            Excluir
          </button>
        )}
      </div>
    </div>
  );
}
```

### TypeScript

- **Sempre use tipos explícitos**
- **Evite `any`** - Use `unknown` se necessário
- **Interfaces para props** de componentes
- **Types para dados** de API

```typescript
// types/tarefa.ts
export interface Tarefa {
  id: number;
  titulo: string;
  descricao: string;
  status: TarefaStatus;
  prioridade: TarefaPrioridade;
  responsavel_id: number;
  created_at: string;
}

export enum TarefaStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  EM_PROGRESSO = 'em_progresso',
  CONCLUIDA = 'concluida'
}

export enum TarefaPrioridade {
  BAIXA = 'baixa',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente'
}
```

---

## Boas Práticas

### Performance
- **Lazy loading** de páginas com `React.lazy()`
- **Memoização** com `useMemo` e `useCallback` quando necessário
- **Virtualização** para listas longas (react-window)
- **Code splitting** automático pelo Vite

### Segurança
- **Nunca usar `dangerouslySetInnerHTML`** sem sanitização (DOMPurify)
- **Validar inputs** no cliente E servidor
- **Tokens em localStorage** (não em cookies sem httpOnly por limitação do FastAPI)
- **Nunca usar `eval()` ou `Function()`**

### Acessibilidade
- **Labels** em todos os inputs
- **Botões com textos descritivos**
- **Alt text** em imagens
- **Contraste** adequado de cores
- **Navegação por teclado** funcional

---

## Troubleshooting

**Erro: "Module not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Build falha:**
```bash
# Limpar cache Vite
rm -rf node_modules/.vite
npm run build
```

**Hot reload não funciona:**
```bash
# Verificar se Vite está configurado corretamente
# vite.config.ts deve ter server.hmr = true
```

**CORS errors:**
```bash
# Backend deve ter ALLOWED_ORIGINS configurado
# ALLOWED_ORIGINS=http://localhost:5173
```

---

## Dependências Principais

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.1",
  "zustand": "^4.4.7",
  "tailwindcss": "^3.3.6",
  "typescript": "^5.2.2",
  "vite": "^7.3.0",
  "lucide-react": "^0.294.0"
}
```

---

---

**Versão:** 0.0.0  
**Última atualização:** 7 de Janeiro de 2026
