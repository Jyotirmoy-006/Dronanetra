import React from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Layers,
  RotateCcw,
  Shield,
  Sliders,
  Terminal,
  Wrench,
  X,
  Zap,
} from "lucide-react";

/**
 * VRDE 180HP AVIATION PISTON ENGINE — COMPONENT DIAGNOSTIC HUD
 *
 * Appears when any major engine component is clicked / touched.
 * Displays real-time physical telemetry, operating thresholds,
 * detected and AI predicted anomalies, and actionable maintenance tasks.
 */
export default function ComponentDiagnosticHUD({
  component,
  telemetryData,
  onResetSelection,
  onToggleCutaway,
  isCutawayActive = false,
}) {
  if (!component) return null;

  const data = component.userData || {};
  const status = data.status || "NOMINAL";
  const health = data.health || 98;
  const isWarning = status === "WARNING";
  const isCritical = status === "CRITICAL";

  // Dynamic telemetry overrides if linked to live telemetryData
  const liveTelemetry = telemetryData?.telemetry || {};
  let displayTemp = data.temperature;
  let displayVib = data.vibration;
  let displayPress = data.pressure;

  if (data.partId?.includes("_1")) {
    displayTemp = liveTelemetry.cht_cyl1 || liveTelemetry.cht || displayTemp;
  } else if (data.partId?.includes("_2")) {
    displayTemp = liveTelemetry.cht_cyl2 || displayTemp;
  } else if (data.partId?.includes("_3")) {
    displayTemp = liveTelemetry.cht_cyl3 || (isCritical ? 218 : isWarning ? 204 : 158);
  } else if (data.partId?.includes("_4")) {
    displayTemp = liveTelemetry.cht_cyl4 || displayTemp;
  } else if (data.partId === "exhaust_system") {
    displayTemp = liveTelemetry.egt || 735;
  } else if (data.partId === "oil_cooler_system" || data.partId === "rear_accessory_case" || data.partId === "lubrication_system") {
    displayPress = liveTelemetry.oil_pressure || 4.2;
    displayTemp = liveTelemetry.oil_temp || 84;
  } else if (data.partId === "crankshaft") {
    displayVib = liveTelemetry.vibration || displayVib;
  }

  return (
    <div className="component-diagnostic-hud-card">
      {/* ── Header Strip ── */}
      <div className="hud-header-strip">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            className={`hud-status-jewel ${
              isCritical ? "jewel-red" : isWarning ? "jewel-amber" : "jewel-green"
            }`}
          />
          <div>
            <div className="hud-tag-sub">
              AERO-INLINE 4 // {data.subsystem} // ID: {data.partId?.toUpperCase()}
            </div>
            <h3 className="hud-component-title">{data.name}</h3>
          </div>
        </div>

        <button
          className="hud-close-btn"
          onClick={onResetSelection}
          title="Return Component to Assembly"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Status & Health Metrics Strip ── */}
      <div className="hud-metrics-row">
        <div className="hud-metric-box">
          <span className="hud-metric-label">HEALTH SCORE</span>
          <div className="hud-metric-val-wrap">
            <span
              className={`hud-metric-number ${
                health < 70 ? "text-red" : health < 85 ? "text-amber" : "text-green"
              }`}
            >
              {health}%
            </span>
            <span
              className={`hud-badge-pill ${
                isCritical ? "badge-red" : isWarning ? "badge-amber" : "badge-green"
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {displayTemp !== null && displayTemp !== undefined && (
          <div className="hud-metric-box">
            <span className="hud-metric-label">TEMPERATURE</span>
            <div className="hud-metric-val-wrap">
              <span
                className={`hud-metric-number ${
                  displayTemp > 200 ? "text-red" : displayTemp > 185 ? "text-amber" : "text-cyan"
                }`}
              >
                {Math.round(displayTemp)}°C
              </span>
              <span className="hud-range-sub">
                NORM: {data.nominalRange?.cht || data.nominalRange?.temp || "150–190°C"}
              </span>
            </div>
          </div>
        )}

        {displayVib !== null && displayVib !== undefined && (
          <div className="hud-metric-box">
            <span className="hud-metric-label">VIBRATION</span>
            <div className="hud-metric-val-wrap">
              <span
                className={`hud-metric-number ${
                  displayVib > 4.5 ? "text-red" : displayVib > 2.8 ? "text-amber" : "text-cyan"
                }`}
              >
                {Number(displayVib).toFixed(2)}
              </span>
              <span className="hud-range-sub">mm/s (1X FFT)</span>
            </div>
          </div>
        )}

        {displayPress !== null && displayPress !== undefined && (
          <div className="hud-metric-box">
            <span className="hud-metric-label">PRESSURE</span>
            <div className="hud-metric-val-wrap">
              <span
                className={`hud-metric-number ${
                  displayPress < 2.5 ? "text-red" : displayPress < 3.2 ? "text-amber" : "text-cyan"
                }`}
              >
                {Number(displayPress).toFixed(1)} bar
              </span>
              <span className="hud-range-sub">NORM: 3.5–5.5</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Operational Description ── */}
      <div className="hud-desc-box">
        <p>{data.description}</p>
      </div>

      {/* ── Telemetry Sensor Cross-Reference ── */}
      <div className="hud-sensors-section">
        <div className="hud-subhead">
          <Activity size={13} color="#00f2ff" /> LINKED TELEMETRY CHANNELS:
        </div>
        <div className="hud-sensor-tags">
          {data.sensors && data.sensors.length > 0 ? (
            data.sensors.map((s, idx) => (
              <span key={idx} className="hud-sensor-tag">
                ● {s.toUpperCase()}
              </span>
            ))
          ) : (
            <span className="hud-sensor-tag">BUS TELEMETRY NOMINAL</span>
          )}
        </div>
      </div>

      {/* ── Anomaly & Diagnostics Section ── */}
      {(isWarning || isCritical) && (
        <div
          className={`hud-anomaly-alert ${isCritical ? "alert-critical" : "alert-warning"}`}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <AlertTriangle
              size={18}
              color={isCritical ? "#ff2222" : "#f59e0b"}
              style={{ flexShrink: 0, marginTop: "2px" }}
            />
            <div>
              <strong style={{ fontSize: "0.78rem", letterSpacing: "0.04em" }}>
                {isCritical ? "CRITICAL ANOMALY CONFIRMED" : "ADVISORY ANOMALY ACTIVE"}
              </strong>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.74rem", color: "#e2e8f0" }}>
                {data.partId?.includes("3")
                  ? "Cylinder #3 CHT (214°C) has breached maximum thermal threshold (190°C). Airflow restriction or lean mixture suspected."
                  : data.partId === "crankshaft"
                  ? "Harmonic vibration 6.4 mm/s at 145 Hz exceeds continuous operation limit (2.8 mm/s). Suspected center main bearing micro-wear."
                  : data.partId === "lubrication_system"
                  ? "Main oil gallery pressure (1.8 bar) below minimum flight threshold (3.0 bar). Pressure relief valve bypass or pump cavitation."
                  : "Sensor variance detected against physics digital twin steady-state baseline."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── AI Predictive Maintenance Layer ── */}
      <div className="hud-predictive-box">
        <div className="hud-predictive-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Cpu size={13} color="#00ff9d" />
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#00ff9d" }}>
              AI PROGNOSTIC PREDICTION
            </span>
          </div>
          <span style={{ fontSize: "0.68rem", color: "#8da2b5" }}>MODEL RUL-NET v2.1</span>
        </div>
        <div className="hud-predictive-body">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "0.73rem", color: "#cbd5e1" }}>
              Failure Probability in Next 25 Flight Hours:
            </span>
            <strong
              style={{
                fontSize: "0.78rem",
                color: isCritical ? "#ff4444" : isWarning ? "#f59e0b" : "#00ff9d",
              }}
            >
              {isCritical ? "84%" : isWarning ? "42%" : "4.2%"}
            </strong>
          </div>
          <div className="hud-prob-bar-track">
            <div
              className="hud-prob-bar-fill"
              style={{
                width: isCritical ? "84%" : isWarning ? "42%" : "4.2%",
                backgroundColor: isCritical ? "#ff2222" : isWarning ? "#f59e0b" : "#00ff9d",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Actionable Ground Maintenance Recommendation ── */}
      <div className="hud-action-box">
        <div className="hud-subhead">
          <Wrench size={13} color="#facc15" /> RECOMMENDED MAINTENANCE ACTION:
        </div>
        <p className="hud-action-text">{data.recommendedAction}</p>
      </div>

      {/* ── Action Buttons ── */}
      <div className="hud-btn-row">
        <button className="btn-hud-primary" onClick={onResetSelection}>
          <RotateCcw size={13} /> RETURN TO ASSEMBLY
        </button>

        <button
          className={`btn-hud-secondary ${isCutawayActive ? "active" : ""}`}
          onClick={onToggleCutaway}
        >
          <Layers size={13} /> {isCutawayActive ? "SOLID VIEW" : "X-RAY CUTAWAY"}
        </button>
      </div>
    </div>
  );
}
