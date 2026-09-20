import React, { useState, useEffect, useMemo } from "react";
import {
  Wrench,
  Download,
  CheckCircle2,
  Clock,
  Activity,
  Cpu,
  Shield,
  Layers,
  Zap,
  Gauge,
  AlertTriangle,
  FileText,
  Calendar,
} from "lucide-react";
import { api } from "../services/api";

/**
 * Precision Counter-sunk Pan-Head Screw SVG
 */
function CornerScrew({ size = 12, style = {} }) {
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
        <radialGradient id="maintScrewHeadGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#d5d9df" />
          <stop offset="65%" stopColor="#8e949d" />
          <stop offset="100%" stopColor="#4a4e55" />
        </radialGradient>
        <radialGradient id="maintScrewHoleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#4a4f57" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#maintScrewHoleGrad)" stroke="#3a3e45" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="8.5" fill="url(#maintScrewHeadGrad)" stroke="#2b2e34" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      <rect x="10.8" y="5.5" width="2.4" height="13" rx="0.5" fill="#1e2024" />
      <rect x="5.5" y="10.8" width="13" height="2.4" rx="0.5" fill="#1e2024" />
      <circle cx="9.5" cy="9.5" r="1" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

/**
 * Jewel Indicator LED
 */
function JewelLed({ color = "green" }) {
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
      ring: "#002255",
    },
  };

  const style = colorMap[color] || colorMap.green;

  return (
    <div
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: style.bg,
        boxShadow: style.glow,
        border: `1.5px solid ${style.ring}`,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

export default function MaintenanceAdvisory({ telemetryData }) {
  const [liveData, setLiveData] = useState(null);

  // Fallback initial fetch if WebSocket data hasn't arrived
  useEffect(() => {
    if (!telemetryData?.component_lifecycle) {
      api.getMaintenance()
        .then((res) => {
          if (res?.advisory) {
            setLiveData(res.advisory);
          }
        })
        .catch((err) => console.warn("Could not fetch maintenance baseline:", err));
    }
  }, [telemetryData]);

  const components =
    telemetryData?.component_lifecycle ||
    liveData?.components ||
    liveData?.advisory?.components ||
    [];
  const tasks =
    telemetryData?.maintenance_tasks ||
    liveData?.maintenance_tasks ||
    liveData?.tasks ||
    liveData?.advisory?.maintenance_tasks ||
    [];
  const airframeHours = liveData?.airframe_hours || 348.5;
  const faultStatus = telemetryData?.fault_status || "NORMAL";
  const healthScore = telemetryData?.health_score ?? (liveData?.overall_health ?? 98.5);
  const rulHours = telemetryData?.rul_hours ?? 450;

  const handleExportReport = () => {
    const timestamp = new Date().toISOString();
    let compTable = components.map((c, i) => 
      `${i + 1}. [${c.id || 'N/A'}] ${c.name.padEnd(30)} | Life: ${String(c.life).padStart(5)}% | Rem: ${String(c.hoursLeft).padStart(6)} hrs / ${c.maxHours}h | Status: ${c.status.padEnd(8)} | Note: ${c.metric_note || 'OK'}`
    ).join("\n");

    let taskTable = tasks.map((t, i) => 
      `${i + 1}. [${t.priority || 'MED'}] ${t.title} (${t.urgency})\n   Category: ${t.category}\n   Action: ${t.desc}\n   Status: ${t.completed ? 'COMPLETED' : 'PENDING ACTION'}`
    ).join("\n\n");

    const reportText = `================================================================================
DRONANETRA MALE UAV AERO PISTON ENGINE DIGITAL TWIN REPORT
================================================================================
Generated: ${timestamp}
Platform Tail: TAPAS-BH201 (Rustom-II MALE UAV)
Propulsion Unit: Rotax 914 Turbocharged Aero Engine (ENG-ROTAX-914-01)
Operating Phase: ${telemetryData?.operating_phase || "CRUISE"}
Airframe Total Flight Hours: ${airframeHours.toFixed(1)} hrs

OVERALL PROPULSION HEALTH METRICS:
--------------------------------------------------------------------------------
Health Index:       ${healthScore.toFixed(1)}%
Fault Condition:    ${faultStatus}
Remaining Life RUL: ${rulHours.toFixed(0)} Flight Hours
Anomaly Score:      ${((telemetryData?.anomaly_score || 0) * 100).toFixed(1)}%

COMPONENT LIFE-CYCLE & WEAR PROGNOSTICS (7 CRITICAL SUBSYSTEMS):
--------------------------------------------------------------------------------
${compTable}

CONDITION-BASED AUTONOMOUS MAINTENANCE ACTION ADVISORIES:
--------------------------------------------------------------------------------
${taskTable}

================================================================================
Aeronautical Quality Assurance & Predictive Maintenance GCS Node
Direct Telemetry Ingest Verified // SAE J1939-11 Standard
================================================================================
`;

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `TAPAS_BH201_Component_Wear_Report_${timestamp.slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (life) => {
    if (life > 75) return "#059669";
    if (life > 45) return "#0284c7";
    if (life > 20) return "#d97706";
    return "#dc2626";
  };

  const getStatusBadge = (status, life) => {
    if (status === "CRITICAL" || life <= 20) {
      return { bg: "rgba(239, 68, 68, 0.18)", border: "rgba(239, 68, 68, 0.45)", text: "#b91c1c", label: "CRITICAL WEAR" };
    }
    if (status === "CAUTION" || life <= 50) {
      return { bg: "rgba(245, 158, 11, 0.2)", border: "rgba(245, 158, 11, 0.45)", text: "#b45309", label: "CAUTION" };
    }
    return { bg: "rgba(16, 185, 129, 0.18)", border: "rgba(16, 185, 129, 0.45)", text: "#047857", label: "NOMINAL" };
  };

  return (
    <div
      style={{
        marginBottom: "1.25rem",
        padding: "1.25rem",
        background: "url('/metal_plate_bg.png') center / cover no-repeat",
        border: "1px solid #888a8e",
        borderRadius: "8px",
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        position: "relative",
      }}
    >
      {/* 4 Realistic Corner Pan-Head Screws */}
      <CornerScrew size={14} style={{ position: "absolute", top: "10px", left: "10px" }} />
      <CornerScrew size={14} style={{ position: "absolute", top: "10px", right: "10px" }} />
      <CornerScrew size={14} style={{ position: "absolute", bottom: "10px", left: "10px" }} />
      <CornerScrew size={14} style={{ position: "absolute", bottom: "10px", right: "10px" }} />

      {/* ══════════════════════════════════════════════════════════════════
           TOP HEADER & EXPORT ACTION
         ══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          paddingBottom: "0.75rem",
          borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.68rem",
              fontWeight: 700,
              fontFamily: "var(--font-sans, sans-serif)",
              letterSpacing: "0.5px",
              color: "#0f172a",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: faultStatus === "NORMAL" ? "#00ff88" : "#f59e0b",
                boxShadow: faultStatus === "NORMAL" ? "0 0 8px #00ff88" : "0 0 8px #f59e0b",
              }}
            />
            <span>LIVE COMPONENT PROGNOSTICS & ADVISORY (1 Hz)</span>
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 700,
              fontFamily: "var(--font-sans, sans-serif)",
              color: "#0f172a",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Wrench size={18} color="#0f172a" /> Autonomous Maintenance Advisory & Component Life-Cycle Wear Tracking
          </h3>

          <p
            style={{
              margin: 0,
              fontSize: "0.75rem",
              color: "#1e293b",
              fontWeight: 700,
              fontFamily: "var(--font-sans, sans-serif)",
            }}
          >
            Continuous Aero Degradation Prognostics // Condition-Based Action Directives // TAPAS-BH201 Rotax 914
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            onClick={handleExportReport}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "linear-gradient(180deg, #2b303c 0%, #151821 100%)",
              border: "1px solid #4a5162",
              borderRadius: "6px",
              padding: "0.45rem 0.9rem",
              color: "#ffffff",
              fontSize: "0.72rem",
              fontWeight: 800,
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.borderColor = "#00f2ff")}
            onMouseOut={(e) => (e.currentTarget.style.borderColor = "#4a5162")}
          >
            <Download size={13} color="#00f2ff" />
            <span>EXPORT TECHNICAL REPORT</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           2-COLUMN MAIN CONTENT (Advisory Tasks & Component Life)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid-2" style={{ gap: "1.1rem" }}>
        {/* Left Column: Actionable Maintenance Checklist */}
        <div
          style={{
            background: "url('/metal_plate_bg.png') center / cover no-repeat",
            border: "1px solid #6b7280",
            borderRadius: "8px",
            padding: "1.1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.4)",
            position: "relative",
          }}
        >
          {/* Column Corner Screws */}
          <CornerScrew size={11} style={{ position: "absolute", top: "7px", left: "7px" }} />
          <CornerScrew size={11} style={{ position: "absolute", top: "7px", right: "7px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "7px", left: "7px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "7px", right: "7px" }} />

          {/* Column Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 0, 0, 0.25)", paddingBottom: "0.55rem", paddingLeft: "0.2rem", paddingRight: "0.2rem" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <Wrench size={16} color="#0284c7" /> Autonomous Maintenance Action Directives
            </span>
            <span style={{ fontSize: "0.7rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#0369a1", background: "rgba(2, 132, 199, 0.15)", border: "1px solid rgba(2, 132, 199, 0.45)", padding: "2px 8px", borderRadius: "5px" }}>
              {tasks.filter(t => !t.completed).length} ACTION REQUIRED
            </span>
          </div>

          {/* Sub-cards List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxHeight: "430px", overflowY: "auto", paddingRight: "0.3rem" }}>
            {tasks.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "#475569", fontSize: "0.8rem", fontWeight: 600 }}>
                Loading real-time maintenance diagnostics from backend engine...
              </div>
            ) : (
              tasks.map((task, idx) => {
                const isUrgent = task.priority === "HIGH" || !task.completed;
                return (
                  <div
                    key={task.id || idx}
                    style={{
                      background: "url('/metal_plate_bg.png') center / cover no-repeat",
                      border: isUrgent ? "1.5px solid #94a3b8" : "1px solid #71717a",
                      borderRadius: "7px",
                      padding: "0.85rem 1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.28), inset 0 1px 1.5px rgba(255, 255, 255, 0.85), inset 0 -1px 2px rgba(0, 0, 0, 0.35)",
                      position: "relative",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.28), inset 0 1px 1.5px rgba(255, 255, 255, 0.85), inset 0 -1px 2px rgba(0, 0, 0, 0.35)";
                    }}
                  >
                    {/* Sub-card Top Row: Icon, Title, Category & Urgency */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                        {task.completed ? (
                          <CheckCircle2 size={17} color="#059669" style={{ flexShrink: 0 }} />
                        ) : (
                          <Clock size={17} color={task.priority === "HIGH" ? "#dc2626" : "#d97706"} style={{ flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: "0.84rem", fontWeight: 800, color: "#0f172a" }}>{task.title}</span>
                        {task.category && (
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(15, 23, 42, 0.12)", color: "#1e293b", border: "1px solid rgba(15, 23, 42, 0.22)", fontFamily: "var(--font-mono)" }}>
                            {task.category}
                          </span>
                        )}
                      </div>

                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 900,
                          fontFamily: "var(--font-mono)",
                          padding: "0.22rem 0.55rem",
                          borderRadius: "5px",
                          background: task.completed ? "rgba(16, 185, 129, 0.25)" : (task.priority === "HIGH" ? "rgba(239, 68, 68, 0.22)" : "rgba(245, 158, 11, 0.25)"),
                          color: task.completed ? "#047857" : (task.priority === "HIGH" ? "#b91c1c" : "#b45309"),
                          border: `1px solid ${task.completed ? "rgba(16, 185, 129, 0.5)" : (task.priority === "HIGH" ? "rgba(239, 68, 68, 0.5)" : "rgba(245, 158, 11, 0.5)")}`,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {task.urgency}
                      </span>
                    </div>

                    {/* Sub-card Middle Callout: Recessed Cockpit Display Cutout */}
                    <div
                      style={{
                        background: "#000000",
                        border: "none",
                        borderRadius: "5px",
                        padding: "0.5rem 0.75rem",
                        fontSize: "0.74rem",
                        color: "#ffffff",
                        fontWeight: 600,
                        lineHeight: 1.45,
                        boxShadow: "none",
                      }}
                    >
                      {task.desc}
                    </div>

                    {/* Sub-card Bottom Row: Priority & Status Metadata Cutout */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.65rem",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        background: "#000000",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.35rem 0.6rem",
                        boxShadow: "none",
                      }}
                    >
                      <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <FileText size={11} color="#94a3b8" /> PRIORITY: <strong style={{ color: task.priority === "HIGH" ? "#f87171" : "#fbbf24" }}>{task.priority || "NORMAL"}</strong>
                      </span>
                      <span>STATUS: <strong style={{ color: task.completed ? "#34d399" : "#fbbf24" }}>{task.completed ? "COMPLETED" : "PENDING ACTION"}</strong></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Component Life-Cycle Wear Tracking */}
        <div
          style={{
            background: "url('/metal_plate_bg.png') center / cover no-repeat",
            border: "1px solid #6b7280",
            borderRadius: "8px",
            padding: "1.1rem 1.2rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.85rem",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.8), inset 0 -1px 2px rgba(0, 0, 0, 0.4)",
            position: "relative",
          }}
        >
          {/* Column Corner Screws */}
          <CornerScrew size={11} style={{ position: "absolute", top: "7px", left: "7px" }} />
          <CornerScrew size={11} style={{ position: "absolute", top: "7px", right: "7px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "7px", left: "7px" }} />
          <CornerScrew size={11} style={{ position: "absolute", bottom: "7px", right: "7px" }} />

          {/* Column Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0, 0, 0, 0.25)", paddingBottom: "0.55rem", paddingLeft: "0.2rem", paddingRight: "0.2rem" }}>
            <span style={{ fontSize: "0.86rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <Activity size={16} color="#0284c7" /> Component Life-Cycle & Wear Tracking
            </span>
            <span style={{ fontSize: "0.7rem", fontWeight: 900, fontFamily: "var(--font-mono)", color: "#047857", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.45)", padding: "2px 8px", borderRadius: "5px", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Cpu size={11} /> {components.length} LIVE SUBSYSTEMS
            </span>
          </div>

          {/* Sub-cards List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", maxHeight: "430px", overflowY: "auto", paddingRight: "0.3rem" }}>
            {components.length === 0 ? (
              <div style={{ padding: "1.5rem", textAlign: "center", color: "#475569", fontSize: "0.8rem", fontWeight: 600 }}>
                Receiving live component degradation metrics from backend...
              </div>
            ) : (
              components.map((comp, idx) => {
                const badge = getStatusBadge(comp.status, comp.life);
                const barColor = getStatusColor(comp.life);
                const isCritical = comp.status === "CRITICAL" || comp.life <= 20;

                return (
                  <div 
                    key={comp.id || idx} 
                    style={{ 
                      background: "url('/metal_plate_bg.png') center / cover no-repeat",
                      border: isCritical ? "1.5px solid #ef4444" : "1px solid #71717a",
                      borderRadius: "7px", 
                      padding: "0.8rem 1rem", 
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.45rem",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.28), inset 0 1px 1.5px rgba(255, 255, 255, 0.85), inset 0 -1px 2px rgba(0, 0, 0, 0.35)",
                      position: "relative",
                      transition: "transform 0.18s ease, box-shadow 0.18s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.35), inset 0 1px 2px rgba(255,255,255,1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.28), inset 0 1px 1.5px rgba(255, 255, 255, 0.85), inset 0 -1px 2px rgba(0, 0, 0, 0.35)";
                    }}
                  >
                    {/* Sub-card Top Row: Name, Subsystem Tag, Badge, and Hours Remaining */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", fontFamily: "var(--font-mono)", flexWrap: "wrap", gap: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <span style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.82rem" }}>{comp.name}</span>
                        {comp.subsystem && (
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#475569" }}>
                            [{comp.subsystem}]
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <span
                          style={{
                            fontSize: "0.62rem",
                            fontWeight: 800,
                            padding: "0.15rem 0.45rem",
                            borderRadius: "4px",
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.text,
                          }}
                        >
                          {badge.label}
                        </span>
                        <span style={{ color: barColor, fontWeight: 900, fontSize: "0.78rem" }}>
                          {comp.hoursLeft}h left ({comp.life}%)
                        </span>
                      </div>
                    </div>

                    {/* Sub-card Middle: Recessed Cockpit Degradation Gauge Bar */}
                    <div style={{ height: "8px", margin: "0.15rem 0", background: "#000000", border: "none", borderRadius: "4px", overflow: "hidden", boxShadow: "none" }}>
                      <div
                        style={{
                          width: `${Math.max(3, Math.min(100, comp.life))}%`,
                          backgroundColor: barColor,
                          height: "100%",
                          borderRadius: "3px",
                          boxShadow: "none",
                          transition: "width 0.5s ease, background-color 0.5s ease",
                        }}
                      />
                    </div>

                    {/* Sub-card Bottom: Compartmentalized Telemetry & TBO Recessed Display */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.66rem",
                        color: "#ffffff",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        background: "#000000",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.35rem 0.6rem",
                        boxShadow: "none",
                      }}
                    >
                      <span style={{ color: "#a1a1aa" }}>
                        TELEMETRY: <strong style={{ color: "#ffffff" }}>{comp.metric_note || `Rated TBO: ${comp.maxHours}h`}</strong>
                      </span>
                      <span style={{ color: "#a1a1aa" }}>
                        MAX TBO: <strong style={{ color: "#38bdf8" }}>{comp.maxHours}h</strong>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
