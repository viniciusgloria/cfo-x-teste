<div align="center">

# Backend - CFO-X SaaS API

### API REST em FastAPI

Backend completo com autenticação JWT, CRUD para todas entidades, validações Pydantic e documentação automática.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-red?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[Quick Start](#-quick-start) • [Endpoints](#-api-endpoints) • [Autenticação](#-autenticação) • [Deploy](#-deploy)

</div>

---

## Quick Start

### Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d backend

# Inicializar banco de dados
docker-compose exec backend python init_db.py
```

Acesse:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Desenvolvimento Local

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar (Windows)
venv\Scripts\activate
# Ativar (Linux/macOS)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# Edite DATABASE_URL e SECRET_KEY

# Inicializar DB
python init_db.py

# Rodar servidor
uvicorn app.main:app --reload
```

---

## Sobre

API REST construída com FastAPI fornecendo todos os endpoints para o CFO-X SaaS. Autenticação JWT, validações robustas, documentação automática e type hints em todo o código.

### Características

-  **FastAPI** - Framework async de alta performance
-  **JWT Auth** - Access & refresh tokens
-  **Validação** - Pydantic schemas com type safety
-  **ORM Moderno** - SQLAlchemy 2.0 com async
-  **Auto Docs** - Swagger UI e ReDoc inclusos
-  **Segurança** - Rate limiting, CORS, hash bcrypt
-  **Performance** - Async/await, connection pooling
-  **Testável** - pytest com fixtures e coverage

---

##  Tecnologias

### Core Stack

```python
FastAPI 0.109+         → Framework web assíncrono
Python 3.11+           → Type hints, async/await
Uvicorn               → Servidor ASGI ultra-rápido
Pydantic 2.5          → Validação de dados
```

### Database & ORM

```python
SQLAlchemy 2.0        → ORM com suporte async
PostgreSQL 16         → Banco de dados relacional
psycopg2-binary       → Driver PostgreSQL
Alembic               → Migrations (futuro)
```

### Segurança

```python
python-jose[cryptography]  → JWT tokens
passlib[bcrypt]            → Hash de senhas bcrypt
python-multipart           → Upload de arquivos
slowapi                    → Rate limiting
```

### Utilidades

```python
python-dotenv         → Variáveis de ambiente
python-dateutil       → Manipulação de datas
email-validator       → Validação de emails
redis                 → Cache e sessões
```

### Development

```python
pytest               → Framework de testes
pytest-asyncio       → Testes async
httpx                → Cliente HTTP
black                → Code formatter
flake8               → Linter
```

---

## Instalação

### Pré-requisitos

- Python 3.11+
- PostgreSQL 15+ (ou Docker)
- Redis 7+ (opcional, para cache)

### Configuração

```bash
# 1. Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# 2. Instalar dependências
pip install -r requirements.txt

# 3. Configurar variáveis
cp .env.example .env
```

Edite `.env`:

```env
# Ambiente
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cfohub_dev

# Redis (opcional)
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=<generate-with-secrets-module>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
FRONTEND_URL=http://localhost:5173

# API
API_PREFIX=/api
DEBUG=true
LOG_LEVEL=DEBUG
```

Gere uma `SECRET_KEY` segura:

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Inicializar Banco

```bash
python init_db.py
```

Isso cria:
- Todas as tabelas
- Usuário admin padrão (`admin@cfohub.com` / `admin123`)

---

## Desenvolvimento

### Rodar servidor

```bash
# Desenvolvimento (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção (múltiplos workers)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Estrutura de Pastas

```
app/
├── 📄 main.py              # Entry point FastAPI
├── 📄 config.py            # Settings (Pydantic BaseSettings)
├── 📄 database.py          # DB engine e session
├── 📄 auth.py              # JWT auth utils
├── 📄 dependencies.py      # Dependency injection
├── 📄 password_validator.py
│
├── 📂 middleware/
│   └── security.py         # Rate limiting, CORS
│
├── 📂 models/              # SQLAlchemy models
│   ├── user.py
│   ├── empresa.py
│   ├── colaborador.py
│   ├── ponto.py
│   ├── folha_pagamento.py
│   ├── documento.py
│   ├── tarefa.py
│   ├── okr.py
│   └── ... (20+ models)
│
├── 📂 schemas/             # Pydantic schemas
│   ├── auth.py
│   ├── user.py
│   ├── colaborador.py
│   └── ... (schemas correspondentes)
│
└── 📂 routes/              # API endpoints
    ├── auth.py             # /auth/*
    ├── users.py            # /users/*
    ├── colaboradores.py    # /colaboradores/*
    ├── ponto.py            # /ponto/*
    ├── folha.py            # /folha/*
    └── ... (15+ routers)
```

---

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| `POST` | `/api/auth/login` | Login com email/senha | ✕ |
| `POST` | `/api/auth/refresh` | Renovar access token | ✕ |
| `POST` | `/api/auth/logout` | Invalidar refresh token | ✓ |
| `GET` | `/api/auth/me` | Dados do usuário logado | ✓ |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| `GET` | `/api/users` | Listar usuários | ✓ |
| `POST` | `/api/users` | Criar usuário | ✓ |
| `GET` | `/api/users/{id}` | Buscar por ID | ✓ |
| `PUT` | `/api/users/{id}` | Atualizar usuário | ✓ |
| `DELETE` | `/api/users/{id}` | Deletar usuário | ✓ |

### Empresas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| `GET` | `/api/empresas` | Listar empresas | ✓ |
| `POST` | `/api/empresas` | Criar empresa | ✓ |
| `GET` | `/api/empresas/{id}` | Buscar por ID | ✓ |
| `PUT` | `/api/empresas/{id}` | Atualizar empresa | ✓ |
| `DELETE` | `/api/empresas/{id}` | Deletar empresa | ✓ |

### Colaboradores

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| `GET` | `/api/colaboradores` | Listar (com filtros) | ✓ |
| `POST` | `/api/colaboradores` | Criar colaborador | ✓ |
| `GET` | `/api/colaboradores/{id}` | Buscar por ID | ✓ |
| `PUT` | `/api/colaboradores/{id}` | Atualizar | ✓ |
| `DELETE` | `/api/colaboradores/{id}` | Deletar | ✓ |

### Ponto

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| `POST` | `/api/ponto/registrar` | Registrar entrada/saída | ✓ |
| `GET` | `/api/ponto/hoje` | Pontos de hoje | ✓ |
| `GET` | `/api/ponto/mes` | Pontos do mês atual | ✓ |
| `POST` | `/api/ponto/solicitacao` | Solicitar ajuste | ✓ |
| `PUT` | `/api/ponto/{id}/aprovar` | Aprovar solicitação | ✓ |

### Folha de Pagamento

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|:----:|
| `GET` | `/api/folha` | Listar folhas | ✓ |
| `POST` | `/api/folha/gerar` | Gerar nova folha | ✓ |
| `GET` | `/api/folha/{id}` | Detalhes da folha | ✓ |
| `PUT` | `/api/folha/{id}` | Editar folha | ✓ |
| `GET` | `/api/folha/{id}/pdf` | Export PDF | ✓ |

**Documentação completa:** http://localhost:8000/docs

---

## Autenticação

### JWT Flow

```
┌─────────┐                                    ┌─────────┐
│ Cliente │                                    │   API   │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  1. POST /auth/login                         │
     │  { email, password }                         │
     │ ──────────────────────────────────────────>  │
     │                                              │
     │  2. Valida credenciais                       │
     │     Gera access_token (30min)                │
     │     Gera refresh_token (7 dias)              │
     │  <────────────────────────────────────────── │
     │  { access_token, refresh_token }             │
     │                                              │
     │  3. Requisições autenticadas                 │
     │  Authorization: Bearer <access_token>        │
     │ ──────────────────────────────────────────>  │
     │                                              │
     │  4. Quando access_token expira               │
     │  POST /auth/refresh                          │
     │  { refresh_token }                           │
     │ ──────────────────────────────────────────>  │
     │                                              │
     │  5. Novo access_token                        │
     │  <────────────────────────────────────────── │
     │  { access_token }                            │
     │                                              │
```

### Exemplo de Uso

```python
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "senha123"
}

# Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}

# Usar em requisições
GET /api/users
Authorization: Bearer <access_token>

# Refresh quando expirar
POST /api/auth/refresh
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Permissões

| Tipo | Acesso |
|------|--------|
| **admin** | Acesso total ao sistema |
| **gestor** | Gerencia sua empresa e colaboradores |
| **colaborador** | Acesso limitado aos próprios dados |

---

## Models

### Principais Entidades

```python
# User
- id: int (PK)
- nome: str
- email: str (unique)
- senha_hash: str
- tipo_usuario: enum (admin|gestor|colaborador)
- is_active: bool
- created_at: datetime

# Empresa
- id: int (PK)
- razao_social: str
- cnpj: str (unique, 14 dígitos)
- nome_fantasia: str
- email: str
- telefone: str
- created_at: datetime

# Colaborador
- id: int (PK)
- nome: str
- cpf: str (unique, 11 dígitos)
- email: str
- cargo_id: int (FK → Cargo)
- empresa_id: int (FK → Empresa)
- data_admissao: date
- salario: decimal
- is_active: bool

# RegistroPonto
- id: int (PK)
- colaborador_id: int (FK → Colaborador)
- data: date
- entrada: time
- saida: time
- tipo: enum (normal|extra|falta|atestado)
- observacao: str

# FolhaPagamento
- id: int (PK)
- empresa_id: int (FK → Empresa)
- mes: int (1-12)
- ano: int
- status: enum (rascunho|aprovada|paga)
- total_bruto: decimal
- total_liquido: decimal
```

Veja todos os models em `app/models/`

---

## Testes

```bash
# Rodar todos os testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Teste específico
pytest tests/test_auth.py -v

# Ver relatório de coverage
open htmlcov/index.html
```

### Exemplo de Teste

```python
# tests/test_auth.py
def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "test123"
    })
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "wrong@example.com",
        "password": "wrong"
    })
    
    assert response.status_code == 401
```

---

## Deploy

### Azure App Service

#### Configuração

```yaml
Runtime: Python 3.11
Startup Command: python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
Path: /backend (monorepo)
```

#### Application Settings

```env
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@azure-postgres.database.azure.com/cfohub
REDIS_URL=redis://azure-redis.redis.cache.windows.net:6380/0?ssl=True
SECRET_KEY=<64-char-secret-different-from-dev>
FRONTEND_URL=https://cfohub.azurestaticapps.net
DEBUG=false
LOG_LEVEL=WARNING
CORS_ORIGINS=https://cfohub.azurestaticapps.net
```

### Docker (Desenvolvimento)

```bash
# Build
docker build -t cfohub-backend .

# Run
docker run -p 8000:8000 --env-file .env cfohub-backend
```

---

## Comandos Úteis

```bash
# Code quality
black app/                    # Formatar código
flake8 app/                   # Linting
mypy app/                     # Type checking

# Database
python init_db.py             # Inicializar DB
python -c "from app.database import engine; print(engine.url)"

# Shell interativo
python
>>> from app.database import SessionLocal
>>> from app.models.user import User
>>> db = SessionLocal()
>>> db.query(User).all()

# Gerar requirements
pip freeze > requirements.txt

# Listar rotas
python -c "from app.main import app; print([route.path for route in app.routes])"
```

---

## Padrões de Código

### Type Hints

```python
from typing import List, Optional
from app.schemas.user import UserCreate, UserResponse

async def create_user(
    user: UserCreate,
    db: Session
) -> UserResponse:
    """Cria um novo usuário."""
    # implementação
    pass
```

### Docstrings

```python
def get_user_by_email(email: str, db: Session) -> Optional[User]:
    """
    Busca usuário por email.
    
    Args:
        email: Email do usuário
        db: Sessão do banco de dados
        
    Returns:
        User se encontrado, None caso contrário
        
    Example:
        >>> user = get_user_by_email("admin@example.com", db)
    """
    return db.query(User).filter(User.email == email).first()
```

### Nomenclatura

```python
# Arquivos: snake_case.py
colaborador.py
folha_pagamento.py

# Classes: PascalCase
class Colaborador(Base): ...
class FolhaPagamento(Base): ...

# Funções: snake_case
def get_colaborador_by_cpf(): ...
def calculate_folha(): ...

# Constantes: UPPER_CASE
MAX_FILE_SIZE = 5 * 1024 * 1024
DEFAULT_PAGE_SIZE = 50
```

---

## Troubleshooting

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps db

# Ver logs
docker-compose logs db

# Testar conexão
psql postgresql://user:password@localhost:5432/cfohub_dev
```

### Erro de importação

```bash
# Reinstalar dependências
pip install -r requirements.txt --force-reinstall

# Verificar ambiente virtual ativo
which python  # Linux/macOS
where python  # Windows
```

### Erro ao inicializar DB

```bash
# Resetar banco (⚠ APAGA TUDO)
docker-compose down -v
docker-compose up -d db
# Aguardar ~10s
python init_db.py
```

### Porta 8000 ocupada

```bash
# Ver processo
lsof -i :8000                # Linux/macOS
netstat -ano | findstr :8000 # Windows

# Matar processo
kill -9 <PID>               # Linux/macOS
taskkill /PID <PID> /F      # Windows
```

---

## Recursos

- [FastAPI Docs](https://fastapi.tiangolo.com/) - Framework oficial
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/en/20/) - ORM 2.0
- [Pydantic Docs](https://docs.pydantic.dev/latest/) - Validação
- [PostgreSQL Docs](https://www.postgresql.org/docs/) - Database

