import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PART 13 — CYLINDER BARRELS (4x)
 *
 * 4 individual dark-finned air-cooled cylinder barrels — the most iconic
 * visual element of the VRDE 180HP engine:
 * - Wider transverse stance (110mm Z width) filling the engine bay
 * - Deep hollow annular cooling fins (14.2mm to 20.2mm overhang depth)
 * - Broad 4.55mm open air channels between fins for crisp hollow negative space
 * - Nitrided steel liner (chrome bore visible at top)
 * - Base mounting flange with stud holes
 */
export function buildCylinderBarrels(materials) {
  const group = new THREE.Group();
  group.name = "CYLINDER_BARRELS";

  const { cylinderConfigs, barrelHeight, barrelInnerR: boreR } = ENGINE;

  // ── HOLLOWER & WIDER CYLINDRICAL COOLING FIN SPECIFICATIONS ──
  // - Inner solid wall core: 0.035m (35mm) radius (reduced from 40mm) creates deep 14.2mm - 20.2mm hollow pockets
  // - Outer fin radius: 0.0492m along X (98.4mm diameter, fills 100mm pitch with 1.6mm expansion air gap)
  // - Transverse width in Z: scaled by 1.12 (110.2mm wide along Z) for substantial width
  // - Prominent, thick cooling rings: 3.4mm thickness with chamfered bevels & deep air channels
  const wallOuterR = 0.035;
  const finRadiusX = 0.0492;
  const finScaleZ = 1.12;
  const effectiveFinCount = 18;
  const finThicknessVal = 0.0034;
  const bevelThick = 0.0004;
  const finStartY = -barrelHeight * 0.44;  // fins start directly above base mounting flange
  const finEndY = barrelHeight * 0.47;     // fins extend up to the cylinder head interface
  const finSpan = finEndY - finStartY;

  // Master hollow annular cooling fin shape
  const finShape = new THREE.Shape();
  finShape.absarc(0, 0, finRadiusX, 0, Math.PI * 2, false);
  const finHole = new THREE.Path();
  finHole.absarc(0, 0, wallOuterR - 0.0005, 0, Math.PI * 2, true);
  finShape.holes.push(finHole);

  const baseFinGeo = new THREE.ExtrudeGeometry(finShape, {
    depth: finThicknessVal - 2 * bevelThick,
    bevelEnabled: true,
    bevelThickness: bevelThick,
    bevelSize: bevelThick,
    bevelSegments: 2,
    curveSegments: 36,
  });
  baseFinGeo.rotateX(Math.PI / 2);
  baseFinGeo.translate(0, finThicknessVal * 0.5, 0);

  cylinderConfigs.forEach((cfg) => {
    const barrelGroup = new THREE.Group();
    barrelGroup.name = `BARREL_${cfg.num}`;

    // ── Main barrel wall (hollow cylinder — dark nitrided steel) ──
    const wallGeo = new THREE.CylinderGeometry(wallOuterR, wallOuterR, barrelHeight, 32, 1, true);
    tagThermalGeometry(wallGeo, 2, cfg.num, 0, 0);
    const wall = new THREE.Mesh(wallGeo, materials.cylinderBarrel);
    wall.material.side = THREE.DoubleSide;
    wall.castShadow = true;
    barrelGroup.add(wall);

    // ── Chrome bore liner (visible as bright ring at top) ──
    const linerGeo = new THREE.CylinderGeometry(boreR, boreR, barrelHeight + 0.002, 28, 1, true);
    tagThermalGeometry(linerGeo, 2, cfg.num, 0, 0);
    const liner = new THREE.Mesh(linerGeo, materials.polishedChrome);
    liner.material.side = THREE.DoubleSide;
    barrelGroup.add(liner);

    // Top lip (machined sealing surface)
    const topLipGeo = new THREE.RingGeometry(boreR, wallOuterR + 0.003, 32);
    tagThermalGeometry(topLipGeo, 2, cfg.num, 0, 0);
    const topLip = new THREE.Mesh(topLipGeo, materials.machinedAluminum);
    topLip.position.y = barrelHeight * 0.5;
    topLip.rotation.x = -Math.PI / 2;
    barrelGroup.add(topLip);

    // ── 21 HOLLOW CYLINDRICAL COOLING FIN RINGS ──
    // Authentic air-cooled aero-engine cylinder barrel profile with deep hollow gaps
    // Crisp weathered satin steel rim edges + deep dark cast-iron / nitrided recesses between fins
    const barrelFinGeo = baseFinGeo.clone();
    tagThermalGeometry(barrelFinGeo, 2, cfg.num, 0, 0);

    for (let f = 0; f < effectiveFinCount; f++) {
      const t = f / (effectiveFinCount - 1);
      const fy = finStartY + t * finSpan;

      // Multi-material: front/back faces dark nitrided steel, extruded rim edge satin silver glint
      const finMatArray = [
        materials.darkCylinderFin,
        materials.cylinderFinRim || materials.finGlintSilver,
      ];
      const fin = new THREE.Mesh(barrelFinGeo, finMatArray);
      fin.position.y = fy;
      fin.scale.set(1.0, 1.0, finScaleZ);
      fin.castShadow = true;
      fin.receiveShadow = true;
      fin.userData.isConcentricRing = true;
      barrelGroup.add(fin);
    }

    // ── Base mounting flange (aged cast metal, matching engine block) ──
    const baseFlangeGeo = new THREE.CylinderGeometry(finRadiusX * 1.01, finRadiusX * 1.01, 0.009, 32);
    tagThermalGeometry(baseFlangeGeo, 2, cfg.num, 0, 0);
    const baseFlange = new THREE.Mesh(baseFlangeGeo, materials.cylinderBarrel);
    baseFlange.scale.set(1.0, 1.0, finScaleZ);
    baseFlange.position.y = -barrelHeight * 0.5;
    barrelGroup.add(baseFlange);

    // High-tensile aviation base hold-down studs and hex lock-nuts (securing barrel to crankcase)
    for (let a = Math.PI / 4; a < Math.PI * 2; a += Math.PI / 2) {
      const bx = Math.sin(a) * (wallOuterR + 0.010);
      const bz = Math.cos(a) * (wallOuterR + 0.010) * finScaleZ;

      // Hardened oil-quenched steel washer
      const washerGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.0015, 12);
      tagThermalGeometry(washerGeo, 2, cfg.num, 0, 0);
      const washer = new THREE.Mesh(washerGeo, materials.darkAnodized);
      washer.position.set(bx, -barrelHeight * 0.5 + 0.0048, bz);
      barrelGroup.add(washer);

      // Aviation hex nut
      const nut = createHexBolt(0.0034, 0.008, materials, 2);
      nut.position.set(bx, -barrelHeight * 0.5 + 0.008, bz);
      barrelGroup.add(nut);
    }

    // ── Vertical pushrod / through-tie sleeves spanning along cylinder sides ──
    // Authentic aero-engine architecture linking head to crankcase with sealing collars
    [-0.044, 0.044].forEach((sz) => {
      const sleeveCurve = new THREE.LineCurve3(
        new THREE.Vector3(0, -barrelHeight * 0.48, sz),
        new THREE.Vector3(0, barrelHeight * 0.48, sz)
      );
      const sleeveGeo = new THREE.TubeGeometry(sleeveCurve, 8, 0.0032, 12, false);
      tagThermalGeometry(sleeveGeo, 2, cfg.num, 0, 0);
      const sleeve = new THREE.Mesh(sleeveGeo, materials.forgedSteel);
      barrelGroup.add(sleeve);

      // Top and bottom compression sealing ferrule nuts
      [-barrelHeight * 0.46, barrelHeight * 0.46].forEach((ny) => {
        const nutGeo = new THREE.CylinderGeometry(0.0048, 0.0048, 0.004, 6);
        tagThermalGeometry(nutGeo, 2, cfg.num, 0, 0);
        const nutMesh = new THREE.Mesh(nutGeo, materials.aviationBrass);
        nutMesh.position.set(0, ny, sz);
        barrelGroup.add(nutMesh);
      });
    });

    // ── Oil drain-back slot (small cutout at barrel base) ──
    const drainSlotGeo = new THREE.BoxGeometry(0.008, 0.006, 0.004);
    tagThermalGeometry(drainSlotGeo, 2, cfg.num, 0, 0);
    const drainSlot = new THREE.Mesh(drainSlotGeo, materials.darkAnodized);
    drainSlot.position.set(0, -barrelHeight * 0.48, wallOuterR + 0.002);
    barrelGroup.add(drainSlot);

    // Position barrel on crankcase — sitting on the upper split line
    barrelGroup.position.set(cfg.x, ENGINE.cylinderBaseY + barrelHeight * 0.5, 0);
    group.add(barrelGroup);
  });

  return group;
}
