import React, { useState } from "react";
import { Flame, Cpu, Gauge, Zap, Wind, RotateCw } from "lucide-react";

export default function EngineCalloutMap({ telemetryData }) {
  const [selectedComponent, setSelectedComponent] = useState(null);

  const rpm = telemetryData?.telemetry?.rpm || 5180;
  const egt = telemetryData?.telemetry?.egt || 720;
  const cht = telemetryData?.telemetry?.cht || 148;

  const components = [
    {
      id: "fan_blades",
      name: "FAN BLADES",
      icon: Wind,
      top: "22%",
      left: "22%",
      pinX: "28%",
      pinY: "38%",
      stats: [
        { label: "RPM", value: `${rpm}` },
        { label: "EFFICIENCY", value: "92%" },
      ],
    },
    {
      id: "compressor",
      name: "COMPRESSOR",
      icon: Gauge,
      top: "16%",
      left: "40%",
      pinX: "42%",
      pinY: "35%",
      stats: [
        { label: "PRESSURE RATIO", value: "8.11" },
        { label: "EFFICIENCY", value: "88%" },
      ],
    },
    {
      id: "hp_compressor",
      name: "HIGH PRESSURE COMPRESSOR",
      icon: Cpu,
      top: "16%",
      left: "60%",
      pinX: "52%",
      pinY: "32%",
      stats: [
        { label: "PRESSURE", value: "12.4 bar" },
        { label: "TEMP", value: "420°C" },
      ],
    },
    {
      id: "combustion_chambers",
      name: "COMBUSTION CHAMBERS",
      icon: Flame,
      top: "22%",
      left: "78%",
      pinX: "58%",
      pinY: "42%",
      isHot: true,
      stats: [
        { label: "FUEL-AIR MIX", value: "OPTIMAL" },
        { label: "TEMP", value: `${egt * 2}°C` },
      ],
    },
    {
      id: "turbine",
      name: "TURBINE",
      icon: Zap,
      top: "54%",
      left: "82%",
      pinX: "72%",
      pinY: "48%",
      stats: [
        { label: "TEMP", value: `${Math.round(egt * 1.66)}°C` },
        { label: "EFFICIENCY", value: "90%" },
      ],
    },
    {
      id: "rotor_shaft",
      name: "ROTOR SHAFT",
      icon: RotateCw,
      top: "72%",
      left: "70%",
      pinX: "50%",
      pinY: "65%",
      stats: [
        { label: "SPEED", value: `${rpm} RPM` },
        { label: "TORQUE", value: "320 Nm" },
      ],
    },
  ];

  return (
    <div className="engine-callout-container">
      {/* Background Graphic */}
      <div className="engine-bg-wrapper">
        <img
          src="/engine_hologram.jpg"
          alt="Digital Twin Piston Engine Wireframe"
          className="engine-hologram-img"
          onError={(e) => {
            // Fallback SVG graphic styling if image hasn't loaded yet
            e.target.style.display = 'none';
          }}
        />
        <div className="engine-grid-overlay"></div>
      </div>

      {/* SVG Callout Lines Connecting Pins to Cards */}
      <svg className="engine-svg-overlay">
        {components.map((comp) => (
          <g key={`svg-${comp.id}`}>
            {/* Target Pulse Dot */}
            <circle cx={comp.pinX} cy={comp.pinY} r="5" className={`pin-dot ${comp.isHot ? 'pin-hot' : ''}`} />
            <circle cx={comp.pinX} cy={comp.pinY} r="12" className={`pin-pulse ${comp.isHot ? 'pin-hot-pulse' : ''}`} />
          </g>
        ))}
      </svg>

      {/* Component Callout Cards */}
      {components.map((comp) => {
        const IconComponent = comp.icon;
        const isSelected = selectedComponent === comp.id;

        return (
          <div
            key={comp.id}
            className={`callout-card ${comp.isHot ? 'callout-hot' : ''} ${isSelected ? 'callout-selected' : ''}`}
            style={{ top: comp.top, left: comp.left }}
            onClick={() => setSelectedComponent(isSelected ? null : comp.id)}
          >
            <div className="callout-header">
              <IconComponent size={14} className="callout-icon" />
              <span className="callout-title">{comp.name}</span>
            </div>
            <div className="callout-body">
              {comp.stats.map((s, idx) => (
                <div key={idx} className="callout-stat-row">
                  <span className="stat-lbl">{s.label}:</span>
                  <span className="stat-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
