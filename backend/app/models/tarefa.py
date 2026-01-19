"""
Modelos de Tarefa.

Gerencia tarefas com comentários e anexos.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base
import enum


class StatusTarefa(str, enum.Enum):
    """Status do fluxo de trabalho das tarefas."""
    BACKLOG = "backlog"
    TODO = "todo"
    EM_PROGRESSO = "em_progresso"
    EM_REVISAO = "em_revisao"
    CONCLUIDA = "concluida"
    CANCELADA = "cancelada"


class PrioridadeTarefa(str, enum.Enum):
    """Nível de prioridade para ordenação e alertas."""
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"


class Tarefa(Base):
    """Registro de tarefa com responsável, status e progresso."""
    __tablename__ = "tarefas"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Campos básicos de descrição.
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text)
    
    # Criador e responsável atual.
    criador_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    responsavel_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), index=True)
    
    # Estado do fluxo e prioridade.
    status = Column(SQLEnum(StatusTarefa), default=StatusTarefa.TODO, nullable=False)
    prioridade = Column(SQLEnum(PrioridadeTarefa), default=PrioridadeTarefa.MEDIA)
    
    # Campos de agendamento.
    data_inicio = Column(DateTime(timezone=True))
    data_fim = Column(DateTime(timezone=True))
    prazo = Column(DateTime(timezone=True))
    
    # Agrupamento por projeto e tags em JSON.
    projeto = Column(String(100))
    tags = Column(Text)
    
    # Progresso e tempo (em minutos).
    progresso = Column(Integer, default=0)  # 0-100
    tempo_estimado = Column(Integer)  # Minutos
    tempo_gasto = Column(Integer, default=0)  # Minutos
    
    # Checklist em JSON.
    checklist = Column(Text)
    
    # Estado de bloqueio com motivo.
    bloqueada = Column(Boolean, default=False)
    motivo_bloqueio = Column(Text)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Exclusão em cascata remove comentários/anexos junto com a tarefa.
    criador = relationship("User", foreign_keys=[criador_id])
    responsavel = relationship("User", foreign_keys=[responsavel_id], backref="tarefas_responsavel")
    comments = relationship("TarefaComment", back_populates="tarefa", cascade="all, delete-orphan")
    attachments = relationship("TarefaAttachment", back_populates="tarefa", cascade="all, delete-orphan")


class TarefaComment(Base):
    """Comentário feito em uma tarefa."""
    __tablename__ = "tarefa_comments"
    
    id = Column(Integer, primary_key=True, index=True)
    tarefa_id = Column(Integer, ForeignKey("tarefas.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Corpo do comentário.
    conteudo = Column(Text, nullable=False)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Referências à tarefa e ao autor.
    tarefa = relationship("Tarefa", back_populates="comments")
    user = relationship("User")


class TarefaAttachment(Base):
    """Arquivo anexado a uma tarefa."""
    __tablename__ = "tarefa_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    tarefa_id = Column(Integer, ForeignKey("tarefas.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Metadados do arquivo para download e visualização.
    nome = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    tamanho = Column(Integer)  # bytes
    tipo = Column(String(100))  # Tipo MIME (formato do arquivo)
    
    # Carimbos de data/hora
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Referências à tarefa e ao autor do upload.
    tarefa = relationship("Tarefa", back_populates="attachments")
    user = relationship("User")
