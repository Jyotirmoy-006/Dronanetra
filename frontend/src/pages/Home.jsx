import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, ShieldAlert, Cpu, Flame, Gauge, Zap, Compass, ArrowUpRight, Terminal, ShieldCheck, Download, Radio } from "lucide-react";
import AviationMeter from "../components/AviationMeter";
import ExportLogsDropdown from "../components/ExportLogsDropdown";

export default function Home({ telemetryData, history }) {
  const telemetry = telemetryData?.telemetry || {
    rpm: 4850,
    egt: 745.0,
    cht: 124.0,
    vibration: 1.2,
    fuel_flow: 18.2,
    altitude: 3200,
  };

  const healthScore = telemetryData?.health_score ?? 98.5;
  const activeAlerts = telemetryData?.active_alerts || [];
  const status = telemetryData?.fault_status || "NORMAL";

  const rpmPct = Math.min(100, Math.max(0, (telemetry.rpm / 6000) * 100));
  const egtPct = Math.min(100, Math.max(0, (telemetry.egt / 900) * 100));
  const chtPct = Math.min(100, Math.max(0, (telemetry.cht / 250) * 100));
  const vibPct = Math.min(100, Math.max(0, (telemetry.vibration / 5) * 100));

  return (
    <div className="home-container">
      <div className="page-header">
        <div>
          <div className="header-node-tag">
            <Terminal size={12} color="var(--accent-cyan)" /> Dronanetra // NODE #04 // TAPAS-BH201 DIGITAL TWIN
          </div>
          <h2>
            <Compass size={24} color="var(--accent-cyan)" /> Executive Mission Summary Dashboard
          </h2>
          <p>UAV Aero Piston Engine Health Overview & Real-Time AI Digital Twin Telemetry</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <ExportLogsDropdown telemetryData={telemetryData} history={history} nodeTitle="Dronanetra NODE #04" />
          <span className={`health-badge ${healthScore > 85 ? 'health-normal' : healthScore > 60 ? 'health-warning' : 'health-critical'}`}>
            <Zap size={16} /> HEALTH SCORE: {healthScore.toFixed(1)}% ({status})
          </span>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
           LIVE ENGINE INSTRUMENT PANEL — 6 Precision Uniform Gauges
         ═══════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          marginBottom: "1.25rem",
          padding: "1rem 1.25rem",
          background: "url('/metal_plate_bg.png') center / cover no-repeat",
          border: "1px solid #888a8e",
          borderRadius: "8px",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.4)",
        }}
      >
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(220px, 1fr))",
          gap: "1.25rem",
          justifyItems: "center",
          alignItems: "center",
          overflowX: "auto",
          padding: "0.5rem 0",
        }}>
          <AviationMeter value={telemetry.rpm} min={0} max={7000} label="ENGINE SPEED" unit="RPM" subUnit="x1000" warningStart={5000} dangerStart={6000} decimals={0} size={235} />
          <AviationMeter value={telemetry.egt} min={0} max={1300} label="EXHAUST GAS TEMP" unit="EGT" subUnit="°C" warningStart={1000} dangerStart={1200} decimals={0} size={235} />
          <AviationMeter value={telemetry.fuel_flow} min={0} max={40} label="FUEL FLOW" unit="FUEL" subUnit="L/hr" warningStart={30} dangerStart={36} decimals={1} size={235} />
          <AviationMeter value={telemetryData?.telemetry?.oil_pressure ?? 3.8} min={0} max={10} label="OIL PRESSURE" unit="OIL" subUnit="bar" warningStart={7.5} dangerStart={9.0} decimals={1} size={235} />
          <AviationMeter value={telemetry.vibration} min={0} max={10} label="VIBRATION" unit="VIB" subUnit="g" warningStart={6.0} dangerStart={8.0} decimals={2} size={235} />
          <AviationMeter value={telemetry.cht} min={0} max={220} label="CYLINDER HEAD TEMP" unit="CHT" subUnit="°C" warningStart={160} dangerStart={190} decimals={0} size={235} />
        </div>
      </div>

      {/* Top Telemetry KPI Grid */}
      <div className="grid-4" style={{ marginBottom: "1.6rem" }}>
        <div className="gcs-card gauge-card">
          <div className="gcs-card-title">
            <span>Crankshaft Speed</span>
            <Gauge size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <div className="gauge-val">
              {telemetry.rpm} <span className="gauge-unit">RPM</span>
            </div>
            <div className="tactical-progress-track">
              <div className="tactical-progress-fill" style={{ width: `${rpmPct}%`, backgroundColor: "var(--accent-cyan)", color: "var(--accent-cyan)" }} />
            </div>
          </div>
          <div className="gauge-footer">
            <span>Max Limit: 5,500 RPM</span>
            <span>Target: Cruise Power</span>
          </div>
        </div>

        <div className="gcs-card gauge-card" style={{ borderLeftColor: "var(--accent-amber)" }}>
          <div className="gcs-card-title">
            <span>Exhaust Gas Temp (EGT)</span>
            <Flame size={18} color="var(--accent-amber)" />
          </div>
          <div>
            <div className="gauge-val" style={{ color: telemetry.egt > 850 ? "var(--accent-red)" : "var(--text-main)", textShadow: "0 0 20px rgba(255, 183, 0, 0.45)" }}>
              {telemetry.egt} <span className="gauge-unit" style={{ color: "var(--accent-amber)" }}>°C</span>
            </div>
            <div className="tactical-progress-track">
              <div className="tactical-progress-fill" style={{ width: `${egtPct}%`, backgroundColor: "var(--accent-amber)", color: "var(--accent-amber)" }} />
            </div>
          </div>
          <div className="gauge-footer">
            <span>Physics Expected: {telemetryData?.expected_physics?.expected_egt || 740}°C</span>
            <span style={{ color: "var(--accent-amber)" }}>Residual: {telemetryData?.residuals?.egt_residual || 0}°C</span>
          </div>
        </div>

        <div className="gcs-card gauge-card" style={{ borderLeftColor: "var(--accent-purple)" }}>
          <div className="gcs-card-title">
            <span>Cylinder Head Temp (CHT)</span>
            <Activity size={18} color="var(--accent-purple)" />
          </div>
          <div>
            <div className="gauge-val" style={{ color: telemetry.cht > 150 ? "var(--accent-red)" : "var(--text-main)", textShadow: "0 0 20px rgba(192, 68, 255, 0.45)" }}>
              {telemetry.cht} <span className="gauge-unit" style={{ color: "var(--accent-purple)" }}>°C</span>
            </div>
            <div className="tactical-progress-track">
              <div className="tactical-progress-fill" style={{ width: `${chtPct}%`, backgroundColor: "var(--accent-purple)", color: "var(--accent-purple)" }} />
            </div>
          </div>
          <div className="gauge-footer">
            <span>Physics Expected: {telemetryData?.expected_physics?.expected_cht || 120}°C</span>
            <span>Max Limit: 165°C</span>
          </div>
        </div>

        <div className="gcs-card gauge-card" style={{ borderLeftColor: "var(--accent-emerald)" }}>
          <div className="gcs-card-title">
            <span>Mechanical Vibration</span>
            <Zap size={18} color="var(--accent-emerald)" />
          </div>
          <div>
            <div className="gauge-val" style={{ textShadow: "0 0 20px rgba(0, 255, 157, 0.45)" }}>
              {telemetry.vibration} <span className="gauge-unit" style={{ color: "var(--accent-emerald)" }}>mm/s</span>
            </div>
            <div className="tactical-progress-track">
              <div className="tactical-progress-fill" style={{ width: `${vibPct}%`, backgroundColor: "var(--accent-emerald)", color: "var(--accent-emerald)" }} />
            </div>
          </div>
          <div className="gauge-footer">
            <span>Baseline: 1.2 mm/s</span>
            <span>Harmonics: Nominal</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Alerts Grid */}
      <div className="grid-2">
        <div className="gcs-card">
          <div className="gcs-card-title">
            <span>Live Engine Health Index Trajectory</span>
            <Cpu size={18} color="#f59e0b" />
          </div>
          <div className="replay-screen-recess" style={{ height: "280px", width: "100%", padding: "10px 12px 6px 6px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history.length > 0 ? history : [{ timestamp: "12:00", health_score: 98.5 }]}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#475569" tick={{ fill: "#cbd5e1", fontSize: 11 }} tickFormatter={(t) => t ? t.slice(11, 19) : ""} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="health_score" name="Health Score %" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#healthGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gcs-card">
          <div className="gcs-card-title">
            <span>Active Alarms & Warnings ({activeAlerts.length})</span>
            <ShieldAlert size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ minHeight: "280px" }}>
            {activeAlerts.length === 0 ? (
              <div style={{ padding: "3.5rem 1rem", textAlign: "center", color: "var(--text-muted)" }}>
                <ShieldAlert size={44} color="var(--accent-emerald)" style={{ marginBottom: "0.85rem", opacity: 0.9 }} />
                <p style={{ fontWeight: 800, color: "var(--accent-emerald)", fontSize: "1.05rem", letterSpacing: "0.5px" }}>ALL SYSTEMS NOMINAL</p>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>No active telemetry or physics-residual warnings.</p>
              </div>
            ) : (
              activeAlerts.map((alt, idx) => (
                <div key={idx} className={`alert-row alert-${alt.severity}`}>
                  <span style={{ fontSize: "1.3rem" }}>{alt.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem" }}>{alt.parameter}: {alt.reason}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                      Confidence: {(alt.confidence * 100).toFixed(0)}% • Action: {alt.recommended_action}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
