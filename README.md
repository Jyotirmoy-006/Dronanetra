# 🛡️ DRONANETRA
### AI-Enabled Real-Time Digital Twin System for Health Monitoring, Fault Prediction and Mission Reliability Enhancement of Aero Piston Engines in MALE UAVs

---

**Smart India Hackathon (SIH) | Problem Statement ID:** `26054`  
**Team Name:** `AlgoX.6`  
**Team ID:** `145605`  
**Ministry / Organization:** Ministry of Defence / DRDO / Department of Defence Production  
**Domain:** Artificial Intelligence, Digital Twins, Aerospace Propulsion, Predictive Maintenance, Ground Control Systems (GCS)  

---

## 📑 Table of Contents
1. [Executive Summary & Problem Statement](#-executive-summary--problem-statement)
2. [Key Deficiencies in Conventional UAV Monitoring](#-key-deficiencies-in-conventional-uav-monitoring)
3. [Dronanetra Digital Twin Solution Architecture](#-dronanetra-digital-twin-solution-architecture)
4. [System Architecture Diagram](#-system-architecture-diagram)
5. [Detailed Module Breakdown](#-detailed-module-breakdown)
   - [A. Digital Twin Core & Physics-Informed Engine](#a-digital-twin-core--physics-informed-engine)
   - [B. Multi-Modal Sensor Ingestion & Telemetry Bus](#b-multi-modal-sensor-ingestion--telemetry-bus)
   - [C. AI/ML Anomaly Detection & Fault Classifier](#c-aiml-anomaly-detection--fault-classifier)
   - [D. Prognostics & Remaining Useful Life (RUL) Estimation](#d-prognostics--remaining-useful-life-rul-estimation)
   - [E. Explainable AI (XAI) & Autonomous Decision Engine](#e-explainable-ai-xai--autonomous-decision-engine)
   - [F. Environmental "What-If" Simulator & Mission Replay](#f-environmental-what-if-simulator--mission-replay)
   - [G. Military-Grade Ground Control Station (GCS) UI](#g-military-grade-ground-control-station-gcs-ui)
   - [H. Facial Biometric Authentication & RBAC Gate](#h-facial-biometric-authentication--rbac-gate)
6. [SIH Problem Statement 26054 Compliance Matrix](#-sih-problem-statement-26054-compliance-matrix)
7. [Technology Stack](#-technology-stack)
8. [Repository Directory Structure](#-repository-directory-structure)
9. [API & WebSocket Telemetry Specification](#-api--websocket-telemetry-specification)
10. [Prerequisites & System Requirements](#-prerequisites--system-requirements)
11. [Installation & Setup Guide](#-installation--setup-guide)
12. [One-Click Orchestrated Launch](#-one-click-orchestrated-launch)
13. [Remote Access via Cloudflare Tunnel](#-remote-access-via-cloudflare-tunnel)
14. [Testing & Verification](#-testing--verification)
15. [Future Roadmap & Defence Deployment Pathway](#-future-roadmap--defence-deployment-pathway)
16. [License & Acknowledgments](#-license--acknowledgments)

---

## 📌 Executive Summary & Problem Statement

Medium Altitude Long Endurance (**MALE**) Unmanned Aerial Vehicles (UAVs) such as TAPAS-BH-201, Rustom-II, and Archer-NG operate in high-risk, extended-duration Intelligence, Surveillance, Reconnaissance (**ISR**), electronic warfare, and maritime security missions. The heart of these platforms is an internal combustion aero piston engine (e.g., Rotax 914 / VRDE indigenous aero-engines).

Propulsion system failures during flight lead to catastrophic outcomes:
- **In-flight mission aborts**
- **Loss of high-value strategic defence assets**
- **Critical recovery hazards and unguided crashes**

```
   ┌────────────────────────────────────────────────────────────────────────────────┐
   │                               DRONANETRA PLATFORM                              │
   │                                                                                │
   │  [Physical Engine] ──(CAN/ECU)──► [Physics Engine + PINN] ──► [Digital Twin]  │
   │                                           │                         │          │
   │                                    (Real-Time Sync)          (What-If Sim)     │
   │                                           ▼                         ▼          │
   │  [Operator GCS] ◄──(WebSocket)─── [AI Diagnostics] ◄── [Decision Advisor]      │
   └────────────────────────────────────────────────────────────────────────────────┘
```

**Dronanetra** is a complete, scalable, and modular **AI-Enabled Real-Time Digital Twin System** designed for Ground Control Stations (GCS) and engine health management facilities. It establishes a continuously synchronized virtual twin of the physical aero engine by synthesizing live sensor streams, thermodynamic first-principles, machine learning diagnostics, and explainable AI.

---

## 🔍 Key Deficiencies in Conventional UAV Monitoring

| Parameter | Conventional UAV Monitoring | Dronanetra Digital Twin System |
|---|---|---|
| **Monitoring Paradigm** | Static, threshold-based alerts (e.g., trigger alarm if $EGT > 850^\circ\text{C}$). | **Operating-Condition Aware**: Evaluates parameters dynamically relative to altitude, ambient temp, throttle, and RPM. |
| **Failure Detection** | Reactive: Signals alarms only *after* severe damage or failure occurs. | **Predictive & Proactive**: Predicts incipient micro-degradations hours before mechanical breakdown. |
| **Degradation Tracking** | None: Binary healthy/faulty status. | **Continuous Health Index ($0-100\%$)** across sub-systems. |
| **Life Prediction** | Fixed maintenance schedules based on flight hours. | **Dynamic Remaining Useful Life (RUL)** estimation with confidence bounds. |
| **Environmental Adaptation**| Ignores ambient density altitude and thermal derating. | **Thermodynamic model** automatically accounts for density altitude, temperature lapsing, and turbo boost. |
| **Fault Transparency** | Cryptic error codes without context. | **Explainable AI (SHAP)** with root-cause attribution and automated Gemini advisory. |

---

## 🏛️ Dronanetra Digital Twin Solution Architecture

The system is structured as an **end-to-end 5-layer industrial architecture**:

```
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                         5. GROUND CONTROL STATION (GCS)                          │
 │  Skeuomorphic Avionics UI • 3D CAD Twin • FFT Spectrum • What-If Sim • Replay   │
 └────────────────────────────────────────▲─────────────────────────────────────────┘
                                          │ Real-Time WebSocket (50Hz) / REST API
 ┌────────────────────────────────────────┴─────────────────────────────────────────┐
 │                     4. EXPLAINABILITY & DECISION ENGINE LAYER                    │
 │  SHAP Attribution • Health Index • 4-Tier Severity Manager • Gemini Maintenance  │
 └────────────────────────────────────────▲─────────────────────────────────────────┘
                                          │ Diagnostic Residuals & Fault Probabilities
 ┌────────────────────────────────────────┴─────────────────────────────────────────┐
 │                      3. AI/ML PREDICTIVE ANALYTICS LAYER                         │
 │  Autoencoder Anomaly • Multi-Head Fault Classifier • LSTM RUL • PINN Physics Loss│
 └────────────────────────────────────────▲─────────────────────────────────────────┘
                                          │ Synchronized Physical + Virtual State
 ┌────────────────────────────────────────┴─────────────────────────────────────────┐
 │                     2. DIGITAL TWIN & THERMODYNAMIC CORE                         │
 │  Otto/Diesel Cycle • CHT/EGT Heat Transfer • Volumetric Eff • Friction Losses   │
 └────────────────────────────────────────▲─────────────────────────────────────────┘
                                          │ Cleaned, Normalized Multi-Modal Vectors
 ┌────────────────────────────────────────┴─────────────────────────────────────────┐
 │                   1. INGESTION & TELEMETRY ACQUISITION LAYER                     │
 │  CAN Bus (SocketCAN) • Serial / USB • ECU/FADEC Interfaces • Synthetic Sim Stream│
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Detailed Module Breakdown

### A. Digital Twin Core & Physics-Informed Engine
*Location:* [`backend/app/digital_twin/`](file:///C:/piston%20engine%203/backend/app/digital_twin/)

1. **Thermodynamic First-Principles Modeling**:
   - Solves real-time Otto-cycle thermodynamics:
     $$\eta_{th} = 1 - \frac{1}{r_c^{\gamma - 1}}$$
   - Cylinder Head Temperature (**CHT**) dynamic heat balance:
     $$m c_p \frac{dT_{cht}}{dt} = \dot{Q}_{combustion} - h_{air}(v) A (T_{cht} - T_{ambient}) - \dot{Q}_{oil}$$
   - Exhaust Gas Temperature (**EGT**) enthalpy conservation based on fuel-air equivalence ratio ($\phi$) and ignition advance timing.
   - Brake Mean Effective Pressure (**BMEP**) and indicated power computation:
     $$P_{ind} = \frac{\text{BMEP} \cdot V_d \cdot N}{2}$$

2. **Residual Anomaly Generation**:
   The Digital Twin computes the exact mathematical delta between expected physical behavior and real-time telemetry:
   $$\vec{R}(t) = \vec{Y}_{\text{actual}}(t) - \vec{Y}_{\text{twin\_physics}}(t)$$
   Non-zero residuals isolate true engine degradation from legitimate flight condition variations.

---

### B. Multi-Modal Sensor Ingestion & Telemetry Bus
*Location:* [`backend/app/ingestion/`](file:///C:/piston%20engine%203/backend/app/ingestion/)

- **Supported Channels**:
  - **SocketCAN / CAN 2.0B / CAN-FD**: Standardized 29-bit identifier protocol for UAV avionics.
  - **Serial RS-232/RS-422 / USB**: High-speed telemetry ingestion.
  - **Synthetic Telemetry Streamer**: Realistic multi-phase mission telemetry generator with sensor noise and atmospheric degradation.
- **Monitored Parameters**:
  - `Engine RPM` (0 – 6500 RPM)
  - `Cylinder Head Temperature (CHT 1-4)` (50 – 260 °C)
  - `Exhaust Gas Temperature (EGT 1-4)` (200 – 950 °C)
  - `Oil Pressure & Temperature` (0 – 10 bar, 20 – 160 °C)
  - `Fuel Flow & Injection Timing` (0 – 45 L/hr, degrees BTDC)
  - `3-Axis Vibration Signatures` ($G_{rms}$ and FFT spectrum up to 5 kHz)
  - `Battery Voltage & Alternator Current` (18 – 32 V, 0 – 60 A)
  - `Manifold Absolute Pressure (MAP)` (20 – 120 kPa)

---

### C. AI/ML Anomaly Detection & Fault Classifier
*Location:* [`backend/app/ai_models/`](file:///C:/piston%20engine%203/backend/app/ai_models/)

1. **Isolation Forest**:
   - Unsupervised neural compression reconstructs normal operating manifolds.
   - Reconstruction error exceeding dynamic dynamic threshold classifies instantaneous anomalies.

2. **Multi-Class Fault Classifier**:
   Identifies **8 Defence-Critical Fault Signatures**:
   - 🔴 **Cylinder Misfire** (abrupt EGT drop on single cylinder + high-frequency vibration spike)
   - 🔴 **Fuel Injector Clogging** (lean mixture, elevated EGT, unstable idle)
   - 🟠 **Cooling System Degradation** (gradual CHT upward drift independent of airspeed)
   - 🔴 **Lubrication Breakdown** (oil pressure loss + oil temperature surge)
   - 🟡 **Sensor Drift / Disconnect** (frozen readings, unphysical step changes)
   - 🟠 **Combustion Instability** (high cyclic EGT dispersion, knock sensor alerts)
   - 🔴 **Thermal Overheating Runaway** (simultaneous CHT and EGT critical limit breaches)
   - 🟠 **Bearing / Mechanical Wear** (elevated 2X rotational harmonic vibration)

3. **Physics-Informed Neural Network (PINN)**:
   - Penalizes ML predictions that violate thermodynamic energy conservation, ensuring physically plausible predictions even on out-of-distribution operational envelopes.

---

### D. Prognostics & Remaining Useful Life (RUL) Estimation
*Location:* [`backend/app/ai_models/rul_predictor.py`](file:///C:/piston%20engine%203/backend/app/ai_models/rul_predictor.py)

- **Bidirectional LSTM + Temporal CNN**:
  - Ingests sliding temporal windows of health degradation vectors.
  - Outputs remaining operational flight hours ($t_{\text{RUL}}$) along with a $95\%$ statistical confidence interval.
- **Degradation State Matrix**:
  - Classifies health into 4 operational states: `HEALTHY (100-85%)`, `NOMINAL (84-70%)`, `DEGRADED (69-40%)`, `CRITICAL (<40%)`.

---

### E. Explainable AI (XAI) & Autonomous Decision Engine
*Location:* [`backend/app/explainability/`](file:///C:/piston%20engine%203/backend/app/explainability/) & [`backend/app/decision_engine/`](file:///C:/piston%20engine%203/backend/app/decision_engine/)

- **SHAP (SHapley Additive exPlanations)**:
  - Deconstructs black-box neural decisions into exact feature contribution percentages (e.g., *"EGT Cylinder 3 contributed +42% to Misfire classification"*).
- **4-Tier Military Alert Manager**:
  - `Level 1: 🟢 NORMAL` (Operational within expected envelope)
  - `Level 2: 🟡 ADVISORY` (Subtle deviation; continuous logging)
  - `Level 3: 🟠 WARNING` (Pre-fault degradation; mission replan recommended)
  - `Level 4: 🔴 CRITICAL` (Immediate emergency descent / RTB protocol)
- **Generative AI Maintenance Advisor**:
  - Integrates automated context-aware diagnostic reports detailing: root cause, military maintenance actions, standard operating procedures (SOP), and ground technician advisories.

---

### F. Environmental "What-If" Simulator & Mission Replay
*Location:* [`frontend/src/pages/WhatIfSimulator.jsx`](file:///C:/piston%20engine%203/frontend/src/pages/WhatIfSimulator.jsx) & [`frontend/src/pages/MissionReplay.jsx`](file:///C:/piston%20engine%203/frontend/src/pages/MissionReplay.jsx)

- **What-If Mission Sandbox**:
  - Allows operators to simulate stress scenarios prior to take-off:
    - High Density Altitude operations ($0 - 25,000\text{ ft}$)
    - Extreme Ambient Temperatures ($-40^\circ\text{C}$ Siachen cold to $+55^\circ\text{C}$ Thar desert heat)
    - Combat rapid throttle transients ($0\% \to 100\%$ burst climb)
    - Single-subsystem failure cascading analysis
- **Black-Box Mission Replay**:
  - Step-by-step playback of recorded flight logs with scrubbable timeline, fault markers, and telemetry trace overlay.

---

### G. Military-Grade Ground Control Station (GCS) UI
*Location:* [`frontend/src/`](file:///C:/piston%20engine%203/frontend/src/)

- **Industrial Skeuomorphic Chassis**:
  - CNC-machined dark metal bezel styling with corner chassis screws, recessed gauges, and LED indicators.
- **Interactive 3D Aero Piston Engine Twin**:
  - Full three-dimensional CAD inspection module with exploded view, subsystem isolation, and live heat-map mesh coloration.
- **High-Fidelity Avionics Instrumentation**:
  - Analog-digital hybrid gauges for RPM, CHT, EGT, Oil, Fuel, and Vibration.
  - Real-time 3-Axis FFT Vibration Spectrum Analyzer.
  - Live CAN Bus Frame Inspector.

---

### H. Facial Biometric Authentication & RBAC Gate
*Location:* [`face-attendance-system-master/`](file:///C:/piston%20engine%203/face-attendance-system-master/)

- Military-grade operator access control:
  - Deep facial biometric feature extraction using OpenCV & DNN embeddings.
  - Role-Based Access Control (**RBAC**): `UAV Commander`, `Propulsion Engineer`, `Ground Technician`.
  - Anti-spoofing security gate and automated mission attendance logging.

---

## 📊 SIH Problem Statement 26054 Compliance Matrix

| Requirement from PS 26054 | Component in Dronanetra | Codebase Location | Status |
|---|---|---|---|
| **A. Digital Twin Core Framework** | Physics-informed Otto model, live state synchronization, modular architecture | [`backend/app/digital_twin/`](file:///C:/piston%20engine%203/backend/app/digital_twin/) | ✅ **Implemented** |
| **B. Health Monitoring System** | Real-time monitoring of RPM, CHT, EGT, Oil P/T, Fuel Flow, Vibrations, Battery/Alternator | [`backend/app/ingestion/`](file:///C:/piston%20engine%203/backend/app/ingestion/), [`frontend/src/pages/Dashboard.jsx`](file:///C:/piston%20engine%203/frontend/src/pages/Dashboard.jsx) | ✅ **Implemented** |
| **C. Fault Detection & Predictive Analytics** | 8 fault classes (misfire, injection, cooling, lubrication, sensor drift, combustion, overheating, vibration) | [`backend/app/ai_models/fault_classifier.py`](file:///C:/piston%20engine%203/backend/app/ai_models/fault_classifier.py) | ✅ **Implemented** |
| **D. AI/ML Layer** | Autoencoder, PINN loss, LSTM RUL predictor, SHAP explainability | [`backend/app/ai_models/`](file:///C:/piston%20engine%203/backend/app/ai_models/), [`backend/app/explainability/`](file:///C:/piston%20engine%203/backend/app/explainability/) | ✅ **Implemented** |
| **E. Simulation & Replay Capability** | Historical mission playback, high altitude, extreme weather, throttle transient simulator | [`backend/app/digital_twin/whatif_simulator.py`](file:///C:/piston%20engine%203/backend/app/digital_twin/whatif_simulator.py), [`frontend/src/pages/WhatIfSimulator.jsx`](file:///C:/piston%20engine%203/frontend/src/pages/WhatIfSimulator.jsx) | ✅ **Implemented** |
| **F. Visualization Dashboard** | Industrial GCS UI, 3D engine twin, CAN bus inspector, alerts, maintenance advisor | [`frontend/src/pages/`](file:///C:/piston%20engine%203/frontend/src/pages/), [`frontend/src/components/`](file:///C:/piston%20engine%203/frontend/src/components/) | ✅ **Implemented** |
| **Biometric Access & Security** | Facial recognition login, operator verification, RBAC clearance | [`face-attendance-system-master/`](file:///C:/piston%20engine%203/face-attendance-system-master/) | ✅ **Implemented** |

---

## 💻 Technology Stack

```
Frontend:           React 18 • Vite • Lucide Icons • Canvas / SVG Gauges • Three.js / WebGL
Backend API:        FastAPI • Uvicorn • WebSockets • Pydantic • AsyncIO
Biometric Security: Flask • OpenCV • Dlib / Face-Recognition • SQLite
AI / ML Frameworks: PyTorch • Scikit-Learn • XGBoost • SHAP • NumPy • Pandas • SciPy
Physics & Ingestion:Python-CAN • SocketCAN • First-Principles ODE Solvers
DevOps & Tooling:   Python 3.11 • Node.js 20+ • Cloudflare Tunnel • PowerShell / Bash
```

---

## 📁 Repository Directory Structure

```text
piston-engine-3/
├── backend/                             # FastAPI Digital Twin Backend
│   ├── app/
│   │   ├── ai_models/                   # AI/ML Models (Anomaly, Faults, PINN, RUL)
│   │   │   ├── anomaly_detector.py      # Autoencoder & Isolation Forest
│   │   │   ├── fault_classifier.py      # 8-Class Fault Diagnosis Engine
│   │   │   ├── pinn_loss.py             # Physics-Informed Neural Network Loss
│   │   │   └── rul_predictor.py         # LSTM Prognostic Life Estimator
│   │   ├── api/                         # REST & WebSocket API Routes
│   │   │   └── routes/ (engine, health, alerts, fleet, missions, ws)
│   │   ├── decision_engine/             # Health Index, Severity & Maintenance Advisory
│   │   ├── digital_twin/                # Physics Equations & What-If Engine
│   │   ├── explainability/              # SHAP & Feature Contribution Engine
│   │   ├── ingestion/                   # CAN Bus, Serial & Telemetry Ingestion
│   │   └── main.py                      # FastAPI Application Entry Point
│   └── requirements.txt                 # Backend Python Dependencies
│
├── face-attendance-system-master/       # Biometric Face Authentication Backend
│   ├── app.py                           # Flask Biometric REST Server (Port 5050)
│   ├── faces/                           # Enrolled Facial Embeddings Database
│   └── requirements.txt                 # Biometric Python Dependencies
│
├── frontend/                            # Vite React Ground Control Station
│   ├── public/                          # Aviation Gauges, Textures & DRONANETRA Logos
│   ├── src/
│   │   ├── components/                  # GCS Gauges, 3D Engine, CAN Inspector, FFT
│   │   ├── pages/                       # Dashboard, DigitalTwin, Analytics, Alerts, Replay
│   │   ├── services/                    # WebSocket & REST API Connectors
│   │   └── App.jsx                      # Navigation & Multi-Tab Routing
│   ├── package.json                     # Frontend Dependencies
│   └── vite.config.js                   # Vite Server & Proxy Configuration
│
├── docs/                                # Technical Architecture & Specification Docs
├── run.py                               # Master Multi-Process Orchestrator
├── start.bat                            # Windows 1-Click Launch Script
├── start.sh                             # Linux / macOS 1-Click Launch Script
└── README.md                            # Comprehensive Technical Documentation
```

---

## 🌐 API & WebSocket Telemetry Specification

### Core REST Endpoints (FastAPI on Port `8000`)
- `GET /` : Core API Health & Online Status.
- `GET /api/engine/live` : Instantaneous snapshot of all engine sensor channels.
- `GET /api/engine/health` : Overall Health Index, anomaly scores, and subsystem status.
- `GET /api/alerts` : Active and historical 4-tier engine alerts.
- `GET /api/missions` : List of recorded flight missions for replay.
- `POST /api/whatif/simulate` : Execute environmental stress simulation.

### Live Telemetry WebSocket
- `WS /ws/telemetry` : High-frequency (50Hz) bi-directional stream delivering live engine telemetry, physics residuals, AI predictions, and active alert notifications.

---

## ⚡ Prerequisites & System Requirements

- **Operating System:** Windows 10/11, Ubuntu 20.04/22.04 LTS, or macOS
- **Python:** `Python 3.10` or `Python 3.11`
- **Node.js:** `Node.js v18.0.0+` (v20 LTS recommended) and `npm`
- **Hardware Recommended:** 8 GB+ RAM, Multi-Core CPU (Intel i5/Ryzen 5 or better), Dedicated GPU optional.

---

## 🛠️ Installation & Setup Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/male-uav-digital-twin.git
cd male-uav-digital-twin
```

### Step 2: Set Up Backend Virtual Environment
```bash
# Navigate to backend and create virtual environment
cd backend
python -m venv .venv

# Activate virtual environment:
# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
source .venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
cd ..
```

### Step 3: Set Up Biometric Face Recognition Backend
```bash
cd face-attendance-system-master
pip install -r requirements.txt
cd ..
```

### Step 4: Install Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

---

## 🚀 One-Click Orchestrated Launch

You can launch all 3 synchronized services (**FastAPI Backend**, **Face Recognition Service**, and **Vite GCS Dashboard**) with a single master command:

### On Windows:
```cmd
start.bat
```
*or via Python:*
```powershell
python run.py
```

### On Linux / macOS:
```bash
chmod +x start.sh
./start.sh
```

### 🖥️ Services will be automatically available at:
| Service | URL | Description |
|---|---|---|
| **Ground Control Station UI** | `http://localhost:5173` | Main Operator Dashboard & 3D Twin |
| **Digital Twin API** | `http://localhost:8000` | FastAPI Engine & Telemetry Engine |
| **Interactive API Docs (Swagger)** | `http://localhost:8000/docs` | Live API Testing Suite |
| **Biometric Security Server** | `http://127.0.0.1:5050` | Face Attendance & Operator Gate |

---

## 🌍 Remote Access via Cloudflare Tunnel

To share the running Ground Control Station remotely across secure networks:

1. **Verify Cloudflare CLI**:
   ```bash
   cloudflared --version
   ```
2. **Start Quick Tunnel**:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```
3. Copy and share the generated `https://*.trycloudflare.com` link.

*(Note: `frontend/vite.config.js` is pre-configured with `server.allowedHosts: true` to prevent proxy host blocking).*

---

## 🧪 Testing & Verification

### Run Backend Unit & Integration Tests:
```bash
cd backend
pytest tests/ -v
```

### Verify Frontend Production Build:
```bash
cd frontend
npm run build
```

---

## 🚀 Future Roadmap & Defence Deployment Pathway

1. **Hardware-in-the-Loop (HIL) Integration**: Direct validation on dynamometer test rigs with Rotax 914 and VRDE 180hp engines.
2. **Edge Hardware Acceleration**: Compilation of PINN and Autoencoders into ONNX / TensorRT for low-power edge deployment on NVIDIA Jetson Orin aboard the UAV.
3. **Federated Fleet Learning**: Swarm-level federated model aggregation across multiple deployed UAV squadrons without transmitting sensitive raw flight telemetry.

---

## 📄 License & Acknowledgments

- **License:** Open for academic, defence research, and hackathon evaluation under the **MIT License**.
- **Developed by:** Team **AlgoX.6** (Team ID: `145605`) for **Smart India Hackathon (SIH)** — Problem Statement `26054`.
- **Inspiration:** DRDO / ADE TAPAS-BH-201 MALE UAV Propulsion Architecture.

---

<div align="center">
  <b>DRONANETRA • Developed by Team AlgoX.6 (Team ID: 145605)</b><br>
  <i>Indigenous AI-Powered Aero Propulsion Digital Twin • SIH PS 26054</i>
</div>
