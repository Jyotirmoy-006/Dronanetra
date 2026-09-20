import React, { useState, useEffect } from "react";
import { AlertTriangle, Calendar, Settings, Zap, BarChart3, ChevronRight, Activity, ShieldCheck, RefreshCw } from "lucide-react";
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

function MiniCornerScrews() {
  return (
    <>
      <div className="metal-screw mini-screw-tl" style={{ width: 7, height: 7 }} />
      <div className="metal-screw mini-screw-tr" style={{ width: 7, height: 7 }} />
      <div className="metal-screw mini-screw-bl" style={{ width: 7, height: 7 }} />
      <div className="metal-screw mini-screw-br" style={{ width: 7, height: 7 }} />
    </>
  );
}

// ── Multi-Class Horizontal 3D Cylinder Classifier Chart ─────
function HorizontalClassifierChart({ items = [], viewMode = "classes" }) {
  const isMultiClass = viewMode === "classes" && items.length > 3;
  const chartWidth = 470;
  const chartHeight = isMultiClass ? 225 : 195;
  const startX = isMultiClass ? 125 : 85;
  const maxBarWidth = isMultiClass ? 230 : 270;
  const baseYAxis = isMultiClass ? 204 : 162;
  const barH = isMultiClass ? 17 : 30;
  const capRx = isMultiClass ? 5 : 7;
  const ySpacing = isMultiClass ? 24 : 48;
  const yOffset = isMultiClass ? 10 : 14;

  const xTicks = [0, 25, 50, 75, 100];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: `${chartHeight}px`, overflow: "visible" }}>
        <defs>
          {/* Pantone 20-0176 TPM Green Glimmer / Normal Healthy */}
          <linearGradient id="emeraldHorizBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#3d5e3c" />
            <stop offset="18%"  stopColor="#5a8a58" />
            <stop offset="38%"  stopColor="#7aab78" />
            <stop offset="50%"  stopColor="#9ec99c" />
            <stop offset="62%"  stopColor="#7aab78" />
            <stop offset="82%"  stopColor="#5a8a58" />
            <stop offset="100%" stopColor="#3d5e3c" />
          </linearGradient>
          <linearGradient id="emeraldHorizCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#9ec99c" />
            <stop offset="50%"  stopColor="#7aab78" />
            <stop offset="100%" stopColor="#3d5e3c" />
          </linearGradient>


          {/* Matte Copper / Bronze Horizontal Cylinder Gradient */}
          <linearGradient id="copperHorizBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a2818" />
            <stop offset="25%" stopColor="#7d3e26" />
            <stop offset="50%" stopColor="#9e5538" />
            <stop offset="75%" stopColor="#7d3e26" />
            <stop offset="100%" stopColor="#5a2818" />
          </linearGradient>
          <linearGradient id="copperHorizCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9e5538" />
            <stop offset="60%" stopColor="#7d3e26" />
            <stop offset="100%" stopColor="#5a2818" />
          </linearGradient>

          {/* Matte Silver Steel Horizontal Cylinder Gradient */}
          <linearGradient id="silverHorizBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5563" />
            <stop offset="25%" stopColor="#6b7787" />
            <stop offset="50%" stopColor="#8c99a8" />
            <stop offset="75%" stopColor="#6b7787" />
            <stop offset="100%" stopColor="#4a5563" />
          </linearGradient>
          <linearGradient id="silverHorizCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8c99a8" />
            <stop offset="60%" stopColor="#6b7787" />
            <stop offset="100%" stopColor="#4a5563" />
          </linearGradient>

          {/* Matte Gold / Brass Horizontal Cylinder Gradient */}
          <linearGradient id="goldHorizBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#564019" />
            <stop offset="25%" stopColor="#7f6128" />
            <stop offset="50%" stopColor="#a8843c" />
            <stop offset="75%" stopColor="#7f6128" />
            <stop offset="100%" stopColor="#564019" />
          </linearGradient>
          <linearGradient id="goldHorizCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8843c" />
            <stop offset="60%" stopColor="#7f6128" />
            <stop offset="100%" stopColor="#564019" />
          </linearGradient>

          <filter id="horizCylShadow" x="-10%" y="-20%" width="130%" height="150%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="1.8" floodColor="rgba(0,0,0,0.24)" />
          </filter>
        </defs>

        {/* Vertical X-axis tick grid lines */}
        {xTicks.map((tick) => {
          const x = startX + (tick / 100) * maxBarWidth;
          return (
            <g key={tick}>
              <line x1={x} y1={8} x2={x} y2={baseYAxis} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              <line x1={x} y1={baseYAxis} x2={x} y2={baseYAxis + 4} stroke="#40454d" strokeWidth="1" />
              <text
                x={x}
                y={baseYAxis + 13}
                textAnchor="middle"
                fill="#4b5563"
                fontSize={isMultiClass ? "8.5" : "9"}
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="700"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-Axis Baseline & Y-Axis line */}
        <line x1={startX} y1={baseYAxis} x2={startX + maxBarWidth + 10} y2={baseYAxis} stroke="#40454d" strokeWidth="1.2" />
        <line x1={startX} y1={8} x2={startX} y2={baseYAxis} stroke="#40454d" strokeWidth="1.2" />

        {/* Horizontal 3D Cylinders */}
        {items.map((item, idx) => {
          const y = yOffset + idx * ySpacing;
          const clampedVal = Math.max(0, Math.min(100, item.value));
          const barLen = Math.max(6, (clampedVal / 100) * maxBarWidth);
          const endX = startX + barLen;

          return (
            <g key={idx}>
              {/* Category Label on Left */}
              <text
                x={startX - 8}
                y={y + barH / 2 + 3.5}
                textAnchor="end"
                fill="#1e2227"
                fontSize={isMultiClass ? "8.5" : "9.5"}
                fontFamily="'Inter', sans-serif"
                fontWeight={item.isDominant ? "900" : "700"}
              >
                {item.label}
              </text>
              <line x1={startX - 5} y1={y + barH / 2} x2={startX} y2={y + barH / 2} stroke="#40454d" strokeWidth="1" />

              {/* 3D Horizontal Cylinder */}
              <g filter="url(#horizCylShadow)">
                {/* Cylinder Horizontal Body */}
                <path
                  d={`M ${startX} ${y} 
                      L ${endX} ${y} 
                      L ${endX} ${y + barH} 
                      L ${startX} ${y + barH} 
                      Z`}
                  fill={item.gradBody}
                  stroke={item.strokeColor}
                  strokeWidth="0.5"
                />

                {/* Right End Half-Circle Face (Semi-Circle Cap) */}
                <path
                  d={`M ${endX} ${y} 
                      A ${capRx} ${barH / 2} 0 0 0 ${endX} ${y + barH} 
                      Z`}
                  fill={item.gradCap}
                  stroke={item.strokeColor}
                  strokeWidth="0.75"
                />
              </g>

              {/* Value Text on Right of Bar */}
              <text
                x={endX + (isMultiClass ? 8 : 10)}
                y={y + barH / 2 + (isMultiClass ? 3.5 : 4.5)}
                textAnchor="start"
                fill={item.valColor}
                fontSize={isMultiClass ? "10.5" : "12.5"}
                fontFamily="'Inter', sans-serif"
                fontWeight="900"
              >
                {clampedVal.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── SHAP Feature Importance 3D Cylindrical Vertical Chart ───
function ShapCylindricalChart({ features = [], selectedIdx = 0, onSelect }) {
  const chartWidth = 660;
  const chartHeight = 230;
  const baseY = 180;
  const topY = 24;
  const usableHeight = baseY - topY;
  const maxVal = 100;
  const barW = 56;
  const capRy = 7.5;

  const yTicks = [0, 25, 50, 75, 100];
  const xs = [42, 145, 248, 351, 454, 557];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "230px", overflow: "visible" }}>
        <defs>
          {/* Matte Vertical Copper / Bronze Cylinder */}
          <linearGradient id="shapCopperBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5a2818" />
            <stop offset="25%" stopColor="#7d3e26" />
            <stop offset="50%" stopColor="#9e5538" />
            <stop offset="75%" stopColor="#7d3e26" />
            <stop offset="100%" stopColor="#5a2818" />
          </linearGradient>
          <linearGradient id="shapCopperCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9e5538" />
            <stop offset="60%" stopColor="#7d3e26" />
            <stop offset="100%" stopColor="#5a2818" />
          </linearGradient>

          {/* Matte Vertical Silver Steel Cylinder */}
          <linearGradient id="shapSilverBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4a5563" />
            <stop offset="25%" stopColor="#6b7787" />
            <stop offset="50%" stopColor="#8c99a8" />
            <stop offset="75%" stopColor="#6b7787" />
            <stop offset="100%" stopColor="#4a5563" />
          </linearGradient>
          <linearGradient id="shapSilverCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8c99a8" />
            <stop offset="60%" stopColor="#6b7787" />
            <stop offset="100%" stopColor="#4a5563" />
          </linearGradient>

          {/* Matte Vertical Gold / Brass Cylinder */}
          <linearGradient id="shapGoldBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#564019" />
            <stop offset="25%" stopColor="#7f6128" />
            <stop offset="50%" stopColor="#a8843c" />
            <stop offset="75%" stopColor="#7f6128" />
            <stop offset="100%" stopColor="#564019" />
          </linearGradient>
          <linearGradient id="shapGoldCap" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8843c" />
            <stop offset="60%" stopColor="#7f6128" />
            <stop offset="100%" stopColor="#564019" />
          </linearGradient>

          <filter id="shapCylShadow" x="-20%" y="-15%" width="140%" height="135%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        {/* Horizontal Grid lines & Y-axis labels */}
        {yTicks.map((tick) => {
          const y = baseY - (tick / maxVal) * usableHeight;
          return (
            <g key={tick}>
              <line x1="38" y1={y} x2={chartWidth - 10} y2={y} stroke="rgba(0,0,0,0.15)" strokeWidth="0.8" />
              <text
                x="32"
                y={y + 3.5}
                textAnchor="end"
                fill="#555e6b"
                fontSize="9"
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="700"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-Axis Baseline */}
        <line x1="38" y1={baseY} x2={chartWidth - 10} y2={baseY} stroke="#40454d" strokeWidth="1.2" />

        {/* 6 Cylindrical Vertical Feature Bars */}
        {features.slice(0, 6).map((item, idx) => {
          const cx = xs[idx] + barW / 2;
          const x = xs[idx];
          const clamped = Math.max(0, Math.min(100, item.value));
          const valH = Math.max(5, (clamped / maxVal) * usableHeight);
          const y = baseY - valH;

          let bodyGrad = "url(#shapSilverBody)";
          let capGrad = "url(#shapSilverCap)";
          let strokeColor = "#334155";
          let capStroke = "#475569";

          if (item.grad === "copper" || item.value >= 30) {
            bodyGrad = "url(#shapCopperBody)";
            capGrad = "url(#shapCopperCap)";
            strokeColor = "#7c2d12";
            capStroke = "#9a3412";
          } else if (item.grad === "gold" || item.value >= 12) {
            bodyGrad = "url(#shapGoldBody)";
            capGrad = "url(#shapGoldCap)";
            strokeColor = "#78350f";
            capStroke = "#b45309";
          }

          const isSelected = selectedIdx === idx;

          return (
            <g
              key={idx}
              onClick={() => onSelect && onSelect(idx)}
              style={{ cursor: "pointer", opacity: selectedIdx != null && !isSelected ? 0.85 : 1 }}
            >
              {/* 3D Vertical Cylinder */}
              <g filter="url(#shapCylShadow)">
                {/* Cylinder Vertical Body */}
                <path
                  d={`M ${x} ${y} 
                      L ${x + barW} ${y} 
                      L ${x + barW} ${baseY} 
                      L ${x} ${baseY} 
                      Z`}
                  fill={bodyGrad}
                  stroke={strokeColor}
                  strokeWidth="0.5"
                />

                {/* Cylinder Top Half-Circle Face (Semi-Circle Cap) */}
                <path
                  d={`M ${x} ${y} 
                      A ${barW / 2} ${capRy} 0 0 0 ${x + barW} ${y} 
                      Z`}
                  fill={capGrad}
                  stroke={capStroke}
                  strokeWidth="0.75"
                />
              </g>

              {/* Top Numeric Label */}
              <text
                x={cx}
                y={y - 8}
                textAnchor="middle"
                fill="#111418"
                fontSize="10"
                fontFamily="'Inter', sans-serif"
                fontWeight="900"
              >
                {clamped.toFixed(1)}%
              </text>

              {/* Bottom Feature Name Label */}
              <text
                x={cx}
                y={baseY + 16}
                textAnchor="middle"
                fill="#1e2227"
                fontSize="8"
                fontFamily="'Inter', sans-serif"
                fontWeight="800"
              >
                {item.name}
              </text>

              {/* Selection Indicator Ring */}
              {isSelected && (
                <circle cx={cx} cy={baseY + 28} r={3.5} fill="#0284c7" stroke="#ffffff" strokeWidth="1" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Main Fault Detection Page ───────────────────────────────
export default function FaultDetection({ telemetryData, onInjectFault, currentFault = "NONE" }) {
  const [selectedFeatureIdx, setSelectedFeatureIdx] = useState(0);
  const [viewMode, setViewMode] = useState("classes"); // "classes" (8-Class ML Faults) | "severity" (3-Tier Severity)
  const [localTelemetry, setLocalTelemetry] = useState(null);
  const [isInjecting, setIsInjecting] = useState(false);

  // Fallback REST fetch if telemetryData prop not yet mounted
  useEffect(() => {
    if (!telemetryData) {
      api.getLiveTelemetry()
        .then((res) => {
          if (res) setLocalTelemetry(res);
        })
        .catch(() => {});
    }
  }, [telemetryData]);

  const activeTelemetry = telemetryData || localTelemetry;

  const faultStatus = activeTelemetry?.fault_status || "NORMAL";
  const rawProbs = activeTelemetry?.fault_probabilities || activeTelemetry?.ai_prediction?.fault_probabilities || {};

  // 1. 8-Class Failure Mode Probabilities from Dronanetra Random Forest Classifier (FR-06)
  const faultClassDefinitions = [
    { key: "NORMAL", label: "NORMAL / HEALTHY", desc: "Baseline Combustion", grad: "emerald", stroke: "#047857" },
    { key: "OVERHEATING", label: "OVERHEATING", desc: "Thermal Choke", grad: "copper", stroke: "#7c2d12" },
    { key: "MISFIRE", label: "MISFIRE", desc: "Combustion Instability", grad: "copper", stroke: "#7c2d12" },
    { key: "HIGH_VIBRATION", label: "HIGH VIBRATION", desc: "Dynamic Unbalance", grad: "gold", stroke: "#78350f" },
    { key: "FUEL_RESTRICTION", label: "FUEL RESTRICTION", desc: "Injector Clogging", grad: "gold", stroke: "#78350f" },
    { key: "SENSOR_DRIFT", label: "SENSOR DRIFT", desc: "Cross-Sensor Parity", grad: "silver", stroke: "#334155" },
    { key: "LUBRICATION_LOSS", label: "LUBRICATION LOSS", desc: "Oil Pressure Collapse", grad: "copper", stroke: "#7c2d12" },
    { key: "COOLING_LOSS", label: "COOLING LOSS", desc: "Coolant Jacket Boil", grad: "copper", stroke: "#7c2d12" },
  ];

  const classItems = faultClassDefinitions.map((fc) => {
    let p = 0;
    if (rawProbs[fc.key] != null && !isNaN(rawProbs[fc.key])) {
      p = Number(rawProbs[fc.key]);
      if (p <= 1.0) p *= 100;
    }

    let gradBody = "url(#silverHorizBody)";
    let gradCap = "url(#silverHorizCap)";
    let strokeColor = fc.stroke;
    let valColor = "#000000";

    if (fc.grad === "emerald" || (p > 50 && fc.key === "NORMAL")) {
      gradBody = "url(#emeraldHorizBody)";
      gradCap = "url(#emeraldHorizCap)";
      strokeColor = "#047857";
      valColor = "#047857";
    } else if (fc.grad === "copper" || p > 40) {
      gradBody = "url(#copperHorizBody)";
      gradCap = "url(#copperHorizCap)";
      strokeColor = "#7c2d12";
      valColor = p > 50 ? "#b91c1c" : "#7c2d12";
    } else if (fc.grad === "gold" || p > 15) {
      gradBody = "url(#goldHorizBody)";
      gradCap = "url(#goldHorizCap)";
      strokeColor = "#78350f";
      valColor = "#78350f";
    }

    return {
      label: fc.label,
      value: p,
      gradBody,
      gradCap,
      strokeColor,
      valColor,
      isDominant: p > 50,
    };
  });

  // Sort descending so active highest probability fault is at top
  classItems.sort((a, b) => b.value - a.value);

  // 2. 3-Tier Severity Ensemble (CRITICAL, HEALTHY, WARNING)
  const getSevVal = (key) => {
    if (rawProbs[key] != null && !isNaN(rawProbs[key])) {
      const v = Number(rawProbs[key]);
      return v <= 1.0 ? v * 100 : v;
    }
    return 0;
  };

  const critVal = getSevVal("CRITICAL");
  const healthVal = getSevVal("HEALTHY");
  const warnVal = getSevVal("WARNING");

  const severityItems = [
    {
      label: "CRITICAL",
      value: critVal,
      gradBody: "url(#copperHorizBody)",
      gradCap: "url(#copperHorizCap)",
      strokeColor: "#7c2d12",
      valColor: "#b91c1c",
      isDominant: critVal > 50,
    },
    {
      label: "HEALTHY",
      value: healthVal,
      gradBody: "url(#silverHorizBody)",
      gradCap: "url(#silverHorizCap)",
      strokeColor: "#334155",
      valColor: "#047857",
      isDominant: healthVal > 50,
    },
    {
      label: "WARNING",
      value: warnVal,
      gradBody: "url(#goldHorizBody)",
      gradCap: "url(#goldHorizCap)",
      strokeColor: "#78350f",
      valColor: "#b45309",
      isDominant: warnVal > 50,
    },
  ];

  const activeClassifierItems = viewMode === "classes" ? classItems : severityItems;

  // 3. Dynamic SHAP Feature Attribution from Backend (FR-08)
  const explanation = activeTelemetry?.explanation || {
    primary_driver: "Nominal Operation",
    primary_subsystem: "All Systems Nominal",
    explanation: "Nominal operating parameters across all engine sub-systems. Telemetry adheres to thermodynamic baseline.",
  };

  const rawContributions = activeTelemetry?.explanation?.feature_contributions;

  const shapFeatures = (Array.isArray(rawContributions) && rawContributions.length > 0)
    ? rawContributions.slice(0, 6).map((item, idx) => {
        const val = typeof item.impact === "number" ? item.impact : parseFloat(item.impact) || 0;
        let impactLevel = "Negligible";
        if (val >= 35) impactLevel = "High";
        else if (val >= 15) impactLevel = "Moderate";
        else if (val >= 5) impactLevel = "Low";

        let grad = "silver";
        if (val >= 30 || item.feature?.toLowerCase().includes("temp") || idx === 0) grad = "copper";
        else if (val >= 12 || idx % 2 === 1) grad = "gold";

        const isDiverging = (activeTelemetry?.anomaly_score || 0) > 0.3 && val > 20;

        return {
          name: item.feature,
          value: Math.round(val * 10) / 10,
          unit: item.unit || "",
          subsystem: item.subsystem || "Engine Core",
          impact: impactLevel,
          trend: isDiverging ? "Elevated / Diverging" : "Stable",
          grad,
        };
      })
    : [];

  const selectedFeature = shapFeatures[selectedFeatureIdx] || shapFeatures[0] || {
    name: "Live Engine Core Telemetry",
    value: 0,
    unit: "",
    subsystem: "Engine Core",
    impact: "Nominal",
    trend: "Stable",
  };

  const handleInject = async (faultType) => {
    setIsInjecting(true);
    try {
      if (onInjectFault) {
        await onInjectFault(faultType);
      } else {
        await api.injectFault(faultType);
      }
    } catch (err) {
      console.error("Fault injection failed", err);
    } finally {
      setTimeout(() => setIsInjecting(false), 500);
    }
  };

  return (
    <div className="fault-hardware-page">
      {/* ── Top Header Banner with Corner Screws ──────────────── */}
      <div className="metal-casing-panel fault-top-banner">
        <CornerScrews />
        
        {/* Top Breadcrumb Badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="breadcrumb-section-badge">
            <span style={{ color: "#475569", marginRight: "4px" }}>❖</span> Dronanetra // FAULT DETECTION (SECTION 05)
          </span>
        </div>

        {/* Main Title Row */}
        <div className="fault-top-banner-main">
          <div className="fault-header-title-group">
            <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={26} color="#1e252d" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="fault-banner-h2">AI FAULT DETECTION &amp; MULTI-CLASS CLASSIFIER (FR-06)</h2>
              <p className="fault-banner-p">Machine Learning Fault Probabilities &amp; Explainable AI Feature Contribution (SHAP Proxy - FR-08)</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
            <div className="fault-live-badge">
              <span className="pulse-dot-green" /> LIVE TELEMETRY STREAMING
            </div>
          </div>
        </div>
      </div>

      {/* ── Top Row: 2-Column Grid ────────────────────────────── */}
      <div className="fault-two-col-grid">
        {/* Panel 1: Multi-Class Fault Classifier Probabilities */}
        <div className="metal-casing-panel fault-card-panel">
          <CornerScrews />
          
          <div className="fault-card-header">
            <div className="fault-card-title-left">
              <Calendar size={16} color="#1e252d" />
              <span>MULTI-CLASS FAULT CLASSIFIER PROBABILITIES</span>
            </div>
            
            {/* Interactive Mode Toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <button
                className={`fault-mode-tab-btn ${viewMode === "classes" ? "active" : ""}`}
                onClick={() => setViewMode("classes")}
                title="Display 8 ML Failure Modes classified by Random Forest model"
              >
                8-CLASS MODES
              </button>
              <button
                className={`fault-mode-tab-btn ${viewMode === "severity" ? "active" : ""}`}
                onClick={() => setViewMode("severity")}
                title="Display 3-Tier Severity breakdown (Critical, Healthy, Warning)"
              >
                3-TIER SEVERITY
              </button>
            </div>
          </div>

          <div style={{ padding: "0.4rem 0" }}>
            <HorizontalClassifierChart items={activeClassifierItems} viewMode={viewMode} />
          </div>
        </div>

        {/* Panel 2: Active Diagnostics & Root Cause Analysis */}
        <div className="metal-casing-panel fault-card-panel">
          <CornerScrews />
          
          <div className="fault-card-header">
            <div className="fault-card-title-left">
              <Settings size={16} color="#1e252d" />
              <span>ACTIVE DIAGNOSTICS &amp; ROOT CAUSE ANALYSIS</span>
            </div>
            <Zap size={16} color="#1e252d" />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", padding: "0.3rem 0" }}>
            {/* Active State Bezel Box */}
            <div className="fault-state-alert-box">
              <div className="fault-state-text-col">
                <div 
                  className="fault-state-title" 
                  style={{ 
                    color: faultStatus === "NORMAL" ? "#15803d" : (faultStatus === "CRITICAL" || faultStatus === "OVERHEATING" || faultStatus === "MISFIRE" || faultStatus === "LUBRICATION_LOSS" ? "#b91c1c" : "#b45309") 
                  }}
                >
                  STATE: {faultStatus === "NORMAL" ? "NOMINAL" : faultStatus}
                </div>
                <div className="fault-state-driver">
                  Primary Anomaly Driver: <span>{explanation.primary_driver || "Nominal Operation"}</span>
                </div>
              </div>
            </div>

            {/* Explainable AI LCD Summary Box */}
            <div className="fault-ai-lcd-box">
              <MiniCornerScrews />
              <div className="fault-ai-lcd-title">EXPLAINABLE AI SUMMARY (LIVE BACKEND PROXY):</div>
              <p className="fault-ai-lcd-text">
                {explanation.explanation || (
                  <>
                    Nominal operating parameters across all engine sub-systems.<br />
                    Telemetry adheres to thermodynamic baseline.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Row: SHAP Feature Importance Breakdown ─────── */}
      <div className="metal-casing-panel fault-card-panel">
        <CornerScrews />
        
        <div className="fault-card-header">
          <div className="fault-card-title-left">
            <BarChart3 size={16} color="#1e252d" />
            <span>EXPLAINABLE AI (SHAP FEATURE IMPORTANCE BREAKDOWN - FR-08)</span>
          </div>
          <span className="fault-card-tag-right">PERCENTAGE IMPACT (LIVE THERMODYNAMIC ATTRIBUTION)</span>
        </div>

        <div className="fault-shap-split">
          {/* Main 3D Cylindrical Vertical Chart */}
          <ShapCylindricalChart 
            features={shapFeatures} 
            selectedIdx={selectedFeatureIdx} 
            onSelect={setSelectedFeatureIdx} 
          />

          {/* Inset Floating Dark Feature Detail HUD Card */}
          <div className="shap-detail-hud-card">
            <MiniCornerScrews />
            <div className="shap-detail-header">
              <span style={{ color: "#ffffff", fontSize: "0.85rem" }}>■</span> SELECTED FEATURE DETAIL
            </div>

            <div className="shap-detail-table">
              <div className="shap-detail-row">
                <span className="shap-detail-label">Feature Name</span>
                <span className="shap-detail-val">: {selectedFeature.name}</span>
              </div>
              <div className="shap-detail-row">
                <span className="shap-detail-label">SHAP Contribution %</span>
                <span className="shap-detail-val" style={{ color: selectedFeature.value > 25 ? "#f87171" : "#38bdf8", fontWeight: 900 }}>
                  : {selectedFeature.value.toFixed(1)}%
                </span>
              </div>
              <div className="shap-detail-row">
                <span className="shap-detail-label">Subsystem</span>
                <span className="shap-detail-val">: {selectedFeature.subsystem || "Engine Core"}</span>
              </div>
              <div className="shap-detail-row">
                <span className="shap-detail-label">Impact Severity</span>
                <span className="shap-detail-val" style={{ color: selectedFeature.impact === "High" ? "#ef4444" : (selectedFeature.impact === "Moderate" ? "#f59e0b" : "#10b981") }}>
                  : {selectedFeature.impact}
                </span>
              </div>
              <div className="shap-detail-row">
                <span className="shap-detail-label">Operating Trend</span>
                <span className="shap-detail-val">: {selectedFeature.trend}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Interactive Fault Simulation Testbench Bar ───────────── */}
      <div className="metal-casing-panel fault-testbench-bar" style={{ marginTop: "0.3rem" }}>
        <CornerScrews />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Activity size={16} color="#0284c7" />
            <span style={{ fontSize: "0.76rem", fontFamily: "'Share Tech Mono', monospace", fontWeight: 900, color: "#0f172a", letterSpacing: "0.6px" }}>
              HARDWARE-IN-THE-LOOP FAULT INJECTION (ISP #2 TESTBENCH):
            </span>
            <span style={{ fontSize: "0.72rem", fontFamily: "'Inter', sans-serif", fontWeight: 700, color: "#475569" }}>
              Active State: <span style={{ color: currentFault === "NONE" ? "#15803d" : "#b91c1c", fontWeight: 900 }}>{currentFault}</span>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
            {[
              { id: "NONE", label: "NOMINAL (RESET)" },
              { id: "OVERHEATING", label: "OVERHEATING" },
              { id: "MISFIRE", label: "MISFIRE" },
              { id: "HIGH_VIBRATION", label: "HIGH VIBRATION" },
              { id: "FUEL_RESTRICTION", label: "FUEL CHOKE" },
              { id: "LUBRICATION_LOSS", label: "OIL PRESSURE LOSS" },
            ].map((f) => {
              const isActive = currentFault === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => handleInject(f.id)}
                  disabled={isInjecting}
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "0.68rem",
                    fontWeight: 800,
                    padding: "0.3rem 0.65rem",
                    borderRadius: "4px",
                    border: isActive ? "1.5px solid #0f172a" : "1px solid rgba(0,0,0,0.22)",
                    background: isActive 
                      ? (f.id === "NONE" ? "#dcfce7" : "#fee2e2") 
                      : "linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%)",
                    color: isActive 
                      ? (f.id === "NONE" ? "#166534" : "#991b1b") 
                      : "#1e293b",
                    cursor: "pointer",
                    boxShadow: isActive 
                      ? "inset 0 1px 3px rgba(0,0,0,0.2)" 
                      : "0 1px 2px rgba(0,0,0,0.08)",
                    opacity: isInjecting ? 0.7 : 1,
                    transition: "all 0.15s ease",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
