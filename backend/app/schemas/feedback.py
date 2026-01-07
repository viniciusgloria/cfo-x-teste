"""
Feedback schemas
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.feedback import TipoFeedback


class FeedbackCreate(BaseModel):
    """Create feedback"""
    destinatario_id: int
    tipo: TipoFeedback
    titulo: str
    mensagem: str
    okr_id: Optional[int] = None
    tarefa_id: Optional[int] = None


class FeedbackResponse(BaseModel):
    """Feedback response"""
    id: int
    remetente_id: int
    destinatario_id: int
    tipo: TipoFeedback
    titulo: str
    mensagem: str
    okr_id: Optional[int] = None
    tarefa_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
