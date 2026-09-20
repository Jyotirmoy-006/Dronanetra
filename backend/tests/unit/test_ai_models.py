"""
Unit Tests for Machine Learning Prognostic Models & Temporal Predictor (FR-05, FR-06, FR-07, FR-08)
"""
import pytest
from app.ai_models.anomaly_detector import anomaly_detector
from app.ai_models.fault_classifier import fault_classifier
from app.ai_models.rul_predictor import rul_predictor
from app.ai_models.temporal_operation_predictor import temporal_operation_predictor
from app.explainability.shap_explainer import explainer


def test_anomaly_detector_inference():
    features = {
        "rpm": 4800.0,
        "throttle": 75.0,
        "egt": 725.0,
        "cht": 135.0,
        "vibration": 0.8,
        "fuel_flow": 18.0,
        "oil_pressure": 4.2,
        "oil_temp": 85.0,
        "egt_residual": 5.0,
        "cht_residual": 2.0,
        "fuel_flow_residual": 0.2,
        "vibration_residual": 0.05,
    }
    result = anomaly_detector.predict(features)
    assert 0.0 <= result.value <= 1.0
    assert result.confidence > 0.0


def test_fault_classifier_inference():
    features = {
        "rpm": 4800.0,
        "throttle_pct": 75.0,
        "egt_c": 720.0,
        "cht_c": 135.0,
        "vibration_g": 0.8,
        "fuel_flow_gph": 18.0,
        "oil_pressure_bar": 4.2,
        "oil_temp_c": 85.0,
    }
    result = fault_classifier.predict(features)
    assert isinstance(result.value, str)
    assert len(result.value) > 0
    assert result.confidence > 0.0
    assert "probabilities" in result.details


def test_rul_predictor_inference():
    features = {
        "rpm": 4800.0,
        "egt_c": 720.0,
        "cht_c": 135.0,
        "vibration_g": 0.8,
        "operating_hours": 320.0,
    }
    result = rul_predictor.predict(features)
    assert result.value > 0.0
    assert "trajectory" in result.details
    assert len(result.details["trajectory"]) == 11


def test_temporal_operation_predictor():
    telemetry = {
        "rpm": 5200.0,
        "throttle": 85.0,
        "altitude": 4000.0,
        "ambient_temp": 32.0,
        "cht": 142.0,
        "egt": 760.0,
        "oil_temp": 92.0,
        "fuel_flow": 21.0,
    }
    residuals = {"cht_residual": 12.0, "egt_residual": 25.0}
    pred = temporal_operation_predictor.predict_future_operation(
        current_telemetry=telemetry,
        residuals=residuals,
        operating_phase="CLIMB",
        rul_hours=420.0,
        health_score=94.5,
    )

    assert 0.0 <= pred["mission_feasibility_score"] <= 100.0
    assert pred["mission_status"] in ["FEASIBLE", "MONITOR_REQUIRED", "MISSION_AT_RISK"]
    assert "forecast_30min" in pred


def test_shap_explainer_contributions():
    telemetry = {"oil_temp": 95.0, "oil_pressure": 3.2}
    residuals = {"egt_residual": 85.0, "cht_residual": 25.0, "vibration_residual": 0.4}
    res = explainer.explain_anomaly(telemetry, residuals, anomaly_score=0.72)

    assert "feature_contributions" in res
    assert len(res["feature_contributions"]) == 6
    assert res["primary_driver"] != ""
