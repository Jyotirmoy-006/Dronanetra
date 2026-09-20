import React, { useState, useEffect, useMemo } from "react";
import {
  Terminal,
  Shield,
  Cpu,
  Wifi,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCode,
  Search,
  Filter,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Radio,
  Layers,
  Activity,
  Zap,
  Trash2,
  Gauge,
  Sliders,
} from "lucide-react";
import { api } from "../services/api";

/**
 * Precision Counter-sunk Pan-Head Screw SVG with realistic 3D metallic highlights
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
        <radialGradient id="canScrewHeadGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#d5d9df" />
          <stop offset="65%" stopColor="#8e949d" />
          <stop offset="100%" stopColor="#4a4e55" />
        </radialGradient>
        <radialGradient id="canScrewHoleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#4a4f57" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#canScrewHoleGrad)" stroke="#3a3e45" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="8.5" fill="url(#canScrewHeadGrad)" stroke="#2b2e34" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      <rect x="10.8" y="5.5" width="2.4" height="13" rx="0.5" fill="#1e2024" />
      <rect x="5.5" y="10.8" width="13" height="2.4" rx="0.5" fill="#1e2024" />
      <circle cx="9.5" cy="9.5" r="1" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

/**
 * Mechanical Tumbler Roller Drum Odometer Display
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
      ring: "#003366",
    },
  };

  const c = colorMap[color] || colorMap.green;

  return (
    <div
      style={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: c.bg,
        boxShadow: c.glow,
        border: `1px solid ${c.ring}`,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

/**
 * Skeuomorphic Avionics Plaque Container
 */
function PlaqueBox({ title, subTitle, icon: Icon, children, className = "" }) {
  return (
    <div className={`avionics-plaque ${className}`}>
      <CornerScrew style={{ position: "absolute", top: "5px", left: "5px" }} />
      <CornerScrew style={{ position: "absolute", top: "5px", right: "5px" }} />
      <CornerScrew style={{ position: "absolute", bottom: "5px", left: "5px" }} />
      <CornerScrew style={{ position: "absolute", bottom: "5px", right: "5px" }} />

      <div className="plaque-inner-card">
        <div className="plaque-header">
          {Icon && (
            <div className="plaque-icon-wrap">
              <Icon size={14} strokeWidth={2.5} />
            </div>
          )}
          <div className="plaque-titles">
            <h3 className="plaque-main-title">{title}</h3>
            <span className="plaque-sub-title">{subTitle}</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

export default function CANBusInspector({ telemetryData }) {
  const [canLogs, setCanLogs] = useState([]);
  const [busMetrics, setBusMetrics] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [expandedRow, setExpandedRow] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Initial load from backend CAN-Bus endpoint
  useEffect(() => {
    api.getCanBus()
      .then((res) => {
        if (res) {
          if (res.metrics) setBusMetrics(res.metrics);
          if (res.rolling_buffer && res.rolling_buffer.length > 0) {
            setCanLogs(res.rolling_buffer);
          } else if (res.active_frames && res.active_frames.length > 0) {
            setCanLogs(res.active_frames);
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch initial CAN bus buffer:", err));
  }, []);

  // Update live frames whenever new backend telemetry packet arrives (via WebSocket or prop)
  useEffect(() => {
    if (isPaused) return;

    if (telemetryData?.can_bus_metrics) {
      setBusMetrics(telemetryData.can_bus_metrics);
    }

    if (telemetryData?.can_frames && Array.isArray(telemetryData.can_frames) && telemetryData.can_frames.length > 0) {
      setCanLogs((prev) => {
        const newFrames = telemetryData.can_frames;
        const merged = [...newFrames, ...prev];
        return merged.slice(0, 80); // Keep last 80 live frames in rolling buffer
      });
    }
  }, [telemetryData, isPaused]);

  // Filtered frames based on search and category tabs
  const filteredLogs = useMemo(() => {
    return canLogs.filter((log) => {
      // Category filter
      if (selectedFilter !== "ALL") {
        if (selectedFilter === "EEC1" && !log.pgn?.includes("61444")) return false;
        if (selectedFilter === "ET1" && !log.pgn?.includes("65262")) return false;
        if (selectedFilter === "EFL" && !log.pgn?.includes("65263")) return false;
        if (selectedFilter === "LFE" && !log.pgn?.includes("65266")) return false;
        if (selectedFilter === "VIB" && !log.pgn?.includes("65279")) return false;
        if (selectedFilter === "VEP" && !log.pgn?.includes("65271")) return false;
        if (selectedFilter === "DM1" && !log.pgn?.includes("65226")) return false;
        if (selectedFilter === "PROP" && !log.pgn?.includes("65300")) return false;
      }

      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchId = log.id?.toLowerCase().includes(q);
        const matchPgn = log.pgn?.toLowerCase().includes(q);
        const matchPayload = log.payload?.toLowerCase().includes(q);
        const matchSource = log.source?.toLowerCase().includes(q);
        const matchName = log.name?.toLowerCase().includes(q);
        return matchId || matchPgn || matchPayload || matchSource || matchName;
      }

      return true;
    });
  }, [canLogs, selectedFilter, searchQuery]);

  const handleCopyPayload = (payload, id) => {
    navigator.clipboard.writeText(payload);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleClearBuffer = () => {
    setCanLogs([]);
  };

  const metrics = busMetrics || telemetryData?.can_bus_metrics || {
    channel: "can0 (vcan0 virtualized loopback)",
    protocol: "SAE J1939-11 (TAPAS-BH201 FADEC)",
    bitrate: "500 kbps",
    bus_state: "OPERATIONAL / ACTIVE",
    bus_load_pct: 39.5,
    frame_error_rate_pct: 0.04,
    total_frames_rx: canLogs.length || 29112,
    ecu_primary_status: "ECU_A: ACTIVE (WARNING)",
    ecu_secondary_status: "ECU_B: STANDBY (HOT-REDUNDANT)",
    governor_state: "FADEC CAUTION (DTC ACTIVE // LIMIT CAPPED: 85%)",
    active_nodes_count: 6,
    uav_platform: "TAPAS-BH201 MALE UAV",
    avionics_bus_power: "28.1 V // 50.3 A",
  };

  const isWarnBus = metrics.bus_state?.includes("WARN") || metrics.bus_state?.includes("ERROR") || Number(metrics.frame_error_rate_pct ?? 0) > 0;

  return (
    <div className="can-inspector-master-panel">
      {/* ══════════════════════════════════════════════════════════════════
           TOP HEADER & LIVE STREAM CONTROLS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="can-header-bar">
        <div className="can-title-group">
          <div className="can-live-beacon">
            <span className={`beacon-dot ${!isPaused ? "pulsing" : "paused"}`} />
            <span className="beacon-text">{!isPaused ? "LIVE CAN BUS STREAM (1 Hz // 500 kbps)" : "STREAM PAUSED"}</span>
          </div>
          <h3>
            <Terminal size={18} color="#000000" /> SocketCAN / FADEC J1939 Real-Time Protocol Inspector
          </h3>
          <p>Direct SocketCAN (can0) Hardware Tap // Real Binary Payload Decoded from Live Engine Telemetry</p>
        </div>

        <div className="can-actions-group">
          <button
            className={`btn-mode-toggle ${!isPaused ? "active" : ""}`}
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Resume Live CAN Bus Stream" : "Pause Stream to inspect frames"}
          >
            <RefreshCw size={13} className={!isPaused ? "spin" : ""} />
            <span>{isPaused ? "RESUME STREAM" : "PAUSE STREAM"}</span>
          </button>

          <button
            className="btn-mode-toggle"
            onClick={handleClearBuffer}
            title="Clear rolling frame buffer"
          >
            <Trash2 size={13} />
            <span>CLEAR BUFFER</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           LIVE CAN NETWORK HEALTH & PHYSICAL LAYER METRICS (Dashboard Plaque UI)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="grid-4" style={{ gap: "1rem", marginBottom: "0.25rem" }}>
        {/* Plaque 1: PRIMARY ECU STATUS */}
        <PlaqueBox
          title="PRIMARY ECU STATUS"
          subTitle="FADEC DUAL CONTROLLER"
          icon={Shield}
        >
          <div className="matrix-display-housing" style={{ margin: "4px 0" }}>
            <span className="matrix-led-text" style={{ fontSize: "0.78rem", color: "#ffffff", fontWeight: 900 }}>
              {metrics.ecu_primary_status?.replace("ECU_A: ", "") || "ACTIVE (PRIMARY)"}
            </span>
          </div>
          <div className="plaque-footer-strip">
            <div className="status-pill-wrap">
              <JewelLed color={isWarnBus ? "red" : "amber"} />
              <span className={`status-pill ${isWarnBus ? "pill-amber" : "pill-amber"}`}>
                {metrics.ecu_secondary_status ? "HOT-REDUNDANT" : "STANDBY"}
              </span>
            </div>
            <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#000" }}>
              {metrics.avionics_bus_power || "28.1 V // 50.3 A"}
            </span>
          </div>
        </PlaqueBox>

        {/* Plaque 2: BUS UTILIZATION LOAD */}
        <PlaqueBox
          title="BUS UTILIZATION LOAD"
          subTitle="can0 NETWORK BANDWIDTH"
          icon={Activity}
        >
          <div className="tumbler-container-center" style={{ margin: "4px 0" }}>
            <TumblerOdometer value={metrics.bus_load_pct ?? 39.5} decimals={1} unit="%" />
          </div>
          <div className="plaque-footer-strip">
            <div className="status-pill-wrap">
              <JewelLed color="amber" />
              <span className="status-pill pill-amber">500 kbps</span>
            </div>
            <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#000" }}>
              {metrics.total_frames_rx || 29112} RX // {metrics.active_nodes_count || 6} NODES
            </span>
          </div>
        </PlaqueBox>

        {/* Plaque 3: PHYSICAL BITRATE & PROTOCOL */}
        <PlaqueBox
          title="PHYSICAL BITRATE"
          subTitle="SAE J1939-11 (TAPAS-BH201)"
          icon={Wifi}
        >
          <div className="matrix-display-housing" style={{ margin: "4px 0" }}>
            <span className="matrix-led-text" style={{ fontSize: "0.85rem", color: "#ffffff", fontWeight: 900 }}>
              {metrics.bitrate || "500 kbps"} J1939
            </span>
          </div>
          <div className="plaque-footer-strip">
            <div className="status-pill-wrap">
              <JewelLed color="amber" />
              <span className="status-pill pill-amber">J1939-11</span>
            </div>
            <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#000" }}>
              {metrics.uav_platform || "TAPAS-BH201 UAV"}
            </span>
          </div>
        </PlaqueBox>

        {/* Plaque 4: FRAME INTEGRITY / ERROR RATE */}
        <PlaqueBox
          title="FRAME ERROR RATE"
          subTitle="CRC INTEGRITY & GOVERNOR"
          icon={CheckCircle2}
        >
          <div className="tumbler-container-center" style={{ margin: "4px 0" }}>
            <TumblerOdometer
              value={metrics.frame_error_rate_pct ?? 0.04}
              decimals={2}
              unit="%"
              amberRightmost={Number(metrics.frame_error_rate_pct ?? 0) > 0}
            />
          </div>
          <div className="plaque-footer-strip">
            <div className="status-pill-wrap">
              <JewelLed color={Number(metrics.frame_error_rate_pct ?? 0) > 0 ? "red" : "amber"} />
              <span className={`status-pill ${Number(metrics.frame_error_rate_pct ?? 0) > 0 ? "pill-amber" : "pill-amber"}`}>
                {Number(metrics.frame_error_rate_pct ?? 0) > 0 ? "0.04% RETRY" : "0 CRC ERR"}
              </span>
            </div>
            <span className="stamped-tech-note" style={{ fontWeight: 900, color: "#000", maxWidth: "135px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={metrics.governor_state}>
              {metrics.governor_state || "FADEC CLOSED-LOOP"}
            </span>
          </div>
        </PlaqueBox>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           SEARCH & PGN FILTER TABS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="can-filter-bar">
        <div className="can-search-wrap">
          <Search size={14} className="can-search-icon" />
          <input
            type="text"
            className="can-search-input"
            placeholder="Filter by CAN ID (0x0CF00400), PGN (61444), Source, or Hex..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="can-search-clear" onClick={() => setSearchQuery("")}>
              ✕
            </button>
          )}
        </div>

        <div className="can-pgn-tabs">
          {[
            { id: "ALL", label: "ALL FRAMES" },
            { id: "EEC1", label: "EEC1 (RPM/TORQ)" },
            { id: "ET1", label: "ET1 (TEMPS)" },
            { id: "EFL", label: "EFL (PRESSURE)" },
            { id: "LFE", label: "LFE (FUEL)" },
            { id: "VIB", label: "VIB (SPECTRAL)" },
            { id: "VEP", label: "VEP (ELECTRICAL)" },
            { id: "DM1", label: "DM1 (DIAG DTC)" },
            { id: "PROP", label: "PROP (TWIN)" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`can-tab-btn ${selectedFilter === tab.id ? "active" : ""}`}
              onClick={() => setSelectedFilter(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
           LIVE J1939 CAN FRAME TABLE WITH EXPANDABLE SIGNAL TREE
         ══════════════════════════════════════════════════════════════════ */}
      <div className="can-terminal-container">
        <div className="can-table-scroll-wrap">
          <div className="can-terminal-header">
            <span style={{ width: "45px", flexShrink: 0, textAlign: "center" }}>EXP</span>
            <span style={{ width: "125px", flexShrink: 0 }}>TIME (UTC)</span>
            <span style={{ width: "135px", flexShrink: 0 }}>CAN ID (29-BIT)</span>
            <span style={{ width: "210px", flexShrink: 0 }}>PGN // FUNCTION</span>
            <span style={{ width: "190px", flexShrink: 0 }}>SOURCE NODE</span>
            <span style={{ width: "65px", flexShrink: 0 }}>DLC</span>
            <span style={{ minWidth: "280px", flex: 1, flexShrink: 0 }}>HEX RAW PAYLOAD (BYTES 0–7)</span>
            <span style={{ width: "90px", flexShrink: 0, textAlign: "right" }}>STATUS</span>
          </div>

          <div className="can-terminal-body">
            {filteredLogs.length === 0 ? (
              <div className="can-empty-state">
                <FileCode size={28} color="var(--text-muted)" />
                <div>No CAN frames matching filter or waiting for live stream packet...</div>
              </div>
            ) : (
              filteredLogs.map((frame, index) => {
                const isExpanded = expandedRow === index;
                const rowKey = `${frame.timestamp}_${frame.id}_${index}`;
                const isError = frame.status === "ERROR";
                const isWarn = frame.status === "WARN";

                return (
                  <div key={rowKey} className={`can-frame-entry ${isExpanded ? "expanded" : ""} ${isError ? "entry-error" : isWarn ? "entry-warn" : ""}`}>
                    <div
                      className="can-frame-row"
                      onClick={() => setExpandedRow(isExpanded ? null : index)}
                    >
                      <span style={{ width: "45px", flexShrink: 0, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {isExpanded ? <ChevronDown size={14} color="#ffffff" /> : <ChevronRight size={14} color="#94a3b8" />}
                      </span>
                      <span style={{ width: "125px", flexShrink: 0, fontFamily: "var(--font-mono)", color: "#94a3b8", fontWeight: 800 }}>
                        {frame.timestamp ? frame.timestamp.slice(11, 23) : "14:30:00.000"}
                      </span>
                      <span style={{ width: "135px", flexShrink: 0, fontWeight: 900, fontFamily: "var(--font-mono)", color: "#ffffff" }}>
                        {frame.id}
                      </span>
                      <span style={{ width: "210px", flexShrink: 0, fontWeight: 800, color: "#cbd5e1" }}>
                        {frame.pgn}
                      </span>
                      <span style={{ width: "190px", flexShrink: 0, color: "#94a3b8", fontSize: "0.68rem", fontWeight: 800 }}>
                        {frame.source}
                      </span>
                      <span style={{ width: "65px", flexShrink: 0, fontFamily: "var(--font-mono)", fontWeight: 800, color: "#cbd5e1" }}>
                        {frame.dlc || 8} B
                      </span>
                      <span style={{ minWidth: "280px", flex: 1, flexShrink: 0, fontFamily: "var(--font-mono)", color: "#ffffff", letterSpacing: "1.2px", fontWeight: 900 }}>
                        {frame.payload}
                      </span>
                      <span style={{ width: "90px", flexShrink: 0, textAlign: "right" }}>
                        <span className={`can-status-tag ${isError ? "tag-error" : isWarn ? "tag-warn" : "tag-ok"}`}>
                          {frame.status || "OK"}
                        </span>
                      </span>
                    </div>

                    {/* Expandable Engineering Signal Breakdown */}
                    {isExpanded && (
                      <div className="can-signal-details">
                        <div className="signal-details-header">
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Layers size={13} color="#ffffff" />
                            <strong>{frame.name || frame.pgn} — Decoded Physical Engineering Signals</strong>
                          </div>
                          <button
                            className="btn-copy-hex"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyPayload(frame.payload, rowKey);
                            }}
                            title="Copy raw hex payload"
                          >
                            {copiedId === rowKey ? <Check size={12} color="#ffffff" /> : <Copy size={12} />}
                            <span>{copiedId === rowKey ? "COPIED HEX" : "COPY HEX"}</span>
                          </button>
                        </div>

                        <div className="signal-grid">
                          {frame.signals ? (
                            Object.entries(frame.signals).map(([sigKey, sigVal]) => (
                              <div key={sigKey} className="signal-card">
                                <div className="sig-name">{sigKey}</div>
                                <div className="sig-value">{sigVal}</div>
                              </div>
                            ))
                          ) : (
                            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                              Standard J1939 8-byte payload encoded from live avionics sensors.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
