"""
FastAPI Main Application
CFO Hub Backend API
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

# Database tables are created by init_db.py in Docker
# or manually by running: python init_db.py

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Sistema de Gestão Integrada para CFOs e Equipes Financeiras",
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# Add request logging (apenas em desenvolvimento)
if settings.DEBUG:
    app.add_middleware(RequestLoggingMiddleware)

# Add trusted host middleware (apenas em produção)
if not settings.DEBUG:
    # Configurar hosts permitidos
    allowed_hosts = ["*"]  # TODO: Configurar domínios específicos em produção
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)


# Health check endpoint
@app.get("/", tags=["Health"])
async def root():
    """API root endpoint - health check"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "online",
        "docs": "/api/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "database": "connected"
    }


# Register all routers
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
