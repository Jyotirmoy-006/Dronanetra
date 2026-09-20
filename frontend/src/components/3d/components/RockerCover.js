import * as THREE from "three";
import { tagThermalGeometry } from "../AerospaceThermalShader";
import { ENGINE, createHexBolt } from "../VRDE180Utilities";

/**
 * PART 19 — ROCKER COVER / VALVE COVER ENCLOSURE
 *
 * STRICTLY MATCHES ASSEMBLED REFERENCE IMAGES (Right Side & Front-Right Views):
 * - Clean monolithic rectangular billet aluminum enclosure (no bulging domes).
 * - High-contrast, sharp engraved VRDE 180HP badge on front-right (+Z face):
 *   "VRDE 180HP"
 *   "— UAV PISTON ENGINE —"
 *   DRDO VRDE circular emblem.
 * - Rear-side gold/yellow sensor block (visible in photo).
 * - Front-right knurled aviation brass oil filler cap.
 * - Top mounting pads for 4 ignition coil units and fuel rail standoffs.
 * - 16 perimeter hex bolts around bottom flange.
 */

// High-DPI Procedural Canvas Texture for VRDE 180HP Branding Badge
function createVRDEBadgeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // 1. Weathered cast aluminum / stained steel plate background (matches engine body)
  const bgGrad = ctx.createLinearGradient(0, 0, 1024, 256);
  bgGrad.addColorStop(0.00, "#747d87");
  bgGrad.addColorStop(0.30, "#8e97a2");
  bgGrad.addColorStop(0.65, "#828b95");
  bgGrad.addColorStop(1.00, "#6e7780");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 256);

  // 2. Sand-cast porosity & micro-pitting (thousands of tiny dots)
  for (let i = 0; i < 4000; i++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 256;
    const pr = 0.5 + Math.random() * 1.6;
    ctx.fillStyle = Math.random() > 0.45 ? "rgba(18, 22, 26, 0.32)" : "rgba(220, 230, 240, 0.20)";
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Dark grease smudges & burnt oil drip streaks
  for (let g = 0; g < 25; g++) {
    const gx = Math.random() * 1024;
    const gy = Math.random() * 256;
    const gr = 8 + Math.random() * 22;
    const greaseGrad = ctx.createRadialGradient(gx, gy, 2, gx, gy, gr);
    greaseGrad.addColorStop(0.0, "rgba(20, 16, 12, 0.45)");
    greaseGrad.addColorStop(0.7, "rgba(35, 26, 18, 0.20)");
    greaseGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = greaseGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vertical oil drip runs down the plate
  for (let d = 0; d < 12; d++) {
    const dx = 40 + Math.random() * 944;
    const startY = 10 + Math.random() * 60;
    const len = 30 + Math.random() * 120;
    const dGrad = ctx.createLinearGradient(dx, startY, dx, startY + len);
    dGrad.addColorStop(0.0, "rgba(20, 15, 10, 0.65)");
    dGrad.addColorStop(0.7, "rgba(35, 25, 15, 0.30)");
    dGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.0 + Math.random() * 2.0;
    ctx.beginPath();
    ctx.moveTo(dx, startY);
    ctx.lineTo(dx + (Math.random() - 0.5) * 4, startY + len);
    ctx.stroke();
  }

  // 4. Longitudinal brushed metal scratches
  for (let s = 0; s < 120; s++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 256;
    const slen = 20 + Math.random() * 90;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(240, 248, 255, 0.18)" : "rgba(10, 15, 20, 0.28)";
    ctx.lineWidth = 0.5 + Math.random() * 0.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + slen, sy + (Math.random() - 0.5) * 3);
    ctx.stroke();
  }

  // 5. Stamped recessed bevel border with oil in corners
  ctx.strokeStyle = "#2a313a";
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 1000, 232);

  ctx.strokeStyle = "rgba(230, 240, 250, 0.28)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, 992, 224);

  // Corner mounting screw dots with dark oil washers
  const rivetPositions = [
    [28, 28], [996, 28], [28, 228], [996, 228], [512, 24], [512, 232]
  ];
  rivetPositions.forEach(([rx, ry]) => {
    // Dark oily washer halo
    ctx.fillStyle = "rgba(15, 18, 22, 0.65)";
    ctx.beginPath();
    ctx.arc(rx, ry, 10, 0, Math.PI * 2);
    ctx.fill();

    // Zinc screw head
    ctx.fillStyle = "#8a949e";
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();

    // Screw drive slot
    ctx.strokeStyle = "#1a2028";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx - 4, ry);
    ctx.lineTo(rx + 4, ry);
    ctx.stroke();
  });

  // 6. DRDO / VRDE Circular Emblem (Placed on the LEFT at cx ≈ 220, exactly matching the reference photo)
  const cx = 220;
  const cy = 128;
  const cr = 64;

  // Outer dark blue emblem ring
  ctx.fillStyle = "#162a45";
  ctx.beginPath();
  ctx.arc(cx, cy, cr, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Inner silvery medallion disc
  ctx.fillStyle = "#9ba5b0";
  ctx.beginPath();
  ctx.arc(cx, cy, cr - 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Central golden cog / starburst insignia
  ctx.strokeStyle = "#b45309";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    const rIn = 16;
    const rOut = cr - 16;
    ctx.moveTo(cx + Math.cos(a) * rIn, cy + Math.sin(a) * rIn);
    ctx.lineTo(cx + Math.cos(a) * rOut, cy + Math.sin(a) * rOut);
  }
  ctx.stroke();

  // Center hub of emblem
  ctx.fillStyle = "#1e3a8a";
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fill();

  // DRDO / VRDE text in emblem
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 13px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("DRDO", cx, cy - 28);
  ctx.fillText("VRDE", cx, cy + 38);

  // 7. Stamped Heavy Industrial Typography (on the RIGHT, matching photo)
  ctx.textAlign = "left";
  ctx.fillStyle = "#0c0f14"; // Heavy industrial black with subtle weathering
  ctx.font = "900 84px 'Outfit', 'Inter', system-ui, sans-serif";
  ctx.letterSpacing = "2px";
  ctx.fillText("VRDE 180HP", 335, 140);

  ctx.fillStyle = "#222933";
  ctx.font = "700 24px 'Inter', system-ui, sans-serif";
  ctx.letterSpacing = "4px";
  ctx.fillText("— UAV AERO ENGINE —", 340, 185);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 8;
  return tex;
}

export function buildRockerCover(materials) {
  const group = new THREE.Group();
  group.name = "ROCKER_COVER";

  const { cylinderConfigs } = ENGINE;
  const coverLength = 0.385;
  const coverHeight = 0.076; // Unified monolithic billet height spanning directly from cylinder barrel tops
  const coverWidth = 0.114;
  const coverY = ENGINE.cylinderTopY + coverHeight * 0.5; // Centers at 0.188m

  // ── 1. Main Billet Box Enclosure (Clean flat faces, machined satin finish) ──
  const coverBoxGeo = new THREE.BoxGeometry(coverLength, coverHeight, coverWidth);
  tagThermalGeometry(coverBoxGeo, 3, 0, 0, 0);
  const coverBox = new THREE.Mesh(coverBoxGeo, materials.machinedAluminum);
  coverBox.position.set(0, coverY, 0);
  coverBox.castShadow = true;
  group.add(coverBox);

  // ── 2. Top Chamfered Bevel Lid ──
  const lidGeo = new THREE.BoxGeometry(coverLength - 0.006, 0.004, coverWidth - 0.006);
  tagThermalGeometry(lidGeo, 3, 0, 0, 0);
  const lid = new THREE.Mesh(lidGeo, materials.castAluminum);
  lid.position.set(0, coverY + coverHeight * 0.5 + 0.002, 0);
  group.add(lid);

  // ── 3. Bottom Perimeter Flange (Seated directly on cylinder barrel deck) ──
  const flangeGeo = new THREE.BoxGeometry(coverLength + 0.012, 0.006, coverWidth + 0.012);
  tagThermalGeometry(flangeGeo, 3, 0, 0, 0);
  const flange = new THREE.Mesh(flangeGeo, materials.machinedAluminum);
  flange.position.set(0, coverY - coverHeight * 0.5 + 0.003, 0);
  group.add(flange);

  // 16 Perimeter Retention Hex Bolts
  const boltSpanX = coverLength + 0.006;
  const boltSpanZ = coverWidth + 0.006;
  const xPositions = [-0.170, -0.100, -0.035, 0.035, 0.100, 0.170];

  xPositions.forEach((bx) => {
    [-boltSpanZ * 0.5, boltSpanZ * 0.5].forEach((bz) => {
      const bolt = createHexBolt(0.0025, 0.007, materials, 3);
      bolt.position.set(bx, coverY - coverHeight * 0.5 + 0.007, bz);
      group.add(bolt);
    });
  });

  [-boltSpanX * 0.5, boltSpanX * 0.5].forEach((bx) => {
    [-0.028, 0.028].forEach((bz) => {
      const bolt = createHexBolt(0.0025, 0.007, materials, 3);
      bolt.position.set(bx, coverY - coverHeight * 0.5 + 0.007, bz);
      group.add(bolt);
    });
  });

  // ── 4. Engraved VRDE 180HP Branding Plates (on BOTH Right and Left faces) ──
  const badgeTex = createVRDEBadgeTexture();
  const badgeMat = new THREE.MeshStandardMaterial({
    map: badgeTex,
    roughness: 0.38,
    metalness: 0.82,
    envMap: materials.castAluminum.envMap,
    envMapIntensity: 1.15,
  });
  const badgeGeo = new THREE.PlaneGeometry(coverLength - 0.004, coverHeight - 0.006);
  tagThermalGeometry(badgeGeo, 3, 0, 0, 0);

  // Right side (+Z face — Main View facing viewer)
  const badgeMeshR = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMeshR.position.set(0, coverY, coverWidth * 0.5 + 0.001);
  group.add(badgeMeshR);

  // Left side (-Z face — Intake side)
  const badgeMeshL = new THREE.Mesh(badgeGeo, badgeMat);
  badgeMeshL.position.set(0, coverY, -coverWidth * 0.5 - 0.001);
  badgeMeshL.rotation.y = Math.PI;
  group.add(badgeMeshL);

  // Top lip retention studs (6 bolts visible across top edge of rocker cover in reference photo)
  const topLipX = [-0.160, -0.095, -0.032, 0.032, 0.095, 0.160];
  topLipX.forEach((tx) => {
    const lipBolt = createHexBolt(0.0022, 0.006, materials, 3);
    lipBolt.position.set(tx, coverY + coverHeight * 0.5 - 0.006, coverWidth * 0.5 + 0.003);
    lipBolt.rotation.x = Math.PI / 2;
    group.add(lipBolt);
  });

  // ── 5. Rear-Side Sensor / Junction Box (visible in photo) ──
  const sensorBoxGeo = new THREE.BoxGeometry(0.030, 0.028, 0.022);
  tagThermalGeometry(sensorBoxGeo, 3, 0, 0, 0);
  const sensorBox = new THREE.Mesh(sensorBoxGeo, materials.ecuBlack);
  sensorBox.position.set(-0.165, coverY + 0.010, coverWidth * 0.5 + 0.011);
  group.add(sensorBox);

  // Yellow warning/calibration label on sensor box
  const yellowLabelGeo = new THREE.PlaneGeometry(0.020, 0.014);
  tagThermalGeometry(yellowLabelGeo, 3, 0, 0, 0);
  const yellowLabelMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
  const yellowLabel = new THREE.Mesh(yellowLabelGeo, yellowLabelMat);
  yellowLabel.position.set(-0.165, coverY + 0.010, coverWidth * 0.5 + 0.023);
  group.add(yellowLabel);

  // ── 6. Top Ignition Coil Recesses (4x) ──
  cylinderConfigs.forEach((cfg) => {
    const recessGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.005, 20);
    tagThermalGeometry(recessGeo, 3, cfg.num, 0, 0);
    const recess = new THREE.Mesh(recessGeo, materials.darkAnodized);
    recess.position.set(cfg.x, coverY + coverHeight * 0.5 + 0.002, 0);
    group.add(recess);
  });

  // ── 7. Standoff Support Brackets for Overhead Fuel Rail (3x) ──
  [-0.110, 0, 0.110].forEach((sx) => {
    const bracketGeo = new THREE.BoxGeometry(0.008, 0.022, 0.008);
    tagThermalGeometry(bracketGeo, 3, 0, 0, 0);
    const bracket = new THREE.Mesh(bracketGeo, materials.machinedAluminum);
    bracket.position.set(sx, coverY + coverHeight * 0.5 + 0.011, -0.015);
    group.add(bracket);

    const saddleGeo = new THREE.TorusGeometry(0.0075, 0.0018, 6, 16, Math.PI);
    tagThermalGeometry(saddleGeo, 3, 0, 0, 0);
    saddleGeo.rotateZ(-Math.PI / 2);
    const saddle = new THREE.Mesh(saddleGeo, materials.aviationBrass);
    saddle.position.set(sx, ENGINE.fuelRailY, -0.015);
    group.add(saddle);
  });

  // ── 8. Knurled Aviation Brass Oil Filler Cap (Front cylinder 1 end) ──
  const fillerNeckGeo = new THREE.CylinderGeometry(0.011, 0.013, 0.014, 16);
  tagThermalGeometry(fillerNeckGeo, 3, 0, 0, 0);
  const fillerNeck = new THREE.Mesh(fillerNeckGeo, materials.machinedAluminum);
  fillerNeck.position.set(0.155, coverY + coverHeight * 0.5 + 0.007, 0.028);
  group.add(fillerNeck);

  const capGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.009, 16);
  tagThermalGeometry(capGeo, 3, 0, 0, 0);
  const capMesh = new THREE.Mesh(capGeo, materials.aviationBrass);
  capMesh.position.set(0.155, coverY + coverHeight * 0.5 + 0.016, 0.028);
  group.add(capMesh);

  const knurlGeo = new THREE.TorusGeometry(0.014, 0.0018, 6, 20);
  tagThermalGeometry(knurlGeo, 3, 0, 0, 0);
  knurlGeo.rotateX(Math.PI / 2);
  const knurl = new THREE.Mesh(knurlGeo, materials.aviationBrass);
  knurl.position.set(0.155, coverY + coverHeight * 0.5 + 0.016, 0.028);
  group.add(knurl);

  return group;
}

