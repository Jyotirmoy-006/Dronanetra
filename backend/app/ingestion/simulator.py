"""
Implements FR-02 & Stage-2 synthetic telemetry generation.
Produces continuous streams of realistic TelemetryReading objects with dynamic
flight profiles (Takeoff, Climb, Cruise, Descent), 4-cylinder discrete thermocouples,
32-bin FFT harmonic vibration spectrum, combustion instability, and critical fault injections.
"""
import time
import math
import random
from datetime import datetime
from typing import Generator, Dict, Any, List

from app.ingestion.schema import TelemetryReading
from app.digital_twin.physics_model import physics_model
from app.processing.vibration_analyzer import vibration_analyzer


class TelemetrySimulator:
    """
    Simulates a MALE UAV piston engine telemetry stream in real-time or batch mode.
    Fully compliant with Dronanetra MALE UAV specification.
    """

    def __init__(self, seed: int = 42):
        random.seed(seed)
        self.step_count = 0
        self.injected_fault: str = "NONE"  # NONE | OVERHEATING | MISFIRE | HIGH_VIBRATION | FUEL_RESTRICTION | SENSOR_DRIFT | LUBRICATION_LOSS | COOLING_LOSS
        self.active_scenario: str = "NOMINAL"  # NOMINAL | HIGH_ALTITUDE | HOT_WEATHER | RAPID_THROTTLE

    def set_fault(self, fault_type: str):
        """Inject a simulated fault on the fly."""
        self.injected_fault = fault_type

    def set_scenario(self, scenario: str):
        """Set environmental flight scenario."""
        self.active_scenario = scenario

    def generate_reading(self) -> TelemetryReading:
        self.step_count += 1
        t = self.step_count

        # Base Flight Mission Phase (cycle every 600 steps ~ 10 minutes)
        cycle_t = t % 600
        if cycle_t < 60:
            # Takeoff
            altitude = 100.0 + cycle_t * 15.0
            throttle = 92.0 + random.uniform(-2, 2)
            rpm = 5400.0 + random.uniform(-50, 50)
        elif cycle_t < 150:
            # Climb
            altitude = 1000.0 + (cycle_t - 60) * 25.0
            throttle = 85.0 + random.uniform(-1.5, 1.5)
            rpm = 5100.0 + random.uniform(-40, 40)
        elif cycle_t < 480:
            # Cruise altitude
            altitude = 3200.0 + 100.0 * math.sin(t / 20.0) + random.uniform(-10, 10)
            throttle = 72.0 + random.uniform(-1.0, 1.0)
            rpm = 4800.0 + random.uniform(-30, 30)
        else:
            # Descent
            altitude = max(200.0, 3200.0 - (cycle_t - 480) * 25.0)
            throttle = 45.0 + random.uniform(-2, 2)
            rpm = 3200.0 + random.uniform(-50, 50)

        # Environmental Scenario Modifiers
        ambient_temp = 15.0 - (altitude / 1000.0) * 6.5
        if self.active_scenario == "HIGH_ALTITUDE":
            altitude = 6500.0 + 50.0 * math.sin(t / 15.0)
            throttle = 88.0 + random.uniform(-1, 1)
            rpm = 5200.0 + random.uniform(-30, 30)
            ambient_temp = -26.0
        elif self.active_scenario == "HOT_WEATHER":
            ambient_temp = 48.0 - (altitude / 1000.0) * 4.5
        elif self.active_scenario == "RAPID_THROTTLE":
            throttle = 40.0 + 55.0 * (0.5 + 0.5 * math.sin(t / 5.0))
            rpm = 2800.0 + (throttle / 100.0) * 2800.0 + random.uniform(-40, 40)

        # Baseline expected physics values from transient thermodynamic model
        expected = physics_model.compute_expected(rpm, throttle, altitude)

        egt = expected["expected_egt"] + random.gauss(0, 3.5)
        cht = expected["expected_cht"] + random.gauss(0, 1.8) + (ambient_temp - 15.0) * 0.2
        vibration = expected["expected_vibration"] + random.gauss(0, 0.08)
        fuel_flow = expected["expected_fuel_flow"] + random.gauss(0, 0.25)
        oil_temp = expected["expected_oil_temp"] + random.gauss(0, 0.9) + (ambient_temp - 15.0) * 0.15
        oil_pressure = expected["expected_oil_pressure"] + random.gauss(0, 0.04)

        # Subsystem default parameters
        bus_voltage = 28.2 + random.uniform(-0.15, 0.15)
        alternator_current = 42.5 + (throttle / 100.0) * 8.0 + random.uniform(-0.8, 0.8)
        battery_soh = max(75.0, 98.5 - (t * 0.0005))
        injection_timing = 24.0 + (rpm / 5000.0) * 2.0 + random.uniform(-0.4, 0.4)
        spark_advance = 28.5 + (rpm / 5000.0) * 3.0 + random.uniform(-0.4, 0.4)
        spark_advance_jitter = 0.2 + random.uniform(0.0, 0.15)
        injection_duty_cycle = (fuel_flow / 25.0) * 60.0 + random.uniform(-0.8, 0.8)
        vibration_freq_hz = (rpm / 60.0) * 2.0 + random.uniform(-1.5, 1.5)

        # Combustion Instability Baseline
        cov_imep = 1.8 + random.uniform(-0.3, 0.4)
        torque_ripple = 4.2 + (throttle / 100.0) * 2.0 + random.uniform(-0.4, 0.4)

        # Base Injector Pulse Widths (ms)
        base_pw = 3.8 + (fuel_flow / 20.0) * 1.8
        inj_pw_1 = base_pw + random.uniform(-0.05, 0.05)
        inj_pw_2 = base_pw + random.uniform(-0.05, 0.05)
        inj_pw_3 = base_pw + random.uniform(-0.05, 0.05)
        inj_pw_4 = base_pw + random.uniform(-0.05, 0.05)

        # -------------------------------------------------------------
        # Physical Fault Injection Offsets
        # -------------------------------------------------------------
        is_sensor_drift = (self.injected_fault == "SENSOR_DRIFT")

        if self.injected_fault == "OVERHEATING":
            cht += 48.0 + random.uniform(5, 15)
            egt += 65.0 + random.uniform(10, 20)
            oil_temp += 28.0
            oil_pressure -= 0.85
        elif self.injected_fault == "MISFIRE":
            vibration += 3.8 + random.uniform(0.5, 1.5)
            egt -= 85.0
            rpm -= random.uniform(120, 280)
            vibration_freq_hz += 48.0
            spark_advance -= 7.5
            spark_advance_jitter = 2.4 + random.uniform(0.5, 1.2)
            cov_imep = 8.5 + random.uniform(1.2, 3.5)  # Severe combustion instability
            torque_ripple = 14.8 + random.uniform(2.0, 4.5)
        elif self.injected_fault == "HIGH_VIBRATION":
            vibration += 4.9 + random.uniform(0.8, 2.0)
            vibration_freq_hz = (rpm / 60.0) * 3.5 + random.uniform(-3, 3)
            cht += 12.0
            torque_ripple = 9.8 + random.uniform(1.0, 2.5)
        elif self.injected_fault == "FUEL_RESTRICTION":
            fuel_flow *= 0.68
            egt += 105.0
            injection_duty_cycle = min(96.0, injection_duty_cycle * 1.5)
            inj_pw_2 *= 0.45  # Cylinder 2 injector restricted
            cov_imep = 5.8 + random.uniform(0.8, 1.8)
        elif self.injected_fault == "LUBRICATION_LOSS":
            oil_pressure = max(0.6, oil_pressure * 0.28)
            oil_temp += 36.0
            vibration += 1.8
        elif self.injected_fault == "COOLING_LOSS":
            cht += 55.0
            oil_temp += 30.0
            egt += 35.0

        # Discrete 4-Cylinder Thermocouple Distribution
        cyl1_offset = -1.5 if self.injected_fault != "MISFIRE" else 2.0
        cyl2_offset = 3.5 if self.injected_fault != "OVERHEATING" else 14.0
        cyl3_offset = -2.0 if self.injected_fault != "MISFIRE" else -24.0
        cyl4_offset = 0.5 if self.injected_fault != "OVERHEATING" else 9.0

        cht_cyl1 = round(cht + cyl1_offset + random.uniform(-0.5, 0.5), 1)
        cht_cyl2 = round(cht + cyl2_offset + random.uniform(-0.5, 0.5), 1)
        cht_cyl3 = round(cht + cyl3_offset + random.uniform(-0.5, 0.5), 1)
        cht_cyl4 = round(cht + cyl4_offset + random.uniform(-0.5, 0.5), 1)

        egt_cyl1 = round(egt - 4.0 + random.uniform(-1, 1), 1)
        egt_cyl2 = round(egt + 6.0 + random.uniform(-1, 1), 1)
        egt_cyl3 = round(egt + (-55.0 if self.injected_fault == "MISFIRE" else -2.0) + random.uniform(-1, 1), 1)
        egt_cyl4 = round(egt + 3.0 + random.uniform(-1, 1), 1)

        # SENSOR_DRIFT: Drift ONLY Cylinder 2 probe by +165°C while actual engine is nominal
        if is_sensor_drift:
            egt_cyl2 = round(egt_cyl2 + 165.0, 1)
            egt = round((egt_cyl1 + egt_cyl2 + egt_cyl3 + egt_cyl4) / 4.0, 1)

        # 32-Bin Vibration FFT Frequency Spectrum (0 Hz to 500 Hz)
        fft_spectrum: List[float] = []
        fund_bin = max(1, min(30, int((rpm / 60.0) / 15.625)))
        harm2_bin = max(1, min(30, int((2.0 * rpm / 60.0) / 15.625)))

        for b in range(32):
            base_noise = random.uniform(0.02, 0.08)
            val = base_noise
            if abs(b - fund_bin) <= 1:
                val += (vibration * 0.35) / (1 + abs(b - fund_bin))
            if abs(b - harm2_bin) <= 1:
                val += (vibration * 0.55) / (1 + abs(b - harm2_bin))
            if self.injected_fault in ["HIGH_VIBRATION", "MISFIRE"] and 14 <= b <= 24:
                val += random.uniform(0.3, 0.85) * (vibration / 3.0)
            fft_spectrum.append(round(min(1.0, val), 3))

        # Analyze spectral patterns
        vib_analysis = vibration_analyzer.analyze_spectrum(fft_spectrum, rpm, vibration)
        vibration_pattern = vib_analysis["primary_pattern"]

        return TelemetryReading(
            timestamp=datetime.utcnow(),
            engine_id="ENG-ROTAX-914-01",
            rpm=round(rpm, 1),
            egt=round(egt, 1),
            cht=round(cht, 1),
            vibration=round(max(0.1, vibration), 2),
            fuel_flow=round(max(0.5, fuel_flow), 2),
            throttle=round(throttle, 1),
            altitude=round(altitude, 1),
            ambient_temp=round(ambient_temp, 1),
            oil_pressure=round(max(0.4, oil_pressure), 2),
            oil_temp=round(oil_temp, 1),
            manifold_pressure=round(expected.get("manifold_pressure_kpa", 35.0), 1),
            cht_cyl1=cht_cyl1,
            cht_cyl2=cht_cyl2,
            cht_cyl3=cht_cyl3,
            cht_cyl4=cht_cyl4,
            egt_cyl1=egt_cyl1,
            egt_cyl2=egt_cyl2,
            egt_cyl3=egt_cyl3,
            egt_cyl4=egt_cyl4,
            inj_pw_cyl1=round(inj_pw_1, 2),
            inj_pw_cyl2=round(inj_pw_2, 2),
            inj_pw_cyl3=round(inj_pw_3, 2),
            inj_pw_cyl4=round(inj_pw_4, 2),
            bus_voltage=round(bus_voltage, 2),
            alternator_current=round(alternator_current, 1),
            battery_soh=round(battery_soh, 1),
            injection_timing=round(injection_timing, 1),
            spark_advance=round(spark_advance, 1),
            spark_advance_jitter=round(spark_advance_jitter, 2),
            injection_duty_cycle=round(injection_duty_cycle, 1),
            vibration_freq_hz=round(vibration_freq_hz, 1),
            vibration_pattern=vibration_pattern,
            bsfc_g_kwh=expected.get("bsfc_g_kwh", 248.0),
            thermal_efficiency_pct=expected.get("thermal_efficiency_pct", 32.4),
            volumetric_efficiency=expected.get("volumetric_efficiency", 89.5),
            brake_power_kw=expected.get("brake_power_kw", 78.5),
            d_cht_dt=expected.get("d_cht_dt", 0.0),
            d_egt_dt=expected.get("d_egt_dt", 0.0),
            time_to_redline_min=expected.get("time_to_redline_min", 999.0),
            cov_imep_pct=round(cov_imep, 2),
            torque_ripple_nm=round(torque_ripple, 2),
            fft_spectrum=fft_spectrum,
        )


simulator = TelemetrySimulator()
