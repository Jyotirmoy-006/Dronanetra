"""
WebSocket endpoint (/ws/engine) for pushing live telemetry/health/alerts to
the React dashboard. See CONTEXT.md Deviation D-4.
Pushes synchronized dual-engine state:
1. Conventional Threshold Analysis (preserved static limits)
2. AI & Physics Digital Twin Predictive Analytics (ISP #1 & ISP #2)
"""
import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.ingestion.simulator import simulator
from app.digital_twin.twin_state import twin_state
from app.decision_engine.alert_manager import alert_manager
from app.explainability.shap_explainer import explainer
from app.database.crud import log_telemetry_snapshot

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws/engine")
async def engine_stream(websocket: WebSocket):
    await websocket.accept()
    logger.info("React GCS dashboard connected via WebSocket /ws/engine")
    try:
        while True:
            # 1. Generate live telemetry reading
            reading = simulator.generate_reading()

            # 2. Update Digital Twin State (executes both Threshold + AI/Physics engines)
            full_state = twin_state.update_telemetry(reading)

            # 3. Calculate Explainability (SHAP feature attribution)
            explanation = explainer.explain_anomaly(
                telemetry=reading.dict(),
                residuals=full_state["residuals"],
                anomaly_score=full_state["anomaly_score"],
            )

            # 4. Evaluate Alert Manager across both engines
            active_alerts = alert_manager.evaluate(
                telemetry=reading.dict(),
                residuals=full_state["residuals"],
                anomaly_score=full_state["anomaly_score"],
                fault_status=full_state["fault_status"],
                threshold_state=full_state.get("threshold_analysis"),
            )

            payload = {
                "timestamp": reading.timestamp.isoformat(),
                "engine_id": twin_state.engine_id,
                "engine_type": twin_state.engine_type,
                "operating_phase": full_state["operating_phase"],
                "telemetry": reading.dict(),
                "expected_physics": full_state["expected_physics"],
                "residuals": full_state["residuals"],
                "health_score": full_state["health_score"],
                "anomaly_score": full_state["anomaly_score"],
                "fault_status": full_state["fault_status"],
                "fault_probabilities": full_state.get("fault_probabilities", {}),
                "rul_hours": full_state["rul_hours"],
                "confidence": full_state["confidence"],
                "rul_trajectory": full_state.get("rul_trajectory", []),
                "threshold_analysis": full_state.get("threshold_analysis", {}),
                "ai_prediction": full_state.get("ai_prediction", {}),
                "temporal_prediction": full_state.get("temporal_prediction", {}),
                "mission_forecast": full_state.get("mission_forecast", {}),
                "explanation": explanation,
                "can_frames": full_state.get("can_frames", []),
                "can_bus_metrics": full_state.get("can_bus_metrics", {}),
                "component_lifecycle": full_state.get("component_lifecycle", []),
                "maintenance_tasks": full_state.get("maintenance_tasks", []),
                "maintenance_advisory": full_state.get("maintenance_advisory", {}),
                "active_alerts": [a.dict() for a in active_alerts],
            }

            # Log to historical memory buffer
            log_telemetry_snapshot(payload)

            # Push to React GCS dashboard client
            await websocket.send_text(json.dumps(payload, default=str))

            # Push at 1 Hz update rate
            await asyncio.sleep(1.0)

    except WebSocketDisconnect:
        logger.info("React GCS dashboard client disconnected")
    except Exception as e:
        logger.error(f"WebSocket engine stream error: {e}")
        try:
            await websocket.close()
        except Exception:
            pass
