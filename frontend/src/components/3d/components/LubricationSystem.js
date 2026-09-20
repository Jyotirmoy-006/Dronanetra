import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PARTS 23–24 & 26 — LUBRICATION SYSTEM: OIL FILTER & OIL COOLERS
 *
 * STRICTLY MATCHES ASSEMBLED MASTER REFERENCE (ref_perfect_right_side.png):
 * 1. FRONT FINNED OIL COOLER:
 *    - Mounted securely on front reduction gearbox / crankcase boss (X = 0.205, Y = 0.020, Z = 0.090).
 *    - 14 horizontal cooling fins, machined perimeter frame with 4 corner retention bolts.
 *    - Solid cast aluminum mounting boss connecting directly into the engine block with zero air gap.
 *    - Blue & red anodized aircraft AN-10 couplers.
 *
 * 2. SPIN-ON OIL FILTER (Part 26/23):
 *    - Positioned at FRONT-RIGHT, hanging vertically DIRECTLY BENEATH the front oil cooler
 *      (X = 0.205, Y = -0.050, Z = 0.088).
 *    - Black cylindrical canister with white silkscreen label and gold/brass hex drain nut at bottom.
 *    - Cast aluminum adapter boss bolted securely to the front gear housing.
 *
 * 3. REAR FINNED OIL COOLER:
 *    - Mounted on the rear accessory housing (X = -0.225, Y = 0.020, Z = 0.090).
 *    - Solid cast aluminum mounting boss backing the cooler flush to the rear accessory case.
 *    - Red & blue anodized AN-10 couplers and braided stainless scavenge line.
 */
export function buildLubricationSystem(materials) {
  const group = new THREE.Group();
  group.name = "LUBRICATION_SYSTEM";

  const { crankCenterY } = ENGINE;

  const frontCoolerX = 0.205;
  const rearCoolerX  = -0.225;
  const coolerY      = 0.020;
  const coolerZ      = 0.090;
  const coolerW      = 0.075;
  const coolerH      = 0.065;
  const coolerD      = 0.022;

  // ═══════════════════════════════════════════════════════════
  // 1. FRONT-RIGHT SPIN-ON OIL FILTER (Hanging under Front Cooler)
  // ═══════════════════════════════════════════════════════════
  const filterGroup = new THREE.Group();
  filterGroup.name = "OIL_FILTER";

  const filterX = frontCoolerX;
  const filterBaseY = -0.045;
  const filterZ = 0.085;
  const filterR = 0.024;
  const filterH = 0.064;

  // Cast mounting adapter boss interfacing directly with engine front casting
  const adapterGeo = new THREE.BoxGeometry(0.054, 0.016, 0.050);
  tagThermalGeometry(adapterGeo, 6, 0, 0, 0);
  const adapter = new THREE.Mesh(adapterGeo, materials.castAluminum);
  adapter.position.set(filterX, filterBaseY + 0.008, filterZ - 0.015);
  filterGroup.add(adapter);

  // Circular filter mounting collar
  const collarGeo = new THREE.CylinderGeometry(filterR + 0.003, filterR + 0.004, 0.008, 24);
  tagThermalGeometry(collarGeo, 6, 0, 0, 0);
  const collar = new THREE.Mesh(collarGeo, materials.machinedAluminum);
  collar.position.set(filterX, filterBaseY, filterZ);
  filterGroup.add(collar);

  // Filter canister body (black cylindrical housing with white silkscreen label)
  const canisterGeo = new THREE.CylinderGeometry(filterR, filterR, filterH, 24);
  tagThermalGeometry(canisterGeo, 6, 0, 0, 0);
  const canister = new THREE.Mesh(canisterGeo, materials.oilFilterCanister || materials.darkAnodized);
  canister.position.set(filterX, filterBaseY - 0.004 - filterH * 0.5, filterZ);
  canister.rotation.y = Math.PI * 0.5; // Label faces outward (+Z)
  canister.castShadow = true;
  filterGroup.add(canister);

  // Filter seal line
  const sealRingGeo = new THREE.TorusGeometry(filterR + 0.001, 0.0015, 6, 24);
  tagThermalGeometry(sealRingGeo, 6, 0, 0, 0);
  sealRingGeo.rotateX(Math.PI / 2);
  const sealRing = new THREE.Mesh(sealRingGeo, materials.blackRubber);
  sealRing.position.set(filterX, filterBaseY - 0.004, filterZ);
  filterGroup.add(sealRing);

  // Rounded bottom dome
  const bottomDomeGeo = new THREE.SphereGeometry(filterR, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5);
  tagThermalGeometry(bottomDomeGeo, 6, 0, 0, 0);
  const bottomDome = new THREE.Mesh(bottomDomeGeo, materials.darkAnodized);
  bottomDome.position.set(filterX, filterBaseY - 0.004 - filterH, filterZ);
  filterGroup.add(bottomDome);

  // Bottom gold/brass hex drain nut (prominent in reference photos)
  const drainNutGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.008, 6);
  tagThermalGeometry(drainNutGeo, 6, 0, 0, 0);
  const drainNut = new THREE.Mesh(drainNutGeo, materials.aviationBrass);
  drainNut.position.set(filterX, filterBaseY - 0.004 - filterH - 0.004, filterZ);
  filterGroup.add(drainNut);

  group.add(filterGroup);

  // ═══════════════════════════════════════════════════════════
  // 2. HELPER TO BUILD SOLID ENGINE-MOUNTED FINNED OIL COOLER
  // ═══════════════════════════════════════════════════════════
  function createFinnedOilCooler(coolerX, isFront) {
    const coolerSubGroup = new THREE.Group();
    coolerSubGroup.name = isFront ? "OIL_COOLER_FRONT" : "OIL_COOLER_REAR";

    // A. Solid Cast Aluminum Structural Mounting Boss (Connects directly into engine block)
    // Bridges Z = 0.045 to 0.079 with zero air gap
    const bossW = coolerW + 0.004;
    const bossH = coolerH * 0.85;
    const bossD = 0.036;
    const bossZ = coolerZ - coolerD * 0.5 - bossD * 0.5; // Centers at Z = 0.061

    const mountBossGeo = new THREE.BoxGeometry(bossW, bossH, bossD);
    tagThermalGeometry(mountBossGeo, 6, 0, 0, 0);
    const mountBoss = new THREE.Mesh(mountBossGeo, materials.castAluminum);
    mountBoss.position.set(coolerX, coolerY, bossZ);
    mountBoss.castShadow = true;
    coolerSubGroup.add(mountBoss);

    // Cast mounting flange ribs
    [-bossW * 0.40, bossW * 0.40].forEach((rx) => {
      const ribGeo = new THREE.BoxGeometry(0.008, bossH, bossD + 0.004);
      tagThermalGeometry(ribGeo, 6, 0, 0, 0);
      const rib = new THREE.Mesh(ribGeo, materials.machinedAluminum);
      rib.position.set(coolerX + rx, coolerY, bossZ);
      coolerSubGroup.add(rib);
    });

    // 4 Retention Hex Bolts securing cooler to engine boss
    [-bossW * 0.42, bossW * 0.42].forEach((bx) => {
      [-bossH * 0.40, bossH * 0.40].forEach((by) => {
        const b = createHexBolt(0.0028, 0.008, materials, 6);
        b.position.set(coolerX + bx, coolerY + by, coolerZ - coolerD * 0.5 + 0.002);
        b.rotation.x = Math.PI / 2;
        coolerSubGroup.add(b);
      });
    });

    // B. Main cooler body casting (weathered stamped matrix)
    const coolerBoxGeo = new THREE.BoxGeometry(coolerW, coolerH, coolerD);
    tagThermalGeometry(coolerBoxGeo, 6, 0, 0, 0);
    const coolerBox = new THREE.Mesh(coolerBoxGeo, materials.oilCooler);
    coolerBox.position.set(coolerX, coolerY, coolerZ);
    coolerBox.castShadow = true;
    coolerSubGroup.add(coolerBox);

    // C. Machined perimeter frame / mounting flange
    const frameGeo = new THREE.BoxGeometry(coolerW + 0.006, coolerH + 0.006, 0.004);
    tagThermalGeometry(frameGeo, 6, 0, 0, 0);
    const frame = new THREE.Mesh(frameGeo, materials.machinedAluminum);
    frame.position.set(coolerX, coolerY, coolerZ + coolerD * 0.5 + 0.002);
    coolerSubGroup.add(frame);

    // 4 corner mounting ears & hex bolts on front face
    [-coolerW * 0.44, coolerW * 0.44].forEach((cx) => {
      [-coolerH * 0.44, coolerH * 0.44].forEach((cy) => {
        const cb = createHexBolt(0.0022, 0.006, materials, 6);
        cb.position.set(coolerX + cx, coolerY + cy, coolerZ + coolerD * 0.5 + 0.004);
        cb.rotation.x = Math.PI / 2;
        coolerSubGroup.add(cb);
      });
    });

    // D. 14 horizontal cooling fins on cooler face (weathered stamped aluminum matrix)
    const finCount = 14;
    for (let i = 0; i < finCount; i++) {
      const fy = (coolerY - coolerH * 0.40) + (i / (finCount - 1)) * (coolerH * 0.80);
      const finGeo = new THREE.BoxGeometry(coolerW * 0.88, 0.0016, 0.006);
      tagThermalGeometry(finGeo, 6, 0, 0, 0);
      const fin = new THREE.Mesh(finGeo, materials.oilCooler);
      fin.position.set(coolerX, fy, coolerZ + coolerD * 0.5 + 0.003);
      coolerSubGroup.add(fin);
    }

    // E. Top and bottom AN-10 anodized fittings
    const fittingGeo = new THREE.CylinderGeometry(0.0065, 0.0065, 0.012, 6);
    tagThermalGeometry(fittingGeo, 6, 0, 0, 0);

    const topFitting = new THREE.Mesh(
      fittingGeo,
      isFront ? materials.anodizedBlue : materials.anodizedRed
    );
    topFitting.position.set(coolerX + (isFront ? 0.020 : -0.020), coolerY + coolerH * 0.5 + 0.006, coolerZ);
    coolerSubGroup.add(topFitting);

    const btmFitting = new THREE.Mesh(
      fittingGeo,
      isFront ? materials.anodizedRed : materials.anodizedBlue
    );
    btmFitting.position.set(coolerX - (isFront ? 0.020 : -0.020), coolerY - coolerH * 0.5 - 0.006, coolerZ);
    coolerSubGroup.add(btmFitting);

    return coolerSubGroup;
  }

  // ═══════════════════════════════════════════════════════════
  // 3. RIGHT-SIDE TWO FINNED OIL COOLERS (FRONT & REAR)
  // Cleanly framing the cascading 4-runner exhaust bundle with ZERO gaps
  // ═══════════════════════════════════════════════════════════
  const frontCooler = createFinnedOilCooler(frontCoolerX, true);
  group.add(frontCooler);

  const rearCooler = createFinnedOilCooler(rearCoolerX, false);
  group.add(rearCooler);

  // ═══════════════════════════════════════════════════════════
  // 4. RIGID BRAIDED STAINLESS OIL INTERCONNECT LINES
  // ═══════════════════════════════════════════════════════════
  // Line 1: Front Cooler bottom AN-10 port -> Oil Filter top adapter
  const frontOilLineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(frontCoolerX - 0.020, coolerY - coolerH * 0.5 - 0.006, coolerZ),
    new THREE.Vector3(frontCoolerX - 0.012, -0.025, coolerZ - 0.005),
    new THREE.Vector3(filterX, filterBaseY + 0.008, filterZ),
  ]);
  const frontOilLineGeo = new THREE.TubeGeometry(frontOilLineCurve, 14, 0.0045, 10, false);
  tagThermalGeometry(frontOilLineGeo, 6, 0, 0, 0);
  const frontOilLine = new THREE.Mesh(frontOilLineGeo, materials.mirrorStainless);
  group.add(frontOilLine);

  // Line 2: Rear Cooler bottom AN-10 port -> Crankcase main oil passage
  const rearOilLineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(rearCoolerX + 0.020, coolerY - coolerH * 0.5 - 0.006, coolerZ),
    new THREE.Vector3(rearCoolerX + 0.035, -0.020, coolerZ - 0.015),
    new THREE.Vector3(-0.160, crankCenterY + 0.010, 0.072),
  ]);
  const rearOilLineGeo = new THREE.TubeGeometry(rearOilLineCurve, 14, 0.0045, 10, false);
  tagThermalGeometry(rearOilLineGeo, 6, 0, 0, 0);
  const rearOilLine = new THREE.Mesh(rearOilLineGeo, materials.mirrorStainless);
  group.add(rearOilLine);

  // Brass AN-10 fitting at crankcase entrance
  const caseFitting = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0065, 0.0065, 0.010, 6),
    materials.aviationBrass
  );
  caseFitting.position.set(-0.160, crankCenterY + 0.010, 0.072);
  caseFitting.rotation.x = Math.PI / 2;
  group.add(caseFitting);

  return group;
}
