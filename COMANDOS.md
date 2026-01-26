# Comandos Úteis - CFO-X SaaS

## Quick Start Local

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 2. Subir ambiente com Docker
docker-compose up -d

# 3. Verificar se está rodando
docker-compose ps

# 4. Ver logs
docker-compose logs -f backend

# 5. Acessar
# Backend: http://localhost:8000
# Frontend: http://localhost:5173
# Docs API: http://localhost:8000/docs
```

---

## Gerar SECRET_KEY

```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(64))"

# PowerShell
python -c "import secrets; print(secrets.token_urlsafe(64))"

# Online (se não tiver Python)
# https://generate-secret.vercel.app/64
```

---

## Database

```bash
# Inicializar banco (dentro do container)
docker-compose exec backend python init_db.py

# Conectar no PostgreSQL
docker-compose exec db psql -U user -d cfohub_dev

# Backup
docker-compose exec db pg_dump -U user cfohub_dev > backup.sql

# Restore
docker-compose exec -T db psql -U user cfohub_dev < backup.sql
```

---

## Docker Úteis

```bash
# Rebuild
docker-compose up -d --build

# Parar tudo
docker-compose down

# Parar e limpar volumes (APAGA DADOS)
docker-compose down -v

# Ver logs em tempo real
docker-compose logs -f

# Entrar no container
docker-compose exec backend bash
docker-compose exec db bash

# Limpar tudo Docker (CUIDADO!)
docker system prune -a
```

---

## Backend (Python)

```bash
# Instalar dependências
cd backend
pip install -r requirements.txt

# Rodar localmente (sem Docker)
uvicorn app.main:app --reload

# Rodar testes
pytest

# Formatar código
black app/

# Lint
flake8 app/

# Criar migration (futuro com Alembic)
alembic revision --autogenerate -m "descrição"
alembic upgrade head
```

---

## Frontend (React)

```bash
cd frontend

# Instalar dependências
npm install

# Rodar dev
npm run dev

# Build para produção
npm run build

# Preview build
npm run preview

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

---

## Debug e Troubleshooting

```bash
# Ver todas as variáveis de ambiente (backend)
docker-compose exec backend env | grep -E "DATABASE|SECRET|FRONTEND"

# Testar conexão com banco
docker-compose exec backend python -c "from app.database import engine; print(engine.url)"

# Verificar se Redis está funcionando
docker-compose exec redis redis-cli ping

# Limpar cache Redis
docker-compose exec redis redis-cli FLUSHALL

# Health check manual
curl http://localhost:8000/health
curl http://localhost:8000/docs

# Ver portas em uso
# Windows
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Linux/Mac
lsof -i :8000
lsof -i :5173
```

---

## Git Workflow

```bash
# Criar feature branch
git checkout develop
git pull
git checkout -b feature/nome-da-feature

# Commitar
git add .
git commit -m "feat: descrição"
git push origin feature/nome-da-feature

# Merge para staging (após PR aprovado)
git checkout staging
git pull
git merge develop
git push

# Merge para main (após testes em staging)
git checkout main
git pull
git merge staging
git push

# Ver diferenças entre branches
git diff develop staging
git diff staging main
```

---

## Testes

```bash
# Backend - rodar todos os testes
cd backend
pytest

# Com coverage
pytest --cov=app --cov-report=html

# Teste específico
pytest tests/test_auth.py -v

# Frontend - (quando tiver)
cd frontend
npm test
```

---

## Monitoramento

```bash
# Ver uso de recursos Docker
docker stats

# Logs completos (containers + eventos do daemon)
.\docker-logs.ps1
docker-logs.bat

# Ver logs com timestamp
docker-compose logs -f -t backend

# Ver últimas 100 linhas
docker-compose logs --tail=100 backend
```

---

## Segurança

```bash
# Verificar dependências Python com vulnerabilidades
cd backend
pip install safety
safety check

# Verificar dependências npm com vulnerabilidades
cd frontend
npm audit
npm audit fix

# Escanear secrets no código (instalar gitleaks)
gitleaks detect --source . --verbose
```

---

## Dicas

1. **Nunca commite `.env`** - sempre use `.env.example`
2. **Sempre teste localmente** antes de subir para staging
3. **Use SECRET_KEY diferente** em cada ambiente
4. **Faça backup do banco** antes de rodar migrations em produção

---

**Mantenha este arquivo atualizado conforme adiciona novos comandos!**
