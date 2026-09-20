"""
Feature engineering module (FR-03). Derives thermodynamic ratios and sliding statistics.
"""
from typing import Dict, Any


def extract_features(telemetry: Dict[str, Any], residuals: Dict[str, Any]) -> Dict[str, float]:
    """
    Computes derived AI input features:
    - EGT/CHT thermal ratio
    - Vibration-to-RPM mechanical ratio
    - Specific fuel consumption proxy
    - Physics residuals
    """
    rpm = telemetry.get("rpm", 4800.0)
    egt = telemetry.get("egt", 750.0)
    cht = telemetry.get("cht", 120.0)
    fuel_flow = telemetry.get("fuel_flow", 18.0)
    vibration = telemetry.get("vibration", 1.2)

    thermal_ratio = egt / (cht + 1.0)
    vib_rpm_ratio = vibration / (rpm / 1000.0 + 0.1)
    sfc_proxy = fuel_flow / (rpm / 1000.0 + 0.1)

    return {
        "rpm": rpm,
        "egt": egt,
        "cht": cht,
        "vibration": vibration,
        "fuel_flow": fuel_flow,
        "thermal_ratio": round(thermal_ratio, 3),
        "vib_rpm_ratio": round(vib_rpm_ratio, 4),
        "sfc_proxy": round(sfc_proxy, 3),
        "egt_residual": residuals.get("egt_residual", 0.0),
        "cht_residual": residuals.get("cht_residual", 0.0),
        "fuel_flow_residual": residuals.get("fuel_flow_residual", 0.0),
        "vibration_residual": residuals.get("vibration_residual", 0.0),
    }
