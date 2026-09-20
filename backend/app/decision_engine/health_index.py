"""
Implements Section 13: overall engine Health Index combining sensor health,
anomaly score, physics-model residual, fault probability, and degradation estimate.
"""
from typing import Dict, Any


def calculate_health_index(
    anomaly_score: float,
    residuals: Dict[str, float],
    fault_probabilities: Dict[str, float]
) -> float:
    """
    Computes single 0.0 - 100.0% engine health score.
    - Base score = 100.0
    - Anomaly score penalty (weight 40%)
    - Physics residuals penalty (weight 30%)
    - Max fault probability penalty (weight 30%)
    """
    base = 100.0

    # Anomaly penalty (score is 0.0 to 1.0)
    anomaly_penalty = anomaly_score * 40.0

    # Physics residual penalty
    egt_res = abs(residuals.get("egt_residual", 0.0))
    cht_res = abs(residuals.get("cht_residual", 0.0))
    vib_res = abs(residuals.get("vibration_residual", 0.0))

    # EGT > 50°C off expected gives penalty
    residual_penalty = min(30.0, (egt_res / 10.0) + (cht_res / 5.0) + (vib_res * 5.0))

    # Fault probability penalty
    max_fault_prob = max(fault_probabilities.values()) if fault_probabilities else 0.0
    fault_penalty = max_fault_prob * 30.0

    health_score = base - (anomaly_penalty + residual_penalty + fault_penalty)
    return round(max(0.0, min(100.0, health_score)), 1)
