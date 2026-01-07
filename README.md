# CFO Hub - Sistema de Gestão Integrada

Plataforma SaaS completa para gestão de pessoas, controle financeiro, projetos e comunicação interna em uma única solução moderna.

---

## Pré-requisitos

- Python 3.11+
- Node.js 20+
- PostgreSQL 16
- Redis 7 (opcional, para rate limiting)

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python init_db.py
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

**Acessar:**
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/api/docs
- **Login:** admin@cfohub.com / admin123

## Visão Geral do Sistema

### Gestão de Pessoas
- Ponto eletrônico com banco de horas
- Cadastro de colaboradores, cargos e setores
- Solicitações (férias, ajustes, documentos)
- Avaliações e feedbacks 360°
- Benefícios e folha de pagamento

### Projetos e Tarefas
- Quadros Kanban, Gantt, Calendário
- Dependências e bloqueadores
- Timesheet e controle de horas
- Checklists e marcos

### OKRs e Metas
- Objetivos e resultados-chave
- Acompanhamento de progresso
- Alinhamento de equipes

### CRM e Clientes
- Cadastro de clientes
- Gestão de contratos
- BPO - Folha de pagamento para clientes

### Comunicação
- Mural social com posts e reações
- Chat interno em tempo real
- Sistema de notificações
- Gestão de documentos

---

## Tecnologias

**Backend:**
- FastAPI (Python 3.11)
- PostgreSQL 16
- Redis 7 (rate limiting)
- SQLAlchemy
- JWT + bcrypt

**Frontend:**
- React 18 + TypeScript
- Vite + Tailwind CSS
- Zustand (state management)
- React Router 6

---

## Banco de Dados

26 tabelas auto-criadas pelo Docker:

- **Autenticação:** users, refresh_tokens
- **Ponto:** pontos, ajustes_ponto
- **Gestão:** colaboradores, cargos, setores, empresa
- **Solicitcriadas automaticamente pelo script `init_db.py`
- **OKRs:** okrs, feedbacks, avaliacoes
- **Mural:** posts, post_comments, post_reactions
- **Tarefas:** tarefas
- **CRM:** clientes, folha_clientes
- **Outros:** chat_messages, notificacoes, documentos, beneficios, lembretes

---

## Segurança

### Autenticação JWT com Refresh Tokens

**Access Token (curta duração):**
- Expiração: 15 minutos
- Algoritmo: HS256
- Usado em todas as requisições autenticadas

**Refresh Token (longa duração):**
- Expiração: 7 dias
- Armazenado no banco PostgreSQL
- Rotação automática: novo token a cada renovação
- Revogável via logout

**Fluxo:**
```
Login → Access + Refresh tokens
↓
Requisições com Access token (header Authorization: Bearer)
↓
Access expira (15min) → Frontend usa Refresh para renovar
↓
Logout → Revoga Refresh token no banco
```

### Rate Limiting (Proteção Brute Force)

Implementado com **slowapi + Redis**:
- **Login:** 5 tentativas/minuto
- **Registro:** 3 cadastros/hora
- **Refresh:** 10 renovações/minuto

Exceder limite = HTTP 429 Too Many Requests

### Security Headers

Middleware aplica headers em todas as respostas:
- **HSTS:** Força HTTPS
- **X-Frame-Options:** Previne clickjacking
- **X-Content-Type-Options:** Previne MIME sniffing
- **X-XSS-Protection:** Proteção XSS nativa
- **CSP:** Controla fontes de recursos
- **Permissions-Policy:** Desabilita APIs perigosas

### Senha Forte Obrigatória

Validação automática no registro/alteração:
- Mínimo 8 caracteres
- Letras maiúsculas e minúsculas
- Números e caracteres especiais
- Não pode ser senha comum (admin123, password, etc)
- Hash bcrypt (cost factor 12)

### RBAC (5 Níveis de Acesso)

```
Admin      → Acesso total ao sistema
Gestor     → Gestão de equipe e relatórios
Colaborador → Acesso básico (ponto, tarefas)
Cliente    → Acesso CRM externo
Visitante  → Somente leitura
```

### Proteções Implementadas

**Backend:**
- SQL Injection protegido (SQLAlchemy ORM)
- CORS configurável por ambiente
- Trusted Host validation (produção)
- Request logging (apenas dev)
- Token revocation no logout

**Frontend:**
- XSS protegido (React auto-escape)
- Validação de inputs client-side
- Auto-refresh de tokens
- Rotas protegidas por role
- Content Security Policy

### Credenciais Padrão (DEV)

**Admin:** admin@cfohub.com / admin123  
**JWT Secret:** Definir em `.env`

**IMPORTANTE:** Trocar TUDO em produção!

### Documentação Completa

- **[Backend Security](backend/SECURITY.md)** - JWT, rate limiting, RBAC, headers, LGPD
- **[Frontend Security](frontend/SECURITY.md)** - XSS, CSRF, tokens, validação, CSP

### Checklist Pré-Produção

- [ ] Trocar SECRET_KEY (64 bytes aleatórios)
- [ ] Trocar senha PostgreSQL
- [ ] Trocar senha do admin
- [ ] DEBUG=False
- [ ] HTTPS habilitado (nginx/Caddy)
- [ ] ALLOWED_ORIGINS com domínio real
- [ ] Redis com autenticação
- [ ] Backup automático do banco
- [ ] Logs centralizados (Sentry, etc)
- [ ] Desabilitar /api/docs em produção

---

---

## Status do Projeto

| Componente | Status |
|------------|--------|
| Backend API | Completo - 3 rotas + 15 estruturadas |
| Frontend | Completo - 30+ páginas |
| Database | Completo - 26 tabelas |
| Autenticação | Completo - JWT + refresh tokens |
| Segurança | Completo - Rate limiting + headers |
| LGPD | Pendente - Estrutura pronta |

---

## Troubleshooting

**Porta já em uso:**
```bash
docker-compose down
# Ou mude portas no docker-compose.yml
```

**Banco não conecta:**
```bash
docker-compose ps  # Deve mostrar "healthy" no postgres
docker-compose logs postgres
```

**Código não atualiza:**
- Hot reload está ativo
- Se não funcionar: `docker-compose restart backend`

**Resetar tudo:**
```bash
docker-compose down -v
docker-compose up --build
```

---

## Setup em Nova Máquina

```bash
git clone <repo>
cd cfo-x-saas
docker-compose up
```

Pronto! Ambiente idêntico rodando.

---

## Estrutura do Projeto

```
cfo-x-saas/
├── backend/              # API FastAPI + PostgreSQL
│   ├── app/
│   │   ├── models/       # 26 tabelas SQLAlchemy
│   │   ├── routes/       # 18 routers REST API
│   │   ├── schemas/      # Validação Pydantic
│   │   └── main.py       # Entry point
│   ├── init_db.py        # Setup inicial do banco
│   ├── Dockerfile
│   └── README.md         # Documentação detalhada do backend
│                                 │  Port 6379   │
                                    └──────────────┘
```

### Fluxo de Autenticação

1. **Login** → Backend valida credenciais
2. **Tokens** → Retorna access token (15min) + refresh token (7 dias)
3. **Requisições** → Frontend envia access token no header
4. **Expiração** → Frontend usa refresh token para renovar
5. **Logout** → Backend revoga refresh token

### Fluxo de Dados

1. **Frontend** faz requisição HTTP para `/api/endpoint`
2. **Backend** valida JWT, verifica permissões (RBAC)
3. **Middleware** aplica rate limiting (Redis)
4. **Router** processa lógica de negócio
5. **ORM** (SQLAlchemy) consulta PostgreSQL
6. **Response** retorna JSON validado (Pydantic)
7. **Frontend** atualiza estado (Zustand) e UI (React)

---

## Deploy para Produção

### Deploy

Configurar variáveis de ambiente e fazer deploy do backend e frontend conforme sua plataforma preferida.

**Credenciais de Teste (Desenvolvimento):**
```
Email: admin@cfohub.com
Senha: admin123
```

### CI/CD - GitHub Actions

Push na branch principal aciona workflows de build e deploy (configure os workflows conforme sua infraestrutura)

Acompanhe: [GitHub Actions](../../actions)

### Antes de Deploy em Produção

1. **Trocar senhas:**
   - PostgreSQL password  
   - JWT SECRET_KEY → `openssl rand -hex 64`
   - Admin password

2. * `DEBUG=False`
   - HTTPS com nginx/Caddy
   - Backup automático PostgreSQL
   - Redis com autenticação

3. **Variáveis (.env.production):**
```env
DATABASE_URL=postgresql://user:SENHA@host:5432/cfohub
SECRET_KEY=CHAVE_ALEATORIA_64_BYTES
DEBUG=False

---

## Testes

**Versão:** 0.0.0  
**Última atualização:** 7 de Janeiro de 2026
