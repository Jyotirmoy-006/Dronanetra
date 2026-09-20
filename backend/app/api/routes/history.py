"""
GET /api/engine/history
Implements mission-replay / analytics data needs (Sections 16, 15).
"""
from fastapi import APIRouter
from app.database.crud import get_recent_history

router = APIRouter()


@router.get("/history")
def get_engine_history(limit: int = 100):
    history = get_recent_history(limit=limit)
    return {
        "count": len(history),
        "history": history,
    }
