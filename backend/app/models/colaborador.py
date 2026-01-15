"""
Modelo de Colaborador - perfil estendido do usuário.

Armazena dados de RH que não pertencem à tabela principal de usuários.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Date, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base


class Colaborador(Base):
    """Perfil de RH ligado a um User."""
    __tablename__ = "colaboradores"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Dados pessoais.
    cpf = Column(String(14), unique=True)
    rg = Column(String(20))
    data_nascimento = Column(Date)
    estado_civil = Column(String(50))
    
    # Endereço.
    endereco = Column(String(500))
    cidade = Column(String(100))
    estado = Column(String(2))
    cep = Column(String(10))
    
    # Datas de vínculo e informações salariais.
    data_admissao = Column(Date)
    data_demissao = Column(Date)
    salario = Column(Float)
    banco_horas = Column(Float, default=0)  # Horas
    
    # Campos específicos para PJ.
    cnpj = Column(String(18))  # Para colaboradores PJ
    meta_horas = Column(Float)  # Meta mensal de horas para PJ
    
    # Armazenado como JSON com URLs de documentos.
    documentos = Column(Text)
    
    # Contato de emergência.
    contato_emergencia = Column(String(255))
    telefone_emergencia = Column(String(20))
    
    # Toggle para ativar/desativar colaborador.
    ativo = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relação um-para-um com User via user_id.
    user = relationship("User", backref="colaborador_profile")
