import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PARTS 20–22 & 25 — VRDE 180HP EXHAUST RUNNERS & LOWER MUFFLER CANISTER
 *
 * STRICTLY MATCHES VRDE 180HP REFERENCE PHOTOS (RIGHT SIDE VIEW & FRONT RIGHT VIEW):
 * - Exhaust ports originate DIRECTLY FROM CYLINDERS (mid-upper barrel wall, Y = 0.108m)
 *   with machined oval 2-stud flanges (NOT on top of the cylinder head!).
 * - 4 identical parallel cascading J-pipes sweeping OUTWARD (+Z), DOWNWARD (-Y),
 *   and REARWARD (-X) directly into the top of the champagne muffler canister.
 * - ZERO intermediate horizontal collector logs or cluttering ducts in the middle,
 *   creating deep, authentic hollow clearance through the midsection.
 * - Substantial satin champagne cylindrical muffler canister mounted below the exhaust bundle.
 * - Dual aviation brass retention bands and rigid mounting struts to the crankcase.
 */
export function buildExhaustSystem(materials) {
  const group = new THREE.Group();
  group.name = "EXHAUST_SYSTEM";

  const { cylinderConfigs, crankCenterY } = ENGINE;

  // Exhaust ports enter DIRECTLY INTO CYLINDER BARRELS (Y = 0.108m, Z = 0.048m)
  // Well below cylinder head fire-deck, leaving upper cylinders and rocker cover uncluttered
  const portY = 0.108;
  const portZ = 0.048;

  const pipeRadius = 0.0125;

  // Muffler canister geometry & placement
  const mufflerRadius = 0.038; // 76mm diameter canister
  const mufflerLength = 0.380; // spans X = -0.260 to +0.120
  const mufflerCenterX = -0.070;
  const mufflerY = -0.115;
  const mufflerZ = 0.145;
  const mufflerTopY = mufflerY + mufflerRadius; // -0.077m

  // ═══════════════════════════════════════════════════════════
  // 1. HIGH-DETAIL CYLINDER EXHAUST PORT INTERFACES & HARDWARE
  // Authentic aerospace multi-piece port assembly:
  // - Cast cylinder port spigot boss emerging from barrel fins
  // - Cast structural gusset web supporting the spigot from below
  // - High-temperature copper crush compression gasket ring
  // - Precision 2-ear diamond/oval header flange plate
  // - Dual aviation retention studs with hardened washers & lock-nuts
  // - Welded machined header spigot sleeve collar
  // - Circumferential bronze TIG weld bead
  // ═══════════════════════════════════════════════════════════
  cylinderConfigs.forEach((cfg) => {
    const portGroup = new THREE.Group();
    portGroup.name = `EXHAUST_PORT_ASSEMBLY_${cfg.num}`;

    // A. Cast cylinder port spigot boss emerging between cooling fins
    const bossGeo = new THREE.CylinderGeometry(0.021, 0.023, 0.010, 24);
    tagThermalGeometry(bossGeo, 4, cfg.num, 0, 0);
    bossGeo.rotateX(Math.PI / 2);
    const boss = new THREE.Mesh(bossGeo, materials.castAluminum);
    boss.position.set(cfg.x, portY, portZ + 0.005);
    portGroup.add(boss);

    // Structural underside reinforcing web/gusset linking boss into barrel wall
    const gussetGeo = new THREE.BoxGeometry(0.008, 0.016, 0.010);
    tagThermalGeometry(gussetGeo, 4, cfg.num, 0, 0);
    const gusset = new THREE.Mesh(gussetGeo, materials.castAluminum);
    gusset.position.set(cfg.x, portY - 0.012, portZ + 0.003);
    portGroup.add(gusset);

    // B. High-temperature copper compression crush gasket ring (tucked behind flange)
    const gasketGeo = new THREE.CylinderGeometry(0.0175, 0.0175, 0.0012, 24);
    tagThermalGeometry(gasketGeo, 4, cfg.num, 0, 0);
    gasketGeo.rotateX(Math.PI / 2);
    const gasket = new THREE.Mesh(gasketGeo, materials.copperWinding);
    gasket.position.set(cfg.x, portY, portZ + 0.0075);
    portGroup.add(gasket);

    // C. Precision 2-ear diamond/oval header flange plate (machined aircraft alloy)
    // Central circular hub collar around runner bore
    const flangeHubGeo = new THREE.CylinderGeometry(0.0185, 0.0185, 0.0055, 24);
    tagThermalGeometry(flangeHubGeo, 4, cfg.num, 0, 0);
    flangeHubGeo.rotateX(Math.PI / 2);
    const flangeHub = new THREE.Mesh(flangeHubGeo, materials.machinedAluminum);
    flangeHub.position.set(cfg.x, portY, portZ + 0.0105);
    portGroup.add(flangeHub);

    // Diamond lozenge base plate spanning left to right
    const flangeBodyGeo = new THREE.BoxGeometry(0.034, 0.020, 0.0055);
    tagThermalGeometry(flangeBodyGeo, 4, cfg.num, 0, 0);
    const flangeBody = new THREE.Mesh(flangeBodyGeo, materials.machinedAluminum);
    flangeBody.position.set(cfg.x, portY, portZ + 0.0105);
    portGroup.add(flangeBody);

    // Left and right rounded ear lobes with aviation studs & lock nuts
    [-0.017, 0.017].forEach((sx) => {
      const earGeo = new THREE.CylinderGeometry(0.0072, 0.0072, 0.0055, 16);
      tagThermalGeometry(earGeo, 4, cfg.num, 0, 0);
      earGeo.rotateX(Math.PI / 2);
      const ear = new THREE.Mesh(earGeo, materials.machinedAluminum);
      ear.position.set(cfg.x + sx, portY, portZ + 0.0105);
      portGroup.add(ear);

      // Recessed washer counterbore ring
      const counterboreGeo = new THREE.CylinderGeometry(0.0056, 0.0056, 0.0008, 16);
      tagThermalGeometry(counterboreGeo, 4, cfg.num, 0, 0);
      counterboreGeo.rotateX(Math.PI / 2);
      const counterbore = new THREE.Mesh(counterboreGeo, materials.darkAnodized);
      counterbore.position.set(cfg.x + sx, portY, portZ + 0.0133);
      portGroup.add(counterbore);

      // Hardened oil-quenched steel washer
      const washerGeo = new THREE.CylinderGeometry(0.0050, 0.0050, 0.0014, 16);
      tagThermalGeometry(washerGeo, 4, cfg.num, 0, 0);
      washerGeo.rotateX(Math.PI / 2);
      const washer = new THREE.Mesh(washerGeo, materials.darkAnodized);
      washer.position.set(cfg.x + sx, portY, portZ + 0.0142);
      portGroup.add(washer);

      // High-tensile zinc-plated aviation hex lock nut
      const nutGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.0042, 6);
      tagThermalGeometry(nutGeo, 4, cfg.num, 0, 0);
      nutGeo.rotateX(Math.PI / 2);
      const nut = new THREE.Mesh(nutGeo, materials.polishedChrome);
      nut.position.set(cfg.x + sx, portY, portZ + 0.0168);
      portGroup.add(nut);

      // Protruding threaded stud tip extending past the nut face
      const studGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.014, 12);
      tagThermalGeometry(studGeo, 4, cfg.num, 0, 0);
      studGeo.rotateX(Math.PI / 2);
      const stud = new THREE.Mesh(studGeo, materials.forgedSteel);
      stud.position.set(cfg.x + sx, portY, portZ + 0.0150);
      portGroup.add(stud);
    });

    // D. Welded header spigot collar neck protruding from flange face
    const spigotGeo = new THREE.CylinderGeometry(pipeRadius + 0.0025, pipeRadius + 0.0035, 0.006, 24);
    tagThermalGeometry(spigotGeo, 4, cfg.num, 0, 0);
    spigotGeo.rotateX(Math.PI / 2);
    const spigot = new THREE.Mesh(spigotGeo, materials.machinedAluminum);
    spigot.position.set(cfg.x, portY, portZ + 0.0155);
    portGroup.add(spigot);

    // E. Precision multi-pass aerospace TIG weld seam (heat-tempered straw/gunmetal, seamlessly matching runner)
    const weldGeo = new THREE.TorusGeometry(pipeRadius + 0.0008, 0.0009, 8, 28);
    tagThermalGeometry(weldGeo, 4, cfg.num, 0, 0);
    const weld = new THREE.Mesh(weldGeo, materials.tigWeldAlloy || materials.exhaustHeatBlued);
    weld.position.set(cfg.x, portY, portZ + 0.0185);
    portGroup.add(weld);

    group.add(portGroup);
  });

  // ═══════════════════════════════════════════════════════════
  // 2. 4 PARALLEL CASCADING J-SHAPED EXHAUST RUNNER PIPES
  // Sweeping OUTWARD (+Z to 0.124m), DOWNWARD (-Y), and REARWARD (-X by 0.070m)
  // Terminating DIRECTLY into the top of the champagne muffler canister
  // Leaving the entire midsection open and completely hollow
  // ═══════════════════════════════════════════════════════════
  const sweepDeltaX = -0.070; // uniform rearward cascade offset

  cylinderConfigs.forEach((cfg) => {
    const entryX = cfg.x + sweepDeltaX; // where runner enters the muffler canister top

    // Perpendicular straight lead-out for first 25mm, followed by downward & rearward sweep to outboard muffler
    const runnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cfg.x, portY, portZ + 0.012),
      new THREE.Vector3(cfg.x, portY, portZ + 0.035), // straight perpendicular run out of weld bead!
      new THREE.Vector3(cfg.x - 0.006, portY - 0.006, portZ + 0.070),
      new THREE.Vector3(cfg.x - 0.024, portY - 0.038, 0.138),
      new THREE.Vector3(cfg.x - 0.052, portY - 0.090, 0.146),
      new THREE.Vector3(entryX - 0.005, mufflerTopY + 0.035, mufflerZ + 0.004),
      new THREE.Vector3(entryX, mufflerTopY + 0.006, mufflerZ),
    ]);

    const runnerGeo = new THREE.TubeGeometry(runnerCurve, 32, pipeRadius, 20, false);
    tagThermalGeometry(runnerGeo, 4, cfg.num, 0, 0);
    const runnerMesh = new THREE.Mesh(runnerGeo, materials.exhaustHeatBlued);
    runnerMesh.castShadow = true;
    group.add(runnerMesh);

    // ── Refined Aerospace Exhaust Runner Slip-Joint Retention Clamp Assembly ──
    // Precision roll-formed stainless sleeve with stamped clamping ears, tensioning bolt, brass lock nut, and safety wire
    const clampT = 0.42; // Upper mid-bend section visible in reference photo
    const clampPos = runnerCurve.getPointAt(clampT);
    const tangent = runnerCurve.getTangentAt(clampT).normalize();

    // Orthonormal coordinate frame: tangent along pipe, binormal pointing outward towards viewer (+Z)
    const approxOut = new THREE.Vector3(0, 0.25, 0.96).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, approxOut).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();
    const rotMatrix = new THREE.Matrix4().makeBasis(normal, tangent, binormal);

    const clampGroup = new THREE.Group();
    clampGroup.name = `RUNNER_${cfg.num}_SLIP_CLAMP`;
    clampGroup.position.copy(clampPos);
    clampGroup.setRotationFromMatrix(rotMatrix);

    // 1. Roll-formed stainless sleeve body (weathered satin stainless, matches pipe temperature)
    const sleeveMat = materials.mirrorStainless || materials.machinedAluminum;
    const sleeveGeo = new THREE.CylinderGeometry(pipeRadius + 0.0016, pipeRadius + 0.0016, 0.011, 24);
    tagThermalGeometry(sleeveGeo, 4, cfg.num, 0, 0);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveMesh.castShadow = true;
    clampGroup.add(sleeveMesh);

    // Roll-formed beaded rims at top and bottom of the sleeve
    [-0.0045, 0.0045].forEach((rimY) => {
      const rimGeo = new THREE.TorusGeometry(pipeRadius + 0.0017, 0.0006, 6, 24);
      tagThermalGeometry(rimGeo, 4, cfg.num, 0, 0);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, sleeveMat);
      rimMesh.position.y = rimY;
      clampGroup.add(rimMesh);
    });

    // Central thermal expansion slip seam
    const seamGeo = new THREE.TorusGeometry(pipeRadius + 0.0017, 0.0003, 4, 24);
    tagThermalGeometry(seamGeo, 4, cfg.num, 0, 0);
    seamGeo.rotateX(Math.PI / 2);
    const seamMesh = new THREE.Mesh(seamGeo, materials.darkAnodized);
    clampGroup.add(seamMesh);

    // 2. Dual Stamped Sheet-Metal Tensioning Clamp Ears (facing outward on +Z face)
    const earZ = pipeRadius + 0.0022;
    const earMat = materials.forgedSteel || sleeveMat;
    [-0.0018, 0.0018].forEach((ox) => {
      const earGeo = new THREE.BoxGeometry(0.0016, 0.0068, 0.0036);
      tagThermalGeometry(earGeo, 4, cfg.num, 0, 0);
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.set(ox, 0, earZ);
      clampGroup.add(ear);
    });

    // 3. Tensioning T-Bolt Cross Stud
    const boltGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0080, 10);
    tagThermalGeometry(boltGeo, 4, cfg.num, 0, 0);
    boltGeo.rotateZ(Math.PI / 2);
    const boltMesh = new THREE.Mesh(boltGeo, materials.machinedAluminum || sleeveMat);
    boltMesh.position.set(0, 0, earZ);
    clampGroup.add(boltMesh);

    // 4. Aviation Brass Locking Hex Nut (tightened against right ear)
    const nutGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0022, 6);
    tagThermalGeometry(nutGeo, 4, cfg.num, 0, 0);
    nutGeo.rotateZ(Math.PI / 2);
    const nutMesh = new THREE.Mesh(nutGeo, materials.aviationBrass);
    nutMesh.position.set(0.0032, 0, earZ);
    clampGroup.add(nutMesh);

    // 5. Stainless Safety Wire Lock Loop (cross-drilled through bolt head)
    const wireGeo = new THREE.TorusGeometry(0.0010, 0.00025, 4, 12);
    tagThermalGeometry(wireGeo, 4, cfg.num, 0, 0);
    wireGeo.rotateY(Math.PI / 2);
    const wireMesh = new THREE.Mesh(wireGeo, materials.mirrorStainless);
    wireMesh.position.set(-0.0035, 0, earZ);
    clampGroup.add(wireMesh);

    group.add(clampGroup);

    // Aviation brass entry ferrule collar where runner enters muffler canister
    const collarGeo = new THREE.CylinderGeometry(pipeRadius + 0.004, pipeRadius + 0.005, 0.006, 20);
    tagThermalGeometry(collarGeo, 4, cfg.num, 0, 0);
    const collar = new THREE.Mesh(collarGeo, materials.aviationBrass);
    collar.position.set(entryX, mufflerTopY + 0.003, mufflerZ);
    group.add(collar);
  });

  // ═══════════════════════════════════════════════════════════
  // 3. SUBSTANTIAL LOWER SATIN CHAMPAGNE MUFFLER CANISTER (Part 25)
  // Horizontal cylinder spanning under the engine matching RIGHT SIDE VIEW
  // ═══════════════════════════════════════════════════════════
  const mufflerGeo = new THREE.CylinderGeometry(mufflerRadius, mufflerRadius, mufflerLength, 32);
  tagThermalGeometry(mufflerGeo, 4, 0, 0, 0);
  mufflerGeo.rotateZ(Math.PI / 2);
  const mufflerMesh = new THREE.Mesh(mufflerGeo, materials.mufflerSilencer);
  mufflerMesh.position.set(mufflerCenterX, mufflerY, mufflerZ);
  mufflerMesh.castShadow = true;
  group.add(mufflerMesh);

  // Front domed end cap (+X towards propeller)
  const frontDomeGeo = new THREE.SphereGeometry(mufflerRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  tagThermalGeometry(frontDomeGeo, 4, 0, 0, 0);
  frontDomeGeo.rotateZ(-Math.PI / 2);
  const frontDome = new THREE.Mesh(frontDomeGeo, materials.mufflerSilencer);
  frontDome.position.set(mufflerCenterX + mufflerLength * 0.5, mufflerY, mufflerZ);
  group.add(frontDome);

  // Rear conical collector end cone transitioning to open exhaust tailpipe (-X towards rear)
  const coneLength = 0.035;
  const rearConeGeo = new THREE.CylinderGeometry(0.024, mufflerRadius, coneLength, 28, 1, true);
  tagThermalGeometry(rearConeGeo, 4, 0, 0, 0);
  rearConeGeo.rotateZ(Math.PI / 2);
  const rearConeMesh = new THREE.Mesh(rearConeGeo, materials.mufflerSilencer);
  rearConeMesh.position.set(mufflerCenterX - mufflerLength * 0.5 - coneLength * 0.5, mufflerY, mufflerZ);
  group.add(rearConeMesh);

  // Dual Golden Brass Clamping Retention Bands (matching photo positions)
  const bandXPositions = [mufflerCenterX + 0.095, mufflerCenterX - 0.095];
  bandXPositions.forEach((bx) => {
    // Scorched heat oxidation collar ring beneath each retention band
    const scorchRingGeo = new THREE.CylinderGeometry(mufflerRadius + 0.0008, mufflerRadius + 0.0008, 0.024, 32);
    tagThermalGeometry(scorchRingGeo, 4, 0, 0, 0);
    scorchRingGeo.rotateZ(Math.PI / 2);
    const scorchRing = new THREE.Mesh(scorchRingGeo, materials.forgedSteel);
    scorchRing.position.set(bx, mufflerY, mufflerZ);
    group.add(scorchRing);

    // Primary aged aeronautical brass retention band
    const bandGeo = new THREE.CylinderGeometry(mufflerRadius + 0.0025, mufflerRadius + 0.0025, 0.012, 32);
    tagThermalGeometry(bandGeo, 4, 0, 0, 0);
    bandGeo.rotateZ(Math.PI / 2);
    const band = new THREE.Mesh(bandGeo, materials.aviationBrass);
    band.position.set(bx, mufflerY, mufflerZ);
    group.add(band);

    const clampBolt = createHexBolt(0.003, 0.010, materials, 4);
    clampBolt.position.set(bx, mufflerTopY + 0.004, mufflerZ);
    group.add(clampBolt);

    // Support bracket securing muffler band back to crankcase lower flange
    const strutGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.065, 12);
    tagThermalGeometry(strutGeo, 4, 0, 0, 0);
    strutGeo.rotateX(Math.PI / 3.0);
    const strut = new THREE.Mesh(strutGeo, materials.forgedSteel);
    strut.position.set(bx, mufflerY + 0.018, mufflerZ - 0.040);
    group.add(strut);
  });

  // ═══════════════════════════════════════════════════════════
  // 4. AUTHENTIC HOLLOW EXHAUST TAILPIPE (OPEN GAS EXIT APERTURE)
  // Open-ended heat-blued tube with dark soot bore and rolled lip
  // ═══════════════════════════════════════════════════════════
  const pipeX = mufflerCenterX - mufflerLength * 0.5 - coneLength - 0.018;
  const pipeLength = 0.040;
  const pipeRadiusOuter = 0.024;
  const pipeRadiusInner = 0.0215;

  // Outer heat-tempered exhaust pipe (open-ended cylinder)
  const tailpipeOuterGeo = new THREE.CylinderGeometry(pipeRadiusOuter, pipeRadiusOuter, pipeLength, 28, 1, true);
  tagThermalGeometry(tailpipeOuterGeo, 4, 0, 0, 0);
  tailpipeOuterGeo.rotateZ(Math.PI / 2);
  const tailpipeOuter = new THREE.Mesh(tailpipeOuterGeo, materials.exhaustHeatBlued);
  tailpipeOuter.position.set(pipeX, mufflerY, mufflerZ);
  tailpipeOuter.castShadow = true;
  group.add(tailpipeOuter);

  // Inner charred dark carbon-soot bore liner (open-ended cylinder)
  const tailpipeInnerGeo = new THREE.CylinderGeometry(pipeRadiusInner, pipeRadiusInner, pipeLength, 28, 1, true);
  tagThermalGeometry(tailpipeInnerGeo, 4, 0, 0, 0);
  tailpipeInnerGeo.rotateZ(Math.PI / 2);
  const tailpipeInner = new THREE.Mesh(tailpipeInnerGeo, materials.darkAnodized);
  tailpipeInner.position.set(pipeX, mufflerY, mufflerZ);
  group.add(tailpipeInner);

  // Deep dark internal soot chamber floor visible down the hollow throat
  const deepBaffleGeo = new THREE.CircleGeometry(pipeRadiusInner, 24);
  tagThermalGeometry(deepBaffleGeo, 4, 0, 0, 0);
  deepBaffleGeo.rotateY(-Math.PI / 2);
  const deepBaffle = new THREE.Mesh(deepBaffleGeo, materials.darkAnodized);
  deepBaffle.position.set(pipeX + pipeLength * 0.5 - 0.002, mufflerY, mufflerZ);
  group.add(deepBaffle);

  // Rolled aero lip ring at exit rim
  const exitLipGeo = new THREE.TorusGeometry(pipeRadiusOuter, 0.0016, 8, 28);
  tagThermalGeometry(exitLipGeo, 4, 0, 0, 0);
  exitLipGeo.rotateY(Math.PI / 2);
  const exitLip = new THREE.Mesh(exitLipGeo, materials.finGlintSilver || materials.machinedAluminum);
  exitLip.position.set(pipeX - pipeLength * 0.5, mufflerY, mufflerZ);
  group.add(exitLip);

  return group;
}
