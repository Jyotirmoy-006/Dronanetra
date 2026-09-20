import React from "react";

export default function RadialGauge({ value = 87, label = "HEALTHY" }) {
  // Semi-circle gauge (180 degrees)
  const radius = 60;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  // Determine status color
  let color = "#10b981"; // Emerald green
  if (value < 60) color = "#ef4444"; // Red
  else if (value < 85) color = "#f59e0b"; // Amber

  return (
    <div className="radial-gauge-container">
      <svg width="150" height="90" viewBox="0 0 150 90" className="radial-gauge-svg">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Background track arc */}
        <path
          d="M 15 80 A 60 60 0 0 1 135 80"
          fill="none"
          stroke="rgba(0, 0, 0, 0.08)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Animated Fill arc */}
        <path
          d="M 15 80 A 60 60 0 0 1 135 80"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        />
      </svg>
      <div className="radial-gauge-center">
        <div className="radial-gauge-val">{value}%</div>
        <div className="radial-gauge-lbl" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}
