"""
Unit Tests for Thermodynamic Physics Model & Residual Calculator (FR-04)
"""
import pytest
from app.digital_twin.physics_model import physics_model, PistonEnginePhysicsModel


def test_physics_model_expected_nominal():
    model = PistonEnginePhysicsModel()
    expected = model.compute_expected(rpm=4800.0, throttle=75.0, altitude=3000.0, dt_seconds=1.0)
    assert "expected_egt" in expected
    assert "expected_cht" in expected
    assert "expected_fuel_flow" in expected
    assert "expected_vibration" in expected
    assert "expected_oil_temp" in expected
    assert "expected_oil_pressure" in expected

    # Verify physical sanity
    assert 600.0 <= expected["expected_egt"] <= 900.0
    assert 90.0 <= expected["expected_cht"] <= 160.0
    assert 5.0 <= expected["expected_fuel_flow"] <= 30.0
    assert 0.2 <= expected["expected_vibration"] <= 4.0


def test_physics_model_altitude_density_reduction():
    model_sea = PistonEnginePhysicsModel()
    model_alt = PistonEnginePhysicsModel()
    # Step each to steady state
    for _ in range(5):
        sea_level = model_sea.compute_expected(rpm=5000.0, throttle=80.0, altitude=0.0, dt_seconds=1.0)
        high_alt = model_alt.compute_expected(rpm=5000.0, throttle=80.0, altitude=6000.0, dt_seconds=1.0)

    # Thinner air at 6000m should reduce expected fuel flow for given throttle
    assert high_alt["expected_fuel_flow"] < sea_level["expected_fuel_flow"]


def test_compute_residuals():
    actual = {"egt": 780.0, "cht": 145.0, "fuel_flow": 16.5, "vibration": 1.2}
    expected = {"expected_egt": 720.0, "expected_cht": 130.0, "expected_fuel_flow": 18.0, "expected_vibration": 0.8}

    res = physics_model.compute_residuals(actual, expected)
    assert res["egt_residual"] == 60.0
    assert res["cht_residual"] == 15.0
    assert res["fuel_flow_residual"] == -1.5
    assert res["vibration_residual"] == 0.4
