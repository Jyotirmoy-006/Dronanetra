"""
Digital Twin engine specifications and component topology definition.
"""
from pydantic import BaseModel
from typing import List


class EngineComponent(BaseModel):
    name: str
    component_type: str
    status: str = "NOMINAL"  # NOMINAL | DEGRADED | CRITICAL
    health_percentage: float = 100.0


class AeroEngineProfile(BaseModel):
    engine_id: str = "ENG-ROTAX-914-01"
    model_name: str = "Rotax 914UL Turbocharged Piston Engine"
    displacement_cc: float = 1211.0
    cylinders: int = 4
    max_power_hp: float = 115.0
    max_continuous_rpm: float = 5500.0
    takeoff_rpm: float = 5800.0
    components: List[EngineComponent] = [
        EngineComponent(name="Cylinder Assembly #1", component_type="Cylinder", health_percentage=98.5),
        EngineComponent(name="Cylinder Assembly #2", component_type="Cylinder", health_percentage=97.0),
        EngineComponent(name="Cylinder Assembly #3", component_type="Cylinder", health_percentage=99.0),
        EngineComponent(name="Cylinder Assembly #4", component_type="Cylinder", health_percentage=96.5),
        EngineComponent(name="Turbocharger Unit", component_type="Turbine", health_percentage=94.0),
        EngineComponent(name="Dual Ignition System", component_type="Electrical", health_percentage=100.0),
        EngineComponent(name="Fuel Metering Unit", component_type="Fuel System", health_percentage=95.5),
    ]


default_engine_profile = AeroEngineProfile()
