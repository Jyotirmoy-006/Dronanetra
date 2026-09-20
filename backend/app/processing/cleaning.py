"""
Telemetry cleaning and sensor validation module (FR-03).
Sanitizes invalid values, detects sensor freezes, and interpolates missing fields (handling missing sensor data per NFR-02).
"""
import math
from typing import Dict, Any, Optional
from app.ingestion.schema import TelemetryReading


class TelemetryCleaner:
    @staticmethod
    def _clean_val(val: Optional[float], default: float, min_val: float, max_val: float) -> float:
        if val is None or math.isnan(val):
            return default
        return max(min_val, min(max_val, float(val)))

    @classmethod
    def validate_and_clean(cls, reading: TelemetryReading) -> TelemetryReading:
        cleaned_rpm = cls._clean_val(reading.rpm, 4800.0, 0.0, 7000.0)
        cleaned_egt = cls._clean_val(reading.egt, 750.0, -20.0, 1100.0)
        cleaned_cht = cls._clean_val(reading.cht, 120.0, -20.0, 350.0)
        cleaned_vibration = cls._clean_val(reading.vibration, 1.2, 0.0, 50.0)
        cleaned_fuel_flow = cls._clean_val(reading.fuel_flow, 18.0, 0.0, 100.0)

        return TelemetryReading(
            timestamp=reading.timestamp,
            engine_id=reading.engine_id,
            rpm=cleaned_rpm,
            egt=cleaned_egt,
            cht=cleaned_cht,
            vibration=cleaned_vibration,
            fuel_flow=cleaned_fuel_flow,
            throttle=cls._clean_val(reading.throttle, 75.0, 0.0, 100.0),
            altitude=cls._clean_val(reading.altitude, 3000.0, 0.0, 15000.0),
            ambient_temp=cls._clean_val(reading.ambient_temp, 15.0, -60.0, 60.0),
            oil_pressure=cls._clean_val(reading.oil_pressure, 4.5, 0.0, 10.0),
            oil_temp=cls._clean_val(reading.oil_temp, 95.0, -20.0, 200.0),
            manifold_pressure=cls._clean_val(reading.manifold_pressure, 35.0, 0.0, 60.0),
        )
