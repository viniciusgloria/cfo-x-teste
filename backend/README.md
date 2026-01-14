# CFO X SaaS - Backend

API REST desenvolvida em FastAPI para a plataforma CFO X SaaS.

## Arquitetura

O backend segue uma arquitetura em camadas com separação clara de responsabilidades:

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # Aplicação principal FastAPI
│   ├── config.py            # Configurações e variáveis de ambiente
│   ├── database.py          # Conexão com banco de dados
│   ├── dependencies.py      # Dependências injetáveis
│   ├── auth.py              # Lógica de autenticação
│   ├── password_validator.py # Validação de senhas
│   │
│   ├── middleware/          # Middlewares da aplicação
│   │   └── security.py      # Security headers, CORS, rate limiting
│   │
│   ├── models/              # Modelos SQLAlchemy (ORM)
│   │   ├── user.py
│   │   ├── empresa.py
│   │   ├── colaborador.py
│   │   ├── ponto.py
│   │   ├── folha_pagamento.py
│   │   ├── documento.py
│   │   ├── tarefa.py
│   │   ├── okr.py
│   │   ├── chat.py
│   │   └── ...
│   │
│   ├── schemas/             # Schemas Pydantic (validação)
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── empresa.py
│   │   ├── colaborador.py
│   │   └── ...
│   │
│   └── routes/              # Rotas/Endpoints da API
│       ├── auth.py
│       ├── users.py
│       ├── colaboradores.py
│       ├── ponto.py
│       ├── folha.py
│       ├── documentos.py
│       ├── tarefas.py
│       ├── okrs.py
│       └── ...
│
├── Dockerfile
├── requirements.txt
└── init_db.py              # Script de inicialização do banco
```

## Tecnologias

- **FastAPI 0.109.0** - Framework web moderno e de alta performance
- **SQLAlchemy 2.0.25** - ORM para PostgreSQL
- **PostgreSQL 16** - Banco de dados relacional
- **Redis 7.1.0** - Cache e rate limiting
- **Pydantic 2.5.3** - Validação de dados e schemas
- **python-jose 3.3.0** - Implementação JWT
- **passlib & bcrypt** - Hashing de senhas
- **slowapi 0.1.9** - Rate limiting
- **uvicorn 0.27.0** - ASGI server

## Funcionalidades

### Autenticação e Autorização
- Login com JWT (Access Token + Refresh Token)
- Validação de senhas forte
- RBAC (Role-Based Access Control)
- Roles: SUPER_ADMIN, ADMIN, MANAGER, USER

### Gestão Multi-tenant
- Isolamento de dados por empresa
- Controle de acesso por empresa
- Suporte a múltiplas empresas

### Módulos Principais

#### Colaboradores
- CRUD completo de colaboradores
- Gestão de cargos e setores
- Vinculação com empresa

#### Ponto
- Registro de entrada/saída
- Banco de horas
- Relatórios de jornada
- Justificativas

#### Folha de Pagamento
- Cálculo de folha
- Holerites
- Impostos e descontos
- Histórico

#### Documentos
- Upload de arquivos
- Organização em pastas
- Compartilhamento
- Controle de acesso

#### Tarefas
- Criação e atribuição
- Status e prioridades
- Comentários
- Anexos

#### OKRs
- Objetivos e resultados-chave
- Acompanhamento de progresso
- Bloqueadores
- Visualização por time/pessoa

#### Chat
- Mensagens diretas
- Canais por empresa
- Histórico

#### Notificações
- Alertas do sistema
- Lembretes
- Notificações push

#### Clientes e Vendas
- Gestão de clientes
- CPA (Custo por Aquisição)
- Análises de vendas

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta backend:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/cfohub_dev

# Redis
REDIS_URL=redis://localhost:6379

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (separado por vírgulas)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Environment
ENVIRONMENT=development
```

### Instalação

1. **Criar ambiente virtual:**
```bash
cd backend
python -m venv venv
```

2. **Ativar ambiente virtual:**
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

4. **Inicializar banco de dados:**
```bash
python init_db.py
```

5. **Executar servidor:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Docker

```bash
# Build
docker build -t cfohub-backend .

# Run
docker run -p 8000:8000 --env-file .env cfohub-backend
```

## API Documentation

Após iniciar o servidor, acesse:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **OpenAPI JSON:** http://localhost:8000/openapi.json

## Autenticação

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}

Response:
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": {...}
}
```

### Usar Token
```bash
GET /api/users/me
Authorization: Bearer eyJ...
```

### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ..."
}
```

## Segurança

### Middlewares Implementados
- **CORS** - Controle de origens permitidas
- **Security Headers** - Headers HTTP de segurança
- **Rate Limiting** - Proteção contra abuso de API
- **Authentication** - Validação JWT em todas as rotas protegidas

### Validação de Senhas
- Mínimo 8 caracteres
- Pelo menos 1 letra maiúscula
- Pelo menos 1 letra minúscula
- Pelo menos 1 número
- Pelo menos 1 caractere especial

### Rate Limiting
- Limite padrão: 60 requisições/minuto
- Login: 5 tentativas/minuto
- Configurável via variáveis de ambiente

## Banco de Dados

### Modelos Principais

- **User** - Usuários do sistema
- **Empresa** - Empresas (multi-tenant)
- **Colaborador** - Colaboradores das empresas
- **Cargo / Setor** - Estrutura organizacional
- **Ponto** - Registros de ponto
- **FolhaPagamento** - Folhas e holerites
- **Documento** - Documentos e arquivos
- **Tarefa** - Tarefas e atribuições
- **OKR** - Objetivos e resultados-chave
- **Chat / Mensagem** - Sistema de chat
- **Notificacao** - Notificações do sistema
- **Cliente** - Clientes para CPA
- **Avaliacao** - Avaliações de desempenho
- **Beneficio** - Benefícios e VT/VR
- **Feedback** - Feedbacks entre colaboradores

### Migrations

O projeto usa SQLAlchemy para definir modelos. As tabelas são criadas automaticamente através do `init_db.py`.

Para criar novas tabelas:
1. Defina o modelo em `app/models/`
2. Importe em `app/models/__init__.py`
3. Execute `python init_db.py`

## Testes

```bash
# Executar todos os testes
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Apenas um arquivo
pytest tests/test_auth.py
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registro
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Usuários
- `GET /api/users/me` - Usuário atual
- `GET /api/users` - Listar usuários
- `POST /api/users` - Criar usuário
- `PUT /api/users/{id}` - Atualizar usuário

### Colaboradores
- `GET /api/colaboradores` - Listar colaboradores
- `POST /api/colaboradores` - Criar colaborador
- `GET /api/colaboradores/{id}` - Detalhes
- `PUT /api/colaboradores/{id}` - Atualizar
- `DELETE /api/colaboradores/{id}` - Remover

### Ponto
- `POST /api/ponto/registrar` - Registrar ponto
- `GET /api/ponto/registros` - Histórico
- `GET /api/ponto/relatorio` - Relatório

### Tarefas
- `GET /api/tarefas` - Listar tarefas
- `POST /api/tarefas` - Criar tarefa
- `PUT /api/tarefas/{id}` - Atualizar
- `POST /api/tarefas/{id}/comentarios` - Comentar

### OKRs
- `GET /api/okrs` - Listar OKRs
- `POST /api/okrs` - Criar OKR
- `PUT /api/okrs/{id}/progresso` - Atualizar progresso

*(Ver documentação completa em /docs)*

## Debugging

### Logs
Os logs são exibidos no console durante desenvolvimento:
```bash
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Banco de Dados
Use PgAdmin para visualizar o banco:
- URL: http://localhost:5050
- Email: admin@admin.com
- Password: admin

## Deploy

### Variáveis de Produção
```env
ENVIRONMENT=production
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=strong-random-key
ALLOWED_ORIGINS=https://yourdomain.com
```

### Considerações
- Use um SECRET_KEY forte e único
- Configure CORS adequadamente
- Use HTTPS em produção
- Configure backup do banco de dados
- Monitore logs e performance
- Use Redis para cache e sessões

## Contribuindo

1. Crie uma branch (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -m 'Add nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## Padrões de Código

- Use Black para formatação
- Siga PEP 8
- Docstrings em funções importantes
- Type hints quando possível
- Mantenha funções pequenas e focadas
- Escreva testes para novas features

## Dúvidas?

- [Docoumentação Python](https://www.python.org/doc/)
- [Docoumentação PgSQL](https://www.postgresql.org/docs/)