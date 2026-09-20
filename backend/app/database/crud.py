"""
CRUD operations for database persistence of telemetry, alerts, and missions,
including detailed historical telemetry series generation for Mission Replay.
"""
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import math


def _generate_initial_telemetry_cache(count: int = 60) -> List[Dict[str, Any]]:
    """Generates initial seed buffer of recent telemetry for instant chart population."""
    now = datetime.utcnow()
    cache = []
    for i in range(count):
        t = now - timedelta(seconds=(count - i))
        step = i
        rpm = 4800.0 + 80.0 * math.sin(i / 8.0)
        throttle = 74.0 + 2.0 * math.cos(i / 10.0)
        altitude = 3200.0 + 15.0 * math.sin(i / 12.0)
        egt = 730.0 + 12.0 * math.sin(i / 6.0)
        cht = 124.0 + 4.0 * math.cos(i / 8.0)
        vib = 0.82 + 0.05 * math.sin(i / 4.0)
        fuel_flow = 18.2 + 0.3 * math.sin(i / 10.0)
        oil_p = 4.3 + 0.1 * math.cos(i / 7.0)
        oil_t = 86.0 + 1.2 * math.sin(i / 9.0)

        snapshot = {
            "timestamp": t.isoformat(),
            "engine_id": "ENG-ROTAX-914-01",
            "engine_type": "Rotax 914 Turbo Piston (TAPAS-BH201)",
            "operating_phase": "CRUISE",
            "telemetry": {
                "rpm": round(rpm, 1),
                "egt": round(egt, 1),
                "cht": round(cht, 1),
                "vibration": round(vib, 2),
                "fuel_flow": round(fuel_flow, 2),
                "altitude": round(altitude, 1),
                "ambient_temp": -5.8,
                "oil_pressure": round(oil_p, 2),
                "oil_temp": round(oil_t, 1),
                "throttle": round(throttle, 1),
                "manifold_pressure": 35.4,
                "bus_voltage": 28.2,
                "alternator_current": 48.0,
                "battery_soh": 98.4,
                "injection_timing": 25.9,
                "spark_advance": 31.4,
                "injection_duty_cycle": 43.6,
                "vibration_freq_hz": 160.0,
            },
            # Top-level flattened properties for direct chart access
            "rpm": round(rpm, 1),
            "egt": round(egt, 1),
            "cht": round(cht, 1),
            "vibration": round(vib, 2),
            "fuel_flow": round(fuel_flow, 2),
            "altitude": round(altitude, 1),
            "health_score": 98.2,
            "anomaly_score": 0.06,
            "fault_status": "NORMAL",
            "rul_hours": 450.0,
            "confidence": 0.94,
            "expected_physics": {
                "expected_egt": 725.0,
                "expected_cht": 120.0,
                "expected_fuel_flow": 18.0,
                "expected_vibration": 0.8,
            },
            "residuals": {
                "egt_residual": round(egt - 725.0, 1),
                "cht_residual": round(cht - 120.0, 1),
                "fuel_flow_residual": round(fuel_flow - 18.0, 2),
                "vibration_residual": round(vib - 0.8, 2),
            },
            "threshold_analysis": {
                "status": "NORMAL",
                "health_score": 100.0,
                "breached_parameters": [],
                "summary": "All 8/8 flight parameters within static thresholds."
            },
            "active_alerts": [],
        }
        cache.append(snapshot)
    return cache


HISTORICAL_TELEMETRY_CACHE: List[Dict[str, Any]] = _generate_initial_telemetry_cache(60)

HISTORICAL_MISSIONS_CACHE: List[Dict[str, Any]] = [
    {
        "mission_id": "MSN-2026-0814",
        "name": "High Altitude Endurance Test Alpha",
        "uav_id": "UAV-TAPAS-BH-201",
        "engine_id": "ENG-ROTAX-914-01",
        "start_time": "2026-08-14T06:00:00Z",
        "end_time": "2026-08-14T14:30:00Z",
        "duration_hours": 8.5,
        "status": "COMPLETED",
        "max_altitude_m": 4200,
        "anomalies_detected": 1,
        "summary": "High altitude endurance trial. Minor thermal residual elevation detected at T+04:20:00 during lean high-altitude cruise.",
    },
    {
        "mission_id": "MSN-2026-0822",
        "name": "Border Surveillance Patrol Recon-4",
        "uav_id": "UAV-TAPAS-BH-201",
        "engine_id": "ENG-ROTAX-914-01",
        "start_time": "2026-08-22T10:15:00Z",
        "end_time": "2026-08-22T21:00:00Z",
        "duration_hours": 10.75,
        "status": "COMPLETED",
        "max_altitude_m": 3800,
        "anomalies_detected": 0,
        "summary": "10-hour maritime surveillance patrol. All thermodynamic and mechanical parameters remained nominal throughout flight.",
    },
    {
        "mission_id": "MSN-2026-0829",
        "name": "Tactical ISR Hot-Weather Demonstration",
        "uav_id": "UAV-TAPAS-BH-201",
        "engine_id": "ENG-ROTAX-914-01",
        "start_time": "2026-08-29T11:00:00Z",
        "end_time": "2026-08-29T17:45:00Z",
        "duration_hours": 6.75,
        "status": "COMPLETED",
        "max_altitude_m": 3500,
        "anomalies_detected": 2,
        "summary": "Desert testing at 46°C ambient ground temperature. Cylinder #2 temperature reached caution range during initial steep climb.",
    },
]


def generate_mission_telemetry_points(mission_id: str, count: int = 100) -> List[Dict[str, Any]]:
    """Generates a realistic chronological flight telemetry series for mission replay with both flattened and nested fields."""
    points = []
    has_anomaly = "0814" in mission_id or "0829" in mission_id
    mission = get_mission_by_id(mission_id)
    duration_hours = float(mission.get("duration_hours", 8.5)) if mission else 8.5
    start_time_str = mission.get("start_time", "2026-08-14T06:00:00Z") if mission else "2026-08-14T06:00:00Z"
    try:
        start_dt = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
    except Exception:
        start_dt = datetime(2026, 8, 14, 6, 0, 0)

    for i in range(count):
        pct = (i / float(count - 1)) * 100.0
        elapsed_sec = (pct / 100.0) * duration_hours * 3600.0
        pt_dt = start_dt + timedelta(seconds=elapsed_sec)
        time_utc = pt_dt.strftime("%H:%M:%S")
        hours_offset = int(elapsed_sec // 3600)
        mins_offset = int((elapsed_sec % 3600) // 60)
        secs_offset = int(elapsed_sec % 60)
        timestamp_offset = f"T+{hours_offset:02d}:{mins_offset:02d}:{secs_offset:02d}"
        
        # Flight phase simulation
        if pct < 10.0:
            phase = "TAKEOFF / CLIMB"
            altitude = 100.0 + pct * 180.0
            throttle = 94.0
            rpm = 5450.0
            egt = 770.0
            cht = 138.0
            vib = 1.1
            health = 98.0
            anom = 0.05
            event = "Takeoff Roll & Max Power Climb"
        elif pct < 75.0:
            phase = "HIGH-ALTITUDE CRUISE"
            altitude = 3800.0 + 300.0 * math.sin(pct / 5.0)
            throttle = 74.0
            rpm = 4850.0
            egt = 725.0
            cht = 126.0
            vib = 0.8
            health = 97.5
            anom = 0.08
            event = "Nominal High Altitude Loiter"

            # Inject realistic in-flight anomaly window in mission 0814/0829
            if has_anomaly and 42.0 <= pct <= 54.0:
                cht += 28.0
                egt += 55.0
                vib += 1.4
                health = 74.0
                anom = 0.62
                event = "WARNING: Cylinder Head Thermal Residual Elevation"
        elif pct < 90.0:
            phase = "DESCENT"
            altitude = max(400.0, 3800.0 - (pct - 75.0) * 220.0)
            throttle = 45.0
            rpm = 3400.0
            egt = 650.0
            cht = 110.0
            vib = 0.6
            health = 96.0
            anom = 0.06
            event = "Descent Protocol to Recovery Base"
        else:
            phase = "LANDING & TAXI"
            altitude = 100.0
            throttle = 25.0
            rpm = 1600.0
            egt = 580.0
            cht = 95.0
            vib = 0.4
            health = 98.0
            anom = 0.02
            event = "Safe Touchdown & Engine Cooldown"

        oil_p = 4.5 * (rpm / 5000.0)
        oil_t = 85.0 + (cht - 120.0) * 0.25
        ff = 18.5 * (throttle / 100.0)

        points.append({
            "step": i,
            "progress_pct": round(pct, 1),
            "timestamp_offset": timestamp_offset,
            "time_utc": time_utc,
            "time": time_utc,
            "phase": phase,
            "event": event,
            # Direct top-level fields for robust Recharts rendering
            "rpm": round(rpm, 0),
            "egt": round(egt, 1),
            "cht": round(cht, 1),
            "vibration": round(vib, 2),
            "fuel_flow": round(ff, 2),
            "altitude": round(altitude, 0),
            "oil_pressure": round(oil_p, 2),
            "oil_temp": round(oil_t, 1),
            "throttle": round(throttle, 1),
            "health_score": round(health, 1),
            "anomaly_score": round(anom, 2),
            "predicted_fault": "CYLINDER_OVERHEATING" if (has_anomaly and 42.0 <= pct <= 54.0) else "NORMAL",
            "rul_hours": round(max(20.0, 450.0 - (pct * 0.5)), 0),
            # Nested telemetry object for compatibility
            "telemetry": {
                "rpm": round(rpm, 0),
                "egt": round(egt, 1),
                "cht": round(cht, 1),
                "vibration": round(vib, 2),
                "fuel_flow": round(ff, 2),
                "altitude": round(altitude, 0),
                "oil_pressure": round(oil_p, 2),
                "oil_temp": round(oil_t, 1),
                "throttle": round(throttle, 1),
            },
        })

    return points


def log_telemetry_snapshot(snapshot: Dict[str, Any]):
    HISTORICAL_TELEMETRY_CACHE.append(snapshot)
    if len(HISTORICAL_TELEMETRY_CACHE) > 1000:
        HISTORICAL_TELEMETRY_CACHE.pop(0)


def get_recent_history(limit: int = 100) -> List[Dict[str, Any]]:
    if len(HISTORICAL_TELEMETRY_CACHE) < 10:
        HISTORICAL_TELEMETRY_CACHE.extend(_generate_initial_telemetry_cache(60))
    return HISTORICAL_TELEMETRY_CACHE[-limit:]


def get_all_missions() -> List[Dict[str, Any]]:
    return HISTORICAL_MISSIONS_CACHE


def get_mission_by_id(mission_id: str) -> Optional[Dict[str, Any]]:
    for m in HISTORICAL_MISSIONS_CACHE:
        if m["mission_id"] == mission_id:
            return m
    return None
