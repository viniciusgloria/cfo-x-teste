# Backend - CFO-X SaaS API

API REST em FastAPI para o sistema CFO-X SaaS. Backend completo com autenticação JWT, gerenciamento de empresas, colaboradores, ponto, folha de pagamento e muito mais.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-red.svg)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)

---

## Índice

- [Sobre](#sobre)
- [Tecnologias](#tecnologias)
- [Estrutura](#estrutura)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Autenticação](#autenticação)
- [Models](#models)
- [Testes](#testes)
- [Deploy](#deploy)

---

## Sobre

API REST construída com FastAPI que fornece todos os endpoints necessários para o funcionamento do CFO-X SaaS. Inclui autenticação JWT, CRUD completo para todas as entidades, validações robustas com Pydantic e documentação automática.

### Características:
- OK API REST completa e documentada
- OK Autenticação JWT com refresh tokens
- OK Validação de dados com Pydantic
- OK ORM com SQLAlchemy 2.0
- OK Migrations automáticas
- OK Rate limiting e segurança
- OK CORS configurável
- OK Documentação Swagger/OpenAPI automática
- OK Type hints em todo o código

---

## Tecnologias

### Core
- **FastAPI 0.109** - Framework web moderno e rápido
- **Python 3.11+** - Linguagem de programação
- **Uvicorn** - Servidor ASGI de alta performance
- **Pydantic 2.5** - Validação de dados

### Database
- **SQLAlchemy 2.0** - ORM Python
- **PostgreSQL 15** - Banco de dados relacional
- **psycopg2-binary** - Driver PostgreSQL
- **Alembic** - Migrations (futuro)

### Segurança & Auth
- **python-jose** - JWT tokens
- **passlib[bcrypt]** - Hash de senhas
- **bcrypt** - Criptografia
- **python-multipart** - Upload de arquivos
- **slowapi** - Rate limiting

### Utilidades
- **python-dotenv** - Variáveis de ambiente
- **python-dateutil** - Manipulação de datas
- **email-validator** - Validação de emails
- **redis** - Cache e sessões

### Development
- **pytest** - Testes
- **pytest-asyncio** - Testes async
- **httpx** - Cliente HTTP para testes
- **black** - Formatação de código
- **flake8** - Linting

---

## Estrutura

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Entry point da aplicação
│   ├── config.py            # Configurações e settings
│   ├── database.py          # Setup do banco de dados
│   ├── auth.py              # Autenticação JWT
│   ├── dependencies.py      # Dependências injetáveis
│   ├── password_validator.py # Validação de senhas
│   │
│   ├── middleware/
│   │   └── security.py      # Middlewares de segurança
│   │
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py          # Usuários
│   │   ├── empresa.py       # Empresas
│   │   ├── colaborador.py   # Colaboradores
│   │   ├── ponto.py         # Registros de ponto
│   │   ├── folha_pagamento.py
│   │   ├── documento.py
│   │   ├── tarefa.py
│   │   ├── okr.py
│   │   ├── chat.py
│   │   ├── avaliacao.py
│   │   └── ... (outros modelos)
│   │
│   ├── schemas/             # Schemas Pydantic
│   │   ├── __init__.py
│   │   ├── auth.py          # Schemas de autenticação
│   │   ├── user.py
│   │   ├── empresa.py
│   │   ├── colaborador.py
│   │   └── ... (schemas correspondentes)
│   │
│   └── routes/              # Rotas/Endpoints
│       ├── __init__.py
│       ├── auth.py          # Login, refresh, logout
│       ├── users.py         # CRUD usuários
│       ├── empresa.py       # CRUD empresas
│       ├── colaboradores.py # CRUD colaboradores
│       ├── ponto.py         # Gestão de ponto
│       ├── folha.py         # Folha de pagamento
│       ├── documentos.py
│       ├── tarefas.py
│       ├── okrs.py
│       ├── chat.py
│       ├── avaliacoes.py
│       └── ... (outras rotas)
│
├── tests/                   # Testes
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── ...
│
├── init_db.py              # Script de inicialização do DB
├── requirements.txt        # Dependências Python
├── Dockerfile              # Docker para desenvolvimento
├── .env.example            # Template de variáveis
└── README.md               # Este arquivo
```

---

## Instalação

### Opção 1: Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up -d backend

# Inicializar banco de dados
docker-compose exec backend python init_db.py
```

### Opção 2: Desenvolvimento Local

```bash
# Entrar na pasta backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Copiar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Inicializar banco de dados
python init_db.py

# Rodar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
# Ambiente
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cfohub_dev

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT
SECRET_KEY=sua-chave-secreta-min-32-chars
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

### Gerar SECRET_KEY

```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Uso

### Rodar o servidor

```bash
# Desenvolvimento (com auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Produção
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Acessar

- **API**: http://localhost:8000
- **Documentação Swagger**: http://localhost:8000/docs
- **Documentação ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### Primeiro acesso

Após inicializar o banco (`python init_db.py`), você pode criar um usuário admin:

```python
# No shell Python
from app.database import SessionLocal
from app.models.user import User
from passlib.context import CryptContext

db = SessionLocal()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

admin = User(
    nome="Admin",
    email="admin@example.com",
    senha_hash=pwd_context.hash("admin123"),
    tipo_usuario="admin",
    is_active=True
)
db.add(admin)
db.commit()
```

---

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/login` | Login e geração de tokens | ❌ |
| POST | `/api/auth/refresh` | Renovar access token | ❌ |
| POST | `/api/auth/logout` | Logout (invalidar refresh token) | ✅ |
| GET | `/api/auth/me` | Obter usuário logado | ✅ |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/users` | Listar usuários | ✅ |
| POST | `/api/users` | Criar usuário | ✅ |
| GET | `/api/users/{id}` | Obter usuário | ✅ |
| PUT | `/api/users/{id}` | Atualizar usuário | ✅ |
| DELETE | `/api/users/{id}` | Deletar usuário | ✅ |

### Empresas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/empresas` | Listar empresas | ✅ |
| POST | `/api/empresas` | Criar empresa | ✅ |
| GET | `/api/empresas/{id}` | Obter empresa | ✅ |
| PUT | `/api/empresas/{id}` | Atualizar empresa | ✅ |
| DELETE | `/api/empresas/{id}` | Deletar empresa | ✅ |

### Colaboradores

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/colaboradores` | Listar colaboradores | ✅ |
| POST | `/api/colaboradores` | Criar colaborador | ✅ |
| GET | `/api/colaboradores/{id}` | Obter colaborador | ✅ |
| PUT | `/api/colaboradores/{id}` | Atualizar colaborador | ✅ |
| DELETE | `/api/colaboradores/{id}` | Deletar colaborador | ✅ |

### Ponto

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/api/ponto/registrar` | Registrar ponto | ✅ |
| GET | `/api/ponto/hoje` | Pontos de hoje | ✅ |
| GET | `/api/ponto/mes` | Pontos do mês | ✅ |
| POST | `/api/ponto/solicitacao-ajuste` | Solicitar ajuste | ✅ |

### Folha de Pagamento

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/api/folha` | Listar folhas | ✅ |
| POST | `/api/folha/gerar` | Gerar folha | ✅ |
| GET | `/api/folha/{id}` | Obter folha | ✅ |
| PUT | `/api/folha/{id}` | Atualizar folha | ✅ |

_E muitos outros endpoints... Veja a documentação completa em `/docs`_

---

## Autenticação

### JWT Flow

```
1. Login → POST /auth/login
   {
     "email": "user@example.com",
     "password": "senha123"
   }
   
   Response:
   {
     "access_token": "eyJ...",
     "refresh_token": "eyJ...",
     "token_type": "bearer"
   }

2. Usar access_token nas requisições
   Authorization: Bearer eyJ...

3. Quando expirar, renovar com refresh_token
   POST /auth/refresh
   {
     "refresh_token": "eyJ..."
   }
```

### Headers

Todas as rotas protegidas precisam do header:

```
Authorization: Bearer <access_token>
```

### Permissões

- **Admin**: Acesso total
- **Gestor**: Gerencia sua empresa
- **Colaborador**: Acesso limitado aos seus dados

---

## Models

### Principais Entidades

#### User
```python
- id: int (PK)
- nome: str
- email: str (unique)
- senha_hash: str
- tipo_usuario: enum (admin|gestor|colaborador)
- is_active: bool
- created_at: datetime
```

#### Empresa
```python
- id: int (PK)
- razao_social: str
- cnpj: str (unique)
- nome_fantasia: str
- created_at: datetime
```

#### Colaborador
```python
- id: int (PK)
- nome: str
- cpf: str (unique)
- email: str
- cargo_id: int (FK)
- empresa_id: int (FK)
- data_admissao: date
- salario: decimal
```

#### RegistroPonto
```python
- id: int (PK)
- colaborador_id: int (FK)
- data: date
- entrada: time
- saida: time
- tipo: enum (normal|extra|falta)
```

_Veja todos os models em `app/models/`_

---

## Testes

```bash
# Rodar todos os testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Teste específico
pytest tests/test_auth.py -v

# Ver cobertura
open htmlcov/index.html
```

### Estrutura de Testes

```python
# tests/test_auth.py
def test_login(client):
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "test123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

## Deploy

### Azure App Service

#### Configurações:
- **Runtime**: Python 3.11
- **Startup Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port 8000`
- **Path**: `/backend` (se monorepo)

#### Application Settings (Portal Azure):
```
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@azure-postgres.database.azure.com:5432/cfohub
REDIS_URL=redis://azure-redis.redis.cache.windows.net:6380/0?ssl=True
SECRET_KEY=<secret-key-64-chars>
FRONTEND_URL=https://cfohub.azurestaticapps.net
DEBUG=false
LOG_LEVEL=WARNING
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
# Formatar código
black app/

# Lint
flake8 app/

# Type check
mypy app/

# Ver rotas
uvicorn app.main:app --reload &
curl http://localhost:8000/openapi.json | jq '.paths | keys'

# Shell interativo
python
>>> from app.database import SessionLocal
>>> from app.models.user import User
>>> db = SessionLocal()
>>> db.query(User).all()

# Gerar requirements.txt
pip freeze > requirements.txt
```

---

## Padrões de Código

### Nomenclatura
- **Arquivos**: snake_case.py
- **Classes**: PascalCase
- **Funções**: snake_case
- **Constantes**: UPPER_CASE

### Type Hints
```python
from typing import List, Optional
from app.schemas.user import UserCreate, UserResponse

async def create_user(
    user: UserCreate,
    db: Session
) -> UserResponse:
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
        User ou None se não encontrado
    """
    return db.query(User).filter(User.email == email).first()
```

---

## Troubleshooting

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps db

# Verificar logs
docker-compose logs db

# Testar conexão
psql postgresql://user:password@localhost:5432/cfohub_dev
```

### Erro de importação

```bash
# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

### Erro de migração

```bash
# Resetar banco (CUIDADO: apaga tudo)
docker-compose down -v
docker-compose up -d db
python init_db.py
```

---

## Recursos

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/en/20/)
- [Pydantic Docs](https://docs.pydantic.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

<div align="center">

[⬆ Voltar ao topo](#backend---cfo-x-saas-api-)

</div>
