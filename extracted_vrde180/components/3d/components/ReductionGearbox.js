import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt, addBoltCircle } from "../VRDE180Utilities";

/**
 * PARTS 4–5 — REDUCTION GEARBOX & FRONT HOUSING
 *
 * Multi-disc concentric housing with stepped diameters — the visually
 * distinctive front component. Contains 1.6:1 reduction gears.
 * Reference shows multiple concentric cylindrical sections with deep
 * bolt patterns and machined flanges.
 */
export function buildReductionGearbox(materials) {
  const group = new THREE.Group();
  group.name = "REDUCTION_GEARBOX";

  const { crankCenterY } = ENGINE;

  // ═══════════════════════════════════════════════════════════
  // FRONT HOUSING / GEARBOX ASSEMBLY
  // ═══════════════════════════════════════════════════════════

  // ── 1. Large rear mounting flange disc (Ø250mm) ──
  const rearFlangeGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.016, 40);
  tagThermalGeometry(rearFlangeGeo, 5, 0, 0, 0);
  rearFlangeGeo.rotateZ(Math.PI / 2);
  const rearFlange = new THREE.Mesh(rearFlangeGeo, materials.castAluminum);
  rearFlange.position.set(0.008, 0, 0);
  rearFlange.castShadow = true;
  group.add(rearFlange);

  // 20 perimeter flange hex bolts
  for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 20) {
    const fb = createHexBolt(0.0035, 0.012, materials);
    fb.position.set(0.016, Math.sin(a) * 0.114, Math.cos(a) * 0.114);
    fb.rotation.z = -Math.PI / 2;
    group.add(fb);
  }

  // ── 2. Stepped mid reduction casing (Ø200mm → Ø170mm, length 42mm) ──
  const midGeo = new THREE.CylinderGeometry(0.088, 0.102, 0.042, 40);
  tagThermalGeometry(midGeo, 5, 0, 0, 0);
  midGeo.rotateZ(Math.PI / 2);
  const mid = new THREE.Mesh(midGeo, materials.castAluminum);
  mid.position.set(0.037, 0, 0);
  mid.castShadow = true;
  group.add(mid);

  // 6 radial structural stiffening ribs
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const ribGeo = new THREE.BoxGeometry(0.040, 0.006, 0.005);
    tagThermalGeometry(ribGeo, 5, 0, 0, 0);
    const rib = new THREE.Mesh(ribGeo, materials.castAluminum);
    rib.position.set(0.037, Math.sin(a) * 0.088, Math.cos(a) * 0.088);
    rib.rotation.x = a;
    group.add(rib);
  }

  // ── 3. Second concentric stepped disc (Ø150mm, 14mm thick) ──
  const disc2Geo = new THREE.CylinderGeometry(0.075, 0.075, 0.014, 36);
  tagThermalGeometry(disc2Geo, 5, 0, 0, 0);
  disc2Geo.rotateZ(Math.PI / 2);
  const disc2 = new THREE.Mesh(disc2Geo, materials.machinedAluminum);
  disc2.position.set(0.065, 0, 0);
  group.add(disc2);

  // 14 bolts on second concentric disc
  for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 14) {
    const b2 = createHexBolt(0.0028, 0.009, materials);
    b2.position.set(0.072, Math.sin(a) * 0.065, Math.cos(a) * 0.065);
    b2.rotation.z = -Math.PI / 2;
    group.add(b2);
  }

  // ── 4. Front output shaft drive hub (Ø104mm, 12mm thick) ──
  const driveHubGeo = new THREE.CylinderGeometry(0.052, 0.052, 0.012, 32);
  tagThermalGeometry(driveHubGeo, 5, 0, 0, 0);
  driveHubGeo.rotateZ(Math.PI / 2);
  const driveHub = new THREE.Mesh(driveHubGeo, materials.machinedAluminum);
  driveHub.position.set(0.078, 0, 0);
  group.add(driveHub);

  // 8 bolts on output drive hub
  for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / 8) {
    const b3 = createHexBolt(0.0025, 0.008, materials);
    b3.position.set(0.084, Math.sin(a) * 0.042, Math.cos(a) * 0.042);
    b3.rotation.z = -Math.PI / 2;
    group.add(b3);
  }

  // ── Stepped Concentric Housing Rings (Contoured snugly on mid reduction casing) ──
  for (let f = 0; f < 4; f++) {
    const fx = 0.020 + f * 0.010; // X = 0.020, 0.030, 0.040, 0.050 (safely inside casing length 0.016 to 0.058)
    const t = (fx - 0.016) / 0.042;
    const r = (1 - t) * 0.102 + t * 0.088; // exact surface contour radius
    const finGeo = new THREE.TorusGeometry(r + 0.001, 0.0018, 6, 36);
    tagThermalGeometry(finGeo, 5, 0, 0, 0);
    finGeo.rotateY(Math.PI / 2);
    const fin = new THREE.Mesh(finGeo, materials.concentricScanRing);
    fin.position.set(fx, 0, 0);
    fin.userData.isConcentricRing = true;
    fin.name = "GEARBOX_CONCENTRIC_RING";
    group.add(fin);
  }

  // ── Oil drain boss on bottom ──
  const drainBossGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.015, 8);
  tagThermalGeometry(drainBossGeo, 5, 0, 0, 0);
  const drainBoss = new THREE.Mesh(drainBossGeo, materials.aviationBrass);
  drainBoss.position.set(0.040, -0.108, 0);
  group.add(drainBoss);

  // ── Breather port (top) ──
  const breatherGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.012, 10);
  tagThermalGeometry(breatherGeo, 5, 0, 0, 0);
  const breather = new THREE.Mesh(breatherGeo, materials.machinedAluminum);
  breather.position.set(0.040, 0.108, 0);
  group.add(breather);

  // Position the gearbox at the front of the engine
  group.position.set(ENGINE.frontGearboxX, crankCenterY, 0);

  return group;
}
