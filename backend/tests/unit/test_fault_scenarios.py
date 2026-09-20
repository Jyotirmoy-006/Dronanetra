"""
Unit Tests for Telemetry Simulator & 8 Critical Fault Injection Modes (Section 6 & 12)
"""
import pytest
from app.ingestion.simulator import TelemetrySimulator


def test_simulator_nominal_generation():
    sim = TelemetrySimulator()
    sim.set_fault("NONE")
    reading = sim.generate_reading()

    assert reading.rpm >= 2000.0
    assert 600.0 <= reading.egt <= 850.0
    assert 90.0 <= reading.cht <= 160.0
    assert len(reading.fft_spectrum) == 32
    assert reading.cht_cyl1 > 0
    assert reading.egt_cyl1 > 0


@pytest.mark.parametrize("fault_type", [
    "OVERHEATING",
    "MISFIRE",
    "HIGH_VIBRATION",
    "FUEL_RESTRICTION",
    "SENSOR_DRIFT",
    "LUBRICATION_LOSS",
    "COOLING_LOSS",
])
def test_simulator_fault_injections(fault_type):
    sim = TelemetrySimulator()
    sim.set_fault(fault_type)
    reading = sim.generate_reading()

    assert reading.rpm > 0
    if fault_type == "OVERHEATING":
        assert reading.cht > 140.0
    elif fault_type == "MISFIRE":
        assert reading.vibration > 2.5
    elif fault_type == "HIGH_VIBRATION":
        assert reading.vibration > 3.0
    elif fault_type == "LUBRICATION_LOSS":
        assert reading.oil_pressure < 3.0


@pytest.mark.parametrize("scenario", [
    "NOMINAL",
    "HIGH_ALTITUDE",
    "HOT_WEATHER",
    "RAPID_THROTTLE",
])
def test_simulator_environmental_scenarios(scenario):
    sim = TelemetrySimulator()
    sim.set_scenario(scenario)
    reading = sim.generate_reading()

    if scenario == "HIGH_ALTITUDE":
        assert reading.altitude >= 6000.0
    elif scenario == "HOT_WEATHER":
        assert reading.ambient_temp >= 30.0
