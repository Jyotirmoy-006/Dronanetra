import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE } from "../VRDE180Utilities";

/**
 * PARTS 1–3 — PROPELLER SPINNER, BLADES (COMPOSITE) & HUB
 *
 * 4-blade carbon composite propeller with polished conical spinner
 * and signature cyan LED ring. Each blade has aerodynamic twist,
 * airfoil cross-section, and white-painted tips.
 */

function createPropellerBlade(angleDeg, materials) {
  const bladeAssembly = new THREE.Group();
  const spanStations = 24;
  const profilePoints = 18;
  const spanLength = 0.280;
  const tipStartU = 0.82;

  // ── Main carbon section ──
  const mainPositions = [];
  const mainUvs = [];
  const mainIndices = [];
  const mainStations = Math.floor(spanStations * tipStartU);

  for (let i = 0; i <= mainStations; i++) {
    const u = (i / mainStations) * tipStartU;
    const spanR = 0.065 + u * (spanLength - 0.065);
    let chord = 0.068 * (1.0 - u * 0.38);
    const thick = 0.014 * (1.0 - u * 0.55);
    const twist = (24.0 - u * 14.0) * (Math.PI / 180);

    for (let j = 0; j <= profilePoints; j++) {
      const v = (j / profilePoints) * Math.PI * 2;
      const zAirfoil = Math.cos(v) * (chord * 0.5);
      let xAirfoil = Math.sin(v) * (thick * 0.5);
      if (Math.sin(v) > 0) xAirfoil *= 1.35;

      const cosTw = Math.cos(twist);
      const sinTw = Math.sin(twist);
      const xRot = xAirfoil * cosTw - zAirfoil * sinTw;
      const zRot = xAirfoil * sinTw + zAirfoil * cosTw;

      mainPositions.push(xRot, spanR, zRot);
      mainUvs.push(u, j / profilePoints);
    }
  }

  for (let i = 0; i < mainStations; i++) {
    for (let j = 0; j < profilePoints; j++) {
      const p1 = i * (profilePoints + 1) + j;
      const p2 = p1 + 1;
      const p3 = (i + 1) * (profilePoints + 1) + j;
      const p4 = p3 + 1;
      mainIndices.push(p1, p3, p2);
      mainIndices.push(p2, p3, p4);
    }
  }

  const mainGeo = new THREE.BufferGeometry();
  mainGeo.setAttribute("position", new THREE.Float32BufferAttribute(mainPositions, 3));
  mainGeo.setAttribute("uv", new THREE.Float32BufferAttribute(mainUvs, 2));
  mainGeo.setIndex(mainIndices);
  mainGeo.computeVertexNormals();
  tagThermalGeometry(mainGeo, 11, 0, 0, 0);
  const mainMesh = new THREE.Mesh(mainGeo, materials.carbonPropeller);
  mainMesh.castShadow = true;
  bladeAssembly.add(mainMesh);

  // ── White tip section ──
  const tipPositions = [];
  const tipUvs = [];
  const tipIndices = [];
  const tipStations = spanStations - mainStations;

  for (let i = 0; i <= tipStations; i++) {
    const tLocal = i / tipStations;
    const u = tipStartU + tLocal * (1.0 - tipStartU);
    const spanR = 0.065 + u * (spanLength - 0.065);
    let chord = 0.068 * (1.0 - u * 0.38);
    const tipTaper = Math.sin(Math.acos(tLocal * 0.96));
    chord = Math.max(0.014, chord * tipTaper);
    const thick = 0.014 * (1.0 - u * 0.55);
    const twist = (24.0 - u * 14.0) * (Math.PI / 180);

    for (let j = 0; j <= profilePoints; j++) {
      const v = (j / profilePoints) * Math.PI * 2;
      const zAirfoil = Math.cos(v) * (chord * 0.5);
      let xAirfoil = Math.sin(v) * (thick * 0.5);
      if (Math.sin(v) > 0) xAirfoil *= 1.35;

      const cosTw = Math.cos(twist);
      const sinTw = Math.sin(twist);
      const xRot = xAirfoil * cosTw - zAirfoil * sinTw;
      const zRot = xAirfoil * sinTw + zAirfoil * cosTw;

      tipPositions.push(xRot, spanR, zRot);
      tipUvs.push(u, j / profilePoints);
    }
  }

  for (let i = 0; i < tipStations; i++) {
    for (let j = 0; j < profilePoints; j++) {
      const p1 = i * (profilePoints + 1) + j;
      const p2 = p1 + 1;
      const p3 = (i + 1) * (profilePoints + 1) + j;
      const p4 = p3 + 1;
      tipIndices.push(p1, p3, p2);
      tipIndices.push(p2, p3, p4);
    }
  }

  const tipGeo = new THREE.BufferGeometry();
  tipGeo.setAttribute("position", new THREE.Float32BufferAttribute(tipPositions, 3));
  tipGeo.setAttribute("uv", new THREE.Float32BufferAttribute(tipUvs, 2));
  tipGeo.setIndex(tipIndices);
  tipGeo.computeVertexNormals();
  tagThermalGeometry(tipGeo, 11, 0, 0, 0);
  const tipMesh = new THREE.Mesh(tipGeo, materials.propellerWhiteTip);
  tipMesh.castShadow = true;
  bladeAssembly.add(tipMesh);

  bladeAssembly.rotation.x = (angleDeg * Math.PI) / 180;
  return bladeAssembly;
}

export function buildPropellerAssembly(materials) {
  const group = new THREE.Group();
  group.name = "PROPELLER_ASSEMBLY";

  const { crankCenterY, frontGearboxX } = ENGINE;
  let spinnerRingMesh = null;

  // ── Propeller hub (central aluminum disc where blades attach) ──
  const hubGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.028, 32);
  tagThermalGeometry(hubGeo, 11, 0, 0, 0);
  hubGeo.rotateZ(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, materials.machinedAluminum);
  hub.castShadow = true;
  group.add(hub);

  // Hub bolt circle (6 high-strength chrome retention bolts)
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const hb = new THREE.Mesh(
      new THREE.CylinderGeometry(0.0035, 0.0035, 0.032, 8),
      materials.polishedChrome
    );
    tagThermalGeometry(hb.geometry, 11, 0, 0, 0);
    hb.geometry.rotateZ(Math.PI / 2);
    hb.position.set(0, Math.sin(a) * 0.042, Math.cos(a) * 0.042);
    group.add(hb);
  }

  // ── 2 PROPELLER BLADES (Vertical UP & DOWN matching authentic DRDO VRDE photos) ──
  // One pointing straight up (+Y, 90°), one pointing straight down (-Y, 270°)
  [90, 270].forEach((angle) => {
    const blade = createPropellerBlade(angle, materials);
    group.add(blade);
  });

  // ── SPINNER NOSE CONE (AERODYNAMIC PARABOLIC CONE POINTING FORWARD +X - COMPACT PROPORTIONS) ──
  // Profile curve: Tip at (0.001, 0.118) -> Base at (0.052, 0.000)
  const spinnerPts = [];
  const segs = 24;
  const spinnerLength = 0.118; // Sleeker, more compact length
  const baseRadius = 0.052;    // Refined base radius
  for (let i = 0; i <= segs; i++) {
    const t = i / segs; // 0 at tip, 1 at base
    const y = spinnerLength * (1.0 - t); // y goes 0.118 -> 0.0
    // Parabolic aerodynamic bullet profile
    const r = baseRadius * Math.sqrt(t) * (1.0 + 0.12 * Math.sin(t * Math.PI));
    spinnerPts.push(new THREE.Vector2(Math.max(0.0008, r), y));
  }
  // Base inward lip
  spinnerPts.push(new THREE.Vector2(0.022, 0.000));

  const spinnerGeo = new THREE.LatheGeometry(spinnerPts, 40);
  tagThermalGeometry(spinnerGeo, 11, 0, 0, 0);
  // Revolve around Y, then rotate around Z by -Math.PI / 2: +Y becomes +X (pointing forward!)
  spinnerGeo.rotateZ(-Math.PI / 2);
  const spinner = new THREE.Mesh(spinnerGeo, materials.spinnerCone);
  spinner.castShadow = true;
  group.add(spinner);

  // ── MACHINED CHROME PINSTRIPE & BASE ACCENT RINGS (FRONT RIGHT VIEW in photo) ──
  // Circumferential silver accent stripe at 1/3 spinner height
  const pinstripeGeo = new THREE.TorusGeometry(0.040, 0.0014, 8, 40);
  tagThermalGeometry(pinstripeGeo, 11, 0, 0, 0);
  pinstripeGeo.rotateY(Math.PI / 2);
  const pinstripe = new THREE.Mesh(pinstripeGeo, materials.polishedChrome);
  pinstripe.position.set(0.040, 0, 0);
  group.add(pinstripe);

  // Silver base accent ring at backplate interface
  const baseTrimGeo = new THREE.TorusGeometry(0.052, 0.0016, 8, 40);
  tagThermalGeometry(baseTrimGeo, 11, 0, 0, 0);
  baseTrimGeo.rotateY(Math.PI / 2);
  const baseTrim = new THREE.Mesh(baseTrimGeo, materials.polishedChrome);
  baseTrim.position.set(0.004, 0, 0);
  group.add(baseTrim);

  // ── 6 PERIMETER RETENTION SCREWS AROUND SPINNER BASE (exp_right.jpg) ──
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const screwGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0035, 8);
    tagThermalGeometry(screwGeo, 11, 0, 0, 0);
    screwGeo.rotateZ(Math.PI / 2);
    const screw = new THREE.Mesh(screwGeo, materials.polishedChrome);
    screw.position.set(0.012, Math.sin(a) * 0.048, Math.cos(a) * 0.048);
    group.add(screw);
  }

  // ── CENTRAL RETENTION WASHER & HEX NUT (exp_right.jpg - SCALED COMPACT) ──
  const tipWasherGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.0025, 16);
  tagThermalGeometry(tipWasherGeo, 11, 0, 0, 0);
  tipWasherGeo.rotateZ(Math.PI / 2);
  const tipWasher = new THREE.Mesh(tipWasherGeo, materials.polishedChrome);
  tipWasher.position.set(spinnerLength + 0.002, 0, 0);
  group.add(tipWasher);

  const tipNutGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.0045, 6);
  tagThermalGeometry(tipNutGeo, 11, 0, 0, 0);
  tipNutGeo.rotateZ(Math.PI / 2);
  const tipNut = new THREE.Mesh(tipNutGeo, materials.polishedChrome);
  tipNut.position.set(spinnerLength + 0.005, 0, 0);
  group.add(tipNut);

  // ── SPINNER REAR BULKHEAD DISC ──
  const bulkheadGeo = new THREE.RingGeometry(0.018, 0.052, 32);
  tagThermalGeometry(bulkheadGeo, 11, 0, 0, 0);
  const bulkhead = new THREE.Mesh(bulkheadGeo, materials.machinedAluminum);
  bulkhead.rotation.y = -Math.PI / 2;
  bulkhead.position.x = -0.002;
  group.add(bulkhead);

  // Position propeller assembly flush at front drive hub of gearbox
  group.position.set(frontGearboxX + 0.086, crankCenterY, 0);

  return { group, spinnerRingMesh };
}
