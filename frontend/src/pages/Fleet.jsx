import React, { useState, useEffect } from "react";
import { Plane, RefreshCw, BarChart2, Settings, Terminal } from "lucide-react";
import { api } from "../services/api";

// ── Corner Rivets Component ──────────────────────────────────
function CornerRivets() {
  return (
    <>
      <span className="metal-screw tl" />
      <span className="metal-screw tr" />
      <span className="metal-screw bl" />
      <span className="metal-screw br" />
    </>
  );
}

// ── Mechanical Odometer Roller Display ──────────────────────
function OdometerRoller({ value, unit, isSmall = false }) {
  const str = String(value);
  const chars = str.split("");

  return (
    <div className={isSmall ? "cell-odometer-tray" : "odometer-display-tray"}>
      <div className="odometer-rollers-group">
        {chars.map((char, i) => {
          if (char === ".") {
            return (
              <span key={i} className={isSmall ? "cell-decimal-dot" : "odometer-decimal-dot"}>
                .
              </span>
            );
          }
          return (
            <div key={i} className={isSmall ? "cell-digit-box" : "odometer-digit-box"}>
              {char}
            </div>
          );
        })}
      </div>
      {unit && (
        <span className={isSmall ? "cell-unit-label" : "odometer-unit-tag"}>
          {unit}
        </span>
      )}
    </div>
  );
}

// ── High-Precision SVG Airframe Silhouettes ──────────────────
function TapasSilhouette() {
  return (
    <svg viewBox="0 0 160 50" width="85" height="26" fill="none" stroke="#252a30" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Fuselage */}
      <path d="M10 24 Q30 18 80 20 Q125 21 148 24 Q152 25 148 26 Q125 27 80 27 Q30 29 10 24 Z" fill="rgba(0,0,0,0.06)" />
      {/* Main Wings */}
      <path d="M60 22 L72 5 L82 5 L75 22" fill="rgba(0,0,0,0.08)" />
      <path d="M60 26 L72 43 L82 43 L75 26" fill="rgba(0,0,0,0.08)" />
      {/* Twin Booms */}
      <line x1="72" y1="12" x2="140" y2="12" strokeWidth="1" />
      <line x1="72" y1="36" x2="140" y2="36" strokeWidth="1" />
      {/* Tail Fins */}
      <path d="M136 12 L146 3 L150 4 L142 12" />
      <path d="M136 36 L146 45 L150 44 L142 36" />
      {/* Tail Plane Connector */}
      <line x1="140" y1="12" x2="140" y2="36" strokeWidth="1" />
      {/* Nose Camera Bulge */}
      <circle cx="14" cy="24" r="3" fill="rgba(0,0,0,0.2)" />
      {/* Pusher Propeller */}
      <line x1="84" y1="14" x2="84" y2="34" stroke="#475569" strokeWidth="1.5" />
    </svg>
  );
}

function RustomSilhouette() {
  return (
    <svg viewBox="0 0 160 50" width="85" height="26" fill="none" stroke="#252a30" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Fuselage Long Endurance */}
      <path d="M8 24 C25 17 80 19 145 23 C150 24 150 25 145 26 C80 29 25 31 8 24 Z" fill="rgba(0,0,0,0.06)" />
      {/* High Aspect Wings */}
      <path d="M55 22 L65 4 L76 4 L70 22" fill="rgba(0,0,0,0.08)" />
      <path d="M55 26 L65 44 L76 44 L70 26" fill="rgba(0,0,0,0.08)" />
      {/* Twin Booms */}
      <line x1="66" y1="10" x2="138" y2="10" strokeWidth="1" />
      <line x1="66" y1="38" x2="138" y2="38" strokeWidth="1" />
      {/* V-Tail Stabilizers */}
      <path d="M134 10 L144 2 L148 3 L139 10" />
      <path d="M134 38 L144 46 L148 45 L139 38" />
      <line x1="138" y1="10" x2="138" y2="38" strokeWidth="1" />
      {/* Satcom Dome */}
      <ellipse cx="42" cy="21" rx="7" ry="2.5" fill="rgba(0,0,0,0.15)" />
    </svg>
  );
}

function ArcherSilhouette() {
  return (
    <svg viewBox="0 0 160 50" width="85" height="26" fill="none" stroke="#252a30" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      {/* Tactical Delta/Canard Fuselage */}
      <path d="M12 25 L45 20 L135 22 L148 25 L135 28 L45 30 Z" fill="rgba(0,0,0,0.06)" />
      {/* Canards */}
      <path d="M28 23 L36 12 L42 13 L36 23" />
      <path d="M28 27 L36 38 L42 37 L36 27" />
      {/* Main Swept Wings */}
      <path d="M75 22 L110 6 L124 7 L100 22" fill="rgba(0,0,0,0.08)" />
      <path d="M75 28 L110 44 L124 43 L100 28" fill="rgba(0,0,0,0.08)" />
      {/* Twin Tail Fins */}
      <path d="M130 18 L142 9 L146 10 L136 19" />
      <path d="M130 32 L142 41 L146 40 L136 31" />
      {/* Propeller */}
      <line x1="149" y1="16" x2="149" y2="34" stroke="#475569" strokeWidth="1.5" />
    </svg>
  );
}

// ── 3D Metallic Half-Cylindrical Bar Chart ─────────────────
function MetallicCylinderChart({ assets = [] }) {
  const chartHeight = 240;
  const chartWidth = 460;
  const maxVal = 850;
  const baseY = 196;
  const topY = 32;
  const usableHeight = baseY - topY;

  const yTicks = [0, 200, 400, 600, 800];

  const positions = [
    { 
      label: "TAPAS-BH-201", 
      cx: 125, 
      rul: assets[0]?.rul_hours != null ? Number(assets[0].rul_hours) : 390.5, 
      logged: assets[0]?.flight_hours_logged != null ? Number(assets[0].flight_hours_logged) : 348.5 
    },
    { 
      label: "RUSTOM-II-02", 
      cx: 245, 
      rul: assets[1]?.rul_hours != null ? Number(assets[1].rul_hours) : 395.0, 
      logged: assets[1]?.flight_hours_logged != null ? Number(assets[1].flight_hours_logged) : 512.0 
    },
    { 
      label: "ARCHER-03", 
      cx: 365, 
      rul: assets[2]?.rul_hours != null ? Number(assets[2].rul_hours) : 185.0, 
      logged: assets[2]?.flight_hours_logged != null ? Number(assets[2].flight_hours_logged) : 780.0 
    },
  ];

  const barW = 34;
  const capRy = 6.5;

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: "100%", height: "235px", overflow: "visible" }}>
        <defs>
          {/* Matte Silver Cylinder Body Gradient */}
          <linearGradient id="silverCylBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4a5563" />
            <stop offset="25%" stopColor="#6b7787" />
            <stop offset="50%" stopColor="#8c99a8" />
            <stop offset="75%" stopColor="#6b7787" />
            <stop offset="100%" stopColor="#4a5563" />
          </linearGradient>

          {/* Matte Silver Cylinder Top Ellipse Gradient */}
          <linearGradient id="silverCylTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8c99a8" />
            <stop offset="60%" stopColor="#6b7787" />
            <stop offset="100%" stopColor="#4a5563" />
          </linearGradient>

          {/* Matte Gold / Brass Cylinder Body Gradient */}
          <linearGradient id="goldCylBody" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#564019" />
            <stop offset="25%" stopColor="#7f6128" />
            <stop offset="50%" stopColor="#a8843c" />
            <stop offset="75%" stopColor="#7f6128" />
            <stop offset="100%" stopColor="#564019" />
          </linearGradient>

          {/* Matte Gold / Brass Cylinder Top Ellipse Gradient */}
          <linearGradient id="goldCylTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8843c" />
            <stop offset="60%" stopColor="#7f6128" />
            <stop offset="100%" stopColor="#564019" />
          </linearGradient>

          {/* 3D Cylinder Drop Shadow */}
          <filter id="cylDropShadow" x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="1.5" dy="2.5" stdDeviation="2" floodColor="rgba(0,0,0,0.25)" />
          </filter>
        </defs>

        {/* Horizontal Grid lines & Y-axis labels */}
        {yTicks.map((tick) => {
          const y = baseY - (tick / maxVal) * usableHeight;
          return (
            <g key={tick}>
              <line x1="50" y1={y} x2={chartWidth - 20} y2={y} stroke="rgba(0,0,0,0.18)" strokeWidth="0.8" />
              <text x="42" y={y + 3.5} textAnchor="end" fill="#555a62" fontSize="9.5" fontFamily="'Share Tech Mono', monospace" fontWeight="700">
                {tick}h
              </text>
            </g>
          );
        })}

        {/* X-Axis Baseline */}
        <line x1="50" y1={baseY} x2={chartWidth - 20} y2={baseY} stroke="#40454d" strokeWidth="1.2" />

        {/* 3D Cylindrical Columns for each Airframe */}
        {positions.map((item, idx) => {
          const rulH = (Math.min(item.rul, maxVal) / maxVal) * usableHeight;
          const loggedH = (Math.min(item.logged, maxVal) / maxVal) * usableHeight;

          const silverX = item.cx - barW - 3;
          const goldX = item.cx + 3;

          const silverY = baseY - rulH;
          const goldY = baseY - loggedH;

          return (
            <g key={idx}>
              {/* ── Silver 3D Cylinder (Estimated RUL) ── */}
              <g filter="url(#cylDropShadow)" style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}>
                <title>{`${item.label} Estimated RUL: ${item.rul}h`}</title>
                
                {/* Cylinder Vertical Body (Plain flat baseline) */}
                <path
                  d={`M ${silverX} ${silverY} 
                      L ${silverX + barW} ${silverY} 
                      L ${silverX + barW} ${baseY} 
                      L ${silverX} ${baseY} 
                      Z`}
                  fill="url(#silverCylBody)"
                  stroke="#334155"
                  strokeWidth="0.5"
                />

                {/* Cylinder Top Half-Circle Face (Semi-Circle Cap) */}
                <path
                  d={`M ${silverX} ${silverY} 
                      A ${barW / 2} ${capRy} 0 0 0 ${silverX + barW} ${silverY} 
                      Z`}
                  fill="url(#silverCylTop)"
                  stroke="#475569"
                  strokeWidth="0.75"
                />
              </g>

              {/* Value Label on Top of Silver Cylinder */}
              <text
                x={silverX + barW / 2}
                y={silverY - 8}
                textAnchor="middle"
                fill="#1e293b"
                fontSize="9.5"
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="800"
              >
                {item.rul >= 100 ? item.rul.toFixed(0) : item.rul.toFixed(1)}h
              </text>

              {/* ── Gold / Brass 3D Cylinder (Logged Flight Hours) ── */}
              <g filter="url(#cylDropShadow)" style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}>
                <title>{`${item.label} Logged Flight Hours: ${item.logged}h`}</title>
                
                {/* Cylinder Vertical Body (Plain flat baseline) */}
                <path
                  d={`M ${goldX} ${goldY} 
                      L ${goldX + barW} ${goldY} 
                      L ${goldX + barW} ${baseY} 
                      L ${goldX} ${baseY} 
                      Z`}
                  fill="url(#goldCylBody)"
                  stroke="#78350f"
                  strokeWidth="0.5"
                />

                {/* Cylinder Top Half-Circle Face (Semi-Circle Cap) */}
                <path
                  d={`M ${goldX} ${goldY} 
                      A ${barW / 2} ${capRy} 0 0 0 ${goldX + barW} ${goldY} 
                      Z`}
                  fill="url(#goldCylTop)"
                  stroke="#92400e"
                  strokeWidth="0.75"
                />
              </g>

              {/* Value Label on Top of Gold Cylinder */}
              <text
                x={goldX + barW / 2}
                y={goldY - 8}
                textAnchor="middle"
                fill="#854d0e"
                fontSize="9.5"
                fontFamily="'Share Tech Mono', monospace"
                fontWeight="800"
              >
                {item.logged >= 100 ? item.logged.toFixed(0) : item.logged.toFixed(1)}h
              </text>

              {/* X-axis Label */}
              <text
                x={item.cx}
                y={baseY + 16}
                textAnchor="middle"
                fill="#1e2227"
                fontSize="10"
                fontFamily="'Inter', sans-serif"
                fontWeight="800"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Bottom Chart Legend */}
      <div className="fleet-chart-legend">
        <span className="legend-swatch-box">
          <span className="metallic-swatch-silver" /> Estimated RUL (h)
        </span>
        <span className="legend-swatch-box">
          <span className="metallic-swatch-gold" /> Logged Flight Hours
        </span>
      </div>
    </div>
  );
}

// ── Subsystem Health Radar Comparison Chart ─────────────────
function SubsystemHealthRadar({ tapasSubsystems }) {
  const size = 260;
  const center = size / 2;
  const radius = 88;

  // 5 Axes matching the exact screenshot
  const axes = [
    { name: "Thermal Stability", angle: -90 },
    { name: "Combustion Eff.", angle: -18 },
    { name: "Lubrication Margin", angle: 54 },
    { name: "Vibration Health", angle: 126 },
    { name: "Electrical SOH", angle: 198 },
  ];

  // Helper to compute (x, y) for a given axis index & value (0 to 100)
  const getPoint = (axisIdx, val) => {
    const angleRad = (axes[axisIdx].angle * Math.PI) / 180;
    const r = (val / 100) * radius;
    return {
      x: center + r * Math.cos(angleRad),
      y: center + r * Math.sin(angleRad),
    };
  };

  // Convert array of values to SVG polygon points string
  const toPolygonPath = (values) => {
    return values.map((val, i) => {
      const pt = getPoint(i, val);
      return `${pt.x},${pt.y}`;
    }).join(" ");
  };

  // Grid levels (60, 80, 100)
  const rings = [20, 40, 60, 80, 100];

  // Dynamic series values for TAPAS-BH201 based on live telemetry, plus stable values for fleet assets
  const tapasVals = tapasSubsystems || [97, 98, 96, 99, 97]; // Green
  const rustomVals = [91, 95, 90, 93, 94]; // Orange / Gold
  const archerVals = [84, 88, 80, 89, 90]; // Purple

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", height: "230px", overflow: "visible" }}>
        <defs>
          <radialGradient id="radarCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Center subtle glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#radarCenterGlow)" />

        {/* Concentric Pentagon Rings */}
        {rings.map((level) => {
          const pts = axes.map((_, i) => {
            const p = getPoint(i, level);
            return `${p.x},${p.y}`;
          }).join(" ");

          return (
            <g key={level}>
              <polygon
                points={pts}
                fill="none"
                stroke={level === 100 ? "#2b3038" : "rgba(40,45,52,0.35)"}
                strokeWidth={level === 100 ? "1.4" : "0.9"}
              />
              {/* Ring scale numeric labels (60, 80, 100) */}
              {(level === 60 || level === 80 || level === 100) && (
                <text
                  x={center + 4}
                  y={center - (level / 100) * radius + 4}
                  fill="#181b20"
                  fontSize="9"
                  fontFamily="'Share Tech Mono', monospace"
                  fontWeight="900"
                >
                  {level}
                </text>
              )}
            </g>
          );
        })}

        {/* 5 Axis Spoke Lines */}
        {axes.map((ax, i) => {
          const pt = getPoint(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={pt.x}
              y2={pt.y}
              stroke="rgba(30,35,42,0.45)"
              strokeWidth="1.1"
            />
          );
        })}

        {/* ── Series 3: ARCHER-03 (Deep Royal Purple) ── */}
        <polygon
          points={toPolygonPath(archerVals)}
          fill="rgba(88, 28, 135, 0.14)"
          stroke="#581c87"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {archerVals.map((val, i) => {
          const pt = getPoint(i, val);
          return <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#581c87" stroke="#ffffff" strokeWidth="1" />;
        })}

        {/* ── Series 2: RUSTOM-II (Deep Burnt Amber / Rust) ── */}
        <polygon
          points={toPolygonPath(rustomVals)}
          fill="rgba(180, 83, 9, 0.16)"
          stroke="#b45309"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {rustomVals.map((val, i) => {
          const pt = getPoint(i, val);
          return <circle key={i} cx={pt.x} cy={pt.y} r="3" fill="#b45309" stroke="#ffffff" strokeWidth="1" />;
        })}

        {/* ── Series 1: TAPAS-BH201 (Deep Forest Green) ── */}
        <polygon
          points={toPolygonPath(tapasVals)}
          fill="rgba(21, 128, 61, 0.18)"
          stroke="#15803d"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {tapasVals.map((val, i) => {
          const pt = getPoint(i, val);
          return <circle key={i} cx={pt.x} cy={pt.y} r="3.2" fill="#15803d" stroke="#ffffff" strokeWidth="1" />;
        })}

        {/* Vertex Labels around perimeter */}
        {axes.map((ax, i) => {
          const pt = getPoint(i, 116);
          let textAnchor = "middle";
          if (i === 1 || i === 2) textAnchor = "start";
          if (i === 3 || i === 4) textAnchor = "end";

          return (
            <text
              key={i}
              x={pt.x}
              y={pt.y + 3}
              textAnchor={textAnchor}
              fill="#000000"
              fontSize="9.5"
              fontFamily="'Inter', sans-serif"
              fontWeight="900"
            >
              {ax.name}
            </text>
          );
        })}
      </svg>

      {/* Bottom Radar Legend */}
      <div className="fleet-chart-legend">
        <span className="legend-swatch-box">
          <span className="radar-swatch-green" /> TAPAS-BH201
        </span>
        <span className="legend-swatch-box">
          <span className="radar-swatch-orange" /> RUSTOM-II
        </span>
        <span className="legend-swatch-box">
          <span className="radar-swatch-purple" /> ARCHER-03
        </span>
      </div>
    </div>
  );
}

// ── Main Fleet Swarm Page ───────────────────────────────────
export default function Fleet({ telemetryData }) {
  const [fleetSummary, setFleetSummary] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    api.getFleetSummary()
      .then((data) => {
        setFleetSummary(data);
        setIsRefreshing(false);
      })
      .catch(() => setIsRefreshing(false));
  };

  useEffect(() => {
    handleRefresh();
    const interval = setInterval(handleRefresh, 4000);
    return () => clearInterval(interval);
  }, []);

  // Extract live dynamic values from backend or fallback to initial defaults
  const totalCount = String(fleetSummary?.total_airframes ?? 3).padStart(2, "0");
  const airborneCount = String(fleetSummary?.airborne_airframes ?? 2).padStart(2, "0");
  const standbyCount = String(fleetSummary?.standby_airframes ?? 1).padStart(2, "0");
  const avgHealth = (fleetSummary?.fleet_average_health ?? 86.7).toFixed(1);

  // Asset 1 (TAPAS-BH201 Alpha) - binds to live WebSocket telemetry if available
  const tapasHealth = telemetryData?.health_score != null 
    ? Number(telemetryData.health_score).toFixed(1) 
    : (fleetSummary?.fleet_assets?.[0]?.health_score ?? 76.9).toFixed(1);

  const tapasRul = telemetryData?.rul_hours != null 
    ? Number(telemetryData.rul_hours).toFixed(1) 
    : (fleetSummary?.fleet_assets?.[0]?.rul_hours ?? 390.5).toFixed(1);

  const tapasAlt = Math.round(telemetryData?.telemetry?.altitude ?? (fleetSummary?.fleet_assets?.[0]?.altitude_m ?? 205));

  // Asset 2 (RUSTOM-II Bravo)
  const rustomAsset = fleetSummary?.fleet_assets?.[1] || {
    health_score: 94.8,
    rul_hours: 395.0,
    altitude_m: 4850,
    flight_hours_logged: 512.0,
    battery_soh: 95.2,
  };

  // Asset 3 (ARCHER Tactical Gamma)
  const archerAsset = fleetSummary?.fleet_assets?.[2] || {
    health_score: 88.5,
    rul_hours: 185.0,
    altitude_m: 0,
    flight_hours_logged: 780.0,
    battery_soh: 91.0,
  };

  const assetsList = [
    {
      rul_hours: parseFloat(tapasRul),
      flight_hours_logged: fleetSummary?.fleet_assets?.[0]?.flight_hours_logged ?? 348.5,
    },
    rustomAsset,
    archerAsset,
  ];

  return (
    <div className="fleet-hardware-page">
      {/* ── Top Header Banner with Corner Screws ──────────────── */}
      <div className="metal-casing-panel fleet-top-banner">
        <CornerRivets />

        <div className="fleet-banner-left">
          <div className="fleet-section-tag">
            ✦ Dronanetra // FLEET LEVEL PROGNOSTICS (SECTION 22) ✦
          </div>
          <div className="fleet-main-title">
            <Plane size={22} color="#181b20" />
            <h2>MALE UAV SWARM & FLEET-LEVEL DIGITAL TWIN</h2>
          </div>
          <p className="fleet-subtitle">
            Multi-Airframe Engine State Aggregation, Fleet RUL Comparison & Fleet Readiness
          </p>
        </div>

        <button className="fleet-metallic-btn" onClick={handleRefresh}>
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} /> REFRESH FLEET STATUS
        </button>
      </div>

      {/* ── Row 1: 4 KPI Odometer Counters with Rivets ─────────── */}
      <div className="fleet-kpi-grid">
        {/* KPI 1 */}
        <div className="metal-casing-panel fleet-kpi-casing">
          <CornerRivets />
          <div className="fleet-kpi-header">
            <span>• TOTAL AIRFRAMES</span>
            <span>...</span>
          </div>
          <OdometerRoller value={totalCount} unit="UAVs" />
        </div>

        {/* KPI 2 */}
        <div className="metal-casing-panel fleet-kpi-casing">
          <CornerRivets />
          <div className="fleet-kpi-header">
            <span>• AIRBORNE SORTIES</span>
            <span>...</span>
          </div>
          <OdometerRoller value={airborneCount} unit="ACTIVE" />
        </div>

        {/* KPI 3 */}
        <div className="metal-casing-panel fleet-kpi-casing">
          <CornerRivets />
          <div className="fleet-kpi-header">
            <span>• FLEET AVG HEALTH</span>
            <span>...</span>
          </div>
          <OdometerRoller value={avgHealth} unit="%" />
        </div>

        {/* KPI 4 */}
        <div className="metal-casing-panel fleet-kpi-casing">
          <CornerRivets />
          <div className="fleet-kpi-header">
            <span>• STANDBY / OVERHAUL</span>
            <span>...</span>
          </div>
          <OdometerRoller value={standbyCount} unit="HANGAR" />
        </div>
      </div>

      {/* ── Row 2: 3 Airframe Status Cards with Rivets ─────────── */}
      <div className="fleet-airframes-grid">
        {/* Airframe 1: TAPAS-BH201 Alpha */}
        <div className="metal-casing-panel airframe-casing">
          <CornerRivets />

          <div className="airframe-header-row">
            <span className="airframe-name-title">TAPAS-BH201 Alpha</span>
            <div className="airframe-silhouette-box">
              <TapasSilhouette />
            </div>
            <span className="metal-status-badge airborne">AIRBORNE</span>
          </div>

          <div className="airframe-sub-id">
            UAV-TAPAS-BH-201 • Engine: ENG-ROTAX-914-01
          </div>

          {/* Inset 3-Gauge Telemetry Tray */}
          <div className="airframe-telemetry-tray">
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">HEALTH SCORE</span>
              <OdometerRoller value={tapasHealth} unit="%" isSmall />
            </div>
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">RUL REMAINING</span>
              <OdometerRoller value={tapasRul} unit="h" isSmall />
            </div>
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">ALTITUDE</span>
              <OdometerRoller value={String(tapasAlt)} unit="m" isSmall />
            </div>
          </div>

          <div className="airframe-footer-details">
            <div>Mission: <strong>High Altitude ISR Patrol</strong></div>
            <div className="airframe-footer-meta">Logged Hours: 348.5h • Battery SOH: 98.4%</div>
          </div>
        </div>

        {/* Airframe 2: RUSTOM-II Bravo */}
        <div className="metal-casing-panel airframe-casing">
          <CornerRivets />

          <div className="airframe-header-row">
            <span className="airframe-name-title">RUSTOM-II Bravo</span>
            <div className="airframe-silhouette-box">
              <RustomSilhouette />
            </div>
            <span className="metal-status-badge airborne">AIRBORNE</span>
          </div>

          <div className="airframe-sub-id">
            UAV-RUSTOM-II-02 • Engine: ENG-ROTAX-914-02
          </div>

          {/* Inset 3-Gauge Telemetry Tray */}
          <div className="airframe-telemetry-tray">
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">HEALTH SCORE</span>
              <OdometerRoller value={rustomAsset.health_score.toFixed(1)} unit="%" isSmall />
            </div>
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">RUL REMAINING</span>
              <OdometerRoller value={String(Math.round(rustomAsset.rul_hours))} unit="h" isSmall />
            </div>
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">ALTITUDE</span>
              <OdometerRoller value={String(Math.round(rustomAsset.altitude_m))} unit="m" isSmall />
            </div>
          </div>

          <div className="airframe-footer-details">
            <div>Mission: <strong>Maritime Perimeter Recon</strong></div>
            <div className="airframe-footer-meta">Logged Hours: {rustomAsset.flight_hours_logged}h • Battery SOH: {rustomAsset.battery_soh}%</div>
          </div>
        </div>

        {/* Airframe 3: ARCHER Tactical Gamma */}
        <div className="metal-casing-panel airframe-casing">
          <CornerRivets />

          <div className="airframe-header-row">
            <span className="airframe-name-title">ARCHER Tactical Gamma</span>
            <div className="airframe-silhouette-box">
              <ArcherSilhouette />
            </div>
            <span className="metal-status-badge standby">STANDBY</span>
          </div>

          <div className="airframe-sub-id">
            UAV-ARCHER-03 • Engine: ENG-ROTAX-914-03
          </div>

          {/* Inset 3-Gauge Telemetry Tray */}
          <div className="airframe-telemetry-tray">
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">HEALTH SCORE</span>
              <OdometerRoller value={archerAsset.health_score.toFixed(1)} unit="%" isSmall />
            </div>
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">RUL REMAINING</span>
              <OdometerRoller value={String(Math.round(archerAsset.rul_hours))} unit="h" isSmall />
            </div>
            <div className="telemetry-tray-cell">
              <span className="telemetry-cell-label">ALTITUDE</span>
              <OdometerRoller value={String(Math.round(archerAsset.altitude_m))} unit="m" isSmall />
            </div>
          </div>

          <div className="airframe-footer-details">
            <div>Mission: <strong>Scheduled 200h Overhaul Inspection</strong></div>
            <div className="airframe-footer-meta">Logged Hours: {archerAsset.flight_hours_logged}h • Battery SOH: {archerAsset.battery_soh}%</div>
          </div>
        </div>
      </div>

      {/* ── Row 3: 2 Heavy Chart Panels with Rivets ───────────── */}
      <div className="fleet-bottom-grid">
        {/* Chart 1: Fleet RUL Prognostics vs Logged Hours */}
        <div className="metal-casing-panel fleet-chart-casing">
          <CornerRivets />

          <div className="fleet-chart-header">
            <div className="fleet-chart-title">
              <BarChart2 size={16} />
              <span>FLEET RUL PROGNOSTICS VS LOGGED HOURS</span>
            </div>
            <span className="fleet-chart-tag">• COMPARATIVE AUDIT</span>
          </div>

          <div className="fleet-chart-display-area">
            <MetallicCylinderChart assets={assetsList} />
          </div>
        </div>

        {/* Chart 2: Subsystem Health Radar Comparison */}
        <div className="metal-casing-panel fleet-chart-casing">
          <CornerRivets />

          <div className="fleet-chart-header">
            <div className="fleet-chart-title">
              <Settings size={16} />
              <span>SUBSYSTEM HEALTH RADAR COMPARISON</span>
            </div>
            <span className="fleet-chart-tag">• MULTI-AIRFRAME MATRIX</span>
          </div>

          <div className="fleet-chart-display-area">
            <SubsystemHealthRadar />
          </div>
        </div>
      </div>
    </div>
  );
}

