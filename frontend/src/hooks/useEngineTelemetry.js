import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/engine";

export function useEngineTelemetry() {
  const [latestData, setLatestData] = useState(null);
  const [telemetryHistory, setTelemetryHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentFault, setCurrentFault] = useState("NONE");
  const wsRef = useRef(null);

  useEffect(() => {
    let reconnectTimer;

    // Pre-fetch initial history & live telemetry snapshot from backend
    api.getLiveTelemetry()
      .then((snap) => {
        if (snap) setLatestData(snap);
      })
      .catch(() => {});

    api.getHistory(60)
      .then((res) => {
        if (res && res.history && res.history.length > 0) {
          setTelemetryHistory(res.history);
          setLatestData((prev) => prev || res.history[res.history.length - 1]);
        }
      })
      .catch(() => {});

    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLatestData(data);
            setTelemetryHistory((prev) => {
              const updated = [...prev, data];
              return updated.slice(-60); // Keep last 60 seconds of telemetry for charts
            });
          } catch (e) {
            console.error("Failed to parse telemetry WS packet", e);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          // Fallback to polling /api/engine/live if WebSocket drops
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          setIsConnected(false);
        };
      } catch (err) {
        console.warn("WebSocket connection error, falling back to HTTP polling", err);
        reconnectTimer = setTimeout(connect, 5000);
      }
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  // Fallback REST polling if WS fails
  useEffect(() => {
    if (!isConnected) {
      const interval = setInterval(async () => {
        try {
          const snapshot = await api.getLiveTelemetry();
          setLatestData(snapshot);
          setTelemetryHistory((prev) => [...prev.slice(-59), snapshot]);
        } catch (e) {
          // ignore
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [isConnected]);

  const injectFault = async (faultType) => {
    try {
      await api.injectFault(faultType);
      setCurrentFault(faultType);
    } catch (e) {
      console.error("Fault injection failed", e);
    }
  };

  return {
    latestData,
    telemetryHistory,
    isConnected,
    currentFault,
    injectFault,
  };
}
