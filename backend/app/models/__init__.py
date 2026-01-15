"""
Modelos de banco (SQLAlchemy ORM).

Importar este módulo garante que todos os modelos sejam registrados.
"""
from .user import User
from .refresh_token import RefreshToken
from .ponto import Ponto, AjustePonto
from .solicitacao import Solicitacao
from .okr import OKR
from .feedback import Feedback
from .mural import Post, PostComment, PostReaction
from .cliente import Cliente
from .colaborador import Colaborador
from .tarefa import Tarefa, TarefaComment, TarefaAttachment
from .empresa import Empresa
from .chat import ChatMessage
from .notificacao import Notificacao
from .documento import Documento
from .beneficio import Beneficio
from .avaliacao import Avaliacao
from .lembrete import Lembrete
from .cargo_setor import Cargo, Setor
from .folha_clientes import FolhaCliente
from .folha_pagamento import FolhaPagamento

# Lista explícita de reexportação para clareza.
__all__ = [
    "User",
    "RefreshToken",
    "Ponto",
    "AjustePonto",
    "Solicitacao",
    "OKR",
    "Feedback",
    "Post",
    "PostComment",
    "PostReaction",
    "Cliente",
    "Colaborador",
    "Tarefa",
    "TarefaComment",
    "TarefaAttachment",
    "Empresa",
    "ChatMessage",
    "Notificacao",
    "Documento",
    "Beneficio",
    "Avaliacao",
    "Lembrete",
    "Cargo",
    "Setor",
    "FolhaCliente",
    "FolhaPagamento",
]
