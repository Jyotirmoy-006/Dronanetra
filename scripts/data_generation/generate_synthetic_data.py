"""
Stage 2 of docs/CONTEXT.md Section 11: generate synthetic piston-engine
telemetry (with injected faults/degradation) using the physics model in
backend/app/digital_twin/physics_model.py.

Run from repo root:
    python scripts/data_generation/generate_synthetic_data.py
"""
import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Add backend to python path
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "backend"))

from app.ingestion.simulator import TelemetrySimulator
from app.digital_twin.physics_model import physics_model


def generate_dataset(num_records: int = 3600, output_path: str = "data/synthetic/piston_engine_flight_data.csv"):
    """
    Generates synthetic flight telemetry data for a 1-hour mission (1 Hz sampling),
    injecting progressive thermal and vibration degradation in the final 15 minutes.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    sim = TelemetrySimulator(seed=101)

    records = []
    start_time = datetime.utcnow() - timedelta(seconds=num_records)

    print(f"==> Generating {num_records} synthetic telemetry records...")

    for i in range(num_records):
        timestamp = start_time + timedelta(seconds=i)

        # Inject progressive degradation near end of mission (last 900 seconds)
        if i > 2700:
            degradation_factor = (i - 2700) / 900.0  # 0.0 to 1.0
            if i % 300 < 150:
                sim.set_fault("OVERHEATING")
            else:
                sim.set_fault("HIGH_VIBRATION")
        else:
            sim.set_fault("NONE")
            degradation_factor = 0.0

        reading = sim.generate_reading()
        expected = physics_model.compute_expected(reading.rpm, reading.throttle or 75.0, reading.altitude or 3000.0)

        health_index = max(0.0, 100.0 - degradation_factor * 55.0 - np.random.uniform(0, 3.0))
        rul = max(0.0, 500.0 - (i / 3600.0) * 1.0 - degradation_factor * 120.0)

        records.append({
            "timestamp": timestamp.isoformat(),
            "rpm": reading.rpm,
            "egt": reading.egt,
            "cht": reading.cht,
            "vibration": reading.vibration,
            "fuel_flow": reading.fuel_flow,
            "throttle": reading.throttle,
            "altitude": reading.altitude,
            "temperature": reading.ambient_temp,
            "pressure": reading.manifold_pressure,
            "engine_load": round((reading.throttle or 75.0) / 100.0, 3),
            "expected_egt": expected["expected_egt"],
            "expected_cht": expected["expected_cht"],
            "expected_vibration": expected["expected_vibration"],
            "fault_type": sim.injected_fault,
            "health_index": round(health_index, 1),
            "degradation_level": round(degradation_factor, 3),
            "rul": round(rul, 1),
        })

    df = pd.DataFrame(records)
    df.to_csv(output_path, index=False)
    print(f" Successfully generated synthetic dataset: {output_path} ({len(df)} rows)")


if __name__ == "__main__":
    generate_dataset()
