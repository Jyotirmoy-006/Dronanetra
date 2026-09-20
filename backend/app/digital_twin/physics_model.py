"""
Implements Section 8 & FR-04: Transient Thermodynamic & Physics Engine
========================================================================
Calculates real-time expected thermodynamic states, turbocharger spool lag dynamics,
cylinder thermal capacitance differential equations, rate-of-rise trend forecasting (dCHT/dt),
and engine efficiency metrics (BSFC, Thermal Efficiency η_th, Volumetric Efficiency η_v).
"""
import math
import time
from typing import Dict, Any, Optional


class PistonEnginePhysicsModel:
    """
    Transient thermodynamic differential physics model for the VRDE 180 HP / Rotax 914 Turbo
    4-cylinder boxer aero piston engine for MALE UAV platform (TAPAS-BH201).
    """

    def __init__(self):
        # Baseline engine constants
        self.idle_rpm = 1400.0
        self.max_rpm = 5800.0
        self.displacement_liters = 1.352  # 1,352 cc (4-cylinder boxer)
        self.compression_ratio = 9.0
        self.fuel_density_kg_per_l = 0.72  # Avgas 100LL / Mogas
        self.fuel_lhv_mj_per_kg = 43.5     # Lower Heating Value (MJ/kg)

        # Dynamic internal state variables (Differential Equations)
        self.last_timestamp = time.time()
        self.transient_boost_kpa = 101.3
        self.transient_cht = 120.0
        self.transient_egt = 700.0
        self.prev_cht = 120.0
        self.prev_egt = 700.0
        self.d_cht_dt = 0.0  # °C / minute
        self.d_egt_dt = 0.0  # °C / minute

        # Turbocharger lag time constant (seconds)
        self.tau_turbo = 0.85
        # Cylinder head thermal capacitance time constant (seconds)
        self.tau_thermal = 6.5

    def compute_expected(
        self,
        rpm: float,
        throttle: float,
        altitude: float,
        dt_seconds: Optional[float] = None
    ) -> Dict[str, float]:
        """
        Calculates expected transient and steady-state thermodynamic, mechanical,
        and efficiency values for given flight conditions.
        """
        now = time.time()
        if dt_seconds is None:
            dt = max(0.1, min(2.0, now - self.last_timestamp))
        else:
            dt = max(0.01, min(5.0, dt_seconds))
        self.last_timestamp = now

        # Clamp inputs
        rpm = max(1000.0, min(6200.0, rpm))
        throttle = max(0.0, min(100.0, throttle))
        alt_km = max(0.0, min(10.0, altitude / 1000.0))

        # ISA Atmosphere Model: Ambient Pressure & Temperature
        ambient_pressure_kpa = 101.325 * ((1.0 - 0.0065 * (altitude / 288.15)) ** 5.25588)
        ambient_temp_c = 15.0 - 6.5 * alt_km
        ambient_temp_k = ambient_temp_c + 273.15
        air_density_kg_m3 = (ambient_pressure_kpa * 1000.0) / (287.05 * ambient_temp_k)
        density_ratio = air_density_kg_m3 / 1.225

        # -------------------------------------------------------------
        # 1. Transient Turbocharger Boost & Manifold Dynamics
        # -------------------------------------------------------------
        # Target boost at full throttle up to 1.35 bar (135 kPa abs)
        target_boost_kpa = min(135.0, ambient_pressure_kpa + (throttle / 100.0) * 34.0)
        # Euler integration for turbocharger spool-up lag
        alpha_turbo = 1.0 - math.exp(-dt / self.tau_turbo)
        self.transient_boost_kpa += (target_boost_kpa - self.transient_boost_kpa) * alpha_turbo
        manifold_pressure_kpa = self.transient_boost_kpa

        # -------------------------------------------------------------
        # 2. Engine Power, Torque & Volumetric Efficiency
        # -------------------------------------------------------------
        # Volumetric efficiency curve across RPM band
        rpm_ratio = rpm / self.max_rpm
        volumetric_efficiency = 0.84 + 0.12 * math.sin(rpm_ratio * math.pi) - (0.02 * (1.0 - throttle / 100.0))
        volumetric_efficiency = max(0.70, min(0.98, volumetric_efficiency))

        # Manifold charge air density (kg/m3) based on manifold pressure and temperature
        charge_air_density_kg_m3 = (manifold_pressure_kpa * 1000.0) / (287.05 * max(200.0, ambient_temp_k))

        # Theoretical and actual air mass flow rate (kg/h)
        air_mass_flow_kg_h = (
            (rpm * 60.0 / 2.0) * (self.displacement_liters * 1e-3) *
            charge_air_density_kg_m3 * volumetric_efficiency
        )

        # Normalized engine load
        normalized_load = (throttle / 100.0) * 0.65 + rpm_ratio * 0.35

        # Estimated Brake Power (kW and HP)
        brake_power_kw = (
            (manifold_pressure_kpa / 101.3) * (rpm / 5800.0) * 85.0 *
            (throttle / 100.0) + (rpm / 5800.0) * 20.0
        )
        brake_power_kw = max(8.0, min(134.0, brake_power_kw))  # VRDE 180 HP = 134 kW max
        brake_power_hp = brake_power_kw * 1.34102

        # -------------------------------------------------------------
        # 3. Fuel Flow, BSFC & Brake Thermal Efficiency (η_th)
        # -------------------------------------------------------------
        # Expected Fuel Flow (L/h)
        expected_fuel_flow = (air_mass_flow_kg_h / 14.7) / self.fuel_density_kg_per_l
        expected_fuel_flow = max(3.5, min(38.0, expected_fuel_flow))
        fuel_flow_kg_h = expected_fuel_flow * self.fuel_density_kg_per_l

        # BSFC (Brake Specific Fuel Consumption in g/kWh)
        bsfc_g_kwh = (fuel_flow_kg_h * 1000.0) / max(5.0, brake_power_kw)
        bsfc_g_kwh = max(210.0, min(480.0, bsfc_g_kwh))

        # Brake Thermal Efficiency (η_th %) = P_brake / (m_fuel * LHV)
        fuel_energy_input_kw = (fuel_flow_kg_h * self.fuel_lhv_mj_per_kg * 1000.0) / 3600.0
        thermal_efficiency_pct = (brake_power_kw / max(10.0, fuel_energy_input_kw)) * 100.0
        thermal_efficiency_pct = max(18.0, min(38.5, thermal_efficiency_pct))

        # -------------------------------------------------------------
        # 4. Thermal Capacitance ODE (CHT & EGT Dynamics + Rate of Rise)
        # -------------------------------------------------------------
        # Steady-state target CHT & EGT
        target_cht = 85.0 + 48.0 * normalized_load + 12.0 * (rpm / 5000.0) - (alt_km * 1.8) + (ambient_temp_c - 15.0) * 0.25
        target_egt = 660.0 + 175.0 * math.sin(normalized_load * math.pi / 2.0) + (alt_km * 3.0)

        # Thermal inertia integration
        alpha_thermal = 1.0 - math.exp(-dt / self.tau_thermal)
        self.transient_cht += (target_cht - self.transient_cht) * alpha_thermal
        self.transient_egt += (target_egt - self.transient_egt) * (1.0 - math.exp(-dt / 1.5))

        # Calculate Rate of Rise (dCHT/dt & dEGT/dt in °C per minute)
        self.d_cht_dt = ((self.transient_cht - self.prev_cht) / max(0.001, dt)) * 60.0
        self.d_egt_dt = ((self.transient_egt - self.prev_egt) / max(0.001, dt)) * 60.0
        self.prev_cht = self.transient_cht
        self.prev_egt = self.transient_egt

        # Time to CHT Redline (150°C limit) forecast in minutes
        cht_redline_limit = 150.0
        if self.d_cht_dt > 0.5 and self.transient_cht < cht_redline_limit:
            time_to_redline_min = (cht_redline_limit - self.transient_cht) / self.d_cht_dt
        else:
            time_to_redline_min = 999.0

        # Mechanical Vibration
        expected_vibration = 0.5 + 2.4 * ((rpm / self.max_rpm) ** 2)

        # Oil Circuit States
        expected_oil_temp = 75.0 + 32.0 * normalized_load + (ambient_temp_c - 15.0) * 0.12
        expected_oil_pressure = 2.0 + 2.8 * (rpm / self.max_rpm)

        return {
            "expected_fuel_flow": round(expected_fuel_flow, 2),
            "expected_cht": round(self.transient_cht, 1),
            "expected_egt": round(self.transient_egt, 1),
            "expected_vibration": round(expected_vibration, 2),
            "expected_oil_temp": round(expected_oil_temp, 1),
            "expected_oil_pressure": round(expected_oil_pressure, 2),
            "manifold_pressure_kpa": round(manifold_pressure_kpa, 1),
            "brake_power_kw": round(brake_power_kw, 1),
            "brake_power_hp": round(brake_power_hp, 1),
            "bsfc_g_kwh": round(bsfc_g_kwh, 1),
            "thermal_efficiency_pct": round(thermal_efficiency_pct, 1),
            "volumetric_efficiency": round(volumetric_efficiency * 100.0, 1),
            "d_cht_dt": round(self.d_cht_dt, 2),
            "d_egt_dt": round(self.d_egt_dt, 2),
            "time_to_redline_min": round(time_to_redline_min, 1),
        }

    def compute_residuals(self, actual: Dict[str, float], expected: Dict[str, float]) -> Dict[str, float]:
        """Calculates delta (Residual = Actual - Expected) across physical states."""
        residuals = {}
        if "egt" in actual and "expected_egt" in expected:
            residuals["egt_residual"] = round(actual["egt"] - expected["expected_egt"], 1)
        if "cht" in actual and "expected_cht" in expected:
            residuals["cht_residual"] = round(actual["cht"] - expected["expected_cht"], 1)
        if "fuel_flow" in actual and "expected_fuel_flow" in expected:
            residuals["fuel_flow_residual"] = round(actual["fuel_flow"] - expected["expected_fuel_flow"], 2)
        if "vibration" in actual and "expected_vibration" in expected:
            residuals["vibration_residual"] = round(actual["vibration"] - expected["expected_vibration"], 2)
        if "oil_pressure" in actual and "expected_oil_pressure" in expected:
            residuals["oil_pressure_residual"] = round(actual["oil_pressure"] - expected["expected_oil_pressure"], 2)
        return residuals


physics_model = PistonEnginePhysicsModel()
