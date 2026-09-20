"""
Conventional Threshold-Based Monitoring Engine (Preserved Baseline)
===================================================================
Evaluates multi-sensor telemetry against conventional static redline and
caution thresholds (e.g. standard operating limits for aero piston engines).
Provides conventional threshold health score, breached parameter audit,
and threshold-triggered alarm status.
"""
from typing import Dict, Any, List
from pydantic import BaseModel


class BreachedParameter(BaseModel):
    parameter: str
    current_value: float
    unit: str
    limit_type: str  # "CAUTION_HIGH" | "CAUTION_LOW" | "REDLINE_HIGH" | "REDLINE_LOW"
    threshold_limit: float
    severity: str  # "CAUTION" | "CRITICAL"


class ThresholdEvaluationResult(BaseModel):
    status: str  # "NORMAL" | "CAUTION" | "CRITICAL"
    health_score: float  # 0.0 to 100.0% based strictly on threshold margins
    breached_parameters: List[BreachedParameter]
    summary: str


class ConventionalThresholdMonitor:
    """
    Evaluates real-time engine telemetry against standard static operating limits:
    - RPM: Idle 1200 - Max 5800 RPM (Caution > 5500, Redline > 5800, Low Idle < 1000)
    - EGT: Normal 600-780 °C (Caution > 780 °C, Redline > 850 °C)
    - CHT: Normal 80-140 °C (Caution > 145 °C, Redline > 165 °C)
    - Oil Pressure: Normal 2.5-5.0 bar (Caution < 2.0 bar, Redline < 1.5 or > 6.0 bar)
    - Oil Temp: Normal 70-100 °C (Caution > 105 °C, Redline > 120 °C)
    - Vibration: Normal 0.1-2.2 mm/s (Caution > 2.5 mm/s, Redline > 3.5 mm/s)
    - Fuel Flow: Normal 1.0-26.0 L/h (Caution > 27.0 L/h, Redline > 32.0 L/h)
    - Bus Voltage: Normal 24.0-30.0 V (Caution < 24.0 V, Redline < 22.0 or > 32.0 V)
    """

    LIMITS = {
        "rpm": {
            "unit": "RPM",
            "caution_high": 5500.0,
            "redline_high": 5800.0,
            "redline_low": 1000.0,
        },
        "egt": {
            "unit": "°C",
            "caution_high": 780.0,
            "redline_high": 850.0,
        },
        "cht": {
            "unit": "°C",
            "caution_high": 145.0,
            "redline_high": 165.0,
        },
        "oil_pressure": {
            "unit": "bar",
            "caution_low": 2.0,
            "redline_low": 1.5,
            "redline_high": 6.0,
        },
        "oil_temp": {
            "unit": "°C",
            "caution_high": 105.0,
            "redline_high": 120.0,
        },
        "vibration": {
            "unit": "mm/s",
            "caution_high": 2.5,
            "redline_high": 3.5,
        },
        "fuel_flow": {
            "unit": "L/h",
            "caution_high": 27.0,
            "redline_high": 32.0,
        },
        "bus_voltage": {
            "unit": "V",
            "caution_low": 24.0,
            "redline_low": 22.0,
            "redline_high": 32.0,
        },
    }

    def evaluate(self, telemetry: Dict[str, Any]) -> ThresholdEvaluationResult:
        breaches: List[BreachedParameter] = []
        critical_count = 0
        caution_count = 0

        for param, limits in self.LIMITS.items():
            if param not in telemetry or telemetry[param] is None:
                continue

            val = float(telemetry[param])
            unit = limits["unit"]

            # Redline High
            if "redline_high" in limits and val >= limits["redline_high"]:
                breaches.append(BreachedParameter(
                    parameter=param.upper(),
                    current_value=round(val, 2),
                    unit=unit,
                    limit_type="REDLINE_HIGH",
                    threshold_limit=limits["redline_high"],
                    severity="CRITICAL",
                ))
                critical_count += 1
            # Redline Low
            elif "redline_low" in limits and val <= limits["redline_low"]:
                breaches.append(BreachedParameter(
                    parameter=param.upper(),
                    current_value=round(val, 2),
                    unit=unit,
                    limit_type="REDLINE_LOW",
                    threshold_limit=limits["redline_low"],
                    severity="CRITICAL",
                ))
                critical_count += 1
            # Caution High
            elif "caution_high" in limits and val >= limits["caution_high"]:
                breaches.append(BreachedParameter(
                    parameter=param.upper(),
                    current_value=round(val, 2),
                    unit=unit,
                    limit_type="CAUTION_HIGH",
                    threshold_limit=limits["caution_high"],
                    severity="CAUTION",
                ))
                caution_count += 1
            # Caution Low
            elif "caution_low" in limits and val <= limits["caution_low"]:
                breaches.append(BreachedParameter(
                    parameter=param.upper(),
                    current_value=round(val, 2),
                    unit=unit,
                    limit_type="CAUTION_LOW",
                    threshold_limit=limits["caution_low"],
                    severity="CAUTION",
                ))
                caution_count += 1

        # Calculate threshold health score (100 base, penalizing breaches)
        penalty = (critical_count * 35.0) + (caution_count * 12.0)
        health_score = max(0.0, min(100.0, 100.0 - penalty))

        if critical_count > 0:
            status = "CRITICAL"
            summary = f"{critical_count} parameter(s) exceeded critical redline limits."
        elif caution_count > 0:
            status = "CAUTION"
            summary = f"{caution_count} parameter(s) in caution advisory range."
        else:
            status = "NORMAL"
            summary = "All parameters within standard static operating thresholds."

        return ThresholdEvaluationResult(
            status=status,
            health_score=round(health_score, 1),
            breached_parameters=breaches,
            summary=summary,
        )


threshold_monitor = ConventionalThresholdMonitor()
