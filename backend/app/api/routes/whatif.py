"""
What-If Mission Simulation Route (FR-09)
"""
from fastapi import APIRouter
from app.digital_twin.whatif_simulator import whatif_engine, WhatIfMissionRequest, WhatIfMissionResult

router = APIRouter()


@router.post("/simulate", response_model=WhatIfMissionResult)
def simulate_mission_plan(plan: WhatIfMissionRequest):
    """
    Simulates a custom mission profile against the aero piston engine physics model
    and prognostic degradation equations.
    """
    return whatif_engine.simulate_mission(plan)
