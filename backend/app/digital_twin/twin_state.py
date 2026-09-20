"""
Implements FR-04 & Dual-Engine Architecture:
Maintains the live state of the Aero Piston Engine Digital Twin, integrating:
1. Conventional Threshold Monitoring (static operational boundary limits)
2. AI & Physics Digital Twin Engine (transient physics residuals, ISA altitude baselines)
3. Explainable AI & ML Prognostics (8-class fault detection, cross-sensor parity, RUL curves)
4. PINN Conservation Law Verification & Edge AI Benchmarks
"""
from typing import Dict, Any, Optional
from datetime import datetime
from app.digital_twin.physics_model import physics_model
from app.ingestion.schema import TelemetryReading
from app.ai_models.anomaly_detector import anomaly_detector
from app.ai_models.fault_classifier import fault_classifier
from app.ai_models.rul_predictor import rul_predictor
from app.decision_engine.threshold_monitor import threshold_monitor
from app.decision_engine.health_index import calculate_health_index
from app.decision_engine.maintenance_advisor import maintenance_advisor
from app.ingestion.can_interface import can_manager
from app.ingestion.serial_interface import serial_interface
from app.ai_models.temporal_operation_predictor import temporal_operation_predictor
from app.processing.vibration_analyzer import vibration_analyzer
from app.ai_models.pinn_loss import pinn_evaluator
from app.ai_models.edge_benchmark import edge_benchmark
from app.ai_models.federated_swarm import federated_swarm
from app.explainability.shap_explainer import explainer


class DigitalTwinState:
    def __init__(self):
        self.engine_id: str = "ENG-ROTAX-914-01"
        self.engine_type: str = "Rotax 914 Turbo / VRDE 180 HP Boxer (TAPAS-BH201)"
        self.last_updated: Optional[datetime] = None
        self.current_telemetry: Optional[TelemetryReading] = None
        self.expected_values: Dict[str, float] = {}
        self.residuals: Dict[str, float] = {}
        self.health_score: float = 98.5
        self.anomaly_score: float = 0.08
        self.fault_status: str = "NORMAL"
        self.fault_probabilities: Dict[str, float] = {
            "NORMAL": 0.95, "OVERHEATING": 0.01, "MISFIRE": 0.01, "HIGH_VIBRATION": 0.01,
            "FUEL_RESTRICTION": 0.01, "SENSOR_DRIFT": 0.01, "LUBRICATION_LOSS": 0.01, "COOLING_LOSS": 0.01,
            "HEALTHY": 0.95, "WARNING": 0.03, "CRITICAL": 0.02
        }
        self.explanation: Dict[str, Any] = {}
        self.rul_hours: float = 450.0
        self.confidence: float = 0.94
        self.rul_trajectory: list = []
        self.operating_phase: str = "CRUISE"
        self.temporal_prediction: Dict[str, Any] = {}
        self.threshold_state: Dict[str, Any] = {
            "status": "NORMAL",
            "health_score": 100.0,
            "breached_parameters": [],
            "summary": "All parameters within standard static operating thresholds."
        }

    def update_telemetry(self, reading: TelemetryReading) -> Dict[str, Any]:
        self.last_updated = reading.timestamp
        self.current_telemetry = reading
        telemetry_dict = reading.dict()

        # 1. Compute physics model expected values based on flight condition (ISP #1)
        self.expected_values = physics_model.compute_expected(
            rpm=reading.rpm,
            throttle=reading.throttle or 75.0,
            altitude=reading.altitude or 3000.0,
        )

        # 2. Compute residuals (Actual - Expected)
        actual_dict = {
            "egt": reading.egt,
            "cht": reading.cht,
            "fuel_flow": reading.fuel_flow,
            "vibration": reading.vibration,
            "oil_pressure": reading.oil_pressure,
        }
        self.residuals = physics_model.compute_residuals(actual_dict, self.expected_values)

        # 3. Determine flight phase
        if (reading.throttle or 0) > 88.0:
            self.operating_phase = "TAKEOFF / CLIMB"
        elif (reading.throttle or 0) < 25.0:
            self.operating_phase = "DESCENT / IDLE"
        else:
            self.operating_phase = "CRUISE"

        # 4. Run Conventional Threshold Evaluation (Preserved Baseline)
        threshold_res = threshold_monitor.evaluate(telemetry_dict)
        self.threshold_state = {
            "status": threshold_res.status,
            "health_score": threshold_res.health_score,
            "breached_parameters": [b.dict() for b in threshold_res.breached_parameters],
            "summary": threshold_res.summary,
        }

        # 5. Run AI Anomaly Detection (ISP #1)
        anomaly_res = anomaly_detector.predict({**telemetry_dict, "residuals": self.residuals})
        self.anomaly_score = float(anomaly_res.value)

        # 6. Run AI Multi-Class Fault Classification with Cross-Sensor Parity (ISP #2)
        fault_res = fault_classifier.predict(telemetry_dict)
        self.fault_status = str(fault_res.value)
        self.fault_probabilities = fault_res.details.get("probabilities", self.fault_probabilities)

        # 7. Run AI RUL Prognostics (ISP #2)
        rul_res = rul_predictor.predict(telemetry_dict)
        self.rul_hours = float(rul_res.value)
        self.confidence = float(rul_res.confidence)
        self.rul_trajectory = rul_res.details.get("trajectory", [])

        # 8. Compute Composite Health Index
        self.health_score = calculate_health_index(
            anomaly_score=self.anomaly_score,
            residuals=self.residuals,
            fault_probabilities=self.fault_probabilities,
        )

        # 8b. Compute Explainable AI SHAP Feature Attribution
        self.explanation = explainer.explain_anomaly(
            telemetry=telemetry_dict,
            residuals=self.residuals,
            anomaly_score=self.anomaly_score,
        )

        # 8c. Derive 3-tier ensemble probabilities for UI directly from physical fault probabilities
        normal_p = float(self.fault_probabilities.get("NORMAL", 0.90))
        crit_sum = float(
            self.fault_probabilities.get("LUBRICATION_LOSS", 0.0) + 
            self.fault_probabilities.get("COOLING_LOSS", 0.0) + 
            self.fault_probabilities.get("OVERHEATING", 0.0) * 0.7
        )
        warn_sum = float(
            self.fault_probabilities.get("MISFIRE", 0.0) + 
            self.fault_probabilities.get("HIGH_VIBRATION", 0.0) + 
            self.fault_probabilities.get("FUEL_RESTRICTION", 0.0) + 
            self.fault_probabilities.get("SENSOR_DRIFT", 0.0) + 
            self.fault_probabilities.get("OVERHEATING", 0.0) * 0.3
        )

        if self.anomaly_score > 0.60:
            crit_sum = max(crit_sum, self.anomaly_score * 0.9)
        elif self.anomaly_score > 0.25:
            warn_sum = max(warn_sum, self.anomaly_score * 0.85)

        total_sev = normal_p + crit_sum + warn_sum
        healthy_p = round(normal_p / max(0.001, total_sev), 3)
        crit_p = round(crit_sum / max(0.001, total_sev), 3)
        warn_p = round(max(0.0, 1.0 - (healthy_p + crit_p)), 3)

        self.fault_probabilities["HEALTHY"] = healthy_p
        self.fault_probabilities["WARNING"] = warn_p
        self.fault_probabilities["CRITICAL"] = crit_p

        # 9. Run Temporal Operation Forecaster
        self.temporal_prediction = temporal_operation_predictor.predict_future_operation(
            current_telemetry=telemetry_dict,
            residuals=self.residuals,
            operating_phase=self.operating_phase,
            rul_hours=self.rul_hours,
            health_score=self.health_score,
        )

        return self.get_full_state()

    def get_full_state(self) -> Dict[str, Any]:
        if not self.current_telemetry:
            return {
                "engine_id": self.engine_id,
                "status": "OFFLINE",
                "health_score": 100.0,
                "anomaly_score": 0.0,
                "threshold_analysis": self.threshold_state,
                "temporal_prediction": self.temporal_prediction,
            }

        telemetry_dict = self.current_telemetry.dict() if self.current_telemetry else {}

        # Generate live SAE J1939 CAN Bus Frames from telemetry
        can_frames = can_manager.generate_live_frames(
            telemetry=telemetry_dict,
            fault_status=self.fault_status,
            health_score=self.health_score,
            anomaly_score=self.anomaly_score,
            rul_hours=self.rul_hours,
        )
        can_bus_metrics = can_manager.get_bus_metrics(
            telemetry=telemetry_dict,
            fault_status=self.fault_status,
            health_score=self.health_score,
            operating_phase=self.operating_phase,
        )

        # Dynamic Component Life-Cycle Wear & Maintenance Advisory
        maint_advisory = maintenance_advisor.evaluate_component_lifecycle(
            telemetry=telemetry_dict,
            fault_status=self.fault_status,
            health_score=self.health_score,
            rul_hours=self.rul_hours,
        )

        # Vibration Harmonic Spectral Pattern Recognition
        vib_pattern_info = vibration_analyzer.analyze_spectrum(
            fft_bins=self.current_telemetry.fft_spectrum,
            rpm=self.current_telemetry.rpm,
            overall_vibration_g=self.current_telemetry.vibration,
        )

        # PINN Conservation Laws Evaluation
        pinn_metrics = pinn_evaluator.evaluate_conservation_laws(
            telemetry=telemetry_dict,
            predicted_power_kw=self.expected_values.get("brake_power_kw", 78.5),
            predicted_egt_c=self.current_telemetry.egt,
            predicted_cht_c=self.current_telemetry.cht,
        )

        return {
            "engine_id": self.engine_id,
            "engine_type": self.engine_type,
            "timestamp": self.last_updated.isoformat() if self.last_updated else None,
            "operating_phase": self.operating_phase,
            "telemetry": self.current_telemetry.dict(),
            "expected_physics": self.expected_values,
            "residuals": self.residuals,
            "health_score": self.health_score,
            "anomaly_score": self.anomaly_score,
            "fault_status": self.fault_status,
            "fault_probabilities": self.fault_probabilities,
            "rul_hours": self.rul_hours,
            "confidence": self.confidence,
            "rul_trajectory": self.rul_trajectory,
            "threshold_analysis": self.threshold_state,
            "temporal_prediction": self.temporal_prediction,
            "mission_forecast": self.temporal_prediction,
            "can_frames": can_frames,
            "can_bus_metrics": can_bus_metrics,
            "explanation": self.explanation,
            "component_lifecycle": maint_advisory["components"],
            "maintenance_tasks": maint_advisory["maintenance_tasks"],
            "maintenance_advisory": maint_advisory,
            "vibration_analysis": vib_pattern_info,
            "pinn_conservation_metrics": pinn_metrics,
            "serial_stream_health": serial_interface.get_stream_health(),
            "ai_prediction": {
                "status": "HEALTHY" if self.health_score > 85.0 else ("WARNING" if self.health_score > 60.0 else "CRITICAL"),
                "anomaly_score": self.anomaly_score,
                "predicted_fault": self.fault_status,
                "fault_probabilities": self.fault_probabilities,
                "rul_hours": self.rul_hours,
                "confidence": self.confidence,
                "ai_health_score": self.health_score,
                "degradation_rate": "0.12%/hr",
                "mission_feasibility_score": self.temporal_prediction.get("mission_feasibility_score", 95.0),
                "mission_status": self.temporal_prediction.get("mission_status", "FEASIBLE"),
                "forecast_30min": self.temporal_prediction.get("forecast_30min", {}),
            }
        }


twin_state = DigitalTwinState()
