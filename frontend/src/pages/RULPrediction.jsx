import React, { useState, useEffect } from "react";
import { 
  Clock, Hourglass, Shield, Wrench, TrendingUp, ChevronDown, 
  Sparkles, AlertTriangle, CheckCircle2, Activity, Zap, Layers, 
  RefreshCw, Cpu, Gauge, Flame, FileText, ArrowUpRight
} from "lucide-react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, 
  Legend, CartesianGrid, AreaChart, Area, BarChart, Bar 
} from "recharts";
import { api } from "../services/api";

// ── Machined Ash Metallic Corner Screw Rivets ──────────────
function CornerScrews() {
  return (
    <>
      <div className="metal-screw screw-top-left" />
      <div className="metal-screw screw-top-right" />
      <div className="metal-screw screw-bottom-left" />
      <div className="metal-screw screw-bottom-right" />
    </>
  );
}

// ── SVG Forecasted Degradation Trajectory Chart ─────────────
function DegradationTrajectoryChart({ baseRul = 398, healthScore = 98.5, trajectory }) {
  const chartW = 1000;
  const chartH = 300;
  const padL = 90;
  const padR = 85;
  const padT = 20;
  const padB = 65;

  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const yTicks = [0, 150, 300, 450, 600];
  const maxY = 600;

  const hasBackendTrajectory = Array.isArray(trajectory) && trajectory.length >= 5;

  const xTicks = hasBackendTrajectory
    ? trajectory.map((p) => p.flight_hour)
    : [
        "+0h", "+5h", "+10h", "+15h", "+20h", 
        "+25h", "+30h", "+40h", "+45h", "+50h"
      ];

  const numPoints = xTicks.length;
  const startEst = baseRul > 100 ? baseRul : 430;
  const endEst = Math.max(50, startEst - 110);
  const startUpper = startEst + 55;
  const endUpper = endEst + 30;
  const startLower = startEst - 55;
  const endLower = Math.max(0, endEst - 30);

  const pointsEst = [];
  const pointsUpper = [];
  const pointsLower = [];

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const x = padL + progress * innerW;

    let valEst, valUpper, valLower;
    if (hasBackendTrajectory && trajectory[i]) {
      valEst = Number(trajectory[i].estimated_rul);
      valUpper = Number(trajectory[i].upper_bound);
      valLower = Number(trajectory[i].lower_bound);
    } else {
      valEst = startEst - progress * (startEst - endEst);
      valUpper = startUpper - progress * (startUpper - endUpper);
      valLower = startLower - progress * (startLower - endLower);
    }

    const yEst = padT + (1 - Math.max(0, Math.min(maxY, valEst)) / maxY) * innerH;
    const yUpper = padT + (1 - Math.max(0, Math.min(maxY, valUpper)) / maxY) * innerH;
    const yLower = padT + (1 - Math.max(0, Math.min(maxY, valLower)) / maxY) * innerH;

    pointsEst.push({ x, y: yEst, val: Math.round(valEst) });
    pointsUpper.push({ x, y: yUpper, val: Math.round(valUpper) });
    pointsLower.push({ x, y: yLower, val: Math.round(valLower) });
  }

  const dEst = pointsEst.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const dUpper = pointsUpper.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");
  const dLower = pointsLower.reduce((acc, p, idx) => `${acc} ${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`, "");

  const lastEst = pointsEst[pointsEst.length - 1];
  const lastUpper = pointsUpper[pointsUpper.length - 1];
  const lastLower = pointsLower[pointsLower.length - 1];

  // Vertical anti-collision layout for end badges:
  const badgeSpacing = 27;
  const centerEstY = Math.max(padT + badgeSpacing + 2, Math.min(padT + innerH - badgeSpacing - 2, lastEst.y));
  const upperBadgeY = centerEstY - badgeSpacing;
  const estBadgeY = centerEstY;
  const lowerBadgeY = centerEstY + badgeSpacing;

  return (
    <div className="rul-chart-scroll-wrap">
      <svg
        viewBox={`0 0 ${chartW} ${chartH}`}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        <defs>
          <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="1" dy="1.5" stdDeviation="1.5" floodColor="rgba(0,0,0,0.3)" />
          </filter>
        </defs>

        {/* Y-Axis Label */}
        <text
          x={-(padT + innerH / 2)}
          y={24}
          transform="rotate(-90)"
          textAnchor="middle"
          fill="#1e2227"
          fontSize="10"
          fontFamily="'Inter', sans-serif"
          fontWeight="800"
          letterSpacing="0.4px"
        >
          Remaining Useful Life (Hours)
        </text>

        {/* Horizontal Grid lines & Y-Axis Ticks */}
        {yTicks.map((tick) => {
          const y = padT + (1 - tick / maxY) * innerH;
          return (
            <g key={tick}>
              <line
                x1={padL}
                y1={y}
                x2={padL + innerW}
                y2={y}
                stroke="rgba(0, 0, 0, 0.14)"
                strokeWidth="0.8"
              />
              <line
                x1={padL - 5}
                y1={y}
                x2={padL}
                y2={y}
                stroke="#40454d"
                strokeWidth="1.2"
              />
              <text
                x={padL - 12}
                y={y + 3.5}
                textAnchor="end"
                fill="#333d4b"
                fontSize="10"
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="700"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Vertical Grid lines & X-Axis Ticks */}
        {xTicks.map((tick, idx) => {
          const x = padL + (idx / (numPoints - 1)) * innerW;
          return (
            <g key={tick}>
              <line
                x1={x}
                y1={padT}
                x2={x}
                y2={padT + innerH}
                stroke="rgba(0, 0, 0, 0.08)"
                strokeWidth="0.8"
              />
              <line
                x1={x}
                y1={padT + innerH}
                x2={x}
                y2={padT + innerH + 5}
                stroke="#40454d"
                strokeWidth="1.2"
              />
              <text
                x={x}
                y={padT + innerH + 18}
                textAnchor="middle"
                fill="#333d4b"
                fontSize="10"
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="700"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Main Axis Borders */}
        <line x1={padL} y1={padT} x2={padL} y2={padT + innerH} stroke="#333842" strokeWidth="1.5" />
        <line x1={padL} y1={padT + innerH} x2={padL + innerW} y2={padT + innerH} stroke="#333842" strokeWidth="1.5" />

        {/* Trajectory Shaded Bounds */}
        <path
          d={`${dUpper} L ${lastLower.x} ${lastLower.y} ${pointsLower.slice().reverse().reduce((acc, p) => `${acc} L ${p.x} ${p.y}`, "")} Z`}
          fill="rgba(2, 132, 199, 0.08)"
        />

        {/* Upper Bound Line (Blue Dash) */}
        <path d={dUpper} fill="none" stroke="#0284c7" strokeWidth="2.4" strokeDasharray="5 3" />

        {/* Lower Bound Line (Purple Dash) */}
        <path d={dLower} fill="none" stroke="#7c3aed" strokeWidth="2.4" strokeDasharray="5 3" />

        {/* Estimated RUL Line (Solid Orange) */}
        <path d={dEst} fill="none" stroke="#ea580c" strokeWidth="3.2" />

        {/* Line Terminal Marker Dots */}
        <circle cx={lastUpper.x} cy={lastUpper.y} r="3.5" fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
        <circle cx={lastLower.x} cy={lastLower.y} r="3.5" fill="#7c3aed" stroke="#ffffff" strokeWidth="1" />
        <circle cx={lastEst.x} cy={lastEst.y} r="4.5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5" />

        {/* Subtle connector paths to stacked badges */}
        <path
          d={`M ${lastUpper.x} ${lastUpper.y} L ${lastUpper.x + 8} ${upperBadgeY}`}
          fill="none"
          stroke="#0284c7"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity="0.8"
        />
        <path
          d={`M ${lastEst.x} ${lastEst.y} L ${lastEst.x + 8} ${estBadgeY}`}
          fill="none"
          stroke="#ea580c"
          strokeWidth="2"
          opacity="0.95"
        />
        <path
          d={`M ${lastLower.x} ${lastLower.y} L ${lastLower.x + 8} ${lowerBadgeY}`}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {/* 1. Upper Bound Badge (Blue) */}
        <g transform={`translate(${lastUpper.x + 8}, ${upperBadgeY - 11})`} filter="url(#badgeShadow)">
          <rect width="56" height="22" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="1.2" />
          <text x="28" y="15" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="'Share Tech Mono', monospace" fontWeight="900">
            {lastUpper.val} h
          </text>
        </g>

        {/* 2. Lower Bound Badge (Purple) */}
        <g transform={`translate(${lastLower.x + 8}, ${lowerBadgeY - 11})`} filter="url(#badgeShadow)">
          <rect width="56" height="22" rx="4" fill="#7c3aed" stroke="#6d28d9" strokeWidth="1.2" />
          <text x="28" y="15" textAnchor="middle" fill="#ffffff" fontSize="11" fontFamily="'Share Tech Mono', monospace" fontWeight="900">
            {lastLower.val} h
          </text>
        </g>

        {/* 3. Estimated RUL Badge (Orange - Primary Line Value Callout) */}
        <g transform={`translate(${lastEst.x + 8}, ${estBadgeY - 12})`} filter="url(#badgeShadow)">
          <rect width="58" height="24" rx="4" fill="#ea580c" stroke="#c2410c" strokeWidth="1.6" />
          <text x="29" y="16.5" textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="'Share Tech Mono', monospace" fontWeight="900">
            {lastEst.val} h
          </text>
        </g>

        {/* Bottom Legend */}
        <g transform={`translate(${padL + innerW / 2 - 215}, ${chartH - 10})`}>
          <line x1="0" y1="0" x2="22" y2="0" stroke="#0284c7" strokeWidth="2.6" strokeDasharray="4 2" />
          <text x="28" y="3.5" fill="#0369a1" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="0.2px">
            95% Upper Bound
          </text>

          <line x1="145" y1="0" x2="167" y2="0" stroke="#ea580c" strokeWidth="2.8" />
          <text x="173" y="3.5" fill="#9a3412" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="0.2px">
            Estimated RUL (h)
          </text>

          <line x1="295" y1="0" x2="317" y2="0" stroke="#7c3aed" strokeWidth="2.6" strokeDasharray="4 2" />
          <text x="323" y="3.5" fill="#581c87" fontSize="10" fontFamily="'Inter', sans-serif" fontWeight="900" letterSpacing="0.2px">
            95% Lower Bound
          </text>
        </g>
      </svg>
    </div>
  );
}

// ── Left Segmented Lime/Olive 3D RUL Meter ──────────────────
function EstimatedRulMeter({ value = 398 }) {
  return (
    <div className="rul-segmented-gauge-wrap" style={{ width: 136, height: 136, position: "relative" }}>
      <div 
        style={{
          position: "absolute",
          top: "14%",
          left: "14%",
          width: "72%",
          height: "72%",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, #1c2229 0%, #12161a 70%, #0a0d10 100%)",
          boxShadow: "inset 0 3px 6px rgba(0,0,0,0.85), 0 1px 2px rgba(255,255,255,0.12)",
          zIndex: 1,
        }}
      />
      
      <img
        src="/assets/meter_green_ring.png"
        alt="Estimated RUL Remaining Meter"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "relative",
          zIndex: 2,
          display: "block",
          pointerEvents: "none",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
        }}
      />

      <div 
        className="rul-gauge-inner-text"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <span className="rul-gauge-val-big">{value}</span>
        <span className="rul-gauge-unit-label">HOURS</span>
      </div>
    </div>
  );
}

// ── Right Segmented Flame Copper / Bronze 3D Confidence Meter ──
function ModelConfidenceMeter({ value = 84 }) {
  return (
    <div className="rul-segmented-gauge-wrap" style={{ width: 136, height: 136, position: "relative" }}>
      <div 
        style={{
          position: "absolute",
          top: "14%",
          left: "14%",
          width: "72%",
          height: "72%",
          borderRadius: "50%",
          background: "radial-gradient(circle at 50% 50%, #1c2229 0%, #12161a 70%, #0a0d10 100%)",
          boxShadow: "inset 0 3px 6px rgba(0,0,0,0.85), 0 1px 2px rgba(255,255,255,0.12)",
          zIndex: 1,
        }}
      />

      <img
        src="/assets/meter_orange_ring.png"
        alt="Ensemble Model Confidence Meter"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          position: "relative",
          zIndex: 2,
          display: "block",
          pointerEvents: "none",
          filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.45))",
        }}
      />

      <div 
        className="rul-gauge-inner-text"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <span className="rul-conf-val-big">{value}%</span>
      </div>
    </div>
  );
}

// ── Main RUL Prediction Page with Gemini AI Advisor ─────────
export default function RULPrediction({ telemetryData }) {
  const [liveData, setLiveData] = useState(telemetryData);

  // Gemini AI Advisor State
  const [issueType, setIssueType] = useState("PREDICTION_DISCREPANCY");
  const [customQuery, setCustomQuery] = useState("");
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);
  const [activeTab, setActiveTab] = useState("trajectory"); // "trajectory" | "stability" | "roadmap"

  useEffect(() => {
    if (telemetryData) {
      setLiveData(telemetryData);
    }
  }, [telemetryData]);

  useEffect(() => {
    fetch("http://localhost:8000/api/engine/live")
      .then((res) => res.json())
      .then((data) => {
        if (data) setLiveData((prev) => prev || data);
      })
      .catch(() => {});
  }, []);

  const currentData = liveData || telemetryData;
  const rulHours = currentData?.rul_hours ?? currentData?.ai_prediction?.rul_hours ?? 398.0;
  const rawConfidence = currentData?.confidence ?? currentData?.ai_prediction?.confidence ?? 0.84;
  const confidence = typeof rawConfidence === "number" && rawConfidence <= 1.0 ? rawConfidence : rawConfidence / 100.0;
  const healthScore = currentData?.health_score ?? 98.5;
  const nextServiceHours = Math.max(1, Math.round(rulHours % 50 === 0 ? 48 : rulHours % 50));

  // Dynamic maintenance task based on RUL window
  const maintenanceTask = rulHours < 60
    ? { title: "Urgent Top Overhaul & Valve Lap", text: `Critical remaining life. Schedule immediate cylinder head overhaul, compression test, and turbocharger inspection within` }
    : (rulHours < 160
      ? { title: "100-Hour Scheduled Inspection", text: `Inspect valve clearance, dual ignition spark plug gaps, and replace oil filter element within` }
      : { title: "50-Hour Standard Engine Service", text: `Perform standard oil change, cylinder borescope check, and fuel injector flow verification within` });

  // Function to Call Gemini API Diagnostic Advisor
  const handleCallGeminiAdvisor = async () => {
    setGeminiLoading(true);
    try {
      const res = await api.getGeminiRulAdvisor({
        issue_type: issueType,
        custom_query: customQuery || "Perform full chart-wise stability analysis and TBO extension maintenance protocol",
        current_rul: rulHours,
        confidence: confidence,
      });
      if (res && res.data) {
        setGeminiResult(res.data);
      }
    } catch (err) {
      console.error("Error calling Gemini advisor:", err);
    } finally {
      setGeminiLoading(false);
    }
  };

  // Format chart data for Gemini RUL Trajectory
  const geminiTrajectoryChartData = geminiResult?.rul_extension_trajectory
    ? geminiResult.rul_extension_trajectory.time_intervals.map((interval, idx) => ({
        time: interval,
        "Unmanaged Baseline": geminiResult.rul_extension_trajectory.unmanaged_baseline[idx],
        "Tier-1 Basic Service (+35h)": geminiResult.rul_extension_trajectory.tier1_service[idx],
        "Tier-2 Precision Tune (+85h)": geminiResult.rul_extension_trajectory.tier2_precision_tune[idx],
        "Optimal Aero Protocol (+160h)": geminiResult.rul_extension_trajectory.optimal_aero_protocol[idx],
      }))
    : [];

  // Format stability data for Gemini Bar Chart
  const geminiStabilityData = geminiResult?.stability_index
    ? [
        { name: "Thermal Stability", score: geminiResult.stability_index.thermal_stability, target: 100 },
        { name: "Combustion Uniformity", score: geminiResult.stability_index.combustion_uniformity, target: 100 },
        { name: "Vibration Damping", score: geminiResult.stability_index.vibration_damping, target: 100 },
        { name: "Lubrication Integrity", score: geminiResult.stability_index.lubrication_integrity, target: 100 },
        { name: "Fuel Flow Efficiency", score: geminiResult.stability_index.fuel_delivery_efficiency, target: 100 },
      ]
    : [];

  return (
    <div className="rul-hardware-page">
      {/* ── Top Header Banner with Corner Screws ──────────────── */}
      <div className="metal-casing-panel rul-top-banner">
        <CornerScrews />

        <div className="rul-breadcrumb-tag">
          <span style={{ fontWeight: 900 }}>&gt;&gt;</span> Dronanetra // RUL PREDICTION (SECTION 06)
        </div>

        <div className="rul-top-banner-main">
          <div className="rul-header-title-group">
            <div className="rul-header-icon-circle">
              <Clock size={24} color="#1e252d" strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="rul-banner-h2">REMAINING USEFUL LIFE (RUL) PROGNOSTICS (FR-07)</h2>
              <p className="rul-banner-p">Machine Learning RUL Models, Ensemble Prognostics &amp; Forecasted Degradation Bounds</p>
            </div>
          </div>

          <div className="rul-live-tag">
            <span className="rul-live-dot" /> AI-DRIVEN PROGNOSTICS
          </div>
        </div>
      </div>

      {/* ── Top Row: 3 Metric Panels ──────────────────────────── */}
      <div className="rul-three-col-grid">
        {/* Panel 1: Estimated RUL Remaining */}
        <div className="metal-casing-panel rul-metric-panel">
          <CornerScrews />
          <div className="rul-card-header">
            <div className="rul-card-title-left">
              <Hourglass size={15} color="#1e252d" strokeWidth={2.4} />
              <span>ESTIMATED RUL REMAINING</span>
            </div>
          </div>

          <div className="rul-card-body-split">
            <EstimatedRulMeter value={Math.round(rulHours)} />
            <div className="rul-metric-divider" />
            <div className="rul-metric-info-col">
              <div className="rul-metric-main-desc">Time Before</div>
              <div className="rul-metric-main-desc">Engine Overhaul</div>
              <div className="rul-metric-sub-desc">(TBO Baseline: 1,200 h)</div>
            </div>
          </div>
        </div>

        {/* Panel 2: Ensemble Model Confidence */}
        <div className="metal-casing-panel rul-metric-panel">
          <CornerScrews />
          <div className="rul-card-header">
            <div className="rul-card-title-left">
              <Shield size={15} color="#1e252d" strokeWidth={2.4} />
              <span>ENSEMBLE MODEL CONFIDENCE</span>
            </div>
          </div>

          <div className="rul-card-body-split">
            <ModelConfidenceMeter value={Math.round(confidence * 100)} />
            <div className="rul-metric-divider" />
            <div className="rul-metric-info-col">
              <div className="rul-metric-main-desc">Validated ML Model</div>
              <div className="rul-metric-main-desc">Confidence Interval</div>
            </div>
          </div>
        </div>

        {/* Panel 3: Recommended Maintenance Action */}
        <div className="metal-casing-panel rul-metric-panel">
          <CornerScrews />
          <div className="rul-card-header">
            <div className="rul-card-title-left">
              <Wrench size={15} color="#1e252d" strokeWidth={2.4} />
              <span>RECOMMENDED MAINTENANCE ACTION</span>
            </div>
          </div>

          <div className="rul-card-body-split">
            <div className="rul-tool-badge-box">
              <Wrench size={32} color="#fde047" strokeWidth={2.4} />
            </div>
            <div className="rul-action-desc-col">
              <div className="rul-action-title">{maintenanceTask.title}</div>
              <p className="rul-action-text">
                {maintenanceTask.text}{" "}
                <span className="rul-action-hours-highlight">{nextServiceHours} flight hours</span>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Forecasted Degradation Trajectory ──────── */}
      <div className="metal-casing-panel rul-metric-panel" style={{ padding: "1.1rem 1.4rem" }}>
        <CornerScrews />

        <div className="rul-card-header">
          <div className="rul-card-title-left">
            <TrendingUp size={16} color="#1e252d" strokeWidth={2.4} />
            <span>FORECASTED DEGRADATION TRAJECTORY &amp; 95% CONFIDENCE INTERVAL BOUNDS</span>
          </div>

          <button className="rul-forecast-pill-btn" type="button">
            <span>50-HOUR FORECAST</span>
            <ChevronDown size={14} color="#1e252d" />
          </button>
        </div>

        <div style={{ paddingTop: "0.6rem" }}>
          <DegradationTrajectoryChart baseRul={rulHours} healthScore={healthScore} trajectory={currentData?.rul_trajectory} />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           GEMINI AI RUL RECOVERY, STABILITY & CHART-WISE ADVISOR SECTION
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="metal-casing-panel gemini-advisor-panel">
        <CornerScrews />

        {/* Gemini Header */}
        <div className="gemini-panel-header">
          <div className="gemini-title-wrap">
            <div className="gemini-spark-circle">
              <Sparkles size={20} color="#00f2ff" />
            </div>
            <div>
              <div className="gemini-badge-line">
                <span className="gemini-tag">GEMINI 1.5 PRO / FLASH PROGNOSTICS</span>
                <span className="gemini-engine-badge">VRDE 180 HP BOXER</span>
              </div>
              <h3 className="gemini-heading">
                AI RUL Anomaly Diagnosis, Stability Optimization &amp; TBO Recovery Engine
              </h3>
              <p className="gemini-desc">
                If the RUL estimate appears anomalous or degraded, invoke Google Gemini to generate chart-wise stability indices, root-cause physics diagnostics, and a step-by-step TBO recovery roadmap.
              </p>
            </div>
          </div>

          <div className="gemini-sync-status">
            <span className="gemini-status-dot" />
            <span>AI DIAGNOSTIC ENGINE: ONLINE</span>
          </div>
        </div>

        {/* Gemini Query & Controls Bar */}
        <div className="gemini-control-strip">
          <div className="gemini-input-group">
            <label className="gemini-field-label">OBSERVED ANOMALY / DISCREPANCY TYPE:</label>
            <select 
              className="gemini-select-box"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option value="PREDICTION_DISCREPANCY">RUL Prediction Appears Inaccurate / Pessimistic</option>
              <option value="PREMATURE_DEGRADATION">Rapid RUL Degradation &amp; Excessive Wear</option>
              <option value="THERMAL_INSTABILITY">Elevated Cylinder Head (CHT) / EGT Thermal Choke</option>
              <option value="VIBRATION_ALERT">Harmonic Vibration &amp; Dynamic Crankshaft Imbalance</option>
              <option value="TBO_MAXIMIZATION">Proactive Maintenance Protocol to Maximize TBO (+160h)</option>
            </select>
          </div>

          <div className="gemini-input-group" style={{ flex: 1, minWidth: "240px" }}>
            <label className="gemini-field-label">ADDITIONAL OPERATOR QUERY / NOTES (OPTIONAL):</label>
            <input 
              type="text"
              className="gemini-text-input"
              placeholder="e.g. Provide optimal maintenance to stabilize CHT below 140°C and restore RUL above 450 hours"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
            />
          </div>

          <button 
            className={`gemini-trigger-btn ${geminiLoading ? 'loading' : ''}`}
            onClick={handleCallGeminiAdvisor}
            disabled={geminiLoading}
          >
            {geminiLoading ? (
              <>
                <RefreshCw size={15} className="spin-icon" />
                <span>DIAGNOSING ENGINE...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} color="#00f2ff" />
                <span>CALL GEMINI ADVISOR</span>
              </>
            )}
          </button>
        </div>

        {/* Gemini Results Content (Rendered upon response) */}
        {geminiResult ? (
          <div className="gemini-results-container">
            {/* 1. Diagnostic Summary Alert Box */}
            <div className="gemini-alert-card">
              <div className="gemini-alert-header">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Cpu size={18} color="#0284c7" />
                  <span className="gemini-alert-title">GEMINI AI ROOT-CAUSE ASSESSMENT</span>
                </div>
                <div className="gemini-model-pill">
                  {geminiResult.advisor_model || "Google Gemini 1.5 Flash"}
                </div>
              </div>
              <p className="gemini-alert-text">
                {geminiResult.diagnostic_summary}
              </p>
            </div>

            {/* View Selector Tabs */}
            <div className="gemini-tab-bar">
              <button 
                className={`gemini-tab-btn ${activeTab === 'trajectory' ? 'active' : ''}`}
                onClick={() => setActiveTab('trajectory')}
              >
                <TrendingUp size={14} />
                <span>CHART: RUL EXTENSION TRAJECTORY (+160h)</span>
              </button>
              <button 
                className={`gemini-tab-btn ${activeTab === 'stability' ? 'active' : ''}`}
                onClick={() => setActiveTab('stability')}
              >
                <Activity size={14} />
                <span>CHART: SUBSYSTEM STABILITY RADAR</span>
              </button>
              <button 
                className={`gemini-tab-btn ${activeTab === 'roadmap' ? 'active' : ''}`}
                onClick={() => setActiveTab('roadmap')}
              >
                <Wrench size={14} />
                <span>ACTIONABLE MAINTENANCE PROTOCOL</span>
              </button>
            </div>

            {/* TAB 1: RUL Extension Trajectory Chart */}
            {activeTab === 'trajectory' && (
              <div className="gemini-chart-card">
                <div className="gemini-chart-header">
                  <div>
                    <h4 className="gemini-chart-title">RUL Prognostic Extension Curve (Intervention vs Baseline)</h4>
                    <p className="gemini-chart-sub">Projected engine life extension over 50 flight hours across maintenance tiers</p>
                  </div>
                  <div className="gemini-gain-badge">
                    <ArrowUpRight size={15} /> MAX TBO GAIN: +{geminiResult.rul_extension_trajectory?.max_projected_gain_hours || 160} HOURS
                  </div>
                </div>

                <div style={{ height: "300px", width: "100%", marginTop: "0.75rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={geminiTrajectoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} />
                      <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid #38bdf8", borderRadius: "8px", color: "#f8fafc" }} />
                      <Legend />
                      <Line type="monotone" dataKey="Unmanaged Baseline" stroke="#ef4444" strokeWidth={2.2} strokeDasharray="4 4" dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Tier-1 Basic Service (+35h)" stroke="#eab308" strokeWidth={2.4} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Tier-2 Precision Tune (+85h)" stroke="#8b5cf6" strokeWidth={2.6} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Optimal Aero Protocol (+160h)" stroke="#10b981" strokeWidth={3.5} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 2: Subsystem Stability Bar / Radar Chart */}
            {activeTab === 'stability' && (
              <div className="gemini-chart-card">
                <div className="gemini-chart-header">
                  <div>
                    <h4 className="gemini-chart-title">Aero Engine Subsystem Stability Index (0 - 100%)</h4>
                    <p className="gemini-chart-sub">Physics-informed stability across thermodynamic, combustion, mechanical and fluid circuits</p>
                  </div>
                  <div className="gemini-stability-score-pill">
                    COMPOSITE STABILITY: {geminiResult.stability_index?.overall_composite_score}%
                  </div>
                </div>

                <div style={{ height: "280px", width: "100%", marginTop: "0.75rem" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={geminiStabilityData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: "#334155", fontSize: 11, fontWeight: 700 }} />
                      <YAxis dataKey="name" type="category" stroke="#64748b" width={180} tick={{ fill: "#1e293b", fontSize: 11, fontWeight: 800 }} />
                      <Tooltip contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid #38bdf8", borderRadius: "8px", color: "#f8fafc" }} />
                      <Bar dataKey="score" name="Subsystem Stability (%)" fill="#0284c7" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* TAB 3: Actionable Maintenance Protocol Roadmap */}
            {activeTab === 'roadmap' && (
              <div className="gemini-roadmap-grid">
                {geminiResult.maintenance_roadmap?.map((item, idx) => (
                  <div key={idx} className="gemini-task-card">
                    <div className="gemini-task-top">
                      <span className={`gemini-priority-badge ${item.priority.includes('CRITICAL') ? 'critical' : item.priority.includes('HIGH') ? 'high' : 'scheduled'}`}>
                        {item.priority}
                      </span>
                      <span className="gemini-gain-pill">
                        <ArrowUpRight size={13} /> {item.expected_rul_gain_hours}
                      </span>
                    </div>
                    <div className="gemini-task-system">{item.system}</div>
                    <div className="gemini-task-action">{item.action}</div>
                    <p className="gemini-task-proc">{item.procedure}</p>
                    <div className="gemini-task-status">
                      <CheckCircle2 size={13} color="#10b981" />
                      <span>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Target Operating Parameter Envelope */}
            {geminiResult.operating_envelope_recommendations && (
              <div className="gemini-envelope-strip">
                <div className="gemini-envelope-title">
                  <Gauge size={16} color="#0284c7" />
                  <span>GEMINI STABILITY OPERATING ENVELOPE:</span>
                </div>
                <div className="gemini-envelope-grid">
                  <div className="gemini-envelope-item">
                    <span className="envelope-label">CRUISE SWEETSPOT</span>
                    <span className="envelope-val">{geminiResult.operating_envelope_recommendations.optimal_cruise_rpm}</span>
                  </div>
                  <div className="gemini-envelope-item">
                    <span className="envelope-label">MAX CONT. CHT</span>
                    <span className="envelope-val">{geminiResult.operating_envelope_recommendations.max_continuous_cht}</span>
                  </div>
                  <div className="gemini-envelope-item">
                    <span className="envelope-label">PEAK CRUISE EGT</span>
                    <span className="envelope-val">{geminiResult.operating_envelope_recommendations.peak_cruise_egt}</span>
                  </div>
                  <div className="gemini-envelope-item">
                    <span className="envelope-label">NOMINAL OIL PRESSURE</span>
                    <span className="envelope-val">{geminiResult.operating_envelope_recommendations.nominal_oil_pressure}</span>
                  </div>
                  <div className="gemini-envelope-item">
                    <span className="envelope-label">MAX VIBRATION G</span>
                    <span className="envelope-val">{geminiResult.operating_envelope_recommendations.maximum_vibration_g}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="gemini-placeholder-box">
            <Sparkles size={32} color="#94a3b8" />
            <div className="gemini-placeholder-title">Select an anomaly scenario and click "CALL GEMINI ADVISOR"</div>
            <p className="gemini-placeholder-p">
              Google Gemini will process the live thermodynamic state, cylinder thermocouple balance, and degradation vectors to formulate a customized TBO maximization protocol.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
