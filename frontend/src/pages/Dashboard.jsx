import React, { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { 
  CheckCircle2, AlertTriangle, ChevronRight, Activity, Flame, Gauge, Wind, 
  Zap, Cpu, Layers, Radio, Terminal, Download, FileCode, Wrench, BatteryCharging, 
  FileText, ArrowUpRight, ShieldCheck, Compass, Sparkles
} from "lucide-react";
import RadialGauge from "../components/RadialGauge";
import AviationMeter from "../components/AviationMeter";
import CANBusInspector from "../components/CANBusInspector";
import SubSystemHealthPanel from "../components/SubSystemHealthPanel";
import MaintenanceAdvisory from "../components/MaintenanceAdvisory";
import AvionicsExecutivePanel from "../components/AvionicsExecutivePanel";
import ExportLogsDropdown from "../components/ExportLogsDropdown";
import MissionReportModal from "../components/MissionReportModal";

export default function Dashboard({ telemetryData, history = [] }) {
  const [activeTab, setActiveTab] = useState("health"); // "health" | "canbus" | "advisory"
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const telemetry = telemetryData?.telemetry || {
    rpm: 5180,
    egt: 720.0,
    cht: 148.0,
    vibration: 0.14,
    fuel_flow: 2.1,
    throttle: 78.0,
    altitude: 18450,
    bus_voltage: 28.2,
    alternator_current: 42.5,
    battery_soh: 98.0,
    bsfc_g_kwh: 248.0,
    thermal_efficiency_pct: 32.4,
    volumetric_efficiency: 89.5,
    brake_power_kw: 78.5,
    spark_advance: 28.5,
    spark_advance_jitter: 0.2,
    cov_imep_pct: 1.8,
    torque_ripple_nm: 4.2,
    vibration_pattern: "NOMINAL_DYNAMIC_BALANCE",
  };

  const healthScore = telemetryData?.health_score ?? 87;
  const anomalyScore = telemetryData?.anomaly_score ?? 0.18;
  const faultProb = telemetryData?.fault_probability ?? 6;
  const rawConfidence = telemetryData?.confidence ?? 0.94;
  const confidencePct = Math.round(rawConfidence <= 1.0 ? rawConfidence * 100 : rawConfidence);
  const rulRemaining = typeof telemetryData?.rul_hours === "number" ? telemetryData.rul_hours.toFixed(0) : "450";

  // Dynamic Rolling History for Real Sparklines
  const rollingSparklines = (history && history.length > 0)
    ? history.slice(-20).map((h, i) => ({
        index: i,
        rpm: h.telemetry?.rpm || telemetry.rpm,
        cht: h.telemetry?.cht || telemetry.cht,
        egt: h.telemetry?.egt || telemetry.egt,
        vib: h.telemetry?.vibration || telemetry.vibration,
        fuel: h.telemetry?.fuel_flow || telemetry.fuel_flow,
      }))
    : Array.from({ length: 15 }, (_, i) => ({
        index: i,
        rpm: telemetry.rpm + (i % 3 - 1) * 20,
        cht: telemetry.cht + (i % 2 - 0.5) * 1.5,
        egt: telemetry.egt + (i % 2 - 0.5) * 4.0,
        vib: telemetry.vibration + (i % 2) * 0.05,
        fuel: telemetry.fuel_flow + (i % 2 - 0.5) * 0.2,
      }));

  const thresholdAnalysis = telemetryData?.threshold_analysis || {
    status: "NORMAL",
    health_score: 100.0,
    breached_parameters: [],
    summary: "All parameters within standard static operating thresholds.",
  };

  const missionForecast = telemetryData?.mission_forecast || telemetryData?.temporal_prediction || {
    mission_feasibility_score: 96.5,
    mission_status: "FEASIBLE",
    operational_recommendations: {
      max_safe_throttle_pct: 100.0,
      prognosis_narrative: "UAV propulsion system optimal. Future 30-min forecast indicates steady thermodynamic equilibrium.",
    }
  };

  return (
    <div className="dashboard-view-wrapper">
      {/* Upper Page Header Bar */}
      <div className="page-header">
        <div>
          <div className="header-node-tag">
            <Terminal size={12} color="var(--accent-cyan)" /> Dronanetra // TELEMETRY HUB // TAPAS-BH201
          </div>
          <h2>
            <Radio size={24} color="var(--accent-cyan)" /> Real-Time Telemetry &amp; Command Center
          </h2>
          <p>Dual-Engine Assessment: Static Thresholds vs Temporal AI Mission Operation Predictor</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          <button 
            className="btn-mode-toggle"
            style={{ background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)", color: "#ffffff", border: "1px solid #0284c7" }}
            onClick={() => setIsReportModalOpen(true)}
            title="Generate and Export Official Flight Airworthiness Dossier"
          >
            <FileText size={14} /> EXPORT MISSION DOSSIER
          </button>

          <ExportLogsDropdown telemetryData={telemetryData} history={history} nodeTitle="Dronanetra TELEMETRY HUB" />
          
          <div style={{ display: "flex", gap: "0.3rem", background: "var(--bg-card)", padding: "0.3rem", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
            <button
              className={`btn-mode-toggle ${activeTab === "health" ? "active" : ""}`}
              onClick={() => setActiveTab("health")}
            >
              <Activity size={13} /> HEALTH MATRIX
            </button>
            <button
              className={`btn-mode-toggle ${activeTab === "canbus" ? "active" : ""}`}
              onClick={() => setActiveTab("canbus")}
            >
              <FileCode size={13} /> CAN BUS
            </button>
            <button
              className={`btn-mode-toggle ${activeTab === "advisory" ? "active" : ""}`}
              onClick={() => setActiveTab("advisory")}
            >
              <Wrench size={13} /> ADVISORY
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           ENGINE EFFICIENCY & THERMODYNAMIC PERFORMANCE STRIP
         ══════════════════════════════════════════════════════════════════ */}
      <div 
        className="gcs-card efficiency-dynamics-strip" 
        style={{ 
          marginBottom: "1.25rem", 
          padding: "0.85rem 1.25rem",
          background: "url('/brushed_metal_bg.png') center / cover no-repeat",
          border: "1.5px solid #5e646f",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.4)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", position: "relative", zIndex: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <Zap size={16} color="#0284c7" />
            <span style={{ fontWeight: 900, fontSize: "0.82rem", fontFamily: "var(--font-mono)", color: "#000000", letterSpacing: "0.5px", textShadow: "0 1px 0 rgba(255, 255, 255, 0.6)" }}>
              REAL-TIME ENGINE EFFICIENCY &amp; TRANSIENT POWER DYNAMICS:
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.85rem", alignItems: "center", flexWrap: "wrap" }}>
            <div className="efficiency-metric-cell" style={{ display: "flex", flexDirection: "column" }} title="Calculated Shaft Brake Power">
              <span style={{ fontSize: "0.65rem", color: "#334155", fontFamily: "var(--font-mono)", fontWeight: 900, letterSpacing: "0.3px" }}>BRAKE POWER</span>
              <span style={{ fontSize: "0.95rem", color: "#0369a1", fontFamily: "var(--font-mono)", fontWeight: 900 }}>
                {telemetry.brake_power_kw || 78.5} kW <small style={{ fontSize: "0.7rem", color: "#475569", fontWeight: 700 }}>({Math.round((telemetry.brake_power_kw || 78.5) * 1.341)} HP)</small>
              </span>
            </div>

            <div style={{ width: "1.5px", height: "26px", background: "rgba(0, 0, 0, 0.25)", boxShadow: "1px 0 0 rgba(255, 255, 255, 0.5)" }} />

            <div className="efficiency-metric-cell" style={{ display: "flex", flexDirection: "column" }} title="Brake Specific Fuel Consumption">
              <span style={{ fontSize: "0.65rem", color: "#334155", fontFamily: "var(--font-mono)", fontWeight: 900, letterSpacing: "0.3px" }}>BSFC (FUEL SPECIFIC)</span>
              <span style={{ fontSize: "0.95rem", color: "#047857", fontFamily: "var(--font-mono)", fontWeight: 900 }}>
                {telemetry.bsfc_g_kwh || 248.0} <small style={{ fontSize: "0.7rem" }}>g/kWh</small>
              </span>
            </div>

            <div style={{ width: "1.5px", height: "26px", background: "rgba(0, 0, 0, 0.25)", boxShadow: "1px 0 0 rgba(255, 255, 255, 0.5)" }} />

            <div className="efficiency-metric-cell" style={{ display: "flex", flexDirection: "column" }} title="Indicated & Shaft Thermal Efficiency">
              <span style={{ fontSize: "0.65rem", color: "#334155", fontFamily: "var(--font-mono)", fontWeight: 900, letterSpacing: "0.3px" }}>THERMAL EFFICIENCY (η_th)</span>
              <span style={{ fontSize: "0.95rem", color: "#b45309", fontFamily: "var(--font-mono)", fontWeight: 900 }}>
                {telemetry.thermal_efficiency_pct || 32.4}%
              </span>
            </div>

            <div style={{ width: "1.5px", height: "26px", background: "rgba(0, 0, 0, 0.25)", boxShadow: "1px 0 0 rgba(255, 255, 255, 0.5)" }} />

            <div className="efficiency-metric-cell" style={{ display: "flex", flexDirection: "column" }} title="Manifold Air Volumetric Efficiency">
              <span style={{ fontSize: "0.65rem", color: "#334155", fontFamily: "var(--font-mono)", fontWeight: 900, letterSpacing: "0.3px" }}>VOLUMETRIC EFFICIENCY (η_v)</span>
              <span style={{ fontSize: "0.95rem", color: "#6b21a8", fontFamily: "var(--font-mono)", fontWeight: 900 }}>
                {telemetry.volumetric_efficiency || 89.5}%
              </span>
            </div>

            <div style={{ width: "1.5px", height: "26px", background: "rgba(0, 0, 0, 0.25)", boxShadow: "1px 0 0 rgba(255, 255, 255, 0.5)" }} />

            <div className="efficiency-metric-cell" style={{ display: "flex", flexDirection: "column" }} title="Real-time Crankshaft Vibration Harmonic State">
              <span style={{ fontSize: "0.65rem", color: "#334155", fontFamily: "var(--font-mono)", fontWeight: 900, letterSpacing: "0.3px" }}>VIBRATION HARMONIC</span>
              <span style={{ fontSize: "0.76rem", color: "#0369a1", fontFamily: "var(--font-mono)", fontWeight: 900, background: "rgba(3, 105, 161, 0.12)", padding: "0.15rem 0.45rem", borderRadius: "4px", border: "1px solid rgba(3, 105, 161, 0.35)" }}>
                {telemetry.vibration_pattern || "NOMINAL_DYNAMIC_BALANCE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL-ENGINE ARCHITECTURE COMPARISON BANNER */}
      <div className="grid-2" style={{ marginBottom: "1.25rem", gap: "1rem" }}>
        {/* Engine 1: Conventional Threshold Monitor (Preserved Baseline) */}
        <div
          className="gcs-card telemetry-command-card"
          style={{
            background: "url('/metal_plate_bg.png') center / cover no-repeat",
            border: "1.5px solid #5e646f",
            borderLeft: `5px solid ${thresholdAnalysis.status === "CRITICAL" ? "var(--accent-red)" : thresholdAnalysis.status === "CAUTION" ? "var(--accent-amber)" : "#15803d"}`,
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4)",
          }}
        >
          <div className="gcs-card-title" style={{ marginBottom: "0.6rem" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#000000",
                fontWeight: 900,
                fontSize: "0.92rem",
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              <Gauge size={18} color="#9e0404ff" strokeWidth={2.4} /> Conventional Threshold Monitor (Baseline)
            </span>
            <span
              style={{
                fontSize: "0.74rem",
                color: thresholdAnalysis.status === "NORMAL" ? "#15803d" : "#3d0101ff",
                fontFamily: "var(--font-mono)",
                fontWeight: 900,
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(6px)",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              {thresholdAnalysis.status} ({thresholdAnalysis.health_score}%)
            </span>
          </div>

          <div
            style={{
              fontSize: "0.84rem",
              color: "#05080c",
              fontWeight: 700,
              marginBottom: "0.65rem",
              lineHeight: 1.5,
              background: "rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(8px)",
              padding: "0.55rem 0.8rem",
              borderRadius: "6px",
              border: "1.1px solid rgba(255, 255, 255, 0.40)",
              boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.5), 0 2px 6px rgba(0,0,0,0.08)",
              textShadow: "0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            {thresholdAnalysis.summary}
          </div>

          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
            {thresholdAnalysis.breached_parameters && thresholdAnalysis.breached_parameters.length > 0 ? (
              thresholdAnalysis.breached_parameters.map((b, i) => (
                <span
                  key={i}
                  style={{
                    background: "rgba(255, 235, 235, 0.75)",
                    border: "1px solid #ef4444",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    fontSize: "0.74rem",
                    color: "#dc2626",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                >
                  ⚠️ {b.parameter}: {b.current_value} {b.unit} (Limit: {b.threshold_limit})
                </span>
              ))
            ) : (
              <span
                style={{
                  color: "#15803d",
                  fontSize: "0.76rem",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 900,
                  background: "rgba(255, 255, 255, 0.55)",
                  backdropFilter: "blur(6px)",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "5px",
                  border: "1px solid rgba(255, 255, 255, 0.7)",
                }}
              >
                ✓ 8/8 Critical Flight Parameters Within Static Limits
              </span>
            )}
          </div>
        </div>

        {/* Engine 2: AI Temporal Operation Forecaster & Digital Twin (Flagship USP) */}
        <div
          className="gcs-card telemetry-command-card"
          style={{
            background: "url('/metal_plate_bg.png') center / cover no-repeat",
            border: "1.5px solid #5e646f",
            borderLeft: `5px solid ${healthScore < 60 ? "var(--accent-red)" : healthScore < 85 ? "var(--accent-amber)" : "#6b0202ff"}`,
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4)",
          }}
        >
          <div className="gcs-card-title" style={{ marginBottom: "0.6rem" }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#000000",
                fontWeight: 900,
                fontSize: "0.92rem",
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
              }}
            >
              <Cpu size={18} color="#0284c7" strokeWidth={2.4} /> Temporal AI Mission Predictor (USP Core)
            </span>
            <span
              style={{
                fontSize: "0.74rem",
                color: missionForecast.mission_status === "FEASIBLE" ? "#15803d" : "#b45309",
                fontFamily: "var(--font-mono)",
                fontWeight: 900,
                background: "rgba(255, 255, 255, 0.75)",
                backdropFilter: "blur(6px)",
                padding: "0.2rem 0.6rem",
                borderRadius: "4px",
                border: "1px solid rgba(255, 255, 255, 0.9)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              MISSION FEASIBILITY: {missionForecast.mission_feasibility_score}%
            </span>
          </div>

          <div
            style={{
              fontSize: "0.84rem",
              color: "#05080c",
              fontWeight: 700,
              marginBottom: "0.65rem",
              lineHeight: 1.5,
              background: "rgba(255, 255, 255, 0.22)",
              backdropFilter: "blur(8px)",
              padding: "0.55rem 0.8rem",
              borderRadius: "6px",
              border: "1.1px solid rgba(255, 255, 255, 0.40)",
              boxShadow: "inset 0 1px 1.5px rgba(255,255,255,0.5), 0 2px 6px rgba(0,0,0,0.08)",
              textShadow: "0 1px 1px rgba(255,255,255,0.8)",
            }}
          >
            <strong style={{ color: "#0369a1", fontWeight: 900 }}>Prognosis:</strong>{" "}
            {missionForecast.operational_recommendations?.prognosis_narrative}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.76rem", fontFamily: "var(--font-mono)" }}>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(6px)",
                border: "1.2px solid rgba(2, 132, 199, 0.4)",
                padding: "0.25rem 0.6rem",
                borderRadius: "6px",
                color: "#0369a1",
                fontWeight: 900,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              Combustion COV: {telemetry.cov_imep_pct || 1.8}% (Stable &lt; 3.5%)
            </span>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(6px)",
                border: "1.2px solid rgba(21, 128, 61, 0.4)",
                padding: "0.25rem 0.6rem",
                borderRadius: "6px",
                color: "#15803d",
                fontWeight: 900,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              28V Bus: {telemetry.bus_voltage || 28.2}V | Alt: {telemetry.alternator_current || 42.5}A
            </span>
            <span
              style={{
                background: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(6px)",
                border: "1.2px solid rgba(180, 83, 9, 0.4)",
                padding: "0.25rem 0.6rem",
                borderRadius: "6px",
                color: "#b45309",
                fontWeight: 900,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              RUL: {rulRemaining} hrs ({confidencePct}%)
            </span>
          </div>
        </div>
      </div>

      {/* Conditional View Tabs */}
      {activeTab === "canbus" && <CANBusInspector telemetryData={telemetryData} />}
      {activeTab === "advisory" && <MaintenanceAdvisory telemetryData={telemetryData} />}
      {activeTab === "health" && <SubSystemHealthPanel telemetryData={telemetryData} />}

      {/* ══════════════════════════════════════════════════════════════════
           INSTRUMENT PANEL — 6 Precision Uniform Aviation Meters
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "health" && (
        <div
          className="telemetry-meter-panel"
          style={{
            marginBottom: "1.25rem",
            padding: "1rem 1.25rem",
            background: "url('/metal_plate_bg.png') center / cover no-repeat",
            border: "1px solid #888a8e",
            borderRadius: "8px",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, minmax(220px, 1fr))",
              gap: "1.25rem",
              justifyItems: "center",
              alignItems: "center",
              overflowX: "auto",
              padding: "0.5rem 0",
            }}
          >
            <AviationMeter
              value={telemetry.rpm}
              min={0} max={7000}
              label="ENGINE SPEED"
              unit="RPM"
              subUnit="x1000"
              warningStart={5000}
              dangerStart={6000}
              decimals={0}
              size={235}
            />
            <AviationMeter
              value={telemetry.egt}
              min={0} max={1300}
              label="EXHAUST GAS TEMP"
              unit="EGT"
              subUnit="°C"
              warningStart={1000}
              dangerStart={1200}
              decimals={0}
              size={235}
            />
            <AviationMeter
              value={telemetry.fuel_flow}
              min={0} max={40}
              label="FUEL FLOW"
              unit="FUEL"
              subUnit="L/hr"
              warningStart={30}
              dangerStart={36}
              decimals={1}
              size={235}
            />
            <AviationMeter
              value={telemetryData?.telemetry?.oil_pressure ?? 3.8}
              min={0} max={10}
              label="OIL PRESSURE"
              unit="OIL"
              subUnit="bar"
              warningStart={7.5}
              dangerStart={9.0}
              decimals={1}
              size={235}
            />
            <AviationMeter
              value={telemetry.vibration}
              min={0} max={10}
              label="VIBRATION"
              unit="VIB"
              subUnit="g"
              warningStart={6.0}
              dangerStart={8.0}
              decimals={2}
              size={235}
            />
            <AviationMeter
              value={telemetry.cht}
              min={0} max={220}
              label="CYLINDER HEAD TEMP"
              unit="CHT"
              subUnit="°C"
              warningStart={160}
              dangerStart={190}
              decimals={0}
              size={235}
            />
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
           SKEUOMORPHIC AVIONICS DIGITAL TWIN COCKPIT PANEL (img1 Spec)
         ══════════════════════════════════════════════════════════════════ */}
      <AvionicsExecutivePanel telemetryData={telemetryData} history={history} />

      {/* 4. Bottom Mission Status Bar */}
      <div className="mission-footer-bar">
        {/* Timeline */}
        <div className="mission-timeline-stepper">
          <span style={{ fontSize: "0.68rem", fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>MISSION TIMELINE</span>
          <div style={{ display: "flex", alignItems: "center", gap: "1.2rem" }}>
            <div className="timeline-step">
              <div className="step-dot" />
              <div className="step-title">TAKEOFF</div>
              <div className="step-time">14:05</div>
            </div>
            <div style={{ height: "2px", width: "30px", background: "var(--accent-emerald)" }} />
            <div className="timeline-step">
              <div className="step-dot" />
              <div className="step-title">CRUISE</div>
              <div className="step-time">14:20</div>
            </div>
            <div style={{ height: "2px", width: "30px", background: "var(--accent-emerald)" }} />
            <div className="timeline-step">
              <div className="step-dot" style={{ background: "var(--accent-cyan)" }} />
              <div className="step-title">RECON</div>
              <div className="step-time">14:40</div>
            </div>
            <div style={{ height: "2px", width: "30px", background: "var(--border-glass)" }} />
            <div className="timeline-step">
              <div className="step-dot" style={{ background: "var(--text-dim)" }} />
              <div className="step-title">RETURN</div>
              <div className="step-time">15:10</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mission-stats-group">
          <div className="mission-stat-item">
            <span>MISSION DURATION</span>
            <strong>01:12:45</strong>
          </div>
          <div className="mission-stat-item">
            <span>DISTANCE COVERED</span>
            <strong>320 km</strong>
          </div>
          <div className="mission-stat-item">
            <span>FUEL CONSUMED</span>
            <strong>28.4 L</strong>
          </div>
          <div className="mission-stat-item" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>DATA RECORDING</span>
            <span style={{ color: "var(--accent-red)", fontWeight: 900 }}>● REC</span>
            <strong>186 GB / 256 GB</strong>
          </div>
        </div>
      </div>

      {/* Printable Post-Flight Mission Health Dossier Modal */}
      <MissionReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        missionId="MSN-48-TAPAS"
      />
    </div>
  );
}
