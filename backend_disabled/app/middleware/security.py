"""
Middleware de seguranca para FastAPI
Adiciona headers de seguranca e protecoes adicionais
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adiciona headers de seguranca em todas as respostas
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Previne clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Previne sniffing de tipo MIME
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Protecao XSS (navegadores antigos)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Politica de Seguranca de Conteudo (basico)
        if not settings.DEBUG:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self';"
            )
        
        # HSTS - Forca HTTPS (apenas em producao)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # Politica de referer
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Politica de permissoes (Feature Policy)
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=()"
        )
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log de requisicoes (sem dados sensiveis)
    """
    async def dispatch(self, request: Request, call_next):
        import logging
        logger = logging.getLogger("api.requests")
        
        # Registra info da requisicao (sem dados sensiveis)
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        
        # Registra status da resposta
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code}"
        )
        
        return response
