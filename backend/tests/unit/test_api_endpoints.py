"""
Integration & End-to-End API Route Tests
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


def test_live_engine_telemetry():
    response = client.get("/api/engine/live")
    assert response.status_code == 200
    data = response.json()
    assert "telemetry" in data
    assert "health_score" in data
    assert "fault_status" in data


def test_health_endpoint():
    response = client.get("/api/engine/health")
    assert response.status_code == 200
    data = response.json()
    assert "health_score" in data
    assert "status" in data


def test_alerts_endpoint():
    response = client.get("/api/alerts")
    assert response.status_code == 200
    data = response.json()
    assert "active_alerts" in data or isinstance(data, list)


def test_missions_endpoint():
    response = client.get("/api/missions")
    assert response.status_code == 200
    data = response.json()
    assert "missions" in data
    assert len(data["missions"]) > 0


def test_whatif_simulation_endpoint():
    payload = {
        "mission_name": "Test High Altitude Recon",
        "flight_duration_hours": 5.0,
        "target_altitude_m": 4200.0,
        "ambient_temp_c": 30.0,
        "cruise_throttle_pct": 75.0,
        "payload_weight_kg": 100.0,
        "fuel_tank_capacity_l": 220.0,
    }
    response = client.post("/api/whatif/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "feasibility_score" in data
    assert "verdict" in data
    assert data["verdict"] in ["GO", "CAUTION", "NO-GO"]
    assert len(data["flight_profile_series"]) > 0


def test_fleet_summary_endpoint():
    response = client.get("/api/fleet/summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_airframes" in data
    assert data["total_airframes"] >= 3
    assert len(data["fleet_assets"]) >= 3


def test_inject_fault_endpoint():
    response = client.post("/api/engine/inject-fault", json={"fault_type": "OVERHEATING"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"


def test_set_scenario_endpoint():
    response = client.post("/api/engine/set-scenario", json={"scenario": "HIGH_ALTITUDE"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
