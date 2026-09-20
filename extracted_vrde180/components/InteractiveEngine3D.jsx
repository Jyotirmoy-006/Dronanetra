import React, { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./InteractiveEngine3D.css";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Eye,
  Flame,
  Gauge,
  Layers,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Radio,
  RotateCcw,
  Terminal,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";
import { buildVRDE180Engine } from "./3d/VRDE180ModelBuilder";
import { ENGINE } from "./3d/VRDE180Utilities";
import { thermalUniforms } from "./3d/AerospaceThermalShader";
import ComponentDiagnosticHUD from "./3d/ComponentDiagnosticHUD";

/**
 * VRDE 180HP 4-CYLINDER INLINE AIRCRAFT PISTON ENGINE — 3D DIGITAL TWIN
 *
 * Ground-truth interactive CAD digital twin strictly adhering to:
 * - 4-Cylinder Inline Architecture with strictly VERTICAL UP ↑ / DOWN ↓ Piston Motion
 * - Longitudinal Crankshaft running inside cast crankcase along X
 * - Collinear Propeller Drive via Front Reduction Gearbox (1.6:1)
 * - 4-Stroke Cycle with 1-3-4-2 Firing Order Sequence
 * - Fully assembled state at 0% exploded view (zero floating gaps)
 * - Calibrated FLIR Continuous Thermography & Pure Monochromatic NDT Radiographic X-Ray
 * - Aerospace Holographic Translucent Visualization Layer
 */

// ── MASTER BLUE & BRONZE HOLOGRAPHIC DIGITAL TWIN MATERIALS ──
// High-contrast CAD digital twin: Precision Crystalline Cobalt/Sapphire Chassis + Hand-Finished Solid Phosphor Bronze Powertrain
const HOLOGRAPHIC_MATERIALS = {
  shell: new THREE.MeshStandardMaterial({
    color: 0x12294d, // Deep Crystalline Sapphire Blue casing (structural contrast against metal background)
    emissive: 0x1d4ed8, // Vibrant electric cobalt glow
    emissiveIntensity: 0.38,
    roughness: 0.22, // Sleek satin aerospace glass sheen
    metalness: 0.88,
    transparent: true,
    opacity: 0.36, // Substantial opacity defining the engine body crisply
    depthWrite: false,
    side: THREE.FrontSide, // Clean outer silhouette without messy interior backface clutter
  }),
  concentricRing: new THREE.MeshStandardMaterial({
    color: 0x60a5fa, // Vivid electric cobalt locator ring
    emissive: 0x3b82f6,
    emissiveIntensity: 1.2,
    roughness: 0.10,
    metalness: 0.94,
    transparent: true,
    opacity: 0.80,
    depthWrite: false,
  }),
  contour: new THREE.MeshStandardMaterial({
    color: 0x38bdf8, // Brilliant neon electric blue laser contour
    emissive: 0x2563eb,
    emissiveIntensity: 1.4,
    roughness: 0.08,
    metalness: 0.96,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
  }),
  finDisc: new THREE.MeshStandardMaterial({
    color: 0x0c1b33, // Translucent dark midnight sapphire cooling fin plate
    emissive: 0x102852,
    emissiveIntensity: 0.25,
    roughness: 0.25,
    metalness: 0.82,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
    side: THREE.FrontSide,
  }),
  movingCore: new THREE.MeshStandardMaterial({
    color: 0xcd7f32, // Masterpiece Phosphor Bronze (solid 100% opaque reciprocating heart)
    emissive: 0x542606, // Warm rich bronze-gold radiance
    emissiveIntensity: 0.40,
    roughness: 0.15, // Polished horological metal sheen
    metalness: 0.98, // True metallic mirror reflections
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  conduit: new THREE.MeshStandardMaterial({
    color: 0x1e40af, // Heat-tempered flame-blued titanium hardlines & exhaust runners
    emissive: 0x2563eb,
    emissiveIntensity: 0.55,
    roughness: 0.16,
    metalness: 0.92,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    side: THREE.FrontSide,
  }),
  propeller: new THREE.MeshStandardMaterial({
    color: 0x0e1c33, // Deep aero carbon-cobalt composite
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.30,
    roughness: 0.25,
    metalness: 0.82,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    side: THREE.FrontSide,
  }),
};

// ── THERMAL GLOW EMISSIVE PROFILES (AEROSPACE FLIR CALIBRATED) ──────────────
function getThermalGlowParams(temp, isFault = false) {
  if (temp >= 650) {
    // Blazing Incandescent White-Gold Plasma (Exhaust Manifold @ 740°C)
    return {
      color: 0xffedd5,
      emissive: 0xff6600,
      intensity: 3.8,
      pulse: true,
      pulseRate: 7.0,
      glowLabel: "3.8x PLASMA",
      textColor: "#fffbeb",
    };
  } else if (temp >= 190 || isFault) {
    // Critical Overheat (Cylinder 3 @ 214°C) — Deep Volcanic Ruby Crimson
    return {
      color: 0x450a0a,
      emissive: 0xff002b,
      intensity: 3.2,
      pulse: true,
      pulseRate: 5.5,
      glowLabel: "3.2x CRITICAL",
      textColor: "#ff1744",
    };
  } else if (temp >= 140) {
    // High Friction / Reciprocating Core (Pistons @ 145°C) — Radiant Golden-Orange
    return {
      color: 0xd97706,
      emissive: 0xea580c,
      intensity: 1.8,
      pulse: true,
      pulseRate: 2.5,
      glowLabel: "1.8x HIGH",
      textColor: "#fb923c",
    };
  } else if (temp >= 110) {
    // Nominal Combustion Heads (Cylinders 1, 2, 4 @ 122°C) — Warm Amber Titanium
    return {
      color: 0x283344,
      emissive: 0xb45309,
      intensity: 0.75,
      pulse: false,
      glowLabel: "0.75x NOMINAL",
      textColor: "#f59e0b",
    };
  } else if (temp >= 75) {
    // Moderate / Hydrodynamic (Crankshaft & Oil Sump @ 86°C - 92°C) — Deep Golden Amber
    return {
      color: 0x1c1710,
      emissive: 0x78350f,
      intensity: 0.45,
      pulse: false,
      glowLabel: "0.45x LUBRICATED",
      textColor: "#d97706",
    };
  } else {
    // Structural / Ambient Auxiliary (Intake, Starter, Hub @ 40°C) — Precision Titanium Slate
    return {
      color: 0x273549,
      emissive: 0x1e293b,
      intensity: 0.1,
      pulse: false,
      glowLabel: "0.1x AMBIENT",
      textColor: "#94a3b8",
    };
  }
}

// ── DEEP DETAILED RADIOGRAPHIC METALLIC X-RAY MATERIALS ──
// Calibrated for authentic metallic presence, tactile relief, and crystal-clear inner kinematics
const XRAY_MATERIALS = {
  // Moving Pistons (Solid Gleaming Radiodense White/Titanium)
  movingPiston: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x94a3b8,
    emissiveIntensity: 0.35,
    roughness: 0.12,
    metalness: 0.95,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    side: THREE.DoubleSide,
  }),
  // Recessed cavities, holes, hollow wrist pin bore, and valve pockets
  pistonVoid: new THREE.MeshStandardMaterial({
    color: 0x070b12,
    roughness: 0.90,
    metalness: 0.10,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    side: THREE.DoubleSide,
  }),
  // Piston rings in X-Ray (Gleaming radiopaque high-contrast rings)
  pistonRing: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xdde5ed,
    emissiveIntensity: 0.55,
    roughness: 0.06,
    metalness: 0.98,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  // Wrist pin outer sleeve (Mirror ultra-dense steel)
  pistonPin: new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xb0bec5,
    emissiveIntensity: 0.45,
    roughness: 0.08,
    metalness: 0.96,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  // Bronze bushing in small end (Dense bronze contrast)
  smallEndBushing: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x78909c,
    emissiveIntensity: 0.35,
    roughness: 0.15,
    metalness: 0.92,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  // Moving Connecting Rods & Hardware (Solid Dense Forged Steel)
  movingRod: new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    emissive: 0x64748b,
    emissiveIntensity: 0.30,
    roughness: 0.16,
    metalness: 0.92,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
    side: THREE.DoubleSide,
  }),
  // Moving Crankshaft & Balance Counterweights (Solid Bright Nitrided Steel)
  movingCrank: new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x94a3b8,
    emissiveIntensity: 0.40,
    roughness: 0.10,
    metalness: 0.96,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  // Moving Timing Gears & Chain (Solid Radiopaque Steel)
  movingGear: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x475569,
    emissiveIntensity: 0.30,
    roughness: 0.18,
    metalness: 0.90,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  // Moving Propeller Drive Hub & Bolts (Solid Radiopaque Steel)
  movingPropHub: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.20,
    metalness: 0.90,
    transparent: false,
    opacity: 1.0,
    depthWrite: true,
  }),
  // Deep Metallic Translucent Housings (Cylinder Heads, Rocker Covers, Oil Pan, Gearbox - 48% opacity)
  ghostHousing: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x242e3d,
    emissiveIntensity: 0.22,
    roughness: 0.30,
    metalness: 0.88,
    transparent: true,
    opacity: 0.48, // Deep & detailed metallic presence per user request!
    depthWrite: false,
  }),
  // Deep Metallic Crankcase Housing (opacity 0.48 so casing ribs & spinning crank are both clear)
  ghostCrankcase: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x1e2632,
    emissiveIntensity: 0.22,
    roughness: 0.30,
    metalness: 0.88,
    transparent: true,
    opacity: 0.48, // Deep & detailed metallic presence per user request!
    depthWrite: false,
  }),
  // Cylinder Liner Wall (Translucent 0.38 with cross-hatch hone reflection)
  ghostCylinderLiner: new THREE.MeshStandardMaterial({
    color: 0x475569,
    emissive: 0x1e293b,
    emissiveIntensity: 0.22,
    roughness: 0.28,
    metalness: 0.88,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  }),
  // Cooling Fin Discs (Translucent 0.28 so 14 fins form a deep layered cooling cage)
  ghostFinDisc: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x334155,
    emissiveIntensity: 0.20,
    roughness: 0.32,
    metalness: 0.86,
    transparent: true,
    opacity: 0.28,
    depthWrite: false,
  }),
  // Fin Outer Rim Chamfers (Crisp technical radiographic contour rings 0.72)
  ghostFinRim: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x94a3b8,
    emissiveIntensity: 0.40,
    roughness: 0.22,
    metalness: 0.92,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
  }),
  // Crankcase Structural Bulkhead Bearing Arches (opacity 0.62)
  ghostStructuralRib: new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    emissive: 0x475569,
    emissiveIntensity: 0.32,
    roughness: 0.26,
    metalness: 0.90,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  }),
  // Conduits & Hardlines (Exhaust, Fuel Lines, Ignition Trunk - opacity 0.52)
  ghostConduit: new THREE.MeshStandardMaterial({
    color: 0x718096,
    emissive: 0x334155,
    emissiveIntensity: 0.24,
    roughness: 0.30,
    metalness: 0.88,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  }),
  // Propeller Blades & Spinner Cone (opacity 0.45)
  ghostPropeller: new THREE.MeshStandardMaterial({
    color: 0x64748b,
    emissive: 0x1e293b,
    emissiveIntensity: 0.20,
    roughness: 0.26,
    metalness: 0.82,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  }),
  // Hardware & Fasteners (opacity 0.78 for sharp radiopaque bolt heads)
  ghostHardware: new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0x64748b,
    emissiveIntensity: 0.35,
    roughness: 0.20,
    metalness: 0.92,
    transparent: true,
    opacity: 0.78,
    depthWrite: false,
  }),
};

// ── UNIFIED MESH COMPONENT CLASSIFIER ──────────────────────────────────────
function getMeshComponentRole(child, id) {
  // 1. Reciprocating / Rotating Powertrain Core
  if (id.startsWith("piston_")) {
    if (child.userData.isVoid) return "CORE_VOID";
    if (child.userData.isRing) return "CORE_RING";
    if (child.userData.isPin) return "CORE_PIN";
    return "CORE_PISTON";
  }
  if (id.startsWith("con_rod_")) {
    if (child.userData.isVoid) return "CORE_VOID";
    if (child.userData.isBushing) return "CORE_BUSHING";
    return "CORE_ROD";
  }
  if (id === "crankshaft") return "CORE_CRANK";

  // 2. Reduction Gearbox
  if (id === "reduction_gearbox") {
    if (child.userData.isConcentricRing || child.name?.includes("CONCENTRIC") || child.geometry?.type === "TorusGeometry") {
      return "CONCENTRIC_RING";
    }
    const isInternalGear = (child.geometry?.type === "CylinderGeometry" && (child.geometry?.parameters?.radiusTop || 0) < 0.045);
    return isInternalGear ? "CORE_GEAR" : "HOUSING_CASE";
  }

  // 3. Propeller Drive Hub vs Aero Blades & Spinner
  if (id === "propeller_assembly") {
    const isHubOrBolt = (child.geometry?.type === "CylinderGeometry" && (child.geometry?.parameters?.radiusTop || 0) <= 0.045);
    return isHubOrBolt ? "CORE_PROP_HUB" : "PROPELLER_AERO";
  }

  // 4. Cylinder Block & Fins
  if (id === "cylinder_block") {
    if (child.geometry?.type === "TorusGeometry") return "FIN_RIM";
    if (child.geometry?.type === "CylinderGeometry") {
      const h = child.geometry?.parameters?.height || 0;
      if (h <= 0.005) return "FIN_DISC";
      return "CYLINDER_LINER";
    }
    return "HOUSING_BLOCK";
  }

  // 5. Crankcase
  if (id.startsWith("crankcase")) {
    if (child.geometry?.type === "TorusGeometry") return "STRUCTURAL_BEARING_RIB";
    return "HOUSING_CRANKCASE";
  }

  // 6. Cylinder Head & Rocker Cover
  if (id === "cylinder_head" || id === "rocker_cover") return "HOUSING_HEAD";

  // 7. Rear Accessory Case & ECU
  if (id === "rear_accessory_case") return "HOUSING_REAR";

  // 8. Air Intake & Manifolds
  if (id === "top_air_intake" || id === "intake_manifold") {
    if (child.geometry?.type === "TorusGeometry") return "CONCENTRIC_RING";
    return "HOUSING_INTAKE";
  }

  // 9. Conduits, Piping, and Fluid Systems
  if (
    id === "exhaust_system" ||
    id === "fuel_system" ||
    id === "fuel_rail_assembly" ||
    id === "ignition_system" ||
    id === "oil_cooler_system"
  ) {
    return "CONDUIT_LINE";
  }

  // 10. Engine Mounts (Structural Housing with Hardware Fasteners)
  if (id === "engine_mounts") {
    if (child.name?.includes("BOLT") || child.name?.includes("STUD") || child.userData.isHardware) {
      return "HARDWARE_FASTENER";
    }
    return "HOUSING_CASE";
  }

  // 11. Hardware and Fasteners
  if (
    child.userData.isHardware ||
    child.name?.includes("BOLT") ||
    child.name?.includes("STUD") ||
    child.name?.includes("CLAMP")
  ) {
    return "HARDWARE_FASTENER";
  }

  // 12. Concentric rings anywhere
  if (child.userData.isConcentricRing || child.name?.includes("CONCENTRIC")) {
    return "CONCENTRIC_RING";
  }

  return "HOUSING_GENERAL";
}

// ── GET DETAILED RADIOGRAPHIC METALLIC X-RAY MATERIAL (PRESERVES BUMP & TEXTURE) ──
function getDetailedXRayMaterial(child, role, scale = 1.0) {
  if (child.userData.xrayMat) {
    if (child.userData.xrayBaseOpacity) {
      child.userData.xrayMat.opacity = Math.min(1.0, child.userData.xrayBaseOpacity * scale);
    }
    return child.userData.xrayMat;
  }

  const origMat = child.userData.origMaterial || child.material;
  const bump = origMat?.bumpMap || null;
  const bumpScale = (origMat?.bumpScale || 0.04) * 1.6;

  let baseTemplate;
  let baseOpacity = 1.0;

  switch (role) {
    case "CORE_PISTON":
      baseTemplate = XRAY_MATERIALS.movingPiston;
      break;
    case "CORE_VOID":
      baseTemplate = XRAY_MATERIALS.pistonVoid;
      break;
    case "CORE_RING":
      baseTemplate = XRAY_MATERIALS.pistonRing;
      break;
    case "CORE_PIN":
      baseTemplate = XRAY_MATERIALS.pistonPin;
      break;
    case "CORE_BUSHING":
      baseTemplate = XRAY_MATERIALS.smallEndBushing;
      break;
    case "CORE_ROD":
      baseTemplate = XRAY_MATERIALS.movingRod;
      break;
    case "CORE_CRANK":
      baseTemplate = XRAY_MATERIALS.movingCrank;
      break;
    case "CORE_GEAR":
      baseTemplate = XRAY_MATERIALS.movingGear;
      break;
    case "CORE_PROP_HUB":
      baseTemplate = XRAY_MATERIALS.movingPropHub;
      break;
    case "FIN_RIM":
      baseTemplate = XRAY_MATERIALS.ghostFinRim;
      baseOpacity = 0.72;
      break;
    case "FIN_DISC":
      baseTemplate = XRAY_MATERIALS.ghostFinDisc;
      baseOpacity = 0.28;
      break;
    case "CYLINDER_LINER":
      baseTemplate = XRAY_MATERIALS.ghostCylinderLiner;
      baseOpacity = 0.38;
      break;
    case "STRUCTURAL_BEARING_RIB":
    case "CONCENTRIC_RING":
      baseTemplate = XRAY_MATERIALS.ghostStructuralRib;
      baseOpacity = 0.62;
      break;
    case "HARDWARE_FASTENER":
      baseTemplate = XRAY_MATERIALS.ghostHardware;
      baseOpacity = 0.78;
      break;
    case "CONDUIT_LINE":
      baseTemplate = XRAY_MATERIALS.ghostConduit;
      baseOpacity = 0.52;
      break;
    case "PROPELLER_AERO":
      baseTemplate = XRAY_MATERIALS.ghostPropeller;
      baseOpacity = 0.45;
      break;
    case "HOUSING_CRANKCASE":
      baseTemplate = XRAY_MATERIALS.ghostCrankcase;
      baseOpacity = 0.48;
      break;
    case "HOUSING_BLOCK":
    case "HOUSING_HEAD":
    case "HOUSING_CASE":
    case "HOUSING_REAR":
    case "HOUSING_INTAKE":
    case "HOUSING_GENERAL":
    default:
      baseTemplate = XRAY_MATERIALS.ghostHousing;
      baseOpacity = 0.48;
      break;
  }

  const mat = baseTemplate.clone();
  if (bump) {
    mat.bumpMap = bump;
    mat.bumpScale = bumpScale;
  }
  if (baseOpacity < 1.0) {
    mat.transparent = true;
    mat.opacity = Math.min(1.0, baseOpacity * scale);
  }

  child.userData.xrayMat = mat;
  child.userData.xrayBaseOpacity = baseOpacity;
  return mat;
}

// ── GET AEROSPACE BLUE & BRONZE HOLOGRAPHIC MATERIAL ──
function getClassyMatteHoloMaterial(child, role, scale = 1.0) {
  const HOLO_CACHE_KEY = "holoMat_v5_blue_bronze_master";
  if (child.userData[HOLO_CACHE_KEY]) {
    if (child.userData.holoBaseOpacity) {
      child.userData[HOLO_CACHE_KEY].opacity = Math.min(1.0, child.userData.holoBaseOpacity * scale);
    }
    return child.userData[HOLO_CACHE_KEY];
  }

  const origMat = child.userData.origMaterial || child.material;
  const bump = origMat?.bumpMap || null;
  const bumpScale = origMat?.bumpScale || 0.04;

  let baseTemplate;
  let baseOpacity = 1.0;

  switch (role) {
    case "CORE_PISTON":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xd4883b, // Machined Phosphor Bronze Piston Crown
        emissive: 0x5c2b08, // Warm internal bronze glow
        emissiveIntensity: 0.40,
        roughness: 0.15,
        metalness: 0.98,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      break;
    case "CORE_ROD":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xb86c28, // Heavy Forged Aerospace Bronze I-Beam Rod
        emissive: 0x481e04,
        emissiveIntensity: 0.35,
        roughness: 0.18,
        metalness: 0.96,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
        side: THREE.DoubleSide,
      });
      break;
    case "CORE_CRANK":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xc4782b, // Precision Machined Manganese-Bronze Crankshaft
        emissive: 0x522405,
        emissiveIntensity: 0.40,
        roughness: 0.14,
        metalness: 0.98,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });
      break;
    case "CORE_GEAR":
    case "CORE_PROP_HUB":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xc4782b, // Precision hobbed bronze gears & propeller drive hub
        emissive: 0x481e04,
        emissiveIntensity: 0.35,
        roughness: 0.16,
        metalness: 0.95,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });
      break;
    case "CORE_PIN":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xe8a462, // Mirror-lapped burnished bronze wrist pin
        emissive: 0x6e3305,
        emissiveIntensity: 0.45,
        roughness: 0.08,
        metalness: 0.98,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });
      break;
    case "CORE_RING":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xf09f58, // Polished rose bronze / copper compression ring face
        emissive: 0x8a3c04,
        emissiveIntensity: 0.60,
        roughness: 0.06,
        metalness: 0.98,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });
      break;
    case "CORE_BUSHING":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0x9c4810, // Sintered oil-bronze bearing bushing
        emissive: 0x3d1802,
        emissiveIntensity: 0.30,
        roughness: 0.20,
        metalness: 0.92,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });
      break;
    case "CORE_VOID":
      baseTemplate = XRAY_MATERIALS.pistonVoid;
      break;
    case "FIN_RIM":
      baseTemplate = HOLOGRAPHIC_MATERIALS.contour;
      baseOpacity = 0.95;
      break;
    case "FIN_DISC":
      baseTemplate = HOLOGRAPHIC_MATERIALS.finDisc;
      baseOpacity = 0.10; // Ultra-sheer so pistons inside are completely visible
      break;
    case "CYLINDER_LINER":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0x0a162b, // Transparent deep midnight sapphire guide sleeve
        emissive: 0x1d4ed8,
        emissiveIntensity: 0.20,
        roughness: 0.20,
        metalness: 0.90,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      baseOpacity = 0.12; // Sheer bore so piston crown is totally unobstructed
      break;
    case "STRUCTURAL_BEARING_RIB":
    case "CONCENTRIC_RING":
      baseTemplate = HOLOGRAPHIC_MATERIALS.concentricRing;
      baseOpacity = 0.80;
      break;
    case "HARDWARE_FASTENER":
      baseTemplate = new THREE.MeshStandardMaterial({
        color: 0xdf9b56, // Gleaming Machined Phosphor Bronze hex fasteners & cylinder studs
        emissive: 0x6e3305,
        emissiveIntensity: 0.35,
        roughness: 0.10,
        metalness: 0.98,
        transparent: false,
        opacity: 1.0,
        depthWrite: true,
      });
      baseOpacity = 1.0;
      break;
    case "CONDUIT_LINE":
      baseTemplate = HOLOGRAPHIC_MATERIALS.conduit;
      baseOpacity = 0.55;
      break;
    case "PROPELLER_AERO":
      baseTemplate = HOLOGRAPHIC_MATERIALS.propeller;
      baseOpacity = 0.35;
      break;
    case "HOUSING_BLOCK":
      baseTemplate = HOLOGRAPHIC_MATERIALS.shell;
      baseOpacity = 0.22; // Very sheer around cylinders to let bronze pistons dominate
      break;
    case "HOUSING_CRANKCASE":
      baseTemplate = HOLOGRAPHIC_MATERIALS.shell;
      baseOpacity = 0.28; // Translucent lower casing revealing spinning crankshaft
      break;
    case "HOUSING_HEAD":
    case "HOUSING_CASE":
    case "HOUSING_REAR":
    case "HOUSING_INTAKE":
    case "HOUSING_GENERAL":
    default:
      baseTemplate = HOLOGRAPHIC_MATERIALS.shell;
      baseOpacity = 0.35;
      break;
  }

  const mat = baseTemplate.clone();
  if (bump) {
    mat.bumpMap = bump;
    mat.bumpScale = bumpScale;
  }
  if (baseOpacity < 1.0) {
    mat.transparent = true;
    mat.opacity = Math.min(1.0, baseOpacity * scale);
  }

  child.userData[HOLO_CACHE_KEY] = mat;
  child.userData.holoMat = mat;
  child.userData.holoBaseOpacity = baseOpacity;
  return mat;
}

export default function InteractiveEngine3D({ telemetryData, onSelectComponent }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const cameraRef = useRef(null);
  const engineModelRef = useRef(null);
  const animationFrameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const xrayPointLightRef = useRef(null);

  // States
  const [selectedPart, setSelectedPart] = useState(null);
  const [hoveredPart, setHoveredPart] = useState(null);
  const [diagMode, setDiagMode] = useState("ASSEMBLY"); // Default to ASSEMBLY mode for mechanical realism
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [isFiringOrderVisible, setIsFiringOrderVisible] = useState(true);
  const [activeAnomaly, setActiveAnomaly] = useState("NOMINAL");
  const [simRpm, setSimRpm] = useState(telemetryData?.telemetry?.rpm || 4850);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [activeFiringCylinder, setActiveFiringCylinder] = useState(1);
  const [activePreset, setActivePreset] = useState("ISO");
  const [xrayOpacityScale, setXrayOpacityScale] = useState(1.0);
  const [holoOpacityScale, setHoloOpacityScale] = useState(1.0);

  const updateXRayOpacity = useCallback((scale) => {
    setXrayOpacityScale(scale);
    XRAY_MATERIALS.ghostHousing.opacity = Math.min(1.0, 0.48 * scale);
    XRAY_MATERIALS.ghostCrankcase.opacity = Math.min(1.0, 0.48 * scale);
    XRAY_MATERIALS.ghostCylinderLiner.opacity = Math.min(1.0, 0.38 * scale);
    XRAY_MATERIALS.ghostFinDisc.opacity = Math.min(1.0, 0.28 * scale);
    XRAY_MATERIALS.ghostFinRim.opacity = Math.min(1.0, 0.72 * scale);
    XRAY_MATERIALS.ghostStructuralRib.opacity = Math.min(1.0, 0.62 * scale);
    XRAY_MATERIALS.ghostConduit.opacity = Math.min(1.0, 0.52 * scale);
    XRAY_MATERIALS.ghostPropeller.opacity = Math.min(1.0, 0.45 * scale);
    XRAY_MATERIALS.ghostHardware.opacity = Math.min(1.0, 0.78 * scale);

    if (engineModelRef.current?.components) {
      engineModelRef.current.components.forEach((comp) => {
        comp.traverse((child) => {
          if (child.isMesh && child.userData.xrayMat && child.userData.xrayBaseOpacity) {
            child.userData.xrayMat.opacity = Math.min(1.0, child.userData.xrayBaseOpacity * scale);
          }
        });
      });
    }
  }, []);

  const updateHoloOpacity = useCallback((scale) => {
    setHoloOpacityScale(scale);
    HOLOGRAPHIC_MATERIALS.shell.opacity = Math.min(1.0, 0.36 * scale);
    HOLOGRAPHIC_MATERIALS.concentricRing.opacity = Math.min(1.0, 0.80 * scale);
    HOLOGRAPHIC_MATERIALS.contour.opacity = Math.min(1.0, 0.92 * scale);
    HOLOGRAPHIC_MATERIALS.finDisc.opacity = Math.min(1.0, 0.14 * scale);
    HOLOGRAPHIC_MATERIALS.conduit.opacity = Math.min(1.0, 0.55 * scale);
    HOLOGRAPHIC_MATERIALS.propeller.opacity = Math.min(1.0, 0.35 * scale);

    if (engineModelRef.current?.components) {
      engineModelRef.current.components.forEach((comp) => {
        comp.traverse((child) => {
          if (child.isMesh && child.userData.holoMat && child.userData.holoBaseOpacity) {
            child.userData.holoMat.opacity = Math.min(1.0, child.userData.holoBaseOpacity * scale);
          }
        });
      });
    }
  }, []);

  // Raycaster & Pointers
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());

  // Multi-component pull-out animation tracking
  const pullOutTargetsRef = useRef(new Map());
  const isInspectingRef = useRef(false);

  // Camera preset transition refs
  const targetCameraPosRef = useRef(new THREE.Vector3(0.58, 0.32, 0.56));
  const isTransitioningCameraRef = useRef(false);

  // Refs for current mode to avoid re-binding loops
  const diagModeRef = useRef(diagMode);
  diagModeRef.current = diagMode;
  const activeAnomalyRef = useRef(activeAnomaly);
  activeAnomalyRef.current = activeAnomaly;
  const telemetryDataRef = useRef(telemetryData);
  telemetryDataRef.current = telemetryData;
  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;
  const simRpmRef = useRef(simRpm);
  simRpmRef.current = simRpm;

  // Sync RPM with telemetry if nominal
  useEffect(() => {
    if (telemetryData?.telemetry?.rpm && activeAnomaly === "NOMINAL") {
      setSimRpm(telemetryData.telemetry.rpm);
    }
  }, [telemetryData, activeAnomaly]);

  // ═════════════════════════════════════════════════════════════════════════
  // REUSABLE MATERIAL UPDATE FUNCTION (NO SCENE RELOAD)
  // ═════════════════════════════════════════════════════════════════════════
  const updateEngineMaterials = useCallback((mode, anomaly, telData) => {
    if (!engineModelRef.current) return;
    const { components } = engineModelRef.current;
    const tel = telData?.telemetry || {};

    const isCyl3Fault = anomaly === "OVERHEAT_CYL3";
    const isHighEgt = anomaly === "HIGH_EGT";
    const isHighVib = anomaly === "HIGH_VIB";
    const isLowOil = anomaly === "LOW_OIL";

    // ── Update Global Aerospace Thermal & Monochromatic X-Ray Shader Uniforms ──
    thermalUniforms.uThermalWeight.value = mode === "THERMAL" ? 1.0 : 0.0;
    thermalUniforms.uXRayWeight.value = mode === "XRAY" ? 1.0 : 0.0;
    thermalUniforms.uAnomalyCyl3.value = isCyl3Fault ? 1.0 : 0.0;
    thermalUniforms.uHighEgt.value = isHighEgt ? 1.0 : 0.0;
    thermalUniforms.uHighVib.value = isHighVib ? 1.0 : 0.0;
    thermalUniforms.uLowOil.value = isLowOil ? 1.0 : 0.0;

    components.forEach((comp) => {
      const id = comp.userData.partId || "";

      comp.traverse((child) => {
        if (!child.isMesh) return;
        if (!child.userData.origMaterial) {
          child.userData.origMaterial = child.material;
        }

        if (mode === "ASSEMBLY") {
          // Pure 100% Manufactured Metallic Engine
          child.material = child.userData.origMaterial;
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.transparent = false;
              m.opacity = 1.0;
              m.depthWrite = true;
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.depthWrite = true;
          }
          child.userData.glowPulse = false;
        } else if (mode === "THERMAL") {
          // REAL METALLIC MATERIAL + CONTINUOUS THERMAL HEATMAP OVERLAY
          child.material = child.userData.origMaterial;
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => {
              m.transparent = false;
              m.opacity = 1.0;
              m.depthWrite = true;
            });
          } else {
            child.material.transparent = false;
            child.material.opacity = 1.0;
            child.material.depthWrite = true;
          }
          child.userData.glowPulse = false;
        } else if (mode === "XRAY") {
          // ── PURE MONOCHROMATIC RADIOGRAPHIC METALLIC X-RAY (DEEP METALLIC CASINGS + VISIBLE MOVING CORE) ──
          child.userData.glowPulse = false;
          const role = getMeshComponentRole(child, id);
          child.material = getDetailedXRayMaterial(child, role, xrayOpacityScale);
        } else if (mode === "HOLOGRAPHIC") {
          // ── CLASSY MATTE MECHANICAL HOLOGRAPHIC DIGITAL TWIN (ZERO GLOSS, MATTE TITANIUM & SLATE) ──
          child.userData.glowPulse = false;
          const role = getMeshComponentRole(child, id);
          child.material = getClassyMatteHoloMaterial(child, role, holoOpacityScale);
        } else if (mode === "VIBRATION") {
          if (id === "propeller_assembly") {
            child.material = child.userData.origMaterial;
          } else if (
            id === "crankshaft" ||
            id === "reduction_gearbox" ||
            id.startsWith("con_rod") ||
            id.startsWith("piston")
          ) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              emissive: 0xb45309,
              emissiveIntensity: 1.4,
              metalness: 0.9,
              roughness: 0.2,
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x1e293b,
              transparent: true,
              opacity: 0.28,
              metalness: 0.8,
            });
          }
        } else if (mode === "LUBRICATION") {
          if (id === "propeller_assembly") {
            child.material = child.userData.origMaterial;
          } else if (
            id === "oil_cooler_system" ||
            id === "rear_accessory_case" ||
            id === "crankshaft"
          ) {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xfbbf24,
              emissive: 0xd97706,
              emissiveIntensity: 1.8,
              metalness: 0.85,
              roughness: 0.15,
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x1e293b,
              transparent: true,
              opacity: 0.22,
              metalness: 0.8,
            });
          }
        } else if (mode === "IGNITION") {
          if (id === "propeller_assembly") {
            child.material = child.userData.origMaterial;
          } else if (id === "ignition_system" || id === "cylinder_head") {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              emissive: 0x0284c7,
              emissiveIntensity: 1.8,
              metalness: 0.7,
              roughness: 0.2,
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x1e293b,
              transparent: true,
              opacity: 0.22,
              metalness: 0.8,
            });
          }
        } else if (mode === "EXHAUST") {
          if (id === "propeller_assembly") {
            child.material = child.userData.origMaterial;
          } else if (id === "exhaust_system") {
            child.material = new THREE.MeshStandardMaterial({
              color: 0xffedd5,
              emissive: 0xff4400,
              emissiveIntensity: 3.5,
              metalness: 0.7,
              roughness: 0.18,
            });
          } else {
            child.material = new THREE.MeshStandardMaterial({
              color: 0x1e293b,
              transparent: true,
              opacity: 0.22,
              metalness: 0.8,
            });
          }
        }
      });
    });
  }, []);

  // Update materials when diagMode or anomaly changes
  useEffect(() => {
    updateEngineMaterials(diagMode, activeAnomaly, telemetryData);
  }, [diagMode, activeAnomaly, telemetryData, updateEngineMaterials]);

  // ═════════════════════════════════════════════════════════════════════════
  // SCENE INITIALIZATION (RUNS ONCE ON MOUNT ONLY)
  // ═════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 560;

    const scene = new THREE.Scene();
    scene.background = null; // Transparent background to display brushed metallic background plate
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 50);
    camera.position.set(0.58, 0.32, 0.56);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0); // 100% transparent canvas for brushed metal background
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.20;
    controls.maxDistance = 2.0;
    controls.maxPolarAngle = Math.PI * 0.88;
    controls.target.set(0.01, 0.01, 0);
    controls.addEventListener("start", () => {
      isTransitioningCameraRef.current = false;
    });
    controlsRef.current = controls;

    // High-Contrast Aerospace CAD Studio Lighting Rig
    // Subtle cool ambient fill (preserves deep metal shadows and crevices)
    const ambientLight = new THREE.AmbientLight(0x1e293b, 0.35);
    scene.add(ambientLight);

    // Primary Focused Key Light (Crisp daylight key light @ top-front-right)
    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.35);
    keyLight.position.set(1.4, 2.2, 1.6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0001;
    scene.add(keyLight);

    // Front-Right Fill Light (Subtle soft fill for exhaust pipes and gearbox without overexposing)
    const fillLight = new THREE.DirectionalLight(0x8fa0b2, 0.55);
    fillLight.position.set(1.0, 0.5, 2.0);
    scene.add(fillLight);

    // Rear-Left Rim Light (Crisp cool specular edge highlight on cylinder fins and spine)
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.70);
    rimLight.position.set(-1.6, 1.2, -1.4);
    scene.add(rimLight);

    // Dedicated Rear Studio Key Light (Illuminates rear drive plate, ECU, pods & filter)
    const rearKeyLight = new THREE.DirectionalLight(0xfff8ee, 1.45);
    rearKeyLight.position.set(-2.2, 1.0, 0.4);
    rearKeyLight.castShadow = true;
    scene.add(rearKeyLight);

    // Rear Fill Light (Soft ambient bounce for rear lower sump and canisters)
    const rearFillLight = new THREE.DirectionalLight(0x94a3b8, 0.75);
    rearFillLight.position.set(-1.8, -0.5, -0.8);
    scene.add(rearFillLight);

    // Subtle Underside Bounce Light (warm ground reflection for oil sump)
    const bounceLight = new THREE.DirectionalLight(0x334155, 0.30);
    bounceLight.position.set(0, -1.4, 0);
    scene.add(bounceLight);

    // Internal Dynamic X-Ray Thermal Point Light
    const xrayPointLight = new THREE.PointLight(0xff7700, 1.0, 1.5);
    xrayPointLight.position.set(0, 0, 0);
    scene.add(xrayPointLight);
    xrayPointLightRef.current = xrayPointLight;

    // ── GLOWING AEROSPACE DIGITAL TWIN GROUND PEDESTAL ──
    const pedestalGroup = new THREE.Group();
    pedestalGroup.position.y = -0.27;

    // Dark titanium grid floor
    const gridHelper = new THREE.GridHelper(1.8, 36, 0x38bdf8, 0x0f172a);
    gridHelper.material.opacity = 0.22;
    gridHelper.material.transparent = true;
    pedestalGroup.add(gridHelper);

    // Concentric glowing target rings
    const ringSpecs = [
      { r: 0.18, op: 0.15, col: 0x38bdf8 },
      { r: 0.34, op: 0.28, col: 0x00f0ff },
      { r: 0.52, op: 0.18, col: 0x0284c7 },
      { r: 0.70, op: 0.12, col: 0x38bdf8 },
    ];
    ringSpecs.forEach((spec) => {
      const ringGeo = new THREE.RingGeometry(spec.r, spec.r + 0.003, 64);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: spec.col,
        transparent: true,
        opacity: spec.op,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      pedestalGroup.add(ringMesh);
    });

    // 4 Cardinal Axis Tick Lines with Crosshairs
    const axisMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-0.72, 0.001, 0),
      new THREE.Vector3(0.72, 0.001, 0),
      new THREE.Vector3(0, 0.001, -0.72),
      new THREE.Vector3(0, 0.001, 0.72),
    ]);
    const axisLines = new THREE.LineSegments(axisGeo, axisMat);
    pedestalGroup.add(axisLines);

    // Subtle Radial Glow Disc
    const discGeo = new THREE.CircleGeometry(0.55, 32);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.05,
      depthWrite: false,
    });
    pedestalGroup.add(new THREE.Mesh(discGeo, discMat));

    scene.add(pedestalGroup);

    // Assemble Engine Architecture
    const engine = buildVRDE180Engine();
    if (engine.envMap) {
      scene.environment = engine.envMap;
    }
    scene.add(engine.root);
    engineModelRef.current = engine;

    // Apply initial materials based on diagModeRef
    updateEngineMaterials(diagModeRef.current, activeAnomalyRef.current, telemetryDataRef.current);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Master 60 FPS Kinematics Animation Loop
    let crankAngle = 0;
    const r = ENGINE.crankRadius; // 76mm stroke / 2 = 38mm crank throw
    const l = ENGINE.rodLength; // 115mm connecting rod length
    const crankCenterY = ENGINE.crankCenterY; // Crankshaft longitudinal centerline Y

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = clockRef.current.getDelta();
      controls.update();

      // Update thermal simulation time for radiometric shimmer
      thermalUniforms.uTime.value = clockRef.current.getElapsedTime();

      // Kinematics Driven by RPM
      const currentRpm = simRpmRef.current || 4850;
      if (isRotatingRef.current && engine.kinematicNodes.crankshaft && engine.kinematicNodes.propellerAssembly) {
        const angularVelocity = (currentRpm / 60) * Math.PI * 2;
        const angleStep = angularVelocity * delta;
        crankAngle += angleStep;

        // Propeller rotates counter to crankshaft at 1.6:1 reduction gear ratio along X
        engine.kinematicNodes.propellerAssembly.rotation.x -= angleStep / 1.6;

        // Rear central drive hub rotates synchronously along X
        const rearHub = engine.kinematicNodes.rearDriveHub || engine.root.getObjectByName("REAR_ROTATING_DRIVE_HUB");
        if (rearHub) {
          rearHub.rotation.x = engine.kinematicNodes.propellerAssembly.rotation.x;
        }

        // Crankshaft rotates along its longitudinal X-axis
        engine.kinematicNodes.crankshaft.rotation.x = crankAngle;

        // Mathematical Slider-Crank Vertical Piston Reciprocation:
        // Constrained strictly to cylinder centerlines (X = p.x, Z = 0)
        // Pistons translate ONLY along Y: UP ↑ and DOWN ↓
        engine.kinematicNodes.pistons.forEach((p) => {
          const theta = crankAngle + p.crankAngleOffset;
          const sinT = Math.sin(theta);
          const cosT = Math.cos(theta);
          const yDisp = r * cosT + Math.sqrt(l * l - (r * sinT) * (r * sinT)) - (r + l);
          p.mesh.position.set(p.x, p.baseY + yDisp, 0);
          p.mesh.rotation.set(0, 0, 0); // Strictly vertical, no tilt
        });

        // Articulating Connecting Rod Motion in Y-Z Plane around X
        engine.kinematicNodes.connectingRods.forEach((rod) => {
          const theta = crankAngle + rod.crankAngleOffset;
          const sinT = Math.sin(theta);
          const cosT = Math.cos(theta);
          const phi = Math.asin((r * sinT) / l);
          const pinY = crankCenterY + r * cosT;
          const pinZ = r * sinT;
          const wristY = crankCenterY + r * cosT + Math.sqrt(l * l - (r * sinT) * (r * sinT));
          rod.mesh.position.set(rod.x, 0.5 * (pinY + wristY), 0.5 * pinZ);
          rod.mesh.rotation.set(-phi, 0, 0);
        });

        // 1-3-4-2 Firing Order Combustion Cycle
        if (isFiringOrderVisible) {
          const cycleAngle = (crankAngle % (Math.PI * 4) + Math.PI * 4) % (Math.PI * 4);
          const phase = Math.floor((cycleAngle / (Math.PI * 4)) * 4);
          const cylOrder = [1, 3, 4, 2];
          const activeCyl = cylOrder[phase];
          setActiveFiringCylinder(activeCyl);

          const isXRay = diagModeRef.current === "XRAY";
          const isHolo = diagModeRef.current === "HOLOGRAPHIC";

          for (let c = 1; c <= 4; c++) {
            const flash = engine.kinematicNodes.combustionFlashes[c];
            if (flash) {
              const isActive = c === activeCyl;
              const targetOpacity = isActive ? (isXRay ? 0.35 : isHolo ? 0.35 : 0.85) : 0.0;
              flash.material.color.setHex(isXRay ? 0xffffff : isHolo ? 0xcd7f32 : 0xff7700);
              flash.material.opacity = THREE.MathUtils.lerp(flash.material.opacity, targetOpacity, 0.3);
              if (isActive) {
                flash.scale.setScalar(1.0 + Math.sin(crankAngle * 4) * 0.15);
              }
            }
          }
        }

        // Spinner Base Ring: calm classy finish in Holographic and XRay, dynamic in assembly
        if (engine.kinematicNodes.spinnerRing) {
          const isMatteOrXRay = diagModeRef.current === "HOLOGRAPHIC" || diagModeRef.current === "XRAY";
          engine.kinematicNodes.spinnerRing.material.emissiveIntensity =
            isMatteOrXRay ? 0.25 : 1.8 + Math.sin(crankAngle * 2) * 0.5;
        }

        // Top Intake Turbine Stator Fan Wheel Spin
        if (engine.kinematicNodes.intakeTurbineWheel) {
          engine.kinematicNodes.intakeTurbineWheel.rotation.x = crankAngle * 2.2;
        }

        // Lubrication Pulse Indicator
        if (engine.kinematicNodes.oilPulseLight) {
          if (diagModeRef.current === "LUBRICATION") {
            engine.kinematicNodes.oilPulseLight.intensity =
              0.8 + Math.sin(clockRef.current.elapsedTime * 8) * 0.6;
          } else {
            engine.kinematicNodes.oilPulseLight.intensity = 0.0;
          }
        }
      }

      // Localized Vibration Anomaly Simulation
      if (activeAnomalyRef.current === "HIGH_VIB" && engine.kinematicNodes.crankshaft) {
        const vibTime = clockRef.current.elapsedTime * 65;
        engine.kinematicNodes.crankshaft.position.y = crankCenterY + Math.sin(vibTime) * 0.0025;
        engine.kinematicNodes.crankshaft.position.z = Math.cos(vibTime * 0.8) * 0.002;
        engine.kinematicNodes.crankshaft.position.x = 0;
      } else if (engine.kinematicNodes.crankshaft) {
        engine.kinematicNodes.crankshaft.position.set(0, crankCenterY, 0);
      }

      // Smooth Pull-Out Lerp
      if (pullOutTargetsRef.current.size > 0) {
        pullOutTargetsRef.current.forEach((targetPos, comp) => {
          comp.position.lerp(targetPos, 0.08);
        });
      }

      // Smooth Camera Transition
      if (isTransitioningCameraRef.current) {
        camera.position.lerp(targetCameraPosRef.current, 0.08);
        controls.target.lerp(new THREE.Vector3(0.01, 0.01, 0), 0.08);
        if (camera.position.distanceTo(targetCameraPosRef.current) < 0.005) {
          camera.position.copy(targetCameraPosRef.current);
          isTransitioningCameraRef.current = false;
        }
      }

      // ── DYNAMIC THERMAL POINT LIGHT (ONLY ACTIVE IN THERMAL MODE) ──
      if (diagModeRef.current === "THERMAL") {
        const time = clockRef.current.elapsedTime;
        if (xrayPointLightRef.current) {
          if (activeAnomalyRef.current === "OVERHEAT_CYL3") {
            xrayPointLightRef.current.color.setHex(0xff002b);
            xrayPointLightRef.current.intensity = 2.8 + Math.sin(time * 6) * 0.8;
            xrayPointLightRef.current.position.set(0, 0.110, -0.030);
          } else if (activeAnomalyRef.current === "HIGH_EGT") {
            xrayPointLightRef.current.color.setHex(0xff5500);
            xrayPointLightRef.current.intensity = 3.2;
            xrayPointLightRef.current.position.set(0.088, -0.065, 0.0);
          } else {
            xrayPointLightRef.current.intensity = 0.0;
          }
        }
      } else if (diagModeRef.current === "HOLOGRAPHIC") {
        if (xrayPointLightRef.current) {
          xrayPointLightRef.current.color.setHex(0xdf9244);
          xrayPointLightRef.current.intensity = 1.6;
          xrayPointLightRef.current.position.set(0.02, -0.04, 0.0);
        }
      } else if (xrayPointLightRef.current) {
        xrayPointLightRef.current.intensity = 0.0;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []); // RUN ONCE ON MOUNT

  // ═════════════════════════════════════════════════════════════════════════
  // COMPONENT SELECTION & MULTI-STAGE PULL-OUT
  // ═════════════════════════════════════════════════════════════════════════
  const handleSelectComponent = useCallback(
    (component) => {
      if (!engineModelRef.current) return;
      const { components } = engineModelRef.current;

      setSelectedPart(component);
      if (onSelectComponent) {
        onSelectComponent(component?.userData || null);
      }

      pullOutTargetsRef.current.clear();

      if (!component) {
        isInspectingRef.current = false;
        components.forEach((comp) => {
          pullOutTargetsRef.current.set(comp, comp.userData.basePosition.clone());
        });
        updateEngineMaterials(diagModeRef.current, activeAnomalyRef.current, telemetryDataRef.current);

        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0.02, 0);
        }
        return;
      }

      isInspectingRef.current = true;
      const partId = component.userData.partId || "";

      // Check if a vertical piston or connecting rod was clicked
      if (partId.startsWith("piston_") || partId.startsWith("con_rod_")) {
        const match = partId.match(/\d+/);
        const cylNum = match ? parseInt(match[0], 10) : 1;
        const targetPiston = components.get(`piston_${cylNum}`);
        const targetRod = components.get(`con_rod_${cylNum}`);
        const block = components.get("cylinder_block");
        const head = components.get("cylinder_head");

        // Elevate head and block vertically to reveal internal reciprocating structures
        if (head) {
          pullOutTargetsRef.current.set(head, head.userData.basePosition.clone().add(new THREE.Vector3(0, 0.25, 0)));
        }
        if (block) {
          pullOutTargetsRef.current.set(block, block.userData.basePosition.clone().add(new THREE.Vector3(0, 0.12, 0)));
        }
        if (targetPiston) {
          pullOutTargetsRef.current.set(targetPiston, targetPiston.userData.basePosition.clone().add(new THREE.Vector3(0, 0.32, 0)));
        }
        if (targetRod) {
          pullOutTargetsRef.current.set(targetRod, targetRod.userData.basePosition.clone().add(new THREE.Vector3(0, 0.18, 0)));
        }

        components.forEach((comp) => {
          if (comp !== targetPiston && comp !== targetRod && comp !== head && comp !== block) {
            pullOutTargetsRef.current.set(comp, comp.userData.basePosition.clone());
          }
        });

        if (controlsRef.current && targetPiston) {
          const worldPos = new THREE.Vector3();
          targetPiston.getWorldPosition(worldPos);
          controlsRef.current.target.lerp(worldPos, 0.75);
        }
      } else {
        const dissVec = component.userData.disassemblyVector || new THREE.Vector3(0, 0, 0);
        const targetPos = component.userData.basePosition.clone().add(dissVec.clone().multiplyScalar(1.2));
        pullOutTargetsRef.current.set(component, targetPos);

        components.forEach((comp) => {
          if (comp !== component) {
            pullOutTargetsRef.current.set(comp, comp.userData.basePosition.clone());
          }
        });

        if (controlsRef.current) {
          const worldPos = new THREE.Vector3();
          component.getWorldPosition(worldPos);
          controlsRef.current.target.lerp(worldPos, 0.75);
        }
      }
    },
    [onSelectComponent, updateEngineMaterials]
  );

  // ═════════════════════════════════════════════════════════════════════════
  // EXPLODED VIEW CONTINUOUS SLIDER
  // ═════════════════════════════════════════════════════════════════════════
  const handleExplodeChange = useCallback((value) => {
    setExplodeFactor(value);
    if (!engineModelRef.current) return;
    const { components } = engineModelRef.current;

    pullOutTargetsRef.current.clear();
    components.forEach((comp) => {
      const dissVec = comp.userData.disassemblyVector || new THREE.Vector3(0, 0, 0);
      const targetPos = comp.userData.basePosition.clone().add(dissVec.clone().multiplyScalar(value));
      comp.position.copy(targetPos);
    });
  }, []);

  // ═════════════════════════════════════════════════════════════════════════
  // ANOMALY SIMULATOR INJECTOR
  // ═════════════════════════════════════════════════════════════════════════
  const triggerAnomalyScenario = useCallback(
    (scenario) => {
      setActiveAnomaly(scenario);
      if (!engineModelRef.current) return;
      const { components } = engineModelRef.current;

      components.forEach((comp) => {
        comp.userData.status = "NOMINAL";
        comp.userData.health = 98;
      });

      if (scenario === "OVERHEAT_CYL3") {
        const p3 = components.get("piston_3");
        const rod3 = components.get("con_rod_3");
        const block = components.get("cylinder_block");
        const head = components.get("cylinder_head");
        if (p3) {
          p3.userData.status = "CRITICAL";
          p3.userData.health = 58;
          p3.userData.temperature = 214;
        }
        if (rod3) {
          rod3.userData.status = "WARNING";
          rod3.userData.health = 70;
          rod3.userData.temperature = 145;
        }
        if (block) {
          block.userData.status = "CRITICAL";
          block.userData.health = 65;
          block.userData.temperature = 195;
        }
        if (head) {
          head.userData.status = "CRITICAL";
          head.userData.health = 62;
          head.userData.temperature = 214;
        }
      } else if (scenario === "HIGH_VIB") {
        const crank = components.get("crankshaft");
        const gearbox = components.get("reduction_gearbox");
        if (crank) {
          crank.userData.status = "CRITICAL";
          crank.userData.health = 66;
          crank.userData.vibration = 6.8;
        }
        if (gearbox) {
          gearbox.userData.status = "WARNING";
          gearbox.userData.health = 74;
          gearbox.userData.vibration = 4.5;
        }
      } else if (scenario === "LOW_OIL") {
        const oil = components.get("oil_cooler_system");
        const rearCase = components.get("rear_accessory_case");
        if (oil) {
          oil.userData.status = "CRITICAL";
          oil.userData.health = 58;
          oil.userData.pressure = 1.8;
        }
        if (rearCase) {
          rearCase.userData.status = "WARNING";
          rearCase.userData.health = 68;
        }
      } else if (scenario === "IGNITION_MISFIRE") {
        const ign = components.get("ignition_system");
        const p2 = components.get("piston_2");
        if (ign) {
          ign.userData.status = "WARNING";
          ign.userData.health = 72;
        }
        if (p2) {
          p2.userData.status = "WARNING";
          p2.userData.health = 75;
        }
      } else if (scenario === "HIGH_EGT") {
        const exh = components.get("exhaust_system");
        if (exh) {
          exh.userData.status = "WARNING";
          exh.userData.health = 74;
          exh.userData.temperature = 845;
        }
      } else {
        handleSelectComponent(null);
      }
    },
    [handleSelectComponent]
  );

  // ═════════════════════════════════════════════════════════════════════════
  // CAMERA VIEWPOINT PRESETS
  // ═════════════════════════════════════════════════════════════════════════
  const setCameraPreset = useCallback((preset) => {
    if (!cameraRef.current || !controlsRef.current) return;
    setActivePreset(preset);

    const positions = {
      ISO: new THREE.Vector3(0.58, 0.32, 0.56),
      FRONT: new THREE.Vector3(0.74, 0.01, 0.0),
      REAR: new THREE.Vector3(-0.95, 0.01, 0.0),
      LEFT: new THREE.Vector3(0.0, 0.03, -0.74),
      RIGHT: new THREE.Vector3(0.0, 0.03, 0.74),
      TOP: new THREE.Vector3(0.001, 0.78, 0.0),
      BOTTOM: new THREE.Vector3(0.001, -0.78, 0.0),
    };

    const targetPos = positions[preset] || positions.ISO;
    targetCameraPosRef.current.copy(targetPos);
    isTransitioningCameraRef.current = true;
  }, []);



  // ═════════════════════════════════════════════════════════════════════════
  // POINTER RAYCASTING
  // ═════════════════════════════════════════════════════════════════════════
  const handlePointerDown = (event) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !engineModelRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      engineModelRef.current.root.children,
      true
    );

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.isEnginePart && obj.parent) {
        if (obj.userData?.parentComponent) {
          obj = obj.userData.parentComponent;
          break;
        }
        obj = obj.parent;
      }

      if (obj && obj.userData?.isEnginePart) {
        handleSelectComponent(obj);
      }
    }
  };

  const handlePointerMove = (event) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !engineModelRef.current) return;

    const rect = container.getBoundingClientRect();
    mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(
      engineModelRef.current.root.children,
      true
    );

    if (intersects.length > 0) {
      let obj = intersects[0].object;
      while (obj && !obj.userData?.isEnginePart && obj.parent) {
        if (obj.userData?.parentComponent) {
          obj = obj.userData.parentComponent;
          break;
        }
        obj = obj.parent;
      }
      if (obj && obj.userData?.isEnginePart) {
        setHoveredPart(obj.userData);
        container.style.cursor = "pointer";
        return;
      }
    }
    setHoveredPart(null);
    container.style.cursor = "grab";
  };

  return (
    <div className={`vrde-3d-digital-twin-chassis ${isFullScreen ? "fullscreen" : ""}`}>
      {/* ── Top Tactical Header Bar ── */}
      <div className="vrde-3d-top-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div className="vrde-badge-logo">VRDE 180HP</div>
          <div className="vrde-title-block">
            <h4>VRDE 180HP AERO ENGINE DIGITAL TWIN</h4>
            <span>4-CYLINDER INLINE AERO ENGINE • 1-3-4-2 FIRING ORDER • AIR-COOLED</span>
          </div>
        </div>

        {/* Firing Order Ticker */}
        <div className="firing-order-ticker">
          <span className="firing-label">FIRING ORDER:</span>
          <div className="firing-sequence">
            {[1, 3, 4, 2].map((num) => (
              <span
                key={num}
                className={`firing-cell ${activeFiringCylinder === num ? "active-flash" : ""}`}
              >
                CYL #{num}
              </span>
            ))}
          </div>
        </div>

        {/* Engine RPM Pill */}
        <div className="engine-rpm-pill">
          <Gauge size={14} color="#00f2ff" />
          <span>{Math.round(simRpm)} RPM</span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <button
            className={`btn-tactical-icon ${isRotating ? "active" : ""}`}
            onClick={() => setIsRotating(!isRotating)}
            title={isRotating ? "Pause Kinematics" : "Resume Kinematics"}
          >
            {isRotating ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            className="btn-tactical-icon"
            onClick={() => setCameraPreset("ISO")}
            title="Reset Camera (Isometric)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            className="btn-tactical-icon"
            onClick={() => setIsFullScreen(!isFullScreen)}
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullScreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* ── Main 3D Canvas Viewport ── */}
      <div
        className="vrde-viewport-canvas"
        ref={mountRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Hover Tooltip (Only on hover, clean and unobtrusive) */}
        {hoveredPart && !selectedPart && (
          <div className="vrde-hover-tooltip">
            <span className="tooltip-name">{hoveredPart.name}</span>
            <span className="tooltip-sub">
              {hoveredPart.subsystem} • CLICK TO INSPECT
            </span>
          </div>
        )}

        {/* Camera Orientation Bar */}
        <div
          className="vrde-camera-preset-bar"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            id="preset-btn-iso"
            className={activePreset === "ISO" ? "active" : ""}
            onClick={() => setCameraPreset("ISO")}
          >
            3/4 ISO
          </button>
          <button
            id="preset-btn-front"
            className={activePreset === "FRONT" ? "active" : ""}
            onClick={() => setCameraPreset("FRONT")}
          >
            FRONT
          </button>
          <button
            id="preset-btn-rear"
            className={activePreset === "REAR" ? "active" : ""}
            onClick={() => setCameraPreset("REAR")}
          >
            REAR
          </button>
          <button
            id="preset-btn-left"
            className={activePreset === "LEFT" ? "active" : ""}
            onClick={() => setCameraPreset("LEFT")}
          >
            LEFT (INTAKE)
          </button>
          <button
            id="preset-btn-right"
            className={activePreset === "RIGHT" ? "active" : ""}
            onClick={() => setCameraPreset("RIGHT")}
          >
            RIGHT (EXHAUST)
          </button>
          <button
            id="preset-btn-top"
            className={activePreset === "TOP" ? "active" : ""}
            onClick={() => setCameraPreset("TOP")}
          >
            TOP
          </button>
          <button
            id="preset-btn-bottom"
            className={activePreset === "BOTTOM" ? "active" : ""}
            onClick={() => setCameraPreset("BOTTOM")}
          >
            SUMP / BOTTOM
          </button>
        </div>



        {/* ── Clean Diagnostic Legend Card in Bottom-Left ── */}
        {diagMode === "XRAY" && (
          <div className="xray-thermal-legend-card" onPointerDown={(e) => e.stopPropagation()}>
            <div className="legend-header">
              <Eye size={12} color="#f8fafc" />
              <span className="legend-title" style={{ color: "#f8fafc" }}>NDT RADIOGRAPHIC METALLIC X-RAY</span>
              <span style={{ marginLeft: "auto", fontSize: "0.58rem", color: "#94a3b8", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                DEEP METALLIC RADIODENSITY
              </span>
            </div>

            {/* Interactive Casing Opacity Slider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "6px 0",
              borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
              marginBottom: "8px"
            }}>
              <span style={{ fontSize: "0.62rem", color: "#cbd5e1", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.05em" }}>
                CASING OPACITY:
              </span>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.05"
                value={xrayOpacityScale}
                onChange={(e) => updateXRayOpacity(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "#38bdf8",
                  cursor: "pointer",
                  height: "4px"
                }}
              />
              <span style={{
                fontSize: "0.65rem",
                color: "#38bdf8",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                minWidth: "36px",
                textAlign: "right"
              }}>
                {Math.round(XRAY_MATERIALS.ghostHousing.opacity * 100)}%
              </span>
            </div>

            <div className="legend-gradient-bar" style={{
              background: "linear-gradient(90deg, #05070a 0%, #334155 25%, #64748b 50%, #cbd5e1 75%, #ffffff 100%)",
              boxShadow: "0 0 10px rgba(255, 255, 255, 0.25)"
            }} />

            <div className="legend-scale-markers">
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#64748b" }}>0%</span>
                <span className="stop-glow" style={{ color: "#64748b" }}>VOID / AIR</span>
                <span className="stop-sub">TRANSPARENT</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#94a3b8" }}>{Math.round(XRAY_MATERIALS.ghostFinDisc.opacity * 100)}%</span>
                <span className="stop-glow" style={{ color: "#94a3b8" }}>FIN DISCS</span>
                <span className="stop-sub">COOLING CAGE</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#cbd5e1" }}>{Math.round(XRAY_MATERIALS.ghostHousing.opacity * 100)}%</span>
                <span className="stop-glow" style={{ color: "#cbd5e1" }}>CASINGS</span>
                <span className="stop-sub">DEEP METALLIC SHELL</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#e2e8f0" }}>{Math.round(XRAY_MATERIALS.ghostFinRim.opacity * 100)}%</span>
                <span className="stop-glow" style={{ color: "#e2e8f0" }}>FIN RIMS</span>
                <span className="stop-sub">CONTOUR RINGS</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#ffffff" }}>100%</span>
                <span className="stop-glow" style={{ color: "#ffffff" }}>PISTONS & CRANK</span>
                <span className="stop-sub">SOLID MOVING CORE</span>
              </div>
            </div>

            <div className="legend-footer-rule">
              <span>DEEP METALLIC CASINGS WITH SOLID 100% VISIBLE POWERTRAIN CORE</span>
            </div>
          </div>
        )}

        {diagMode === "HOLOGRAPHIC" && (
          <div className="xray-thermal-legend-card" onPointerDown={(e) => e.stopPropagation()}>
            <div className="legend-header">
              <Cpu size={12} color="#df9b56" />
              <span className="legend-title" style={{ color: "#e2e8f0" }}>AEROSPACE BLUE & PHOSPHOR BRONZE DIGITAL TWIN</span>
              <span style={{ marginLeft: "auto", fontSize: "0.58rem", color: "#60a5fa", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                COBALT SAPPHIRE & BRONZE
              </span>
            </div>

            {/* Interactive Shell Translucency Slider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              padding: "6px 0",
              borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
              marginBottom: "8px"
            }}>
              <span style={{ fontSize: "0.62rem", color: "#93c5fd", fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.05em" }}>
                SHELL OPACITY:
              </span>
              <input
                type="range"
                min="0.3"
                max="2.2"
                step="0.05"
                value={holoOpacityScale}
                onChange={(e) => updateHoloOpacity(parseFloat(e.target.value))}
                style={{
                  flex: 1,
                  accentColor: "#3b82f6",
                  cursor: "pointer",
                  height: "4px"
                }}
              />
              <span style={{
                fontSize: "0.65rem",
                color: "#60a5fa",
                fontFamily: "var(--font-mono)",
                fontWeight: 800,
                minWidth: "36px",
                textAlign: "right"
              }}>
                {Math.round(HOLOGRAPHIC_MATERIALS.shell.opacity * 100)}%
              </span>
            </div>

            <div className="legend-gradient-bar" style={{
              background: "linear-gradient(90deg, #0c1b33 0%, #12294d 30%, #38bdf8 60%, #b86c28 80%, #d4883b 100%)",
              boxShadow: "0 0 10px rgba(59, 130, 246, 0.45)"
            }} />

            <div className="legend-scale-markers">
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#60a5fa" }}>{Math.round(HOLOGRAPHIC_MATERIALS.finDisc.opacity * 100)}%</span>
                <span className="stop-glow" style={{ color: "#60a5fa" }}>FIN DISCS</span>
                <span className="stop-sub">DARK SAPPHIRE</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#93c5fd" }}>{Math.round(HOLOGRAPHIC_MATERIALS.shell.opacity * 100)}%</span>
                <span className="stop-glow" style={{ color: "#93c5fd" }}>CASING</span>
                <span className="stop-sub">COBALT CHASSIS</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#38bdf8" }}>{Math.round(HOLOGRAPHIC_MATERIALS.contour.opacity * 100)}%</span>
                <span className="stop-glow" style={{ color: "#38bdf8" }}>FIN RIMS</span>
                <span className="stop-sub">ELECTRIC LASER</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp" style={{ color: "#df9b56" }}>100%</span>
                <span className="stop-glow" style={{ color: "#df9b56" }}>POWERTRAIN</span>
                <span className="stop-sub">PHOSPHOR BRONZE</span>
              </div>
            </div>

            <div className="legend-footer-rule">
              <span>SAPPHIRE COBALT AIRFRAME WITH HAND-FINISHED SOLID PHOSPHOR BRONZE POWERTRAIN</span>
            </div>
          </div>
        )}

        {diagMode === "THERMAL" && (
          <div className="xray-thermal-legend-card" onPointerDown={(e) => e.stopPropagation()}>
            <div className="legend-header">
              <Flame size={12} color="#f59e0b" />
              <span className="legend-title">AEROSPACE CONTINUOUS THERMAL SCALE</span>
              <span style={{ marginLeft: "auto", fontSize: "0.58rem", color: "#38bdf8", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                CALIBRATED
              </span>
            </div>

            <div className="legend-gradient-bar" />

            <div className="legend-scale-markers">
              <div className="scale-stop">
                <span className="stop-temp">25°C</span>
                <span className="stop-glow" style={{ color: "#3b82f6" }}>DEEP BLUE</span>
                <span className="stop-sub">AMBIENT / COOL</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp">60°C</span>
                <span className="stop-glow" style={{ color: "#06b6d4" }}>ROYAL BLUE</span>
                <span className="stop-sub">AIRFLOW / NOSE</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp">85°C</span>
                <span className="stop-glow" style={{ color: "#14b8a6" }}>CYAN</span>
                <span className="stop-sub">CRANK / SUMP</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp">120°C</span>
                <span className="stop-glow" style={{ color: "#22c55e" }}>GREEN</span>
                <span className="stop-sub">NOMINAL CHT</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp">155°C</span>
                <span className="stop-glow" style={{ color: "#eab308" }}>YELLOW</span>
                <span className="stop-sub">PISTON CORE</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp">214°C</span>
                <span className="stop-glow" style={{ color: "#f97316" }}>ORANGE/RED</span>
                <span className="stop-sub" style={{ color: "#ff4d6d" }}>CYL #3 OVERHEAT</span>
              </div>
              <div className="scale-stop">
                <span className="stop-temp">740°C+</span>
                <span className="stop-glow" style={{ color: "#fffbeb" }}>WHITE-HOT</span>
                <span className="stop-sub">EXHAUST MANIFOLD</span>
              </div>
            </div>

            <div className="legend-footer-rule">
              <span>METALLIC PBR SURFACE MODULATION & RADIATIVE THERMAL FLUX</span>
            </div>
          </div>
        )}

        {/* View hint */}
        <div className="vrde-view-hint">
          <span>
            {diagMode === "XRAY"
              ? "METALLIC RADIOGRAPHIC X-RAY ACTIVE • DEEP METALLIC CASINGS & SURFACE RELIEF • ALL 4 VERTICAL PISTONS & CRANKSHAFT VISIBLE • CLICK TO INSPECT"
              : diagMode === "HOLOGRAPHIC"
              ? "CLASSY HOLOGRAPHIC DIGITAL TWIN ACTIVE • SOLID PHOSPHOR BRONZE CORE • DEEP TACTICAL NAVY CASINGS • CLICK TO INSPECT"
              : "DRAG TO ROTATE • SCROLL TO ZOOM • CLICK ANY COMPONENT TO PULL OUT • USE SLIDER TO EXPLODE"}
          </span>
        </div>
      </div>

      {/* ── Diagnostic HUD Overlay when Part is Selected ── */}
      {selectedPart && (
        <ComponentDiagnosticHUD
          component={selectedPart}
          telemetryData={telemetryData}
          onResetSelection={() => handleSelectComponent(null)}
          onToggleCutaway={() => {
            const next = diagMode !== "XRAY" ? "XRAY" : "ASSEMBLY";
            setDiagMode(next);
          }}
          isCutawayActive={diagMode === "XRAY"}
        />
      )}

      {/* ── Diagnostic Modes & Exploded View Control Strip ── */}
      <div className="vrde-bottom-control-deck">
        <div className="deck-group">
          <span className="deck-label">DIAGNOSTIC VISUALIZATION MODES:</span>
          <div className="deck-button-row">
            {[
              { id: "ASSEMBLY", label: "SOLID ASSEMBLY", icon: Layers },
              { id: "HOLOGRAPHIC", label: "HOLOGRAPHIC SCAN", icon: Cpu },
              { id: "XRAY", label: "PURE X-RAY (NDT)", icon: Eye },
              { id: "THERMAL", label: "THERMAL GRADIENT", icon: Flame },
              { id: "VIBRATION", label: "VIBRATION", icon: Activity },
              { id: "LUBRICATION", label: "LUBRICATION", icon: Gauge },
              { id: "IGNITION", label: "IGNITION", icon: Zap },
              { id: "EXHAUST", label: "EXHAUST", icon: Radio },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <button
                  key={m.id}
                  className={`btn-deck-mode ${diagMode === m.id ? "active" : ""}`}
                  onClick={() => setDiagMode(m.id)}
                >
                  <Icon size={12} /> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Exploded View Slider Controls */}
        <div className="deck-group" style={{ minWidth: "220px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span className="deck-label">EXPLODED VIEW DISASSEMBLY:</span>
            <span className="deck-label" style={{ color: "#00f2ff" }}>
              {Math.round(explodeFactor * 100)}%
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              className={`btn-pill-small ${explodeFactor === 0 ? "active" : ""}`}
              onClick={() => handleExplodeChange(0)}
            >
              0%
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodeFactor}
              onChange={(e) => handleExplodeChange(parseFloat(e.target.value))}
              className="vrde-explode-slider"
            />
            <button
              className={`btn-pill-small ${explodeFactor === 1 ? "active" : ""}`}
              onClick={() => handleExplodeChange(1)}
            >
              100%
            </button>
          </div>
        </div>
      </div>

      {/* ── 1-Click Anomaly Simulator Triggers Strip ── */}
      <div className="vrde-anomaly-sim-strip">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={14} color="#f59e0b" />
          <span className="sim-title">PHYSICAL ANOMALY SIMULATION INJECTOR:</span>
        </div>

        <div className="sim-buttons-grid">
          <button
            className={`btn-sim ${activeAnomaly === "NOMINAL" ? "active-normal" : ""}`}
            onClick={() => triggerAnomalyScenario("NOMINAL")}
          >
            <CheckCircle2 size={12} /> NOMINAL STATE
          </button>
          <button
            className={`btn-sim ${activeAnomaly === "OVERHEAT_CYL3" ? "active-critical" : ""}`}
            onClick={() => triggerAnomalyScenario("OVERHEAT_CYL3")}
          >
            <Flame size={12} /> CYLINDER #3 OVERHEATING
          </button>
          <button
            className={`btn-sim ${activeAnomaly === "HIGH_VIB" ? "active-critical" : ""}`}
            onClick={() => triggerAnomalyScenario("HIGH_VIB")}
          >
            <Activity size={12} /> CRANKSHAFT BEARING HARMONICS
          </button>
          <button
            className={`btn-sim ${activeAnomaly === "LOW_OIL" ? "active-warning" : ""}`}
            onClick={() => triggerAnomalyScenario("LOW_OIL")}
          >
            <Gauge size={12} /> LOW OIL PRESSURE
          </button>
          <button
            className={`btn-sim ${activeAnomaly === "IGNITION_MISFIRE" ? "active-warning" : ""}`}
            onClick={() => triggerAnomalyScenario("IGNITION_MISFIRE")}
          >
            <Zap size={12} /> IGNITION MISFIRE (CYL #2)
          </button>
          <button
            className={`btn-sim ${activeAnomaly === "HIGH_EGT" ? "active-warning" : ""}`}
            onClick={() => triggerAnomalyScenario("HIGH_EGT")}
          >
            <Radio size={12} /> HIGH EXHAUST EGT
          </button>
        </div>
      </div>
    </div>
  );
}
