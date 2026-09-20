import * as THREE from "three";
import { thermalUniforms } from "./AerospaceThermalShader";
import { createStudioEnvironment, createVRDEMaterials } from "./VRDE180Materials";
import { ENGINE, registerComponent } from "./VRDE180Utilities";

// ── 15 MODULAR COMPONENT BUILDERS (PARTS 1–30 FROM DRDO VRDE 180HP BLUEPRINT) ──
import { buildPropellerAssembly } from "./components/PropellerAssembly";
import { buildReductionGearbox } from "./components/ReductionGearbox";
import { buildCrankcase } from "./components/Crankcase";
import { buildCrankshaft } from "./components/Crankshaft";
import { buildPistonAssembly } from "./components/PistonAssembly";
import { buildCylinderBarrels } from "./components/CylinderBarrels";
import { buildCylinderHead } from "./components/CylinderHead";
import { buildRockerCover } from "./components/RockerCover";
import { buildIntakeManifold } from "./components/IntakeManifold";
import { buildFuelSystem } from "./components/FuelSystem";
import { buildIgnitionSystem } from "./components/IgnitionSystem";
import { buildExhaustSystem } from "./components/ExhaustSystem";
import { buildLubricationSystem } from "./components/LubricationSystem";
import { buildRearSection } from "./components/RearSection";
import { buildMountingBrackets } from "./components/MountingBrackets";

/**
 * VRDE 180HP AERO ENGINE — 4-CYLINDER INLINE 4-STROKE PISTON AIRCRAFT ENGINE
 * MASTER 3D DIGITAL TWIN MODEL BUILDER
 *
 * STRICTLY REBUILT WITH MODULAR COMPONENT-FIRST ARCHITECTURE:
 * - 30 Individual Components built according to the DRDO VRDE master blueprint
 *   and photographic assembled references.
 * - Monolithic engraved Rocker Cover on top with DRDO VRDE insignia.
 * - Golden brass Fuel Rail & 4 red Fuel Injectors spanning the very top.
 * - 4 individual dark-anodized cooling finned Cylinder Barrels (28+ fins each).
 * - Exhaust headers sweep DOWNWARD into the bottom-mounted silencer/muffler.
 * - Front-bottom vertical spin-on oil filter with gold drain nut.
 * - Right-side finned oil cooler with solid AN-10 fittings.
 * - 4-blade carbon composite propeller with aerodynamic twist and white tips.
 * - ZERO loose wires or floating hoses: all lines terminate at physical connectors.
 *
 * KINEMATICS & DIAGNOSTICS:
 * - Full 1-3-4-2 firing order slider-crank reciprocation (strictly vertical UP/DOWN).
 * - Crankshaft longitudinal rotation along X.
 * - 1.6:1 reduction gear propeller rotation.
 * - 0% to 100% continuous exploded view disassembly along authentic mechanical vectors.
 * - Compatible with Assembly, Monochromatic X-Ray, Continuous FLIR, and Holographic modes.
 */
export function buildVRDE180Engine() {
  const envMap = createStudioEnvironment();
  const materials = createVRDEMaterials(envMap);

  const root = new THREE.Group();
  root.name = "VRDE180_AERO_ENGINE_DIGITAL_TWIN";

  const components = new Map();

  // ═════════════════════════════════════════════════════════════════════════
  // 1. FRONT END: PROPELLER & REDUCTION GEARBOX (Parts 1–5)
  // ═════════════════════════════════════════════════════════════════════════

  // Parts 1–3: Propeller Assembly (Spinner, 4 Composite Blades, Hub)
  const propData = buildPropellerAssembly(materials);
  const propGroup = propData.group;
  registerComponent(components, propGroup, {
    partId: "propeller_assembly",
    name: "4-BLADE COMPOSITE PROPELLER & SPINNER",
    subsystem: "PROPULSION",
    disassemblyVector: new THREE.Vector3(0.40, 0, 0),
    sensors: ["prop_rpm", "prop_thrust", "blade_pitch_angle"],
    nominalRange: { rpm: "1800–2200 RPM", thrust: "240–320 kgf" },
    defaultTemp: 38,
    defaultVib: 0.8,
    description: "High-efficiency 4-blade carbon fiber composite propeller with aerodynamic twist, white visibility tips, polished spinner cone, and 6-bolt retention hub driven via 1.6:1 reduction ratio.",
    recommendedAction: "Inspect blade leading edges for erosion, verify hub torque at 50-hour inspection.",
    subParts: [
      "Aerodynamic Carbon-Composite Airfoil Blades (4x)",
      "Polished Parabolic Spinner Nose Cone",
      "Signature Cyan LED Navigation/Illumination Ring",
      "Forged Aluminum Propeller Retention Hub",
      "Aviation Grade-8 Propeller Flange Bolts (6x)",
    ],
  });
  root.add(propGroup);

  // Parts 4–5: Reduction Gearbox & Front Housing
  const gearboxGroup = buildReductionGearbox(materials);
  registerComponent(components, gearboxGroup, {
    partId: "reduction_gearbox",
    name: "1.6:1 REDUCTION GEARBOX & FRONT HOUSING",
    subsystem: "TRANSMISSION",
    disassemblyVector: new THREE.Vector3(0.22, 0, 0),
    sensors: ["gearbox_temp", "gearbox_oil_press", "gear_mesh_vib"],
    nominalRange: { temp: "70–95°C", oilPress: "3.5–5.0 bar", vib: "0.8–1.8 mm/s" },
    defaultTemp: 78,
    defaultVib: 1.1,
    description: "Multi-disc concentric housing containing 1.6:1 helical reduction gearset, thrust bearings, radial stiffening ribs, perimeter bolt flanges, and front propeller drive output shaft.",
    recommendedAction: "Monitor gear mesh acoustic harmonics and check magnetic drain plug for ferrous debris.",
    subParts: [
      "Machined Aluminum Front Reduction Housing",
      "1.6:1 Nitrided Steel Helical Gearset",
      "Heavy-Duty Dual-Row Tapered Roller Thrust Bearings",
      "Output Shaft Viton Dynamic Oil Seal",
      "Perimeter M8 Hex Fasteners (20x)",
    ],
  });
  root.add(gearboxGroup);

  // ═════════════════════════════════════════════════════════════════════════
  // 2. CRANKTRAIN & STRUCTURE (Parts 6–12)
  // ═════════════════════════════════════════════════════════════════════════

  // Part 8: Lower Crankcase / Sump
  const crankcaseGroup = buildCrankcase(materials);
  registerComponent(components, crankcaseGroup, {
    partId: "crankcase_lower",
    name: "CAST ALUMINUM CRANKCASE & OIL SUMP",
    subsystem: "STRUCTURE",
    disassemblyVector: new THREE.Vector3(0, -0.22, 0),
    sensors: ["crankcase_press", "sump_oil_temp", "crankcase_vib"],
    nominalRange: { temp: "75–100°C", press: "-0.05 to +0.02 bar", vib: "1.0–2.2 mm/s" },
    defaultTemp: 82,
    defaultVib: 1.3,
    description: "Split-line high-tensile cast aluminum-silicon crankcase with lateral cross-bolted main bearing webs, deep baffled wet sump, and brass magnetic oil drain plug.",
    recommendedAction: "Check crankcase blowby pressure, inspect sump gasket perimeter for weeping.",
    subParts: [
      "A356-T6 Aluminum-Silicon Lower Case Casting",
      "5 Cross-Bolted Main Bearing Bulkhead Webs",
      "Internal Anti-Slosh Oil Baffle Trays",
      "Magnetic Aviation Brass Sump Drain Plug",
      "Perimeter M8 Split-Line Flange Fasteners",
    ],
  });
  root.add(crankcaseGroup);

  // Parts 6, 7, 9: Crankshaft, Main Bearings & Timing Gears
  const crankshaftGroup = buildCrankshaft(materials);
  registerComponent(components, crankshaftGroup, {
    partId: "crankshaft",
    name: "4340 FORGED STEEL CRANKSHAFT",
    subsystem: "CRANKTRAIN",
    disassemblyVector: new THREE.Vector3(0, 0, 0), // Core reference axis
    sensors: ["crank_angle_sensor", "main_bearing_temp", "crank_torsional_vib"],
    nominalRange: { temp: "80–105°C", vib: "1.0–2.5 mm/s" },
    defaultTemp: 88,
    defaultVib: 1.2,
    description: "Precision-machined 4340 nitrided forged steel crankshaft with 4 cross-plane counterweighted throws, 5 micro-finished main bearing journals, cross-drilled oil passages, front timing gear, and rear flywheel flange.",
    recommendedAction: "Inspect main bearing journal clearances and verify crankshaft runout.",
    subParts: [
      "4340 Forged Nitrided Steel Main Shaft",
      "Precision Counterweight Lobes with Lightening Bores",
      "Cross-Drilled Hydrodynamic Journal Lubrication Galleries",
      "Front Crankshaft Timing Spur Gear",
      "Rear 6-Bolt Flywheel Coupling Flange",
    ],
  });
  root.add(crankshaftGroup);

  // Parts 10–12: Pistons (4x), Connecting Rods (4x), Piston Rings (4x)
  const pistonAssembly = buildPistonAssembly(materials);
  const { pistonNodes, rodNodes } = pistonAssembly;

  // Add individual pistons and rods to root & register them for individual diagnostics & exploded view
  pistonNodes.forEach((pNode, idx) => {
    const cylNum = idx + 1;
    registerComponent(components, pNode.mesh, {
      partId: `piston_${cylNum}`,
      name: `FORGED SLIPPER PISTON CYLINDER #${cylNum}`,
      subsystem: "COMBUSTION",
      disassemblyVector: new THREE.Vector3(0, 0.18 + idx * 0.02, 0),
      sensors: [`piston_temp_${cylNum}`, `crown_heat_flux_${cylNum}`],
      nominalRange: { temp: "135–180°C" },
      defaultTemp: cylNum === 3 ? 148 : 142,
      defaultVib: 1.2,
      description: `2618-T6 forged aluminum slipper piston for cylinder #${cylNum} with CNC combustion bowl, valve relief pockets, 3-ring pack, MoS2 anti-scuff skirts, and full-floating gudgeon pin.`,
      recommendedAction: "Measure piston ring end gap and skirt clearance at 100-hour overhaul.",
      subParts: [
        "2618-T6 Forged Aluminum Piston Crown & Swirl Bowl",
        "Top Nitrided Steel Compression Ring",
        "Napier Taper-Faced Scraper Ring",
        "Three-Piece Stainless Steel Oil Control Ring",
        "DLC-Coated Tool Steel Floating Wrist Pin",
      ],
    });
    root.add(pNode.mesh);
  });

  rodNodes.forEach((rNode, idx) => {
    const cylNum = idx + 1;
    registerComponent(components, rNode.mesh, {
      partId: `con_rod_${cylNum}`,
      name: `FORGED I-BEAM CONNECTING ROD #${cylNum}`,
      subsystem: "CRANKTRAIN",
      disassemblyVector: new THREE.Vector3(0, 0.10 + idx * 0.015, 0),
      sensors: [`rod_temp_${cylNum}`],
      nominalRange: { temp: "85–115°C" },
      defaultTemp: 90,
      defaultVib: 1.1,
      description: `Forged 4340 chrome-moly I-beam connecting rod #${cylNum} with split big-end journal, dual ARP-2000 12-point bolts, and phosphor bronze small-end bushing.`,
      recommendedAction: "Check big-end bearing shell thickness and measure rod bolt stretch.",
      subParts: [
        "Forged 4340 Steel I-Beam Shank",
        "Precision Fractured/Split Big-End Cap",
        "Dual ARP-2000 12-Point Cap Bolts",
        "High-Lead Bronze Trimetal Bearing Shells",
        "Phosphor Bronze Small-End Pin Bushing",
      ],
    });
    root.add(rNode.mesh);
  });

  // ═════════════════════════════════════════════════════════════════════════
  // 3. CYLINDERS & CYLINDER HEAD (Parts 13, 14, 18)
  // ═════════════════════════════════════════════════════════════════════════

  // Part 13: 4x Finned Cylinder Barrels
  const barrelsGroup = buildCylinderBarrels(materials);
  registerComponent(components, barrelsGroup, {
    partId: "cylinder_block",
    name: "AIR-COOLED FINNED CYLINDER BARRELS (4x)",
    subsystem: "COMBUSTION",
    disassemblyVector: new THREE.Vector3(0, 0.14, 0),
    sensors: ["cht_cyl1", "cht_cyl2", "cht_cyl3", "cht_cyl4"],
    nominalRange: { temp: "140–195°C", criticalLimit: "220°C" },
    defaultTemp: 168,
    defaultVib: 1.4,
    description: "4 individual towering air-cooled cylinder barrels, each featuring 28 deep horizontal cooling fins in dark nitrided alloy, hardened steel bore liners, and 4-stud base flanges.",
    recommendedAction: "Perform bore scope inspection for cross-hatch honing integrity and fin blockage.",
    subParts: [
      "4 Individual Cast Alloy Cylinder Barrels",
      "28 Deep Cooling Fins Per Barrel (112 Fins Total)",
      "Hardened Nitride-Impregnated Steel Cylinder Liners",
      "Precision Machined Upper Fire-Ring Sealing Deck",
      "High-Tensile Barrel Retention Stud Studs",
    ],
  });
  root.add(barrelsGroup);

  // Part 14: Cylinder Head Assembly & Combustion Flashes
  const headData = buildCylinderHead(materials);
  const headGroup = headData.group;
  const combustionFlashes = headData.combustionFlashes;
  registerComponent(components, headGroup, {
    partId: "cylinder_head",
    name: "BILLET CYLINDER HEAD ASSEMBLY",
    subsystem: "COMBUSTION",
    disassemblyVector: new THREE.Vector3(0, 0.22, 0),
    sensors: ["head_temp_avg", "intake_port_press", "exhaust_port_temp"],
    nominalRange: { temp: "150–200°C" },
    defaultTemp: 172,
    defaultVib: 1.3,
    description: "Single continuous cast aluminum cylinder head spanning all 4 cylinders, featuring hemispherical combustion chambers, intake/exhaust port tracts, and spark plug bores.",
    recommendedAction: "Check head bolt torque, verify valve lash clearances at scheduled inspection.",
    subParts: [
      "Continuous Cast Aluminum Head Casting",
      "Hemispherical Pent-Roof Combustion Chambers (4x)",
      "Hardened Stellite Valve Seat Inserts",
      "Phosphor Bronze Valve Guides",
      "Spark Plug Threaded Bores & Water/Air Cooling Passages",
    ],
  });
  root.add(headGroup);

  // ═════════════════════════════════════════════════════════════════════════
  // 4. TOP ENGINE: ROCKER COVER, FUEL & IGNITION (Parts 15–19)
  // ═════════════════════════════════════════════════════════════════════════

  // Part 19: Monolithic Billet Rocker Cover with VRDE 180HP Branding
  const rockerGroup = buildRockerCover(materials);
  registerComponent(components, rockerGroup, {
    partId: "rocker_cover",
    name: "MONOLITHIC BILLET ROCKER COVER",
    subsystem: "HEAD",
    disassemblyVector: new THREE.Vector3(0, 0.30, 0),
    sensors: ["valvetrain_vib", "rocker_cavity_temp"],
    nominalRange: { temp: "75–110°C" },
    defaultTemp: 84,
    defaultVib: 0.9,
    description: "Monolithic machined billet aluminum rocker cover spanning all 4 cylinders, featuring engraved 'VRDE 180HP — UAV PISTON ENGINE' branding and DRDO crest, perimeter bolts, and top mounting pads.",
    recommendedAction: "Inspect perimeter Viton gasket seal for oil leaks during pre-flight checks.",
    subParts: [
      "Machined Billet 6061-T6 Aluminum Cover Box",
      "Engraved VRDE 180HP & DRDO Emblem Identification Plate",
      "M6 Perimeter Flange Hex Bolts (16x)",
      "Aviation Brass Knurled Oil Filler Cap",
      "Rear Crankcase Breather Fitting & Rigid Conduit",
    ],
  });
  root.add(rockerGroup);

  // Part 15: Intake Manifold (Induction side, -Z)
  const intakeGroup = buildIntakeManifold(materials);
  registerComponent(components, intakeGroup, {
    partId: "intake_manifold",
    name: "INTAKE MANIFOLD & VELOCITY STACKS",
    subsystem: "INDUCTION",
    disassemblyVector: new THREE.Vector3(0, 0.16, -0.25),
    sensors: ["map_sensor", "iat_sensor", "throttle_pos"],
    nominalRange: { iat: "20–60°C", map: "0.2–1.05 bar" },
    defaultTemp: 45,
    defaultVib: 0.7,
    description: "4 individual polished chrome velocity stack intake trumpets with fine wire mesh screens, curving runners, and machined intake port flange fittings on the intake side.",
    recommendedAction: "Check intake trumpet mesh screens for debris, calibrate throttle body potentiometer.",
    subParts: [
      "Individual Bell-Mouth Velocity Stacks (4x)",
      "Stainless Steel Wire Debris Mesh Screens (4x)",
      "Polished Aluminum Curved Intake Runners",
      "Intake Port Flange Mounting Clamps & O-Rings",
      "Manifold Absolute Pressure (MAP) Sensor Boss",
    ],
  });
  root.add(intakeGroup);

  // Parts 16–17: Fuel Rail & 4x Fuel Injectors (Top of engine)
  const fuelGroup = buildFuelSystem(materials);
  registerComponent(components, fuelGroup, {
    partId: "fuel_rail_assembly",
    name: "GOLDEN BRASS FUEL RAIL & INJECTORS",
    subsystem: "FUEL",
    disassemblyVector: new THREE.Vector3(0, 0.36, -0.05),
    sensors: ["fuel_rail_press", "fuel_flow_rate", "fuel_temp"],
    nominalRange: { press: "3.8–4.2 bar", flow: "12–48 L/h" },
    defaultTemp: 42,
    defaultVib: 0.6,
    description: "Aviation brass tubular fuel rail spanning the very top of the engine, feeding 4 red anodized electronic fuel injectors, with mechanical fuel pump and blue/red AN-6 fittings.",
    recommendedAction: "Verify fuel rail operating pressure of 4.0 bar, inspect injector O-rings.",
    subParts: [
      "Seamless Aviation Brass Tubular Fuel Rail",
      "Electronic Solenoid Multipoint Injectors (4x - Red)",
      "Mechanical Crankcase-Driven Diaphragm Fuel Pump",
      "Rigid Brass/Stainless Supply Line with Blue AN-6 Nut",
      "Digital Fuel Rail Pressure Sensor Transducer",
    ],
  });
  root.add(fuelGroup);

  // Part 18: Ignition Coils, Spark Plugs & Sealed Wiring Harness
  const ignitionGroup = buildIgnitionSystem(materials);
  registerComponent(components, ignitionGroup, {
    partId: "ignition_system",
    name: "DUAL IGNITION COILS & HT HARNESS",
    subsystem: "IGNITION",
    disassemblyVector: new THREE.Vector3(0, 0.32, 0),
    sensors: ["spark_kv_peak", "dwell_time", "timing_advance"],
    nominalRange: { kv: "18–28 kV", advance: "12–34° BTDC" },
    defaultTemp: 68,
    defaultVib: 0.8,
    description: "4 individual coil-on-plug packs mounted in the rocker cover, sealed red silicone HT leads to spark plugs, and an anchored low-voltage harness routing directly into the ECU with zero loose wires.",
    recommendedAction: "Check spark plug gap (0.65mm) and inspect HT lead silicone boots for carbon tracking.",
    subParts: [
      "High-Energy Ignition Coil Packs (4x - Red Cap)",
      "Shielded Red Silicone HT Ignition Leads (4x)",
      "Cold-Range Iridium Spark Plugs (4x)",
      "Woven Shielded Ignition Wiring Trunk",
      "Direct ECU Terminal Interface Connector",
    ],
  });
  root.add(ignitionGroup);

  // ═════════════════════════════════════════════════════════════════════════
  // 5. EXHAUST, LUBRICATION & MOUNTING (Parts 20–24, 26–27)
  // ═════════════════════════════════════════════════════════════════════════

  // Parts 20–22: Exhaust System (Downward Headers & Bottom-Right Silencer)
  const exhaustGroup = buildExhaustSystem(materials);
  registerComponent(components, exhaustGroup, {
    partId: "exhaust_system",
    name: "DOWNWARD EXHAUST MANIFOLD & SILENCER",
    subsystem: "EXHAUST",
    disassemblyVector: new THREE.Vector3(0, -0.16, 0.26),
    sensors: ["egt_cyl1", "egt_cyl2", "egt_cyl3", "egt_cyl4", "backpressure"],
    nominalRange: { temp: "620–780°C", criticalLimit: "840°C" },
    defaultTemp: 680,
    defaultVib: 1.8,
    description: "4 polished chrome headers with vivid blue/violet heat tint sweeping DOWNWARD from exhaust ports into the horizontal bottom-right mounted cylindrical muffler/silencer with dual brass retention bands.",
    recommendedAction: "Monitor Exhaust Gas Temperatures (EGT) across cylinders, inspect brass retention clamp torques.",
    subParts: [
      "Polished Titanium-Tinted Swept Headers (4x)",
      "Exhaust Port Machined Flanges & Hex Studs",
      "Horizontal Stainless Steel Silencer Body & End Caps",
      "Dual Heavy Aviation Brass Clamp Bands",
      "Rigid Crankcase Muffler Mounting Struts",
      "Rear-Facing Beveled Exhaust Tailpipe",
    ],
  });
  root.add(exhaustGroup);

  // Parts 23, 24, 26: Lubrication System (Front Oil Filter & Side Oil Cooler)
  const lubricationGroup = buildLubricationSystem(materials);
  registerComponent(components, lubricationGroup, {
    partId: "oil_cooler_system",
    name: "LUBRICATION: OIL FILTER & COOLER",
    subsystem: "LUBRICATION",
    disassemblyVector: new THREE.Vector3(0.12, -0.06, 0.22),
    sensors: ["oil_temp_in", "oil_temp_out", "oil_pressure", "filter_diff_press"],
    nominalRange: { temp: "75–95°C", press: "4.0–5.5 bar", diffPress: "< 0.8 bar" },
    defaultTemp: 84,
    defaultVib: 1.1,
    description: "Vertical spin-on oil filter with gold drain nut at front-bottom under gearbox, right-side finned rectangular oil cooler, and rigid stainless braided lines with blue/red AN fittings (zero loose lines).",
    recommendedAction: "Replace spin-on filter element at 50 hours, inspect cooler fins for aerodynamic debris.",
    subParts: [
      "Front-Bottom Spin-On Oil Filter Canister with Brass Drain Nut",
      "Right-Side 14-Fin Rectangular Radiator Core",
      "Blue & Red Anodized Aircraft AN-10 Couplers",
      "Braided Stainless Steel Supply & Scavenge Lines",
      "Rigid Engine Block P-Clamp Mounting Brackets",
    ],
  });
  root.add(lubricationGroup);

  // Part 27: Mounting Brackets (4x)
  const mountGroup = buildMountingBrackets(materials);
  registerComponent(components, mountGroup, {
    partId: "engine_mounts",
    name: "FORGED AEROSPACE ENGINE MOUNT BRACKETS",
    subsystem: "STRUCTURE",
    disassemblyVector: new THREE.Vector3(0, -0.10, 0),
    sensors: ["mount_strain_left", "mount_strain_right", "triaxial_vib"],
    nominalRange: { strain: "< 120 MPa", vib: "< 2.0 mm/s" },
    defaultTemp: 60,
    defaultVib: 1.0,
    description: "4 forged triangular engine mount brackets bolted to the lateral bosses of the crankcase, featuring elastomeric rubber vibration damping isolators and through-bolts for airframe attachment.",
    recommendedAction: "Inspect rubber isolator bushings for hardening or cracking, verify castle nut cotter pins.",
    subParts: [
      "Forged Steel Triangular Cantilever Truss Arms (4x)",
      "Machined Weight-Reduction Lightening Holes",
      "Crankcase Mating Pads with M8 Hex Fasteners",
      "High-Durometer Elastomeric Rubber Isolators",
      "Chromoly Airframe Through-Pins & Aviation Castle Nuts",
    ],
  });
  root.add(mountGroup);

  // ═════════════════════════════════════════════════════════════════════════
  // 6. REAR ACCESSORY SECTION (Parts 19, 20, 21, 22, 28, 29, 30)
  // ═════════════════════════════════════════════════════════════════════════
  const rearGroup = buildRearSection(materials);
  registerComponent(components, rearGroup, {
    partId: "rear_accessory_case",
    name: "REAR ACCESSORIES, ECU & OUTPUT FLANGE",
    subsystem: "ACCESSORIES",
    disassemblyVector: new THREE.Vector3(-0.28, 0, 0),
    sensors: ["ecu_voltage", "bus_current", "starter_current", "alt_rpm"],
    nominalRange: { voltage: "27.5–28.5 V", current: "15–45 A" },
    defaultTemp: 65,
    defaultVib: 1.0,
    description: "Rear accessory case housing the 28V alternator/generator with cooling slots, digital ECU black box with Deutsch connector, starter motor, gear drive, and 16-bolt rear output flange.",
    recommendedAction: "Inspect alternator drive belt tension, test starter solenoid contact resistance.",
    subParts: [
      "16-Bolt Perimeter Rear Output Flange Plate",
      "28V Brushless Alternator / Starter Generator with V-Belt",
      "FADEC Digital Engine Control Unit (ECU) with Mil-Spec Connector",
      "High-Torque Gear-Reduction Electric Starter Motor",
      "Accessories Drive Gearbox & Internal Scavenge Oil Pump",
    ],
  });
  root.add(rearGroup);

  // ═════════════════════════════════════════════════════════════════════════
  // MASTER KINEMATIC NODES REGISTRY (CONSUMED BY InteractiveEngine3D.jsx)
  // ═════════════════════════════════════════════════════════════════════════
  const kinematicNodes = {
    propellerAssembly: propGroup,
    crankshaft: crankshaftGroup,
    reductionGearbox: gearboxGroup,
    pistons: pistonNodes,
    connectingRods: rodNodes,
    combustionFlashes: combustionFlashes,
    spinnerRing: propData.spinnerRingMesh,
    topIntakeMesh: null,
    intakeTurbineWheel: null,
    rearDriveHub: rearGroup.getObjectByName("REAR_ROTATING_DRIVE_HUB") || rearGroup.userData.rearDriveHub || null,
  };

  return {
    root,
    components,
    materials,
    kinematicNodes,
    envMap,
    thermalUniforms,
    engineSpecs: {
      name: "VRDE 180HP UAV Piston Engine",
      configuration: "Inline-4 4-Stroke Air-Cooled",
      displacement: "1.8 L (1800 cc)",
      maxPower: "180 HP @ 3,200 RPM",
      reductionRatio: "1.6:1 Planetary",
      cooling: "Ram Air-Cooled Finned Barrels",
      fuelSystem: "Multipoint Electronic Fuel Injection (EFI)",
      ignition: "Dual Redundant Electronic Ignition",
      dryWeight: "78 kg",
      envelope: "780mm L × 480mm H × 420mm W",
      application: "DRDO MALE UAV (Tapas-BH-201 / Archer-NG)",
    },
  };
}
