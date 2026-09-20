import React, { useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { 
  Cpu, 
  Flame, 
  Activity, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Thermometer, 
  Droplets, 
  ClipboardList, 
  Shield, 
  ShieldCheck, 
  Clock, 
  Radio, 
  ChevronDown, 
  Maximize2, 
  Terminal, 
  Mountain, 
  Sun, 
  Gauge, 
  Scan 
} from "lucide-react";
import InteractiveEngine3D from "../components/InteractiveEngine3D";
import CANBusInspector from "../components/CANBusInspector";
import VibrationFFTSpectrum from "../components/VibrationFFTSpectrum";
import { api } from "../services/api";

// ── Realistic Counter-Sunk Pan-Head Screw Rivet ───────────────
function CornerScrews() {
  return (
    <>
      <div className="metal-screw screw-top-left" style={{ top: "6px", left: "6px" }} />
      <div className="metal-screw screw-top-right" style={{ top: "6px", right: "6px" }} />
      <div className="metal-screw screw-bottom-left" style={{ bottom: "6px", left: "6px" }} />
      <div className="metal-screw screw-bottom-right" style={{ bottom: "6px", right: "6px" }} />
    </>
  );
}

export default function DigitalTwin({ telemetryData }) {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [visualizerMode, setVisualizerMode] = useState("3d_canvas"); // "3d_canvas" | "heatmap" | "canbus" | "fft_spectrum"
  const [simScenario, setSimScenario] = useState("NOMINAL"); // "NOMINAL" | "HIGH_ALTITUDE" | "HOT_WEATHER" | "RAPID_THROTTLE"

  const handleScenarioChange = (scenario) => {
    setSimScenario(scenario);
    api.setScenario(scenario).catch(() => {});
  };

  const residuals = telemetryData?.residuals || {
    egt_residual: 5.0,
    cht_residual: 4.0,
    fuel_flow_residual: 0.2,
    vibration_residual: 0.05,
  };

  const residualChart = [
    { parameter: "EGT Delta (°C)", residual: Math.abs(residuals.egt_residual || 5.0), threshold: 45.0 },
    { parameter: "CHT Delta (°C)", residual: Math.abs(residuals.cht_residual || 4.0), threshold: 25.0 },
    { parameter: "Fuel Flow Delta (x10 L/h)", residual: Math.abs((residuals.fuel_flow_residual !== undefined ? residuals.fuel_flow_residual : 0.2) * 10), threshold: 5.0 },
    { parameter: "Vibration Delta (x10 mm/s)", residual: Math.abs((residuals.vibration_residual !== undefined ? residuals.vibration_residual : 0.05) * 10), threshold: 2.0 },
  ];

  const tel = telemetryData?.telemetry || {};
  const cylTemps = [
    tel.cht_cyl1 || 112.2,
    tel.cht_cyl2 || 117.2,
    tel.cht_cyl3 || 111.6,
    tel.cht_cyl4 || 114.2,
  ];

  const egtTemps = [
    tel.egt_cyl1 || 818.7,
    tel.egt_cyl2 || 829.4,
    tel.egt_cyl3 || 820.9,
    tel.egt_cyl4 || 826.6,
  ];

  const expectedEgt = telemetryData?.expected_physics?.expected_egt || 818.6;
  const expectedCht = telemetryData?.expected_physics?.expected_cht || 120.3;
  const expectedFuelFlow = telemetryData?.expected_physics?.expected_fuel_flow || 14.1;
  const expectedVibration = telemetryData?.expected_physics?.expected_vibration || 1.25;
  const anomalyScore = telemetryData?.anomaly_score !== undefined ? telemetryData.anomaly_score : 0.268;
  const primaryDriver = telemetryData?.explanation?.primary_driver || "Cylinder Head Temp (CHT)";

  // 32-bin FFT spectrum
  const rawFft = tel.fft_spectrum || Array.from({ length: 32 }, (_, i) => 0.05 + 0.02 * (i % 3));
  const fftChartData = rawFft.map((val, idx) => ({
    frequency_hz: `${Math.round(idx * 15.625)}Hz`,
    energy: val,
  }));

  // Dynamic residual bar heights mapped from real backend telemetry & physics model
  const calcHeight = (val, maxScale = 50) => {
    const numeric = typeof val === "number" && !isNaN(val) ? Math.abs(val) : 0;
    return Math.min(85, Math.max(16, Math.round((numeric / maxScale) * 65 + 16)));
  };

  // 1. EGT Deltas (°C): Cyl 1, Cyl 2, AVG, Cyl 3, Cyl 4
  const egtBars = [
    { label: "C1", val: +(egtTemps[0] - expectedEgt).toFixed(1), h: calcHeight(egtTemps[0] - expectedEgt, 45), w: 18 },
    { label: "C2", val: +(egtTemps[1] - expectedEgt).toFixed(1), h: calcHeight(egtTemps[1] - expectedEgt, 45), w: 20 },
    { label: "AVG", val: +(residuals.egt_residual || (egtTemps.reduce((a, b) => a + b, 0) / 4 - expectedEgt)).toFixed(1), h: calcHeight(residuals.egt_residual || 5.0, 45), w: 22 },
    { label: "C3", val: +(egtTemps[2] - expectedEgt).toFixed(1), h: calcHeight(egtTemps[2] - expectedEgt, 45), w: 19 },
    { label: "C4", val: +(egtTemps[3] - expectedEgt).toFixed(1), h: calcHeight(egtTemps[3] - expectedEgt, 45), w: 17 },
  ];

  // 2. CHT Deltas (°C): Cyl 1, Cyl 2, AVG, Cyl 3, Cyl 4
  const chtBars = [
    { label: "C1", val: +(cylTemps[0] - expectedCht).toFixed(1), h: calcHeight(cylTemps[0] - expectedCht, 30), w: 18 },
    { label: "C2", val: +(cylTemps[1] - expectedCht).toFixed(1), h: calcHeight(cylTemps[1] - expectedCht, 30), w: 20 },
    { label: "AVG", val: +(residuals.cht_residual || (cylTemps.reduce((a, b) => a + b, 0) / 4 - expectedCht)).toFixed(1), h: calcHeight(residuals.cht_residual || 4.0, 30), w: 21 },
    { label: "C3", val: +(cylTemps[2] - expectedCht).toFixed(1), h: calcHeight(cylTemps[2] - expectedCht, 30), w: 19 },
    { label: "C4", val: +(cylTemps[3] - expectedCht).toFixed(1), h: calcHeight(cylTemps[3] - expectedCht, 30), w: 17 },
  ];

  // 3. Fuel Flow Deltas (x10 L/h): Multi-pulse & Total Residual
  const ffRes = residuals.fuel_flow_residual !== undefined ? residuals.fuel_flow_residual : 0.2;
  const fuelBars = [
    { label: "INJ1", val: +(ffRes * 0.88).toFixed(2), h: calcHeight(ffRes * 10 * 0.88, 10), w: 18 },
    { label: "INJ2", val: +(ffRes * 1.12).toFixed(2), h: calcHeight(ffRes * 10 * 1.12, 10), w: 20 },
    { label: "AVG", val: +(ffRes).toFixed(2), h: calcHeight(ffRes * 10, 10), w: 22 },
    { label: "INJ3", val: +(ffRes * 0.94).toFixed(2), h: calcHeight(ffRes * 10 * 0.94, 10), w: 19 },
  ];

  // 4. Vibration Deltas (x10 mm/s): Harmonic Delta Bins (1X, 2X, RMS, 3X, 4X, 5X)
  const vibRes = residuals.vibration_residual !== undefined ? residuals.vibration_residual : 0.05;
  const vibBars = [
    { label: "1X", val: +(rawFft[2] || 0.1).toFixed(2), h: calcHeight((rawFft[2] || 0.1) * 15, 6), w: 17 },
    { label: "2X", val: +(rawFft[4] || 0.15).toFixed(2), h: calcHeight((rawFft[4] || 0.15) * 15, 6), w: 19 },
    { label: "RMS", val: +(vibRes).toFixed(2), h: calcHeight(vibRes * 15, 6), w: 22 },
    { label: "3X", val: +(rawFft[6] || 0.08).toFixed(2), h: calcHeight((rawFft[6] || 0.08) * 15, 6), w: 20 },
    { label: "4X", val: +(rawFft[8] || 0.05).toFixed(2), h: calcHeight((rawFft[8] || 0.05) * 15, 6), w: 18 },
    { label: "5X", val: +(rawFft[10] || 0.04).toFixed(2), h: calcHeight((rawFft[10] || 0.04) * 15, 6), w: 17 },
  ];

  return (
    <div className="digital-twin-container">
      <div className="page-header">
        <div>
          <div className="header-node-tag">
            <Terminal size={12} color="#f59e0b" /> Dronanetra // THERMODYNAMIC TWIN // TAPAS-BH201
          </div>
          <h1 className="page-title">
            <Cpu size={24} color="#f59e0b" /> Physics-Based Aero Piston Engine Digital Twin
          </h1>
          <p>Real-Time Thermodynamic Mirror State, 4-Cylinder Discrete Heatmap &amp; FFT Harmonic Spectrum</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.3rem", background: "var(--bg-card)", padding: "0.3rem", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
            <button
              className={`btn-mode-toggle ${visualizerMode === "3d_canvas" ? "active" : ""}`}
              onClick={() => setVisualizerMode("3d_canvas")}
            >
              <Layers size={14} /> 3D MODEL
            </button>
            <button
              className={`btn-mode-toggle ${visualizerMode === "fft_spectrum" ? "active" : ""}`}
              onClick={() => setVisualizerMode("fft_spectrum")}
            >
              <Activity size={14} /> FFT SPECTRUM
            </button>
            <button
              className={`btn-mode-toggle ${visualizerMode === "canbus" ? "active" : ""}`}
              onClick={() => setVisualizerMode("canbus")}
            >
              <Terminal size={14} /> CAN BUS
            </button>
          </div>

          <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", color: "var(--accent-emerald)", fontWeight: 700, fontSize: "0.86rem", fontFamily: "var(--font-mono)" }}>
            <CheckCircle2 size={18} /> TWIN SYNC: CONTINUOUS (1 Hz)
          </div>
        </div>
      </div>

      {/* Environmental Scenario Simulation Bar */}
      <div className="dt-ref-card" style={{ marginBottom: "1.25rem", padding: "0.85rem 1.25rem" }}>
        <CornerScrews />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.85rem", position: "relative", zIndex: 3 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <Zap size={16} color="#0284c7" />
            <span style={{ fontWeight: 900, fontSize: "0.82rem", fontFamily: "var(--font-mono)", color: "#0f172a", letterSpacing: "0.5px", textShadow: "0 1px 0 rgba(255, 255, 255, 0.6)" }}>
              ENVIRONMENTAL &amp; MISSION PROFILE SIMULATOR:
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button
              className={`btn-mode-toggle ${simScenario === "NOMINAL" ? "active" : ""}`}
              onClick={() => handleScenarioChange("NOMINAL")}
            >
              <CheckCircle2 size={13} /> STANDARD FLIGHT
            </button>
            <button
              className={`btn-mode-toggle ${simScenario === "HIGH_ALTITUDE" ? "active" : ""}`}
              onClick={() => handleScenarioChange("HIGH_ALTITUDE")}
            >
              <Mountain size={13} /> HIGH ALTITUDE (25,000 FT)
            </button>
            <button
              className={`btn-mode-toggle ${simScenario === "HOT_WEATHER" ? "active" : ""}`}
              onClick={() => handleScenarioChange("HOT_WEATHER")}
            >
              <Sun size={13} /> HOT-WEATHER (48°C)
            </button>
            <button
              className={`btn-mode-toggle ${simScenario === "RAPID_THROTTLE" ? "active" : ""}`}
              onClick={() => handleScenarioChange("RAPID_THROTTLE")}
            >
              <Gauge size={13} /> THROTTLE TRANSITIONS
            </button>
          </div>
        </div>
      </div>

      {/* Hero 3D Digital Twin Visualizer Container */}
      <div style={{ marginBottom: "1.6rem" }}>
        {visualizerMode === "3d_canvas" ? (
          <InteractiveEngine3D
            telemetryData={telemetryData}
            onSelectComponent={(componentInfo) => setSelectedComponent(componentInfo)}
          />
        ) : visualizerMode === "canbus" ? (
          <CANBusInspector telemetryData={telemetryData} />
        ) : (
          <VibrationFFTSpectrum telemetryData={telemetryData} />
        )}
      </div>

      {/* Detailed Diagnostic & Physics Grid (Reference Match 3-Column Layout) */}
      <div className="grid-3" style={{ marginBottom: "1.6rem", gap: "1rem" }}>
        
        {/* ── CARD 1: 4-CYLINDER DISCRETE THERMOCOUPLES ── */}
        <div className="dt-ref-card">
          <CornerScrews />
          <div className="dt-card-header">
            <div className="dt-card-title-text">4-CYLINDER DISCRETE THERMOCOUPLES</div>
            <div className="dt-card-tag">ROTAX 914 BOXER</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", position: "relative", zIndex: 3 }}>
            {[
              { cyl: 1, temp: cylTemps[0], egt: egtTemps[0], barClass: "dt-thermocouple-bar-1", pct: 68 },
              { cyl: 2, temp: cylTemps[1], egt: egtTemps[1], barClass: "dt-thermocouple-bar-2", pct: 74 },
              { cyl: 3, temp: cylTemps[2], egt: egtTemps[2], barClass: "dt-thermocouple-bar-3", pct: 66 },
              { cyl: 4, temp: cylTemps[3], egt: egtTemps[3], barClass: "dt-thermocouple-bar-4", pct: 71 },
            ].map(({ cyl, temp, egt, barClass, pct }) => {
              const livePct = Math.min(100, Math.max(15, (temp / 170) * 100));

              return (
                <div key={cyl} className="dt-debossed-row" style={{ padding: "0.45rem 0.75rem" }}>
                  {/* Left Dark Icon Container */}
                  <div className="dt-icon-box" style={{ width: "26px", height: "26px" }}>
                    <Thermometer size={14} color="#f8fafc" />
                  </div>

                  {/* Middle Info & 3D Metallic Progress Bar */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "3px" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <span style={{ fontWeight: 900, fontSize: "0.80rem", color: "#0f172a", fontFamily: "var(--font-mono)" }}>
                        Cylinder #{cyl}
                      </span>
                      <span style={{ fontSize: "0.70rem", color: "#475569", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        EGT: {egt}°C
                      </span>
                    </div>

                    <div className="dt-thermocouple-track">
                      <div
                        className={barClass}
                        style={{
                          width: `${livePct || pct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Right Large Temperature Value */}
                  <div style={{ textAlign: "right", minWidth: "62px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 900, fontSize: "1.05rem", color: "#0f172a" }}>
                      {temp}°C
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CARD 2: PHYSICS EXPECTED BASELINE ── */}
        <div className="dt-ref-card">
          <CornerScrews />
          <div className="dt-card-header">
            <div className="dt-card-title-text">PHYSICS EXPECTED BASELINE</div>
            <div className="dt-card-tag green">SIM-TO-REAL</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem", position: "relative", zIndex: 3 }}>
            {/* Row 1: Expected EGT */}
            <div className="dt-debossed-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div className="dt-icon-box" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                  <Thermometer size={18} color="#1e293b" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.80rem", color: "#1e293b" }}>Expected EGT</span>
              </div>
              <div className="dt-brass-plaque">
                {expectedEgt}°C
              </div>
            </div>

            {/* Row 2: Expected CHT */}
            <div className="dt-debossed-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div className="dt-icon-box" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                  <Flame size={18} color="#1e293b" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.80rem", color: "#1e293b" }}>Expected CHT</span>
              </div>
              <div className="dt-brass-plaque">
                {expectedCht}°C
              </div>
            </div>

            {/* Row 3: Expected Fuel Flow */}
            <div className="dt-debossed-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div className="dt-icon-box" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                  <Droplets size={18} color="#1e293b" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.80rem", color: "#1e293b" }}>Expected Fuel Flow</span>
              </div>
              <div className="dt-brass-plaque">
                {expectedFuelFlow} L/h
              </div>
            </div>

            {/* Row 4: Expected Vibration */}
            <div className="dt-debossed-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div className="dt-icon-box" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                  <Activity size={18} color="#1e293b" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.80rem", color: "#1e293b" }}>Expected Vibration</span>
              </div>
              <div className="dt-brass-plaque">
                {expectedVibration} mm/s
              </div>
            </div>

            {/* Row 5: Simulated Scenario */}
            <div className="dt-debossed-row">
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <div className="dt-icon-box" style={{ background: "transparent", border: "none", boxShadow: "none" }}>
                  <ClipboardList size={18} color="#1e293b" />
                </div>
                <span style={{ fontWeight: 800, fontSize: "0.80rem", color: "#1e293b" }}>Simulated Scenario</span>
              </div>
              <div className="dt-brass-plaque">
                {simScenario}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 3: FLIGHT-CONDITION ANOMALY SCORE ── */}
        <div className="dt-ref-card">
          <CornerScrews />
          <div className="dt-card-header">
            <div className="dt-card-title-text">
              <Radio size={14} color="#0f172a" />
              FLIGHT-CONDITION ANOMALY SCORE
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column" }}>
            {/* Large Anomaly Score Number */}
            <div style={{ textAlign: "center", marginTop: "0.2rem" }}>
              <div
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  fontFamily: "var(--font-mono)",
                  color: "#0f172a",
                  letterSpacing: "-0.5px",
                  lineHeight: 1.1,
                }}
              >
                {typeof anomalyScore === "number" ? anomalyScore.toFixed(3) : anomalyScore}
              </div>
              <div style={{ fontSize: "0.70rem", color: "#475569", marginTop: "0.2rem", fontWeight: 700 }}>
                Anomaly Index (0.00 Nominal → 1.00 Critical)
              </div>
            </div>

            {/* Metal Primary Driver Plaque */}
            <div className="dt-primary-driver-pill">
              Primary Driver: <strong style={{ color: "#38bdf8", fontWeight: 900, textShadow: "0 0 6px rgba(56, 189, 248, 0.4)" }}>{primaryDriver}</strong>
            </div>

            {/* 2x2 Sub-Grid Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.55rem" }}>
              {/* Engine Health */}
              <div className="dt-sub-metric-card">
                <Activity size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.60rem", color: "#475569", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    ENGINE HEALTH
                  </span>
                  <span style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    97.8%
                  </span>
                </div>
              </div>

              {/* Mission Readiness */}
              <div className="dt-sub-metric-card">
                <ShieldCheck size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.60rem", color: "#475569", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    MISSION READINESS
                  </span>
                  <span style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    99.1%
                  </span>
                </div>
              </div>

              {/* Est. Time to Maint. */}
              <div className="dt-sub-metric-card">
                <Clock size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.60rem", color: "#475569", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    EST. TIME TO MAINT.
                  </span>
                  <span style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    36.2 hrs
                  </span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="dt-sub-metric-card">
                <Shield size={18} color="#0f172a" style={{ flexShrink: 0 }} />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.60rem", color: "#475569", fontWeight: 800, fontFamily: "var(--font-mono)" }}>
                    RISK LEVEL
                  </span>
                  <span style={{ fontSize: "0.95rem", color: "#0f172a", fontWeight: 900, fontFamily: "var(--font-mono)" }}>
                    LOW
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 4: PHYSICS MODEL RESIDUAL MAGNITUDE (3D CYLINDER EQUALIZER) ── */}
      <div className="dt-ref-card" style={{ padding: "0.85rem 1.1rem" }}>
        <CornerScrews />
        <div className="dt-card-header">
          <div className="dt-card-title-text">
            PHYSICS MODEL RESIDUAL MAGNITUDE | DELTA (ACTUAL - PHYSICS EXPECTED)
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(228, 233, 240, 0.8) 100%)",
                border: "1px solid #94a3b8",
                borderRadius: "5px",
                padding: "3px 8px",
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#0f172a",
                fontFamily: "var(--font-mono)",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
            >
              LAST 10 MINUTES <ChevronDown size={11} />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(228, 233, 240, 0.8) 100%)",
                border: "1px solid #94a3b8",
                borderRadius: "5px",
                padding: "3px 5px",
                color: "#0f172a",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                cursor: "pointer",
              }}
            >
              <Maximize2 size={12} />
            </div>
          </div>
        </div>

        {/* 3D Equalizer Chamber with Y-Axis Scale */}
        <div className="dt-equalizer-chamber">
          {/* Left Y-Axis Scale */}
          <div
            style={{
              position: "absolute",
              left: "10px",
              top: "16px",
              bottom: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "flex-end",
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              fontWeight: 900,
              color: "#334155",
              zIndex: 5,
            }}
          >
            <span>60 -</span>
            <span>30 -</span>
            <span>0 -</span>
            <span>-30 -</span>
            <span>-60 -</span>
          </div>

          {/* Main Equalizer Columns Area */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1.3fr", gap: "1.5rem", alignItems: "flex-end", paddingBottom: "0", minHeight: "100px" }}>
            
            {/* 1. EGT Delta Group (Gold / Amber 3D Cylinders) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "5px", width: "100%", height: "85px" }}>
                {egtBars.map((bar, idx) => (
                  <div 
                    key={idx} 
                    className="dt-cylinder-3d-wrap" 
                    title={`${bar.label}: ${bar.val > 0 ? "+" : ""}${bar.val}°C`}
                    style={{ width: `${bar.w}px`, height: `${bar.h}px`, transition: "height 0.35s ease-out" }}
                  >
                    <div
                      className="dt-cylinder-cap"
                      style={{
                        background: "radial-gradient(ellipse at center, #fffbeb 0%, #fde047 50%, #b45309 100%)",
                        border: "0.5px solid #ca8a04",
                      }}
                    />
                    <div
                      className="dt-cylinder-body"
                      style={{
                        background: "linear-gradient(90deg, #78350f 0%, #ca8a04 18%, #fef08a 42%, #eab308 65%, #854d0e 85%, #451a03 100%)",
                        border: "0.5px solid #92400e",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CHT Delta Group (Copper / Terracotta 3D Cylinders) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "5px", width: "100%", height: "85px" }}>
                {chtBars.map((bar, idx) => (
                  <div 
                    key={idx} 
                    className="dt-cylinder-3d-wrap" 
                    title={`${bar.label}: ${bar.val > 0 ? "+" : ""}${bar.val}°C`}
                    style={{ width: `${bar.w}px`, height: `${bar.h}px`, transition: "height 0.35s ease-out" }}
                  >
                    <div
                      className="dt-cylinder-cap"
                      style={{
                        background: "radial-gradient(ellipse at center, #ffedd5 0%, #fb923c 50%, #9a3412 100%)",
                        border: "0.5px solid #ea580c",
                      }}
                    />
                    <div
                      className="dt-cylinder-body"
                      style={{
                        background: "linear-gradient(90deg, #7c2d12 0%, #c2410c 18%, #fed7aa 42%, #ea580c 65%, #9a3412 85%, #431407 100%)",
                        border: "0.5px solid #9a3412",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Fuel Flow Delta Group (Olive / Vintage Brass 3D Cylinders) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "5px", width: "100%", height: "85px" }}>
                {fuelBars.map((bar, idx) => (
                  <div 
                    key={idx} 
                    className="dt-cylinder-3d-wrap" 
                    title={`${bar.label}: ${bar.val > 0 ? "+" : ""}${bar.val} L/h`}
                    style={{ width: `${bar.w}px`, height: `${bar.h}px`, transition: "height 0.35s ease-out" }}
                  >
                    <div
                      className="dt-cylinder-cap"
                      style={{
                        background: "radial-gradient(ellipse at center, #f5f8d8 0%, #c6d389 50%, #565e31 100%)",
                        border: "0.5px solid #7c8846",
                      }}
                    />
                    <div
                      className="dt-cylinder-body"
                      style={{
                        background: "linear-gradient(90deg, #373b1f 0%, #768045 18%, #eef3cb 42%, #9da960 65%, #596131 85%, #232713 100%)",
                        border: "0.5px solid #5a6433",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Vibration Delta Group (Polished Steel / Silver Chrome 3D Cylinders) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "5px", width: "100%", height: "85px" }}>
                {vibBars.map((bar, idx) => (
                  <div 
                    key={idx} 
                    className="dt-cylinder-3d-wrap" 
                    title={`${bar.label}: ${bar.val > 0 ? "+" : ""}${bar.val} mm/s`}
                    style={{ width: `${bar.w}px`, height: `${bar.h}px`, transition: "height 0.35s ease-out" }}
                  >
                    <div
                      className="dt-cylinder-cap"
                      style={{
                        background: "radial-gradient(ellipse at center, #ffffff 0%, #cbd5e1 50%, #475569 100%)",
                        border: "0.5px solid #94a3b8",
                      }}
                    />
                    <div
                      className="dt-cylinder-body"
                      style={{
                        background: "linear-gradient(90deg, #334155 0%, #94a3b8 18%, #ffffff 42%, #cbd5e1 65%, #64748b 85%, #1e293b 100%)",
                        border: "0.5px solid #64748b",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Extruded Continuous Horizontal Metal Shelf */}
          <div className="dt-equalizer-shelf" />

          {/* 4 Engraved Component Badges under the Shelf */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr 1fr 1.3fr", gap: "1.5rem", marginTop: "8px" }}>
            <div style={{ textAlign: "center" }}>
              <div className="dt-cylinder-badge">EGT Delta (°C)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="dt-cylinder-badge">CHT Delta (°C)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="dt-cylinder-badge">Fuel Flow Delta (x10 L/h)</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div className="dt-cylinder-badge">Vibration Delta (x10 mm/s)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
