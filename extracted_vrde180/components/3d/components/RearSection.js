import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PARTS 25–26 — REAR SECTION
 *
 * VRDE 180HP AERO ENGINE REAR ARCHITECTURE:
 * 1. CENTRAL FLYWHEEL / STARTER-GENERATOR DRIVE INTERFACE:
 *    - Large circular cast aluminum perimeter flange ring with 20 high-tensile hex bolts.
 *    - Recessed stepped faceplate disc with 8 radial stiffening ribs.
 *    - Central protruding cylindrical hub boss with deep recessed pilot socket bore.
 *    - Rotating drive hub spins synchronously with propeller.
 *
 * 2. REAR BULKHEAD ACCESSORY: RECTANGULAR BLACK FADEC ECU MODULE:
 *    - Mounted securely on the rear crankcase accessory shelf (X = -0.228, Y = 0.082)
 *      via dual cast aluminum mounting bracket arms bolted directly to the engine block.
 *    - Completely frees the rocker cover and cylinder tops.
 *    - Black anodized heatsink fins, golden distribution rail with aviation red caps,
 *      side-mounted Mil-Spec Deutsch connector, and amber diagnostic badge.
 */


export function buildRearSection(materials) {
  const group = new THREE.Group();
  group.name = "REAR_SECTION";

  const { crankCenterY, rearAccessoryX } = ENGINE;

  // Reference origin for all rear accessory hardware
  const rearX = rearAccessoryX - 0.015;

  // ═══════════════════════════════════════════════════════════
  // 1. CENTRAL CIRCULAR DRIVE FACEPLATE & PILOT HUB ASSEMBLY
  // ═══════════════════════════════════════════════════════════
  const drivePlateGroup = new THREE.Group();
  drivePlateGroup.name = "REAR_DRIVE_PLATE_ASSEMBLY";
  drivePlateGroup.position.set(rearX, crankCenterY, 0);

  // A. Heavy outer mounting ring / perimeter flange (machined aluminum) - STATIONARY
  const outerFlangeGeo = new THREE.CylinderGeometry(0.128, 0.128, 0.024, 48);
  tagThermalGeometry(outerFlangeGeo, 14, 0, 0, 0);
  outerFlangeGeo.rotateZ(Math.PI / 2);
  const outerFlange = new THREE.Mesh(outerFlangeGeo, materials.machinedAluminum);
  outerFlange.castShadow = true;
  drivePlateGroup.add(outerFlange);

  // 20 perimeter high-tensile hex bolts with hardened steel washers
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * Math.PI * 2;
    const boltRadius = 0.118;
    const by = Math.sin(a) * boltRadius;
    const bz = Math.cos(a) * boltRadius;

    // Hardened washer
    const washerGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.0016, 12);
    tagThermalGeometry(washerGeo, 14, 0, 0, 0);
    washerGeo.rotateZ(Math.PI / 2);
    const washer = new THREE.Mesh(washerGeo, materials.darkAnodized);
    washer.position.set(-0.0125, by, bz);
    drivePlateGroup.add(washer);

    // Aviation hex bolt (polished chrome/steel)
    const bolt = createHexBolt(0.0036, 0.010, materials, 14);
    bolt.position.set(-0.014, by, bz);
    bolt.rotation.z = Math.PI / 2;
    drivePlateGroup.add(bolt);
  }



  // B. Recessed stepped faceplate disc (machined aluminum) - STATIONARY
  const innerDiscGeo = new THREE.CylinderGeometry(0.110, 0.110, 0.012, 48);
  tagThermalGeometry(innerDiscGeo, 14, 0, 0, 0);
  innerDiscGeo.rotateZ(Math.PI / 2);
  const innerDisc = new THREE.Mesh(innerDiscGeo, materials.machinedAluminum);
  innerDisc.position.x = -0.005;
  innerDisc.castShadow = true;
  drivePlateGroup.add(innerDisc);

  // Concentric diagnostic index ring on faceplate
  const indexRingGeo = new THREE.TorusGeometry(0.090, 0.0018, 8, 48);
  tagThermalGeometry(indexRingGeo, 14, 0, 0, 0);
  indexRingGeo.rotateY(Math.PI / 2);
  const indexRing = new THREE.Mesh(indexRingGeo, materials.concentricScanRing);
  indexRing.position.x = -0.012;
  indexRing.userData.isConcentricRing = true;
  drivePlateGroup.add(indexRing);

  // C. 8 Radial structural stiffener ribs radiating from hub to outer rim - STATIONARY
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const ribGeo = new THREE.BoxGeometry(0.009, 0.008, 0.052);
    tagThermalGeometry(ribGeo, 14, 0, 0, 0);
    const rib = new THREE.Mesh(ribGeo, materials.machinedAluminum);
    rib.position.set(-0.010, Math.sin(a) * 0.070, Math.cos(a) * 0.070);
    rib.rotation.x = -a;
    drivePlateGroup.add(rib);
  }

  // Intermediate circle of 8 hex studs - STATIONARY
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const by = Math.sin(a) * 0.076;
    const bz = Math.cos(a) * 0.076;
    const stud = createHexBolt(0.0030, 0.008, materials, 14);
    stud.position.set(-0.012, by, bz);
    stud.rotation.z = Math.PI / 2;
    drivePlateGroup.add(stud);
  }

  // ═══════════════════════════════════════════════════════════
  // ROTATING CENTRAL DRIVE ASSEMBLY (Spins synchronously with propeller)
  // The central power take-off (PTO) drive collar circled by the user:
  // Protruding cylindrical hub, bright machined collar with 4 drive dowels,
  // central recessed socket bore, and polished lip
  // ═══════════════════════════════════════════════════════════
  const rearRotatingHub = new THREE.Group();
  rearRotatingHub.name = "REAR_ROTATING_DRIVE_HUB";

  // D. Central protruding rotating drive hub & pilot socket
  const hubOuterGeo = new THREE.CylinderGeometry(0.042, 0.042, 0.038, 36);
  tagThermalGeometry(hubOuterGeo, 14, 0, 0, 0);
  hubOuterGeo.rotateZ(Math.PI / 2);
  const hubOuter = new THREE.Mesh(hubOuterGeo, materials.machinedAluminum);
  hubOuter.position.x = -0.025;
  hubOuter.castShadow = true;
  rearRotatingHub.add(hubOuter);

  // Stepped pilot collar (The prominent white/silver circular component circled in cyan!)
  const collarGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.014, 36);
  tagThermalGeometry(collarGeo, 14, 0, 0, 0);
  collarGeo.rotateZ(Math.PI / 2);
  const collar = new THREE.Mesh(collarGeo, materials.finGlintSilver);
  collar.position.x = -0.044;
  rearRotatingHub.add(collar);

  // Central deep dark recessed socket bore
  const boreGeo = new THREE.CylinderGeometry(0.020, 0.020, 0.034, 28);
  tagThermalGeometry(boreGeo, 14, 0, 0, 0);
  boreGeo.rotateZ(Math.PI / 2);
  const bore = new THREE.Mesh(boreGeo, materials.forgedSteel);
  bore.position.x = -0.032;
  rearRotatingHub.add(bore);

  // Center chamfered spindle lip
  const lipGeo = new THREE.TorusGeometry(0.020, 0.0024, 8, 28);
  tagThermalGeometry(lipGeo, 14, 0, 0, 0);
  lipGeo.rotateY(Math.PI / 2);
  const lip = new THREE.Mesh(lipGeo, materials.polishedChrome);
  lip.position.x = -0.051;
  rearRotatingHub.add(lip);

  // Drive pins / socket dowels on the collar face (makes rotation strikingly visible!)
  for (let p = 0; p < 4; p++) {
    const pa = (p / 4) * Math.PI * 2;
    const pinGeo = new THREE.CylinderGeometry(0.0035, 0.0035, 0.006, 16);
    tagThermalGeometry(pinGeo, 14, 0, 0, 0);
    pinGeo.rotateZ(Math.PI / 2);
    const pin = new THREE.Mesh(pinGeo, materials.darkAnodized);
    pin.position.set(-0.050, Math.sin(pa) * 0.029, Math.cos(pa) * 0.029);
    rearRotatingHub.add(pin);
  }

  drivePlateGroup.add(rearRotatingHub);
  group.userData.rearDriveHub = rearRotatingHub;

  group.add(drivePlateGroup);



  // ═══════════════════════════════════════════════════════════
  // 2. REAR BULKHEAD ACCESSORY: FLUSH INTEGRATED FADEC ECU SYSTEM
  // Mounted neatly and securely on the rear engine bulkhead / crankcase upper deck
  // (X = -0.218, Y = 0.122, Z = 0) — comfortably clear of the circular flywheel (Y <= 0.053)
  // Perfectly flush, structurally integrated with 4 vibration isolators,
  // and directly receiving the ignition wiring harness with zero gaps.
  // ═══════════════════════════════════════════════════════════
  const ecuGroup = new THREE.Group();
  ecuGroup.name = "REAR_ACCESSORY_ECU_SYSTEM";
  ecuGroup.position.set(-0.218, 0.122, 0);

  // A. Compact Billet Aerospace ECU Enclosure (Black Anodized 6061-T6)
  const ecuBoxW = 0.034; // X thickness (fits neatly between cylinder block and flywheel)
  const ecuBoxH = 0.040; // Y height (spans Y = 0.102 to 0.142, well above flywheel outer rim)
  const ecuBoxD = 0.088; // Z width (spans Z = -0.044 to +0.044, within engine block width)
  const ecuBoxGeo = new THREE.BoxGeometry(ecuBoxW, ecuBoxH, ecuBoxD);
  tagThermalGeometry(ecuBoxGeo, 14, 0, 0, 0);
  const ecuBox = new THREE.Mesh(ecuBoxGeo, materials.ecuBlack);
  ecuBox.castShadow = true;
  ecuGroup.add(ecuBox);

  // Beveled perimeter bezel on rear face (-X face)
  const bezelGeo = new THREE.BoxGeometry(0.003, ecuBoxH - 0.006, ecuBoxD - 0.006);
  tagThermalGeometry(bezelGeo, 14, 0, 0, 0);
  const bezel = new THREE.Mesh(bezelGeo, materials.darkAnodized);
  bezel.position.set(-ecuBoxW * 0.5 - 0.001, 0, 0);
  ecuGroup.add(bezel);

  // Precision CNC heatsink cooling fins along the top of ECU
  for (let f = -3; f <= 3; f++) {
    const finGeo = new THREE.BoxGeometry(ecuBoxW - 0.004, 0.005, 0.0022);
    tagThermalGeometry(finGeo, 14, 0, 0, 0);
    const fin = new THREE.Mesh(finGeo, materials.ecuBlack);
    fin.position.set(0, ecuBoxH * 0.5 + 0.0025, f * 0.011);
    ecuGroup.add(fin);
  }

  // B. Structural CNC-Machined Aluminum Mounting Cradle & Lord Vibration Isolators
  // Heavy cast/billet mounting shelf extending forward to bolt into engine block
  const shelfGeo = new THREE.BoxGeometry(0.040, 0.008, ecuBoxD + 0.012);
  tagThermalGeometry(shelfGeo, 14, 0, 0, 0);
  const shelf = new THREE.Mesh(shelfGeo, materials.castAluminum);
  shelf.position.set(0.010, -ecuBoxH * 0.5 - 0.004, 0);
  shelf.castShadow = true;
  ecuGroup.add(shelf);

  // 4 Elastomeric Lord-Mount vibration isolation dampers at corners
  [-0.038, 0.038].forEach((dz) => {
    [-0.010, 0.010].forEach((dx) => {
      // Rubber isolator bushing
      const bushGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.006, 12);
      tagThermalGeometry(bushGeo, 14, 0, 0, 0);
      const bush = new THREE.Mesh(bushGeo, materials.blackRubber);
      bush.position.set(dx, -ecuBoxH * 0.5 - 0.003, dz);
      ecuGroup.add(bush);

      // Stainless retention bolt with hardened washer
      const bolt = createHexBolt(0.0024, 0.008, materials, 14);
      bolt.position.set(dx, -ecuBoxH * 0.5 - 0.006, dz);
      ecuGroup.add(bolt);
    });
  });

  // Sturdy structural bracket webs linking cradle forward into engine casing
  [-0.036, 0.036].forEach((bz) => {
    const gussetGeo = new THREE.BoxGeometry(0.022, 0.020, 0.008);
    tagThermalGeometry(gussetGeo, 14, 0, 0, 0);
    const gusset = new THREE.Mesh(gussetGeo, materials.castAluminum);
    gusset.position.set(0.024, -ecuBoxH * 0.5 - 0.012, bz);
    ecuGroup.add(gusset);

    const blockBolt = createHexBolt(0.0030, 0.008, materials, 14);
    blockBolt.position.set(0.033, -ecuBoxH * 0.5 - 0.012, bz);
    blockBolt.rotation.z = Math.PI / 2;
    ecuGroup.add(blockBolt);
  });

  // Copper grounding strap bridging ECU casing to block
  const strapGeo = new THREE.BoxGeometry(0.024, 0.002, 0.006);
  tagThermalGeometry(strapGeo, 14, 0, 0, 0);
  const strap = new THREE.Mesh(strapGeo, materials.copperWinding);
  strap.position.set(0.016, -ecuBoxH * 0.5 + 0.004, -ecuBoxD * 0.5 - 0.002);
  ecuGroup.add(strap);

  // C. Mil-Spec Deutsch Connector Sockets
  // 1. TOP CONNECTOR: Receives the ignition harness trunk directly (ZERO loose wires!)
  const topConnGeo = new THREE.CylinderGeometry(0.007, 0.0075, 0.012, 16);
  tagThermalGeometry(topConnGeo, 14, 0, 0, 0);
  const topConn = new THREE.Mesh(topConnGeo, materials.machinedAluminum);
  topConn.position.set(0, ecuBoxH * 0.5 + 0.006, -0.024);
  ecuGroup.add(topConn);

  // Top knurled lock collar
  const topLockGeo = new THREE.TorusGeometry(0.0078, 0.0012, 6, 16);
  tagThermalGeometry(topLockGeo, 14, 0, 0, 0);
  topLockGeo.rotateX(Math.PI / 2);
  const topLock = new THREE.Mesh(topLockGeo, materials.darkAnodized);
  topLock.position.set(0, ecuBoxH * 0.5 + 0.008, -0.024);
  ecuGroup.add(topLock);

  // Rubber weather-seal boot
  const bootGeo = new THREE.CylinderGeometry(0.0055, 0.0068, 0.006, 16);
  tagThermalGeometry(bootGeo, 14, 0, 0, 0);
  const boot = new THREE.Mesh(bootGeo, materials.blackRubber);
  boot.position.set(0, ecuBoxH * 0.5 + 0.013, -0.024);
  ecuGroup.add(boot);

  // 2. SIDE CONNECTOR: Mil-Spec 24-Pin Main Aircraft Avionics Bus (+Z side)
  const sideConnGeo = new THREE.CylinderGeometry(0.0085, 0.009, 0.014, 16);
  tagThermalGeometry(sideConnGeo, 14, 0, 0, 0);
  sideConnGeo.rotateX(Math.PI / 2);
  const sideConn = new THREE.Mesh(sideConnGeo, materials.machinedAluminum);
  sideConn.position.set(0, -0.004, ecuBoxD * 0.5 + 0.007);
  ecuGroup.add(sideConn);

  const sideLockRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.0094, 0.0014, 6, 16),
    materials.darkAnodized
  );
  sideLockRing.position.set(0, -0.004, ecuBoxD * 0.5 + 0.011);
  ecuGroup.add(sideLockRing);

  // D. Professional DRDO VRDE FADEC Identification Plate & Status LEDs
  // Stainless laser-etched data plate on rear face
  const plateGeo = new THREE.PlaneGeometry(0.038, 0.020);
  tagThermalGeometry(plateGeo, 14, 0, 0, 0);
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.35,
    metalness: 0.85,
  });
  const plate = new THREE.Mesh(plateGeo, plateMat);
  plate.position.set(-ecuBoxW * 0.5 - 0.002, 0.002, 0);
  plate.rotation.y = -Math.PI / 2;
  ecuGroup.add(plate);

  // Gold emblem foil inside badge
  const badgeInsignia = new THREE.Mesh(
    new THREE.PlaneGeometry(0.032, 0.008),
    materials.aviationBrass
  );
  badgeInsignia.position.set(-ecuBoxW * 0.5 - 0.0025, 0.005, 0);
  badgeInsignia.rotation.y = -Math.PI / 2;
  ecuGroup.add(badgeInsignia);

  // Status Indicator LEDs (Green Power LED, Amber CAN Activity LED)
  const pwrLedGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.002, 10);
  tagThermalGeometry(pwrLedGeo, 14, 0, 0, 0);
  pwrLedGeo.rotateZ(Math.PI / 2);
  const pwrLedMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    emissive: 0x22c55e,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const pwrLed = new THREE.Mesh(pwrLedGeo, pwrLedMat);
  pwrLed.position.set(-ecuBoxW * 0.5 - 0.002, -0.006, -0.010);
  ecuGroup.add(pwrLed);

  const canLedGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.002, 10);
  tagThermalGeometry(canLedGeo, 14, 0, 0, 0);
  canLedGeo.rotateZ(Math.PI / 2);
  const canLedMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.8,
    roughness: 0.2,
  });
  const canLed = new THREE.Mesh(canLedGeo, canLedMat);
  canLed.position.set(-ecuBoxW * 0.5 - 0.002, -0.006, 0.010);
  ecuGroup.add(canLed);

  group.add(ecuGroup);

  return group;
}
