import React from "react";
import { Shield, Cpu, Layers, FileText, CheckCircle2, Terminal } from "lucide-react";

export default function About() {
  return (
    <div className="about-container">
      <div className="page-header">
        <div>
          <div className="header-node-tag">
            <Terminal size={12} color="var(--accent-cyan)" /> Dronanetra // SYSTEM ARCHITECTURE & SPECS
          </div>
          <h2>
            <Shield size={24} color="var(--accent-cyan)" /> Defense Project System Specification & Identity
          </h2>
          <p>AI-Enabled Real-Time Digital Twin for Aero Piston Engine Health Monitoring (MALE UAV)</p>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: "1.5rem" }}>
        <div className="gcs-card">
          <div className="gcs-card-title">Project Identity & Defense Context</div>
          <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse", color: "var(--text-main)" }}>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                <td style={{ padding: "0.6rem 0", color: "var(--text-muted)", width: "35%" }}>Project Title</td>
                <td style={{ fontWeight: 700 }}>AI-Enabled Real-Time Digital Twin for Aero Piston Engine Health Monitoring</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                <td style={{ padding: "0.6rem 0", color: "var(--text-muted)" }}>Target Platform</td>
                <td style={{ fontWeight: 700 }}>Medium Altitude Long Endurance (MALE) UAV (TAPAS-BH201)</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                <td style={{ padding: "0.6rem 0", color: "var(--text-muted)" }}>Sponsor Context</td>
                <td style={{ fontWeight: 700, color: "var(--accent-cyan)" }}>DRDO / Dept. of Defence Production – Dronanetra Challenge</td>
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-glass)" }}>
                <td style={{ padding: "0.6rem 0", color: "var(--text-muted)" }}>Engine Profile</td>
                <td style={{ fontWeight: 700 }}>Rotax 914UL / Austro Engine E4 Turbocharged 4-Stroke Boxer</td>
              </tr>
              <tr>
                <td style={{ padding: "0.6rem 0", color: "var(--text-muted)" }}>Architecture</td>
                <td style={{ fontWeight: 700 }}>FastAPI + SocketCAN J1939 + PyTorch + React GCS Dashboard</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="gcs-card">
          <div className="gcs-card-title">SRS & Dronanetra Functional Compliance Matrix</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem" }}>
            {[
              "FR-01 Engine Parameter Acquisition (RPM, CHT, EGT, Oil Press/Temp, Fuel Flow, Vib, Bus Volts, Timing)",
              "FR-02 CAN Bus / SocketCAN & FADEC Dual-Redundant ECU Communication Interface",
              "FR-03 Real-Time Telemetry Data Cleaning, Feature Engineering & Residual Tracking",
              "FR-04 Physics-Informed Thermodynamic Aero Engine Model (Sim-to-Real Mirroring)",
              "FR-05 Anomaly Detection (Flight-Condition Aware Physics & AI Residual Thresholds)",
              "FR-06 Multi-Class Fault Classifier (Misfire, Injector, Cooling, Lubrication, Sensor Drift, Instability)",
              "FR-07 Prognostics & Remaining Useful Life (RUL Prediction with Confidence Intervals)",
              "FR-08 Explainable AI (SHAP Factor Contribution & Autonomous Maintenance Advisory)",
              "FR-09 Environmental Scenario Simulator (High Altitude 25k ft, Hot-Weather 48°C, Rapid Throttle Slam)",
              "FR-10 Post-Flight Mission Replay & Technical PDF/CSV Health Report Generator",
            ].map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CheckCircle2 size={16} color="var(--accent-emerald)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="gcs-card">
        <div className="gcs-card-title">Dronanetra Five-Layer System Architecture</div>
        <div style={{ background: "rgba(10, 18, 32, 0.85)", padding: "1.5rem", borderRadius: "10px", border: "1px solid var(--border-glass)", textAlign: "center", fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
          <div style={{ padding: "0.6rem", background: "rgba(0, 0, 0, 0.4)", borderRadius: "6px", marginBottom: "0.5rem", color: "var(--accent-cyan)", border: "1px solid var(--border-glass)" }}>
            LAYER 1: REAL UAV ENGINE (RPM, EGT, CHT, Vibration, Oil Press, Bus Voltage, Injection Timing)
          </div>
          <div style={{ color: "var(--text-muted)", margin: "0.2rem" }}>↓</div>
          <div style={{ padding: "0.6rem", background: "rgba(0, 0, 0, 0.4)", borderRadius: "6px", marginBottom: "0.5rem", color: "var(--accent-emerald)", border: "1px solid var(--border-glass)" }}>
            LAYER 2: DATA ACQUISITION & TELEMETRY INGESTION (SocketCAN J1939 / FADEC / Serial / WebSocket)
          </div>
          <div style={{ color: "var(--text-muted)", margin: "0.2rem" }}>↓</div>
          <div style={{ padding: "0.6rem", background: "rgba(0, 0, 0, 0.4)", borderRadius: "6px", marginBottom: "0.5rem", color: "var(--accent-amber)", border: "1px solid var(--border-glass)" }}>
            LAYER 3: DIGITAL TWIN CORE (Physics Thermodynamic Expected Model & Sim-to-Real Residual Calculation)
          </div>
          <div style={{ color: "var(--text-muted)", margin: "0.2rem" }}>↓</div>
          <div style={{ padding: "0.6rem", background: "rgba(0, 0, 0, 0.4)", borderRadius: "6px", marginBottom: "0.5rem", color: "var(--accent-purple)", border: "1px solid var(--border-glass)" }}>
            LAYER 4: AI/ML PROGNOSTICS LAYER (Anomaly Detection, Multi-Fault Diagnostic Classifier, RUL & SHAP XAI)
          </div>
          <div style={{ color: "var(--text-muted)", margin: "0.2rem" }}>↓</div>
          <div style={{ padding: "0.6rem", background: "var(--accent-cyan-bg)", border: "1px solid var(--accent-cyan)", borderRadius: "6px", color: "#fff", fontWeight: 700 }}>
            LAYER 5: REACT GROUND CONTROL STATION (GCS) REAL-TIME INTERACTIVE DASHBOARD
          </div>
        </div>
      </div>
    </div>
  );
}
