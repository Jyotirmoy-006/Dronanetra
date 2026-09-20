import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE } from "../VRDE180Utilities";

/**
 * PARTS 6, 7, 9 — CRANKSHAFT, MAIN BEARINGS & TIMING GEARS
 *
 * Forged 4340 nitrided steel crankshaft for 4-cylinder inline engine.
 * Features: 4 crank throws with integral counterweights, 5 main journals,
 * cross-drilled oil passages, timing gear on front journal, flywheel
 * flange on rear.
 *
 * The crankshaft is the primary kinematic node — it rotates around X-axis
 * and drives piston reciprocation via slider-crank kinematics.
 */
export function buildCrankshaft(materials) {
  const group = new THREE.Group();
  group.name = "CRANKSHAFT_ASSEMBLY";

  const { cylinderConfigs, crankRadius, crankCenterY } = ENGINE;

  // ── Main journals — 5 journals between/outside the 4 throws ──
  const journalXPositions = [-0.215, -0.115, 0, 0.115, 0.215];
  const journalRadius = 0.022;
  const journalLength = 0.030;

  journalXPositions.forEach((jx) => {
    // Main journal (polished bearing surface)
    const journalGeo = new THREE.CylinderGeometry(journalRadius, journalRadius, journalLength, 24);
    tagThermalGeometry(journalGeo, 5, 0, 0, 0);
    journalGeo.rotateZ(Math.PI / 2);
    const journal = new THREE.Mesh(journalGeo, materials.mirrorStainless);
    journal.position.set(jx, 0, 0);
    journal.castShadow = true;
    group.add(journal);

    // Oil hole on each journal (tiny dark bore)
    const oilHoleGeo = new THREE.CylinderGeometry(0.002, 0.002, journalRadius * 2.1, 8);
    tagThermalGeometry(oilHoleGeo, 5, 0, 0, 0);
    const oilHole = new THREE.Mesh(oilHoleGeo, materials.darkAnodized);
    oilHole.position.set(jx, 0, 0);
    group.add(oilHole);
  });

  // ── Crank throws — 4 throws, one per cylinder ──
  // For a 1-3-4-2 inline-4 firing order:
  // Cylinders 1 & 4: crankpins at 0° (TDC)
  // Cylinders 2 & 3: crankpins at 180° (BDC)
  const crankpinRadius = 0.018;
  const crankpinLength = 0.045;

  cylinderConfigs.forEach((cfg, idx) => {
    const throwGroup = new THREE.Group();
    throwGroup.position.set(cfg.x, 0, 0);

    // Crankpin (rod bearing journal)
    const pinGeo = new THREE.CylinderGeometry(crankpinRadius, crankpinRadius, crankpinLength, 20);
    tagThermalGeometry(pinGeo, 5, cfg.num, 0, 0);
    pinGeo.rotateZ(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, materials.mirrorStainless);
    // Pin offset from center by crankRadius in the Y direction (at 0° phase)
    // Actual offset depends on crank angle — but in the model coordinate,
    // we place them at the "at rest" 0° position. The crankAngleOffset is
    // applied when the crankshaft group rotates around X.
    pin.position.set(0, crankRadius, 0);
    throwGroup.add(pin);

    // Crank webs (2 per throw — connecting journal to crankpin)
    [-1, 1].forEach((side) => {
      const webWidth = 0.018;  // along X (crankshaft axis)
      const webGeo = new THREE.BoxGeometry(webWidth, crankRadius + 0.012, 0.044);
      tagThermalGeometry(webGeo, 5, cfg.num, 0, 0);
      const web = new THREE.Mesh(webGeo, materials.forgedSteel);
      web.position.set(side * crankpinLength * 0.35, crankRadius * 0.45, 0);
      throwGroup.add(web);
    });

    // Counterweight (heavy lobe opposite the crankpin)
    const cwShape = new THREE.Shape();
    cwShape.moveTo(0, 0);
    cwShape.absarc(0, 0, 0.038, Math.PI * 0.65, Math.PI * 1.35, false);
    cwShape.lineTo(0, 0);
    const cwExtrudeSettings = { depth: 0.016, bevelEnabled: false };
    const cwGeo = new THREE.ExtrudeGeometry(cwShape, cwExtrudeSettings);
    tagThermalGeometry(cwGeo, 5, cfg.num, 0, 0);
    const cw = new THREE.Mesh(cwGeo, materials.forgedSteel);
    cw.rotation.set(0, Math.PI / 2, 0);
    cw.position.set(-0.008, -crankRadius * 0.15, 0);
    cw.castShadow = true;
    throwGroup.add(cw);

    // Lightening holes in counterweight (2 per throw)
    [-0.012, 0.012].forEach((hz) => {
      const holeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.020, 12);
      tagThermalGeometry(holeGeo, 5, cfg.num, 0, 0);
      holeGeo.rotateZ(Math.PI / 2);
      const hole = new THREE.Mesh(holeGeo, materials.darkAnodized);
      hole.position.set(0, -0.028, hz);
      throwGroup.add(hole);
    });

    // Apply the crank angle offset so throws 2&3 are 180° from 1&4
    throwGroup.rotation.x = cfg.crankAngleOffset;
    group.add(throwGroup);
  });

  // ── Front timing gear — spur gear on front journal ──
  const timingGearGroup = new THREE.Group();
  timingGearGroup.position.set(0.230, 0, 0);

  // Gear body
  const gearBodyGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.012, 32);
  tagThermalGeometry(gearBodyGeo, 5, 0, 0, 0);
  gearBodyGeo.rotateZ(Math.PI / 2);
  const gearBody = new THREE.Mesh(gearBodyGeo, materials.forgedSteel);
  timingGearGroup.add(gearBody);

  // Gear teeth (represented as a slightly larger torus ring)
  const gearTeethGeo = new THREE.TorusGeometry(0.033, 0.003, 6, 36);
  tagThermalGeometry(gearTeethGeo, 5, 0, 0, 0);
  gearTeethGeo.rotateY(Math.PI / 2);
  const gearTeeth = new THREE.Mesh(gearTeethGeo, materials.machinedAluminum);
  gearTeeth.position.set(0, 0, 0);
  timingGearGroup.add(gearTeeth);

  // Keyway slot on gear (visual detail)
  const keywayGeo = new THREE.BoxGeometry(0.014, 0.005, 0.005);
  tagThermalGeometry(keywayGeo, 5, 0, 0, 0);
  const keyway = new THREE.Mesh(keywayGeo, materials.darkAnodized);
  keyway.position.set(0, journalRadius, 0);
  timingGearGroup.add(keyway);

  group.add(timingGearGroup);

  // ── Camshaft drive gear (idler — smaller gear meshing with timing gear) ──
  const camGearGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.010, 24);
  tagThermalGeometry(camGearGeo, 5, 0, 0, 0);
  camGearGeo.rotateZ(Math.PI / 2);
  const camGear = new THREE.Mesh(camGearGeo, materials.forgedSteel);
  camGear.position.set(0.230, 0.050, 0);
  group.add(camGear);

  const camGearTeethGeo = new THREE.TorusGeometry(0.023, 0.002, 6, 24);
  tagThermalGeometry(camGearTeethGeo, 5, 0, 0, 0);
  camGearTeethGeo.rotateY(Math.PI / 2);
  const camGearTeeth = new THREE.Mesh(camGearTeethGeo, materials.machinedAluminum);
  camGearTeeth.position.set(0.230, 0.050, 0);
  group.add(camGearTeeth);

  // ── Rear flywheel flange ──
  const flywheelFlangeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.015, 28);
  tagThermalGeometry(flywheelFlangeGeo, 5, 0, 0, 0);
  flywheelFlangeGeo.rotateZ(Math.PI / 2);
  const flywheelFlange = new THREE.Mesh(flywheelFlangeGeo, materials.machinedAluminum);
  flywheelFlange.position.set(-0.230, 0, 0);
  group.add(flywheelFlange);

  // Flywheel flange bolt circle (6 bolts)
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const fbGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.008, 8);
    tagThermalGeometry(fbGeo, 5, 0, 0, 0);
    fbGeo.rotateZ(Math.PI / 2);
    const fb = new THREE.Mesh(fbGeo, materials.polishedChrome);
    fb.position.set(-0.234, Math.sin(a) * 0.034, Math.cos(a) * 0.034);
    group.add(fb);
  }

  // ── Crankshaft nose (front output stub for gearbox coupling) ──
  const noseGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.030, 16);
  tagThermalGeometry(noseGeo, 5, 0, 0, 0);
  noseGeo.rotateZ(Math.PI / 2);
  const nose = new THREE.Mesh(noseGeo, materials.mirrorStainless);
  nose.position.set(0.250, 0, 0);
  group.add(nose);

  // Nose keyway
  const noseKeywayGeo = new THREE.BoxGeometry(0.030, 0.004, 0.004);
  tagThermalGeometry(noseKeywayGeo, 5, 0, 0, 0);
  const noseKeyway = new THREE.Mesh(noseKeywayGeo, materials.darkAnodized);
  noseKeyway.position.set(0.250, 0.016, 0);
  group.add(noseKeyway);

  // Position entire crankshaft at crankCenterY
  group.position.set(0, crankCenterY, 0);

  return group;
}
