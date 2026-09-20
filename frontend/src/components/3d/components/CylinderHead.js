import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PART 14 — CYLINDER HEAD INTERNAL COMBUSTION CHAMBERS & SPARK PLUGS
 *
 * Internal combustion architecture housed inside the monolithic billet enclosure:
 * - Hemispherical combustion chambers on underside of fire-deck.
 * - Dynamic combustion flashes for 1-3-4-2 firing order animations.
 * - Threaded aviation spark plugs with ceramic insulators and terminal studs.
 * - Eliminates redundant duplicate exterior boxes to provide a single, clean
 *   monolithic billet head/cover matching the authentic VRDE 180HP blueprint.
 */
export function buildCylinderHead(materials) {
  const group = new THREE.Group();
  group.name = "CYLINDER_HEAD";

  const { cylinderConfigs } = ENGINE;
  const combustionFlashes = {};

  const headY = ENGINE.cylinderTopY; // Exactly at the top deck of the barrels (0.150m)

  // ── Per-Cylinder Combustion Chambers & Spark Plugs ──
  cylinderConfigs.forEach((cfg) => {
    // A. Hemispherical combustion chamber (underside of head sealing surface)
    const chamberGeo = new THREE.SphereGeometry(0.032, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
    tagThermalGeometry(chamberGeo, 3, cfg.num, 0, 0);
    chamberGeo.rotateX(Math.PI);
    const chamber = new THREE.Mesh(chamberGeo, materials.machinedAluminum);
    chamber.position.set(cfg.x, 0.002, 0);
    group.add(chamber);

    // B. Combustion flash (for firing animation in X-Ray / Diagnostic mode)
    const flashGeo = new THREE.SphereGeometry(0.026, 16, 12);
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const flashMesh = new THREE.Mesh(flashGeo, flashMat);
    flashMesh.position.set(cfg.x, 0.008, 0);
    group.add(flashMesh);
    combustionFlashes[cfg.num] = flashMesh;

    // C. Aviation Spark Plug (threaded into head angled toward combustion chamber)
    const plugGroup = new THREE.Group();
    plugGroup.position.set(cfg.x, 0.015, 0.022);
    plugGroup.rotation.x = 0.22;

    // Hex body
    const plugBaseGeo = new THREE.CylinderGeometry(0.0055, 0.0055, 0.012, 6);
    tagThermalGeometry(plugBaseGeo, 3, cfg.num, 0, 0);
    const plugBase = new THREE.Mesh(plugBaseGeo, materials.aviationBrass);
    plugGroup.add(plugBase);

    // Ceramic insulator
    const plugCeramicGeo = new THREE.CylinderGeometry(0.004, 0.004, 0.016, 16);
    tagThermalGeometry(plugCeramicGeo, 3, cfg.num, 0, 0);
    const plugCeramic = new THREE.Mesh(plugCeramicGeo, materials.ceramicWhite);
    plugCeramic.position.y = 0.010;
    plugGroup.add(plugCeramic);

    // Terminal stud
    const plugTermGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.006, 8);
    tagThermalGeometry(plugTermGeo, 3, cfg.num, 0, 0);
    const plugTerm = new THREE.Mesh(plugTermGeo, materials.polishedChrome);
    plugTerm.position.y = 0.020;
    plugGroup.add(plugTerm);

    group.add(plugGroup);
  });

  // Position combustion chambers and plugs right at cylinder top deck
  group.position.set(0, headY, 0);

  return { group, combustionFlashes };
}
