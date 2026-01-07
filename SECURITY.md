# Segurança - CFO Hub

Documentação consolidada de segurança para o projeto CFO Hub (Frontend + Backend).

---

## Backend API (FastAPI)

### Autenticação JWT

**Access Token:**
- Duração: 15 minutos
- Algoritmo: HS256
- Header: `Authorization: Bearer {token}`

**Refresh Token:**
- Duração: 7 dias
- Armazenamento: PostgreSQL (tabela `refresh_tokens`)
- Rotação automática a cada refresh

**Fluxo:**
```
1. POST /api/auth/login → access_token + refresh_token
2. Requisições → Header: Authorization: Bearer {access_token}
3. Token expirado → POST /api/auth/refresh → novos tokens
4. Logout → POST /api/auth/logout → revoga refresh_token
```

### Rate Limiting (Redis)

| Endpoint | Limite | Motivo |
|----------|--------|--------|
| POST /auth/login | 5/min | Prevenir brute force |
| POST /auth/register | 3/hora | Prevenir spam |
| POST /auth/refresh | 10/min | Renovações legítimas |

### Security Headers

Aplicados automaticamente via middleware:
- `Strict-Transport-Security: max-age=31536000`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy: default-src 'self'`

### CORS

```python
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Dev
    "https://cfohub.com",     # Prod
]
```

### Validação de Senhas

```python
# Mínimo:
- 8 caracteres
- 1 maiúscula
- 1 minúscula  
- 1 número
- 1 caractere especial (@$!%*?&#)
```

### Hashing

- **Algoritmo:** bcrypt
- **Rounds:** 12
- **Salt:** Gerado automaticamente

---

## Frontend (React/TypeScript)

### Armazenamento de Tokens

```typescript
// localStorage para flexibilidade
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);
```

**Nota:** Vulnerável a XSS. Mitigação via validação rigorosa de inputs.

**Alternativa mais segura:** httpOnly cookies (requer configuração backend).

### Proteção XSS

**React escapa automaticamente:**
```tsx
// ✅ SEGURO
<h3>{post.titulo}</h3>
<p>{post.descricao}</p>
```

**Nunca use sem sanitização:**
```tsx
// ❌ PERIGOSO
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Se necessário, use DOMPurify:**
```typescript
import DOMPurify from 'dompurify';

const clean = DOMPurify.sanitize(htmlContent, {
  ALLOWED_TAGS: ['b', 'i', 'strong', 'a', 'p'],
  ALLOWED_ATTR: ['href']
});
```

### Validação de Inputs

```typescript
// URLs
function isValidURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// Email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### Rotas Protegidas

```tsx
// components/ProtectedRoute.tsx
function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}
```

### Renovação Automática de Token

```typescript
// Interceptor axios/fetch
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access_token);
  
  return data.access_token;
}
```

---

## Boas Práticas

### Desenvolvimento

✅ **Sempre:**
- Use HTTPS em produção
- Valide todos os inputs (client + server)
- Mantenha dependências atualizadas
- Use variáveis de ambiente para secrets
- Implemente logs de segurança

❌ **Nunca:**
- Commite secrets no git
- Confie apenas em validação client-side
- Use `eval()` ou `dangerouslySetInnerHTML` sem sanitização
- Exponha mensagens de erro detalhadas em produção
- Desabilite CORS indiscriminadamente

### Produção

**Backend:**
```bash
# .env
SECRET_KEY=<chave-256-bits-aleatória>
DATABASE_URL=<string-conexão-segura>
REDIS_PASSWORD=<senha-forte>
DEBUG=False
ALLOWED_ORIGINS=https://seudominio.com
```

**Frontend:**
```bash
# .env.production
VITE_API_URL=https://api.seudominio.com
```

### Monitoramento

- Rate limit excedido → Log + alerta
- Tentativas de login falhas → Log IP + timestamp
- Tokens revogados → Auditoria
- Erros 500 → Sentry/CloudWatch

---

## Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [React Security](https://react.dev/learn/security)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)

---

**Versão:** 0.0.0  
**Última atualização:** 7 de Janeiro de 2026