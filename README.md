# CFO-X SaaS

Sistema completo de gestão empresarial para CFOs, contadores e gestores. Plataforma SaaS moderna com gerenciamento de colaboradores, ponto, folha de pagamento, documentos, tarefas, OKRs e muito mais.

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

---

## Quick Start

**Rode tudo com 1 único comando:**

### Windows:
```bash
start.bat
```

### Linux/Mac:
```bash
chmod +x start.sh && ./start.sh
```

**O que os scripts fazem:**
1. Verificam se Docker está instalado e rodando
2. Sobem todos os containers (PostgreSQL, Redis, Backend, Frontend)
3. Aguardam o banco de dados ficar pronto
4. Inicializam o schema do banco de dados
5. Criam o usuário admin padrão

**Isso configura automaticamente:**
- OK Banco de dados PostgreSQL 16
- OK Cache Redis 7
- OK Backend FastAPI rodando na porta 8000
- OK Frontend React + Vite rodando na porta 5173
- OK Usuário admin criado

**Acesse:**
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/api/docs
- **Redoc**: http://localhost:8000/api/redoc

**Login:** `admin@cfohub.com` / `admin123`

---

## Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## Sobre o Projeto

O **CFO-X SaaS** é uma plataforma completa de gestão empresarial que centraliza todas as operações de RH, financeiro e gestão em um único lugar. Desenvolvido para atender escritórios de contabilidade e departamentos financeiros de empresas de todos os tamanhos.

### Principais Objetivos:
- OK Centralizar gestão de colaboradores e empresas
- OK Automatizar controle de ponto e folha de pagamento
- OK Facilitar comunicação interna (chat, mural, notificações)
- OK Gerenciar documentos de forma segura
- OK Acompanhar OKRs e metas empresariais
- OK Integrar com sistemas externos (OMIE, etc)

---

## Funcionalidades

### Gestão de Pessoas
- Cadastro completo de colaboradores
- Gestão de cargos e setores
- Avaliações de desempenho
- Feedbacks 360°
- Benefícios corporativos

### Controle de Ponto
- Registro de ponto online
- Gestão de atestados e afastamentos
- Solicitações de férias e ajustes
- Relatórios de frequência
- Banco de horas

### Financeiro
- Folha de pagamento automatizada
- Gestão de clientes e empresas
- Controle de documentos
- Integração com OMIE (em desenvolvimento)

### Produtividade
- Gestão de tarefas e projetos
- OKRs e metas
- Lembretes automáticos
- Dashboard personalizável
- Relatórios e analytics

### Comunicação
- Chat interno em tempo real
- Mural de avisos
- Notificações push
- Sistema de aprovações

---

## Arquitetura

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄────────┤   FastAPI API   │◄────────┤   PostgreSQL    │
│   (TypeScript)  │  HTTPS  │    (Python)     │         │    Database     │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │                            │
        │                           │                            │
        ▼                           ▼                            ▼
   Azure Static              Azure App Service            Azure PostgreSQL
   Web Apps                  (Python Runtime)             Flexible Server
```

### Stack Completo:
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + SQLAlchemy + Pydantic
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Deploy**: Azure (App Service + Static Web Apps)
- **Dev**: Docker Compose

---

## Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para Python
- **Pydantic** - Validação de dados
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e sessões
- **JWT** - Autenticação segura
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **React Router** - Navegação
- **Zustand** - State management
- **Tailwind CSS** - Framework CSS
- **Lucide React** - Ícones
- **Recharts** - Gráficos

### DevOps
- **Docker** - Containerização (dev local)
- **Azure App Service** - Hosting backend
- **Azure Static Web Apps** - Hosting frontend
- **GitHub Actions** - CI/CD
- **Azure PostgreSQL** - Database gerenciado
- **Azure Redis Cache** - Cache gerenciado

---

## Pré-requisitos

### Para Desenvolvimento Local:
- **Docker Desktop** 4.0+ e Docker Compose
- **Git** 2.30+
- **Node.js** 18+ (opcional, se quiser rodar frontend fora do Docker)
- **Python** 3.11+ (opcional, se quiser rodar backend fora do Docker)

### Para Deploy:
- Conta **Azure** ativa
- **Azure CLI** instalado
- **GitHub** account para CI/CD

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/cfo-x-saas.git
cd cfo-x-saas
```

### 2. Configure variáveis de ambiente

```bash
# Copie os arquivos de exemplo
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edite os arquivos .env com suas configurações
# Gere uma SECRET_KEY segura:
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### 3. Suba o ambiente com Docker

```bash
# Inicia todos os serviços (backend, frontend, database, redis)
docker-compose up -d

# Verifica se está rodando
docker-compose ps

# Inicializa o banco de dados
docker-compose exec backend python init_db.py
```

### 3. Acesse a aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Database**: localhost:5432

### Credenciais padrão (dev):
- **Email**: admin@cfohub.com
- **Senha**: admin123 (altere após primeiro login)

---

## Desenvolvimento

### Estrutura de Branches

```
main       → Produção (Azure auto-deploy)
staging    → Homologação (Azure auto-deploy)
develop    → Desenvolvimento (local)
```

### Workflow

```bash
# 1. Crie uma feature branch
git checkout develop
git checkout -b feature/nome-da-feature

# 2. Desenvolva e teste localmente
docker-compose up -d
# faça suas alterações...

# 3. Commit e push
git add .
git commit -m "feat: descrição da feature"
git push origin feature/nome-da-feature

# 4. Abra um PR para develop
# 5. Após aprovação, merge para staging
# 6. Teste em staging
# 7. Após validação, merge para main
```

### Comandos úteis

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild após mudanças
docker-compose up -d --build

# Rodar testes
docker-compose exec backend pytest
cd frontend && npm test

# Acessar shell do container
docker-compose exec backend bash
docker-compose exec db psql -U user -d cfohub_dev

# Parar tudo
docker-compose down

# Limpar volumes (APAGA DADOS)
docker-compose down -v
```

Para mais comandos, veja [COMANDOS.md](COMANDOS.md)

### Troubleshooting

**Docker não funciona:**
- Instale o [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Certifique-se que o Docker está rodando

**Porta ocupada:**
- Mude as portas no `docker-compose.yml` se necessário
- Ou encerre o processo usando a porta: `netstat -ano | findstr :5173`

**Erro no banco de dados:**
- Execute `docker-compose down -v` (limpa volumes)
- Execute novamente `start.bat` ou `start.sh`

**Frontend não carrega:**
- Verifique se está acessando `http://localhost:5173` (não https)
- Limpe cache do browser ou use modo anônimo
- Verifique logs: `docker-compose logs -f frontend`

**Erro de autenticação:**
- Verifique se o banco foi inicializado: `docker-compose exec backend python init_db.py`
- Credenciais padrão: `admin@cfohub.com` / `admin123`

---

## Deploy

### Configuração por Ambiente

Todos os arquivos de configuração (docker-compose.yml, .env.example, Dockerfiles) estão presentes em **todas as branches**. O que muda entre ambientes são apenas os **valores das variáveis de ambiente**:

| Ambiente | Branch | Infraestrutura | Configuração |
|----------|--------|----------------|--------------|
| **Development** | `develop` | Docker Compose local | Arquivo `.env` local (git ignored) |
| **Staging** | `staging` | Azure App Service | Azure Portal → Application Settings |
| **Production** | `main` | Azure App Service | Azure Portal → Application Settings |

**Fluxo de Trabalho:**
```
1. Desenvolve em develop → testa local com Docker
2. PR de develop → staging → Azure faz deploy automático
3. Testa em staging
4. PR de staging → main → Azure faz deploy automático em produção
```

**Vantagens:**
- OK Mesmos arquivos em todas branches = fácil fazer merge
- OK Configurações centralizadas no Azure = mais seguro
- OK Docker só para dev = ambiente local consistente
- OK Secrets não vazam no Git

### Deploy no Azure

Deploy está configurado com auto-deploy para staging e production:

### Configuração:

1. **Backend**: Azure App Service (Python 3.11)
2. **Frontend**: Azure Static Web Apps (Node 18)
3. **Database**: Azure PostgreSQL Flexible Server
4. **Cache**: Azure Redis Cache

Para instruções detalhadas, consulte [DEPLOYMENT.md](DEPLOYMENT.md)

---

## Estrutura do Projeto

```
cfo-x-saas/
├── backend/                # API FastAPI
│   ├── app/
│   │   ├── models/        # Modelos SQLAlchemy
│   │   ├── routes/        # Endpoints da API
│   │   ├── schemas/       # Schemas Pydantic
│   │   ├── middleware/    # Middlewares
│   │   ├── auth.py        # Autenticação JWT
│   │   ├── config.py      # Configurações
│   │   ├── database.py    # Setup do banco
│   │   └── main.py        # Entry point
│   ├── init_db.py         # Script de inicialização
│   ├── requirements.txt   # Dependências Python
│   └── Dockerfile         # Docker (dev local)
│
├── frontend/              # App React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── contexts/      # Context API
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API services
│   │   ├── store/         # Zustand stores
│   │   ├── types/         # TypeScript types
│   │   ├── utils/         # Utilitários
│   │   ├── App.tsx        # App principal
│   │   └── main.tsx       # Entry point
│   ├── public/            # Assets estáticos
│   ├── package.json       # Dependências Node
│   ├── vite.config.ts     # Config Vite
│   └── tailwind.config.js # Config Tailwind
│
├── .env.example           # Template variáveis de ambiente
├── docker-compose.yml     # Docker Compose (dev)
├── DEPLOYMENT.md          # Guia de deploy
├── AMBIENTE-RESUMO.md     # Resumo ambientes
├── COMANDOS.md            # Comandos úteis
├── SECURITY.md            # Política de segurança
└── README.md              # Este arquivo
```

---

## Documentação Adicional

- [Backend README](backend/README.md) - Documentação da API
- [Frontend README](frontend/README.md) - Documentação do app
- [Guia de Deploy](DEPLOYMENT.md) - Deploy no Azure
- [Comandos Úteis](COMANDOS.md) - Comandos do dia a dia
- [Segurança](SECURITY.md) - Políticas de segurança

---

### Padrões de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção
