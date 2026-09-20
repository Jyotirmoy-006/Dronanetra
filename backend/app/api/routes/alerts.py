"""
GET /api/alerts
Implements Section 14 (Alert Management): severity-based alerts with
timestamp, parameter, reason, confidence, recommended action.
Also supports POST /api/alerts/fault-inject for live GCS demo testing.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.decision_engine.alert_manager import alert_manager
from app.digital_twin.twin_state import twin_state
from app.ingestion.simulator import simulator

router = APIRouter()


class FaultInjectRequest(BaseModel):
    fault_type: str  # NONE | OVERHEATING | MISFIRE | HIGH_VIBRATION | FUEL_RESTRICTION


@router.get("")
def list_alerts():
    state = twin_state.get_full_state()
    telemetry = state.get("telemetry", {})
    residuals = state.get("residuals", {})
    anomaly_score = state.get("anomaly_score", 0.05)

    alerts = alert_manager.evaluate(
        telemetry=telemetry,
        residuals=residuals,
        anomaly_score=anomaly_score,
        fault_status=state.get("fault_status", "NORMAL"),
    )
    return {
        "active_alerts": alerts,
        "history": alert_manager.alert_history,
        "total_active": len(alerts),
    }


@router.post("/fault-inject")
def inject_fault(req: FaultInjectRequest):
    """Dynamically inject a fault into the simulated engine to trigger real-time alerts."""
    simulator.set_fault(req.fault_type)
    twin_state.fault_status = req.fault_type if req.fault_type != "NONE" else "NORMAL"
    if req.fault_type != "NONE":
        twin_state.anomaly_score = 0.78
        twin_state.health_score = 48.5
    else:
        twin_state.anomaly_score = 0.05
        twin_state.health_score = 98.5

    return {
        "message": f"Engine fault injection state updated to {req.fault_type}",
        "current_fault": req.fault_type,
    }
