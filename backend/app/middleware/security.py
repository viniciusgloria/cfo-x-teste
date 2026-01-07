"""
Security middleware for FastAPI
Adds security headers and additional protections
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Adiciona headers de segurança em todas as respostas
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Previne clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Previne MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS Protection (browsers antigos)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Content Security Policy (básico)
        if not settings.DEBUG:
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self';"
            )
        
        # HSTS - Force HTTPS (apenas em produção)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (Feature Policy)
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
    Log de requisições (sem dados sensíveis)
    """
    async def dispatch(self, request: Request, call_next):
        import logging
        logger = logging.getLogger("api.requests")
        
        # Log request info (sem dados sensíveis)
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"from {request.client.host if request.client else 'unknown'}"
        )
        
        response = await call_next(request)
        
        # Log response status
        logger.info(
            f"Response: {request.method} {request.url.path} "
            f"status={response.status_code}"
        )
        
        return response
