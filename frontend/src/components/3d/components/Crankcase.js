import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt, addBoltCircle } from "../VRDE180Utilities";

/**
 * PART 8 — LOWER CRANKCASE / SUMP
 *
 * Cast aluminum split-case crankcase housing the crankshaft, main bearings,
 * and oil sump. The structural backbone of the engine.
 *
 * Visual reference: Rectangular-ish cast aluminum housing with lateral bulges
 * for main bearing webs, deep oil pan below, mounting pad bosses on sides,
 * and split-line flange at top.
 */
export function buildCrankcase(materials) {
  const group = new THREE.Group();
  group.name = "CRANKCASE_LOWER";

  const { crankCenterY, cylinderConfigs } = ENGINE;

  // ── 1. Upper Crankcase Half (from crankCenterY up to cylinderBaseY) ──
  const upperHeight = ENGINE.cylinderBaseY - crankCenterY;
  const caseLength = 0.470;
  const upperCaseWidth = 0.114; // Narrower sculpted waist (Z = ±0.057) creating deep mid hollowness
  const lowerCaseWidth = 0.144; // Sump section width (Z = ±0.072)

  const upperCaseGeo = new THREE.BoxGeometry(caseLength, upperHeight, upperCaseWidth);
  tagThermalGeometry(upperCaseGeo, 5, 0, 0, 0);
  const upperCase = new THREE.Mesh(upperCaseGeo, materials.castAluminum);
  upperCase.position.set(0, crankCenterY + upperHeight * 0.5, 0);
  upperCase.castShadow = true;
  group.add(upperCase);

  // Top deck flange where cylinder barrels sit
  const topDeckGeo = new THREE.BoxGeometry(caseLength + 0.006, 0.006, upperCaseWidth + 0.006);
  tagThermalGeometry(topDeckGeo, 5, 0, 0, 0);
  const topDeck = new THREE.Mesh(topDeckGeo, materials.machinedAluminum);
  topDeck.position.set(0, ENGINE.cylinderBaseY - 0.003, 0);
  group.add(topDeck);

  // ── 2. Split-Line Flanges & Aerospace Red Silicone Gasket ──
  // Upper split flange
  const upperSplitFlangeGeo = new THREE.BoxGeometry(caseLength + 0.008, 0.006, lowerCaseWidth + 0.008);
  tagThermalGeometry(upperSplitFlangeGeo, 5, 0, 0, 0);
  const upperSplitFlange = new THREE.Mesh(upperSplitFlangeGeo, materials.machinedAluminum);
  upperSplitFlange.position.set(0, crankCenterY + 0.003, 0);
  group.add(upperSplitFlange);

  // Red silicone perimeter gasket seal
  const gasketGeo = new THREE.BoxGeometry(caseLength + 0.010, 0.0025, lowerCaseWidth + 0.010);
  tagThermalGeometry(gasketGeo, 5, 0, 0, 0);
  const gasket = new THREE.Mesh(gasketGeo, materials.redSilicone);
  gasket.position.set(0, crankCenterY, 0);
  group.add(gasket);

  // Lower split flange (on oil pan)
  const lowerSplitFlangeGeo = new THREE.BoxGeometry(caseLength + 0.008, 0.006, lowerCaseWidth + 0.008);
  tagThermalGeometry(lowerSplitFlangeGeo, 5, 0, 0, 0);
  const lowerSplitFlange = new THREE.Mesh(lowerSplitFlangeGeo, materials.machinedAluminum);
  lowerSplitFlange.position.set(0, crankCenterY - 0.003, 0);
  group.add(lowerSplitFlange);

  // ── 3. Lower Crankcase / Oil Pan (Sump) — Solid Cast Aluminum Enclosure ──
  // Fully encloses the crankshaft and connecting rods (NO open gaps)
  const sumpHeight = 0.075;
  const sumpGeo = new THREE.BoxGeometry(caseLength - 0.040, sumpHeight, lowerCaseWidth - 0.016);
  tagThermalGeometry(sumpGeo, 5, 0, 0, 0);
  const sump = new THREE.Mesh(sumpGeo, materials.castAluminum);
  sump.position.set(-0.010, crankCenterY - sumpHeight * 0.5 - 0.006, 0);
  sump.castShadow = true;
  group.add(sump);

  // Sump bottom rounding
  const sumpBottomGeo = new THREE.CylinderGeometry(0.068, 0.068, caseLength - 0.040, 24, 1, false, Math.PI, Math.PI);
  tagThermalGeometry(sumpBottomGeo, 5, 0, 0, 0);
  sumpBottomGeo.rotateZ(Math.PI / 2);
  const sumpBottom = new THREE.Mesh(sumpBottomGeo, materials.castAluminum);
  sumpBottom.position.set(-0.010, crankCenterY - sumpHeight - 0.006, 0);
  group.add(sumpBottom);

  // ── 4. Main bearing web bulges — 5 webs for 4-cylinder inline ──
  const bearingWebXPositions = [-0.215, -0.115, 0, 0.115, 0.215];
  bearingWebXPositions.forEach((wx) => {
    // Lateral bearing web stiffener boss
    [-1, 1].forEach((side) => {
      const webGeo = new THREE.CylinderGeometry(0.026, 0.024, 0.014, 20);
      tagThermalGeometry(webGeo, 5, 0, 0, 0);
      webGeo.rotateX(Math.PI / 2);
      const web = new THREE.Mesh(webGeo, materials.castAluminum);
      web.position.set(wx, crankCenterY, side * (lowerCaseWidth * 0.5 + 0.004));
      group.add(web);
    });
  });

  // Drain plug washer
  const drainWasherGeo = new THREE.CylinderGeometry(0.011, 0.011, 0.002, 16);
  tagThermalGeometry(drainWasherGeo, 5, 0, 0, 0);
  const drainWasher = new THREE.Mesh(drainWasherGeo, materials.copperWinding);
  drainWasher.position.set(-0.080, crankCenterY - 0.114, 0);
  group.add(drainWasher);

  // ── Sump perimeter bolts ──
  for (let bx = -0.170; bx <= 0.170; bx += 0.040) {
    [-0.072, 0.072].forEach((bz) => {
      const sb = createHexBolt(0.0025, 0.008, materials);
      sb.position.set(bx - 0.020, crankCenterY - 0.036, bz);
      sb.rotation.x = Math.PI;
      group.add(sb);
    });
  }

  // ── Cylinder stud bosses — 4 per cylinder, 16 total ──
  // These are the pads where long through-studs thread into for holding barrels + head
  cylinderConfigs.forEach((cfg) => {
    for (let a = Math.PI / 4; a < Math.PI * 2; a += Math.PI / 2) {
      const bossGeo = new THREE.CylinderGeometry(0.008, 0.010, 0.015, 12);
      tagThermalGeometry(bossGeo, 1, cfg.num, 0, 0);
      const boss = new THREE.Mesh(bossGeo, materials.castAluminum);
      boss.position.set(
        cfg.x + Math.sin(a) * 0.050,
        crankCenterY + 0.072,
        Math.cos(a) * 0.050
      );
      group.add(boss);
    }
  });

  // ── Front face — gearbox mating flange ──
  const frontFlangeGeo = new THREE.CylinderGeometry(0.100, 0.100, 0.012, 32);
  tagThermalGeometry(frontFlangeGeo, 5, 0, 0, 0);
  frontFlangeGeo.rotateZ(Math.PI / 2);
  const frontFlange = new THREE.Mesh(frontFlangeGeo, materials.machinedAluminum);
  frontFlange.position.set(0.236, crankCenterY + 0.015, 0);
  group.add(frontFlange);

  // ── Rear face — accessory case mating flange ──
  const rearFlangeGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.012, 32);
  tagThermalGeometry(rearFlangeGeo, 5, 0, 0, 0);
  rearFlangeGeo.rotateZ(Math.PI / 2);
  const rearFlange = new THREE.Mesh(rearFlangeGeo, materials.machinedAluminum);
  rearFlange.position.set(-0.236, crankCenterY + 0.015, 0);
  group.add(rearFlange);

  // ── Oil gallery boss ports (left side) ──
  [-0.100, 0.050, 0.160].forEach((px) => {
    const portGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.015, 12);
    tagThermalGeometry(portGeo, 6, 0, 0, 0);
    portGeo.rotateX(Math.PI / 2);
    const port = new THREE.Mesh(portGeo, materials.machinedAluminum);
    port.position.set(px, crankCenterY + 0.010, -0.092);
    group.add(port);
  });

  // ── Breather tube boss (top) ──
  const breatherBossGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.014, 12);
  tagThermalGeometry(breatherBossGeo, 5, 0, 0, 0);
  const breatherBoss = new THREE.Mesh(breatherBossGeo, materials.machinedAluminum);
  breatherBoss.position.set(-0.100, crankCenterY + 0.078, -0.060);
  group.add(breatherBoss);

  // ── Lateral stiffening ribs on sump ──
  [-0.130, -0.040, 0.050, 0.130].forEach((rx) => {
    const ribGeo = new THREE.BoxGeometry(0.004, 0.050, 0.130);
    tagThermalGeometry(ribGeo, 5, 0, 0, 0);
    const rib = new THREE.Mesh(ribGeo, materials.castAluminum);
    rib.position.set(rx, crankCenterY - 0.068, 0);
    group.add(rib);
  });

  // ── Engine serial number plate boss (left side) ──
  const plateBossGeo = new THREE.BoxGeometry(0.050, 0.025, 0.003);
  tagThermalGeometry(plateBossGeo, 5, 0, 0, 0);
  const plateBoss = new THREE.Mesh(plateBossGeo, materials.machinedAluminum);
  plateBoss.position.set(0.050, crankCenterY + 0.040, -0.092);
  group.add(plateBoss);

  return group;
}
