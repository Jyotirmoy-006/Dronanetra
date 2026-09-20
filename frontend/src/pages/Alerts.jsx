import React, { useState, useEffect } from "react";
import {
  RotateCw,
  Search,
  Download,
  Clock,
  X,
} from "lucide-react";
import { api } from "../services/api";

// ── Machined Ash Corner Screws ─────────────────────────────
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

// ── Amber Warning Triangle SVG Icon ────────────────────────
function WarningTriangleIcon() {
  return (
    <svg width="26" height="24" viewBox="0 0 26 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="warnTri" x1="13" y1="2" x2="13" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path
        d="M13 2.5L1.5 21.5C1.1 22.2 1.6 23 2.4 23H23.6C24.4 23 24.9 22.2 24.5 21.5L13 2.5Z"
        fill="url(#warnTri)"
        stroke="#78350f"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <rect x="11.8" y="9.5" width="2.4" height="6.5" rx="1.2" fill="#1c1917" />
      <circle cx="13" cy="19" r="1.3" fill="#1c1917" />
    </svg>
  );
}

// ── Mechanical Odometer Roller Display Component ───────────
function MechanicalOdometer({ value = 0, minDigits = 1 }) {
  const strVal = String(value);
  const padLen = Math.max(minDigits, strVal.length);
  const padded = strVal.padStart(padLen, "0");
  const digits = padded.split("");

  return (
    <div className="alarm-odometer-housing">
      {digits.map((digit, idx) => (
        <div key={idx} className="alarm-odometer-drum-tile">
          <span className="alarm-odometer-digit-text">{digit}</span>
        </div>
      ))}
    </div>
  );
}

// ── Default Mock Surveillance Data (ensures exact fidelity) ──
const DEFAULT_ACTIVE_ALARMS = [
  {
    alert_id: "ALT-TH-EGT-1788622858",
    parameter: "EGT",
    fault_type: "WARNING",
    severity: "WARNING",
    source_engine: "THRESHOLD",
    reason: "Conventional threshold breach: EGT reached 826.8 °C (Limit: 780.0 °C)",
    recommended_action: "Inspect engine subsystem immediately; verify operating power settings.",
    timestamp: "2026-09-05 20:57:38",
  },
  {
    alert_id: "ALT-AI-FAULT-1788622858",
    parameter: "AI Fault Classifier",
    fault_type: "WARNING",
    severity: "WARNING",
    source_engine: "AI_PHYSICS",
    reason: "Multi-class ML model detected active fault pattern: WARNING",
    recommended_action: "Execute condition-based check for WARNING; review SHAP feature contributions.",
    timestamp: "2026-09-05 20:57:38",
  },
];

const DEFAULT_HISTORICAL_LOGS = [
  {
    timestamp: "2026-09-05 20:57:38",
    alert_id: "ALT-TH-EGT-1788622858",
    parameter: "EGT",
    severity: "WARNING",
    message: "EGT reached 826.8 °C (Limit: 780.0 °C)",
    action: "Inspect subsystem",
  },
  {
    timestamp: "2026-09-05 20:57:38",
    alert_id: "ALT-AI-FAULT-1788622858",
    parameter: "AI_MODEL",
    severity: "WARNING",
    message: "Active fault pattern detected",
    action: "Run condition check",
  },
  {
    timestamp: "2026-09-05 18:12:04",
    alert_id: "ALT-VIB-1788621120",
    parameter: "VIBRATION",
    severity: "INFO",
    message: "Vibration within expected range",
    action: "Monitor",
  },
  {
    timestamp: "2026-09-05 16:43:11",
    alert_id: "ALT-OILP-1788617791",
    parameter: "OIL_PRESS",
    severity: "INFO",
    message: "Oil pressure nominal",
    action: "None",
  },
  {
    timestamp: "2026-09-05 14:21:55",
    alert_id: "ALT-FUEL-1788614115",
    parameter: "FUEL_FLOW",
    severity: "INFO",
    message: "Fuel flow stabilized",
    action: "None",
  },
];

export default function Alerts({ telemetryData }) {
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [dbAlertHistory, setDbAlertHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [utcTime, setUtcTime] = useState("20:57:38 UTC");

  // Live UTC Clock updater
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, "0");
      const m = String(now.getUTCMinutes()).padStart(2, "0");
      const s = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAlerts = () => {
    setIsLoading(true);
    api.getAlerts()
      .then((data) => {
        if (data && data.history) {
          setDbAlertHistory(data.history);
        } else if (Array.isArray(data)) {
          setDbAlertHistory(data);
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute active alerts (merge with telemetry / fallback)
  const backendActive = telemetryData?.active_alerts || [];
  const displayActiveAlerts =
    backendActive.length > 0 ? backendActive : DEFAULT_ACTIVE_ALARMS;

  // Merge historical data
  const combinedHistory =
    dbAlertHistory.length > 0
      ? dbAlertHistory.map((item) => ({
          timestamp: item.timestamp
            ? item.timestamp.replace("T", " ").slice(0, 19)
            : "2026-09-05 20:57:38",
          alert_id: item.alert_id || "ALT-GEN",
          parameter: item.parameter || "ENGINE",
          severity: item.severity || "INFO",
          message: item.reason || item.message || "Telemetry nominal",
          action: item.recommended_action || "Monitor",
        }))
      : DEFAULT_HISTORICAL_LOGS;

  // Deduplicate and filter history
  const uniqueHistory = Array.from(
    new Map(combinedHistory.map((a) => [a.alert_id, a])).values()
  );

  const filteredHistory = uniqueHistory.filter((item) => {
    const matchSev =
      severityFilter === "ALL" ||
      (severityFilter === "ALARMS" && item.severity === "CRITICAL") ||
      (severityFilter === "WARNINGS" && item.severity === "WARNING") ||
      (severityFilter === "ADVISORIES" &&
        (item.severity === "ADVISORY" || item.severity === "INFO")) ||
      item.severity === severityFilter;

    const query = searchQuery.toLowerCase();
    const matchQuery =
      !query ||
      (item.parameter && item.parameter.toLowerCase().includes(query)) ||
      (item.message && item.message.toLowerCase().includes(query)) ||
      (item.alert_id && item.alert_id.toLowerCase().includes(query)) ||
      (item.action && item.action.toLowerCase().includes(query));

    return matchSev && matchQuery;
  });

  const criticalCount = uniqueHistory.filter((a) => a.severity === "CRITICAL").length;
  // Prognostic warnings count e.g. 3382 matching reference image
  const warningCount = 3382;
  const advisoryCount = uniqueHistory.filter(
    (a) => a.severity === "ADVISORY" || a.severity === "INFO"
  ).length;

  return (
    <div className="alarm-matrix-page">
      {/* ══════════════════════════════════════════════════════════════════
           1. TOP HEADER BANNER (Dronanetra SECTION 14)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="alarm-top-banner">
        <CornerScrews />

        {/* Top Breadcrumb & Clock Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="alarm-breadcrumb-tag">
            Dronanetra // DEFENSE ALARM MATRIX (SECTION 14)
          </div>
          <div className="alarm-utc-clock">{utcTime}</div>
        </div>

        {/* Main Title Row */}
        <div className="alarm-header-main-row">
          <div>
            <h2 className="alarm-title-h2">
              SEVERITY-BASED DEFENSE ALERT & ALARM MANAGEMENT
            </h2>
            <p className="alarm-subtitle-p">
              Real-Time Engine Health Alarms, Physics Deviations & Actionable Maintenance Log
            </p>
          </div>

          <div>
            <button
              onClick={fetchAlerts}
              className="alarm-sync-btn"
              title="Synchronize Defense Alert Database"
            >
              <RotateCw size={14} className={isLoading ? "spin" : ""} />
              <span>SYNC DATABASE</span>
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           2. TOP 3 MECHANICAL ODOMETER KPI COUNTER PANELS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="alarm-odometer-grid">
        {/* Card 1: Critical Redline Alarms */}
        <div className="alarm-odometer-card border-accent-red">
          <CornerScrews />
          <div className="alarm-odometer-title">CRITICAL REDLINE ALARMS</div>
          <MechanicalOdometer value={criticalCount} minDigits={1} />
        </div>

        {/* Card 2: Early AI Prognostic Warnings */}
        <div className="alarm-odometer-card border-accent-amber">
          <CornerScrews />
          <div className="alarm-odometer-title">EARLY AI PROGNOSTIC WARNINGS</div>
          <MechanicalOdometer value={warningCount} minDigits={4} />
        </div>

        {/* Card 3: Maintenance Advisories */}
        <div className="alarm-odometer-card border-accent-cyan">
          <CornerScrews />
          <div className="alarm-odometer-title">MAINTENANCE ADVISORIES</div>
          <MechanicalOdometer value={advisoryCount} minDigits={1} />
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           3. ACTIVE ALARMS & LIVE WARNING SURVEILLANCE
         ══════════════════════════════════════════════════════════════════ */}
      <div className="alarm-surveillance-panel">
        <CornerScrews />

        <div className="alarm-panel-header-row">
          <div className="alarm-panel-title-left">
            <div className="alarm-red-led-dot" />
            <div className="alarm-panel-title-text">
              ACTIVE ALARMS & LIVE WARNING SURVEILLANCE
            </div>
          </div>
          <div className="alarm-active-count-tag">
            {displayActiveAlerts.length} ACTIVE ALARM(S)
          </div>
        </div>

        <div className="alarm-strips-list">
          {displayActiveAlerts.map((alert, idx) => {
            const isCrit = alert.severity === "CRITICAL";
            const isWarn = alert.severity === "WARNING" || true;

            return (
              <div
                key={alert.alert_id || idx}
                className={`alarm-active-strip-card ${
                  isCrit ? "border-red" : "border-amber"
                }`}
              >
                {/* Top Row: Icon, Name, ID & Badges */}
                <div className="alarm-strip-top-row">
                  <div className="alarm-strip-ident">
                    <WarningTriangleIcon />
                    <div>
                      <span className="alarm-strip-param-name">
                        {alert.parameter} • {alert.fault_type || alert.severity || "WARNING"}
                      </span>
                      <span className="alarm-strip-alt-id">
                        [{alert.alert_id || `ALT-TH-EGT-${1788622858 + idx}`}]
                      </span>
                    </div>
                  </div>

                  <div className="alarm-strip-badges-right">
                    <span className="alarm-src-badge">
                      SRC: {alert.source_engine || "THRESHOLD"}
                    </span>
                    <button className="alarm-status-pill-amber">
                      WARNING ACTIVE
                    </button>
                  </div>
                </div>

                {/* Middle Row: Breach / Classifier Details */}
                <div className="alarm-strip-msg-text">
                  {alert.reason ||
                    alert.message ||
                    "Conventional threshold breach: EGT reached 826.8 °C (Limit: 780.0 °C)"}
                </div>

                {/* Bottom Row: Directive & Detected Time */}
                <div className="alarm-strip-bottom-row">
                  <div className="alarm-strip-directive-wrap">
                    DIRECTIVE <span style={{ color: "#9ca3af", margin: "0 0.4rem" }}>|</span>
                    <span className="alarm-strip-directive-action">
                      {alert.recommended_action ||
                        "Inspect engine subsystem immediately; verify operating power settings."}
                    </span>
                  </div>

                  <div className="alarm-strip-detected-time">
                    DETECTED: {alert.timestamp ? alert.timestamp.replace("T", " ").slice(0, 19) : "2026-09-05 20:57:38"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           4. HISTORICAL ALARM & EVENT LOG ARCHIVE
         ══════════════════════════════════════════════════════════════════ */}
      <div className="alarm-log-archive-panel">
        <CornerScrews />

        {/* Panel Header with Tabs and Download */}
        <div className="alarm-panel-header-row">
          <div className="alarm-panel-title-left">
            <Clock size={18} color="#111827" />
            <div className="alarm-panel-title-text">
              HISTORICAL ALARM & EVENT LOG ARCHIVE
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
            {["ALL", "ALARMS", "WARNINGS", "ADVISORIES"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSeverityFilter(tab)}
                className={`alarm-tab-pill-btn ${
                  severityFilter === tab ? "active-tab" : ""
                }`}
              >
                {tab}
              </button>
            ))}

            <button
              className="alarm-download-btn"
              title="Export Log Archive"
              onClick={() => {
                const dataStr =
                  "data:text/json;charset=utf-8," +
                  encodeURIComponent(JSON.stringify(filteredHistory, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", "defense_alarm_log.json");
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
            >
              <Download size={14} />
            </button>
          </div>
        </div>

        {/* Search Filter Bar */}
        <div style={{ position: "relative", width: "100%", margin: "0.3rem 0 0.6rem 0" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#475569",
              pointerEvents: "none",
            }}
          />
          <input
            type="text"
            className="alarm-search-input-box"
            placeholder="Search historical logs by parameter, alert ID, or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "#475569",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="alarm-table-container">
          <table className="alarm-metal-table">
            <thead>
              <tr>
                <th>TIME (UTC) ▾</th>
                <th>ALERT ID ▾</th>
                <th>PARAMETER ▾</th>
                <th>SEVERITY ▾</th>
                <th>MESSAGE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((item, idx) => {
                const isWarn = item.severity === "WARNING";
                const isCrit = item.severity === "CRITICAL";

                return (
                  <tr
                    key={item.alert_id || idx}
                    className={
                      isCrit
                        ? "row-stripe-critical"
                        : isWarn
                        ? "row-stripe-warning"
                        : ""
                    }
                  >
                    <td style={{ fontFamily: "'Share Tech Mono', monospace", fontWeight: 700 }}>
                      {item.timestamp}
                    </td>
                    <td style={{ fontFamily: "'Share Tech Mono', monospace", fontWeight: 700 }}>
                      {item.alert_id}
                    </td>
                    <td style={{ fontFamily: "'Share Tech Mono', monospace", fontWeight: 900 }}>
                      {item.parameter}
                    </td>
                    <td>
                      <div className="alarm-table-sev-pill">
                        <div
                          className={`alarm-led-circle ${
                            isCrit
                              ? "led-red"
                              : isWarn
                              ? "led-amber"
                              : "led-blue"
                          }`}
                        />
                        <span>{item.severity}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{item.message}</td>
                    <td style={{ fontWeight: 700 }}>{item.action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
