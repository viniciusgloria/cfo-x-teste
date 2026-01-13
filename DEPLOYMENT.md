# Guia de Deploy - CFO-X SaaS

## Ambientes

| Ambiente | Branch | URL Backend | URL Frontend | Auto Deploy |
|----------|--------|-------------|--------------|-------------|
| **Development** | `develop` | Local Docker | http://localhost:5173 | ❌ Manual |
| **Staging** | `staging` | Azure App Service (Staging) | Azure Static Web App (Staging) | ✅ Auto |
| **Production** | `main` | Azure App Service (Prod) | Azure Static Web App (Prod) | ✅ Auto |

---

## Configuração por Ambiente

### Development (Local)

**Backend:**
1. Copie `.env.example` para `.env`
2. Configure valores locais:
   ```env
   ENVIRONMENT=development
   DATABASE_URL=postgresql://user:password@localhost:5432/cfohub_dev
   REDIS_URL=redis://localhost:6379/0
   SECRET_KEY=dev-secret-key-change-me
   FRONTEND_URL=http://localhost:5173
   DEBUG=true
   LOG_LEVEL=DEBUG
   ```
3. Execute: `docker-compose up`

**Frontend:**
1. Configure `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:8000/apis
   VITE_ENVIRONMENT=development
   ```
2. Execute: `npm run dev`

---

### Staging (Azure)

**Backend (Azure App Service):**

No portal Azure, vá em: **Configuration > Application Settings** e adicione:

```
ENVIRONMENT=staging
DATABASE_URL=<Azure PostgreSQL Staging>
REDIS_URL=<Azure Redis Staging>
SECRET_KEY=<Chave secreta única - 32+ caracteres>
FRONTEND_URL=https://cfohub-staging.azurestaticapps.net
DEBUG=false
LOG_LEVEL=INFO
API_PREFIX=/api
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Startup Command:**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend (Azure Static Web App):**

No portal Azure, vá em: **Configuration > Application Settings** e adicione:
```
VITE_API_URL=https://cfohub-backend-staging.azurewebsites.net/api
VITE_ENVIRONMENT=staging
```

---

### Production (Azure)

**Backend (Azure App Service):**

No portal Azure, vá em: **Configuration > Application Settings** e adicione:

```
ENVIRONMENT=production
DATABASE_URL=<Azure PostgreSQL Production>
REDIS_URL=<Azure Redis Production>
SECRET_KEY=<Chave secreta FORTE única - 64+ caracteres>
FRONTEND_URL=https://cfohub.azurestaticapps.net
DEBUG=false
LOG_LEVEL=WARNING
API_PREFIX=/api
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

**Startup Command:**
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Frontend (Azure Static Web App):**

No portal Azure, vá em: **Configuration > Application Settings** e adicione:
```
VITE_API_URL=https://cfohub-backend.azurewebsites.net/api
VITE_ENVIRONMENT=production
```

---

## Workflow de Deploy

### 1. Desenvolvimento
```bash
develop → código local → commit → push
```

### 2. Homologação
```bash
develop → staging (PR) → Azure auto deploy staging
```

### 3. Produção
```bash
staging → main (PR após testes) → Azure auto deploy production
```

---

## Checklist antes do Deploy

### Staging
- [ ] Testes locais passando
- [ ] Migrations rodaram com sucesso
- [ ] Variáveis de ambiente configuradas no Azure
- [ ] CORS permite URL do frontend staging
- [ ] Logs verificados

### Production
- [ ] Testes em staging validados
- [ ] Performance verificada
- [ ] Backup do banco de dados
- [ ] Variáveis de ambiente produção configuradas
- [ ] SECRET_KEY diferente de staging
- [ ] DEBUG=false
- [ ] LOG_LEVEL=WARNING
- [ ] Monitoramento ativo

---

## Arquivos Docker (apenas para desenvolvimento local)

Os arquivos Docker **estão em todas as branches** mas são usados apenas localmente:
- `docker-compose.yml`
- `Dockerfile` (se houver)

**Não são usados no Azure** - Azure App Service roda nativamente Python e Node.

---

## Comandos Úteis

### Gerar SECRET_KEY segura:
```bash
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

### Ver logs Azure:
```bash
az webapp log tail --name cfohub-backend --resource-group cfohub-rg
```

### Rodar migrations manualmente no Azure:
```bash
az webapp ssh --name cfohub-backend --resource-group cfohub-rg
python backend/init_db.py
```
