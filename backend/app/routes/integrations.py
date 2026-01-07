"""
Placeholder for external API integrations (OMIE, Google, etc)
Reserved for future implementation
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
    Check integration status
    PLACEHOLDER - To be implemented
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
    Sync data with OMIE
    PLACEHOLDER - To be implemented
    
    Future implementation will:
    - Fetch clients from OMIE API
    - Sync financial data
    - Update MRR values
    - Send payroll entries
    """
    return {
        "status": "not_implemented",
        "message": "OMIE sync will be implemented in future version"
    }


@router.post("/external/webhook")
async def external_webhook(data: dict):
    """
    Receive data from external APIs
    PLACEHOLDER - To be implemented
    
    This endpoint will receive webhooks from:
    - OMIE (new clients, payment updates)
    - Google (calendar events, drive files)
    - Slack (notifications)
    - Other integrations
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
    Fetch clients from OMIE
    PLACEHOLDER - To be implemented
    """
    return {
        "status": "not_implemented",
        "clients": [],
        "message": "OMIE client fetch will be implemented in future version"
    }
