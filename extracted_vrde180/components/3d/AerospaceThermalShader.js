import * as THREE from "three";

/**
 * DRDO VRDE 180HP AVIATION PISTON ENGINE — AEROSPACE THERMAL DIGITAL TWIN SHADER
 *
 * Professional aerospace engineering thermal visualization layer that overlays
 * continuous thermodynamic temperature gradients onto base metallic PBR materials.
 *
 * Principles:
 * 1. Preserves base metallic reflections, roughness, specular glints, cast textures, and shadows.
 * 2. Continuous aerospace thermal palette: Deep Blue -> Cyan -> Green -> Yellow -> Orange -> Red -> White-Hot.
 * 3. Spatial heat distribution: Head combustion core -> Cylinder barrel -> Cooling fin roots -> Fin tips.
 * 4. Tuned exhaust gradient: 740°C white-hot at port -> orange -> red -> cooler collector.
 * 5. Conductive crankcase heat transfer: Warm near cylinder spigots and bearings, cooler at nose/flanges.
 * 6. Anomaly escalation: When Cyl 3 Overheating activates, only Cyl 3 develops a volcanic hotspot.
 * 7. Subtle 4% scientific radiometric thermal shimmer around critical hotspots (no cartoon fire/flames).
 */

export const thermalUniforms = {
  uThermalWeight: { value: 0.0 }, // 0.0 = Pure Assembly, 1.0 = Thermal Heatmap Overlay
  uXRayWeight: { value: 0.0 },    // 0.0 = Normal, 1.0 = X-Ray Cutaway
  uTime: { value: 0.0 },
  uAnomalyCyl3: { value: 0.0 },   // 0.0 = Nominal, 1.0 = Cylinder 3 Overheating
  uHighEgt: { value: 0.0 },       // 0.0 = Nominal, 1.0 = High EGT
  uHighVib: { value: 0.0 },       // 0.0 = Nominal, 1.0 = High Crankshaft Vibration
  uLowOil: { value: 0.0 },        // 0.0 = Nominal, 1.0 = Low Oil / Sump Overheat
};

// GLSL chunk to inject into vertex shader
const thermalVertexPars = `
varying vec3 vEngineWorldPos;
varying vec3 vEngineLocalPos;
varying vec3 vEngineWorldNorm;
attribute vec4 aThermalProps;
varying vec4 vThermalProps;
`;

const thermalVertexMain = `
vEngineLocalPos = position;
vec4 engineWorldPos4 = modelMatrix * vec4(position, 1.0);
vEngineWorldPos = engineWorldPos4.xyz;
vEngineWorldNorm = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
vThermalProps = aThermalProps;
`;

// GLSL chunk to inject into fragment shader
const thermalFragmentPars = `
uniform float uThermalWeight;
uniform float uXRayWeight;
uniform float uTime;
uniform float uAnomalyCyl3;
uniform float uHighEgt;
uniform float uHighVib;
uniform float uLowOil;

varying vec3 vEngineWorldPos;
varying vec3 vEngineLocalPos;
varying vec3 vEngineWorldNorm;
varying vec4 vThermalProps;

// Continuous Aerospace Thermal Palette (Deep Blue -> Cyan -> Green -> Yellow -> Orange -> Red -> White-Hot)
vec3 getAerospaceThermalColor(float t) {
  t = clamp(t, 0.0, 1.0);

  vec3 c0 = vec3(0.04, 0.09, 0.32); // Deep Navy Blue   (20°C - Ambient)
  vec3 c1 = vec3(0.01, 0.35, 0.78); // Royal Blue       (55°C)
  vec3 c2 = vec3(0.00, 0.75, 0.85); // Pure Cyan        (85°C - Sump/Crank)
  vec3 c3 = vec3(0.06, 0.80, 0.22); // Emerald Green    (120°C - Nominal CHT)
  vec3 c4 = vec3(0.96, 0.86, 0.08); // Warm Gold Yellow (155°C - Piston Friction)
  vec3 c5 = vec3(0.98, 0.40, 0.04); // Radiant Orange   (200°C - High CHT)
  vec3 c6 = vec3(0.92, 0.06, 0.12); // Crimson Red      (320°C - Critical Overheat)
  vec3 c7 = vec3(1.00, 0.98, 0.92); // Incandescent White-Hot (740°C+ - Exhaust Core)

  if (t < 0.15) return mix(c0, c1, t / 0.15);
  if (t < 0.30) return mix(c1, c2, (t - 0.15) / 0.15);
  if (t < 0.45) return mix(c2, c3, (t - 0.30) / 0.15);
  if (t < 0.60) return mix(c3, c4, (t - 0.45) / 0.15);
  if (t < 0.75) return mix(c4, c5, (t - 0.60) / 0.15);
  if (t < 0.88) return mix(c5, c6, (t - 0.75) / 0.13);
  return mix(c6, c7, (t - 0.88) / 0.12);
}

float getThermalNormalized(float tempC) {
  if (tempC <= 120.0) {
    return 0.45 * clamp((tempC - 20.0) / 100.0, 0.0, 1.0);
  } else if (tempC <= 240.0) {
    return 0.45 + 0.35 * clamp((tempC - 120.0) / 120.0, 0.0, 1.0);
  } else {
    return 0.80 + 0.20 * clamp((tempC - 240.0) / 560.0, 0.0, 1.0);
  }
}
`;

const thermalFragmentMain = `
if (uThermalWeight > 0.001) {
  // Extract thermal metadata from attribute:
  // x: partCategory (1=Cylinder/Fin, 2=Head, 3=Cover, 4=Exhaust, 5=Crankcase, 6=Sump, 7=Intake, 8=Piston, 9=Rod, 10=Crank, 11=Prop)
  // y: cylIndex (1, 2, 3, 4 or 0)
  // z: paramA (axial coordinate along component, or distance along exhaust pipe 0.0->1.0)
  // w: paramB (radial coordinate, e.g. 0.0 at fin root, 1.0 at fin tip)
  float partCat = vThermalProps.x;
  float cylIdx = vThermalProps.y;
  float pA = vThermalProps.z;
  float pB = vThermalProps.w;

  float tempC = 45.0; // Default baseline temperature

  // ── 1. CYLINDER BARREL & COOLING FINS ──
  if (abs(partCat - 1.0) < 0.5) {
    // Nominal base temperature along barrel (head is warmer, base is cooler)
    float baseBarrel = mix(98.0, 126.0, clamp(pA, 0.0, 1.0));
    
    // Radial fin cooling dissipation (root is warmer, outer tip cools down)
    float finCooling = clamp(pB, 0.0, 1.0) * 32.0;
    tempC = baseBarrel - finCooling;

    // Localized Cylinder 3 Overheating Anomaly
    if (abs(cylIdx - 3.0) < 0.5 && uAnomalyCyl3 > 0.0) {
      float overheatEscalation = mix(45.0, 88.0, clamp(pA, 0.0, 1.0)) * uAnomalyCyl3;
      tempC += overheatEscalation;
    }
  }
  // ── 2. CYLINDER HEAD (COMBUSTION DOME & PORTS) ──
  else if (abs(partCat - 2.0) < 0.5) {
    // Hottest near combustion core (pA near 0.0)
    tempC = mix(132.0, 118.0, clamp(pA, 0.0, 1.0));

    // Cylinder 3 Overheating Hotspot
    if (abs(cylIdx - 3.0) < 0.5 && uAnomalyCyl3 > 0.0) {
      float hotCore = mix(105.0, 60.0, clamp(pA, 0.0, 1.0)) * uAnomalyCyl3;
      tempC += hotCore; // Reaches 237°C at core!
    }
  }
  // ── 3. ROCKER VALVE COVER ──
  else if (abs(partCat - 3.0) < 0.5) {
    tempC = 96.0;
    if (abs(cylIdx - 3.0) < 0.5 && uAnomalyCyl3 > 0.0) {
      tempC += 55.0 * uAnomalyCyl3;
    }
  }
  // ── 4. EXHAUST SYSTEM (HEADERS & COLLECTOR) ──
  else if (abs(partCat - 4.0) < 0.5) {
    // pA is 0.0 at cylinder head exhaust port, 1.0 at collector
    float portTemp = 742.0 + 105.0 * uHighEgt;
    float collectorTemp = 480.0 + 80.0 * uHighEgt;
    tempC = mix(portTemp, collectorTemp, pow(clamp(pA, 0.0, 1.0), 0.8));

    // If Cyl 3 is overheating, Cyl 3 exhaust runner is even hotter near port
    if (abs(cylIdx - 3.0) < 0.5 && uAnomalyCyl3 > 0.0) {
      tempC += 95.0 * (1.0 - clamp(pA, 0.0, 1.0)) * uAnomalyCyl3;
    }
  }
  // ── 5. CRANKCASE (WITH THERMAL CONDUCTION FROM INLINE CYLINDERS) ──
  else if (abs(partCat - 5.0) < 0.5) {
    // Spatial distance to the 4 inline cylinder spigots along X
    vec3 p = vEngineWorldPos;
    float d1 = length(p - vec3(0.135, 0.0, 0.0));
    float d2 = length(p - vec3(0.045, 0.0, 0.0));
    float d3 = length(p - vec3(-0.045, 0.0, 0.0));
    float d4 = length(p - vec3(-0.135, 0.0, 0.0));
    float minD = min(min(d1, d2), min(d3, d4));

    // Conduction from spigots into crankcase
    float spigotHeat = smoothstep(0.16, 0.02, minD);
    tempC = mix(62.0, 94.0, spigotHeat);

    // Extra conduction from Cyl 3 spigot if overheating
    if (uAnomalyCyl3 > 0.0) {
      float cyl3Conduction = smoothstep(0.16, 0.02, d3) * uAnomalyCyl3;
      tempC += 48.0 * cyl3Conduction;
    }

    // Cooler at front reduction gearbox (+X) and rear flange (-X)
    if (p.x > 0.22 || p.x < -0.22) {
      tempC = mix(tempC, 44.0, 0.45);
    }
  }
  // ── 6. LUBRICATION SYSTEM (FINNED SUMP & PUMP) ──
  else if (abs(partCat - 6.0) < 0.5) {
    float oilBase = 92.5 + 36.0 * uLowOil;
    // Outer sump cooling fins dissipate heat
    float finEffect = clamp(pB, 0.0, 1.0) * 22.0;
    tempC = oilBase - finEffect;
  }
  // ── 7. INDUCTION & FUEL (CARBURETOR & RUNNERS) ──
  else if (abs(partCat - 7.0) < 0.5) {
    // Cool atmospheric air-fuel charge
    tempC = mix(38.0, 65.0, clamp(pA, 0.0, 1.0));
  }
  // ── 8. RECIPROCATING PISTONS (IN X-RAY MODE) ──
  else if (abs(partCat - 8.0) < 0.5) {
    tempC = 145.0;
    if (abs(cylIdx - 3.0) < 0.5 && uAnomalyCyl3 > 0.0) {
      tempC = 245.0;
    }
  }
  // ── 9. CONNECTING RODS (IN X-RAY MODE) ──
  else if (abs(partCat - 9.0) < 0.5) {
    tempC = 92.0;
    if (abs(cylIdx - 3.0) < 0.5 && uAnomalyCyl3 > 0.0) {
      tempC = 172.0;
    }
  }
  // ── 10. CRANKSHAFT (IN X-RAY MODE) ──
  else if (abs(partCat - 10.0) < 0.5) {
    tempC = 86.4 + 26.0 * uHighVib;
  }
  // ── 11. PROPELLER & SPINNER ──
  else if (abs(partCat - 11.0) < 0.5) {
    tempC = 30.0; // Cool ambient prop-wash
  }
  // ── 12. IGNITION & ACCESSORY GEARBOX ──
  else {
    tempC = 55.0;
  }

  // ── MAP TEMPERATURE TO CONTINUOUS THERMAL SPECTRUM (20°C -> 840°C) ──
  float tNorm = getThermalNormalized(tempC);
  vec3 thermalColor = getAerospaceThermalColor(tNorm);

  // ── PRESERVE PHYSICAL METALLIC MATERIAL & SHADING ──
  vec3 baseLit = gl_FragColor.rgb;
  float baseLum = dot(baseLit, vec3(0.299, 0.587, 0.114));

  // 1. Modulate base metallic reflections with thermal hue (preserves edges, machining, bolts, shadows)
  vec3 modulatedMetallic = baseLit * (0.28 + 0.72 * thermalColor);

  // 2. Blend with thermal color weighted by surface luminance
  vec3 thermalSurface = mix(modulatedMetallic, thermalColor * (0.60 + 0.40 * baseLum), 0.46);

  // 3. Physically calibrated radiative thermal luminescence (zero on cold parts, strong on hotspots)
  float emissiveFactor = smoothstep(0.14, 1.0, tNorm);
  float hotspotShimmer = 1.0;
  if (tNorm > 0.58) {
    // Subtle 4% scientific thermal radiometric shimmer around critical hotspots
    hotspotShimmer = 1.0 + 0.04 * sin(uTime * 3.8 + vEngineWorldPos.x * 24.0 + vEngineWorldPos.y * 18.0);
  }
  float xrayBoost = uXRayWeight > 0.5 ? 1.65 : 1.0;
  vec3 thermalGlow = thermalColor * (pow(emissiveFactor, 1.9) * 1.55 * hotspotShimmer * xrayBoost);

  vec3 finalThermal = thermalSurface + thermalGlow;

  // Propeller blades and spinner preserve authentic carbon weave and chrome in thermal mode
  if (abs(partCat - 11.0) < 0.5) {
    finalThermal = mix(baseLit, thermalSurface * 0.9 + vec3(0.01, 0.03, 0.08), 0.35);
  }

  // Seamlessly blend between normal metallic assembly and thermal heatmap overlay
  gl_FragColor.rgb = mix(baseLit, finalThermal, uThermalWeight);
}
`;

/**
 * Attaches the Aerospace Thermal PBR shader hook to a Three.js MeshStandardMaterial.
 */
export function applyAerospaceThermalShader(material) {
  if (!material || !material.isMeshStandardMaterial) return;

  material.onBeforeCompile = (shader) => {
    // Bind shared uniform references
    shader.uniforms.uThermalWeight = thermalUniforms.uThermalWeight;
    shader.uniforms.uXRayWeight = thermalUniforms.uXRayWeight;
    shader.uniforms.uTime = thermalUniforms.uTime;
    shader.uniforms.uAnomalyCyl3 = thermalUniforms.uAnomalyCyl3;
    shader.uniforms.uHighEgt = thermalUniforms.uHighEgt;
    shader.uniforms.uHighVib = thermalUniforms.uHighVib;
    shader.uniforms.uLowOil = thermalUniforms.uLowOil;

    // Inject vertex shader chunks
    shader.vertexShader = thermalVertexPars + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      "#include <worldpos_vertex>",
      `#include <worldpos_vertex>\n${thermalVertexMain}`
    );

    // Inject fragment shader chunks
    shader.fragmentShader = thermalFragmentPars + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `${thermalFragmentMain}\n#include <dithering_fragment>`
    );
  };

  material.customProgramCacheKey = () => "VRDE180_AEROSPACE_THERMAL_PBR_V1";
}

/**
 * Helper to tag a geometry with thermal metadata attributes.
 * @param {THREE.BufferGeometry} geo 
 * @param {number} partCategory 
 * @param {number} cylIndex 
 * @param {number|function} paramA 
 * @param {number|function} paramB 
 */
export function tagThermalGeometry(geo, partCategory = 0, cylIndex = 0, paramA = 0, paramB = 0) {
  if (!geo || !geo.attributes || !geo.attributes.position) return;
  const count = geo.attributes.position.count;
  const thermalProps = new Float32Array(count * 4);

  const isFuncA = typeof paramA === "function";
  const isFuncB = typeof paramB === "function";
  const pos = geo.attributes.position;

  for (let i = 0; i < count; i++) {
    const idx = i * 4;
    thermalProps[idx] = partCategory;
    thermalProps[idx + 1] = cylIndex;
    thermalProps[idx + 2] = isFuncA ? paramA(pos.getX(i), pos.getY(i), pos.getZ(i), i, count) : paramA;
    thermalProps[idx + 3] = isFuncB ? paramB(pos.getX(i), pos.getY(i), pos.getZ(i), i, count) : paramB;
  }

  geo.setAttribute("aThermalProps", new THREE.BufferAttribute(thermalProps, 4));
}
