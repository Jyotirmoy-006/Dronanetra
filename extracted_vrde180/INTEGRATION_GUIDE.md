# VRDE 180HP Aero Engine 3D Digital Twin — Integration Guide

This package contains the **complete, standalone 3D model component system** for the DRDO VRDE 180HP 4-Cylinder Inline Aero Piston Engine Digital Twin.

It has zero dependencies on backend databases or external servers; it renders directly in the browser using Three.js and React, and can receive telemetry props or run entirely standalone with built-in physics simulation.

---

## 1. Quick Installation

### Step A: Install npm Dependencies
In your project root, install `three` and `lucide-react`:

```bash
npm install three lucide-react
```

*(If you are using TypeScript or strict ESLint, Three.js types are optional: `npm install -D @types/three`)*

---

## 2. File Placement

Copy the files from this zip into your project:

| Source in Zip | Destination in Your Project | Purpose |
| :--- | :--- | :--- |
| `components/InteractiveEngine3D.jsx` | `src/components/InteractiveEngine3D.jsx` | Primary 3D Viewport & HUD Controller |
| `components/InteractiveEngine3D.css` | `src/components/InteractiveEngine3D.css` | Standalone CSS for 3D Chassis & HUD |
| `components/3d/` (entire folder) | `src/components/3d/` | 15 engine part builders, materials & shaders |
| `public/brushed_metal_bg.png` | `public/brushed_metal_bg.png` | Brushed metal plate background for 3D canvas |

> **IMPORTANT Note on Background Image**:  
> The 3D canvas is configured with a transparent background (`alpha: true`), displaying the brushed metal texture plate behind it. Ensure `brushed_metal_bg.png` is placed in your frontend's `public/` directory so it is accessible at `/brushed_metal_bg.png`.

---

## 3. Usage Example

Import and place `<InteractiveEngine3D />` in any page or view:

```jsx
import React, { useState } from "react";
import InteractiveEngine3D from "./components/InteractiveEngine3D";

export default function MyEnginePage() {
  const [selectedPart, setSelectedPart] = useState(null);

  // Optional: Pass live telemetry from your backend / WebSocket / state
  const liveTelemetry = {
    telemetry: {
      rpm: 4850,
      cht: 128.0,
      egt: 715.0,
      oil_press_psi: 62.4,
      oil_temp_c: 88.0,
      fuel_flow_lph: 24.2,
      vibration_mms: 1.82,
      manifold_press_inhg: 28.6,
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
      <InteractiveEngine3D
        telemetryData={liveTelemetry}
        onSelectComponent={(partInfo) => {
          console.log("Selected engine part:", partInfo);
          setSelectedPart(partInfo);
        }}
      />
    </div>
  );
}
```

---

## 4. Component Props

| Prop Name | Type | Required? | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `telemetryData` | `Object` | No | `{ telemetry: { rpm: 4800, ... } }` | Telemetry object containing `rpm`, `cht`, `egt`, cylinder temperatures (`cht_cyl1`..`cht_cyl4`), vibration, etc. |
| `onSelectComponent` | `Function` | No | `null` | Callback invoked when a user clicks any engine part. Returns `{ id, name, subsystem, nominalRange, currentReading, status, details, recommendation }`. |

---

## 5. Visual Modes & Features Included

1. **Aerospace Holographic Scan Mode**:
   - **Airframe & Fin Casings**: Translucent Crystalline Cobalt Sapphire Blue (`#12294d` / `#1d4ed8`) with high-intensity laser rim contours (`0.92` opacity).
   - **Internal Powertrain**: Machined Phosphor Bronze (`#cd7f32` / `#df9244`) reciprocating pistons, connecting rods, wrist pins, and crankshaft counterweights.
   - **Internal Illumination**: Golden-bronze point light (`#df9244`) along the crankshaft axis illuminating internal reciprocating dynamics.
   - **Interactive Shell Opacity Slider**: Allows adjusting outer casing transparency from 10% to 100% in real time.

2. **Solid Assembly Mode**:
   - High-fidelity physical aero engine assembly with brushed aluminum, cast crankcase, anodized titanium exhaust runners, steel fasteners, and front reduction gearbox.

3. **Pure X-Ray (NDT) & Thermal Gradient**:
   - Monochromatic radiographic NDT mode for structural inspection.
   - FLIR pseudo-color thermography overlay with spatial floating temperature badges for Cylinders #1–#4, Exhaust, and Oil Sump.

4. **Kinematic Precision**:
   - Strictly vertical UP / DOWN piston travel inside vertical cylinder bores.
   - 1-3-4-2 aero engine firing sequence with active firing order ticker HUD.
   - Dynamic stroke animation synchronized to RPM.

5. **Disassembly & Inspection**:
   - Exploded View slider (0% to 100%) cleanly disassembles components outward along functional axes.
   - 7 Camera Presets: 3/4 Isometric, Front, Rear, Left Intake, Right Exhaust, Top, and Sump/Bottom.
   - Click-to-inspect Diagnostic HUD card with status jewels, tolerances, and actionable maintenance alerts.
