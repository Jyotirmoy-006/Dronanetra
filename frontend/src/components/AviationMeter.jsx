import React from "react";

/**
 * AviationMeter — Ultra-Photorealistic Vintage Aviation Instrument
 *
 * Recreates the exact physical vintage instrument from meter.jpeg:
 *  - High-res brushed-metal square bezel plate with corner Allen bolts & washers
 *  - Machined stainless steel / chrome bezel with authentic bottom flat contour
 *  - Pristine deep matte black dial face with fine white tick marks (zero dents / smudges)
 *  - Segmented amber & red tachometer warning redline
 *  - Stamped brushed-metal plaque directly underneath with UNIFORM DIN 1451 font size
 *  - Hardware-accelerated 3D mechanical needle with soft drop shadow and machined aluminum cap
 *  - Authentic recessed mechanical drum odometer window with live rolling digits
 *  - Clean standalone housing so instruments never overlap or collide
 */
export default function AviationMeter({
  value = 0,
  min = 0,
  max = 7000,
  label = "ENGINE SPEED",
  unit = "RPM",
  subUnit = "x1000",
  warningStart = null,
  dangerStart = null,
  decimals = 0,
  size = 235,
}) {
  const S = size;
  const H = Math.round(size * (664 / 640));

  // Determine base image based on instrument type
  const unitUpper = (unit || "").toUpperCase();
  const labelUpper = (label || "").toUpperCase();

  let baseImg = "/meter_base_rpm.png";
  if (unitUpper.includes("EGT") || labelUpper.includes("EXHAUST")) {
    baseImg = "/meter_base_egt.png";
  } else if (unitUpper.includes("FUEL")) {
    baseImg = "/meter_base_fuel.png";
  } else if (unitUpper.includes("OIL")) {
    baseImg = "/meter_base_oil.png";
  } else if (unitUpper.includes("VIB")) {
    baseImg = "/meter_base_vib.png";
  } else if (unitUpper.includes("CHT") || labelUpper.includes("CYLINDER")) {
    baseImg = "/meter_base_cht.png";
  }

  // Exact needle rotation geometry matching vintage dial scale:
  // Sweep is ~204.4° symmetric about 12 o'clock (0° UP)
  // 0 is at -102.2° (pointing at 0 tick)
  // Max is at +102.2° (pointing at max tick)
  const MIN_ANG = -102.2;
  const MAX_ANG = 102.2;

  const clampedVal = Math.max(min, Math.min(max, Number(value) || 0));
  const pct = (clampedVal - min) / (max - min || 1);
  const needleDeg = MIN_ANG + pct * (MAX_ANG - MIN_ANG);

  // Digital counter digits: 4 mechanical drum rollers
  let digitStr = "";
  if (decimals > 0) {
    const fixed = Math.abs(clampedVal).toFixed(decimals);
    digitStr = fixed.replace(".", "").padStart(4, "0").slice(-4);
  } else {
    digitStr = String(Math.round(Math.abs(clampedVal))).padStart(4, "0").slice(-4);
  }
  const digits = digitStr.split("");

  // Unique ID for SVG filters
  const id = `avm_${unitUpper}_${Math.random().toString(36).slice(2, 6)}`;

  return (
    <div
      style={{
        position: "relative",
        width: `${S}px`,
        height: `${H}px`,
        userSelect: "none",
        display: "inline-block",
        margin: "0 auto",
        borderRadius: "6px",
        overflow: "hidden",
        boxShadow: "0 8px 20px -2px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
        backgroundColor: "#181a1e",
        flexShrink: 0,
      }}
    >
      {/* 1. Photorealistic Base Image (plate, screws, bezel, dial, ticks, plaque, window) */}
      <img
        src={baseImg}
        alt={`${label} Instrument`}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          objectFit: "fill",
          pointerEvents: "none",
        }}
      />

      {/* 2. Recessed Mechanical Odometer Drum Digits */}
      <div
        style={{
          position: "absolute",
          top: "59.6%",
          left: "32.2%",
          width: "35.6%",
          height: "9.0%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          pointerEvents: "none",
        }}
      >
        {digits.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Drum digit */}
            <span
              style={{
                color: "#f4f1ea",
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                fontWeight: "700",
                fontSize: `${Math.round(S * 0.058)}px`,
                letterSpacing: "-0.5px",
                textShadow: "0 0 2px rgba(255,255,255,0.5), 0 1px 2px rgba(0,0,0,0.9)",
                transform: "translateY(0.5px)",
              }}
            >
              {d}
            </span>

            {/* Drum cylinder 3D curvature shadow */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 30%, rgba(255,255,255,0.08) 50%, rgba(0,0,0,0.05) 70%, rgba(0,0,0,0.75) 100%)",
                pointerEvents: "none",
              }}
            />
          </div>
        ))}
      </div>

      {/* Label Badge — brushed steel plaque, consistent with meter bezel theme */}
      <div
        style={{
          position: "absolute",
          bottom: "6.0%",
          left: "21%",
          right: "21%",
          height: "5.5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "none",
          background:
            "linear-gradient(180deg, #3a3d42 0%, #2a2d31 40%, #232527 100%)",
          borderTop: "1px solid #5a5e63",
          borderBottom: "1px solid #111315",
          borderLeft: "1px solid #4a4e53",
          borderRight: "1px solid #4a4e53",
          borderRadius: "2px",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.10), inset 0 -1px 0 rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.7)",
        }}
      >
        <span
          style={{
            color: "#d4cfc8",
            fontFamily: "'Share Tech Mono', 'Courier New', monospace",
            fontWeight: "600",
            fontSize: `${Math.round(S * 0.031)}px`,
            letterSpacing: "0.10em",
            textShadow: "0 1px 2px rgba(0,0,0,0.95), 0 0 4px rgba(0,0,0,0.8)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
      </div>

      {/* 3. High-Precision Mechanical Needle & Cap (SVG Overlay) */}
      <svg
        viewBox="0 0 640 664"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Soft drop shadow on black dial */}
          <filter id={`nshadow_${id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.8)" />
          </filter>

          {/* Needle counterweight metallic tail */}
          <linearGradient id={`ntail_${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6e7176" />
            <stop offset="35%" stopColor="#b5b8bd" />
            <stop offset="70%" stopColor="#9a9da2" />
            <stop offset="100%" stopColor="#585b60" />
          </linearGradient>

          {/* Center machined aluminum cap */}
          <radialGradient id={`pcap_${id}`} cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="25%" stopColor="#d5d8dc" />
            <stop offset="55%" stopColor="#9fa2a7" />
            <stop offset="85%" stopColor="#696c71" />
            <stop offset="100%" stopColor="#3d4044" />
          </radialGradient>
        </defs>

        {/* Needle Assembly (Rotates around 320px, 308px) */}
        <g
          style={{
            transformOrigin: "320px 308px",
            transform: `rotate(${needleDeg}deg)`,
            transition: "transform 0.65s cubic-bezier(0.34, 1.45, 0.64, 1)",
          }}
        >
          {/* Needle Shadow Group */}
          <g filter={`url(#nshadow_${id})`}>
            {/* Tail Shadow */}
            <polygon points="315,308 325,308 323,381 317,381" fill="rgba(0,0,0,0.5)" />
            {/* Pointer Blade Shadow */}
            <polygon points="315,308 325,308 322,121 318,121" fill="rgba(0,0,0,0.6)" />
          </g>

          {/* Counterweight Tail (Metallic Silver) */}
          <polygon
            points="315,308 325,308 323,381 317,381"
            fill={`url(#ntail_${id})`}
            stroke="#45474a"
            strokeWidth="0.8"
          />

          {/* Main Pointer Blade — Left bright side */}
          <polygon
            points="315,308 320,308 320,121 318,121"
            fill="#ffffff"
          />
          {/* Main Pointer Blade — Right shaded bevel */}
          <polygon
            points="320,308 325,308 322,121 320,121"
            fill="#e2ded4"
          />
          {/* Needle Spine specular line */}
          <line
            x1="320"
            y1="308"
            x2="320"
            y2="121"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="0.8"
          />
        </g>

        {/* Center Machined Aluminum Hub Cap (Sits on top of the rotating needle) */}
        <g>
          {/* Cap drop shadow */}
          <circle cx="320" cy="308" r="25" fill="rgba(0,0,0,0.4)" filter={`url(#nshadow_${id})`} />
          {/* Cap body */}
          <circle cx="320" cy="308" r="24" fill={`url(#pcap_${id})`} stroke="#3e4145" strokeWidth="1.2" />
          {/* Machined circular lathe grooves */}
          <circle cx="320" cy="308" r="21" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.6" />
          <circle cx="320" cy="308" r="16" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />
          <circle cx="320" cy="308" r="11" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.5" />
          {/* Center dimple */}
          <circle cx="320" cy="308" r="4.5" fill="#2d3034" stroke="#1d1f22" strokeWidth="0.6" />
          {/* Dimple specular glint */}
          <circle cx="318.5" cy="306.5" r="1.5" fill="rgba(255,255,255,0.9)" />
        </g>
      </svg>
    </div>
  );
}
