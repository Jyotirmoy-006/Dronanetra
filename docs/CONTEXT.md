# PROJECT CONTEXT DOCUMENT
## AI-Enabled Real-Time Digital Twin for Aero Piston Engine Health Monitoring (MALE UAV)

**Document purpose:** This is the single source of truth to be loaded into the Antigravity IDE agent's context at the start of every work session. It condenses the full Software Requirements Specification (SRS) into an actionable engineering brief, records every architectural decision made so far (including deviations from the original SRS), and states exactly where the project stands right now so the agent never has to re-derive scope from scratch.

**Status of this document:** v1.0 — created at project kickoff.
**Last updated:** 2026-09-02

---

## 0. HOW THE AGENT SHOULD USE THIS DOCUMENT

1. Treat Section 1–14 (derived from the SRS) as **requirements truth**. Do not silently reinterpret them.
2. Treat Section 15 (**Deviations from the SRS**) as **binding overrides** — where this section contradicts the original SRS, this section wins.
3. Treat Section 16 (**Current Progress Log**) as the **live state of the repository**. Update it at the end of every work session with what was actually built, not what was planned.
4. Treat Section 17 (**Open Decisions**) as things to ask the user about before assuming — do not guess silently on these.
5. When generating code, follow Section 18 (**Engineering Conventions**) without exception.

---

## 1. PROJECT IDENTITY

| Field | Value |
|---|---|
| Project name | AI-Enabled Real-Time Digital Twin for Aero Piston Engine Health Monitoring in MALE UAV |
| Working repo name | `male-uav-digital-twin` |
| Sponsor context | DRDO / Department of Defence Production – Dronanetra |
| Domain | Artificial Intelligence, Digital Twin, UAV, Predictive Maintenance |
| Source document | SRS v1.0 (uploaded), condensed below |
| One-line definition | An AI-powered real-time Digital Twin that continuously mirrors a MALE UAV's piston engine, detects abnormal behavior, predicts degradation/RUL, explains the reason for faults, and provides actionable engine-health information to the Ground Control Station (GCS). |

---

## 2. PROBLEM STATEMENT

Conventional UAV engine monitoring relies on **fixed thresholds** (e.g., "alarm if EGT > X"), which ignores that engine behavior legitimately varies with RPM, altitude, throttle, flight phase, and environment. This causes both **false alarms** and **missed subtle degradation**.

Additional constraint: **no public real-flight MALE-UAV piston-engine dataset exists.** The project must therefore combine synthetic/physics-generated data, a benchmark dataset (NASA C-MAPSS/N-CMAPSS, which is turbofan data and must never be presented as piston-engine-native), and real bench/ground/flight data where obtainable.

The system's core value proposition: **determine abnormality relative to current operating condition**, not against a static threshold.

---

## 3. SCOPE (16 functions)

1. Engine sensor-data acquisition
2. Real-time telemetry processing
3. Digital Twin creation
4. Physics-based engine modelling
5. AI/ML-based health monitoring
6. Anomaly detection
7. Fault detection and classification
8. Degradation estimation
9. Remaining Useful Life (RUL) prediction
10. Explainable AI
11. Severity-based alert generation
12. Real-time GCS dashboard
13. Mission data recording
14. Mission replay
15. Data visualization
16. Model validation and performance monitoring

Architecture must be **modular** — new engine types/sensors/airframes should not require a redesign.

---

## 4. OBJECTIVES

**Primary:** virtual Digital Twin; continuous telemetry sync; real-time abnormality detection; degradation prediction; RUL estimation where data allows; flight-condition-aware alarm reduction; explainable warnings; real-time GCS feed; both real-time and post-flight analysis.

**Secondary:** CAN/SocketCAN telemetry; edge inference; multi-sensor support; mission replay; historical storage; model retraining; prediction confidence scores; a validation pathway credible for future defence/aviation use.

---

## 5. STAKEHOLDERS

| Stakeholder | Primary need |
|---|---|
| UAV Operator | Real-time dashboard during mission |
| Maintenance Engineer | Historical data, fault info, degradation trends |
| System Administrator | Config, sensors, models, users |
| AI/ML Engineer | Develop/validate/update models |
| UAV/Engine Engineer | Validate physics model & operating parameters |
| Defence Organization | Overall predictive-maintenance capability |

---

## 6. SYSTEM LAYERS (five-layer model)

```
REAL UAV ENGINE (RPM, EGT, CHT, Vibration, Fuel Flow)
        ↓
DATA ACQUISITION LAYER (Sensors / CAN / SocketCAN)
        ↓
DIGITAL TWIN LAYER (Physics-Based Engine Model, Expected Behaviour)
        ↓
AI/ML LAYER (Anomaly, Fault, Degradation, RUL)
        ↓
EXPLAINABILITY + DECISION LAYER (Health Score, Confidence, Severity, SHAP)
        ↓
GCS DASHBOARD (Status, Alerts, Trends, RUL, Twin view, Mission Replay)
```

---

## 7. FUNCTIONAL REQUIREMENTS (condensed)

| ID | Requirement | Key detail |
|---|---|---|
| FR-01 | Sensor Data Acquisition | RPM, EGT, CHT, vibration, fuel flow, throttle, altitude, environment. Multi-modal, not single-sensor. |
| FR-02 | CAN/Telemetry Interface | CAN bus, SocketCAN, Serial/USB, simulated telemetry for dev. Standardized schema across ECU/FADEC variants. |
| FR-03 | Real-Time Data Processing | Receive → validate → clean invalid values → normalize → derive features → forward to Twin + AI. |
| FR-04 | Digital Twin | Maintains operating state, sensor values, expected behavior, health state, degradation state, fault state, history. Continuously updated. |
| FR-05 | Anomaly Detection | Autoencoder / Isolation Forest / One-Class SVM / statistical / LSTM. Produces anomaly score. Bands: 0.00–0.30 Normal, 0.30–0.60 Warning, 0.60–1.00 Critical (thresholds finalized during validation, not fixed a priori). |
| FR-06 | Fault Detection | Candidate classes: misfire, overheating, abnormal vibration, fuel-system abnormality, RPM abnormality, mechanical degradation, sensor abnormality. Final class set depends on available data. |
| FR-07 | RUL Prediction | LSTM/GRU/Temporal CNN/Transformer/regression/survival analysis, where degradation/run-to-failure data exists. Output is an estimate + confidence, never a guaranteed failure time. |
| FR-08 | Explainability | SHAP / feature importance / attention weights / residual analysis. Must show contributing factors per alert, not just a score. |

**Physics-based model** (Section 8 of SRS): estimates expected engine behavior from RPM, throttle, temperature, pressure, fuel flow, load, altitude, condition. Actual vs. expected → residual → fed into AI analysis. This hybrid approach is the core sim-to-real mitigation strategy.

**Flight-condition-aware monitoring** (Section 10): abnormality is judged relative to RPM/altitude/throttle/mission-phase/load/environment — not a static threshold. This is explicitly the primary false-alarm mitigation mechanism.

---

## 8. HEALTH INDEX, ALERTS

**Health Index:** single 0–100% score combining sensor health, anomaly score, physics residual, fault probability, degradation estimate. Exact formula to be established during model development (not prescribed by SRS).

**Alert levels:**

| Level | Meaning | Icon |
|---|---|---|
| 1 | Normal | 🟢 ENGINE HEALTHY |
| 2 | Advisory | 🟡 REQUIRES MONITORING |
| 3 | Warning | 🟠 POSSIBLE DEGRADATION |
| 4 | Critical | 🔴 CRITICAL CONDITION |

Each alert carries: level, timestamp, parameter, reason, confidence, recommended action. System must avoid alarm fatigue (binary over-alerting).

---

## 9. GCS DASHBOARD — REQUIRED VIEWS

Engine status (RPM/EGT/CHT/fuel flow/vibration/throttle) · AI status (health/anomaly/fault probability/RUL/confidence) · Digital Twin (actual vs expected, degradation state) · Alerts (current/history/severity/explanation) · Visualization (time-series for sensors, health, RUL, anomaly trends).

**Required pages:** Home, Dashboard, Digital Twin, Analytics, Fault Detection, RUL Prediction, Alerts, Mission Replay, About.

---

## 10. MISSION REPLAY

Record telemetry during a mission → post-mission the operator can select a mission, replay telemetry, view historical sensor values/alerts/health changes, analyze faults, review AI predictions. Offline capability, additive to (not a replacement for) real-time monitoring.

---

## 11. DATA STRATEGY (three-stage, mandatory sequencing)

```
Stage 1: NASA C-MAPSS / N-CMAPSS (benchmark, turbofan — methodology only)
        ↓
Stage 2: Synthetic piston-engine data (physics-model generated)
        ↓
Stage 3: Real bench/ground/flight data (calibration & validation, where authorized)
```

**Synthetic dataset schema:**
```
timestamp, rpm, egt, cht, vibration, fuel_flow, throttle, altitude,
temperature, pressure, engine_load, fault_type, health_index,
degradation_level, rul
```

**Hard constraint:** C-MAPSS must always be labeled as turbofan benchmark data, never presented as piston-engine training data.

---

## 12. API SURFACE (backend contract)

| Endpoint | Purpose |
|---|---|
| `GET /api/engine/live` | Live telemetry snapshot |
| `GET /api/engine/health` | Health score, status, anomaly score, confidence |
| `GET /api/alerts` | Current/historical alerts |
| `GET /api/engine/history` | Historical telemetry |
| `GET /api/missions` / `POST /api/missions` / `GET /api/missions/{id}` | Mission CRUD & retrieval |

External APIs (weather, atmospheric data) are **optional context only** — never the primary engine-health data source. Primary path is always `Engine → Sensors → CAN/Telemetry → Digital Twin`.

---

## 13. DATABASE ENTITIES

`engine (engine_id, engine_type, installation_id, status)` · `telemetry (timestamp, engine_id, rpm, egt, cht, vibration, fuel_flow, throttle, altitude)` · `prediction (timestamp, health_score, anomaly_score, fault_probability, rul, confidence)` · `alert (alert_id, timestamp, severity, fault_type, reason, confidence, status)` · `mission (mission_id, start_time, end_time, UAV_id, engine_id, mission_status)`.

---

## 14. NON-FUNCTIONAL REQUIREMENTS

Real-time low-latency processing · reliability under missing sensor values · scalability to multiple engines/UAVs/sensor configs · modular/independently-replaceable components · explainability on critical predictions · production security (auth, RBAC, encrypted comms, audit logging) · maintainability (modular, documented, version-controlled) · fault tolerance (no crash on comms/sensor loss).

---

## 15. DEVIATIONS FROM THE ORIGINAL SRS (binding — these override the SRS text above)

| # | SRS said | Project decision | Rationale |
|---|---|---|---|
| D-1 | Dashboard: "Streamlit for prototype, React for production" | **React from day one, including the MVP/hackathon prototype.** No Streamlit anywhere in the stack. | Explicit user instruction. Avoids a throwaway prototype and a costly later rewrite; React + FastAPI over WebSockets/REST is not meaningfully slower to stand up for an MVP than Streamlit once component scaffolding exists. |
| D-2 | No explicit charting library named for React | **Recharts** as default (Plotly.js as a fallback for anything Recharts can't express) | Recharts is lighter-weight and pairs well with a component-driven dashboard. |
| D-3 | No state-management approach specified | **React Context + hooks** for MVP; revisit Zustand/Redux only if state complexity grows | Keep MVP dependency surface small |
| D-4 | No real-time transport specified for dashboard updates | **WebSocket endpoint** (`/ws/engine`) in FastAPI for push updates, with REST endpoints retained for on-demand/historical queries | Real-time dashboard requirement is best served by push, not polling |

---

## 16. CURRENT PROGRESS LOG

### Session 1 — 2026-09-02
- **Status:** Project setup & repository scaffolding completed.
- **Done:**
  - Condensed SRS into `docs/CONTEXT.md`.
  - Created full project structure (backend, frontend, data, models, scripts, CI pipeline).
  - Built FastAPI backend endpoints, telemetry simulator, physics model residual calculation, health score and alert generation, WebSocket streaming hub.
  - Implemented React GCS dashboard with Vite, Recharts, dark tactical theme, and all 9 required navigation views.
  - Created synthetic piston-engine data generation script.

---

## 17. ENGINEERING CONVENTIONS (binding for all generated code)

**Backend (Python/FastAPI):**
- Python 3.11+, type-hinted throughout, `pydantic` models for all API request/response schemas.
- One FastAPI router per resource under `app/api/routes/` (`engine.py`, `health.py`, `alerts.py`, `history.py`, `missions.py`, `ws.py`).
- Business logic lives in `digital_twin/`, `ai_models/`, `decision_engine/`.
- All ML models expose a common interface (`predict(features) -> PredictionResult`).

**Frontend (React):**
- Vite + React (JavaScript).
- Component tree per dashboard page; shared widgets in `src/components/`.
- Backend calls via `src/services/api.js`.
- Live data via single WebSocket hook (`src/hooks/useEngineTelemetry.js`).
