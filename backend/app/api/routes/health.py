"""
GET /api/engine/health
Implements FR-05/FR-06/FR-07: exposes health score, status, anomaly score,
confidence, threshold analysis, and AI predictions (always paired).
"""
from fastapi import APIRouter
from app.digital_twin.twin_state import twin_state
from app.explainability.shap_explainer import explainer

router = APIRouter()


@router.get("/health")
def get_engine_health():
    state = twin_state.get_full_state()
    residuals = state.get("residuals", {})
    anomaly_score = state.get("anomaly_score", 0.08)

    explanation = explainer.explain_anomaly(
        telemetry=state.get("telemetry", {}),
        residuals=residuals,
        anomaly_score=anomaly_score,
    )

    return {
        "engine_id": state.get("engine_id", "ENG-ROTAX-914-01"),
        "health_score": state.get("health_score", 98.5),
        "status": "HEALTHY" if state.get("health_score", 98.5) > 85.0 else ("WARNING" if state.get("health_score", 98.5) > 60.0 else "CRITICAL"),
        "anomaly_score": anomaly_score,
        "fault_status": state.get("fault_status", "NORMAL"),
        "fault_probabilities": state.get("fault_probabilities", {}),
        "rul_hours": state.get("rul_hours", 450.0),
        "confidence": state.get("confidence", 0.94),
        "threshold_analysis": state.get("threshold_analysis", {}),
        "ai_prediction": state.get("ai_prediction", {}),
        "explanation": explanation,
    }
