import React, { useState } from "react";
import { Flame, Activity, Gauge, Zap, Radio, AlertTriangle, ShieldCheck, Eye, Layers } from "lucide-react";

/**
 * X-RAY THERMAL & MULTI-PARAMETER SPATIAL OVERLAY
 *
 * Renders spatial floating telemetry tags pinned to each 3D engine component
 * in X-Ray mode, displaying:
 * - Real-time Temperature (°C) with dynamic color & glow badge
 * - Emissive Glow Strength (0.25x to 4.5x)
 * - Secondary physical operating parameters (Vibration, Pressure, Flow, EGT, RPM)
 * - Operational health status
 * - Interactive X-Ray Thermal Glow Scale & Legend
 */
export default function XRayThermalOverlay({
  componentsData = [],
  onSelectComponent,
  activeAnomaly,
}) {
  const [tagFilter, setTagFilter] = useState("ALL"); // "ALL" | "HOTSPOTS" | "MINIMAL"

  const filteredComponents = componentsData.filter((item) => {
    if (tagFilter === "MINIMAL") return false;
    if (tagFilter === "HOTSPOTS") {
      return item.temp >= 140 || item.status === "CRITICAL" || item.status === "WARNING";
    }
    return true;
  });

  return (
    <div className="xray-thermal-spatial-layer" pointer-events="none">
      {/* ── Top X-Ray Mode Banner & Tag Filter Controls ── */}
      <div className="xray-top-controls-bar" style={{ pointerEvents: "auto" }}>
        <div className="xray-mode-badge">
          <Eye size={13} color="#00f2ff" />
          <span>X-RAY THERMAL & COMPONENT TELEMETRY ACTIVE</span>
        </div>

        <div className="xray-filter-buttons">
          <span className="filter-label">SPATIAL HUD:</span>
          <button
            className={`btn-xray-filter ${tagFilter === "ALL" ? "active" : ""}`}
            onClick={() => setTagFilter("ALL")}
          >
            ALL COMPONENTS ({componentsData.length})
          </button>
          <button
            className={`btn-xray-filter ${tagFilter === "HOTSPOTS" ? "active" : ""}`}
            onClick={() => setTagFilter("HOTSPOTS")}
          >
            <Flame size={11} /> HOTSPOTS ONLY
          </button>
          <button
            className={`btn-xray-filter ${tagFilter === "MINIMAL" ? "active" : ""}`}
            onClick={() => setTagFilter("MINIMAL")}
          >
            CLEAN VIEW
          </button>
        </div>
      </div>

      {/* ── Floating 3D Pinned Telemetry Badges ── */}
      {filteredComponents.map((comp) => {
        if (!comp.visible || comp.screenX < 2 || comp.screenX > 98 || comp.screenY < 5 || comp.screenY > 95) {
          return null;
        }

        const isCritical = comp.status === "CRITICAL" || comp.temp >= 190;
        const isWarning = comp.status === "WARNING" || comp.temp >= 140;
        const isExhaust = comp.temp >= 600;

        return (
          <div
            key={comp.id}
            className={`xray-floating-badge ${
              isCritical
                ? "badge-critical-glow"
                : isExhaust
                ? "badge-plasma-glow"
                : isWarning
                ? "badge-warning-glow"
                : "badge-nominal-glow"
            }`}
            style={{
              left: `${comp.screenX}%`,
              top: `${comp.screenY}%`,
              pointerEvents: "auto",
            }}
            onClick={() => onSelectComponent && onSelectComponent(comp.id)}
            title="Click to inspect this component in detail"
          >
            {/* Anchor pointer dot */}
            <div
              className={`xray-badge-anchor-dot ${
                isCritical ? "anchor-critical" : isExhaust ? "anchor-plasma" : ""
              }`}
            />

            {/* Badge Content Card */}
            <div className="xray-badge-inner">
              {/* Header: Name & Status */}
              <div className="xray-badge-header">
                <span className="xray-badge-name">{comp.name}</span>
                <span
                  className={`xray-badge-status ${
                    isCritical ? "status-crit" : isWarning ? "status-warn" : "status-nom"
                  }`}
                >
                  {comp.statusText || comp.status}
                </span>
              </div>

              {/* Main Metric: Heat & Glow Strength */}
              <div className="xray-badge-temp-row">
                <div className="temp-display">
                  <Flame
                    size={13}
                    className={isCritical || isExhaust ? "pulse-flame" : ""}
                    color={comp.glowColor || "#f59e0b"}
                  />
                  <span
                    className="temp-value"
                    style={{ color: comp.glowColor || "#ffffff" }}
                  >
                    {Math.round(comp.temp * 10) / 10}°C
                  </span>
                </div>

                <div className="glow-meter-block">
                  <span className="glow-label">GLOW:</span>
                  <span
                    className="glow-value"
                    style={{ color: comp.glowColor || "#00f2ff" }}
                  >
                    {comp.glowFactor}
                  </span>
                </div>
              </div>

              {/* Glow Intensity Mini Bar */}
              <div className="xray-glow-bar-track">
                <div
                  className="xray-glow-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(12, (comp.temp / 750) * 100))}%`,
                    background: comp.glowColor || "#00f2ff",
                    boxShadow: `0 0 8px ${comp.glowColor || "#00f2ff"}`,
                  }}
                />
              </div>

              {/* Secondary Operating Parameter */}
              {comp.secondaryParam && (
                <div className="xray-badge-secondary">
                  <span className="sec-label">{comp.secondaryLabel}:</span>
                  <span className="sec-val">{comp.secondaryParam}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* ── Bottom-Left X-Ray Thermal Glow Scale & Legend ── */}
      <div className="xray-thermal-legend-card" style={{ pointerEvents: "auto" }}>
        <div className="legend-header">
          <Flame size={12} color="#ff3b3b" />
          <span className="legend-title">X-RAY THERMAL GLOW SPECTRUM</span>
        </div>

        <div className="legend-gradient-bar" />

        <div className="legend-scale-markers">
          <div className="scale-stop">
            <span className="stop-temp">40°C</span>
            <span className="stop-glow">0.35x GLOW</span>
            <span className="stop-sub">CYAN (INDUCTION)</span>
          </div>
          <div className="scale-stop">
            <span className="stop-temp">85°C</span>
            <span className="stop-glow">0.85x GLOW</span>
            <span className="stop-sub">GOLD (CASE/SUMP)</span>
          </div>
          <div className="scale-stop">
            <span className="stop-temp">125°C</span>
            <span className="stop-glow">1.45x GLOW</span>
            <span className="stop-sub">AMBER (HEADS)</span>
          </div>
          <div className="scale-stop">
            <span className="stop-temp">214°C</span>
            <span className="stop-glow">3.4x PULSE</span>
            <span className="stop-sub">CRIMSON (OVERHEAT)</span>
          </div>
          <div className="scale-stop">
            <span className="stop-temp">740°C</span>
            <span className="stop-glow">4.5x PLASMA</span>
            <span className="stop-sub">WHITE (EXHAUST)</span>
          </div>
        </div>

        <div className="legend-footer-rule">
          <span>EMISSIVE RADIANCE = THERMAL ENERGY DISSIPATION [W/m²]</span>
        </div>
      </div>
    </div>
  );
}
