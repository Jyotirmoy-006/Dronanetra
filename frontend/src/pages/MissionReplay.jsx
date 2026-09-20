import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Play, Pause, RotateCcw, Search, SkipBack, SkipForward, ChevronLeft, ChevronRight,
  Shield, Calendar, Download, CheckCircle2, AlertTriangle, Activity, Gauge, Flame, Wind, 
  Clock, Radio, Terminal, Compass, Layers, Wrench
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, 
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, ReferenceLine 
} from "recharts";
import { api } from "../services/api";

/**
 * Precision Counter-sunk Pan-Head Screw SVG with 3D metallic highlights
 */
function CornerScrew({ size = 11, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{
        display: "block",
        filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.55))",
        ...style,
      }}
    >
      <defs>
        <radialGradient id="screwHeadGradMR" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#d5d9df" />
          <stop offset="65%" stopColor="#8e949d" />
          <stop offset="100%" stopColor="#4a4e55" />
        </radialGradient>
        <radialGradient id="screwHoleGradMR" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1c20" />
          <stop offset="100%" stopColor="#4a4f57" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill="url(#screwHoleGradMR)" stroke="#3a3e45" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="8.5" fill="url(#screwHeadGradMR)" stroke="#2b2e34" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.5" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
      <rect x="10.8" y="5.5" width="2.4" height="13" rx="0.5" fill="#1e2024" />
      <rect x="5.5" y="10.8" width="13" height="2.4" rx="0.5" fill="#1e2024" />
      <circle cx="9.5" cy="9.5" r="1" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

/**
 * Small High-Contrast Dark Metallic Plaque Screw Accent
 */
function TinyScrew({ size = 10, style = {} }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      style={{
        display: "block",
        filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.75))",
        ...style,
      }}
    >
      <defs>
        <radialGradient id="tinyScrewHole" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#080a0d" />
          <stop offset="85%" stopColor="#1e232a" />
          <stop offset="100%" stopColor="#3d444f" />
        </radialGradient>
        <radialGradient id="tinyScrewHead" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#8a94a2" />
          <stop offset="35%" stopColor="#4a525f" />
          <stop offset="70%" stopColor="#252a32" />
          <stop offset="100%" stopColor="#12161c" />
        </radialGradient>
      </defs>
      {/* Outer Dark Recessed Hole */}
      <circle cx="10" cy="10" r="9.5" fill="url(#tinyScrewHole)" stroke="#090c10" strokeWidth="0.8" />
      {/* Screw Head Dome */}
      <circle cx="10" cy="10" r="7.5" fill="url(#tinyScrewHead)" stroke="#0b0e12" strokeWidth="0.7" />
      <circle cx="10" cy="10" r="6.6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
      {/* Crosshead Slots (Dark & Deep) */}
      <rect x="9.0" y="4.5" width="2.0" height="11" rx="0.4" fill="#050709" />
      <rect x="4.5" y="9.0" width="11" height="2.0" rx="0.4" fill="#050709" />
      {/* Metallic Specular Highlight */}
      <circle cx="7.8" cy="7.8" r="0.9" fill="rgba(255,255,255,0.85)" />
    </svg>
  );
}

/**
 * Realistic Military UAV Aircraft Flight Thumbnail (Using user-uploaded mission flight photos)
 */
function UavFlightThumbnail({ variant = "alpha" }) {
  const imgSrc = variant === "recon" 
    ? "/mission_thumb_recon.png" 
    : (variant === "demo" ? "/mission_thumb_demo.png" : "/mission_thumb_alpha.png");

  const imgAlt = variant === "recon" 
    ? "Border Surveillance Patrol Recon-4" 
    : (variant === "demo" ? "Tactical ISR Hot-Weather Demonstration" : "High Altitude Endurance Test Alpha");

  return (
    <img
      src={imgSrc}
      alt={imgAlt}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
      }}
    />
  );
}

/**
 * Tactical UAV Green Holographic CAD Schematic (User-Uploaded Image with Background Removed)
 */
function UavWireframeSchematic() {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <img
        src="/uav_green_schematic.png"
        alt="UAV Holographic CAD Wireframe"
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          filter: "drop-shadow(0 0 10px rgba(0, 255, 157, 0.55)) brightness(1.1)",
        }}
      />
    </div>
  );
}

/**
 * Mechanical Tumbler Roller Drum Odometer Display on Machined Plaque
 */
function PlaqueTumblerGauge({ label, value, unit = "", decimals = 0, padStart = 0, icon = null }) {
  const chars = useMemo(() => {
    if (value === null || value === undefined || isNaN(value)) return ["0"];
    const num = Number(value);
    let str = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
    if (padStart > 0) {
      str = str.padStart(padStart, "0");
    }
    return str.split("");
  }, [value, decimals, padStart]);

  return (
    <div className="replay-plaque-gauge">
      <TinyScrew size={10} style={{ position: "absolute", top: 4, left: 4 }} />
      <TinyScrew size={10} style={{ position: "absolute", top: 4, right: 4 }} />
      <TinyScrew size={10} style={{ position: "absolute", bottom: 4, left: 4 }} />
      <TinyScrew size={10} style={{ position: "absolute", bottom: 4, right: 4 }} />

      <div className="replay-plaque-label">
        <span>{label}</span>
      </div>

      <div className="replay-tumbler-window">
        {chars.map((ch, idx) => (
          <div key={idx} className="replay-tumbler-cell">
            {ch}
          </div>
        ))}
        {unit && <span className="replay-tumbler-unit">{unit}</span>}
      </div>
    </div>
  );
}

/**
 * Format raw seconds into standard T+HH:MM:SS format
 */
export function formatMET(totalSeconds) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  return `T+${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Safely parse any MET string or seconds value into total elapsed seconds
 */
export function parseMETSeconds(val) {
  if (typeof val === "number" && !isNaN(val)) {
    return Math.max(0, Math.floor(val));
  }
  if (!val || typeof val !== "string") return 0;

  const clean = val.trim().replace(/^T[+\-]?\s*/i, "");
  if (clean.includes(":")) {
    const parts = clean.split(":").map((p) => parseInt(p, 10) || 0);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    }
  }
  const match = clean.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10) || 0;
  }
  return 0;
}

/**
 * Split Mechanical Timer Display (T + 0 0 : 0 0 : 0 0)
 */
function TimerOdometer({ offsetStr = "T+00:00:00", seconds = null }) {
  let totalSec = 0;
  if (typeof seconds === "number" && !isNaN(seconds)) {
    totalSec = Math.max(0, Math.floor(seconds));
  } else {
    totalSec = parseMETSeconds(offsetStr);
  }

  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  const hh = String(hrs).padStart(2, "0").slice(-2);
  const mm = String(mins).padStart(2, "0").slice(-2);
  const ss = String(secs).padStart(2, "0").slice(-2);

  return (
    <div className="replay-timer-chassis">
      <div className="replay-timer-cell" style={{ color: "#ffffff" }}>T</div>
      <div className="replay-timer-separator" style={{ color: "#ffffff" }}>+</div>
      <div className="replay-timer-cell">{hh[0]}</div>
      <div className="replay-timer-cell">{hh[1]}</div>
      <div className="replay-timer-separator">:</div>
      <div className="replay-timer-cell">{mm[0]}</div>
      <div className="replay-timer-cell">{mm[1]}</div>
      <div className="replay-timer-separator">:</div>
      <div className="replay-timer-cell">{ss[0]}</div>
      <div className="replay-timer-cell">{ss[1]}</div>
    </div>
  );
}

export default function MissionReplay({ telemetryData, history }) {
  const [missions, setMissions] = useState([
    {
      mission_id: "MSN-2026-0814",
      name: "High Altitude Endurance Test Alpha",
      uav_id: "UAV-TAPAS-BH-201",
      engine_id: "ENG-ROTAX-914-01",
      date_str: "2026-08-14",
      time_utc: "06:00:00 - 14:30:00 (UTC)",
      duration_hours: 8.5,
      max_altitude_m: 4200,
      anomalies_detected: 1,
      summary: "High altitude endurance trial. Minor thermal residual elevation detected at T+04:20:00 during lean high-altitude cruise.",
    },
    {
      mission_id: "MSN-2026-0822",
      name: "Border Surveillance Patrol Recon-4",
      uav_id: "UAV-TAPAS-BH-201",
      engine_id: "ENG-ROTAX-914-01",
      date_str: "2026-08-22",
      time_utc: "10:15:00 - 21:00:00 (UTC)",
      duration_hours: 10.75,
      max_altitude_m: 3800,
      anomalies_detected: 0,
      summary: "10-hour maritime surveillance patrol. All thermodynamic and mechanical parameters remained nominal throughout flight.",
    },
    {
      mission_id: "MSN-2026-0829",
      name: "Tactical ISR Hot-Weather Demonstration",
      uav_id: "UAV-TAPAS-BH-201",
      engine_id: "ENG-ROTAX-914-01",
      date_str: "2026-08-29",
      time_utc: "11:00:00 - 17:45:00 (UTC)",
      duration_hours: 6.75,
      max_altitude_m: 3500,
      anomalies_detected: 2,
      summary: "Desert testing at 46°C ambient ground temperature. Cylinder #2 temperature reached caution range during initial steep climb.",
    },
  ]);

  const [selectedHistoricalId, setSelectedHistoricalId] = useState("MSN-2026-0814");
  const isLiveMode = selectedHistoricalId === "LIVE_ACTIVE_SESSION";
  const [historicalPoints, setHistoricalPoints] = useState([]);
  const [historicalIndex, setHistoricalIndex] = useState(0);
  const [isHistoricalPlaying, setIsHistoricalPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const historicalIntervalRef = useRef(null);

  // Live session play/pause, buffer replay, and flight clock state
  const [isLivePlaying, setIsLivePlaying] = useState(true);
  const [isLiveBufferPlaying, setIsLiveBufferPlaying] = useState(false);
  const [frozenLiveSnapshot, setFrozenLiveSnapshot] = useState(null);
  const [liveScrubIndex, setLiveScrubIndex] = useState(null);
  const liveFlightStartRef = useRef(null);
  const [liveElapsedSeconds, setLiveElapsedSeconds] = useState(0);

  // Anchor live flight start epoch once when initial history is available
  useEffect(() => {
    if (liveFlightStartRef.current === null) {
      if (history && history.length > 0 && history[0]?.timestamp) {
        const firstTime = new Date(history[0].timestamp).getTime();
        if (!isNaN(firstTime) && firstTime > 0) {
          liveFlightStartRef.current = firstTime;
        } else {
          liveFlightStartRef.current = Date.now() - (history.length - 1) * 1000;
        }
      } else {
        liveFlightStartRef.current = Date.now();
      }
    }
  }, [history]);

  // Load missions list from API
  useEffect(() => {
    api.getMissions()
      .then((data) => {
        if (data && data.missions && data.missions.length > 0) {
          const formatted = data.missions.map((m) => {
            const startStr = m.start_time ? m.start_time.slice(0, 10) : "2026-08-14";
            const timeRange = m.start_time && m.end_time 
              ? `${m.start_time.slice(11, 19)} - ${m.end_time.slice(11, 19)} (UTC)`
              : (m.start_time ? `${m.start_time.slice(11, 19)} (UTC)` : "06:00:00 - 14:30:00 (UTC)");

            return {
              ...m,
              date_str: startStr,
              time_utc: timeRange,
            };
          });
          setMissions(formatted);
          if (!selectedHistoricalId || !data.missions.some(m => m.mission_id === selectedHistoricalId)) {
            setSelectedHistoricalId(data.missions[0].mission_id);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load missions:", err);
      });
  }, []);

  // Load historical mission series directly from backend API
  useEffect(() => {
    if (!selectedHistoricalId || selectedHistoricalId === "LIVE_ACTIVE_SESSION") return;
    setLoading(true);
    api.getMissionTelemetry(selectedHistoricalId)
      .then((data) => {
        if (data && data.telemetry_series && data.telemetry_series.length > 0) {
          const pts = data.telemetry_series.map((p, idx) => ({
            ...p,
            step: p.step ?? idx,
            time: p.time_utc || p.time || p.timestamp_offset || `T+${idx}`,
            time_utc: p.time_utc || p.time || p.timestamp_offset || `T+${idx}`,
            timestamp_offset: p.timestamp_offset || formatMET(Math.floor((idx / Math.max(1, data.telemetry_series.length - 1)) * 8.5 * 3600)),
            rpm: p.rpm ?? p.telemetry?.rpm ?? 4800,
            egt: p.egt ?? p.telemetry?.egt ?? 720,
            cht: p.cht ?? p.telemetry?.cht ?? 124,
            vibration: p.vibration ?? p.telemetry?.vibration ?? 0.8,
            fuel_flow: p.fuel_flow ?? p.telemetry?.fuel_flow ?? 18.2,
            altitude: p.altitude ?? p.telemetry?.altitude ?? 3200,
            oil_pressure: p.oil_pressure ?? p.telemetry?.oil_pressure ?? 4.5,
            oil_temp: p.oil_temp ?? p.telemetry?.oil_temp ?? 85.0,
            throttle: p.throttle ?? p.telemetry?.throttle ?? 74.0,
            health_score: p.health_score ?? 98.0,
            anomaly_score: p.anomaly_score ?? 0.05,
            predicted_fault: p.predicted_fault ?? "NORMAL",
            phase: p.phase || "CRUISE",
            event: p.event || "Nominal Flight Profile",
          }));
          setHistoricalPoints(pts);
          setHistoricalIndex(0);
        }
      })
      .catch((err) => {
        console.error("Failed to load mission telemetry:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedHistoricalId]);

  // Live points from active WebSocket / polling session
  const incomingLivePoints = useMemo(() => {
    const anchor = liveFlightStartRef.current || (Date.now() - (history?.length || 1) * 1000);

    if (!history || history.length === 0) {
      if (telemetryData) {
        const offsetSec = liveElapsedSeconds || 0;
        return [{
          step: 0,
          time: telemetryData.timestamp ? telemetryData.timestamp.slice(11, 19) : "LIVE",
          time_utc: telemetryData.timestamp ? telemetryData.timestamp.slice(11, 19) : "LIVE",
          timestamp_offset: formatMET(offsetSec),
          elapsed_seconds: offsetSec,
          rpm: telemetryData.telemetry?.rpm ?? 4800,
          egt: telemetryData.telemetry?.egt ?? 720,
          cht: telemetryData.telemetry?.cht ?? 124,
          vibration: telemetryData.telemetry?.vibration ?? 0.8,
          fuel_flow: telemetryData.telemetry?.fuel_flow ?? 18.2,
          altitude: telemetryData.telemetry?.altitude ?? 3200,
          oil_pressure: telemetryData.telemetry?.oil_pressure ?? 4.5,
          oil_temp: telemetryData.telemetry?.oil_temp ?? 85.0,
          throttle: telemetryData.telemetry?.throttle ?? 74.0,
          health_score: telemetryData.health_score ?? 98.0,
          anomaly_score: telemetryData.anomaly_score ?? 0.05,
          predicted_fault: telemetryData.predicted_fault ?? "NORMAL",
          phase: "AIRBORNE / CRUISE",
          event: "Real-Time Telemetry Stream",
        }];
      }
      return [];
    }

    return history.map((item, idx) => {
      const tel = item.telemetry || item;
      const t = item.timestamp || "";
      let ptSec = 0;
      if (t) {
        const parsed = new Date(t).getTime();
        if (!isNaN(parsed) && parsed > 0 && anchor) {
          ptSec = Math.max(0, Math.floor((parsed - anchor) / 1000));
        } else {
          ptSec = Math.max(0, liveElapsedSeconds - (history.length - 1 - idx));
        }
      } else {
        ptSec = Math.max(0, liveElapsedSeconds - (history.length - 1 - idx));
      }

      return {
        step: idx,
        time: t.includes("T") ? t.slice(11, 19) : (t || "LIVE"),
        time_utc: t.includes("T") ? t.slice(11, 19) : (t || "LIVE"),
        timestamp_offset: formatMET(ptSec),
        elapsed_seconds: ptSec,
        rpm: tel.rpm ?? 4800,
        egt: tel.egt ?? 720,
        cht: tel.cht ?? 124,
        vibration: tel.vibration ?? 0.8,
        fuel_flow: tel.fuel_flow ?? 18.2,
        altitude: tel.altitude ?? 3200,
        oil_pressure: tel.oil_pressure ?? 4.5,
        oil_temp: tel.oil_temp ?? 85.0,
        throttle: tel.throttle ?? 74.0,
        health_score: item.health_score ?? 98.0,
        anomaly_score: item.anomaly_score ?? 0.05,
        predicted_fault: item.predicted_fault ?? "NORMAL",
        phase: item.operating_phase || "AIRBORNE / CRUISE",
        event: idx === history.length - 1 ? "Live Current Packet" : `Buffered Telemetry #${idx + 1}`,
      };
    });
  }, [history, telemetryData, liveElapsedSeconds]);

  const isPlaying = isLiveMode ? (isLivePlaying || isLiveBufferPlaying) : isHistoricalPlaying;

  // In Live Mode: when playing live, use live incoming points; when paused/scrubbing/buffer-replaying, use frozen snapshot
  const activePoints = isLiveMode
    ? (isLivePlaying ? incomingLivePoints : (frozenLiveSnapshot || incomingLivePoints))
    : historicalPoints;

  // Active Index: In live mode when playing live, stay at live edge; when paused/buffer-replaying, stay at scrubbed frame
  const currentActiveIndex = isLiveMode
    ? (isLivePlaying
        ? Math.max(0, activePoints.length - 1)
        : (liveScrubIndex !== null ? Math.min(liveScrubIndex, Math.max(0, activePoints.length - 1)) : Math.max(0, activePoints.length - 1)))
    : historicalIndex;

  // Live session 1-second MET ticker (ticks up every second while live streaming)
  useEffect(() => {
    if (!isLiveMode || !isLivePlaying) return;

    if (liveFlightStartRef.current) {
      const now = Date.now();
      setLiveElapsedSeconds(Math.max(0, Math.floor((now - liveFlightStartRef.current) / 1000)));
    }

    const timer = setInterval(() => {
      if (liveFlightStartRef.current) {
        const now = Date.now();
        setLiveElapsedSeconds(Math.max(0, Math.floor((now - liveFlightStartRef.current) / 1000)));
      } else {
        setLiveElapsedSeconds((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveMode, isLivePlaying]);

  // Live buffer playback loop (plays forward through paused buffer until live edge)
  useEffect(() => {
    if (!isLiveMode || !isLiveBufferPlaying) return;
    const interval = setInterval(() => {
      setLiveScrubIndex((prev) => {
        const maxIdx = (frozenLiveSnapshot || incomingLivePoints).length - 1;
        const current = prev !== null ? prev : 0;
        const next = current + 1;
        if (next >= maxIdx) {
          // Caught up to live edge! Resume active live stream
          setIsLiveBufferPlaying(false);
          setFrozenLiveSnapshot(null);
          setLiveScrubIndex(null);
          setIsLivePlaying(true);
          return null;
        }
        return next;
      });
    }, Math.max(50, Math.floor(1000 / playbackSpeed)));

    return () => clearInterval(interval);
  }, [isLiveMode, isLiveBufferPlaying, playbackSpeed, frozenLiveSnapshot, incomingLivePoints]);

  // Historical playback loop
  useEffect(() => {
    if (isLiveMode) return;
    if (isHistoricalPlaying && historicalPoints.length > 0) {
      historicalIntervalRef.current = setInterval(() => {
        setHistoricalIndex((prev) => {
          if (prev >= historicalPoints.length - 1) {
            setIsHistoricalPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, Math.max(40, Math.floor(600 / playbackSpeed)));
    } else {
      clearInterval(historicalIntervalRef.current);
    }
    return () => clearInterval(historicalIntervalRef.current);
  }, [isHistoricalPlaying, playbackSpeed, historicalPoints, isLiveMode]);

  const currentDisplayPoint = activePoints[currentActiveIndex] || activePoints[activePoints.length - 1] || activePoints[0] || {
    timestamp_offset: "T+00:00:00",
    time_utc: "06:00:00",
    phase: "TAKEOFF / CLIMB",
    event: "Takeoff Roll & Max Power Climb",
    rpm: 5450,
    egt: 770,
    cht: 138,
    vibration: 1.1,
    fuel_flow: 17.39,
    altitude: 100,
    oil_pressure: 4.91,
    oil_temp: 85,
    throttle: 94,
    health_score: 98,
    anomaly_score: 0.05,
    predicted_fault: "NORMAL",
    rul_hours: 450,
  };

  const currentMissionMeta = isLiveMode
    ? {
        mission_id: "LIVE_ACTIVE_SESSION",
        name: "Live Flight Session // TAPAS-BH201",
        duration_hours: ((activePoints ? activePoints.length * 2 : 60) / 3600).toFixed(2),
        max_altitude_m: Math.max(...(activePoints || []).map((h) => h.altitude || 3200), 3200),
        engine_id: "ENG-ROTAX-914-01",
        date_str: "CURRENT FLIGHT",
        time_utc: isLivePlaying ? "LIVE ROLLING STREAM" : "STREAM PAUSED",
        summary: "Real-time live telemetry capture from active airborne UAV digital twin.",
        anomalies_detected: telemetryData?.active_alerts?.length || 0,
      }
    : missions.find((m) => m.mission_id === selectedHistoricalId) || missions[0] || {
        mission_id: selectedHistoricalId || "MSN-2026-0814",
        name: "High Altitude Endurance Test Alpha",
        duration_hours: 8.5,
        max_altitude_m: 4200,
        engine_id: "ENG-ROTAX-914-01",
        date_str: "2026-08-14",
        time_utc: "06:00:00 - 14:30:00 (UTC)",
      };

  // Formatted chart series for dual graph panels directly from backend data
  const chartData = useMemo(() => {
    return activePoints.map((p) => ({
      ...p,
      time: p.time_utc || p.time || p.timestamp_offset,
      altitude: p.altitude,
      health_score: p.health_score,
      egt: p.egt,
      cht: p.cht,
      vibration: p.vibration,
    }));
  }, [activePoints]);

  // Unified Play / Pause Toggle
  const togglePlayPause = () => {
    if (isLiveMode) {
      if (isLivePlaying || isLiveBufferPlaying) {
        // Pausing: freeze current snapshot and position
        setFrozenLiveSnapshot([...incomingLivePoints]);
        setLiveScrubIndex(currentActiveIndex);
        setIsLivePlaying(false);
        setIsLiveBufferPlaying(false);
      } else {
        // If scrubbed back in the buffer, play forward through the buffer!
        // If at the live edge, resume live streaming!
        const maxIdx = (frozenLiveSnapshot || incomingLivePoints).length - 1;
        if (liveScrubIndex !== null && liveScrubIndex < maxIdx) {
          setIsLiveBufferPlaying(true);
        } else {
          setFrozenLiveSnapshot(null);
          setLiveScrubIndex(null);
          setIsLivePlaying(true);
          setIsLiveBufferPlaying(false);
        }
      }
    } else {
      setIsHistoricalPlaying((prev) => !prev);
    }
  };

  // Transport Control Handlers
  const handleRestart = () => {
    if (isLiveMode) {
      setIsLiveBufferPlaying(false);
      if (isLivePlaying) {
        setFrozenLiveSnapshot([...incomingLivePoints]);
        setIsLivePlaying(false);
      }
      setLiveScrubIndex(0);
    } else {
      setHistoricalIndex(0);
      setIsHistoricalPlaying(false);
    }
  };

  const handleStepFirst = () => {
    if (isLiveMode) {
      setIsLiveBufferPlaying(false);
      if (isLivePlaying) {
        setFrozenLiveSnapshot([...incomingLivePoints]);
        setIsLivePlaying(false);
      }
      setLiveScrubIndex(0);
    } else {
      setHistoricalIndex(0);
      setIsHistoricalPlaying(false);
    }
  };

  const handleStepBack = () => {
    if (isLiveMode) {
      setIsLiveBufferPlaying(false);
      if (isLivePlaying) {
        setFrozenLiveSnapshot([...incomingLivePoints]);
        setIsLivePlaying(false);
        setLiveScrubIndex(Math.max(0, incomingLivePoints.length - 2));
      } else {
        setLiveScrubIndex((prev) => Math.max(0, (prev ?? (activePoints.length - 1)) - 1));
      }
    } else {
      setHistoricalIndex((prev) => Math.max(0, prev - 1));
      setIsHistoricalPlaying(false);
    }
  };

  const handleStepForward = () => {
    if (isLiveMode) {
      setIsLiveBufferPlaying(false);
      if (isLivePlaying) return;
      const maxIdx = activePoints.length - 1;
      setLiveScrubIndex((prev) => {
        const next = Math.min(maxIdx, (prev ?? maxIdx) + 1);
        if (next === maxIdx) {
          setFrozenLiveSnapshot(null);
          setLiveScrubIndex(null);
          setIsLivePlaying(true);
        }
        return next;
      });
    } else {
      setHistoricalIndex((prev) => Math.min(activePoints.length - 1, prev + 1));
      setIsHistoricalPlaying(false);
    }
  };

  const handleStepLast = () => {
    if (isLiveMode) {
      setIsLiveBufferPlaying(false);
      setFrozenLiveSnapshot(null);
      setLiveScrubIndex(null);
      setIsLivePlaying(true);
    } else {
      setHistoricalIndex(activePoints.length - 1);
      setIsHistoricalPlaying(false);
    }
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    if (isLiveMode) {
      setIsLiveBufferPlaying(false);
      const maxIdx = (frozenLiveSnapshot || incomingLivePoints).length - 1;
      if (val >= maxIdx) {
        setFrozenLiveSnapshot(null);
        setLiveScrubIndex(null);
        setIsLivePlaying(true);
      } else {
        if (isLivePlaying) {
          setFrozenLiveSnapshot([...incomingLivePoints]);
          setIsLivePlaying(false);
        }
        setLiveScrubIndex(val);
      }
    } else {
      setHistoricalIndex(val);
      setIsHistoricalPlaying(false);
    }
  };

  return (
    <div className="mission-replay-container">
      {/* ══════════════════════════════════════════════════════════════════
           TOP ROW: MISSION LIBRARY & HISTORICAL FLIGHT PLAYBACK
         ══════════════════════════════════════════════════════════════════ */}
      <div className="replay-avionics-grid-top">
        
        {/* PANEL 1: RECORDED MISSION LIBRARY */}
        <div className="replay-metal-chassis">
          {/* Corner Screws */}
          <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

          <div className="replay-chassis-header">
            <span className="replay-chassis-title" style={{ paddingLeft: 14 }}>RECORDED MISSION LIBRARY</span>
            <Search size={14} color="#1a202c" style={{ marginRight: 14, cursor: "pointer" }} />
          </div>

          <div className="replay-library-cards-wrap">
            {/* Live Active Session Option */}
            <div
              className={`replay-mission-card ${isLiveMode ? "active" : "inactive"}`}
              style={{
                borderColor: isLiveMode ? "#f59e0b" : "rgba(245, 158, 11, 0.35)",
                background: isLiveMode ? "rgba(245, 158, 11, 0.1)" : "rgba(10, 18, 30, 0.45)",
              }}
              onClick={() => {
                setSelectedHistoricalId("LIVE_ACTIVE_SESSION");
                setFrozenLiveSnapshot(null);
                setLiveScrubIndex(null);
                setIsLiveBufferPlaying(false);
                setIsLivePlaying(true);
              }}
            >
              <div className="replay-card-thumb" style={{ position: "relative" }}>
                <UavFlightThumbnail variant="alpha" />
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    left: "4px",
                    background: "rgba(0, 0, 0, 0.85)",
                    border: "1px solid #f59e0b",
                    borderRadius: "4px",
                    padding: "2px 5px",
                    fontSize: "0.58rem",
                    fontWeight: 900,
                    color: "#fbbf24",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span className="pulse-dot-amber" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#fbbf24" }} /> LIVE
                </span>
              </div>
              <div className="replay-card-meta">
                <div className="replay-card-title" style={{ color: isLiveMode ? "#fbbf24" : "#f1f5f9" }}>
                  Live Active Flight Session
                </div>
                <div className="replay-card-sub">ID: LIVE_STREAM // TAPAS-BH201</div>
                <div className="replay-card-sub">Packets: {activePoints?.length || history?.length || 1} Rolling Samples</div>
                <div className="replay-card-sub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Alt: {currentDisplayPoint?.altitude || telemetryData?.telemetry?.altitude || 3200} m</span>
                  <span className="replay-card-badge" style={{ color: "#fbbf24", borderColor: "#f59e0b" }}>
                    {isLiveMode && !isLivePlaying && !isLiveBufferPlaying ? "⏸ PAUSED STREAM" : (isLiveBufferPlaying ? "▶ BUFFER REPLAY" : "🔴 ACTIVE STREAM")}
                  </span>
                </div>
              </div>
            </div>

            {missions.map((m) => {
              const isSel = selectedHistoricalId === m.mission_id;
              const variant = (m.mission_id && m.mission_id.includes("0822")) || m.name.toLowerCase().includes("recon") || m.name.toLowerCase().includes("patrol")
                ? "recon"
                : ((m.mission_id && m.mission_id.includes("0829")) || m.name.toLowerCase().includes("isr") || m.name.toLowerCase().includes("demonstration")
                  ? "demo"
                  : "alpha");

              return (
                <div
                  key={m.mission_id}
                  className={`replay-mission-card ${isSel ? "active" : "inactive"}`}
                  onClick={() => {
                    setSelectedHistoricalId(m.mission_id);
                    setHistoricalIndex(0);
                    setIsHistoricalPlaying(false);
                    setFrozenLiveSnapshot(null);
                    setLiveScrubIndex(null);
                    setIsLiveBufferPlaying(false);
                  }}
                >
                  <div className="replay-card-thumb">
                    <UavFlightThumbnail variant={variant} />
                  </div>
                  <div className="replay-card-meta">
                    <div className="replay-card-title">{m.name}</div>
                    <div className="replay-card-sub">ID: {m.mission_id}</div>
                    <div className="replay-card-sub">Duration: {m.duration_hours}h</div>
                    <div className="replay-card-sub" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>Max Alt: {m.max_altitude_m} m</span>
                      {m.anomalies_detected > 0 ? (
                        <span className="replay-card-badge" style={{ color: "#d97706" }}>
                          <AlertTriangle size={12} color="#d97706" /> {m.anomalies_detected} Anomaly
                        </span>
                      ) : (
                        <span className="replay-card-badge" style={{ color: "#fbbf24" }}>
                          ✓ 0 Anomalies
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2: HISTORICAL FLIGHT PLAYBACK */}
        <div className="replay-metal-chassis">
          {/* Corner Screws */}
          <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

          <div className="replay-chassis-header">
            <span className="replay-chassis-title" style={{ paddingLeft: 14, display: "flex", alignItems: "center", gap: "8px" }}>
              {isLiveMode ? (
                <>
                  <span className="pulse-dot-amber" style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#fbbf24" }} />
                  LIVE TELEMETRY STREAM : LIVE FLIGHT SESSION // TAPAS-BH201
                </>
              ) : (
                `HISTORICAL FLIGHT PLAYBACK : ${currentMissionMeta.name.toUpperCase()}`
              )}
            </span>
            
            <div className="replay-speed-group" style={{ marginRight: 14 }}>
              <span className="replay-speed-label">SPEED:</span>
              <div className="replay-speed-buttons">
                {[1, 2, 4, 8].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`replay-speed-btn ${playbackSpeed === spd ? "active" : ""}`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="replay-screen-recess">
            {/* Top Flight Header row with UAV Wireframe */}
            <div className="replay-playback-header-row">
              <div className="replay-wireframe-box">
                <UavWireframeSchematic />
              </div>

              <div className="replay-flight-meta">
                <div className="replay-flight-title">
                  {isLiveMode ? "LIVE FLIGHT SESSION // TAPAS-BH201" : currentMissionMeta.name.toUpperCase()}
                </div>
                <div className="replay-flight-details">
                  Platform : UAV-TAPAS-BH201 &nbsp;|&nbsp; Engine : {currentMissionMeta.engine_id || "ENG-ROTAX-914-81"}
                </div>
                <div className="replay-flight-details">
                  Date : {currentMissionMeta.date_str || "2026-07-18"} &nbsp;|&nbsp; Time : {currentMissionMeta.time_utc || "10:22:16 - 18:52:34 (UTC)"}
                </div>
              </div>

              <div className="replay-flight-badges">
                <div style={{ display: "flex", gap: "6px" }}>
                  <span className="replay-badge-phase">PHASE : {currentDisplayPoint.phase}</span>
                  <span className="replay-badge-health">HEALTH : {currentDisplayPoint.health_score}%</span>
                </div>
                <span className="replay-flight-duration-sub">
                  {isLiveMode
                    ? (isLivePlaying 
                        ? "🔴 ACTIVE AUTO-STREAMING" 
                        : (isLiveBufferPlaying 
                            ? <span style={{ color: "#38bdf8" }}>▶ BUFFER REPLAY ({playbackSpeed}x)</span> 
                            : <span style={{ color: "#fbbf24" }}>⏸ LIVE STREAM PAUSED</span>))
                    : `Duration ${currentMissionMeta.duration_hours}h (${playbackSpeed}x)`}
                </span>
              </div>
            </div>

            {/* Scrubber Bar Area */}
            <div className="replay-scrubber-wrap">
              <div className="replay-scrubber-labels">
                <span className="replay-scrubber-time">
                  {isLiveMode
                    ? (isLivePlaying 
                        ? `LIVE [${currentDisplayPoint.timestamp_offset}]` 
                        : (isLiveBufferPlaying 
                            ? `PLAYING [${currentDisplayPoint.timestamp_offset}]` 
                            : `PAUSED [${currentDisplayPoint.timestamp_offset}]`))
                    : currentDisplayPoint.timestamp_offset}
                </span>
                <span className="replay-scrubber-event">
                  Active Event : <strong>
                    {isLiveMode
                      ? (isLivePlaying 
                          ? "Real-Time Telemetry Feed (Auto-Sync)" 
                          : (isLiveBufferPlaying 
                              ? `Buffer Playback (Frame #${currentActiveIndex + 1} of ${activePoints.length})` 
                              : `Paused Telemetry Snapshot (Frame #${currentActiveIndex + 1} of ${activePoints.length})`))
                      : currentDisplayPoint.event}
                  </strong>
                </span>
                <span style={{ color: "transparent" }}>.</span>
              </div>

              {(() => {
                const maxIndex = Math.max(0, activePoints.length - 1);
                const progressPct = maxIndex > 0 ? ((currentActiveIndex / maxIndex) * 100).toFixed(1) : "0";
                return (
                  <input
                    type="range"
                    min="0"
                    max={maxIndex}
                    value={currentActiveIndex}
                    onChange={handleSliderChange}
                    className={`replay-slider ${isLiveMode && isLivePlaying ? "live-streaming" : ""}`}
                    style={{
                      background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${progressPct}%, #071922 ${progressPct}%, #071922 100%)`,
                    }}
                  />
                );
              })()}
            </div>

            {/* Control Buttons & Mechanical Split-Timer */}
            <div className="replay-transport-row">
              <button
                className="replay-btn-restart"
                onClick={handleRestart}
              >
                <RotateCcw size={12} /> RESTART (T+00)
              </button>

              <div className="replay-media-controls">
                <button
                  className="replay-media-btn-step"
                  onClick={handleStepFirst}
                  title="First Frame (T+00)"
                >
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <rect x="2" y="3" width="2.5" height="12" rx="0.5" />
                    <polygon points="15,3.5 5.5,9 15,14.5" />
                  </svg>
                </button>
                <button
                  className="replay-media-btn-step"
                  onClick={handleStepBack}
                  title="Step Back / Rewind"
                >
                  <svg width="15" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <polygon points="9.5,3.5 2,9 9.5,14.5" />
                    <polygon points="16,3.5 8.5,9 16,14.5" />
                  </svg>
                </button>
                <button
                  className="replay-play-btn-large"
                  onClick={togglePlayPause}
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 18 18" fill="#fbbf24">
                      <rect x="3.5" y="3" width="4" height="12" rx="1" />
                      <rect x="10.5" y="3" width="4" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="#fbbf24" style={{ marginLeft: 2 }}>
                      <polygon points="4,2.5 16,9 4,15.5" />
                    </svg>
                  )}
                </button>
                <button
                  className="replay-media-btn-step"
                  onClick={handleStepForward}
                  title="Step Forward / Fast Forward"
                >
                  <svg width="15" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <polygon points="2,3.5 9.5,9 2,14.5" />
                    <polygon points="8.5,3.5 16,9 8.5,14.5" />
                  </svg>
                </button>
                <button
                  className="replay-media-btn-step"
                  onClick={handleStepLast}
                  title={isLiveMode ? "Catch Up to Live Stream" : "Last Frame"}
                >
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="currentColor">
                    <polygon points="3,3.5 12.5,9 3,14.5" />
                    <rect x="13.5" y="3" width="2.5" height="12" rx="0.5" />
                  </svg>
                </button>
              </div>

              <TimerOdometer offsetStr={currentDisplayPoint.timestamp_offset} />
            </div>
          </div>

          {/* 4 Plaque Tumbler Gauges mounted directly on the Brushed Metal Chassis */}
          <div className="replay-gauges-row">
            <PlaqueTumblerGauge label="CRANKSHAFT SPEED" value={currentDisplayPoint.rpm} unit="RPM" padStart={4} />
            <PlaqueTumblerGauge label="EXHAUST GAS TEMP (EGT)" value={currentDisplayPoint.egt} unit="°C" padStart={3} />
            <PlaqueTumblerGauge label="CYLINDER HEAD TEMP (CHT)" value={currentDisplayPoint.cht} unit="°C" padStart={3} />
            <PlaqueTumblerGauge label="FLIGHT ALTITUDE" value={currentDisplayPoint.altitude} unit="m" padStart={4} />
          </div>

          {/* 4 Wide Status Bar Insets recessed directly into the Brushed Metal Chassis */}
          <div className="replay-status-row">
            <div className="replay-status-box">
              <span className="replay-status-name">VIBRATION</span>
              <div className="replay-status-val-wrap">
                <span className="replay-status-num green">{currentDisplayPoint.vibration}</span>
                <span className="replay-status-unit">mm/s</span>
              </div>
            </div>
            <div className="replay-status-box">
              <span className="replay-status-name">FUEL FLOW</span>
              <div className="replay-status-val-wrap">
                <span className="replay-status-num green">{currentDisplayPoint.fuel_flow}</span>
                <span className="replay-status-unit">L/h</span>
              </div>
            </div>
            <div className="replay-status-box">
              <span className="replay-status-name">OIL PRESSURE</span>
              <div className="replay-status-val-wrap">
                <span className="replay-status-num amber">{currentDisplayPoint.oil_pressure}</span>
                <span className="replay-status-unit">bar</span>
              </div>
            </div>
            <div className="replay-status-box">
              <span className="replay-status-name">AI FAULT STATE</span>
              <span className="replay-status-badge-normal">{currentDisplayPoint.predicted_fault || "NORMAL"}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
           BOTTOM ROW: DUAL FLIGHT GRAPHS (ALTITUDE & THERMAL STRESS)
         ══════════════════════════════════════════════════════════════════ */}
      <div className="replay-avionics-grid-bottom">

        {/* PANEL 3: FLIGHT ALTITUDE PROFILE & ENGINE HEALTH INDEX */}
        <div className="replay-metal-chassis">
          {/* Corner Screws */}
          <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

          <div className="replay-chassis-header">
            <span className="replay-chassis-title" style={{ paddingLeft: 14 }}>
              FLIGHT ALTITUDE PROFILE & ENGINE HEALTH INDEX
            </span>
          </div>

          <div className="replay-screen-recess" style={{ height: "280px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
              <span style={{ color: "#ffffff", fontWeight: 800 }}>ALTITUDE (m)</span>
              <span style={{ color: "#f59e0b", fontWeight: 800 }}>ENGINE HEALTH INDEX</span>
            </div>

            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="altGradAvionics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 2" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "TIME (UTC)", position: "insideBottom", offset: -2, fill: "#cbd5e1", fontSize: 9 }}
                />
                <YAxis 
                  yAxisId="alt" 
                  domain={[0, 5000]} 
                  ticks={[0, 1000, 2000, 3000, 4000, 5000]}
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <YAxis 
                  yAxisId="health" 
                  orientation="right" 
                  domain={[0, 100]} 
                  ticks={[0, 20, 40, 60, 80, 100]}
                  unit="%" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <Tooltip 
                  contentStyle={{ background: "#121316", border: "1px solid #2e3238", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#f1f5f9" }} 
                />
                
                {/* Active Playhead Cursor */}
                <ReferenceLine 
                  x={activePoints[currentActiveIndex]?.time_utc || activePoints[currentActiveIndex]?.time || activePoints[currentActiveIndex]?.timestamp_offset} 
                  yAxisId="alt" 
                  stroke="#f59e0b" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3" 
                />

                <Area 
                  yAxisId="alt" 
                  type="monotone" 
                  dataKey="altitude" 
                  name="Altitude (m)" 
                  stroke="#ffffff" 
                  strokeWidth={2}
                  fill="url(#altGradAvionics)" 
                />
                <Line 
                  yAxisId="health" 
                  type="monotone" 
                  dataKey="health_score" 
                  name="Engine Health Index (%)" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "2px", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "#ffffff", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#ffffff", display: "inline-block" }} /> Altitude (m)
              </span>
              <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#f59e0b", display: "inline-block" }} /> Engine Health Index (%)
              </span>
            </div>
          </div>
        </div>

        {/* PANEL 4: THERMAL STRESS TRACKING (EGT / CHT) & VIBRATION */}
        <div className="replay-metal-chassis">
          {/* Corner Screws */}
          <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
          <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

          <div className="replay-chassis-header">
            <span className="replay-chassis-title" style={{ paddingLeft: 14 }}>
              THERMAL STRESS TRACKING (EGT / CHT) & VIBRATION
            </span>
            <span style={{ color: currentDisplayPoint.anomaly_score > 0.3 ? "#b91c1c" : "#ea580c", fontSize: "0.74rem", fontWeight: 900, fontFamily: "var(--font-mono)", marginRight: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {currentDisplayPoint.event || currentDisplayPoint.phase}
            </span>
          </div>

          <div className="replay-screen-recess" style={{ height: "280px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>
              <span style={{ color: "#f59e0b", fontWeight: 800 }}>TEMPERATURE (°C)</span>
              <span style={{ color: "#ffffff", fontWeight: 800 }}>VIBRATION (mm/s)</span>
            </div>

            <ResponsiveContainer width="100%" height={210}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="2 2" vertical={true} horizontal={true} />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  label={{ value: "TIME (UTC)", position: "insideBottom", offset: -2, fill: "#cbd5e1", fontSize: 9 }}
                />
                <YAxis 
                  yAxisId="temp" 
                  domain={[0, 800]} 
                  ticks={[0, 200, 400, 600, 800]}
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <YAxis 
                  yAxisId="vib" 
                  orientation="right" 
                  domain={[0, 2.5]} 
                  ticks={[0, 0.5, 1.0, 1.5, 2.0, 2.5]}
                  stroke="#475569" 
                  tick={{ fill: "#cbd5e1", fontSize: 10, fontFamily: "var(--font-mono)" }} 
                />
                <Tooltip 
                  contentStyle={{ background: "#121316", border: "1px solid #2e3238", borderRadius: "4px", fontSize: "0.75rem", fontFamily: "var(--font-mono)", color: "#f1f5f9" }} 
                />

                {/* Active Playhead Cursor */}
                <ReferenceLine 
                  x={activePoints[currentActiveIndex]?.time_utc || activePoints[currentActiveIndex]?.time || activePoints[currentActiveIndex]?.timestamp_offset} 
                  yAxisId="temp" 
                  stroke="#f59e0b" 
                  strokeWidth={1.5} 
                  strokeDasharray="3 3" 
                />

                <Line 
                  yAxisId="temp" 
                  type="stepAfter" 
                  dataKey="egt" 
                  name="EGT (°C)" 
                  stroke="#f59e0b" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: "#f59e0b", stroke: "#000" }} 
                />
                <Line 
                  yAxisId="temp" 
                  type="stepAfter" 
                  dataKey="cht" 
                  name="CHT (°C)" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false} 
                />
                <Line 
                  yAxisId="vib" 
                  type="stepAfter" 
                  dataKey="vibration" 
                  name="Vibration (mm/s)" 
                  stroke="#ffffff" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Custom Legend */}
            <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "2px", fontSize: "0.68rem", fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#f59e0b", display: "inline-block" }} /> EGT (°C)
              </span>
              <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#ef4444", display: "inline-block" }} /> CHT (°C)
              </span>
              <span style={{ color: "#ffffff", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: 14, height: 2.5, background: "#ffffff", display: "inline-block" }} /> Vibration (mm/s)
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════
           SECTION 5: CHRONOLOGICAL FLIGHT MISSION TELEMETRY AUDIT TABLE
         ══════════════════════════════════════════════════════════════════ */}
      <div className="replay-metal-chassis" style={{ marginTop: "18px" }}>
        {/* Corner Screws */}
        <CornerScrew style={{ position: "absolute", top: 6, left: 6 }} />
        <CornerScrew style={{ position: "absolute", top: 6, right: 6 }} />
        <CornerScrew style={{ position: "absolute", bottom: 6, left: 6 }} />
        <CornerScrew style={{ position: "absolute", bottom: 6, right: 6 }} />

        <div className="replay-chassis-header" style={{ padding: "0 6px 8px 6px" }}>
          <span className="replay-chassis-title" style={{ paddingLeft: 12 }}>
            CHRONOLOGICAL FLIGHT MISSION TELEMETRY AUDIT TABLE
          </span>
          <span style={{ 
            marginRight: 12, 
            fontSize: "0.72rem", 
            fontWeight: 800, 
            color: "#1e293b", 
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
            textShadow: "0 1px 0 rgba(255,255,255,0.8)"
          }}>
            CURRENT FRAME : {currentDisplayPoint.timestamp_offset} ({currentDisplayPoint.phase})
          </span>
        </div>

        <div className="replay-table-recess">
          <TinyScrew size={8} style={{ position: "absolute", top: 4, right: 4 }} />
          <TinyScrew size={8} style={{ position: "absolute", bottom: 4, left: 4 }} />
          <TinyScrew size={8} style={{ position: "absolute", bottom: 4, right: 4 }} />

          <div className="replay-table-scroll-wrap">
            <table className="replay-audit-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left", width: "120px", paddingLeft: "16px" }}>TIME (UTC)</th>
                  <th style={{ textAlign: "left", width: "160px" }}>PHASE</th>
                  <th style={{ textAlign: "center", width: "85px" }}>RPM</th>
                  <th style={{ textAlign: "center", width: "95px" }}>EGT (°C)</th>
                  <th style={{ textAlign: "center", width: "95px" }}>CHT (°C)</th>
                  <th style={{ textAlign: "center", width: "95px" }}>ALT (m)</th>
                  <th style={{ textAlign: "center", width: "105px" }}>VIB (mm/s)</th>
                  <th style={{ textAlign: "center", width: "90px" }}>HEALTH</th>
                  <th style={{ textAlign: "left", paddingLeft: "16px" }}>EVENT STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activePoints.map((row, idx) => {
                  const isSelected = idx === historicalIndex;
                  return (
                    <tr
                      key={idx}
                      onClick={() => {
                        setHistoricalIndex(idx);
                        setIsHistoricalPlaying(false);
                      }}
                      className={`replay-audit-row ${isSelected ? "selected" : ""}`}
                    >
                      <td style={{ textAlign: "left", paddingLeft: "16px" }}>
                        {isSelected ? (
                          <span className="replay-audit-active-time">
                            {row.time_utc}
                          </span>
                        ) : (
                          <span className="replay-audit-time">
                            {row.time_utc}
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "left" }}>{row.phase}</td>
                      <td style={{ textAlign: "center" }}>{row.rpm}</td>
                      <td style={{ textAlign: "center" }}>{row.egt}</td>
                      <td style={{ textAlign: "center" }}>{row.cht}</td>
                      <td style={{ textAlign: "center" }}>{row.altitude}</td>
                      <td style={{ textAlign: "center" }}>{typeof row.vibration === "number" ? row.vibration.toFixed(1) : row.vibration}</td>
                      <td style={{ textAlign: "center" }} className="replay-audit-health">{row.health_score}%</td>
                      <td style={{ textAlign: "left", paddingLeft: "16px" }}>{row.event}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
