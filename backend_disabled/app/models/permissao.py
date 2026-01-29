"""
Permissões por Role (Admin, Gestor, Colaborador, Cliente)
"""
from sqlalchemy import Column, String, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from ..database import Base


class PermissaoRole(Base):
    """
    Modelo para armazenar permissões de cada role do sistema.
    Define quais páginas/funcionalidades cada nível de acesso pode acessar.
    """
    __tablename__ = "permissoes_roles"

    role = Column(String(50), primary_key=True)  # admin, gestor, colaborador, cliente
    
    # Opções Gerais do Sistema
    dashboard = Column(Boolean, default=True)
    notificacoes = Column(Boolean, default=True)
    tarefas = Column(Boolean, default=True)
    ponto = Column(Boolean, default=True)
    mural = Column(Boolean, default=True)
    calendario = Column(Boolean, default=True)
    clientes = Column(Boolean, default=True)
    chat = Column(Boolean, default=True)
    documentos = Column(Boolean, default=True)
    feedbacks = Column(Boolean, default=True)
    solicitacoes = Column(Boolean, default=True)
    configuracoes = Column(Boolean, default=True)
    
    # Opções Específicas do Sistema
    beneficios = Column(Boolean, default=True)
    performance = Column(Boolean, default=True)
    colaboradores = Column(Boolean, default=True)
    folha_pagamento = Column(Boolean, default=True)
    folha_clientes = Column(Boolean, default=True)
    avaliacoes = Column(Boolean, default=True)
    okrs = Column(Boolean, default=True)
    relatorios = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def to_dict(self):
        """Converter para dicionário com todas as permissões"""
        return {
            'role': self.role,
            'dashboard': self.dashboard,
            'notificacoes': self.notificacoes,
            'tarefas': self.tarefas,
            'ponto': self.ponto,
            'mural': self.mural,
            'calendario': self.calendario,
            'clientes': self.clientes,
            'chat': self.chat,
            'documentos': self.documentos,
            'feedbacks': self.feedbacks,
            'solicitacoes': self.solicitacoes,
            'configuracoes': self.configuracoes,
            'beneficios': self.beneficios,
            'performance': self.performance,
            'colaboradores': self.colaboradores,
            'folha_pagamento': self.folha_pagamento,
            'folha_clientes': self.folha_clientes,
            'avaliacoes': self.avaliacoes,
            'okrs': self.okrs,
            'relatorios': self.relatorios,
        }
