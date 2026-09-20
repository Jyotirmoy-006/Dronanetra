"""
Feature normalization utilities for neural networks and ML models.
"""
from typing import Dict, Any


class TelemetryNormalizer:
    MIN_MAX = {
        "rpm": (1000.0, 6000.0),
        "egt": (500.0, 950.0),
        "cht": (60.0, 220.0),
        "vibration": (0.1, 10.0),
        "fuel_flow": (2.0, 45.0),
    }

    @classmethod
    def normalize(cls, features: Dict[str, float]) -> Dict[str, float]:
        norm = {}
        for key, val in features.items():
            if key in cls.MIN_MAX:
                min_v, max_v = cls.MIN_MAX[key]
                norm[key] = max(0.0, min(1.0, (val - min_v) / (max_v - min_v)))
            else:
                norm[key] = val
        return norm
