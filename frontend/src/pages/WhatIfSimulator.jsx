import React, { useState, useEffect } from "react";
import { 
  Sliders, Activity, ShieldCheck, AlertTriangle, Flame, Gauge, 
  Fuel, Compass, Plane, CheckCircle2, RotateCcw, Play, Terminal, Download
} from "lucide-react";
import { 
  ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid 
} from "recharts";
import { api } from "../services/api";

/**
 * 3D Pan-Head Rivet / Screw SVG
 */
function CornerScrew({ size = 11, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        display: "block",
        filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.45))",
        ...style,
      }}
    >
      <defs>
        <radialGradient id="whatifScrewGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#d5d9df" />
          <stop offset="65%" stopColor="#8e949d" />
          <stop offset="100%" stopColor="#4a4e55" />
        </radialGradient>
        <radialGradient id="whatifHoleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#4a4f57" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#whatifHoleGrad)" stroke="#3a3e45" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="8.5" fill="url(#whatifScrewGrad)" stroke="#2b2e34" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      <rect x="10.8" y="5.5" width="2.4" height="13" rx="0.5" fill="#1e2024" />
      <rect x="5.5" y="10.8" width="13" height="2.4" rx="0.5" fill="#1e2024" />
      <circle cx="9.5" cy="9.5" r="1" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

/**
 * Individual Skeuomorphic Sub-Plate Slider Slice
 */
function ScenarioFaderSlice({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
  subText,
  ticks,
  fillTrackColor,
}) {
  // Compute percentage for fill
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  return (
    <div className="scenario-sub-plate">
      {/* 4 Mini Corner Rivets */}
      <CornerScrew size={8} style={{ position: "absolute", top: "3px", left: "3px", opacity: 0.85 }} />
      <CornerScrew size={8} style={{ position: "absolute", top: "3px", right: "3px", opacity: 0.85 }} />
      <CornerScrew size={8} style={{ position: "absolute", bottom: "3px", left: "3px", opacity: 0.85 }} />
      <CornerScrew size={8} style={{ position: "absolute", bottom: "3px", right: "3px", opacity: 0.85 }} />

      {/* Center Fader Track & Ruler Scale */}
      <div className="scenario-center-col">
        <div className="scenario-label">{label}</div>

        {/* 3D Recessed Groove Slider Track */}
        <div className="scenario-slider-wrap">
          <div className="scenario-groove-bg">
            <div
              className="scenario-groove-fill"
              style={{
                width: `${pct}%`,
                background: fillTrackColor,
                boxShadow: `0 0 8px ${typeof fillTrackColor === 'string' && fillTrackColor.startsWith('#') ? fillTrackColor : 'rgba(0,255,157,0.6)'}`,
              }}
            />
          </div>

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="scenario-range-input"
          />
        </div>

        {/* Engraved Ruler Tick Lines & Numbers */}
        <div style={{ width: "100%", marginTop: "1px" }}>
          {/* Tick SVG lines */}
          <svg viewBox="0 0 100 8" className="scenario-ticks-svg" preserveAspectRatio="none">
            {ticks.map((t, i) => {
              const x = (i / (ticks.length - 1)) * 100;
              return (
                <g key={i}>
                  <line x1={x} y1="0" x2={x} y2="6" stroke="#111418" strokeWidth="1.2" />
                  {i < ticks.length - 1 && (
                    <>
                      <line x1={x + (100 / (ticks.length - 1)) * 0.25} y1="0" x2={x + (100 / (ticks.length - 1)) * 0.25} y2="3.5" stroke="#2b2e34" strokeWidth="0.8" />
                      <line x1={x + (100 / (ticks.length - 1)) * 0.5} y1="0" x2={x + (100 / (ticks.length - 1)) * 0.5} y2="4.5" stroke="#2b2e34" strokeWidth="1" />
                      <line x1={x + (100 / (ticks.length - 1)) * 0.75} y1="0" x2={x + (100 / (ticks.length - 1)) * 0.75} y2="3.5" stroke="#2b2e34" strokeWidth="0.8" />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Tick numbers */}
          <div className="scenario-ruler-scale">
            {ticks.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Digital Display Bezel */}
      <div className="scenario-display-bezel">
        <CornerScrew size={6} style={{ position: "absolute", top: "2px", left: "2px", opacity: 0.7 }} />
        <CornerScrew size={6} style={{ position: "absolute", top: "2px", right: "2px", opacity: 0.7 }} />
        <CornerScrew size={6} style={{ position: "absolute", bottom: "2px", left: "2px", opacity: 0.7 }} />
        <CornerScrew size={6} style={{ position: "absolute", bottom: "2px", right: "2px", opacity: 0.7 }} />

        <div className="scenario-digital-val">
          {typeof value === 'number' && Number.isInteger(value) ? value : value.toFixed(1)}
          <span style={{ fontSize: "0.85rem", marginLeft: "2px" }}>{unit}</span>
        </div>
        {subText && <div className="scenario-digital-sub">{subText}</div>}
      </div>
    </div>
  );
}



/**
 * Prognostic Metric Sub-Plate Gauge
 */
function PrognosticMetricPlate({
  label,
  value,
  unit,
  barGradient,
  barWidthPct,
  footerText,
  hasLockScrew = false,
}) {
  const clampPct = Math.max(4, Math.min(96, barWidthPct));

  return (
    <div className="prognostic-sub-plate">
      <CornerScrew size={8} style={{ position: "absolute", top: "3px", left: "3px", opacity: 0.8 }} />
      <CornerScrew size={8} style={{ position: "absolute", top: "3px", right: "3px", opacity: 0.8 }} />
      <CornerScrew size={8} style={{ position: "absolute", bottom: "3px", left: "3px", opacity: 0.8 }} />
      <CornerScrew size={8} style={{ position: "absolute", bottom: "3px", right: "3px", opacity: 0.8 }} />

      <div className="prognostic-plate-label">{label}</div>

      <div className="prognostic-plate-readout-row">
        <div className="prognostic-plate-lcd">
          <div className="prognostic-plate-val">
            {value}
            {unit && <span style={{ fontSize: "0.72rem", marginLeft: "2px", opacity: 0.85 }}>{unit}</span>}
          </div>
        </div>
        {hasLockScrew && (
          <CornerScrew size={9} style={{ opacity: 0.85, flexShrink: 0 }} />
        )}
      </div>

      <div className="prognostic-bar-container">
        {/* Triangle Needle Pointer */}
        <div
          className="prognostic-needle-pointer"
          style={{ left: `${clampPct}%` }}
        >
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none" style={{ display: "block", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.85))" }}>
            <polygon points="5.5,7.5 10.5,1 0.5,1" fill="#ffffff" stroke="#181a1e" strokeWidth="1" />
            <line x1="5.5" y1="1.5" x2="5.5" y2="6.5" stroke="#cbd5e1" strokeWidth="0.8" />
          </svg>
        </div>

        {/* Recessed Glowing Groove */}
        <div className="prognostic-bar-wrap">
          <div
            className="prognostic-bar-fill"
            style={{
              width: `${Math.max(5, Math.min(100, barWidthPct))}%`,
              background: barGradient,
            }}
          />
        </div>
      </div>

      <div className="prognostic-plate-footer">{footerText}</div>
    </div>
  );
}

export default function WhatIfSimulator() {
  const [missionName, setMissionName] = useState("High Altitude Tactical Loiter Alpha");
  const [durationHours, setDurationHours] = useState(12.3);
  const [altitudeM, setAltitudeM] = useState(4500);
  const [ambientTempC, setAmbientTempC] = useState(28);
  const [throttlePct, setThrottlePct] = useState(70);
  const [payloadKg, setPayloadKg] = useState(128);
  const [fuelTankL, setFuelTankL] = useState(220);

  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const runSimulation = () => {
    setIsSimulating(true);
    api.simulateWhatIf({
      mission_name: missionName,
      flight_duration_hours: durationHours,
      target_altitude_m: altitudeM,
      ambient_temp_c: ambientTempC,
      cruise_throttle_pct: throttlePct,
      payload_weight_kg: payloadKg,
      fuel_tank_capacity_l: fuelTankL,
    })
      .then((res) => {
        setSimulationResult(res);
        setIsSimulating(false);
      })
      .catch((err) => {
        console.error("Simulation error:", err);
        setIsSimulating(false);
      });
  };

  useEffect(() => {
    runSimulation();
  }, [durationHours, altitudeM, ambientTempC, throttlePct, payloadKg, fuelTankL]);

  const res = simulationResult || {
    feasibility_score: 92.5,
    verdict: "GO",
    projected_peak_cht: 138.2,
    projected_peak_egt: 742.0,
    thermal_margin_c: 16.8,
    total_fuel_consumed_l: 122.4,
    fuel_reserve_remaining_l: 97.6,
    fuel_endurance_margin_pct: 44.4,
    projected_rul_loss_hours: 7.2,
    estimated_wear_rate: 1.11,
    flight_profile_series: [],
    recommendations: ["Flight profile nominal. Engine operating within certified envelopes."],
    operational_risks: ["No critical operational hazards identified."],
  };

  // Pass 100% backend computed flight profile series directly into charts
  const chartSeries = (res.flight_profile_series && res.flight_profile_series.length > 0)
    ? res.flight_profile_series.map((item) => ({
        ...item,
        oat_c: item.oat_c !== undefined ? item.oat_c : Math.round((ambientTempC - ((item.altitude_m || 0) / 1000) * 6.5) * 10) / 10,
        display_time: item.time_hour ? item.time_hour.replace("T+", "").replace("h", "") : "0",
      }))
    : [];

  return (
    <div className="whatif-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="header-node-tag">
            <Terminal size={12} color="var(--accent-cyan)" /> Dronanetra // WHAT-IF MISSION RISK SIMULATOR (SECTION 14)
          </div>
          <h2>
            <Sliders size={24} color="var(--accent-cyan)" /> Pre-Flight Thermodynamic Mission Planner & Risk Sandbox
          </h2>
          <p>Thermodynamic Equilibrium Modeling, Thermal Margin Prediction & Mission Feasibility Assessment</p>
        </div>
      </div>

      {/* Grid: Sliders on Left, Simulation Results on Right */}
      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        {/* Left Card: Input Sliders matching image spec */}
        <div className="scenario-chassis-panel" style={{ gridColumn: "span 1" }}>
          {/* 4 Outer Screws */}
          <CornerScrew size={14} style={{ position: "absolute", top: "6px", left: "6px" }} />
          <CornerScrew size={14} style={{ position: "absolute", top: "6px", right: "6px" }} />
          <CornerScrew size={14} style={{ position: "absolute", bottom: "6px", left: "6px" }} />
          <CornerScrew size={14} style={{ position: "absolute", bottom: "6px", right: "6px" }} />

          {/* Master Title Header Bar */}
          <div className="scenario-header-bar">
            <div className="scenario-header-title">
              <span
                style={{
                  width: "9px",
                  height: "9px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #00f2ff 50%, #006688 100%)",
                  boxShadow: "0 0 6px #00f2ff, inset 0 1px 1px #fff",
                  display: "inline-block",
                }}
              />
              <span>MISSION SCENARIO CONFIGURATION</span>
            </div>
            <span className="scenario-header-serial">24</span>
          </div>

          {/* 6 Sub-Plate Slices */}
          <ScenarioFaderSlice
            label="PLANNED LOITER DURATION"
            value={durationHours}
            min={0.0}
            max={24.0}
            step={0.1}
            onChange={setDurationHours}
            unit="h"
            ticks={[0, 6, 12, 18, 24]}
            fillTrackColor="#b45309"
          />

          <ScenarioFaderSlice
            label="TARGET LOITER ALTITUDE"
            value={altitudeM}
            min={0}
            max={5000}
            step={50}
            onChange={setAltitudeM}
            unit="m"
            subText={`(${Math.round(altitudeM * 3.28084)} ft)`}
            ticks={[0, 1, 2, 3, 4, 5]}
            fillTrackColor="#f59e0b"
          />

          <ScenarioFaderSlice
            label="OUTSIDE AIR TEMP (OAT)"
            value={ambientTempC}
            min={-40}
            max={40}
            step={1}
            onChange={setAmbientTempC}
            unit="°C"
            ticks={[-40, -20, 0, 20, 40]}
            fillTrackColor="linear-gradient(to right, #0284c7 0%, #d97706 60%, #dc2626 100%)"
          />

          <ScenarioFaderSlice
            label="CRUISE THROTTLE SETTING"
            value={throttlePct}
            min={0}
            max={100}
            step={1}
            onChange={setThrottlePct}
            unit="%"
            ticks={[0, 20, 40, 60, 80, 100]}
            fillTrackColor="#0284c7"
          />

          <ScenarioFaderSlice
            label="PAYLOAD MASS"
            value={payloadKg}
            min={0}
            max={400}
            step={1}
            onChange={setPayloadKg}
            unit="kg"
            ticks={[0, 100, 200, 300, 400]}
            fillTrackColor="#9333ea"
          />

          <ScenarioFaderSlice
            label="USABLE FUEL CAPACITY"
            value={fuelTankL}
            min={0}
            max={400}
            step={5}
            onChange={setFuelTankL}
            unit="L"
            ticks={[0, 100, 200, 300, 400]}
            fillTrackColor="#d97706"
          />
        </div>

        {/* Right 2 Columns: Feasibility Verdict & Projected Metrics */}
        <div className="prognostic-master-panel" style={{ gridColumn: "span 2" }}>
          {/* 4 Outer Screws */}
          <CornerScrew size={14} style={{ position: "absolute", top: "6px", left: "6px" }} />
          <CornerScrew size={14} style={{ position: "absolute", top: "6px", right: "6px" }} />
          <CornerScrew size={14} style={{ position: "absolute", bottom: "6px", left: "6px" }} />
          <CornerScrew size={14} style={{ position: "absolute", bottom: "6px", right: "6px" }} />

          {/* Master Title Header Bar */}
          <div className="prognostic-header-row">
            <div className="prognostic-header-title">
              <CornerScrew size={10} style={{ opacity: 0.9 }} />
              <span>PRE-FLIGHT PROGNOSTIC VERDICT & FEASIBILITY</span>
            </div>

            <div
              className="prognostic-verdict-pill"
              style={{
                background:
                  res.verdict === "GO"
                    ? "rgba(245, 158, 11, 0.14)"
                    : res.verdict === "CAUTION"
                    ? "rgba(139, 0, 0, 0.4)"
                    : "rgba(180, 20, 20, 0.45)",
                color:
                  res.verdict === "GO"
                    ? "#fbbf24"
                    : res.verdict === "CAUTION"
                    ? "#ff4d4f"
                    : "#ef4444",
                border: `1.5px solid ${
                  res.verdict === "GO"
                    ? "#f59e0b"
                    : res.verdict === "CAUTION"
                    ? "#dc2626"
                    : "#b91c1c"
                }`,
                boxShadow:
                  res.verdict === "GO"
                    ? "0 0 10px rgba(245, 158, 11, 0.4)"
                    : "none",
              }}
            >
              <span>MISSION VERDICT : {res.verdict}</span>
            </div>
          </div>

          {/* Cockpit HUD Screen */}
          <div className="prognostic-hud-screen">
            {/* Left Stepped Bezel Feasibility Score */}
            <div className="prognostic-score-bezel">
              <CornerScrew size={6} style={{ position: "absolute", top: "2px", left: "2px", opacity: 0.7 }} />
              <CornerScrew size={6} style={{ position: "absolute", top: "2px", right: "2px", opacity: 0.7 }} />
              <CornerScrew size={6} style={{ position: "absolute", bottom: "2px", left: "2px", opacity: 0.7 }} />
              <CornerScrew size={6} style={{ position: "absolute", bottom: "2px", right: "2px", opacity: 0.7 }} />

              <div className="prognostic-score-tab">FEASIBILITY SCORE</div>
              <div className="prognostic-score-lcd">
                <div className="prognostic-score-digits">
                  {Math.round(res.feasibility_score)}%
                </div>
              </div>
            </div>

            {/* Center Hero: UAV Blueprint & Live Advisory */}
            <div className="prognostic-center-hero">
              <div style={{ position: "relative", width: "100%", height: "58px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <img
                  src="/whatif_uav_xray_transparent.png"
                  alt="Tactical UAV Internal System Architecture"
                  style={{
                    maxHeight: "56px",
                    maxWidth: "260px",
                    objectFit: "contain",
                    filter: "drop-shadow(0 0 8px rgba(245, 158, 11, 0.45))",
                  }}
                />
              </div>
              
              <div
                className="prognostic-verdict-text"
                style={{
                  color:
                    res.verdict === "GO"
                      ? "#fbbf24"
                      : res.verdict === "CAUTION"
                      ? "#f59e0b"
                      : "#ef4444",
                }}
              >
                <div className="verdict-line-1">
                  {res.verdict === "GO" ? "FLIGHT ENVELOPE CERTIFIED" : res.verdict === "CAUTION" ? "MARGINAL OPERATING ENVELOPE" : "MISSION ABORT RECOMMENDED"}
                </div>
                <div className="verdict-line-2">
                  {res.verdict === "GO" ? "PROCEED WITH MISSION PROFILE" : res.verdict === "CAUTION" ? "CAUTIONARY PROFILE ADVISORY" : "CRITICAL ENVELOPE EXCEEDED"}
                </div>
              </div>

              <div className="prognostic-advisory-note">
                <span className="advisory-tag">DIRECTIVE:</span>{" "}
                <span className="advisory-text">{res.recommendations?.[0] || "Flight profile fully nominal. Engine operating within certified envelopes."}</span>
              </div>
            </div>

            {/* Right Checklist Box */}
            <div className="prognostic-checklist-card">
              <div className="prognostic-check-row">
                <span className="prognostic-check-label">
                  <CheckCircle2 size={13} color="#fbbf24" /> Thermal Limits
                </span>
                <span
                  className="prognostic-check-badge"
                  style={{
                    color:
                      res.thermal_margin_c >= 10
                        ? "#fbbf24"
                        : res.thermal_margin_c > 0
                        ? "#f59e0b"
                        : "#ef4444",
                    border: `1px solid ${
                      res.thermal_margin_c >= 10
                        ? "rgba(245, 158, 11, 0.35)"
                        : res.thermal_margin_c > 0
                        ? "rgba(245, 158, 11, 0.35)"
                        : "rgba(239, 68, 68, 0.35)"
                    }`,
                    background:
                      res.thermal_margin_c >= 10
                        ? "rgba(245, 158, 11, 0.1)"
                        : res.thermal_margin_c > 0
                        ? "rgba(245, 158, 11, 0.08)"
                        : "rgba(239, 68, 68, 0.08)",
                  }}
                >
                  {res.thermal_margin_c >= 10 ? "WITHIN RANGE" : res.thermal_margin_c > 0 ? "MARGINAL" : "EXCEEDED"}
                </span>
              </div>

              <div className="prognostic-check-row">
                <span className="prognostic-check-label">
                  <CheckCircle2 size={13} color="#fbbf24" /> Power Margin
                </span>
                <span
                  className="prognostic-check-badge"
                  style={{
                    color:
                      res.verdict === "GO"
                        ? "#fbbf24"
                        : res.verdict === "CAUTION"
                        ? "#f59e0b"
                        : "#ef4444",
                    border: `1px solid ${
                      res.verdict === "GO"
                        ? "rgba(245, 158, 11, 0.35)"
                        : res.verdict === "CAUTION"
                        ? "rgba(245, 158, 11, 0.35)"
                        : "rgba(239, 68, 68, 0.35)"
                    }`,
                    background:
                      res.verdict === "GO"
                        ? "rgba(245, 158, 11, 0.1)"
                        : res.verdict === "CAUTION"
                        ? "rgba(245, 158, 11, 0.08)"
                        : "rgba(239, 68, 68, 0.08)",
                  }}
                >
                  {res.verdict === "GO" ? "ADEQUATE" : res.verdict === "CAUTION" ? "MARGINAL" : "DEFICIT"}
                </span>
              </div>

              <div className="prognostic-check-row">
                <span className="prognostic-check-label">
                  <CheckCircle2 size={13} color="#fbbf24" /> Fuel Endurance
                </span>
                <span
                  className="prognostic-check-badge"
                  style={{
                    color:
                      res.fuel_endurance_margin_pct >= 20
                        ? "#fbbf24"
                        : res.fuel_endurance_margin_pct >= 10
                        ? "#f59e0b"
                        : "#ef4444",
                    border: `1px solid ${
                      res.fuel_endurance_margin_pct >= 20
                        ? "rgba(245, 158, 11, 0.35)"
                        : res.fuel_endurance_margin_pct >= 10
                        ? "rgba(245, 158, 11, 0.35)"
                        : "rgba(239, 68, 68, 0.35)"
                    }`,
                    background:
                      res.fuel_endurance_margin_pct >= 20
                        ? "rgba(245, 158, 11, 0.1)"
                        : res.fuel_endurance_margin_pct >= 10
                        ? "rgba(245, 158, 11, 0.08)"
                        : "rgba(239, 68, 68, 0.08)",
                  }}
                >
                  {res.fuel_endurance_margin_pct >= 20 ? "SUFFICIENT" : res.fuel_endurance_margin_pct >= 10 ? "LIMITED" : "CRITICAL"}
                </span>
              </div>

              <div className="prognostic-check-row">
                <span className="prognostic-check-label">
                  <CheckCircle2 size={13} color="#fbbf24" /> Risk Level
                </span>
                <span
                  className="prognostic-check-badge"
                  style={{
                    color:
                      res.verdict === "GO"
                        ? "#fbbf24"
                        : res.verdict === "CAUTION"
                        ? "#f59e0b"
                        : "#ef4444",
                    border: `1px solid ${
                      res.verdict === "GO"
                        ? "rgba(245, 158, 11, 0.35)"
                        : res.verdict === "CAUTION"
                        ? "rgba(245, 158, 11, 0.35)"
                        : "rgba(239, 68, 68, 0.35)"
                    }`,
                    background:
                      res.verdict === "GO"
                        ? "rgba(245, 158, 11, 0.1)"
                        : res.verdict === "CAUTION"
                        ? "rgba(245, 158, 11, 0.08)"
                        : "rgba(239, 68, 68, 0.08)",
                  }}
                >
                  {res.verdict === "GO" ? "ACCEPTABLE" : res.verdict === "CAUTION" ? "MODERATE" : "HIGH"}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom 4 Sub-Plate Prognostic Gauges (2:2 Format) */}
          <div className="prognostic-metric-grid">
            <PrognosticMetricPlate
              label="PEAK CHT TEMP"
              value={res.projected_peak_cht !== undefined ? res.projected_peak_cht.toFixed(1) : "128.6"}
              unit="°C"
              hasLockScrew={true}
              barWidthPct={(res.projected_peak_cht / 200) * 100}
              barGradient="linear-gradient(to right, #eab308 0%, #f97316 65%, #ef4444 100%)"
              footerText={`Margin: ${res.thermal_margin_c !== undefined ? res.thermal_margin_c.toFixed(1) : "26.4"}°C to Redline`}
            />

            <PrognosticMetricPlate
              label="FUEL CONSUMPTION"
              value={res.total_fuel_consumed_l !== undefined ? res.total_fuel_consumed_l.toFixed(1) : "178.6"}
              unit="L"
              barWidthPct={(res.total_fuel_consumed_l / (fuelTankL || 220)) * 100}
              barGradient="linear-gradient(to right, #eab308 0%, #f97316 100%)"
              footerText={`Reserve: ${res.fuel_reserve_remaining_l !== undefined ? res.fuel_reserve_remaining_l.toFixed(1) : "41.4"} L (${res.fuel_endurance_margin_pct !== undefined ? res.fuel_endurance_margin_pct.toFixed(1) : "18.8"}%)`}
            />

            <PrognosticMetricPlate
              label="PEAK EGT COMBUSTION"
              value={res.projected_peak_egt !== undefined ? res.projected_peak_egt.toFixed(1) : "844.1"}
              unit="°C"
              hasLockScrew={true}
              barWidthPct={(res.projected_peak_egt / 1000) * 100}
              barGradient="linear-gradient(to right, #eab308 0%, #f97316 70%, #ef4444 100%)"
              footerText="Redline: 850°C"
            />

            <PrognosticMetricPlate
              label="RUL WEAR IMPACT"
              value={res.projected_rul_loss_hours !== undefined ? `-${res.projected_rul_loss_hours.toFixed(1)}` : "-16.7"}
              unit="hrs"
              barWidthPct={Math.min(100, (res.estimated_wear_rate || 1.36) * 18)}
              barGradient="linear-gradient(to right, #f59e0b 0%, #ea580c 100%)"
              footerText={`Wear Factor: ${res.estimated_wear_rate !== undefined ? `${Math.round(res.estimated_wear_rate * 15)}%` : "20%"}`}
            />
          </div>
        </div>
      </div>

      {/* Discretized Flight Profile Trajectory & Fuel Reserves CRT Monitors */}
      <div className="grid-2" style={{ gap: "1.25rem" }}>
        {/* Left Monitor: Altitude & Thermodynamic Profile */}
        <div className="prognostic-chart-panel">
          {/* 4 Outer Screws */}
          <CornerScrew size={11} style={{ position: "absolute", top: "5px", left: "5px" }} />
          <CornerScrew size={11} style={{ position: "absolute", top: "5px", right: "5px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "5px", left: "5px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "5px", right: "5px" }} />

          {/* Monitor Header */}
          <div className="prognostic-chart-header">
            <div className="prognostic-chart-title">
              <CornerScrew size={9} style={{ opacity: 0.9 }} />
              <span>PROJECTED ALTITUDE & THERMODYNAMIC PROFILE</span>
            </div>
          </div>

          {/* CRT Screen Display */}
          <div className="prognostic-chart-screen">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartSeries} margin={{ top: 14, right: 10, left: -14, bottom: 4 }}>
                <defs>
                  <linearGradient id="altSilverGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="1 3" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="display_time" 
                  stroke="#475569" 
                  tick={{ fill: "#ffffff", fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-mono)" }}
                  label={{ value: "MISSION TIME (Hours)", position: "insideBottom", offset: -2, fill: "#ffffff", fontSize: 9.5, fontFamily: "var(--font-mono)", fontWeight: 800 }}
                />
                <YAxis 
                  yAxisId="alt" 
                  stroke="#cbd5e1" 
                  domain={[0, (dataMax) => Math.max(5000, Math.ceil(dataMax / 1000) * 1000)]}
                  tick={{ fill: "#f1f5f9", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "ALTITUDE (m)", angle: -90, position: "insideLeft", offset: 18, fill: "#f1f5f9", fontSize: 8.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}
                />
                <YAxis 
                  yAxisId="temp" 
                  orientation="right" 
                  stroke="#ef4444" 
                  domain={[-40, 40]}
                  tick={{ fill: "#f87171", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "OAT (°C)", angle: 90, position: "insideRight", offset: 18, fill: "#f87171", fontSize: 8.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}
                />
                <Tooltip contentStyle={{ background: "#121316", border: "1px solid #2e3238", borderRadius: "6px", fontSize: "11px", color: "#f1f5f9" }} />
                <Legend wrapperStyle={{ paddingTop: "2px", fontSize: "10.5px", fontFamily: "var(--font-mono)" }} />
                <Area yAxisId="alt" type="monotone" dataKey="altitude_m" name="Altitude (m)" stroke="#ffffff" strokeWidth={2.2} fill="url(#altSilverGrad)" dot={false} />
                <Line yAxisId="temp" type="monotone" dataKey="oat_c" name="Outside Air Temp (°C)" stroke="#ef4444" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Monitor: Fuel Reserves & Consumption Curve */}
        <div className="prognostic-chart-panel">
          {/* 4 Outer Screws */}
          <CornerScrew size={11} style={{ position: "absolute", top: "5px", left: "5px" }} />
          <CornerScrew size={11} style={{ position: "absolute", top: "5px", right: "5px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "5px", left: "5px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "5px", right: "5px" }} />

          {/* Monitor Header */}
          <div className="prognostic-chart-header">
            <div className="prognostic-chart-title">
              <CornerScrew size={9} style={{ opacity: 0.9 }} />
              <span>PROJECTED FUEL RESERVES & CONSUMPTION CURVE</span>
            </div>

            <div
              className="prognostic-chart-badge"
              style={{
                background:
                  res.fuel_reserve_remaining_l >= 20
                    ? "rgba(245, 158, 11, 0.15)"
                    : res.fuel_reserve_remaining_l > 0
                    ? "rgba(249, 115, 22, 0.18)"
                    : "rgba(239, 68, 68, 0.2)",
                border: `1.5px solid ${
                  res.fuel_reserve_remaining_l >= 20
                    ? "#f59e0b"
                    : res.fuel_reserve_remaining_l > 0
                    ? "#f97316"
                    : "#ef4444"
                }`,
                color:
                  res.fuel_reserve_remaining_l >= 20
                    ? "#fbbf24"
                    : res.fuel_reserve_remaining_l > 0
                    ? "#fb923c"
                    : "#ef4444",
                boxShadow:
                  res.fuel_reserve_remaining_l >= 20
                    ? "0 0 8px rgba(245, 158, 11, 0.3)"
                    : "none",
              }}
            >
              <span>FUEL ENDURANCE : {res.fuel_reserve_remaining_l >= 20 ? "OK" : res.fuel_reserve_remaining_l > 0 ? "MARGINAL" : "DEFICIT"}</span>
            </div>
          </div>

          {/* CRT Screen Display */}
          <div className="prognostic-chart-screen">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries} margin={{ top: 14, right: 10, left: -14, bottom: 4 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="1 3" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="display_time" 
                  stroke="#475569" 
                  tick={{ fill: "#ffffff", fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-mono)" }}
                  label={{ value: "MISSION TIME (Hours)", position: "insideBottom", offset: -2, fill: "#ffffff", fontSize: 9.5, fontFamily: "var(--font-mono)", fontWeight: 800 }}
                />
                <YAxis 
                  yAxisId="fuel" 
                  stroke="#f59e0b" 
                  domain={[0, (dataMax) => Math.max(250, Math.ceil((fuelTankL || 220) / 50) * 50)]}
                  tick={{ fill: "#fbbf24", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "FUEL (L)", angle: -90, position: "insideLeft", offset: 18, fill: "#fbbf24", fontSize: 8.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}
                />
                <YAxis 
                  yAxisId="burn" 
                  orientation="right" 
                  stroke="#f97316" 
                  domain={[0, (dataMax) => Math.max(250, Math.ceil((fuelTankL || 220) / 50) * 50)]}
                  tick={{ fill: "#fb923c", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "CUMULATIVE BURN (L)", angle: 90, position: "insideRight", offset: 18, fill: "#fb923c", fontSize: 8.5, fontFamily: "var(--font-mono)", fontWeight: 700 }}
                />
                <Tooltip contentStyle={{ background: "#121316", border: "1px solid #2e3238", borderRadius: "6px", fontSize: "11px", color: "#f1f5f9" }} />
                <Legend wrapperStyle={{ paddingTop: "2px", fontSize: "10.5px", fontFamily: "var(--font-mono)" }} />
                <Line yAxisId="fuel" type="monotone" dataKey="fuel_remaining_l" name="Fuel Remaining (L)" stroke="#fbbf24" strokeWidth={2.4} dot={false} />
                <Line yAxisId="burn" type="monotone" dataKey="cumulative_fuel_l" name="Cumulative Burn (L)" stroke="#f97316" strokeWidth={2.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
