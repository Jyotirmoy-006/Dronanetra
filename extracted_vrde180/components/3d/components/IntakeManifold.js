import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PART 15 & 19 — VRDE 180HP INTAKE SYSTEM & INDUCTION CANISTER
 *
 * STRICTLY MATCHES VRDE 180HP ARCHITECTURE:
 * - Intake ports enter DIRECTLY INTO CYLINDERS (mid-upper barrel wall, Y = 0.108m, Z = -0.048m)
 *   with machined oval 2-stud flanges (NOT on top of the cylinder head!).
 * - 4 identical parallel cascading J-pipes sweeping OUTWARD (-Z), DOWNWARD (-Y),
 *   and REARWARD (-X) directly into the top of the lower canister.
 * - Entire mid-section is completely open and hollow, mirroring the exhaust side.
 * - Lower tuned intake silencer/resonator canister with dual brass retention bands.
 * - Subtle concentric diagnostic scan rings with reduced opacity.
 * - Rear auxiliary electronic module with gold DRDO insignia badge at X = -0.225m.
 */
export function buildIntakeManifold(materials) {
  const group = new THREE.Group();
  group.name = "INTAKE_MANIFOLD_AND_COVERS";

  const { cylinderConfigs } = ENGINE;

  // Intake ports enter DIRECTLY INTO CYLINDER BARRELS (Y = 0.108m, Z = -0.048m)
  // Well below cylinder head fire-deck, leaving upper cylinders and rocker cover uncluttered
  const portY = 0.108;
  const portZ = -0.048;

  const pipeRadius = 0.0125;

  // Lower cylindrical canister geometry & placement (-Z side)
  const canisterRadius = 0.038; // 76mm diameter canister
  const canisterLength = 0.380; // spans X = -0.260 to +0.120
  const canisterCenterX = -0.070;
  const canisterY = -0.115;
  const canisterZ = -0.145;
  const canisterTopY = canisterY + canisterRadius; // -0.077m

  // ═══════════════════════════════════════════════════════════
  // 1. HIGH-DETAIL CYLINDER INTAKE PORT INTERFACES & HARDWARE
  // Authentic aerospace multi-piece port assembly:
  // - Cast cylinder port spigot boss emerging from barrel fins (-Z)
  // - Cast structural gusset web supporting the spigot from below
  // - High-temperature compression gasket ring
  // - Precision 2-ear diamond/oval header flange plate
  // - Dual aviation retention studs with hardened washers & lock-nuts
  // - Welded machined header spigot sleeve collar
  // - Circumferential bronze TIG weld bead
  // ═══════════════════════════════════════════════════════════
  cylinderConfigs.forEach((cfg) => {
    const portGroup = new THREE.Group();
    portGroup.name = `INTAKE_PORT_ASSEMBLY_${cfg.num}`;

    // A. Cast cylinder port spigot boss emerging between cooling fins (-Z)
    const bossGeo = new THREE.CylinderGeometry(0.021, 0.023, 0.010, 24);
    tagThermalGeometry(bossGeo, 6, cfg.num, 0, 0);
    bossGeo.rotateX(-Math.PI / 2);
    const boss = new THREE.Mesh(bossGeo, materials.castAluminum);
    boss.position.set(cfg.x, portY, portZ - 0.005);
    portGroup.add(boss);

    // Structural underside reinforcing web/gusset linking boss into barrel wall
    const gussetGeo = new THREE.BoxGeometry(0.008, 0.016, 0.010);
    tagThermalGeometry(gussetGeo, 6, cfg.num, 0, 0);
    const gusset = new THREE.Mesh(gussetGeo, materials.castAluminum);
    gusset.position.set(cfg.x, portY - 0.012, portZ - 0.003);
    portGroup.add(gusset);

    // B. High-temperature compression crush gasket ring (tucked behind flange)
    const gasketGeo = new THREE.CylinderGeometry(0.0175, 0.0175, 0.0012, 24);
    tagThermalGeometry(gasketGeo, 6, cfg.num, 0, 0);
    gasketGeo.rotateX(-Math.PI / 2);
    const gasket = new THREE.Mesh(gasketGeo, materials.copperWinding);
    gasket.position.set(cfg.x, portY, portZ - 0.0075);
    portGroup.add(gasket);

    // C. Precision 2-ear diamond/oval header flange plate (machined aircraft alloy)
    // Central circular hub collar around runner bore
    const flangeHubGeo = new THREE.CylinderGeometry(0.0185, 0.0185, 0.0055, 24);
    tagThermalGeometry(flangeHubGeo, 6, cfg.num, 0, 0);
    flangeHubGeo.rotateX(-Math.PI / 2);
    const flangeHub = new THREE.Mesh(flangeHubGeo, materials.machinedAluminum);
    flangeHub.position.set(cfg.x, portY, portZ - 0.0105);
    portGroup.add(flangeHub);

    // Diamond lozenge base plate spanning left to right
    const flangeBodyGeo = new THREE.BoxGeometry(0.034, 0.020, 0.0055);
    tagThermalGeometry(flangeBodyGeo, 6, cfg.num, 0, 0);
    const flangeBody = new THREE.Mesh(flangeBodyGeo, materials.machinedAluminum);
    flangeBody.position.set(cfg.x, portY, portZ - 0.0105);
    portGroup.add(flangeBody);

    // Left and right rounded ear lobes with aviation studs & lock nuts
    [-0.017, 0.017].forEach((sx) => {
      const earGeo = new THREE.CylinderGeometry(0.0072, 0.0072, 0.0055, 16);
      tagThermalGeometry(earGeo, 6, cfg.num, 0, 0);
      earGeo.rotateX(-Math.PI / 2);
      const ear = new THREE.Mesh(earGeo, materials.machinedAluminum);
      ear.position.set(cfg.x + sx, portY, portZ - 0.0105);
      portGroup.add(ear);

      // Recessed washer counterbore ring
      const counterboreGeo = new THREE.CylinderGeometry(0.0056, 0.0056, 0.0008, 16);
      tagThermalGeometry(counterboreGeo, 6, cfg.num, 0, 0);
      counterboreGeo.rotateX(-Math.PI / 2);
      const counterbore = new THREE.Mesh(counterboreGeo, materials.darkAnodized);
      counterbore.position.set(cfg.x + sx, portY, portZ - 0.0133);
      portGroup.add(counterbore);

      // Hardened oil-quenched steel washer
      const washerGeo = new THREE.CylinderGeometry(0.0050, 0.0050, 0.0014, 16);
      tagThermalGeometry(washerGeo, 6, cfg.num, 0, 0);
      washerGeo.rotateX(-Math.PI / 2);
      const washer = new THREE.Mesh(washerGeo, materials.darkAnodized);
      washer.position.set(cfg.x + sx, portY, portZ - 0.0142);
      portGroup.add(washer);

      // High-tensile zinc-plated aviation hex lock nut
      const nutGeo = new THREE.CylinderGeometry(0.0040, 0.0040, 0.0042, 6);
      tagThermalGeometry(nutGeo, 6, cfg.num, 0, 0);
      nutGeo.rotateX(-Math.PI / 2);
      const nut = new THREE.Mesh(nutGeo, materials.polishedChrome);
      nut.position.set(cfg.x + sx, portY, portZ - 0.0168);
      portGroup.add(nut);

      // Protruding threaded stud tip extending past the nut face
      const studGeo = new THREE.CylinderGeometry(0.0022, 0.0022, 0.014, 12);
      tagThermalGeometry(studGeo, 6, cfg.num, 0, 0);
      studGeo.rotateX(-Math.PI / 2);
      const stud = new THREE.Mesh(studGeo, materials.forgedSteel);
      stud.position.set(cfg.x + sx, portY, portZ - 0.0150);
      portGroup.add(stud);
    });

    // D. Welded header spigot collar neck protruding from flange face
    const spigotGeo = new THREE.CylinderGeometry(pipeRadius + 0.0025, pipeRadius + 0.0035, 0.006, 24);
    tagThermalGeometry(spigotGeo, 6, cfg.num, 0, 0);
    spigotGeo.rotateX(-Math.PI / 2);
    const spigot = new THREE.Mesh(spigotGeo, materials.machinedAluminum);
    spigot.position.set(cfg.x, portY, portZ - 0.0155);
    portGroup.add(spigot);

    // E. Precision multi-pass aerospace TIG weld seam (heat-tempered straw/gunmetal, seamlessly matching runner)
    const weldGeo = new THREE.TorusGeometry(pipeRadius + 0.0008, 0.0009, 8, 28);
    tagThermalGeometry(weldGeo, 6, cfg.num, 0, 0);
    const weld = new THREE.Mesh(weldGeo, materials.tigWeldAlloy || materials.exhaustHeatBlued);
    weld.position.set(cfg.x, portY, portZ - 0.0185);
    portGroup.add(weld);

    group.add(portGroup);
  });

  // ═══════════════════════════════════════════════════════════
  // 2. 4 PARALLEL CASCADING J-SHAPED INTAKE RUNNER PIPES
  // Sweeping OUTWARD (-Z to -0.124m), DOWNWARD (-Y), and REARWARD (-X by 0.070m)
  // Terminating DIRECTLY into the top of the lower canister
  // Leaving the entire midsection open and completely hollow
  // ═══════════════════════════════════════════════════════════
  const sweepDeltaX = -0.070; // uniform rearward cascade offset

  cylinderConfigs.forEach((cfg) => {
    const entryX = cfg.x + sweepDeltaX; // where runner enters the lower canister top

    // Perpendicular straight lead-out for first 25mm, followed by downward & rearward sweep to outboard canister
    const runnerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cfg.x, portY, portZ - 0.012),
      new THREE.Vector3(cfg.x, portY, portZ - 0.035), // straight perpendicular run out of weld bead!
      new THREE.Vector3(cfg.x - 0.006, portY - 0.006, portZ - 0.070),
      new THREE.Vector3(cfg.x - 0.024, portY - 0.038, -0.138),
      new THREE.Vector3(cfg.x - 0.052, portY - 0.090, -0.146),
      new THREE.Vector3(entryX - 0.005, canisterTopY + 0.035, canisterZ - 0.004),
      new THREE.Vector3(entryX, canisterTopY + 0.006, canisterZ),
    ]);

    const runnerGeo = new THREE.TubeGeometry(runnerCurve, 32, pipeRadius, 20, false);
    tagThermalGeometry(runnerGeo, 6, cfg.num, 0, 0);
    const runnerMesh = new THREE.Mesh(runnerGeo, materials.exhaustHeatBlued);
    runnerMesh.castShadow = true;
    group.add(runnerMesh);

    // ── Refined Aerospace Intake Runner Slip-Joint Retention Clamp Assembly ──
    // Precision roll-formed stainless sleeve with stamped clamping ears, tensioning bolt, brass lock nut, and safety wire
    const clampT = 0.42; // Upper mid-bend section visible on induction side
    const clampPos = runnerCurve.getPointAt(clampT);
    const tangent = runnerCurve.getTangentAt(clampT).normalize();

    // Orthonormal coordinate frame: tangent along pipe, binormal pointing outward towards induction viewer (-Z)
    const approxOut = new THREE.Vector3(0, 0.25, -0.96).normalize();
    const normal = new THREE.Vector3().crossVectors(tangent, approxOut).normalize();
    const binormal = new THREE.Vector3().crossVectors(normal, tangent).normalize();
    const rotMatrix = new THREE.Matrix4().makeBasis(normal, tangent, binormal);

    const clampGroup = new THREE.Group();
    clampGroup.name = `INTAKE_RUNNER_${cfg.num}_SLIP_CLAMP`;
    clampGroup.position.copy(clampPos);
    clampGroup.setRotationFromMatrix(rotMatrix);

    // 1. Roll-formed stainless sleeve body (weathered satin stainless, matches pipe temperature)
    const sleeveMat = materials.mirrorStainless || materials.machinedAluminum;
    const sleeveGeo = new THREE.CylinderGeometry(pipeRadius + 0.0016, pipeRadius + 0.0016, 0.011, 24);
    tagThermalGeometry(sleeveGeo, 6, cfg.num, 0, 0);
    const sleeveMesh = new THREE.Mesh(sleeveGeo, sleeveMat);
    sleeveMesh.castShadow = true;
    clampGroup.add(sleeveMesh);

    // Roll-formed beaded rims at top and bottom of the sleeve
    [-0.0045, 0.0045].forEach((rimY) => {
      const rimGeo = new THREE.TorusGeometry(pipeRadius + 0.0017, 0.0006, 6, 24);
      tagThermalGeometry(rimGeo, 6, cfg.num, 0, 0);
      rimGeo.rotateX(Math.PI / 2);
      const rimMesh = new THREE.Mesh(rimGeo, sleeveMat);
      rimMesh.position.y = rimY;
      clampGroup.add(rimMesh);
    });

    // Central thermal expansion slip seam
    const seamGeo = new THREE.TorusGeometry(pipeRadius + 0.0017, 0.0003, 4, 24);
    tagThermalGeometry(seamGeo, 6, cfg.num, 0, 0);
    seamGeo.rotateX(Math.PI / 2);
    const seamMesh = new THREE.Mesh(seamGeo, materials.darkAnodized);
    clampGroup.add(seamMesh);

    // 2. Dual Stamped Sheet-Metal Tensioning Clamp Ears (facing outward towards induction viewer)
    const earZ = pipeRadius + 0.0022;
    const earMat = materials.forgedSteel || sleeveMat;
    [-0.0018, 0.0018].forEach((ox) => {
      const earGeo = new THREE.BoxGeometry(0.0016, 0.0068, 0.0036);
      tagThermalGeometry(earGeo, 6, cfg.num, 0, 0);
      const ear = new THREE.Mesh(earGeo, earMat);
      ear.position.set(ox, 0, earZ);
      clampGroup.add(ear);
    });

    // 3. Tensioning T-Bolt Cross Stud
    const boltGeo = new THREE.CylinderGeometry(0.0008, 0.0008, 0.0080, 10);
    tagThermalGeometry(boltGeo, 6, cfg.num, 0, 0);
    boltGeo.rotateZ(Math.PI / 2);
    const boltMesh = new THREE.Mesh(boltGeo, materials.machinedAluminum || sleeveMat);
    boltMesh.position.set(0, 0, earZ);
    clampGroup.add(boltMesh);

    // 4. Aviation Brass Locking Hex Nut (tightened against right ear)
    const nutGeo = new THREE.CylinderGeometry(0.0016, 0.0016, 0.0022, 6);
    tagThermalGeometry(nutGeo, 6, cfg.num, 0, 0);
    nutGeo.rotateZ(Math.PI / 2);
    const nutMesh = new THREE.Mesh(nutGeo, materials.aviationBrass);
    nutMesh.position.set(0.0032, 0, earZ);
    clampGroup.add(nutMesh);

    // 5. Stainless Safety Wire Lock Loop (cross-drilled through bolt head)
    const wireGeo = new THREE.TorusGeometry(0.0010, 0.00025, 4, 12);
    tagThermalGeometry(wireGeo, 6, cfg.num, 0, 0);
    wireGeo.rotateY(Math.PI / 2);
    const wireMesh = new THREE.Mesh(wireGeo, materials.mirrorStainless);
    wireMesh.position.set(-0.0035, 0, earZ);
    clampGroup.add(wireMesh);

    group.add(clampGroup);

    // Aviation brass entry ferrule collar where runner enters lower canister
    const collarGeo = new THREE.CylinderGeometry(pipeRadius + 0.004, pipeRadius + 0.005, 0.006, 20);
    tagThermalGeometry(collarGeo, 6, cfg.num, 0, 0);
    const collar = new THREE.Mesh(collarGeo, materials.aviationBrass);
    collar.position.set(entryX, canisterTopY + 0.003, canisterZ);
    group.add(collar);
  });

  // ═══════════════════════════════════════════════════════════
  // 3. SUBSTANTIAL LOWER SATIN CHAMPAGNE CANISTER
  // Horizontal cylinder spanning under the engine matching assembled views
  // ═══════════════════════════════════════════════════════════
  const canisterGeo = new THREE.CylinderGeometry(canisterRadius, canisterRadius, canisterLength, 32);
  tagThermalGeometry(canisterGeo, 6, 0, 0, 0);
  canisterGeo.rotateZ(Math.PI / 2);
  const canisterMesh = new THREE.Mesh(canisterGeo, materials.mufflerSilencer);
  canisterMesh.position.set(canisterCenterX, canisterY, canisterZ);
  canisterMesh.castShadow = true;
  group.add(canisterMesh);

  // Front domed end cap (+X towards propeller)
  const frontDomeGeo = new THREE.SphereGeometry(canisterRadius, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
  tagThermalGeometry(frontDomeGeo, 6, 0, 0, 0);
  frontDomeGeo.rotateZ(-Math.PI / 2);
  const frontDome = new THREE.Mesh(frontDomeGeo, materials.mufflerSilencer);
  frontDome.position.set(canisterCenterX + canisterLength * 0.5, canisterY, canisterZ);
  group.add(frontDome);

  // Rear conical collector end cone transitioning to open hollow exhaust tailpipe (-X towards rear)
  const coneLength = 0.035;
  const rearConeGeo = new THREE.CylinderGeometry(0.024, canisterRadius, coneLength, 28, 1, true);
  tagThermalGeometry(rearConeGeo, 6, 0, 0, 0);
  rearConeGeo.rotateZ(Math.PI / 2);
  const rearConeMesh = new THREE.Mesh(rearConeGeo, materials.mufflerSilencer);
  rearConeMesh.position.set(canisterCenterX - canisterLength * 0.5 - coneLength * 0.5, canisterY, canisterZ);
  group.add(rearConeMesh);

  // ═══════════════════════════════════════════════════════════
  // 4. AUTHENTIC HOLLOW EXHAUST TAILPIPE (OPEN GAS EXIT APERTURE - LEFT CANISTER)
  // Matching open-ended heat-blued tube with dark soot bore and rolled lip
  // ═══════════════════════════════════════════════════════════
  const pipeX = canisterCenterX - canisterLength * 0.5 - coneLength - 0.018;
  const pipeLength = 0.040;
  const pipeRadiusOuter = 0.024;
  const pipeRadiusInner = 0.0215;

  // Outer heat-tempered exhaust pipe (open-ended cylinder)
  const tailpipeOuterGeo = new THREE.CylinderGeometry(pipeRadiusOuter, pipeRadiusOuter, pipeLength, 28, 1, true);
  tagThermalGeometry(tailpipeOuterGeo, 6, 0, 0, 0);
  tailpipeOuterGeo.rotateZ(Math.PI / 2);
  const tailpipeOuter = new THREE.Mesh(tailpipeOuterGeo, materials.exhaustHeatBlued);
  tailpipeOuter.position.set(pipeX, canisterY, canisterZ);
  tailpipeOuter.castShadow = true;
  group.add(tailpipeOuter);

  // Inner charred dark carbon-soot bore liner (open-ended cylinder)
  const tailpipeInnerGeo = new THREE.CylinderGeometry(pipeRadiusInner, pipeRadiusInner, pipeLength, 28, 1, true);
  tagThermalGeometry(tailpipeInnerGeo, 6, 0, 0, 0);
  tailpipeInnerGeo.rotateZ(Math.PI / 2);
  const tailpipeInner = new THREE.Mesh(tailpipeInnerGeo, materials.darkAnodized);
  tailpipeInner.position.set(pipeX, canisterY, canisterZ);
  group.add(tailpipeInner);

  // Deep dark internal soot chamber floor visible down the hollow throat
  const deepBaffleGeo = new THREE.CircleGeometry(pipeRadiusInner, 24);
  tagThermalGeometry(deepBaffleGeo, 6, 0, 0, 0);
  deepBaffleGeo.rotateY(-Math.PI / 2);
  const deepBaffle = new THREE.Mesh(deepBaffleGeo, materials.darkAnodized);
  deepBaffle.position.set(pipeX + pipeLength * 0.5 - 0.002, canisterY, canisterZ);
  group.add(deepBaffle);

  // Rolled aero lip ring at exit rim
  const exitLipGeo = new THREE.TorusGeometry(pipeRadiusOuter, 0.0016, 8, 28);
  tagThermalGeometry(exitLipGeo, 6, 0, 0, 0);
  exitLipGeo.rotateY(Math.PI / 2);
  const exitLip = new THREE.Mesh(exitLipGeo, materials.finGlintSilver || materials.machinedAluminum);
  exitLip.position.set(pipeX - pipeLength * 0.5, canisterY, canisterZ);
  group.add(exitLip);

  // Dual Golden Brass Clamping Retention Bands
  const bandXPositions = [canisterCenterX + 0.095, canisterCenterX - 0.095];
  bandXPositions.forEach((bx) => {
    const bandGeo = new THREE.CylinderGeometry(canisterRadius + 0.0025, canisterRadius + 0.0025, 0.012, 32);
    tagThermalGeometry(bandGeo, 6, 0, 0, 0);
    bandGeo.rotateZ(Math.PI / 2);
    const band = new THREE.Mesh(bandGeo, materials.aviationBrass);
    band.position.set(bx, canisterY, canisterZ);
    group.add(band);

    const clampBolt = createHexBolt(0.003, 0.010, materials, 6);
    clampBolt.position.set(bx, canisterTopY + 0.004, canisterZ);
    group.add(clampBolt);

    // Support bracket securing canister band back to crankcase lower flange
    const strutGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.065, 12);
    tagThermalGeometry(strutGeo, 6, 0, 0, 0);
    strutGeo.rotateX(-Math.PI / 3.0);
    const strut = new THREE.Mesh(strutGeo, materials.forgedSteel);
    strut.position.set(bx, canisterY + 0.018, canisterZ + 0.040);
    group.add(strut);
  });

  // Concentric diagnostic index rings on canister with reduced opacity
  [-0.050, 0.050].forEach((cx, cIdx) => {
    const ringGeo = new THREE.TorusGeometry(canisterRadius + 0.0015, 0.0016, 6, 32);
    tagThermalGeometry(ringGeo, 6, 0, 0, 0);
    ringGeo.rotateY(Math.PI / 2);
    const ring = new THREE.Mesh(ringGeo, materials.concentricScanRing);
    ring.position.set(canisterCenterX + cx, canisterY, canisterZ);
    ring.userData.isConcentricRing = true;
    ring.name = `INTAKE_CANISTER_CONCENTRIC_${cIdx}`;
    group.add(ring);
  });

  return group;
}
