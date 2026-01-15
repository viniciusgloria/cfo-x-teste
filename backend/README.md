# CFO X SaaS - Backend

API REST em FastAPI para a plataforma CFO X SaaS.

## Status do backend

### Implementado
- Autenticação: login, registro, refresh, logout, troca de senha e perfil do usuário logado
- Usuários: listagem, detalhe, criação, atualização e desativação (soft delete)
- Empresa: criação/atualização das configurações
- Clientes: CRUD básico
- Ponto: registro e solicitações de ajuste
- Integrações: endpoints de status e webhooks (placeholder)

### Estrutura pronta (sem endpoints)
Os módulos abaixo têm modelos/schemas e rotas registradas, mas ainda não possuem implementação:
- Avaliações, Benefícios, Cargos/Setores, Chat, Colaboradores, Documentos
- Feedbacks, Folha, Lembretes, Mural, Notificações, OKRs, Solicitações, Tarefas

## Arquitetura

```
backend/
|-- app/
|   |-- __init__.py
|   |-- main.py                 # Inicialização do FastAPI e registro de rotas
|   |-- config.py               # Configurações via variáveis de ambiente
|   |-- database.py             # Sessão do banco e Base do SQLAlchemy
|   |-- dependencies.py         # Dependências (auth e autorização)
|   |-- auth.py                 # Hash de senha e JWT
|   |-- password_validator.py   # Regras de senha
|   |-- middleware/
|   |   |-- security.py         # Headers de segurança e logging
|   |-- models/                 # Modelos ORM
|   |-- schemas/                # Schemas Pydantic
|   |-- routes/                 # Rotas da API
|-- init_db.py                  # Criação das tabelas e seed inicial
|-- requirements.txt
|-- Dockerfile
```

## Tecnologias

- FastAPI, Uvicorn
- SQLAlchemy + PostgreSQL
- Pydantic
- JWT (python-jose) + passlib/bcrypt
- slowapi (rate limiting)

## Requisitos

- Python 3.x
- PostgreSQL
- (Opcional) Redis para futuros ajustes de rate limiting distribuído

## Configuração (.env)

Crie um arquivo `.env` na pasta `backend`:

```env
# Obrigatórios
DATABASE_URL=postgresql://user:password@localhost:5432/cfohub_dev
SECRET_KEY=sua-chave-super-secreta

# Aplicação
ENVIRONMENT=development
DEBUG=true
APP_NAME=CFO X API
APP_VERSION=0.0.0 Em Desenvolvimento
LOG_LEVEL=INFO

# JWT
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
FRONTEND_URL=http://localhost:5173

# Redis (não usado no rate limiting por enquanto)
REDIS_URL=redis://localhost:6379/0

# OMIE (futuro)
OMIE_API_KEY=
OMIE_API_SECRET=
OMIE_APP_KEY=
```

Observação: o CORS usa `FRONTEND_URL` e, em `ENVIRONMENT=development`, libera também `localhost:5173`, `localhost:3000` e `127.0.0.1:5173`.

## Como rodar localmente

1. Criar e ativar ambiente virtual:
```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

2. Instalar dependências:
```bash
pip install -r requirements.txt
```

3. Inicializar o banco:
```bash
python init_db.py
```

4. Rodar a API:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Docker (desenvolvimento)

Use o `docker-compose.yml` da raiz do repositório:

```bash
docker compose up --build
```

Esse compose já sobe PostgreSQL, Redis, pgAdmin e o backend.

## Banco de dados e seed inicial

O `init_db.py` cria as tabelas e insere um usuário administrador padrão:
- Email: `admin@cfohub.com`
- Senha: `admin123`

Altere a senha no primeiro login.

## Documentação da API

Com `DEBUG=true`, a documentação fica disponível em:
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- OpenAPI: http://localhost:8000/api/openapi.json

## Autenticação e segurança

- JWT com access token e refresh token
- Access token expira em 15 minutos por padrão do código
- Refresh token expira em 7 dias por padrão do código
- As variáveis `ACCESS_TOKEN_EXPIRE_MINUTES` e `REFRESH_TOKEN_EXPIRE_DAYS` existem, mas a expiração ainda está fixa no código

### Perfis de acesso (roles)
- ADMIN, GESTOR, COLABORADOR, CLIENTE, VISITANTE

### Regras de senha
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial
- Não pode conter partes do email

### Rate limiting
Rate limiting está configurado no código (slowapi) em memória:
- Login: 5/minuto
- Registro: 3/hora
- Refresh: 10/minuto

## Endpoints principais

Prefixo base: `/api`

### Autenticação
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me`
- `POST /api/auth/change-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Usuários
- `GET /api/users/`
- `GET /api/users/{user_id}`
- `POST /api/users/`
- `PUT /api/users/{user_id}`
- `DELETE /api/users/{user_id}` (desativa o usuário)

### Empresa
- `POST /api/empresa` (cria ou atualiza a configuração)

### Clientes
- `GET /api/clientes/`
- `GET /api/clientes/{cliente_id}`
- `POST /api/clientes/`
- `PUT /api/clientes/{cliente_id}`
- `DELETE /api/clientes/{cliente_id}`

### Ponto
- `POST /api/ponto/`
- `GET /api/ponto/`
- `POST /api/ponto/ajustes`
- `GET /api/ponto/ajustes`
- `PUT /api/ponto/ajustes/{ajuste_id}`

### Integrações (placeholder)
- `GET /api/integrations/status`
- `POST /api/integrations/omie/sync`
- `POST /api/integrations/external/webhook`
- `GET /api/integrations/omie/clients`

## Testes

Ainda não há testes automatizados no repositório.

## Padrões de código

- Black para formatação
- PEP 8
- Docstrings em funções importantes
- Type hints quando possível

## Contribuindo

1. Crie uma branch (`git checkout -b feature/nova-feature`)
2. Commit (`git commit -m "Add nova feature"`)
3. Push (`git push origin feature/nova-feature`)
4. Abra um Pull Request
