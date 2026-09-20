"""
FastAPI application entrypoint.

Wires together the API routers defined under app/api/routes/. Business
logic must not live here or in the route handlers themselves — see
app/digital_twin, app/ai_models, app/decision_engine.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import engine, health, alerts, history, missions, ws, whatif, fleet
from app.database.session import init_db

app = FastAPI(
    title="MALE UAV Piston Engine Digital Twin API",
    description="Real-time AI-enabled digital twin & health monitoring platform for MALE UAV aero piston engines.",
    version="0.1.0",
)

# Initialize database tables
@app.on_event("startup")
def on_startup():
    try:
        init_db()
    except Exception as e:
        print(f"Database init warning: {e}")

# Dev-friendly CORS; tighten before any production/defence deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(engine.router, prefix="/api/engine", tags=["engine"])
app.include_router(health.router, prefix="/api/engine", tags=["health"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(history.router, prefix="/api/engine", tags=["history"])
app.include_router(missions.router, prefix="/api/missions", tags=["missions"])
app.include_router(whatif.router, prefix="/api/whatif", tags=["whatif"])
app.include_router(fleet.router, prefix="/api/fleet", tags=["fleet"])
app.include_router(ws.router, tags=["websocket"])


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "male-uav-digital-twin backend",
        "version": "0.1.0",
        "docs_url": "/docs",
    }
