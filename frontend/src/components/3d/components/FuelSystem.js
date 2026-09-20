import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PARTS 16–17 — FUEL SYSTEM: FUEL RAIL & FUEL INJECTORS (4x)
 *
 * STRICTLY MATCHES ASSEMBLED REFERENCE IMAGES (Front-Right, Right Side & Top Views):
 * - Prominent aviation brass fuel rail running horizontally along the VERY TOP of the engine
 *   above the rocker cover (X = 0, Y = 0.352, Z = -0.015).
 * - 4 vertical electronic fuel injectors with signature red anodized bodies,
 *   black electrical connector heads, and brass nozzle cups.
 * - Solid fuel feed line with blue/red AN-6 fittings connecting to the mechanical
 *   fuel pump on the crankcase.
 * - ZERO loose hoses or floating geometry.
 */
export function buildFuelSystem(materials) {
  const group = new THREE.Group();
  group.name = "FUEL_SYSTEM";

  const { cylinderConfigs, crankCenterY } = ENGINE;
  const railY = ENGINE.fuelRailY;  // Prominent top-mounted brass rail sits directly atop rocker cover
  const railZ = -0.015;            // Slightly toward intake side (-Z)
  const railLength = 0.360;
  const railRadius = 0.0065;

  // ═══════════════════════════════════════════════════════════
  // 1. TOP FUEL PRESSURE REGULATOR / METERING UNIT
  // Sits directly integrated onto the central fuel rail (zero floating gap)
  // ═══════════════════════════════════════════════════════════
  const carbGroup = new THREE.Group();
  carbGroup.name = "AERO_FUEL_REGULATOR";
  const carbY = railY + 0.008;
  const carbZ = railZ;

  // A. Main Regulator Body (Aviation Brass)
  const carbBodyGeo = new THREE.CylinderGeometry(0.018, 0.016, 0.022, 20);
  tagThermalGeometry(carbBodyGeo, 6, 0, 0, 0);
  const carbBody = new THREE.Mesh(carbBodyGeo, materials.aviationBrass);
  carbBody.position.set(0, carbY, carbZ);
  carbBody.castShadow = true;
  carbGroup.add(carbBody);

  // B. Upper Adjustment Tower / Pressure Cap (Machined aluminum)
  const hornGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.008, 16);
  tagThermalGeometry(hornGeo, 6, 0, 0, 0);
  const horn = new THREE.Mesh(hornGeo, materials.machinedAluminum);
  horn.position.set(0, carbY + 0.014, carbZ);
  carbGroup.add(horn);

  // Hex adjustment nut on top
  const adjNut = createHexBolt(0.0035, 0.006, materials, 6);
  adjNut.position.set(0, carbY + 0.018, carbZ);
  carbGroup.add(adjNut);

  // C. Dual Pressure Dampener Chambers (Brass)
  [-0.018, 0.018].forEach((dx) => {
    const bowlGeo = new THREE.CylinderGeometry(0.010, 0.009, 0.014, 16);
    tagThermalGeometry(bowlGeo, 6, 0, 0, 0);
    const bowl = new THREE.Mesh(bowlGeo, materials.aviationBrass);
    bowl.position.set(dx, carbY - 0.004, carbZ);
    carbGroup.add(bowl);
  });

  group.add(carbGroup);

  // ═══════════════════════════════════════════════════════════
  // 2. FUEL DISTRIBUTION RAIL & INJECTORS
  // Supported securely by rocker cover standoffs, injectors seat flush
  // ═══════════════════════════════════════════════════════════
  const railGeo = new THREE.CylinderGeometry(railRadius, railRadius, railLength, 20);
  tagThermalGeometry(railGeo, 6, 0, 0, 0);
  railGeo.rotateZ(Math.PI / 2);
  const rail = new THREE.Mesh(railGeo, materials.aviationBrass);
  rail.position.set(0, railY, railZ);
  rail.castShadow = true;
  group.add(rail);

  // Rail end fittings: Red anodized aviation hex plug on front (+X), aged brass cap on rear (-X) matching reference photo
  const frontCapX = railLength * 0.5;
  const frontFittingGeo = new THREE.CylinderGeometry(railRadius * 1.35, railRadius * 1.35, 0.008, 6);
  tagThermalGeometry(frontFittingGeo, 6, 0, 0, 0);
  frontFittingGeo.rotateZ(Math.PI / 2);
  const frontFitting = new THREE.Mesh(frontFittingGeo, materials.anodizedRed);
  frontFitting.position.set(frontCapX + 0.004, railY, railZ);
  group.add(frontFitting);

  const rearCapX = -railLength * 0.5;
  const rearCapGeo = new THREE.SphereGeometry(railRadius, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
  tagThermalGeometry(rearCapGeo, 6, 0, 0, 0);
  rearCapGeo.rotateZ(Math.PI / 2);
  const rearCap = new THREE.Mesh(rearCapGeo, materials.aviationBrass);
  rearCap.position.set(rearCapX, railY, railZ);
  group.add(rearCap);

  cylinderConfigs.forEach((cfg) => {
    const injGroup = new THREE.Group();
    injGroup.position.set(cfg.x, railY, railZ);

    // Rail delivery cup / top O-ring boss
    const cupGeo = new THREE.CylinderGeometry(0.008, 0.007, 0.006, 16);
    tagThermalGeometry(cupGeo, 6, cfg.num, 0, 0);
    const cup = new THREE.Mesh(cupGeo, materials.aviationBrass);
    cup.position.y = -0.004;
    injGroup.add(cup);

    // Signature Red Anodized Injector Body
    const bodyGeo = new THREE.CylinderGeometry(0.006, 0.0055, 0.012, 16);
    tagThermalGeometry(bodyGeo, 6, cfg.num, 0, 0);
    const body = new THREE.Mesh(bodyGeo, materials.redSilicone);
    body.position.y = -0.012;
    body.castShadow = true;
    injGroup.add(body);

    // Lower brass nozzle seat (seats directly into the rocker cover / head top deck)
    const seatGeo = new THREE.CylinderGeometry(0.0048, 0.004, 0.006, 12);
    tagThermalGeometry(seatGeo, 6, cfg.num, 0, 0);
    const seat = new THREE.Mesh(seatGeo, materials.aviationBrass);
    seat.position.y = -0.020;
    injGroup.add(seat);

    group.add(injGroup);
  });

  // ═══════════════════════════════════════════════════════════
  // 3. MECHANICAL FUEL PUMP & RIGID CLAMPED AEROQUIP STAINLESS FEED LINE
  // Form-fitted tight against the engine casing with Adel P-clamps — ZERO loose hoses
  // ═══════════════════════════════════════════════════════════
  const pumpX = -0.175;
  const pumpY = crankCenterY + 0.035;
  const pumpZ = -0.078;

  // Fuel pump body (mounted securely on lower crankcase pad)
  const pumpGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.028, 16);
  tagThermalGeometry(pumpGeo, 6, 0, 0, 0);
  pumpGeo.rotateX(Math.PI / 2);
  const pump = new THREE.Mesh(pumpGeo, materials.darkAnodized);
  pump.position.set(pumpX, pumpY, pumpZ);
  pump.castShadow = true;
  group.add(pump);

  // Pump outlet fitting (Blue/Red anodized AN-6 90° fitting)
  const anPumpNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0055, 0.008, 6),
    materials.anodizedBlue
  );
  anPumpNut.position.set(pumpX, pumpY + 0.014, pumpZ);
  group.add(anPumpNut);

  const anPumpCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0062, 0.0062, 0.003, 6),
    materials.anodizedRed
  );
  anPumpCollar.position.set(pumpX, pumpY + 0.019, pumpZ);
  group.add(anPumpCollar);

  // Form-fitted braided stainless fuel feed line routed snugly along engine block
  const feedCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(pumpX, pumpY + 0.020, pumpZ),
    new THREE.Vector3(-0.180, pumpY + 0.055, pumpZ + 0.015),
    new THREE.Vector3(-0.184, 0.070, -0.055),               // Held by P-clamp 1
    new THREE.Vector3(-0.185, 0.145, -0.036),               // Held by P-clamp 2
    new THREE.Vector3(-0.183, railY - 0.020, railZ - 0.008), // Up toward fuel rail
    new THREE.Vector3(-0.181, railY, railZ),                // Connects flush into rail inlet
  ]);
  const feedGeo = new THREE.TubeGeometry(feedCurve, 24, 0.0032, 10, false);
  tagThermalGeometry(feedGeo, 6, 0, 0, 0);
  const feedLine = new THREE.Mesh(feedGeo, materials.mirrorStainless);
  feedLine.castShadow = true;
  group.add(feedLine);

  // Precision Adel cushioned P-clamps securing fuel line rigidly to the engine casing
  [
    { x: -0.184, y: 0.070, z: -0.055 },
    { x: -0.185, y: 0.145, z: -0.036 },
  ].forEach((pos) => {
    const clampGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.006, 12);
    tagThermalGeometry(clampGeo, 6, 0, 0, 0);
    clampGeo.rotateX(Math.PI / 2);
    const clamp = new THREE.Mesh(clampGeo, materials.machinedAluminum);
    clamp.position.set(pos.x, pos.y, pos.z);
    group.add(clamp);

    const clampBolt = createHexBolt(0.0022, 0.006, materials, 6);
    clampBolt.position.set(pos.x + 0.004, pos.y, pos.z);
    clampBolt.rotation.z = Math.PI / 2;
    group.add(clampBolt);
  });

  // Rear Rail AN-6 Bulkhead Inlet Fitting (connecting feed line to rail)
  const anRail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0055, 0.0055, 0.009, 6),
    materials.anodizedBlue
  );
  anRail.rotateZ(Math.PI / 2);
  anRail.position.set(-0.183, railY, railZ);
  group.add(anRail);

  const anRailNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.003, 6),
    materials.aviationBrass
  );
  anRailNut.rotateZ(Math.PI / 2);
  anRailNut.position.set(-0.180, railY, railZ);
  group.add(anRailNut);

  return group;
}
