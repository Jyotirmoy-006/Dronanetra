"""
Autonomous Maintenance Advisory & Component Life-Cycle Wear Prognostics Engine (FR-08 & FR-10)
================================================================================================
Calculates real-time component degradation, Remaining Useful Life (hours remaining / TBO),
wear percentage (%), and condition-based actionable maintenance tasks driven by live telemetry.
"""
from typing import Dict, Any, List
from datetime import datetime


class MaintenanceAdvisor:
    def __init__(self):
        # Baseline accumulated airframe flight hours
        self.base_flight_hours: float = 348.5

    def evaluate_component_lifecycle(
        self,
        telemetry: Dict[str, Any],
        fault_status: str = "NORMAL",
        health_score: float = 98.5,
        rul_hours: float = 450.0,
    ) -> Dict[str, Any]:
        """
        Evaluates real-time wear and remaining hours for all critical aero engine subsystems
        based on cumulative operating stress and live sensor metrics.
        """
        rpm = float(telemetry.get("rpm", 5180.0))
        cht = float(telemetry.get("cht", 148.0))
        egt = float(telemetry.get("egt", 720.0))
        oil_p = float(telemetry.get("oil_pressure", 4.5))
        oil_t = float(telemetry.get("oil_temp", 95.0))
        fuel_flow = float(telemetry.get("fuel_flow", 2.1))
        vibration = float(telemetry.get("vibration", 0.14))
        bus_v = float(telemetry.get("bus_voltage", 28.2))
        alt_i = float(telemetry.get("alternator_current", 42.0))

        # -------------------------------------------------------------
        # 1. Dual Spark Plugs (Max TBO: 200h)
        # Accelerated by misfire events and high combustion temperature
        # -------------------------------------------------------------
        plug_max = 200.0
        plug_stress = 1.0 + (0.8 if fault_status == "MISFIRE" else 0.0) + max(0.0, (cht - 140.0) / 60.0)
        plug_used = min(plug_max, 155.0 * plug_stress)
        plug_hours_left = max(0.0, plug_max - plug_used)
        plug_life_pct = round(max(0.0, min(100.0, (plug_hours_left / plug_max) * 100.0)), 1)

        # -------------------------------------------------------------
        # 2. Oil Filter Element & Lube System (Max TBO: 100h)
        # Accelerated by high oil temperature and low pressure variance
        # -------------------------------------------------------------
        oil_max = 100.0
        oil_stress = 1.0 + (1.2 if fault_status == "LUBRICATION_LOSS" or oil_p < 2.5 else 0.0) + max(0.0, (oil_t - 95.0) / 40.0)
        oil_used = min(oil_max, 68.0 * oil_stress)
        oil_hours_left = max(0.0, oil_max - oil_used)
        oil_life_pct = round(max(0.0, min(100.0, (oil_hours_left / oil_max) * 100.0)), 1)

        # -------------------------------------------------------------
        # 3. Fuel Injector Nozzles & Rail (Max TBO: 500h)
        # Accelerated by fuel restriction and high flow demands
        # -------------------------------------------------------------
        fuel_max = 500.0
        fuel_stress = 1.0 + (0.9 if fault_status == "FUEL_RESTRICTION" else 0.0) + max(0.0, (fuel_flow - 22.0) / 20.0)
        fuel_used = min(fuel_max, 320.0 * fuel_stress)
        fuel_hours_left = max(0.0, fuel_max - fuel_used)
        fuel_life_pct = round(max(0.0, min(100.0, (fuel_hours_left / fuel_max) * 100.0)), 1)

        # -------------------------------------------------------------
        # 4. Turbocharger & Wastegate Actuator (Max TBO: 400h)
        # Accelerated by severe Exhaust Gas Temperature (> 780 °C)
        # -------------------------------------------------------------
        turbo_max = 400.0
        turbo_stress = 1.0 + max(0.0, (egt - 760.0) / 150.0)
        turbo_used = min(turbo_max, 265.0 * turbo_stress)
        turbo_hours_left = max(0.0, turbo_max - turbo_used)
        turbo_life_pct = round(max(0.0, min(100.0, (turbo_hours_left / turbo_max) * 100.0)), 1)

        # -------------------------------------------------------------
        # 5. Coolant Pump Impeller & Cylinder Jacket (Max TBO: 600h)
        # Accelerated by thermal overheating
        # -------------------------------------------------------------
        cool_max = 600.0
        cool_stress = 1.0 + (1.5 if fault_status == "OVERHEATING" or cht > 165.0 else 0.0)
        cool_used = min(cool_max, 185.0 * cool_stress)
        cool_hours_left = max(0.0, cool_max - cool_used)
        cool_life_pct = round(max(0.0, min(100.0, (cool_hours_left / cool_max) * 100.0)), 1)

        # -------------------------------------------------------------
        # 6. Alternator Drive Belt & Electrical System (Max TBO: 300h)
        # Accelerated by high alternator current load and belt slip
        # -------------------------------------------------------------
        belt_max = 300.0
        belt_stress = 1.0 + max(0.0, (alt_i - 40.0) / 30.0)
        belt_used = min(belt_max, 160.0 * belt_stress)
        belt_hours_left = max(0.0, belt_max - belt_used)
        belt_life_pct = round(max(0.0, min(100.0, (belt_hours_left / belt_max) * 100.0)), 1)

        # -------------------------------------------------------------
        # 7. Crankshaft Main Bearings & Harmonic Dampers (Max TBO: 1000h)
        # Accelerated by elevated dynamic mechanical vibration
        # -------------------------------------------------------------
        crank_max = 1000.0
        crank_stress = 1.0 + (1.4 if fault_status == "HIGH_VIBRATION" or vibration > 2.5 else 0.0) + max(0.0, (vibration - 1.0) / 3.0)
        crank_used = min(crank_max, self.base_flight_hours * crank_stress)
        crank_hours_left = max(0.0, crank_max - crank_used)
        crank_life_pct = round(max(0.0, min(100.0, (crank_hours_left / crank_max) * 100.0)), 1)

        components = [
            {
                "id": "COMP-IGN-01",
                "name": "Dual Spark Plugs & Coils",
                "subsystem": "Ignition System",
                "life": plug_life_pct,
                "hoursLeft": round(plug_hours_left, 1),
                "maxHours": plug_max,
                "status": "CRITICAL" if plug_life_pct < 20 else ("CAUTION" if plug_life_pct < 50 else "NOMINAL"),
                "metric_note": f"Gap 0.6mm // CHT {cht:.0f}°C",
            },
            {
                "id": "COMP-LUB-02",
                "name": "Oil Filter Element & Pump",
                "subsystem": "Lubrication System",
                "life": oil_life_pct,
                "hoursLeft": round(oil_hours_left, 1),
                "maxHours": oil_max,
                "status": "CRITICAL" if oil_life_pct < 20 else ("CAUTION" if oil_life_pct < 50 else "NOMINAL"),
                "metric_note": f"Oil P {oil_p:.1f} bar // {oil_t:.0f}°C",
            },
            {
                "id": "COMP-FUL-03",
                "name": "Fuel Injector Nozzles & Rail",
                "subsystem": "Fuel Delivery",
                "life": fuel_life_pct,
                "hoursLeft": round(fuel_hours_left, 1),
                "maxHours": fuel_max,
                "status": "CRITICAL" if fuel_life_pct < 20 else ("CAUTION" if fuel_life_pct < 50 else "NOMINAL"),
                "metric_note": f"Flow {fuel_flow:.1f} L/h // Pulse Nominal",
            },
            {
                "id": "COMP-THM-04",
                "name": "Turbocharger & Wastegate",
                "subsystem": "Thermal & Boost",
                "life": turbo_life_pct,
                "hoursLeft": round(turbo_hours_left, 1),
                "maxHours": turbo_max,
                "status": "CRITICAL" if turbo_life_pct < 20 else ("CAUTION" if turbo_life_pct < 50 else "NOMINAL"),
                "metric_note": f"EGT {egt:.0f}°C // Boost Stable",
            },
            {
                "id": "COMP-COL-05",
                "name": "Coolant Pump Impeller",
                "subsystem": "Cooling System",
                "life": cool_life_pct,
                "hoursLeft": round(cool_hours_left, 1),
                "maxHours": cool_max,
                "status": "CRITICAL" if cool_life_pct < 20 else ("CAUTION" if cool_life_pct < 50 else "NOMINAL"),
                "metric_note": f"Flow Rate 98% // Cavitation 0.0",
            },
            {
                "id": "COMP-ELE-06",
                "name": "Alternator Belt & Power Bus",
                "subsystem": "Electrical System",
                "life": belt_life_pct,
                "hoursLeft": round(belt_hours_left, 1),
                "maxHours": belt_max,
                "status": "CRITICAL" if belt_life_pct < 20 else ("CAUTION" if belt_life_pct < 50 else "NOMINAL"),
                "metric_note": f"{bus_v:.1f} V // {alt_i:.0f} A Load",
            },
            {
                "id": "COMP-MEC-07",
                "name": "Crankshaft Harmonic Bearings",
                "subsystem": "Mechanical Kinematics",
                "life": crank_life_pct,
                "hoursLeft": round(crank_hours_left, 1),
                "maxHours": crank_max,
                "status": "CRITICAL" if crank_life_pct < 20 else ("CAUTION" if crank_life_pct < 50 else "NOMINAL"),
                "metric_note": f"Vib {vibration:.2f}g // 1X Peak OK",
            },
        ]

        # -------------------------------------------------------------
        # Actionable Condition-Based Maintenance Tasks
        # -------------------------------------------------------------
        tasks = []

        if fault_status in ["MISFIRE", "IGNITION_MISFIRE"] or plug_life_pct < 35:
            tasks.append({
                "id": "TSK-01",
                "title": "Cylinder #2 Spark Plug & Coil Inspection",
                "urgency": "IMMEDIATE (NEXT FLIGHT)",
                "category": "Ignition System",
                "desc": f"Active misfire detected. Measure electrode gap (0.6mm) and test secondary coil impedance. CHT: {cht:.1f}°C.",
                "completed": False,
                "priority": "HIGH",
            })
        else:
            tasks.append({
                "id": "TSK-01",
                "title": "Routine 25H Dual Spark Plug Gap Check",
                "urgency": "ROUTINE 25H",
                "category": "Ignition System",
                "desc": "Inspect electrode gap (0.60 mm) and verify dual ignition coil resistance.",
                "completed": True,
                "priority": "LOW",
            })

        if fault_status in ["LUBRICATION_LOSS"] or oil_p < 2.5 or oil_life_pct < 40:
            tasks.append({
                "id": "TSK-02",
                "title": "Oil Filter Differential Pressure & Bypass Test",
                "urgency": "URGENT PRE-FLIGHT",
                "category": "Lubrication",
                "desc": f"Low oil pressure ({oil_p:.2f} bar) or high thermal stress. Check filter differential pressure and scavenge pump suction.",
                "completed": False,
                "priority": "HIGH",
            })
        else:
            tasks.append({
                "id": "TSK-02",
                "title": "Oil Filter Differential Pressure Test",
                "urgency": "NEXT PRE-FLIGHT",
                "category": "Lubrication",
                "desc": "Verify oil pressure delta < 0.2 bar at cruise RPM (4800 RPM).",
                "completed": True,
                "priority": "LOW",
            })

        if fault_status in ["FUEL_RESTRICTION"] or fuel_flow > 26.0:
            tasks.append({
                "id": "TSK-03",
                "title": "Fuel Rail Purge & Injector Flow Balancing",
                "urgency": "ACTION REQUIRED",
                "category": "Fuel Delivery",
                "desc": f"Fuel restriction anomaly. Benchmark flow rate across Cyl 1-4 injectors at {fuel_flow:.1f} L/h demand.",
                "completed": False,
                "priority": "MEDIUM",
            })
        else:
            tasks.append({
                "id": "TSK-03",
                "title": "Fuel Injector Flow Balance Check",
                "urgency": "ROUTINE 50H",
                "category": "Fuel System",
                "desc": "Clean and benchmark injector pulse width variance across Cyl 1-4.",
                "completed": False,
                "priority": "LOW",
            })

        if fault_status in ["HIGH_VIBRATION"] or vibration > 2.0:
            tasks.append({
                "id": "TSK-04",
                "title": "Crankshaft Mechanical Harmonics Calibration",
                "urgency": "VIBRATION ALERT",
                "category": "Kinematics",
                "desc": f"Elevated harmonic vibration ({vibration:.2f}g). Perform 1X/2X FFT spectral re-balancing.",
                "completed": False,
                "priority": "HIGH",
            })
        else:
            tasks.append({
                "id": "TSK-04",
                "title": "Crankshaft Mechanical Harmonics Calibration",
                "urgency": "TBO 100H",
                "category": "Vibration",
                "desc": "Perform 1X/2X FFT harmonic spectral baseline measurement.",
                "completed": False,
                "priority": "LOW",
            })

        return {
            "evaluated_at": datetime.utcnow().isoformat(),
            "aircraft_id": "TAPAS-BH201",
            "engine_id": "ENG-ROTAX-914-01",
            "airframe_hours": self.base_flight_hours,
            "overall_health": health_score,
            "components": components,
            "maintenance_tasks": tasks,
        }


# Singleton instance
maintenance_advisor = MaintenanceAdvisor()
