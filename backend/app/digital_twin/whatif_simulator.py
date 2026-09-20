"""
What-If Mission Scenario Planner & Thermodynamic Sandbox Engine (Section 14 & FR-09)
=====================================================================================
Enables UAV flight commanders and flight test engineers to simulate custom flight profiles
before takeoff to answer:
"If I fly this mission (Altitude, Duration, Temp, Throttle, Payload), what will happen to the engine?"
"""
import math
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.digital_twin.physics_model import physics_model


class WhatIfMissionRequest(BaseModel):
    mission_name: str = Field(default="Tactical Loiter Sortie", description="Mission Name / Call-sign")
    flight_duration_hours: float = Field(default=6.5, ge=0.5, le=24.0, description="Planned mission duration in hours")
    target_altitude_m: float = Field(default=4500.0, ge=100.0, le=8000.0, description="Target loiter altitude in meters")
    ambient_temp_c: float = Field(default=35.0, ge=-50.0, le=60.0, description="Ground/OAT temperature in °C")
    cruise_throttle_pct: float = Field(default=75.0, ge=30.0, le=100.0, description="Average cruise throttle %")
    payload_weight_kg: float = Field(default=120.0, ge=0.0, le=350.0, description="Mission payload mass in kg")
    fuel_tank_capacity_l: float = Field(default=220.0, ge=50.0, le=400.0, description="Total fuel capacity in Liters")


class WhatIfMissionResult(BaseModel):
    mission_name: str
    feasibility_score: float
    verdict: str  # "GO" | "CAUTION" | "NO-GO"
    projected_peak_cht: float
    projected_peak_egt: float
    thermal_margin_c: float
    total_fuel_consumed_l: float
    fuel_reserve_remaining_l: float
    fuel_endurance_margin_pct: float
    projected_rul_loss_hours: float
    estimated_wear_rate: float
    flight_profile_series: List[Dict[str, Any]]
    recommendations: List[str]
    operational_risks: List[str]


class WhatIfEngine:
    @staticmethod
    def simulate_mission(req: WhatIfMissionRequest) -> WhatIfMissionResult:
        # Physical constraints for Rotax 914 Turbo on TAPAS-BH201
        cht_redline = 155.0  # °C
        egt_redline = 850.0  # °C
        fuel_capacity = req.fuel_tank_capacity_l

        # RPM scaled from throttle + payload load factor
        payload_factor = 1.0 + (req.payload_weight_kg / 1000.0)
        eff_throttle = min(100.0, req.cruise_throttle_pct * payload_factor)
        cruise_rpm = 3000.0 + (eff_throttle / 100.0) * 2600.0

        # Thermodynamic equilibrium calculation
        physics_base = physics_model.compute_expected(cruise_rpm, eff_throttle, req.target_altitude_m)

        # Ambient temperature offset on cooling efficiency
        temp_delta = req.ambient_temp_c - 15.0
        projected_cht = physics_base["expected_cht"] + max(-10.0, temp_delta * 0.28)
        projected_egt = physics_base["expected_egt"] + max(-15.0, temp_delta * 0.15)
        
        # High altitude climb boost penalty
        if req.target_altitude_m > 4000:
            climb_penalty = (req.target_altitude_m - 4000) / 1000.0
            projected_cht += climb_penalty * 4.5
            projected_egt += climb_penalty * 8.0

        peak_cht = round(projected_cht, 1)
        peak_egt = round(projected_egt, 1)
        thermal_margin = round(cht_redline - peak_cht, 1)

        # Fuel consumption
        hourly_fuel_burn = physics_base["expected_fuel_flow"]
        total_fuel_burn = round(hourly_fuel_burn * req.flight_duration_hours, 1)
        fuel_reserve = round(fuel_capacity - total_fuel_burn, 1)
        fuel_margin_pct = round((fuel_reserve / fuel_capacity) * 100.0, 1)

        # Cumulative wear & RUL impact
        thermal_stress = max(0.0, (peak_cht - 130.0) / 25.0)
        power_stress = max(0.0, (eff_throttle - 70.0) / 30.0)
        wear_multiplier = 1.0 + thermal_stress * 1.5 + power_stress * 1.2
        projected_rul_loss = round(req.flight_duration_hours * wear_multiplier, 1)

        # Feasibility score (0 - 100%)
        feasibility = 100.0

        risks = []
        recommendations = []

        if thermal_margin < 10.0:
            feasibility -= 35.0
            risks.append(f"Critical thermal margin ({thermal_margin}°C remaining below 155°C redline).")
            recommendations.append("Reduce cruise throttle by 5-8% or increase climb airspeed for cowl cooling.")
        elif thermal_margin < 20.0:
            feasibility -= 15.0
            risks.append(f"Tight thermal margin ({thermal_margin}°C).")
            recommendations.append("Monitor Cylinder #2 and #4 temperatures closely during high altitude loiter.")

        if fuel_reserve < 0:
            feasibility -= 50.0
            risks.append(f"Insufficient fuel capacity! Deficit of {abs(fuel_reserve)} Liters for {req.flight_duration_hours}h duration.")
            recommendations.append("Reduce mission duration or optimize loiter altitude to decrease fuel flow.")
        elif fuel_margin_pct < 15.0:
            feasibility -= 20.0
            risks.append(f"Low fuel reserves ({fuel_reserve} L / {fuel_margin_pct}% remaining vs 15% NATO reserve rule).")
            recommendations.append("Plan alternate recovery airstrip.")

        if req.target_altitude_m > 6000 and req.ambient_temp_c > 35.0:
            feasibility -= 10.0
            risks.append("High Density Altitude combined with hot ambient ground temperature degrades turbocharger spooling margin.")
            recommendations.append("Limit continuous full throttle climb to under 12 minutes.")

        feasibility = round(max(5.0, min(100.0, feasibility)), 1)

        if feasibility >= 80.0:
            verdict = "GO"
            recommendations.append("Flight profile fully nominal. Engine operating within certified envelopes.")
        elif feasibility >= 50.0:
            verdict = "CAUTION"
        else:
            verdict = "NO-GO"

        # Generate discretized flight trajectory series
        steps = 10
        profile_series = []
        for s in range(steps + 1):
            frac = s / steps
            hour = round(frac * req.flight_duration_hours, 1)
            # Altitude profile
            if frac < 0.15:
                alt = req.target_altitude_m * (frac / 0.15)
                phase = "CLIMB"
                step_cht = 120.0 + (peak_cht - 120.0) * 0.9
            elif frac < 0.85:
                alt = req.target_altitude_m
                phase = "CRUISE / LOITER"
                step_cht = peak_cht
            else:
                alt = req.target_altitude_m * ((1.0 - frac) / 0.15)
                phase = "DESCENT"
                step_cht = max(95.0, peak_cht - 35.0)

            cur_fuel_burn = round(total_fuel_burn * frac, 1)
            step_oat = round(req.ambient_temp_c - (alt / 1000.0) * 6.5, 1)
            profile_series.append({
                "time_hour": f"T+{hour}h",
                "phase": phase,
                "altitude_m": round(alt),
                "oat_c": step_oat,
                "cht_c": round(step_cht, 1),
                "egt_c": round(peak_egt if phase != "DESCENT" else peak_egt - 60.0, 1),
                "cumulative_fuel_l": cur_fuel_burn,
                "fuel_remaining_l": round(fuel_capacity - cur_fuel_burn, 1),
            })

        return WhatIfMissionResult(
            mission_name=req.mission_name,
            feasibility_score=feasibility,
            verdict=verdict,
            projected_peak_cht=peak_cht,
            projected_peak_egt=peak_egt,
            thermal_margin_c=thermal_margin,
            total_fuel_consumed_l=total_fuel_burn,
            fuel_reserve_remaining_l=fuel_reserve,
            fuel_endurance_margin_pct=fuel_margin_pct,
            projected_rul_loss_hours=projected_rul_loss,
            estimated_wear_rate=round(wear_multiplier, 2),
            flight_profile_series=profile_series,
            recommendations=recommendations,
            operational_risks=risks if risks else ["No critical operational hazards identified."],
        )


whatif_engine = WhatEngine = WhatIfEngine()
