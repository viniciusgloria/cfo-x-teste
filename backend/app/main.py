"""
Aplicacao principal FastAPI
API do backend CFO Hub
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .config import settings
from .database import Base, engine
from .middleware.security import SecurityHeadersMiddleware, RequestLoggingMiddleware
from .routes import (
    auth_router,
    users_router,
    ponto_router,
    solicitacoes_router,
    okrs_router,
    feedbacks_router,
    mural_router,
    clientes_router,
    colaboradores_router,
    tarefas_router,
    empresa_router,
    chat_router,
    notificacoes_router,
    documentos_router,
    beneficios_router,
    avaliacoes_router,
    lembretes_router,
    cargos_setores_router,
    folha_router,
    integrations_router,
)

# As tabelas do banco sao criadas pelo init_db.py no Docker
# ou manualmente ao executar: python init_db.py

# Inicializa o limitador de taxa
limiter = Limiter(key_func=get_remote_address)

# Inicializa o app FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema de Gestão Integrada para CFOs e Equipes Financeiras",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None
)

# Registra o limitador no estado do app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configura o CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adiciona o middleware de cabecalhos de seguranca
app.add_middleware(SecurityHeadersMiddleware)

# Adiciona log de requisicoes (apenas em desenvolvimento)
if settings.DEBUG:
    app.add_middleware(RequestLoggingMiddleware)

# Adiciona middleware de host confiavel (apenas em producao)
if not settings.DEBUG:
    # Configurar hosts permitidos
    allowed_hosts = ["*"]  # TODO: Configurar dominios especificos em producao
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)


# Endpoint de checagem de saude
@app.get("/", tags=["Health"])
async def root():
    """Endpoint raiz da API - checagem de saude"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/api/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Endpoint de checagem de saude"""
    return {
        "status": "healthy",
        "database": "connected"
    }


# Registra todas as rotas
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(ponto_router, prefix="/api")
app.include_router(solicitacoes_router, prefix="/api")
app.include_router(okrs_router, prefix="/api")
app.include_router(feedbacks_router, prefix="/api")
app.include_router(mural_router, prefix="/api")
app.include_router(clientes_router, prefix="/api")
app.include_router(colaboradores_router, prefix="/api")
app.include_router(tarefas_router, prefix="/api")
app.include_router(empresa_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(notificacoes_router, prefix="/api")
app.include_router(documentos_router, prefix="/api")
app.include_router(beneficios_router, prefix="/api")
app.include_router(avaliacoes_router, prefix="/api")
app.include_router(lembretes_router, prefix="/api")
app.include_router(cargos_setores_router, prefix="/api")
app.include_router(folha_router, prefix="/api")
app.include_router(integrations_router, prefix="/api")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
