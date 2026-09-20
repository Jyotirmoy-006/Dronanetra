"""
Implements FR-08: Explainable AI with feature importance & residual SHAP contribution proxies.
Provides exact numerical contributing factors for anomalies instead of black-box outputs.
"""
from typing import Dict, Any, List


class TelemetryExplainer:
    @staticmethod
    def explain_anomaly(
        telemetry: Dict[str, Any],
        residuals: Dict[str, Any],
        anomaly_score: float
    ) -> Dict[str, Any]:
        """
        Computes normalized feature contribution percentages (SHAP proxy)
        explaining why an anomaly or health degradation occurred.
        """
        contributions = {}

        egt_res = abs(residuals.get("egt_residual", 0.0))
        cht_res = abs(residuals.get("cht_residual", 0.0))
        vib_res = abs(residuals.get("vibration_residual", 0.0)) * 20.0
        ff_res = abs(residuals.get("fuel_flow_residual", 0.0)) * 6.0
        oil_temp_res = abs(telemetry.get("oil_temp", 85.0) - 85.0) * 0.8
        oil_press_res = max(0.0, 4.0 - telemetry.get("oil_pressure", 4.0)) * 15.0

        total_weight = egt_res + cht_res + vib_res + ff_res + oil_temp_res + oil_press_res + 0.001

        contributions = [
            {"feature": "Exhaust Gas Temp (EGT)", "impact": round((egt_res / total_weight) * 100, 1), "unit": "°C", "subsystem": "Combustion / Thermal"},
            {"feature": "Cylinder Head Temp (CHT)", "impact": round((cht_res / total_weight) * 100, 1), "unit": "°C", "subsystem": "Cooling System"},
            {"feature": "Mechanical Vibration", "impact": round((vib_res / total_weight) * 100, 1), "unit": "mm/s", "subsystem": "Crankshaft / Mounts"},
            {"feature": "Fuel Flow Rate", "impact": round((ff_res / total_weight) * 100, 1), "unit": "L/h", "subsystem": "Injection / Metering"},
            {"feature": "Lubrication Oil Pressure", "impact": round((oil_press_res / total_weight) * 100, 1), "unit": "bar", "subsystem": "Lubrication"},
            {"feature": "Oil Temperature", "impact": round((oil_temp_res / total_weight) * 100, 1), "unit": "°C", "subsystem": "Oil Cooler"},
        ]

        # Sort descending by impact
        contributions.sort(key=lambda x: x["impact"], reverse=True)

        primary_driver = contributions[0]["feature"] if anomaly_score > 0.25 else "Nominal Operation"
        primary_subsystem = contributions[0]["subsystem"] if anomaly_score > 0.25 else "All Systems Nominal"

        narrative = (
            f"Nominal operating parameters across all engine sub-systems. Telemetry adheres to thermodynamic baseline."
            if anomaly_score <= 0.25
            else f"Telemetry deviation (Score: {anomaly_score:.2f}) primarily driven by {primary_driver} ({contributions[0]['impact']}%) in {primary_subsystem}."
        )

        return {
            "anomaly_score": anomaly_score,
            "primary_driver": primary_driver,
            "primary_subsystem": primary_subsystem,
            "feature_contributions": contributions,
            "explanation": narrative,
        }


explainer = TelemetryExplainer()
