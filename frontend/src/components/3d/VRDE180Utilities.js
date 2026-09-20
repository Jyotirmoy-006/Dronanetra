import * as THREE from "three";
import { tagThermalGeometry } from "./AerospaceThermalShader";

/**
 * VRDE 180HP ENGINE — SHARED CONSTANTS & UTILITIES
 *
 * All dimension constants use metres (Three.js default units).
 * Engine oriented with crankshaft along X-axis, cylinders vertical along Y.
 */

// ── ENGINE DIMENSIONAL CONSTANTS (780mm L × 488mm H, 90mm BORE, 78mm STROKE) ──
export const ENGINE = {
  // Cylinder layout — 4-cylinder inline, substantial aerospace pitch (100mm center-to-center)
  cylinderConfigs: [
    { num: 1, x:  0.150, crankAngleOffset: 0 },
    { num: 2, x:  0.050, crankAngleOffset: Math.PI },
    { num: 3, x: -0.050, crankAngleOffset: Math.PI },
    { num: 4, x: -0.150, crankAngleOffset: 0 },
  ],

  // Crank geometry (78mm stroke, 125mm connecting rod, 90mm bore)
  crankRadius:   0.039,   // 78mm stroke / 2 = 39mm throw
  rodLength:     0.125,   // 125mm connecting rod center-to-center
  crankCenterY: -0.075,   // crankshaft longitudinal centerline Y position
  pistonRadius:  0.034,   // 68mm bore / 2 = 34mm radius (authentic clearance within 100mm pitch)

  // Overall engine envelope targets
  envelopeLength: 0.780,
  envelopeHeight: 0.488,
  propellerRadius: 0.340, // 680mm propeller sweep diameter

  // Key Y positions (Dense, deep aerospace proportions)
  crankcaseBottomY: -0.190,  // bottom of deep ribbed wet sump
  crankcaseTopY:     0.015,  // top deck of crankcase
  cylinderBaseY:     0.015,  // where barrels seat into crankcase
  cylinderTopY:      0.150,  // top of cylinder barrels (135mm height)
  headBaseY:         0.150,  // head sits on barrel tops
  headTopY:          0.180,  // combustion chamber deck
  rockerCoverTopY:   0.230,  // top surface of unified billet rocker cover
  fuelRailY:         0.252,  // horizontal centerline of overhead fuel rail

  // Key X positions
  frontGearboxX:     0.235,  // front face of crankcase / reduction gearbox interface
  rearAccessoryX:   -0.245,  // rear face of crankcase / accessory section interface

  // Substantial cylinder barrel dimensions with visible inter-cylinder air gaps
  barrelOuterR:      0.040,  // outer barrel cylinder wall radius (80mm OD)
  barrelInnerR:      0.034,  // 68mm bore liner radius
  barrelHeight:      0.135,  // substantial 135mm barrel height
  finCount:          26,     // 26 deep concentric cooling fins per barrel
  finDepth:          0.008,  // 8mm radial depth (0.048m outer fin radius; 4mm air gap between adjacent cylinders)
  finThickness:      0.0016, // fin plate thickness
  finSpacing:        0.0048, // center-to-center fin spacing
};

// ── FASTENER GENERATORS ─────────────────────────────────────────────────────

/**
 * Creates a hex bolt with washer.
 * @param {number} radius - bolt head radius (m)
 * @param {number} height - total bolt height (m)
 * @param {object} materials - materials palette
 * @param {number} [thermalZone=5] - thermal zone ID for shader
 * @returns {THREE.Group}
 */
export function createHexBolt(radius = 0.004, height = 0.010, materials, thermalZone = 5) {
  const boltGroup = new THREE.Group();

  const headGeo = new THREE.CylinderGeometry(radius * 1.25, radius * 1.25, height * 0.45, 6);
  tagThermalGeometry(headGeo, thermalZone, 0, 0, 0);
  const head = new THREE.Mesh(headGeo, materials.polishedChrome); // Zinc/cadmium plated bolt head
  head.castShadow = true;
  boltGroup.add(head);

  const washerGeo = new THREE.CylinderGeometry(radius * 1.65, radius * 1.65, height * 0.15, 16);
  tagThermalGeometry(washerGeo, thermalZone, 0, 0, 0);
  const washer = new THREE.Mesh(washerGeo, materials.darkAnodized); // Dark oil-stained washer seat
  washer.position.y = -height * 0.25;
  boltGroup.add(washer);

  return boltGroup;
}

/**
 * Creates a socket-head cap screw (Allen bolt).
 * @param {number} radius - bolt head radius (m)
 * @param {number} height - total bolt height (m)
 * @param {object} materials - materials palette
 * @returns {THREE.Group}
 */
export function createSocketBolt(radius = 0.003, height = 0.008, materials) {
  const boltGroup = new THREE.Group();

  const headGeo = new THREE.CylinderGeometry(radius, radius, height * 0.4, 16);
  tagThermalGeometry(headGeo, 5, 0, 0, 0);
  const head = new THREE.Mesh(headGeo, materials.forgedSteel);
  head.castShadow = true;
  boltGroup.add(head);

  // Socket recess
  const socketGeo = new THREE.CylinderGeometry(radius * 0.55, radius * 0.55, height * 0.15, 6);
  tagThermalGeometry(socketGeo, 5, 0, 0, 0);
  const socket = new THREE.Mesh(socketGeo, materials.darkAnodized);
  socket.position.y = height * 0.15;
  boltGroup.add(socket);

  return boltGroup;
}

/**
 * Creates a hex nut.
 * @param {number} radius - nut outer radius (m)
 * @param {number} height - nut height (m)
 * @param {object} materials - materials palette
 * @returns {THREE.Mesh}
 */
export function createHexNut(radius = 0.005, height = 0.005, materials) {
  const nutGeo = new THREE.CylinderGeometry(radius, radius, height, 6);
  tagThermalGeometry(nutGeo, 5, 0, 0, 0);
  const nut = new THREE.Mesh(nutGeo, materials.polishedChrome);
  nut.castShadow = true;
  return nut;
}

/**
 * Creates a P-clamp (half-torus bracket for securing pipes/wires).
 * @param {number} radius - clamp inner radius
 * @param {number} tubeRadius - clamp tube/wire radius
 * @param {object} materials - materials palette
 * @returns {THREE.Mesh}
 */
export function createPClamp(radius = 0.006, tubeRadius = 0.0015, materials) {
  const clampGeo = new THREE.TorusGeometry(radius, tubeRadius, 6, 12, Math.PI);
  tagThermalGeometry(clampGeo, 6, 0, 0, 0);
  const clamp = new THREE.Mesh(clampGeo, materials.polishedChrome);
  return clamp;
}

// ── COMPONENT REGISTRATION ──────────────────────────────────────────────────

/**
 * Registers a component group with metadata for the diagnostic system.
 * @param {Map} components - the components registry Map
 * @param {THREE.Group|THREE.Mesh} meshOrGroup - the 3D object
 * @param {object} metadata - component metadata
 */
export function registerComponent(components, meshOrGroup, metadata) {
  meshOrGroup.userData = {
    ...meshOrGroup.userData,
    isEnginePart: true,
    partId: metadata.partId,
    name: metadata.name,
    subsystem: metadata.subsystem,
    disassemblyVector: metadata.disassemblyVector.clone(),
    basePosition: meshOrGroup.position.clone(),
    baseRotation: meshOrGroup.rotation.clone(),
    sensors: metadata.sensors || [],
    nominalRange: metadata.nominalRange || {},
    status: "NOMINAL",
    health: 98,
    temperature: metadata.defaultTemp || 85,
    vibration: metadata.defaultVib || 1.2,
    description: metadata.description || "",
    recommendedAction: metadata.recommendedAction || "Nominal operation.",
    subParts: metadata.subParts || [],
  };

  meshOrGroup.traverse((child) => {
    if (child.isMesh) {
      child.userData.parentComponent = meshOrGroup;
      child.userData.origMaterial = child.material;
    }
  });

  components.set(metadata.partId, meshOrGroup);
}

// ── GEOMETRY HELPERS ────────────────────────────────────────────────────────

/**
 * Creates a smooth tube from an array of Vector3 control points.
 * @param {THREE.Vector3[]} points - Catmull-Rom spline control points
 * @param {number} radius - tube radius
 * @param {number} [tubularSegments=16] - number of segments along tube
 * @param {number} [radialSegments=8] - number of segments around tube
 * @param {boolean} [closed=false] - whether the tube loops
 * @returns {THREE.TubeGeometry}
 */
export function createTubeFromPoints(points, radius, tubularSegments = 16, radialSegments = 8, closed = false) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed);
}

/**
 * Creates a bolt circle — evenly-spaced bolts around a circle.
 * @param {number} circleRadius - radius of the bolt circle
 * @param {number} count - number of bolts
 * @param {number} boltRadius - individual bolt radius
 * @param {number} boltHeight - individual bolt height
 * @param {object} materials - materials palette
 * @param {THREE.Group} parent - group to add bolts to
 * @param {object} [options] - { offsetX, offsetY, offsetZ, rotateX, rotateZ }
 */
export function addBoltCircle(circleRadius, count, boltRadius, boltHeight, materials, parent, options = {}) {
  const { offsetX = 0, offsetY = 0, offsetZ = 0, rotateX = 0, rotateZ = 0 } = options;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 / count) * i;
    const bolt = createHexBolt(boltRadius, boltHeight, materials);
    bolt.position.set(
      offsetX + Math.sin(angle) * circleRadius,
      offsetY,
      offsetZ + Math.cos(angle) * circleRadius
    );
    if (rotateX) bolt.rotation.x = rotateX;
    if (rotateZ) bolt.rotation.z = rotateZ;
    parent.add(bolt);
  }
}
