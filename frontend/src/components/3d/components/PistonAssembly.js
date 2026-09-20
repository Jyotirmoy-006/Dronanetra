import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE } from "../VRDE180Utilities";

/**
 * PARTS 10–12 — PISTONS (4x), CONNECTING RODS (4x), PISTON RINGS (4x)
 *
 * Forged 2618-T6 aluminum slipper pistons with:
 * - Crown with combustion bowl and valve relief pockets
 * - 3-ring pack (compression, scraper, oil control)
 * - Full-floating gudgeon/wrist pin
 * - Forged I-beam connecting rod with ARP bolts
 *
 * Returns { group, pistonNodes[], rodNodes[] } for kinematic animation.
 */
export function buildPistonAssembly(materials) {
  const group = new THREE.Group();
  group.name = "PISTON_ASSEMBLY";

  const { cylinderConfigs, crankRadius, rodLength, crankCenterY, pistonRadius } = ENGINE;
  const pistonNodes = [];
  const rodNodes = [];

  cylinderConfigs.forEach((cfg) => {
    // ════════════════════════════════════════════════════════════════
    // PISTON — Forged aluminum slipper type
    // ════════════════════════════════════════════════════════════════
    const pistonGroup = new THREE.Group();
    pistonGroup.name = `PISTON_${cfg.num}`;

    // ── Piston crown (top disc with slight dome) ──
    const crownGeo = new THREE.CylinderGeometry(pistonRadius, pistonRadius, 0.008, 28);
    tagThermalGeometry(crownGeo, 1, cfg.num, 0, 0);
    const crown = new THREE.Mesh(crownGeo, materials.pistonAlloy);
    crown.position.y = 0.020;
    crown.castShadow = true;
    pistonGroup.add(crown);

    // Crown combustion bowl (shallow dish in center)
    const bowlGeo = new THREE.CylinderGeometry(pistonRadius * 0.55, pistonRadius * 0.60, 0.004, 20);
    tagThermalGeometry(bowlGeo, 1, cfg.num, 0, 0);
    const bowl = new THREE.Mesh(bowlGeo, materials.machinedAluminum);
    bowl.position.y = 0.022;
    pistonGroup.add(bowl);

    // ── Valve relief pockets (4 shallow cutouts in crown) ──
    for (let va = 0; va < 4; va++) {
      const angle = (va * Math.PI / 2) + Math.PI / 4;
      const pocketGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.003, 12);
      tagThermalGeometry(pocketGeo, 1, cfg.num, 0, 0);
      const pocket = new THREE.Mesh(pocketGeo, materials.darkAnodized);
      pocket.position.set(
        Math.sin(angle) * pistonRadius * 0.60,
        0.025,
        Math.cos(angle) * pistonRadius * 0.60
      );
      pistonGroup.add(pocket);
    }

    // ── Ring lands and ring grooves ──
    // Top compression ring
    const ring1Geo = new THREE.TorusGeometry(pistonRadius - 0.001, 0.0015, 8, 36);
    tagThermalGeometry(ring1Geo, 1, cfg.num, 0, 0);
    const ring1 = new THREE.Mesh(ring1Geo, materials.forgedSteel);
    ring1.position.y = 0.014;
    ring1.rotation.x = Math.PI / 2;
    pistonGroup.add(ring1);

    // Second scraper ring
    const ring2Geo = new THREE.TorusGeometry(pistonRadius - 0.001, 0.0012, 8, 36);
    tagThermalGeometry(ring2Geo, 1, cfg.num, 0, 0);
    const ring2 = new THREE.Mesh(ring2Geo, materials.castIron);
    ring2.position.y = 0.008;
    ring2.rotation.x = Math.PI / 2;
    pistonGroup.add(ring2);

    // Oil control ring (twin-rail with expander)
    const ring3aGeo = new THREE.TorusGeometry(pistonRadius - 0.001, 0.0008, 8, 36);
    tagThermalGeometry(ring3aGeo, 1, cfg.num, 0, 0);
    const ring3a = new THREE.Mesh(ring3aGeo, materials.polishedChrome);
    ring3a.position.y = 0.002;
    ring3a.rotation.x = Math.PI / 2;
    pistonGroup.add(ring3a);

    const ring3bGeo = new THREE.TorusGeometry(pistonRadius - 0.001, 0.0008, 8, 36);
    tagThermalGeometry(ring3bGeo, 1, cfg.num, 0, 0);
    const ring3b = new THREE.Mesh(ring3bGeo, materials.polishedChrome);
    ring3b.position.y = -0.002;
    ring3b.rotation.x = Math.PI / 2;
    pistonGroup.add(ring3b);

    // ── Piston skirt (below rings — shorter slipper style) ──
    const skirtGeo = new THREE.CylinderGeometry(
      pistonRadius - 0.002, pistonRadius - 0.003, 0.028, 24, 1, true
    );
    tagThermalGeometry(skirtGeo, 1, cfg.num, 0, 0);
    const skirt = new THREE.Mesh(skirtGeo, materials.pistonSkirtMoly);
    skirt.position.y = -0.010;
    skirt.material.side = THREE.DoubleSide;
    pistonGroup.add(skirt);

    // ── Gudgeon / wrist pin (full-floating hollow pin) ──
    const pinGeo = new THREE.CylinderGeometry(0.010, 0.010, pistonRadius * 1.6, 16);
    tagThermalGeometry(pinGeo, 1, cfg.num, 0, 0);
    pinGeo.rotateX(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, materials.mirrorStainless);
    pin.position.y = -0.016;
    pistonGroup.add(pin);

    // Pin bore (hollow center)
    const pinBoreGeo = new THREE.CylinderGeometry(0.006, 0.006, pistonRadius * 1.7, 12);
    tagThermalGeometry(pinBoreGeo, 1, cfg.num, 0, 0);
    pinBoreGeo.rotateX(Math.PI / 2);
    const pinBore = new THREE.Mesh(pinBoreGeo, materials.darkAnodized);
    pinBore.position.y = -0.016;
    pistonGroup.add(pinBore);

    // Wire circlip grooves (thin rings at pin ends)
    [-1, 1].forEach((side) => {
      const clipGeo = new THREE.TorusGeometry(0.009, 0.0008, 6, 16);
      tagThermalGeometry(clipGeo, 1, cfg.num, 0, 0);
      const clip = new THREE.Mesh(clipGeo, materials.forgedSteel);
      clip.position.set(0, -0.016, side * pistonRadius * 0.72);
      clip.rotation.x = Math.PI / 2;
      pistonGroup.add(clip);
    });

    // ── Pin bosses (thickened internal pads where pin sits) ──
    [-1, 1].forEach((side) => {
      const bossGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.010, 16);
      tagThermalGeometry(bossGeo, 1, cfg.num, 0, 0);
      bossGeo.rotateX(Math.PI / 2);
      const boss = new THREE.Mesh(bossGeo, materials.pistonAlloy);
      boss.position.set(0, -0.016, side * 0.018);
      pistonGroup.add(boss);
    });

    // Position piston at TDC initially
    const pistonBaseY = crankCenterY + crankRadius + rodLength;
    pistonGroup.position.set(cfg.x, pistonBaseY, 0);

    group.add(pistonGroup);

    pistonNodes.push({
      mesh: pistonGroup,
      x: cfg.x,
      baseY: pistonBaseY,
      crankAngleOffset: cfg.crankAngleOffset,
    });

    // ════════════════════════════════════════════════════════════════
    // CONNECTING ROD — Forged I-beam
    // ════════════════════════════════════════════════════════════════
    const rodGroup = new THREE.Group();
    rodGroup.name = `CON_ROD_${cfg.num}`;

    // ── Big end (crankpin end — larger ring) ──
    const bigEndGeo = new THREE.TorusGeometry(0.020, 0.006, 10, 20);
    tagThermalGeometry(bigEndGeo, 1, cfg.num, 0, 0);
    bigEndGeo.rotateX(Math.PI / 2);
    const bigEnd = new THREE.Mesh(bigEndGeo, materials.forgedSteel);
    bigEnd.position.y = -rodLength * 0.48;
    rodGroup.add(bigEnd);

    // Big end bearing shell (bronze insert)
    const bigBearingGeo = new THREE.TorusGeometry(0.016, 0.002, 8, 20);
    tagThermalGeometry(bigBearingGeo, 1, cfg.num, 0, 0);
    bigBearingGeo.rotateX(Math.PI / 2);
    const bigBearing = new THREE.Mesh(bigBearingGeo, materials.bronzeBushing);
    bigBearing.position.y = -rodLength * 0.48;
    rodGroup.add(bigBearing);

    // Big end cap bolts (2 ARP bolts)
    [-0.014, 0.014].forEach((bz) => {
      const capBoltGeo = new THREE.CylinderGeometry(0.003, 0.003, 0.022, 8);
      tagThermalGeometry(capBoltGeo, 1, cfg.num, 0, 0);
      const capBolt = new THREE.Mesh(capBoltGeo, materials.polishedChrome);
      capBolt.position.set(0, -rodLength * 0.48, bz);
      rodGroup.add(capBolt);

      // ARP 12-point nut
      const nutGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.005, 12);
      tagThermalGeometry(nutGeo, 1, cfg.num, 0, 0);
      const nut = new THREE.Mesh(nutGeo, materials.polishedChrome);
      nut.position.set(0, -rodLength * 0.48 - 0.013, bz);
      rodGroup.add(nut);
    });

    // ── I-beam shank ──
    const shankGeo = new THREE.BoxGeometry(0.010, rodLength * 0.65, 0.006);
    tagThermalGeometry(shankGeo, 1, cfg.num, 0, 0);
    const shank = new THREE.Mesh(shankGeo, materials.forgedSteel);
    shank.position.y = 0;
    shank.castShadow = true;
    rodGroup.add(shank);

    // I-beam flanges (wider top and bottom of shank cross-section)
    [-1, 1].forEach((side) => {
      const flangeGeo = new THREE.BoxGeometry(0.014, rodLength * 0.55, 0.002);
      tagThermalGeometry(flangeGeo, 1, cfg.num, 0, 0);
      const flange = new THREE.Mesh(flangeGeo, materials.forgedSteel);
      flange.position.set(0, 0, side * 0.004);
      rodGroup.add(flange);
    });

    // ── Small end (wrist pin end — smaller ring) ──
    const smallEndGeo = new THREE.TorusGeometry(0.012, 0.004, 8, 18);
    tagThermalGeometry(smallEndGeo, 1, cfg.num, 0, 0);
    smallEndGeo.rotateX(Math.PI / 2);
    const smallEnd = new THREE.Mesh(smallEndGeo, materials.forgedSteel);
    smallEnd.position.y = rodLength * 0.48;
    rodGroup.add(smallEnd);

    // Small end bushing (bronze)
    const smallBushGeo = new THREE.TorusGeometry(0.010, 0.002, 8, 16);
    tagThermalGeometry(smallBushGeo, 1, cfg.num, 0, 0);
    smallBushGeo.rotateX(Math.PI / 2);
    const smallBush = new THREE.Mesh(smallBushGeo, materials.bronzeBushing);
    smallBush.position.y = rodLength * 0.48;
    rodGroup.add(smallBush);

    // Position rod initially (midpoint between crankpin and wrist pin at TDC)
    const rodMidY = crankCenterY + (crankRadius + rodLength) * 0.5;
    rodGroup.position.set(cfg.x, rodMidY, 0);

    group.add(rodGroup);

    rodNodes.push({
      mesh: rodGroup,
      x: cfg.x,
      crankAngleOffset: cfg.crankAngleOffset,
    });
  });

  return { group, pistonNodes, rodNodes };
}
