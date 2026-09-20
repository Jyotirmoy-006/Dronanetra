import React, { useState, useEffect } from "react";
import InteractiveEngine3D from "../components/InteractiveEngine3D";

/**
 * VRDE 180HP 3D Digital Twin — Integration Example
 *
 * Demonstrates how to mount the 3D aero engine model inside your project,
 * provide real-time or simulated telemetry feeds, and capture interactive part clicks.
 */
export default function Engine3DExampleUsage() {
  const [selectedPart, setSelectedPart] = useState(null);
  const [telemetry, setTelemetry] = useState({
    rpm: 4850,
    cht: 128.0,
    egt: 715.0,
    oil_press_psi: 62.4,
    oil_temp_c: 88.0,
    fuel_flow_lph: 24.2,
    vibration_mms: 1.82,
    manifold_press_inhg: 28.6,
  });

  // Simulated telemetry clock (updates dynamic engine RPM & temperature variations)
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        rpm: Math.round(4800 + Math.sin(Date.now() / 1200) * 150),
        cht: +(126 + Math.sin(Date.now() / 2500) * 2.5).toFixed(1),
        egt: +(715 + Math.cos(Date.now() / 2000) * 5).toFixed(1),
        vibration_mms: +(1.8 + Math.sin(Date.now() / 900) * 0.12).toFixed(2),
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#070b12", padding: "1.5rem", boxSizing: "border-box" }}>
      <div style={{ maxWidth: "1480px", margin: "0 auto" }}>
        {/* Header Bar */}
        <div style={{ marginBottom: "1.2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ color: "#00f2ff", margin: "0 0 0.25rem 0", fontSize: "1.4rem", fontFamily: "sans-serif", fontWeight: 800 }}>
              VRDE 180HP Aero Piston Engine 3D Digital Twin
            </h1>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.85rem" }}>
              Standalone Component Integration Demo // 4-Cylinder Inline UAV Powertrain
            </p>
          </div>
          {selectedPart && (
            <div style={{ background: "rgba(0, 242, 255, 0.1)", border: "1px solid #00f2ff", padding: "6px 14px", borderRadius: "6px" }}>
              <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>Active Component: </span>
              <strong style={{ color: "#ffffff", fontSize: "0.85rem" }}>{selectedPart.name}</strong>
            </div>
          )}
        </div>

        {/* 3D Model Viewport Chassis */}
        <InteractiveEngine3D
          telemetryData={{ telemetry }}
          onSelectComponent={(componentInfo) => {
            console.log("User clicked component:", componentInfo);
            setSelectedPart(componentInfo);
          }}
        />
      </div>
    </div>
  );
}
