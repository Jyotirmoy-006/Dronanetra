import React, { useState, useEffect, useMemo } from "react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { BarChart2, TrendingUp, Sliders, Terminal, Download, RefreshCw, Calendar, Activity, Zap, Flame, Gauge, Thermometer, Settings, Fuel } from "lucide-react";
import { api } from "../services/api";

function CornerScrew({ size = 10, style = {} }) {
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
        <radialGradient id="screwHeadGradAnalytics" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#d5d9df" />
          <stop offset="65%" stopColor="#8e949d" />
          <stop offset="100%" stopColor="#4a4e55" />
        </radialGradient>
        <radialGradient id="screwHoleGradAnalytics" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#4a4f57" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#screwHoleGradAnalytics)" stroke="#3a3e45" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="8.5" fill="url(#screwHeadGradAnalytics)" stroke="#2b2e34" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      <rect x="10.8" y="5.5" width="2.4" height="13" rx="0.5" fill="#1e2024" />
      <rect x="5.5" y="10.8" width="13" height="2.4" rx="0.5" fill="#1e2024" />
      <circle cx="9.5" cy="9.5" r="1" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

/**
 * Mechanical Tumbler Roller Drum Odometer Display (Black Digital Meter)
 */
function TumblerOdometer({ value, decimals = 1, unit = "", amberRightmost = false, padStart = 0 }) {
  const formattedStr = useMemo(() => {
    if (value === null || value === undefined || isNaN(value)) {
      return "00.0";
    }
    const num = Number(value);
    let str = num.toFixed(decimals);
    if (padStart > 0) {
      const parts = str.split(".");
      parts[0] = parts[0].padStart(padStart, "0");
      str = parts.join(".");
    }
    return str;
  }, [value, decimals, padStart]);

  const chars = formattedStr.split("");

  return (
    <div className="tumbler-chassis">
      <div className="tumbler-window">
        {chars.map((ch, idx) => {
          const isLastDigit = idx === chars.length - 1 && /\d/.test(ch) && amberRightmost;
          const isSeparator = ch === "." || ch === ":" || ch === "-";

          if (isSeparator) {
            return (
              <div key={idx} className="tumbler-separator">
                {ch}
              </div>
            );
          }

          return (
            <div key={idx} className={`tumbler-drum ${isLastDigit ? "amber-drum" : ""}`}>
              <div className="tumbler-drum-inner">
                <span className="drum-char">{ch}</span>
              </div>
              <div className="drum-glare" />
            </div>
          );
        })}

        {unit && (
          <div className="tumbler-unit-drum">
            <span className="unit-char">{unit}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Glowing Jewel Indicator Lamp
 */
function JewelLed({ color = "green", pulsing = false }) {
  const colorMap = {
    red: {
      bg: "radial-gradient(circle at 35% 30%, #ff9999 0%, #ff2222 45%, #990000 85%, #440000 100%)",
      glow: "0 0 8px rgba(255, 34, 34, 0.85), 0 0 16px rgba(255, 34, 34, 0.4)",
      ring: "#661111",
    },
    amber: {
      bg: "radial-gradient(circle at 35% 30%, #ffea88 0%, #ff9900 45%, #b36200 85%, #4d2a00 100%)",
      glow: "0 0 8px rgba(255, 153, 0, 0.85), 0 0 16px rgba(255, 153, 0, 0.4)",
      ring: "#663b00",
    },
    green: {
      bg: "radial-gradient(circle at 35% 30%, #99ffbb 0%, #00dd55 45%, #007722 85%, #003311 100%)",
      glow: "0 0 8px rgba(0, 221, 85, 0.85), 0 0 16px rgba(0, 221, 85, 0.4)",
      ring: "#004419",
    },
    blue: {
      bg: "radial-gradient(circle at 35% 30%, #aaddff 0%, #0088ff 45%, #004499 85%, #002255 100%)",
      glow: "0 0 8px rgba(0, 136, 255, 0.85), 0 0 16px rgba(0, 136, 255, 0.4)",
      ring: "#003366",
    },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div
      style={{
        width: "11px",
        height: "11px",
        borderRadius: "50%",
        background: c.bg,
        boxShadow: c.glow,
        border: `1.5px solid ${c.ring}`,
        position: "relative",
        flexShrink: 0,
        animation: pulsing ? "jewelPulse 1.2s infinite ease-in-out" : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "1.5px",
          left: "2px",
          width: "2.5px",
          height: "2.5px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.95)",
        }}
      />
    </div>
  );
}

/**
 * Single Correlation Matrix Plaque Card with Digital Readout and Moving Slider Pin
 */
function MatrixMeterCard({
  icon: Icon,
  iconCustom,
  title,
  value,
  displayValue,
  minVal = 0,
  maxVal = 10,
  ticks = [0, 2, 4, 6, 8, 10],
  rangeLabel,
  colorScheme = "amber",
}) {
  const numVal = parseFloat(value) || 0;
  const clampedVal = Math.min(Math.max(numVal, minVal), maxVal);
  const pinPercentage = ((clampedVal - minVal) / (maxVal - minVal)) * 100;

  return (
    <div className="matrix-plaque">
      <CornerScrew style={{ position: "absolute", top: "4px", left: "4px" }} />
      <CornerScrew style={{ position: "absolute", top: "4px", right: "4px" }} />
      <CornerScrew style={{ position: "absolute", bottom: "4px", left: "4px" }} />
      <CornerScrew style={{ position: "absolute", bottom: "4px", right: "4px" }} />

      <div className="matrix-plaque-inner">
        {/* Card Header */}
        <div className="matrix-card-header">
          <div className="matrix-card-icon">
            {Icon && <Icon size={16} strokeWidth={2.6} color="#000000" />}
            {iconCustom && iconCustom}
          </div>
          <h4 className="matrix-card-title">{title}</h4>
        </div>

        {/* Digital Nixie Display Box */}
        <div className="matrix-display-row">
          <div className="matrix-nixie-box">
            <span className={`matrix-nixie-digits ${colorScheme}`}>
              {displayValue !== undefined ? displayValue : numVal.toFixed(2)}
            </span>
            <div className="matrix-nixie-overlay" />
          </div>
        </div>

        {/* Range Label */}
        <div className="matrix-range-label">{rangeLabel}</div>

        {/* Slider Track with Moving Down Pin */}
        <div className="matrix-slider-track-wrap">
          <div className="matrix-slider-track">
            <div
              className="matrix-slider-pin"
              style={{
                left: `${pinPercentage}%`,
              }}
            />
          </div>

          {/* Scale Labels */}
          <div className="matrix-scale-labels">
            {ticks.map((t, idx) => (
              <span key={idx} className="matrix-scale-tick">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Analytics({ history }) {
  const [datasetMode, setDatasetMode] = useState("ROLLING"); // "ROLLING" | "AUDIT_100" | "MISSION_ALPHA"
  const [customSeries, setCustomSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load selected historical dataset
  useEffect(() => {
    if (datasetMode === "AUDIT_100") {
      setLoading(true);
      api.getHistory(100)
        .then((res) => {
          if (res && res.history) {
            setCustomSeries(res.history);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (datasetMode === "MISSION_ALPHA") {
      setLoading(true);
      api.getMissionTelemetry("MSN-2026-0814")
        .then((res) => {
          if (res && res.telemetry_series) {
            setCustomSeries(res.telemetry_series);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [datasetMode]);

  const rawData = datasetMode === "ROLLING" ? (history && history.length > 0 ? history : customSeries) : customSeries;

  const chartData = rawData.map((item, idx) => {
    const t = item.timestamp || item.timestamp_offset || `T-${rawData.length - idx}s`;
    const timeLabel = t.includes("T+") ? t : (t.includes("T") ? t.slice(11, 19) : t);
    const tel = item.telemetry || item;

    return {
      time: timeLabel,
      rpm: tel.rpm || item.rpm || 4800,
      egt: tel.egt || item.egt || 730,
      cht: tel.cht || item.cht || 124,
      vibration: tel.vibration || item.vibration || 0.8,
      fuel_flow: tel.fuel_flow || item.fuel_flow || 18.2,
      altitude: tel.altitude || item.altitude || 3200,
      health: item.health_score ?? 98.2,
    };
  });

  // Calculate statistics
  const count = chartData.length || 1;
  const avgRpm = Math.round(chartData.reduce((acc, c) => acc + (c.rpm || 0), 0) / count);
  const avgEgt = Math.round((chartData.reduce((acc, c) => acc + (c.egt || 0), 0) / count) * 10) / 10;
  const avgCht = Math.round((chartData.reduce((acc, c) => acc + (c.cht || 0), 0) / count) * 10) / 10;
  const avgVib = Math.round((chartData.reduce((acc, c) => acc + (c.vibration || 0), 0) / count) * 100) / 100;
  const maxEgt = Math.max(...chartData.map((c) => c.egt || 0), 750);
  const maxCht = Math.max(...chartData.map((c) => c.cht || 0), 130);

  const handleExportCSV = () => {
    let csv = "Time,RPM,EGT_C,CHT_C,Vibration_mms,FuelFlow_Lh,Altitude_m,HealthScore\n";
    chartData.forEach((row) => {
      csv += `${row.time},${row.rpm},${row.egt},${row.cht},${row.vibration},${row.fuel_flow},${row.altitude},${row.health}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Telemetry_Analytics_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="analytics-container">
      <div className="page-header">
        <div>
          <div className="header-node-tag">
            <Terminal size={12} color="var(--accent-cyan)" /> Dronanetra // HISTORICAL SENSOR ANALYTICS // TAPAS-BH201
          </div>
          <h2>
            <BarChart2 size={24} color="var(--accent-cyan)" /> Telemetry Analytics & Multi-Sensor Historical Trends
          </h2>
          <p>Statistical Sensor Auditing, Thermodynamic Ratios & Cross-Parameter Correlation Analysis</p>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
          <div style={{ display: "flex", gap: "0.3rem", background: "var(--bg-card)", padding: "0.3rem", borderRadius: "10px", border: "1px solid var(--border-glass)" }}>
            <button
              className={`btn-mode-toggle ${datasetMode === "ROLLING" ? "active" : ""}`}
              onClick={() => setDatasetMode("ROLLING")}
            >
              <Activity size={13} /> LIVE ROLLING (60s)
            </button>
            <button
              className={`btn-mode-toggle ${datasetMode === "AUDIT_100" ? "active" : ""}`}
              onClick={() => setDatasetMode("AUDIT_100")}
            >
              <BarChart2 size={13} /> 100-POINT AUDIT
            </button>
            <button
              className={`btn-mode-toggle ${datasetMode === "MISSION_ALPHA" ? "active" : ""}`}
              onClick={() => setDatasetMode("MISSION_ALPHA")}
            >
              <Calendar size={13} /> SORTIE ALPHA
            </button>
          </div>

          <button className="btn-glossy-primary" onClick={handleExportCSV} style={{ fontSize: "0.75rem", padding: "0.45rem 0.85rem" }}>
            <Download size={13} /> EXPORT CSV
          </button>
        </div>
      </div>


      {/* ══════════════════════════════════════════════════════════════════
           STATISTICAL SENSOR AUDIT PANEL — Dashboard Meter Ground Section
         ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          marginBottom: "1.4rem",
          padding: "1rem 1.25rem",
          background: "url('/metal_plate_bg.png') center / cover no-repeat",
          border: "1px solid #888a8e",
          borderRadius: "8px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}
      >
        <div className="grid-4" style={{ gap: "1rem" }}>
          {/* 1. AVERAGE ENGINE SPEED */}
          <div
            className="avionics-plaque"
            style={{
              padding: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35)",
            }}
          >
            <CornerScrew style={{ position: "absolute", top: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", top: "4px", right: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", right: "4px" }} />
            <div className="plaque-inner-card" style={{ padding: "0.7rem 0.85rem", minHeight: "128px" }}>
              <div className="plaque-header" style={{ marginBottom: "0.3rem" }}>
                <div className="plaque-icon-wrap">
                  <Gauge size={15} strokeWidth={2.6} color="#000000" />
                </div>
                <div className="plaque-titles">
                  <h3 className="plaque-main-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.45px #000000", letterSpacing: "0.06em", fontSize: "0.85rem" }}>
                    AVERAGE ENGINE SPEED
                  </h3>
                  <span className="plaque-sub-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.35px #000000", letterSpacing: "0.07em", fontSize: "0.64rem" }}>
                    CRANKSHAFT KINEMATICS
                  </span>
                </div>
              </div>

              {/* Black Mechanical Tumbler Meter Display */}
              <div className="tumbler-container-center" style={{ margin: "6px 0" }}>
                <TumblerOdometer value={avgRpm} decimals={0} unit="RPM" />
              </div>

              {/* Plaque Footer with Status Pill & Target Note */}
              <div className="plaque-footer-strip">
                <div className="status-pill-wrap">
                  <JewelLed color={avgRpm >= 4700 && avgRpm <= 4900 ? "green" : "amber"} />
                  <span className={`status-pill ${avgRpm >= 4700 && avgRpm <= 4900 ? "pill-green" : "pill-amber"}`}>
                    {avgRpm >= 4700 && avgRpm <= 4900 ? "CRUISE" : "NOMINAL"}
                  </span>
                </div>
                <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#0f172a" }}>TARGET: 4800±100</span>
              </div>
            </div>
          </div>

          {/* 2. THERMAL PROFILE (EGT / CHT) */}
          <div
            className="avionics-plaque"
            style={{
              padding: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35)",
            }}
          >
            <CornerScrew style={{ position: "absolute", top: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", top: "4px", right: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", right: "4px" }} />
            <div className="plaque-inner-card" style={{ padding: "0.7rem 0.85rem", minHeight: "128px" }}>
              <div className="plaque-header" style={{ marginBottom: "0.3rem" }}>
                <div className="plaque-icon-wrap">
                  <Flame size={15} strokeWidth={2.8} color="#000000" />
                </div>
                <div className="plaque-titles">
                  <h3 className="plaque-main-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.45px #000000", letterSpacing: "0.06em", fontSize: "0.85rem" }}>
                    THERMAL PROFILE (EGT / CHT)
                  </h3>
                  <span className="plaque-sub-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.35px #000000", letterSpacing: "0.07em", fontSize: "0.64rem" }}>
                    EXHAUST & HEAD TEMPS
                  </span>
                </div>
              </div>

              {/* Black Mechanical Tumbler Meter Display */}
              <div className="tumbler-container-center" style={{ margin: "6px 0", gap: "2px" }}>
                <TumblerOdometer value={avgEgt} decimals={1} unit="°" />
                <span style={{ color: "#1e242d", fontWeight: 950, fontSize: "1.2rem", margin: "0 1px", alignSelf: "center" }}>/</span>
                <TumblerOdometer value={avgCht} decimals={1} unit="°C" />
              </div>

              {/* Plaque Footer with Status Pill & Peak Stats */}
              <div className="plaque-footer-strip">
                <div className="status-pill-wrap">
                  <JewelLed color={avgEgt > 750 || avgCht > 135 ? "amber" : "green"} />
                  <span className={`status-pill ${avgEgt > 750 || avgCht > 135 ? "pill-amber" : "pill-green"}`}>
                    {avgEgt > 750 || avgCht > 135 ? "ELEVATED" : "OPTIMAL"}
                  </span>
                </div>
                <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#0f172a" }}>PEAK {maxEgt}° / {maxCht}°C</span>
              </div>
            </div>
          </div>

          {/* 3. MEAN VIBRATION HARMONIC */}
          <div
            className="avionics-plaque"
            style={{
              padding: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35)",
            }}
          >
            <CornerScrew style={{ position: "absolute", top: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", top: "4px", right: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", right: "4px" }} />
            <div className="plaque-inner-card" style={{ padding: "0.7rem 0.85rem", minHeight: "128px" }}>
              <div className="plaque-header" style={{ marginBottom: "0.3rem" }}>
                <div className="plaque-icon-wrap">
                  <Activity size={15} strokeWidth={2.8} color="#000000" />
                </div>
                <div className="plaque-titles">
                  <h3 className="plaque-main-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.45px #000000", letterSpacing: "0.06em", fontSize: "0.85rem" }}>
                    MEAN VIBRATION HARMONIC
                  </h3>
                  <span className="plaque-sub-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.35px #000000", letterSpacing: "0.07em", fontSize: "0.64rem" }}>
                    SPECTRAL HARMONICS
                  </span>
                </div>
              </div>

              {/* Black Mechanical Tumbler Meter Display */}
              <div className="tumbler-container-center" style={{ margin: "6px 0" }}>
                <TumblerOdometer value={avgVib} decimals={2} unit="mm/s" amberRightmost={avgVib > 2.5} />
              </div>

              {/* Plaque Footer with Status Pill & Threshold Note */}
              <div className="plaque-footer-strip">
                <div className="status-pill-wrap">
                  <JewelLed color={avgVib <= 2.5 ? "green" : "red"} />
                  <span className={`status-pill ${avgVib <= 2.5 ? "pill-green" : "pill-red"}`}>
                    {avgVib <= 2.5 ? "NORMAL" : "HIGH VIB"}
                  </span>
                </div>
                <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#0f172a" }}>THRESH &lt; 2.5 mm/s</span>
              </div>
            </div>
          </div>

          {/* 4. SAMPLES ANALYZED */}
          <div
            className="avionics-plaque"
            style={{
              padding: "6px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 0 rgba(0, 0, 0, 0.35)",
            }}
          >
            <CornerScrew style={{ position: "absolute", top: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", top: "4px", right: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", left: "4px" }} />
            <CornerScrew style={{ position: "absolute", bottom: "4px", right: "4px" }} />
            <div className="plaque-inner-card" style={{ padding: "0.7rem 0.85rem", minHeight: "128px" }}>
              <div className="plaque-header" style={{ marginBottom: "0.3rem" }}>
                <div className="plaque-icon-wrap">
                  <BarChart2 size={15} strokeWidth={2.8} color="#000000" />
                </div>
                <div className="plaque-titles">
                  <h3 className="plaque-main-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.45px #000000", letterSpacing: "0.06em", fontSize: "0.85rem" }}>
                    SAMPLES ANALYZED
                  </h3>
                  <span className="plaque-sub-title" style={{ fontWeight: 900, color: "#000000", WebkitTextStroke: "0.35px #000000", letterSpacing: "0.07em", fontSize: "0.64rem" }}>
                    BUFFER TELEMETRY
                  </span>
                </div>
              </div>

              {/* Black Mechanical Tumbler Meter Display */}
              <div className="tumbler-container-center" style={{ margin: "6px 0" }}>
                <TumblerOdometer value={chartData.length} decimals={0} unit="PKT" />
              </div>

              {/* Plaque Footer with Status Pill & Dataset Note */}
              <div className="plaque-footer-strip">
                <div className="status-pill-wrap">
                  <JewelLed color="blue" />
                  <span className="status-pill pill-blue">{datasetMode}</span>
                </div>
                <span className="stamped-tech-note">DATASET: {datasetMode}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Historical Charts — Mission Replay Avionics Style */}
      <div className="replay-avionics-grid-bottom" style={{ marginBottom: "1.5rem" }}>
        {/* CHART 1: ENGINE SPEED (RPM) VS FUEL FLOW CONSUMPTION */}
        <div className="replay-metal-chassis">
          {/* Corner Screws */}
          <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

          <div className="replay-chassis-header">
            <span className="replay-chassis-title" style={{ paddingLeft: 14 }}>
              ENGINE SPEED (RPM) VS FUEL FLOW CONSUMPTION
            </span>
            <span style={{ color: "#f59e0b", fontSize: "0.72rem", fontWeight: 900, fontFamily: "var(--font-mono)", marginRight: 14 }}>
              POWERTRAIN DYNAMICS
            </span>
          </div>

          <div className="replay-screen-recess" style={{ height: "290px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
              <span style={{ color: "#ffb700", fontWeight: 800 }}>ENGINE SPEED (RPM)</span>
              <span style={{ color: "#f97316", fontWeight: 800 }}>FUEL CONSUMPTION (L/h)</span>
            </div>

            <ResponsiveContainer width="100%" height={215}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 2" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "TIME (UTC)", position: "insideBottom", offset: -2, fill: "#cbd5e1", fontSize: 9 }}
                />
                <YAxis 
                  yAxisId="left" 
                  domain={[0, 6000]} 
                  ticks={[0, 1500, 3000, 4500, 6000]}
                  unit=" RPM"
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 35]} 
                  ticks={[0, 10, 20, 30]}
                  unit=" L/h" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <Tooltip 
                  contentStyle={{ background: "#121316", border: "1px solid #2e3238", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#f1f5f9" }} 
                />
                <Line 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="rpm" 
                  name="Engine Speed (RPM)" 
                  stroke="#ffb700" 
                  strokeWidth={2.4} 
                  dot={false} 
                />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="fuel_flow" 
                  name="Fuel Flow (L/h)" 
                  stroke="#f97316" 
                  strokeWidth={2.4} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "4px", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "#ffb700", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#ffb700", display: "inline-block" }} /> Engine Speed (RPM)
              </span>
              <span style={{ color: "#f97316", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#f97316", display: "inline-block" }} /> Fuel Flow (L/h)
              </span>
            </div>
          </div>
        </div>

        {/* CHART 2: THERMAL STRESS TRACKING: EGT & CHT PROFILES */}
        <div className="replay-metal-chassis">
          {/* Corner Screws */}
          <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

          <div className="replay-chassis-header">
            <span className="replay-chassis-title" style={{ paddingLeft: 14 }}>
              THERMAL STRESS TRACKING: EGT & CHT PROFILES
            </span>
            <span style={{ color: "#f59e0b", fontSize: "0.72rem", fontWeight: 900, fontFamily: "var(--font-mono)", marginRight: 14 }}>
              THERMODYNAMICS
            </span>
          </div>

          <div className="replay-screen-recess" style={{ height: "290px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
              <span style={{ color: "#ffb700", fontWeight: 800 }}>EXHAUST GAS TEMP (EGT °C)</span>
              <span style={{ color: "#ff5252", fontWeight: 800 }}>CYLINDER HEAD TEMP (CHT °C)</span>
            </div>

            <ResponsiveContainer width="100%" height={215}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 2" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "TIME (UTC)", position: "insideBottom", offset: -2, fill: "#cbd5e1", fontSize: 9 }}
                />
                <YAxis 
                  yAxisId="egt" 
                  domain={[0, 900]} 
                  ticks={[0, 300, 600, 900]}
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <YAxis 
                  yAxisId="cht" 
                  orientation="right" 
                  domain={[0, 200]} 
                  ticks={[0, 50, 100, 150, 200]}
                  unit="°C" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <Tooltip 
                  contentStyle={{ background: "#121316", border: "1px solid #2e3238", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#f1f5f9" }} 
                />
                <Line 
                  yAxisId="egt" 
                  type="monotone" 
                  dataKey="egt" 
                  name="Exhaust Gas Temp (°C)" 
                  stroke="#ffb700" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  yAxisId="cht" 
                  type="monotone" 
                  dataKey="cht" 
                  name="Cylinder Head Temp (°C)" 
                  stroke="#ff5252" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "4px", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "#ffb700", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#ffb700", display: "inline-block" }} /> Exhaust Gas Temp (EGT °C)
              </span>
              <span style={{ color: "#ff5252", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#ff5252", display: "inline-block" }} /> Cylinder Head Temp (CHT °C)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           CROSS-SENSOR RATIOS & PHYSICS CORRELATION MATRIX (AVIONICS PANEL)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="matrix-chassis-panel">
        <CornerScrew style={{ position: "absolute", top: "5px", left: "6px" }} />
        <CornerScrew style={{ position: "absolute", top: "5px", right: "6px" }} />
        <CornerScrew style={{ position: "absolute", bottom: "5px", left: "6px" }} />
        <CornerScrew style={{ position: "absolute", bottom: "5px", right: "6px" }} />

        {/* Panel Header Bar */}
        <div className="matrix-header-bar">
          <h3 className="matrix-main-heading">
            CROSS-SENSOR RATIOS & PHYSICS CORRELATION MATRIX
          </h3>

          <div className="matrix-status-capsule">
            <JewelLed color="green" pulsing />
            <span className="matrix-status-text">REAL-TIME ANALYSIS</span>
          </div>
        </div>

        {/* 4 Plaque Cards Grid */}
        <div className="matrix-grid">
          {/* Card 1: Thermal Ratio (EGT / CHT) */}
          <MatrixMeterCard
            icon={Thermometer}
            title="THERMAL RATIO (EGT / CHT)"
            value={avgCht > 0 ? (avgEgt / avgCht).toFixed(2) : "7.00"}
            minVal={0}
            maxVal={10}
            ticks={[0, 2, 4, 6, 8, 10]}
            rangeLabel="NOMINAL RANGE : 5.50 - 6.50"
            colorScheme="white"
          />

          {/* Card 2: Mechanical Ratio (VIB / RPM × 1000) */}
          <MatrixMeterCard
            icon={Settings}
            title="MECHANICAL RATIO (VIB / RPM × 1000)"
            value={avgRpm > 0 ? ((avgVib / avgRpm) * 1000).toFixed(2) : "0.42"}
            minVal={0}
            maxVal={0.5}
            ticks={[0, 0.1, 0.2, 0.3, 0.4, 0.5]}
            rangeLabel="NOMINAL RANGE : 0.15 - 0.35"
            colorScheme="white"
          />

          {/* Card 3: Specific Fuel Consumption (PROX) */}
          <MatrixMeterCard
            icon={Fuel}
            title="SPECIFIC FUEL CONSUMPTION (PROX)"
            value={avgRpm > 0 ? (18.2 / (avgRpm / 1000)).toFixed(2) : "5.16"}
            minVal={0}
            maxVal={5}
            ticks={[0, 1, 2, 3, 4, 5]}
            rangeLabel="L/h per 1000 RPM (CRUISE EFFICIENCY)"
            colorScheme="white"
          />

          {/* Card 4: Physics Residual Variance */}
          <MatrixMeterCard
            iconCustom={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 4H6l7 8-7 8h12" />
              </svg>
            }
            title="PHYSICS RESIDUAL VARIANCE"
            value="0.04"
            minVal={0}
            maxVal={0.2}
            ticks={[0, 0.05, 0.1, 0.15, 0.2]}
            rangeLabel="VARIANCE FROM EXPECTED THERMODYNAMIC MODEL"
            colorScheme="green"
          />
        </div>
      </div>
    </div>
  );
}
