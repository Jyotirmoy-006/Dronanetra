"""
Common interface all anomaly/fault/RUL models must implement (NFR-04
Modularity) so models are swappable without touching calling code.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict


class PredictionResult:
    def __init__(self, value: Any, confidence: float, details: Dict[str, Any] | None = None):
        self.value = value
        self.confidence = confidence
        self.details = details or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "value": self.value,
            "confidence": self.confidence,
            "details": self.details,
        }


class BaseModel(ABC):
    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> PredictionResult:
        ...
