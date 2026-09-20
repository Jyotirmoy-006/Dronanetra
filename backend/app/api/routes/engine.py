"""
GET /api/engine/live, POST /api/engine/inject-fault, POST /api/engine/set-scenario
Implements live telemetry snapshot, critical fault injection, and environmental scenarios.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from app.digital_twin.twin_state import twin_state
from app.ingestion.simulator import simulator

router = APIRouter()


class FaultInjectRequest(BaseModel):
    fault_type: str  # NONE | OVERHEATING | MISFIRE | HIGH_VIBRATION | FUEL_RESTRICTION | SENSOR_DRIFT | LUBRICATION_LOSS | COOLING_LOSS


class ScenarioRequest(BaseModel):
    scenario: str  # NOMINAL | HIGH_ALTITUDE | HOT_WEATHER | RAPID_THROTTLE


class GeminiAdvisorRequest(BaseModel):
    issue_type: str = "GENERAL"
    custom_query: str = ""
    current_rul: float = 398.0
    confidence: float = 0.84


@router.post("/gemini-rul-advisor")
async def get_gemini_rul_advisor(req: GeminiAdvisorRequest):
    """
    Calls Google Gemini AI / DRDO Expert Model to diagnose RUL anomalies,
    provide chart-wise recommendations, stability indices, and TBO extension maintenance.
    """
    from app.decision_engine.gemini_advisor import generate_gemini_rul_advice
    state = twin_state.get_full_state()
    telemetry = state.get("telemetry", {})
    anomaly_score = state.get("anomaly_score", 0.05)
    
    advice = await generate_gemini_rul_advice(
        telemetry=telemetry,
        current_rul=req.current_rul or state.get("rul_hours", 398.0),
        confidence=req.confidence or state.get("confidence", 0.84),
        anomaly_score=anomaly_score,
        issue_type=req.issue_type,
        custom_query=req.custom_query,
    )
    return {
        "status": "SUCCESS",
        "data": advice,
    }


@router.get("/live")
def get_live_telemetry():
    """Returns the live snapshot of engine telemetry and physics expected values."""
    reading = simulator.generate_reading()
    state = twin_state.update_telemetry(reading)
    return state


@router.get("/can-bus")
def get_can_bus_frames():
    """Returns live decoded SAE J1939 CAN Bus frames and network telemetry."""
    from app.ingestion.can_interface import can_manager
    state = twin_state.get_full_state()
    return {
        "status": "ONLINE",
        "engine_id": twin_state.engine_id,
        "metrics": state.get("can_bus_metrics", {}),
        "active_frames": state.get("can_frames", []),
        "rolling_buffer": can_manager.rolling_frames,
    }


@router.get("/maintenance")
def get_maintenance_advisory():
    """Returns live component wear tracking and actionable maintenance advisory."""
    state = twin_state.get_full_state()
    return {
        "status": "ONLINE",
        "engine_id": twin_state.engine_id,
        "advisory": state.get("maintenance_advisory", {}),
        "components": state.get("component_lifecycle", []),
        "tasks": state.get("maintenance_tasks", []),
    }


@router.post("/inject-fault")
def inject_fault(req: FaultInjectRequest):
    """Dynamically inject a critical failure mode into the engine simulation."""
    simulator.set_fault(req.fault_type)
    twin_state.fault_status = req.fault_type if req.fault_type != "NONE" else "NORMAL"
    return {
        "status": "SUCCESS",
        "injected_fault": req.fault_type,
        "message": f"Engine fault condition updated to: {req.fault_type}",
    }


@router.post("/set-scenario")
def set_scenario(req: ScenarioRequest):
    """Set environmental mission scenario (High Altitude, Hot Weather, Rapid Throttle)."""
    simulator.set_scenario(req.scenario)
    return {
        "status": "SUCCESS",
        "active_scenario": req.scenario,
        "message": f"Flight environment scenario updated to: {req.scenario}",
    }
