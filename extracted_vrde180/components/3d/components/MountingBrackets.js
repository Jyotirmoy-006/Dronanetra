import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PART 27 — MOUNTING BRACKETS (4x)
 *
 * Forged aerospace engine mount brackets bolted to the lateral bosses
 * of the lower crankcase. Connects engine to the UAV airframe truss:
 * - Triangular structural gusset with machined lightening holes.
 * - Crankcase mating pad with 4 high-tensile hex bolts.
 * - Elastomeric vibration damping isolator bushing (black rubber).
 * - Airframe attachment through-bolt with aviation castle nut and safety wire.
 */
function createMountBracket(side, materials) {
  const bracketGroup = new THREE.Group();
  const zSign = side; // +1 for right side, -1 for left side

  // ── 1. Crankcase Mating Flange (vertical pad) ──
  const padGeo = new THREE.BoxGeometry(0.045, 0.055, 0.008);
  tagThermalGeometry(padGeo, 5, 0, 0, 0);
  const pad = new THREE.Mesh(padGeo, materials.machinedAluminum);
  pad.position.set(0, 0, 0);
  bracketGroup.add(pad);

  // 4 crankcase mounting bolts
  [-0.015, 0.015].forEach((bx) => {
    [-0.018, 0.018].forEach((by) => {
      const b = createHexBolt(0.0028, 0.008, materials, 5);
      b.position.set(bx, by, zSign * 0.005);
      b.rotation.x = (zSign * Math.PI) / 2;
      bracketGroup.add(b);
    });
  });

  // ── 2. Triangular Cantilever Truss Arm ──
  const armShape = new THREE.Shape();
  armShape.moveTo(-0.020, -0.025);
  armShape.lineTo(0.020, -0.025);
  armShape.lineTo(0.012, 0.025);
  armShape.lineTo(-0.012, 0.025);
  armShape.closePath();

  const extrudeSettings = { depth: 0.045, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.002, bevelThickness: 0.002 };
  const armGeo = new THREE.ExtrudeGeometry(armShape, extrudeSettings);
  tagThermalGeometry(armGeo, 5, 0, 0, 0);
  const arm = new THREE.Mesh(armGeo, materials.forgedSteel);
  arm.position.set(0, 0, zSign > 0 ? 0.004 : -0.049);
  bracketGroup.add(arm);

  // Lightening / weight-reduction through-hole
  const holeGeo = new THREE.CylinderGeometry(0.009, 0.009, 0.050, 16);
  tagThermalGeometry(holeGeo, 5, 0, 0, 0);
  holeGeo.rotateX(Math.PI / 2);
  const hole = new THREE.Mesh(holeGeo, materials.darkAnodized);
  hole.position.set(0, 0, zSign * 0.025);
  bracketGroup.add(hole);

  // ── 3. Outer Isolator Cup (holds rubber vibration damping bushing) ──
  const cupGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.026, 24);
  tagThermalGeometry(cupGeo, 5, 0, 0, 0);
  cupGeo.rotateZ(Math.PI / 2);
  const cup = new THREE.Mesh(cupGeo, materials.machinedAluminum);
  cup.position.set(0, 0, zSign * 0.052);
  bracketGroup.add(cup);

  // Black elastomeric rubber isolator ring
  const bushingGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.028, 20);
  tagThermalGeometry(bushingGeo, 5, 0, 0, 0);
  bushingGeo.rotateZ(Math.PI / 2);
  const bushing = new THREE.Mesh(bushingGeo, materials.blackRubber);
  bushing.position.set(0, 0, zSign * 0.052);
  bracketGroup.add(bushing);

  // ── 4. Airframe Through-Pin / Bolt with Castle Nut ──
  const pinGeo = new THREE.CylinderGeometry(0.008, 0.008, 0.038, 16);
  tagThermalGeometry(pinGeo, 5, 0, 0, 0);
  pinGeo.rotateZ(Math.PI / 2);
  const pin = new THREE.Mesh(pinGeo, materials.polishedChrome);
  pin.position.set(0, 0, zSign * 0.052);
  bracketGroup.add(pin);

  // Hex castle nut on pin end
  const nutGeo = new THREE.CylinderGeometry(0.010, 0.010, 0.007, 6);
  tagThermalGeometry(nutGeo, 5, 0, 0, 0);
  nutGeo.rotateZ(Math.PI / 2);
  const nut = new THREE.Mesh(nutGeo, materials.aviationBrass);
  nut.position.set(0.020, 0, zSign * 0.052);
  bracketGroup.add(nut);

  return bracketGroup;
}

export function buildMountingBrackets(materials) {
  const group = new THREE.Group();
  group.name = "MOUNTING_BRACKETS";

  const { crankCenterY } = ENGINE;
  const mountY = crankCenterY + 0.015;

  // 4 Engine Mount Locations: Front-Right, Rear-Right, Front-Left, Rear-Left
  const mountLocations = [
    { x:  0.130, z:  0.088, side:  1 }, // Front Right
    { x: -0.130, z:  0.088, side:  1 }, // Rear Right
    { x:  0.130, z: -0.088, side: -1 }, // Front Left
    { x: -0.130, z: -0.088, side: -1 }, // Rear Left
  ];

  mountLocations.forEach((loc) => {
    const bracket = createMountBracket(loc.side, materials);
    bracket.position.set(loc.x, mountY, loc.z);
    group.add(bracket);
  });

  return group;
}
