"""
API Routes
"""
from .auth import router as auth_router
from .users import router as users_router
from .ponto import router as ponto_router
from .solicitacoes import router as solicitacoes_router
from .okrs import router as okrs_router
from .feedbacks import router as feedbacks_router
from .mural import router as mural_router
from .clientes import router as clientes_router
from .colaboradores import router as colaboradores_router
from .tarefas import router as tarefas_router
from .empresa import router as empresa_router
from .chat import router as chat_router
from .notificacoes import router as notificacoes_router
from .documentos import router as documentos_router
from .beneficios import router as beneficios_router
from .avaliacoes import router as avaliacoes_router
from .lembretes import router as lembretes_router
from .cargos_setores import router as cargos_setores_router
from .folha import router as folha_router
from .integrations import router as integrations_router
from .permissoes import router as permissoes_router
from .performance import router as performance_router

__all__ = [
    "auth_router",
    "users_router",
    "ponto_router",
    "solicitacoes_router",
    "okrs_router",
    "feedbacks_router",
    "mural_router",
    "clientes_router",
    "colaboradores_router",
    "tarefas_router",
    "empresa_router",
    "chat_router",
    "notificacoes_router",
    "documentos_router",
    "beneficios_router",
    "avaliacoes_router",
    "lembretes_router",
    "cargos_setores_router",
    "folha_router",
    "integrations_router",
    "permissoes_router",
    "performance_router",
]
