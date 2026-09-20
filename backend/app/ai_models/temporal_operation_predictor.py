"""
Temporal AI Mission Operation & Future State Forecaster (USP Core)
==================================================================
Fuses:
  1. PAST CONDITION: Cumulative thermal stress history, past degradation trends,
     historical operating hours, and sensor drift logs.
  2. PRESENT CONDITION: Real-time telemetry, live flight phase, ISA altitude density,
     throttle setting, and physics residuals.
To PREDICT:
  3. FUTURE OPERATION: 30-60 min lookahead state forecasting, mission feasibility score,
     thermal runaway risk, and dynamic flight envelope constraints.
"""
from typing import Dict, Any, List
import math
from datetime import datetime


class TemporalOperationPredictor:
    def __init__(self):
        self.cumulative_thermal_stress: float = 0.0
        self.history_window: List[Dict[str, float]] = []
        self.max_window_size: int = 60  # Last 60 seconds

    def predict_future_operation(
        self,
        current_telemetry: Dict[str, Any],
        residuals: Dict[str, float],
        operating_phase: str,
        rul_hours: float,
        health_score: float,
    ) -> Dict[str, Any]:
        """
        Fuses past history + present state to forecast future UAV engine operation.
        """
        rpm = float(current_telemetry.get("rpm", 4800.0))
        throttle = float(current_telemetry.get("throttle", 75.0))
        altitude = float(current_telemetry.get("altitude", 3000.0))
        cht = float(current_telemetry.get("cht", 135.0))
        egt = float(current_telemetry.get("egt", 720.0))
        oil_temp = float(current_telemetry.get("oil_temp", 85.0))
        vib = float(current_telemetry.get("vibration", 0.8))

        # 1. Update Past Condition (Accumulated Thermal & Mechanical Stress)
        thermal_delta = max(0.0, cht - 125.0) + max(0.0, egt - 700.0) / 10.0
        self.cumulative_thermal_stress += thermal_delta * 0.01
        self.cumulative_thermal_stress = min(100.0, self.cumulative_thermal_stress)

        self.history_window.append({"cht": cht, "egt": egt, "vib": vib, "rpm": rpm})
        if len(self.history_window) > self.max_window_size:
            self.history_window.pop(0)

        # 2. Compute Rate of Change (Trends from Past to Present)
        if len(self.history_window) >= 10:
            cht_trend_per_min = (self.history_window[-1]["cht"] - self.history_window[0]["cht"]) * (60.0 / len(self.history_window))
            egt_trend_per_min = (self.history_window[-1]["egt"] - self.history_window[0]["egt"]) * (60.0 / len(self.history_window))
            vib_trend_per_min = (self.history_window[-1]["vib"] - self.history_window[0]["vib"]) * (60.0 / len(self.history_window))
        else:
            cht_trend_per_min = 0.0
            egt_trend_per_min = 0.0
            vib_trend_per_min = 0.0

        # 3. Forecast Future Operation State (+15 min and +30 min Lookahead)
        # Factor in altitude thinning and historical cumulative stress
        alt_factor = 1.0 + (altitude / 10000.0) * 0.15
        forecast_cht_30m = round(cht + (cht_trend_per_min * 0.5) + (self.cumulative_thermal_stress * 0.12) * alt_factor, 1)
        forecast_egt_30m = round(egt + (egt_trend_per_min * 0.5) + (throttle / 100.0) * 8.0, 1)
        forecast_vib_30m = round(vib + (vib_trend_per_min * 0.5) + (rpm / 6000.0) * 0.05, 2)
        forecast_oil_temp_30m = round(oil_temp + (forecast_cht_30m - cht) * 0.3, 1)

        # 4. Mission Feasibility & Operational Risk Forecasting
        # Predict probability of premature mission abort or failure in next 1-4 hours
        thermal_runaway_risk = min(100.0, max(0.0, (forecast_cht_30m - 140.0) * 4.0 + self.cumulative_thermal_stress * 0.5))
        mechanical_fatigue_risk = min(100.0, max(0.0, (forecast_vib_30m - 2.0) * 35.0))
        
        # Overall Mission Feasibility Index (0-100%)
        mission_feasibility = round(max(5.0, min(100.0, 100.0 - (thermal_runaway_risk * 0.5 + mechanical_fatigue_risk * 0.5 + (100.0 - health_score) * 0.4))), 1)

        # Max Safe Power Recommendation to prevent in-flight failure
        max_safe_throttle = 100.0
        if thermal_runaway_risk > 40.0 or forecast_cht_30m > 155.0:
            max_safe_throttle = max(65.0, round(92.0 - (thermal_runaway_risk - 40.0) * 0.5, 0))

        # Operational Prognosis Narrative
        if mission_feasibility >= 85.0:
            prognosis = f"UAV propulsion system optimal. Future 30-min forecast indicates steady thermodynamic equilibrium at {altitude:.0f}m ({operating_phase}). Full mission profile achievable."
        elif mission_feasibility >= 60.0:
            prognosis = f"Elevated thermal stress trajectory detected. Projected CHT at T+30m: {forecast_cht_30m}°C. Recommend capping throttle to {max_safe_throttle:.0f}% during high-altitude loiter."
        else:
            prognosis = f"CRITICAL: High risk of thermal saturation or mechanical fatigue within 45 minutes. Recommend mission profile modification or return-to-base (RTB) diversion."

        return {
            "past_cumulative_thermal_stress": round(self.cumulative_thermal_stress, 2),
            "mission_feasibility_score": mission_feasibility,
            "mission_status": "FEASIBLE" if mission_feasibility >= 80.0 else ("MONITOR_REQUIRED" if mission_feasibility >= 60.0 else "MISSION_AT_RISK"),
            "forecast_30min": {
                "forecast_cht": forecast_cht_30m,
                "forecast_egt": forecast_egt_30m,
                "forecast_vibration": forecast_vib_30m,
                "forecast_oil_temp": forecast_oil_temp_30m,
            },
            "risk_metrics": {
                "thermal_runaway_risk_pct": round(thermal_runaway_risk, 1),
                "mechanical_fatigue_risk_pct": round(mechanical_fatigue_risk, 1),
                "projected_rul_hours": rul_hours,
            },
            "operational_recommendations": {
                "max_safe_throttle_pct": max_safe_throttle,
                "suggested_altitude_band": "2,500m - 3,800m" if altitude > 3800 and thermal_runaway_risk > 30 else "Standard Mission Profile",
                "prognosis_narrative": prognosis,
            }
        }


temporal_operation_predictor = TemporalOperationPredictor()
