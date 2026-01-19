# CFO X SaaS

**Versão:** 1.0 (Beta)
**Status:** Em Desenvolvimento

## Sobre o Projeto

CFO X SaaS é uma plataforma SaaS moderna e completa de gestão empresarial desenvolvida para CFOs, contadores e gestores de e-commerce. O sistema fornece ferramentas integradas para gerenciamento de colaboradores, ponto, folha de pagamento, documentos, tarefas, OKRs, relatórios e análises de vendas em tempo real.

**Público-alvo:** Pequenas e médias empresas (PMEs) de e-commerce que necessitam de controle financeiro, RH e análise de vendas integrados.

**Modelo de Negócio:** SaaS com subscrição por empresa (multi-tenant).

## Arquitetura

O projeto segue uma arquitetura de microserviços com separação clara entre frontend e backend:

- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** FastAPI + Python + PostgreSQL + Redis
- **Containerização:** Docker + Docker Compose

```
cfo-x-saas/
├── backend/          # API REST em FastAPI
├── frontend/         # Interface React
├── docker-compose.yml
└── PRD.md           # Documentação completa do produto
```

## Quick Start

### Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento frontend)
- Python 3.11+ (para desenvolvimento backend)

### Executando com Docker Compose

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd cfo-x-saas
```

2. Inicie todos os serviços:
```bash
docker-compose up -d
```

3. Acesse:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **Docs API:** http://localhost:8000/docs
- **PgAdmin:** http://localhost:5050 (admin@admin.com / admin)

### Desenvolvimento Local

#### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Tecnologias Principais

### Backend
- **FastAPI** - Framework web moderno e de alta performance
- **SQLAlchemy** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e rate limiting
- **JWT** - Autenticação e autorização
- **Pydantic** - Validação de dados

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **TailwindCSS** - Framework CSS utility-first
- **Zustand** - Gerenciamento de estado
- **React Router** - Roteamento
- **Recharts** - Gráficos e visualizações

## Funcionalidades Principais

- ✓ **Gestão de Colaboradores** - Cadastro, edição e controle de colaboradores
- ✓ **Ponto Eletrônico** - Registro e controle de jornada de trabalho
- ✓ **Folha de Pagamento** - Cálculo e gestão de folha
- ✓ **Documentos** - Upload, organização e compartilhamento
- ✓ **Tarefas e OKRs** - Gestão de tarefas e objetivos
- ✓ **Chat Interno** - Comunicação entre colaboradores
- ✓ **Notificações** - Sistema de alertas e lembretes
- ✓ **Dashboard Analytics** - Visualização de métricas e KPIs
- ✓ **Multi-tenant** - Suporte para múltiplas empresas
- ✓ **RBAC** - Controle de acesso baseado em funções

## Segurança

- Autenticação JWT com refresh tokens
- Criptografia de senhas com bcrypt
- Rate limiting para proteção contra ataques
- Validação de entrada de dados
- CORS configurado
- Headers de segurança HTTP

## Documentação

- **Backend:** [backend/README.md](backend/README.md)
- **Frontend:** [frontend/README.md](frontend/README.md)
- **API Docs:** http://localhost:8000/docs (quando rodando)

## Contribuindo

Para contribuir com o projeto:

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## Variáveis de Ambiente

Crie arquivos `.env` nas pastas backend e frontend conforme necessário:

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/cfohub_dev
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```
