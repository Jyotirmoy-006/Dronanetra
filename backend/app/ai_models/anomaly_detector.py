"""
AI Anomaly Detection Engine (FR-05 / ISP #1)
============================================
Combines trained Scikit-Learn IsolationForest model with physics residual
distance scoring to output continuous anomaly scores (0.00 to 1.00)
and severity classifications.
"""
import os
import warnings
warnings.filterwarnings("ignore")
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any
from app.ai_models.base import BaseModel, PredictionResult

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "models", "saved_models"))


class AnomalyDetector(BaseModel):
    def __init__(self, model_filename: str = "anomaly_isolation_forest.joblib"):
        self.model_path = os.path.join(MODELS_DIR, model_filename)
        self.model = None
        self.features = ["rpm", "egt", "cht", "vibration", "fuel_flow"]
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Warning: Failed to load Anomaly Detector at {self.model_path}: {e}")

    def predict(self, features: Dict[str, Any]) -> PredictionResult:
        """
        Computes continuous anomaly score between 0.00 and 1.00:
        - 0.00 to 0.30: Normal
        - 0.30 to 0.60: Warning / Advisory
        - 0.60 to 1.00: Critical Anomaly
        """
        residuals = features.get("residuals", {})
        
        # 1. Physics Residual Distance Score
        egt_res = abs(residuals.get("egt_residual", 0.0))
        cht_res = abs(residuals.get("cht_residual", 0.0))
        vib_res = abs(residuals.get("vibration_residual", 0.0))
        ff_res = abs(residuals.get("fuel_flow_residual", 0.0))

        # Normalized residual distance
        residual_distance = (egt_res / 60.0) * 0.35 + (cht_res / 30.0) * 0.30 + (vib_res / 2.0) * 0.25 + (ff_res / 5.0) * 0.10

        # 2. Machine Learning Isolation Forest Score
        ml_score = 0.10
        if self.model:
            try:
                input_row = [
                    features.get("rpm", 4800.0),
                    features.get("egt", 720.0),
                    features.get("cht", 135.0),
                    features.get("vibration", 0.8),
                    features.get("fuel_flow", 18.0),
                ]
                df_in = pd.DataFrame([input_row], columns=self.features)
                # score_samples returns negative anomaly score (lower is more anomalous)
                raw_score = float(self.model.score_samples(df_in)[0])
                # Map roughly [-0.8, -0.3] to [1.0, 0.0]
                ml_score = max(0.0, min(1.0, (-raw_score - 0.35) * 2.5))
            except Exception:
                ml_score = min(1.0, residual_distance)

        # 3. Hybrid Anomaly Score (60% Physics Residuals + 40% ML Model)
        hybrid_score = round(min(1.0, max(0.02, 0.60 * residual_distance + 0.40 * ml_score)), 3)

        confidence = round(0.92 if self.model else 0.82, 2)

        return PredictionResult(
            value=hybrid_score,
            confidence=confidence,
            details={
                "physics_residual_score": round(residual_distance, 3),
                "ml_isolation_score": round(ml_score, 3),
                "model_used": os.path.basename(self.model_path) if self.model else "Physics Empirical Proxy",
            }
        )


anomaly_detector = AnomalyDetector()
