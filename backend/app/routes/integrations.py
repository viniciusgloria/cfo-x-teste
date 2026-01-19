"""
Espaco reservado para integracoes com APIs externas (OMIE, Google, etc)
Reservado para implementacao futura
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
from ..dependencies import get_current_admin

router = APIRouter(prefix="/integrations", tags=["Integrations"])


@router.get("/status")
async def integration_status(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Verifica status das integracoes
    RESERVADO - A implementar
    """
    return {
        "omie": {
            "enabled": False,
            "status": "not_configured",
            "message": "OMIE integration not yet implemented"
        },
        "google": {
            "enabled": False,
            "status": "not_configured",
            "message": "Google integration not yet implemented"
        },
        "slack": {
            "enabled": False,
            "status": "not_configured",
            "message": "Slack integration not yet implemented"
        }
    }


@router.post("/omie/sync")
async def sync_omie(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Sincroniza dados com OMIE
    RESERVADO - A implementar
    
    Implementacao futura deve:
    - Buscar clientes na API da OMIE
    - Sincronizar dados financeiros
    - Atualizar valores de MRR
    - Enviar itens de folha
    """
    return {
        "status": "not_implemented",
        "message": "OMIE sync will be implemented in future version"
    }


@router.post("/external/webhook")
async def external_webhook(data: dict):
    """
    Recebe dados de APIs externas
    RESERVADO - A implementar
    
    Este endpoint deve receber webhooks de:
    - OMIE (novos clientes, atualizacoes de pagamento)
    - Google (eventos de calendario, arquivos do Drive)
    - Slack (notificacoes)
    - Outras integracoes
    """
    return {
        "status": "received",
        "message": "Webhook processing not yet implemented",
        "data_received": data
    }


@router.get("/omie/clients")
async def fetch_omie_clients(
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Busca clientes na OMIE
    RESERVADO - A implementar
    """
    return {
        "status": "not_implemented",
        "clients": [],
        "message": "OMIE client fetch will be implemented in future version"
    }
