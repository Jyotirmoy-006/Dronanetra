"""
Dual-Engine Alert Management Engine
===================================
Generates and maintains severity-based alerts (Normal / Advisory / Warning / Critical)
originating from BOTH:
1. Conventional Threshold Monitor (static redline/caution limits)
2. AI & Physics Digital Twin Predictor (early residual drift, ML fault detection, RUL degradation)
"""
from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class AlertItem(BaseModel):
    alert_id: str
    timestamp: str
    severity: str  # NORMAL | ADVISORY | WARNING | CRITICAL
    source_engine: str  # "THRESHOLD" | "AI_PHYSICS"
    parameter: str
    reason: str
    confidence: float
    recommended_action: str
    icon: str


class AlertManager:
    def __init__(self):
        self.alert_history: List[AlertItem] = []

    def evaluate(
        self,
        telemetry: Dict[str, Any],
        residuals: Dict[str, Any],
        anomaly_score: float,
        fault_status: str,
        threshold_state: Optional[Dict[str, Any]] = None,
    ) -> List[AlertItem]:
        active_alerts: List[AlertItem] = []
        now_str = datetime.utcnow().isoformat()

        # 1. Conventional Threshold Alerts (Static Boundaries)
        if threshold_state and threshold_state.get("breached_parameters"):
            for breach in threshold_state["breached_parameters"]:
                sev = "CRITICAL" if breach["severity"] == "CRITICAL" else "WARNING"
                icon = "🔴" if sev == "CRITICAL" else "🟠"
                active_alerts.append(AlertItem(
                    alert_id=f"ALT-TH-{breach['parameter']}-{int(datetime.utcnow().timestamp())}",
                    timestamp=now_str,
                    severity=sev,
                    source_engine="THRESHOLD",
                    parameter=breach["parameter"],
                    reason=f"Conventional threshold breach: {breach['parameter']} reached {breach['current_value']} {breach['unit']} (Limit: {breach['threshold_limit']} {breach['unit']})",
                    confidence=1.0,
                    recommended_action="Inspect engine subsystem immediately; verify operating power settings.",
                    icon=icon,
                ))

        # 2. AI & Physics Digital Twin Predictive Alerts (ISP #1 & ISP #2)
        # AI-Detected Fault Status Alert
        if fault_status and fault_status not in ["NORMAL", "HEALTHY"]:
            sev = "CRITICAL" if fault_status in ["CYLINDER_OVERHEATING", "IGNITION_MISFIRE"] else "WARNING"
            icon = "🔴" if sev == "CRITICAL" else "🟠"
            active_alerts.append(AlertItem(
                alert_id=f"ALT-AI-FAULT-{int(datetime.utcnow().timestamp())}",
                timestamp=now_str,
                severity=sev,
                source_engine="AI_PHYSICS",
                parameter="AI Fault Classifier",
                reason=f"Multi-class ML model detected active fault pattern: {fault_status}",
                confidence=0.92,
                recommended_action=f"Execute condition-based check for {fault_status}; review SHAP feature contributions.",
                icon=icon,
            ))

        # Physics Residual Early Drift Alert (Detected BEFORE threshold breach)
        egt_res = abs(residuals.get("egt_residual", 0.0))
        cht_res = abs(residuals.get("cht_residual", 0.0))
        vib_res = abs(residuals.get("vibration_residual", 0.0))
        if (egt_res > 40.0 or cht_res > 20.0 or vib_res > 1.5) and not any(a.source_engine == "AI_PHYSICS" for a in active_alerts):
            active_alerts.append(AlertItem(
                alert_id=f"ALT-AI-RES-{int(datetime.utcnow().timestamp())}",
                timestamp=now_str,
                severity="ADVISORY",
                source_engine="AI_PHYSICS",
                parameter="Thermodynamic Residual",
                reason=f"Physics baseline deviation detected (ΔEGT: {egt_res:.1f}°C, ΔCHT: {cht_res:.1f}°C, ΔVib: {vib_res:.2f} mm/s)",
                confidence=0.88,
                recommended_action="Early degradation indicator. Monitor thermal trend; cross-reference flight phase.",
                icon="🟡",
            ))

        # Anomaly Score Advisory
        if anomaly_score > 0.45 and not active_alerts:
            active_alerts.append(AlertItem(
                alert_id=f"ALT-AI-ANOM-{int(datetime.utcnow().timestamp())}",
                timestamp=now_str,
                severity="ADVISORY",
                source_engine="AI_PHYSICS",
                parameter="Anomaly Isolation Forest",
                reason=f"Elevated statistical anomaly score ({anomaly_score:.2f}) detected across multi-sensor vector.",
                confidence=0.85,
                recommended_action="Autonomous telemetry logging active; inspect historical correlation matrix.",
                icon="🟡",
            ))

        # Record into history (deduplicated)
        for a in active_alerts:
            if not any(h.alert_id == a.alert_id for h in self.alert_history):
                self.alert_history.insert(0, a)

        return active_alerts


alert_manager = AlertManager()
