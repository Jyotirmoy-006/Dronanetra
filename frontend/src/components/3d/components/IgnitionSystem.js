import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE } from "../VRDE180Utilities";

/**
 * PART 18 — IGNITION COILS (4x), SPARK PLUGS & HT LEADS
 *
 * STRICTLY MATCHES ASSEMBLED REFERENCE IMAGES (Front-Right & Right Side):
 * - 4 individual coil-on-plug ignition units mounted directly into the top
 *   of the rocker cover (X = cfg.x, Y = 0.312, Z = 0.000).
 * - Black cylindrical coil pack bodies with red silicone insulated upper towers.
 * - Heavy red HT leads drop directly into sealed spark plug boots inside the head.
 * - Black woven wiring harness connects all 4 coils along a rigid conduit trunk
 *   anchored directly to the rocker cover clips, running back into the ECU terminal.
 * - ZERO loose or floating wires.
 */
export function buildIgnitionSystem(materials) {
  const group = new THREE.Group();
  group.name = "IGNITION_SYSTEM";

  const { cylinderConfigs, rockerCoverTopY, headTopY, crankCenterY } = ENGINE;
  const coilMountY = rockerCoverTopY; // Top surface of rocker cover

  // ═══════════════════════════════════════════════════════════
  // 1. 4 INDIVIDUAL COIL-ON-PLUG PACKS & SPARK PLUG LEADS
  // ═══════════════════════════════════════════════════════════
  cylinderConfigs.forEach((cfg) => {
    const coilGroup = new THREE.Group();
    coilGroup.position.set(cfg.x, coilMountY, 0);

    // A. Coil lower base collar (seated into rocker cover top recess)
    const collarGeo = new THREE.CylinderGeometry(0.016, 0.018, 0.006, 20);
    tagThermalGeometry(collarGeo, 3, cfg.num, 0, 0);
    const collar = new THREE.Mesh(collarGeo, materials.machinedAluminum);
    collar.position.y = 0.003;
    coilGroup.add(collar);

    // B. Coil body (dark epoxy cylinder)
    const bodyGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.018, 20);
    tagThermalGeometry(bodyGeo, 3, cfg.num, 0, 0);
    const body = new THREE.Mesh(bodyGeo, materials.ecuBlack);
    body.position.y = 0.014;
    body.castShadow = true;
    coilGroup.add(body);

    // C. Red silicone terminal cap (visible on top of coils in photo)
    const capGeo = new THREE.CylinderGeometry(0.012, 0.014, 0.006, 16);
    tagThermalGeometry(capGeo, 3, cfg.num, 0, 0);
    const cap = new THREE.Mesh(capGeo, materials.redSilicone);
    cap.position.y = 0.025;
    coilGroup.add(cap);

    // D. Low-voltage electrical connector block
    const connGeo = new THREE.BoxGeometry(0.010, 0.008, 0.010);
    tagThermalGeometry(connGeo, 3, cfg.num, 0, 0);
    const conn = new THREE.Mesh(connGeo, materials.darkAnodized);
    conn.position.set(0, 0.016, -0.016);
    coilGroup.add(conn);

    // E. High-Tension (HT) Lead dropping down to Spark Plug in the head
    const htLeadCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(cfg.x, coilMountY + 0.016, 0.012),
      new THREE.Vector3(cfg.x, coilMountY + 0.004, 0.020),
      new THREE.Vector3(cfg.x, coilMountY - 0.012, 0.024),
    ]);
    const htGeo = new THREE.TubeGeometry(htLeadCurve, 10, 0.003, 10, false);
    tagThermalGeometry(htGeo, 3, cfg.num, 0, 0);
    const htLead = new THREE.Mesh(htGeo, materials.ignitionWire);
    group.add(htLead);

    // F. Red silicone spark plug boot at plug well
    const bootGeo = new THREE.CylinderGeometry(0.006, 0.005, 0.012, 12);
    tagThermalGeometry(bootGeo, 3, cfg.num, 0, 0);
    bootGeo.rotateX(0.2);
    const boot = new THREE.Mesh(bootGeo, materials.redSilicone);
    boot.position.set(cfg.x, coilMountY - 0.012, 0.024);
    group.add(boot);

    group.add(coilGroup);
  });

  // ═══════════════════════════════════════════════════════════
  // 2. MAIN LOW-VOLTAGE IGNITION HARNESS TRUNK
  // Runs along top back of rocker cover, connecting each coil
  // directly into the top Mil-Spec connector of the ECU — ZERO loose wires
  // ═══════════════════════════════════════════════════════════
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3( 0.150, coilMountY + 0.016, -0.020), // Coil 1
    new THREE.Vector3( 0.050, coilMountY + 0.016, -0.020), // Coil 2
    new THREE.Vector3(-0.050, coilMountY + 0.016, -0.020), // Coil 3
    new THREE.Vector3(-0.150, coilMountY + 0.016, -0.020), // Coil 4
    new THREE.Vector3(-0.185, coilMountY + 0.008, -0.022), // Snug over rear rocker cover lip
    new THREE.Vector3(-0.204, 0.185, -0.024),              // Anchored to rear cylinder head boss
    new THREE.Vector3(-0.215, 0.158, -0.024),              // Lead-in to ECU top connector boot
    new THREE.Vector3(-0.218, 0.148, -0.024),              // Plugs directly into ECU top Mil-Spec socket!
  ]);
  const trunkGeo = new THREE.TubeGeometry(trunkCurve, 28, 0.004, 10, false);
  tagThermalGeometry(trunkGeo, 3, 0, 0, 0);
  const trunk = new THREE.Mesh(trunkGeo, materials.ignitionHarness);
  trunk.castShadow = true;
  group.add(trunk);

  // Harness P-clamps holding trunk firmly against rocker cover
  [-0.090, 0, 0.090].forEach((px) => {
    const clampGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.006, 10);
    tagThermalGeometry(clampGeo, 3, 0, 0, 0);
    clampGeo.rotateZ(Math.PI / 2);
    const clamp = new THREE.Mesh(clampGeo, materials.machinedAluminum);
    clamp.position.set(px, coilMountY + 0.016, -0.022);
    group.add(clamp);
  });

  // Additional rear bulkhead P-clamp securing harness to head casting
  const rearClampGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.007, 10);
  tagThermalGeometry(rearClampGeo, 3, 0, 0, 0);
  rearClampGeo.rotateX(Math.PI / 2);
  const rearClamp = new THREE.Mesh(rearClampGeo, materials.machinedAluminum);
  rearClamp.position.set(-0.204, 0.185, -0.024);
  group.add(rearClamp);

  return group;
}
