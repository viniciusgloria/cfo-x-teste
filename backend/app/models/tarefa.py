"""
Tarefa (Task) models
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class StatusTarefa(str, enum.Enum):
    """Task status"""
    BACKLOG = "backlog"
    TODO = "todo"
    EM_PROGRESSO = "em_progresso"
    EM_REVISAO = "em_revisao"
    CONCLUIDA = "concluida"
    CANCELADA = "cancelada"


class PrioridadeTarefa(str, enum.Enum):
    """Task priority"""
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"


class Tarefa(Base):
    """Task/Project management"""
    __tablename__ = "tarefas"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    
    # Assignment
    criador_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    
    # Status and priority
    status = Column(SQLEnum(StatusTarefa), default=StatusTarefa.TODO, nullable=False)
    prioridade = Column(SQLEnum(PrioridadeTarefa), default=PrioridadeTarefa.MEDIA)
    
    # Dates
    data_inicio = Column(DateTime(timezone=True))
    data_fim = Column(DateTime(timezone=True))
    prazo = Column(DateTime(timezone=True))
    
    # Project/Category
    projeto = Column(String(100))
    tags = Column(Text)  # JSON array
    
    # Progress
    progresso = Column(Integer, default=0)  # 0-100
    tempo_estimado = Column(Integer)  # Minutes
    tempo_gasto = Column(Integer, default=0)  # Minutes
    
    # Checklist
    checklist = Column(Text)  # JSON array of items
    
    # Flags
    bloqueada = Column(Boolean, default=False)
    motivo_bloqueio = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    criador = relationship("User", foreign_keys=[criador_id])
    responsavel = relationship("User", foreign_keys=[responsavel_id], backref="tarefas_responsavel")
    comments = relationship("TarefaComment", back_populates="tarefa", cascade="all, delete-orphan")
    attachments = relationship("TarefaAttachment", back_populates="tarefa", cascade="all, delete-orphan")


class TarefaComment(Base):
    """Comments on tasks"""
    __tablename__ = "tarefa_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    tarefa_id = Column(Integer, ForeignKey("tarefas.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Comment content
    conteudo = Column(Text, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    tarefa = relationship("Tarefa", back_populates="comments")
    user = relationship("User")


class TarefaAttachment(Base):
    """Attachments on tasks"""
    __tablename__ = "tarefa_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    tarefa_id = Column(Integer, ForeignKey("tarefas.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # File info
    nome = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    tamanho = Column(Integer)  # Bytes
    tipo = Column(String(100))  # MIME type
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    tarefa = relationship("Tarefa", back_populates="attachments")
    user = relationship("User")
