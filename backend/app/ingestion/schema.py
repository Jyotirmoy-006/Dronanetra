"""
Standardized telemetry schema (FR-02) for MALE UAV Aero Piston Engine Digital Twin
(Dronanetra Spec Compliant). Supports ECU/FADEC & CAN-Bus sensor data integration.
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TelemetryReading(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    engine_id: str = "ENG-ROTAX-914-01"
    rpm: float = Field(..., description="Engine RPM (e.g. 2000 - 5800)")
    egt: float = Field(..., description="Average Exhaust Gas Temp in °C")
    cht: float = Field(..., description="Average Cylinder Head Temp in °C")
    vibration: float = Field(..., description="Vibration amplitude in mm/s or g")
    fuel_flow: float = Field(..., description="Fuel flow rate in L/h")
    throttle: float = Field(default=75.0, description="Throttle position 0-100%")
    altitude: float = Field(default=3000.0, description="Altitude in meters (ASL)")
    ambient_temp: float = Field(default=15.0, description="Outside air temp °C")
    oil_pressure: float = Field(default=4.5, description="Oil pressure in bar")
    oil_temp: float = Field(default=95.0, description="Oil temperature in °C")
    manifold_pressure: float = Field(default=35.0, description="Manifold pressure in inHg")
    
    # 4-Cylinder Individual Discrete Thermocouple Probes
    cht_cyl1: float = Field(default=134.0, description="Cylinder #1 Head Temp °C")
    cht_cyl2: float = Field(default=136.0, description="Cylinder #2 Head Temp °C")
    cht_cyl3: float = Field(default=133.0, description="Cylinder #3 Head Temp °C")
    cht_cyl4: float = Field(default=135.0, description="Cylinder #4 Head Temp °C")
    
    egt_cyl1: float = Field(default=718.0, description="Cylinder #1 Exhaust Temp °C")
    egt_cyl2: float = Field(default=724.0, description="Cylinder #2 Exhaust Temp °C")
    egt_cyl3: float = Field(default=716.0, description="Cylinder #3 Exhaust Temp °C")
    egt_cyl4: float = Field(default=722.0, description="Cylinder #4 Exhaust Temp °C")
    
    # Individual Cylinder Injector Pulse Widths (ms)
    inj_pw_cyl1: float = Field(default=4.12, description="Cylinder 1 Injector Pulse Width (ms)")
    inj_pw_cyl2: float = Field(default=4.15, description="Cylinder 2 Injector Pulse Width (ms)")
    inj_pw_cyl3: float = Field(default=4.10, description="Cylinder 3 Injector Pulse Width (ms)")
    inj_pw_cyl4: float = Field(default=4.14, description="Cylinder 4 Injector Pulse Width (ms)")
    
    # Extended Sub-System Parameters (Dronanetra Spec Compliant)
    bus_voltage: float = Field(default=28.2, description="28V DC Electrical Bus Voltage")
    alternator_current: float = Field(default=42.5, description="Alternator Load Current in Amperes")
    battery_soh: float = Field(default=98.0, description="Battery State of Health %")
    injection_timing: float = Field(default=24.0, description="Fuel Injection Start Timing in °BTDC")
    spark_advance: float = Field(default=28.5, description="Ignition Spark Advance Angle in °BTDC")
    spark_advance_jitter: float = Field(default=0.2, description="Spark Advance Timing Jitter in °")
    injection_duty_cycle: float = Field(default=42.0, description="Fuel Injector Duty Cycle %")
    vibration_freq_hz: float = Field(default=172.5, description="Peak Vibration Spectral Frequency in Hz")
    vibration_pattern: str = Field(default="NOMINAL_DYNAMIC_BALANCE", description="Identified Harmonic Vibration Defect Pattern")

    # Engine Efficiency & Thermodynamic Derivatives
    bsfc_g_kwh: float = Field(default=248.0, description="Brake Specific Fuel Consumption in g/kWh")
    thermal_efficiency_pct: float = Field(default=32.4, description="Brake Thermal Efficiency η_th %")
    volumetric_efficiency: float = Field(default=89.5, description="Volumetric Efficiency %")
    brake_power_kw: float = Field(default=78.5, description="Estimated Brake Power in kW")
    d_cht_dt: float = Field(default=0.0, description="CHT Rate of Rise in °C/min")
    d_egt_dt: float = Field(default=0.0, description="EGT Rate of Rise in °C/min")
    time_to_redline_min: float = Field(default=999.0, description="Predicted Time to CHT Redline in Minutes")

    # Combustion Instability & Dynamics
    cov_imep_pct: float = Field(default=1.8, description="Coefficient of Variation of Indicated Mean Effective Pressure %")
    torque_ripple_nm: float = Field(default=4.5, description="Combustion Torque Ripple Amplitude in Nm")
    
    # 32-Bin Vibration FFT Spectral Spectrum (0 - 500 Hz)
    fft_spectrum: List[float] = Field(
        default_factory=lambda: [0.05 + 0.02 * (i % 3) for i in range(32)],
        description="32-bin normalized FFT frequency spectrum"
    )
