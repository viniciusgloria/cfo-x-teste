# Backend - CFO Hub API

API REST completa construída com FastAPI, PostgreSQL, Redis e SQLAlchemy.

---

## Arquitetura

### Stack Tecnológico

- **Framework:** FastAPI 0.109.0
- **Database:** PostgreSQL 16 via SQLAlchemy 2.0.25
- **Autenticação:** JWT (python-jose) + bcrypt
- **Validação:** Pydantic 2.5.3
- **Rate Limiting:** slowapi 0.1.9 + Redis 7
- **Migrations:** init_db.py (cria 26 tabelas automaticamente)

### Estrutura de Pastas

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Entry point FastAPI
│   ├── config.py               # Configurações (env vars)
│   ├── database.py             # SQLAlchemy setup
│   ├── dependencies.py         # Injeção de dependências
│   ├── auth.py                 # JWT utilities
│   ├── password_validator.py   # Validação de senha forte
│   │
│   ├── models/                 # 26 modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── user.py             # Usuários (auth)
│   │   ├── refresh_token.py    # Tokens de refresh
│   │   ├── empresa.py          # Configurações da empresa
│   │   ├── colaborador.py
│   │   ├── ponto.py            # Ponto eletrônico
│   │   ├── tarefa.py           # Gestão de tarefas
│   │   ├── okr.py              # OKRs
│   │   ├── solicitacao.py      # Férias, ajustes, etc
│   │   ├── mural.py            # Posts, comments, reactions
│   │   ├── cliente.py          # CRM
│   │   └── ...                 # 15 outros modelos
│   │
│   ├── schemas/                # Pydantic schemas (validação)
│   │   ├── __init__.py
│   │   ├── auth.py             # Login, register, tokens
│   │   ├── user.py             # User CRUD
│   │   ├── refresh_token.py    # Refresh token schemas
│   │   └── ...                 # Schemas para cada modelo
│   │
│   ├── routes/                 # 18 routers REST
│   │   ├── __init__.py
│   │   ├── auth.py             # ✅ COMPLETO: /login, /register, /refresh, /logout
│   │   ├── users.py            # ✅ COMPLETO: CRUD usuários
│   │   ├── ponto.py            # ✅ COMPLETO: Registros de ponto
│   │   ├── colaboradores.py    # ⏳ Estruturado
│   │   ├── tarefas.py          # ⏳ Estruturado
│   │   ├── okrs.py             # ⏳ Estruturado
│   │   └── ...                 # 12 outros routers
│   │
│   └── middleware/
│       └── security.py         # Security headers + request logging
│
├── init_db.py                  # Script setup inicial (cria tabelas + admin)
├── requirements.txt
├── Dockerfile
└── README.md                   # Este arquivo
```

---

## Modelos de Dados (26 Tabelas)

### Autenticação e Usuários
- **users** - Usuários do sistema (5 roles: Admin, Gestor, Colaborador, Cliente, Visitante)
- **refresh_tokens** - Tokens de refresh (rotação automática, 7 dias)

### Gestão de Pessoas
- **colaboradores** - Dados completos de funcionários
- **cargos** - Cargos da empresa
- **setores** - Setores/departamentos
- **empresa** - Configurações gerais da empresa

### Ponto Eletrônico
- **pontos** - Registros de entrada/saída
- **ajustes_ponto** - Solicitações de ajuste de ponto

### Solicitações
- **solicitacoes** - Férias, atestados, documentos, ajustes

### OKRs e Performance
- **okrs** - Objetivos e Key Results
- **feedbacks** - Feedbacks entre colaboradores
- **avaliacoes** - Avaliações de desempenho

### Gestão de Tarefas/Projetos
- **tarefas** - Tarefas com status, prioridade, responsáveis

### Comunicação
- **posts** - Posts do mural social
- **post_comments** - Comentários em posts
- **post_reactions** - Reações (like, etc)
- **chat_messages** - Chat interno
- **notificacoes** - Notificações do sistema

### CRM e Clientes
- **clientes** - Cadastro de clientes
- **folha_clientes** - Folhas de pagamento para clientes (BPO)

### RH e Benefícios
- **beneficios** - Catálogo de benefícios
- **user_beneficios** - Benefícios atribuídos aos usuários
- **folhas_pagamento** - Folhas de pagamento internas

### Outros
- **documentos** - Gestão de arquivos
- **lembretes** - Lembretes/avisos
- **reservas_salas** - Reserva de salas (futuro)

### Diagrama Simplificado

```
users ─┬─ refresh_tokens
       ├─ colaboradores ── cargos
       │                └─ setores
       ├─ pontos
       ├─ tarefas
       ├─ okrs
       ├─ feedbacks
       ├─ posts ── post_comments
       │        └─ post_reactions
       └─ notificacoes

empresa (configuração global)
clientes ── folha_clientes
```

---

## Rotas da API

### Autenticação (`/api/auth`)

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| POST | `/login` | Login com email/senha | 5/min |
| POST | `/register` | Registro de novo usuário | 3/hr |
| POST | `/refresh` | Renovar access token | 10/min |
| POST | `/logout` | Invalidar refresh token | - |
| GET | `/me` | Dados do usuário logado | - |

**Exemplo Login:**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cfohub.com","senha":"admin123"}'
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "abc123...",
  "token_type": "bearer",
  "access_expires_in": 900,
  "refresh_expires_in": 604800
}
```

### Usuários (`/api/users`)

| Método | Endpoint | Descrição | Permissão |
|--------|----------|-----------|-----------|
| GET | `/` | Listar usuários | Admin/Gestor |
| GET | `/{id}` | Buscar usuário | Próprio ou Admin |
| POST | `/` | Criar usuário | Admin |
| PUT | `/{id}` | Atualizar usuário | Próprio ou Admin |
| DELETE | `/{id}` | Deletar usuário | Admin |

### Ponto (`/api/ponto`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/registrar` | Registrar entrada/saída |
| GET | `/meus-registros` | Ver meus registros |
| GET | `/hoje` | Registros de hoje |
| POST | `/ajuste` | Solicitar ajuste |

### Outras Rotas (Estruturadas)

- `/api/colaboradores` - CRUD colaboradores
- `/api/tarefas` - Gestão de tarefas
- `/api/okrs` - OKRs
- `/api/solicitacoes` - Férias, ajustes, etc
- `/api/mural` - Posts sociais
- `/api/chat` - Mensagens
- `/api/clientes` - CRM
- `/api/documentos` - Upload/download
- `/api/notificacoes` - Notificações
- `/api/avaliacoes` - Avaliações
- `/api/beneficios` - Benefícios
- `/api/empresa` - Configurações
- `/api/cargos-setores` - Cargos e setores

---

## Segurança

### JWT Authentication

**Access Token:**
- Duração: 15 minutos
- Payload: `user_id`, `email`, `role`, `exp`
- Algoritmo: HS256

**Refresh Token:**
- Duração: 7 dias
- Armazenado: Tabela `refresh_tokens`
- Rotação: Novo token a cada refresh
- Revogação: Flag `revoked` no banco

### Rate Limiting (slowapi + Redis)

```python
# auth.py
@limiter.limit("5/minute")  # Máximo 5 tentativas de login por minuto
async def login(...)

@limiter.limit("3/hour")    # Máximo 3 registros por hora
async def register(...)

@limiter.limit("10/minute") # Máximo 10 refreshes por minuto
async def refresh(...)
```

### Security Headers (Middleware)

```python
# middleware/security.py
headers = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Content-Security-Policy": "default-src 'self'"
}
```

### Validação de Senha Forte

```python
# password_validator.py
- Mínimo 8 caracteres
- Letras maiúsculas e minúsculas
- Números e caracteres especiais
- Não pode conter email
- Não pode ser senha comum (admin123, password, etc)
```

### RBAC (5 Níveis)

```python
# models/user.py
class UserRole(str, Enum):
    ADMIN = "admin"           # Acesso total
    GESTOR = "gestor"         # Gestão de equipe
    COLABORADOR = "colaborador"  # Acesso básico
    CLIENTE = "cliente"       # CRM externo
    VISITANTE = "visitante"   # Somente leitura
```

---

## Configuração

### Variáveis de Ambiente

Crie `.env.development` (dev) ou `.env` (produção):

```env
# Database
DATABASE_URL=postgresql://cfohub_user:senha@localhost:5432/cfohub

# JWT
SECRET_KEY=sua-chave-secreta-aqui-64-bytes
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# Rate Limiting
REDIS_HOST=localhost
REDIS_PORT=6379

# Application
APP_NAME=CFO Hub API
APP_VERSION=1.1.0
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Gerar SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

---

## Como Rodar

### Com Docker (Recomendado)

```bash
cd ..
docker-compose up
```

### Manual

**1. Criar ambiente virtual:**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
```

**2. Instalar dependências:**
```bash
pip install -r requirements.txt
```

**3. Configurar .env:**
```bash
cp .env.example .env
# Edite .env com suas configurações
```

**4. Setup banco de dados:**
```bash
# Certifique-se que PostgreSQL está rodando
python init_db.py
```

**5. Rodar servidor:**
```bash
uvicorn app.main:app --reload
```

**Servidor rodando em:** http://localhost:8000

**Documentação interativa:** http://localhost:8000/api/docs

---

## Testes (Futuro)

```bash
# Instalar dependências de teste
pip install pytest pytest-asyncio httpx

# Rodar testes
pytest

# Com coverage
pytest --cov=app tests/
```

---

## Padrões de Código

### Nomenclatura
- **Variáveis:** snake_case em português (`usuario_id`, `data_criacao`)
- **Classes:** PascalCase (`UserModel`, `AuthRouter`)
- **Constantes:** UPPER_CASE (`SECRET_KEY`, `DATABASE_URL`)

### Type Hints Obrigatórios
```python
def criar_usuario(nome: str, email: str) -> User:
    ...

async def buscar_usuario(user_id: int, db: Session) -> Optional[User]:
    ...
```

### Docstrings
```python
def validate_password(password: str, email: str) -> bool:
    """
    Valida se a senha atende aos requisitos de segurança.
    
    Args:
        password: Senha a ser validada
        email: Email do usuário (não pode estar na senha)
        
    Returns:
        True se senha é válida
        
    Raises:
        HTTPException: Se senha não atende requisitos
    """
```

---

## Troubleshooting

**Erro: "Module not found"**
```bash
# Certifique-se que está no venv
pip install -r requirements.txt
```

**Erro: "Database connection failed"**
```bash
# Verifique se PostgreSQL está rodando
psql -U postgres -l

# Teste connection string
python -c "from app.database import engine; print(engine.url)"
```

**Erro: "Redis connection failed"**
```bash
# Rate limiting vai falhar sem Redis
# Instale Redis ou desabilite rate limiting em app/main.py
```

**Hot reload não funciona:**
```bash
# Use flag --reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Dependências Principais

```txt
fastapi==0.109.0           # Framework web
uvicorn[standard]==0.27.0  # ASGI server
sqlalchemy==2.0.25         # ORM
psycopg2-binary==2.9.9     # PostgreSQL driver
pydantic==2.5.3            # Validação de dados
python-jose[cryptography]  # JWT
passlib[bcrypt]            # Hash de senhas
slowapi==0.1.9             # Rate limiting
redis==7.1.0               # Cache/rate limiting
python-dotenv==1.0.0       # Env vars
```

---

**Versão:** 0.0.0  
**Última atualização:** 7 de Janeiro de 2026
