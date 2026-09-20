import * as THREE from "three";
import { applyAerospaceThermalShader } from "./AerospaceThermalShader.js";

// ── PROCEDURAL STUDIO REFLECTION ENVIRONMENT ──────────────────────────────
export function createStudioEnvironment() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // High-contrast aerospace CAD studio cyclorama (dark navy studio preventing washed-out white flooding)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0.0, "#0b111a");  // Dark slate navy dome
  bgGrad.addColorStop(0.35, "#141e2b"); // Subtle mid studio
  bgGrad.addColorStop(0.50, "#1d293a"); // Horizon level
  bgGrad.addColorStop(0.65, "#0e1520"); // Lower floor reflection
  bgGrad.addColorStop(1.0, "#06090f");  // Deep studio floor
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Overhead Key Softbox Strip (focused ribbon highlight, not giant flooding blob)
  ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
  ctx.filter = "blur(18px)";
  ctx.beginPath();
  ctx.ellipse(512, 60, 240, 40, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front-right 45° Specular Strip (sharp metallic edge on exhaust runners & spinner)
  ctx.fillStyle = "rgba(235, 245, 255, 0.55)";
  ctx.filter = "blur(16px)";
  ctx.beginPath();
  ctx.ellipse(820, 160, 140, 60, 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Front-left 45° Fill Strip (subtle silver glint for intake side)
  ctx.fillStyle = "rgba(235, 245, 255, 0.45)";
  ctx.filter = "blur(16px)";
  ctx.beginPath();
  ctx.ellipse(200, 160, 140, 60, -0.15, 0, Math.PI * 2);
  ctx.fill();

  // Crisp Horizon Specular Rim Line
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.filter = "blur(3px)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 256);
  ctx.lineTo(1024, 256);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

// ── PROCEDURAL TEXTURES ────────────────────────────────────────────────────
export function createBrushedMetalTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  // Mid-tone dark brushed steel base (prevents white-washing)
  ctx.fillStyle = "#525c68";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4500; i++) {
    const y = Math.random() * 512;
    const x = Math.random() * 512;
    const len = 30 + Math.random() * 120;
    const val = Math.floor(95 + Math.random() * 65);
    ctx.strokeStyle = `rgb(${val},${val + 4},${val + 8})`;
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// ── Procedural Weathered & Heat-Stained Stainless Steel Texture (Muffler Canister) ────
export function createWeatheredStainlessMufflerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // 1. Aged industrial stainless steel base gradient
  const baseGrad = ctx.createLinearGradient(0, 0, 1024, 1024);
  baseGrad.addColorStop(0.00, "#828b94"); // Brushed steel shadow
  baseGrad.addColorStop(0.25, "#b8c0c8"); // Specular sheen highlight
  baseGrad.addColorStop(0.50, "#a0a8b2"); // Weathered mid tone
  baseGrad.addColorStop(0.75, "#8e96a0"); // Belly shadow
  baseGrad.addColorStop(1.00, "#767e88"); // Lower edge
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Heavy longitudinal brushed metal grain across the entire body
  for (let i = 0; i < 7500; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 60 + Math.random() * 360;
    const alpha = 0.05 + Math.random() * 0.18;
    ctx.strokeStyle = Math.random() > 0.45 ? `rgba(255,255,255,${alpha})` : `rgba(15,20,25,${alpha * 1.6})`;
    ctx.lineWidth = 0.5 + Math.random() * 1.0;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + len); // Longitudinal along cylinder length
    ctx.stroke();
  }

  // 3. Prominent, Vivid Burnt Rust-Orange & Amber Heat Scorch Bands (Centered at relative 0.25 & 0.75)
  const bandPositions = [256, 768];

  // Horizontal circumferential heat bands (around cylinder axis)
  bandPositions.forEach((by) => {
    // Broad golden-straw amber heat halo
    const strawGrad = ctx.createLinearGradient(0, by - 95, 0, by + 95);
    strawGrad.addColorStop(0.00, "rgba(217, 119, 6, 0.0)");
    strawGrad.addColorStop(0.20, "rgba(217, 119, 6, 0.55)"); // Golden straw
    strawGrad.addColorStop(0.50, "rgba(194, 65, 12, 0.75)");  // Burnt amber
    strawGrad.addColorStop(0.80, "rgba(217, 119, 6, 0.55)"); // Golden straw
    strawGrad.addColorStop(1.00, "rgba(217, 119, 6, 0.0)");
    ctx.fillStyle = strawGrad;
    ctx.fillRect(0, by - 95, 1024, 190);

    // Core rust / scorched oxidation band
    const rustGrad = ctx.createLinearGradient(0, by - 36, 0, by + 36);
    rustGrad.addColorStop(0.00, "rgba(146, 64, 14, 0.0)");
    rustGrad.addColorStop(0.18, "rgba(215, 75, 15, 0.95)"); // Intense rust orange
    rustGrad.addColorStop(0.42, "rgba(140, 45, 10, 0.98)"); // Deep burnt rust
    rustGrad.addColorStop(0.50, "rgba(28, 14, 8, 0.98)");   // Carbonized dark seam
    rustGrad.addColorStop(0.58, "rgba(140, 45, 10, 0.98)"); // Deep burnt rust
    rustGrad.addColorStop(0.82, "rgba(215, 75, 15, 0.95)"); // Intense rust orange
    rustGrad.addColorStop(1.00, "rgba(146, 64, 14, 0.0)");
    ctx.fillStyle = rustGrad;
    ctx.fillRect(0, by - 36, 1024, 72);

    // Heavy heat scorch pitting & burn spatter dots
    for (let s = 0; s < 450; s++) {
      const sx = Math.random() * 1024;
      const sy = by + (Math.random() - 0.5) * 75;
      const sr = 0.8 + Math.random() * 3.6;
      ctx.fillStyle = Math.random() > 0.35 ? "rgba(215, 75, 15, 0.85)" : "rgba(25, 12, 6, 0.90)";
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Vertical bands to ensure seamless coverage if mapped across UVs
  bandPositions.forEach((bx) => {
    const strawV = ctx.createLinearGradient(bx - 80, 0, bx + 80, 0);
    strawV.addColorStop(0.00, "rgba(217, 119, 6, 0.0)");
    strawV.addColorStop(0.50, "rgba(194, 65, 12, 0.50)");
    strawV.addColorStop(1.00, "rgba(217, 119, 6, 0.0)");
    ctx.fillStyle = strawV;
    ctx.fillRect(bx - 80, 0, 160, 1024);

    const rustV = ctx.createLinearGradient(bx - 30, 0, bx + 30, 0);
    rustV.addColorStop(0.00, "rgba(146, 64, 14, 0.0)");
    rustV.addColorStop(0.50, "rgba(140, 45, 10, 0.85)");
    rustV.addColorStop(1.00, "rgba(146, 64, 14, 0.0)");
    ctx.fillStyle = rustV;
    ctx.fillRect(bx - 30, 0, 60, 1024);
  });

  // 4. Vertical Burnt Oil Drips and Grime Streaks (Running down the sides)
  for (let d = 0; d < 75; d++) {
    const dx = 15 + Math.random() * 994;
    const startY = 40 + Math.random() * 520;
    const len = 50 + Math.random() * 300;
    const dripGrad = ctx.createLinearGradient(dx, startY, dx, startY + len);
    dripGrad.addColorStop(0.0, "rgba(15, 10, 6, 0.90)");
    dripGrad.addColorStop(0.6, "rgba(32, 22, 12, 0.65)");
    dripGrad.addColorStop(1.0, "rgba(45, 32, 20, 0.0)");
    ctx.strokeStyle = dripGrad;
    ctx.lineWidth = 1.2 + Math.random() * 3.2;
    ctx.beginPath();
    ctx.moveTo(dx, startY);
    ctx.lineTo(dx + (Math.random() - 0.5) * 6, startY + len);
    ctx.stroke();
  }

  // 5. Dark Grease Smudges and Surface Micro-Pitting
  for (let p = 0; p < 5500; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const pr = 0.5 + Math.random() * 2.4;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(12, 16, 20, 0.45)" : "rgba(220, 230, 240, 0.25)";
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. HIGH-CONTRAST NOTICEABLE SCRATCHES & ABRASIONS EVERYWHERE
  // Dual-stroke scratches: bright bare metal cut + dark shadow groove
  for (let sc = 0; sc < 450; sc++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 1024;
    const angle = Math.random() * Math.PI * 2;
    const slen = 15 + Math.random() * 65;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    // Dark scratch valley
    ctx.strokeStyle = "rgba(10, 15, 20, 0.75)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Bright highlighted scratch edge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.70)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx + 0.6, sy - 0.6);
    ctx.lineTo(sx + dx + 0.6, sy + dy - 0.6);
    ctx.stroke();
  }

  // Cross-hatch handling scrapes
  for (let h = 0; h < 45; h++) {
    const hx = Math.random() * 1024;
    const hy = Math.random() * 1024;
    for (let l = 0; l < 5; l++) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(hx + l * 4, hy);
      ctx.lineTo(hx + l * 4 + 25, hy + 20);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Heat-Blued / Thermal-Tempered Exhaust & Intake Runner Texture ──
export function createCharredGraphiteExhaustTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // 1. Base metal gradient with realistic aerospace titanium/stainless heat bluing
  // Softened, authentic heat-cycling: Golden straw -> Burnt bronze/copper -> Subtle dark plum -> Deep cobalt blue -> Tempered steel
  // ZERO garish neon purple/magenta!
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  // Port entry zone: High-temperature exhaust gas discharge
  grad.addColorStop(0.00, "#e49830"); // Warm golden-straw oxidation at port flange weld
  grad.addColorStop(0.03, "#b84812"); // Scorched bronze / burnt copper-orange
  grad.addColorStop(0.07, "#5a2c42"); // Narrow, subtle dark bronze-plum temper (NOT bright magenta)
  grad.addColorStop(0.12, "#1a468e"); // Authentic deep aerospace cobalt / sapphire steel bluing
  grad.addColorStop(0.18, "#2c608e"); // Tempered satin blue-slate edge
  grad.addColorStop(0.24, "#ad7c34"); // Golden straw transition halo
  grad.addColorStop(0.30, "#78828e"); // Metallic satin gunmetal transition
  grad.addColorStop(0.36, "#6e7884"); // Brushed titanium/gunmetal pipe mid-body

  // Mid-bend high-temperature gas impingement heating zone (sharp curve where gases hit outer wall)
  grad.addColorStop(0.42, "#dea032"); // Straw amber heat bloom
  grad.addColorStop(0.47, "#b64a14"); // Burnt copper-orange
  grad.addColorStop(0.52, "#542840"); // Narrow subtle bronze-plum transition
  grad.addColorStop(0.56, "#163e84"); // Deep tempered titanium blue core
  grad.addColorStop(0.61, "#285888"); // Tempered blue edge
  grad.addColorStop(0.66, "#9e6e2e"); // Golden straw halo
  grad.addColorStop(0.72, "#707a86"); // Weathered satin stainless alloy
  grad.addColorStop(0.78, "#6b7580"); // Lower runner tube body

  // Lower canister entry zone (heat-soak approaching canister ferrule)
  grad.addColorStop(0.84, "#d09432"); // Golden straw heat band
  grad.addColorStop(0.90, "#a84410"); // Burnt copper-bronze
  grad.addColorStop(0.95, "#4a2638"); // Deep dark bronze-plum
  grad.addColorStop(0.98, "#163c7e"); // Tempered blue ring
  grad.addColorStop(1.00, "#d89834"); // Golden straw weld lip
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);

  // 2. Circumferential heat variance along Y (v coordinate around pipe circumference)
  // Seamless: top (y=0) and bottom (y=512) match so the cylinder tube wraps with zero seam!
  // Outer bend face receives higher thermal radiance, inner face stays cooler straw/steel
  const radialHeat = ctx.createLinearGradient(0, 0, 0, 512);
  radialHeat.addColorStop(0.00, "rgba(20, 55, 125, 0.20)");  // Tempered steel blue outer face
  radialHeat.addColorStop(0.20, "rgba(150, 75, 18, 0.15)");  // Warm bronze fringe
  radialHeat.addColorStop(0.38, "rgba(195, 140, 35, 0.16)"); // Golden straw halo
  radialHeat.addColorStop(0.50, "rgba(12, 16, 22, 0.08)");   // Shaded inner radius
  radialHeat.addColorStop(0.62, "rgba(195, 140, 35, 0.16)"); // Golden straw halo
  radialHeat.addColorStop(0.80, "rgba(150, 75, 18, 0.15)");  // Warm bronze fringe
  radialHeat.addColorStop(1.00, "rgba(20, 55, 125, 0.20)");  // Tempered steel blue outer face (seamless wrap!)
  ctx.fillStyle = radialHeat;
  ctx.fillRect(0, 0, 1024, 512);

  // 3. Transverse thermal pulse waves & iridescent heat-temper rings along pipe length (36 rings)
  // Subtle amber and cobalt steel rings, NO harsh purple
  for (let r = 0; r < 36; r++) {
    const rx = 20 + Math.random() * 984;
    const rw = 8 + Math.random() * 28;
    const ringGrad = ctx.createLinearGradient(rx - rw, 0, rx + rw, 0);
    ringGrad.addColorStop(0.0, "rgba(190, 130, 30, 0.0)");
    ringGrad.addColorStop(0.2, "rgba(215, 150, 40, 0.45)"); // Straw gold
    ringGrad.addColorStop(0.45, "rgba(150, 60, 15, 0.40)");  // Burnt copper
    ringGrad.addColorStop(0.55, "rgba(18, 60, 145, 0.55)");  // Tempered cobalt blue core
    ringGrad.addColorStop(0.65, "rgba(150, 60, 15, 0.40)");  // Burnt copper
    ringGrad.addColorStop(0.80, "rgba(215, 150, 40, 0.45)"); // Straw gold
    ringGrad.addColorStop(1.0, "rgba(190, 130, 30, 0.0)");
    ctx.fillStyle = ringGrad;
    ctx.fillRect(rx - rw, 0, rw * 2, 512);
  }

  // 4. Longitudinal brushed titanium/steel metal grain with specular highlights
  for (let i = 0; i < 5000; i++) {
    const y = Math.random() * 512;
    const x = Math.random() * 1024;
    const len = 45 + Math.random() * 240;
    const alpha = 0.12 + Math.random() * 0.24;
    ctx.strokeStyle = Math.random() > 0.42 ? `rgba(245,250,255,${alpha})` : `rgba(15,20,28,${alpha * 1.6})`;
    ctx.lineWidth = 0.5 + Math.random() * 0.85;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // 5. BOLD DUAL-STROKE HIGH-CONTRAST SCRATCHES & TOOL ABRASIONS (400+ scratches)
  for (let sc = 0; sc < 420; sc++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 12 + Math.random() * 60;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    // Dark valley groove
    ctx.strokeStyle = "rgba(10, 14, 18, 0.88)";
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Bright catching metal edge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx + 0.6, sy - 0.6);
    ctx.lineTo(sx + dx + 0.6, sy + dy - 0.6);
    ctx.stroke();
  }

  // Cross-hatch handling scrape patches
  for (let h = 0; h < 40; h++) {
    const hx = Math.random() * 1024;
    const hy = Math.random() * 512;
    for (let l = 0; l < 4; l++) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.68)";
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(hx + l * 5, hy);
      ctx.lineTo(hx + l * 5 + 24, hy + 18);
      ctx.stroke();
    }
  }

  // Heat-discoloration specks, rust pitting, and carbon flecks
  for (let s = 0; s < 1500; s++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 512;
    const r = 0.6 + Math.random() * 1.8;
    const rand = Math.random();
    if (rand < 0.4) {
      ctx.fillStyle = "rgba(220, 85, 20, 0.65)"; // Rust spot
    } else if (rand < 0.7) {
      ctx.fillStyle = "rgba(235, 150, 35, 0.55)"; // Burnt straw fleck
    } else {
      ctx.fillStyle = "rgba(12, 16, 20, 0.75)"; // Carbon pit
    }
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered & Aged Cylinder Barrel Texture (Cast Aluminum Base, Heavy Rust Blooms, Baked Oil & Scratches) ──
export function createWeatheredCylinderTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // 1. Aged weathered cast aluminum alloy base (Restored previous silver-grey tone, NOT black!)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 1024);
  baseGrad.addColorStop(0.00, "#868e98"); // Upper cylinder head firedeck mating interface
  baseGrad.addColorStop(0.18, "#8f97a2"); // Upper barrel wall
  baseGrad.addColorStop(0.50, "#87909b"); // Mid barrel core
  baseGrad.addColorStop(0.82, "#7f8893"); // Lower fin zone
  baseGrad.addColorStop(1.00, "#77808b"); // Base flange seating shoulder
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 1024);

  // 2. Horizontal fin-crevice shadow bands (Soft ambient depth between cooling fins)
  for (let y = 0; y < 1024; y += 16) {
    ctx.fillStyle = "rgba(45, 52, 60, 0.40)"; // Soft shadow in fin valley
    ctx.fillRect(0, y, 1024, 3);
    ctx.fillStyle = "rgba(240, 248, 255, 0.22)"; // Highlight reflection along top lip
    ctx.fillRect(0, y + 3, 1024, 1.5);
  }

  // 3. Prominent Ferrous Rust Blooms & Oxide Patches (Aged engine oxidation fitting with exhaust/block)
  for (let r = 0; r < 55; r++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const rrad = 18 + Math.random() * 55;
    const rustGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, rrad);
    rustGrad.addColorStop(0.0, "rgba(165, 55, 15, 0.88)"); // Burnt core rust
    rustGrad.addColorStop(0.35, "rgba(195, 78, 22, 0.72)"); // Iron oxide red-brown
    rustGrad.addColorStop(0.70, "rgba(215, 105, 30, 0.45)"); // Spreading rust bloom
    rustGrad.addColorStop(1.0, "rgba(180, 85, 20, 0.0)");
    ctx.fillStyle = rustGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Crevice rust runs (dripping rust bleeding downwards along fin roots and stud recesses)
  for (let cr = 0; cr < 40; cr++) {
    const cx = 10 + Math.random() * 1004;
    const cy = Math.random() * 800;
    const clen = 25 + Math.random() * 120;
    const crGrad = ctx.createLinearGradient(cx, cy, cx, cy + clen);
    crGrad.addColorStop(0.0, "rgba(160, 50, 14, 0.80)");
    crGrad.addColorStop(0.6, "rgba(195, 80, 24, 0.50)");
    crGrad.addColorStop(1.0, "rgba(210, 95, 28, 0.0)");
    ctx.strokeStyle = crGrad;
    ctx.lineWidth = 1.2 + Math.random() * 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (Math.random() - 0.5) * 6, cy + clen);
    ctx.stroke();
  }

  // Dense Rust Pitting & Ferrous Micro-Speckles (Over 2,200 rust pits)
  for (let rp = 0; rp < 2200; rp++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const rad = 0.6 + Math.random() * 2.2;
    const isDarkRust = Math.random() > 0.40;
    ctx.fillStyle = isDarkRust ? "rgba(135, 42, 10, 0.90)" : "rgba(215, 88, 25, 0.75)";
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Baked engine heat halos (warm amber/bronze heat oxidation around high-temp cylinder zones)
  for (let h = 0; h < 22; h++) {
    const hx = Math.random() * 1024;
    const hy = 40 + Math.random() * 450; // Upper barrel combustion zone
    const hr = 25 + Math.random() * 75;
    const hGrad = ctx.createRadialGradient(hx, hy, 4, hx, hy, hr);
    hGrad.addColorStop(0.0, "rgba(145, 88, 25, 0.38)"); // Heat bronze
    hGrad.addColorStop(0.6, "rgba(95, 52, 18, 0.20)");
    hGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = hGrad;
    ctx.beginPath();
    ctx.arc(hx, hy, hr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Vertical burnt motor oil drips & grease weep runs (dripping down between fins)
  for (let d = 0; d < 65; d++) {
    const dx = 15 + Math.random() * 994;
    const startY = 20 + Math.random() * 500;
    const len = 40 + Math.random() * 320;
    const dGrad = ctx.createLinearGradient(dx, startY, dx, startY + len);
    dGrad.addColorStop(0.0, "rgba(28, 18, 10, 0.85)");
    dGrad.addColorStop(0.5, "rgba(65, 42, 18, 0.55)"); // Oxidized dark amber oil
    dGrad.addColorStop(1.0, "rgba(85, 55, 24, 0.0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.4 + Math.random() * 2.6;
    ctx.beginPath();
    ctx.moveTo(dx, startY);
    ctx.lineTo(dx + (Math.random() - 0.5) * 7, startY + len);
    ctx.stroke();
  }

  // 6. Heavy sand-cast micro-porosity and foundry grain (16,000+ specks)
  for (let p = 0; p < 16000; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 1024;
    const r = 0.5 + Math.random() * 1.8;
    const isDark = Math.random() > 0.45;
    ctx.fillStyle = isDark ? "rgba(18, 22, 28, 0.55)" : "rgba(240, 248, 255, 0.40)";
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 7. Dual-stroke high-contrast scratches, tool marks & stone dings (600+ scratches)
  for (let s = 0; s < 600; s++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 1024;
    const angle = Math.random() * Math.PI * 2;
    const slen = 10 + Math.random() * 55;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    // Dark groove
    ctx.strokeStyle = "rgba(14, 18, 24, 0.82)";
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Catching bare metal highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.78)";
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx + 0.6, sy - 0.6);
    ctx.lineTo(sx + dx + 0.6, sy + dy - 0.6);
    ctx.stroke();
  }

  // 8. Cluster tool scrapes (service wrench slips around spark plugs and studs)
  for (let c = 0; c < 35; c++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 1024;
    for (let k = 0; k < 5; k++) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.70)";
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(cx + k * 4, cy);
      ctx.lineTo(cx + k * 4 + 20, cy + 14);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// ── Dedicated Weathered Satin Steel Cylinder Fin Rim Edge Texture (Circumferential Lathe Striations, Heat Tint, Baked Oil & Aged Glint) ──
export function createWeatheredFinRimTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // 1. Aged, heat-darkened machined aerospace alloy base with sculpted bevel shadow gradients
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 256);
  baseGrad.addColorStop(0.00, "#48525e"); // Upper bevel shadow / oil crevice
  baseGrad.addColorStop(0.15, "#6a7582"); // Upper shoulder transition
  baseGrad.addColorStop(0.35, "#8e99a6"); // Light-catching metallic mid
  baseGrad.addColorStop(0.50, "#a2adba"); // Worn machined crest (aged satin glint)
  baseGrad.addColorStop(0.65, "#8894a1"); // Lower transition
  baseGrad.addColorStop(0.85, "#626d7a"); // Lower shoulder
  baseGrad.addColorStop(1.00, "#424b56"); // Lower bevel shadow
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 256);

  // 2. Heat discoloration & thermal cycling patina bands (straw, bronze, amber tinting)
  for (let b = 0; b < 8; b++) {
    const by = 20 + Math.random() * 216;
    const bh = 14 + Math.random() * 35;
    const hGrad = ctx.createLinearGradient(0, by, 0, by + bh);
    hGrad.addColorStop(0.0, "rgba(130, 85, 30, 0.0)");
    hGrad.addColorStop(0.5, "rgba(165, 110, 42, 0.28)"); // Straw bronze heat tint
    hGrad.addColorStop(1.0, "rgba(130, 85, 30, 0.0)");
    ctx.fillStyle = hGrad;
    ctx.fillRect(0, by, 1024, bh);
  }

  // 3. High-precision circumferential lathe turning micro-grooves & tool chatter marks
  for (let y = 2; y < 254; y += 2) {
    const isDark = Math.random() > 0.38;
    ctx.strokeStyle = isDark ? "rgba(18, 24, 32, 0.55)" : "rgba(235, 245, 255, 0.40)";
    ctx.lineWidth = 0.60 + Math.random() * 0.90;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 4. Baked motor oil seepage runs and charred carbon drip residues
  for (let d = 0; d < 40; d++) {
    const dx = Math.random() * 1024;
    const dy = Math.random() * 100;
    const dlen = 25 + Math.random() * 130;
    const dGrad = ctx.createLinearGradient(dx, dy, dx, dy + dlen);
    dGrad.addColorStop(0.0, "rgba(12, 8, 4, 0.85)");
    dGrad.addColorStop(0.6, "rgba(42, 28, 14, 0.45)");
    dGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.2 + Math.random() * 2.4;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + (Math.random() - 0.5) * 6, dy + dlen);
    ctx.stroke();
  }

  // 5. Aged ferric oxide / rust blooms & oxidation spots (used engine patina)
  for (let r = 0; r < 55; r++) {
    const rx = Math.random() * 1024;
    const ry = 10 + Math.random() * 236;
    const rrad = 3 + Math.random() * 12;
    const rustGrad = ctx.createRadialGradient(rx, ry, 1, rx, ry, rrad);
    rustGrad.addColorStop(0.0, "rgba(145, 48, 14, 0.80)");
    rustGrad.addColorStop(0.5, "rgba(195, 75, 22, 0.45)");
    rustGrad.addColorStop(1.0, "rgba(210, 90, 26, 0.0)");
    ctx.fillStyle = rustGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. Handling scratches, tool bite gouges and edge dings
  for (let s = 0; s < 350; s++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 256;
    const angle = (Math.random() - 0.5) * 0.45; // primarily circumferential
    const slen = 6 + Math.random() * 38;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    // Dark gouge indentation
    ctx.strokeStyle = "rgba(10, 14, 20, 0.85)";
    ctx.lineWidth = 0.90;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Catching bright bare metal glint along edge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
    ctx.lineWidth = 0.60;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.6);
    ctx.lineTo(sx + dx + 0.5, sy + dy - 0.6);
    ctx.stroke();
  }

  // 7. Micro-porosity specks
  for (let p = 0; p < 6000; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 256;
    const r = 0.4 + Math.random() * 1.3;
    const isDark = Math.random() > 0.45;
    ctx.fillStyle = isDark ? "rgba(12, 16, 22, 0.55)" : "rgba(240, 248, 255, 0.35)";
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Deep Dark Nitrided Cast Iron Cylinder Crevice & Inter-Fin Cavity Texture ──
export function createDarkFinCreviceTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // 1. Deep charcoal / dark nitrided cast iron base (intense shadow depth & aged thermal oxidation)
  ctx.fillStyle = "#181c22";
  ctx.fillRect(0, 0, 512, 512);

  // 2. Concentric radial heat shadow bands radiating from the hot cylinder core
  for (let r = 16; r < 380; r += 10) {
    ctx.strokeStyle = "rgba(8, 10, 14, 0.72)";
    ctx.lineWidth = 4 + Math.random() * 8;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Radial cooling airstream dust streaks blown past the cylinder barrels
  for (let a = 0; a < 36; a++) {
    const angle = (a / 36) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
    const rIn = 40 + Math.random() * 60;
    const rOut = 220 + Math.random() * 35;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(45, 52, 62, 0.35)" : "rgba(8, 6, 4, 0.55)";
    ctx.lineWidth = 1.5 + Math.random() * 3.0;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(angle) * rIn, 256 + Math.sin(angle) * rIn);
    ctx.lineTo(256 + Math.cos(angle) * rOut, 256 + Math.sin(angle) * rOut);
    ctx.stroke();
  }

  // 4. Baked motor oil weeping and dark amber carbon resin
  for (let d = 0; d < 45; d++) {
    const dx = Math.random() * 512;
    const dy = Math.random() * 512;
    const dr = 8 + Math.random() * 42;
    const dGrad = ctx.createRadialGradient(dx, dy, 2, dx, dy, dr);
    dGrad.addColorStop(0.0, "rgba(6, 4, 2, 0.90)");
    dGrad.addColorStop(0.4, "rgba(36, 24, 12, 0.55)");
    dGrad.addColorStop(0.8, "rgba(50, 32, 16, 0.20)");
    dGrad.addColorStop(1.0, "rgba(50, 32, 16, 0.0)");
    ctx.fillStyle = dGrad;
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. Dark sand-cast iron micro-porosity (12,000 micro-pores)
  for (let p = 0; p < 12000; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const pr = 0.4 + Math.random() * 1.6;
    ctx.fillStyle = Math.random() > 0.55 ? "rgba(4, 6, 8, 0.88)" : "rgba(45, 55, 68, 0.38)";
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered & Aged Cylinder Ring Texture (Retention Hoops, Telemetry Ticks, Rust Blooms & Tool Wear) ──
export function createWeatheredCylinderRingTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // 1. Aged spring steel / alloy base with clear metallic cylindrical shading (NOT pitch black!)
  const baseGrad = ctx.createLinearGradient(0, 0, 0, 256);
  baseGrad.addColorStop(0.00, "#747f8c"); // Inner edge / crevice shadow
  baseGrad.addColorStop(0.18, "#8e99a6"); // Upper curved shoulder
  baseGrad.addColorStop(0.50, "#b2beca"); // Bright metallic highlight crest (aged steel sheen)
  baseGrad.addColorStop(0.82, "#8894a1"); // Lower curved shoulder
  baseGrad.addColorStop(1.00, "#6c7784"); // Lower edge shadow
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, 1024, 256);

  // 2. Circumferential lathe micro-grooves & brushed metal striations along hoop circumference
  for (let y = 4; y < 252; y += 2) {
    const isDark = Math.random() > 0.40;
    ctx.strokeStyle = isDark ? "rgba(24, 30, 38, 0.45)" : "rgba(245, 250, 255, 0.45)";
    ctx.lineWidth = 0.6 + Math.random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // 3. PROMINENT, VIVID, CLEAR FERROUS RUST BLOOMS & OXIDATION PATCHES (Vibrant ferric oxide rust)
  for (let r = 0; r < 90; r++) {
    const rx = Math.random() * 1024;
    const ry = 12 + Math.random() * 232;
    const rrad = 14 + Math.random() * 46;
    const rustGrad = ctx.createRadialGradient(rx, ry, 2, rx, ry, rrad);
    rustGrad.addColorStop(0.0, "rgba(138, 36, 6, 0.99)");   // Burnt ferric oxide core
    rustGrad.addColorStop(0.25, "rgba(196, 60, 10, 0.96)"); // Rich hematite red-orange
    rustGrad.addColorStop(0.60, "rgba(232, 92, 18, 0.88)"); // Vibrant powdery rust bloom
    rustGrad.addColorStop(0.85, "rgba(248, 136, 36, 0.55)");// Fine powdery orange halo
    rustGrad.addColorStop(1.0, "rgba(220, 95, 24, 0.0)");
    ctx.fillStyle = rustGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Horizontal rust banding along the outer crest & lower edge
  for (let rb = 0; rb < 26; rb++) {
    const rbx = Math.random() * 900;
    const rby = 30 + Math.random() * 196;
    const rblen = 60 + Math.random() * 200;
    const rbGrad = ctx.createLinearGradient(rbx, rby, rbx + rblen, rby);
    rbGrad.addColorStop(0.0, "rgba(180, 55, 10, 0.0)");
    rbGrad.addColorStop(0.2, "rgba(212, 72, 14, 0.95)");
    rbGrad.addColorStop(0.8, "rgba(238, 98, 22, 0.90)");
    rbGrad.addColorStop(1.0, "rgba(180, 55, 10, 0.0)");
    ctx.strokeStyle = rbGrad;
    ctx.lineWidth = 2.8 + Math.random() * 4.5;
    ctx.beginPath();
    ctx.moveTo(rbx, rby);
    ctx.lineTo(rbx + rblen, rby);
    ctx.stroke();
  }

  // Crevice rust runs (vertical rust streaks bleeding down across the hoop face)
  for (let cr = 0; cr < 60; cr++) {
    const cx = Math.random() * 1024;
    const cy = Math.random() * 150;
    const clen = 25 + Math.random() * 100;
    const crGrad = ctx.createLinearGradient(cx, cy, cx, cy + clen);
    crGrad.addColorStop(0.0, "rgba(155, 42, 8, 0.98)");
    crGrad.addColorStop(0.4, "rgba(215, 78, 16, 0.85)");
    crGrad.addColorStop(0.8, "rgba(240, 110, 30, 0.50)");
    crGrad.addColorStop(1.0, "rgba(240, 110, 30, 0.0)");
    ctx.strokeStyle = crGrad;
    ctx.lineWidth = 1.6 + Math.random() * 3.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + (Math.random() - 0.5) * 8, cy + clen);
    ctx.stroke();
  }

  // Intense Rust Pitting & Micro-Pores (4,000+ pits)
  for (let rp = 0; rp < 4000; rp++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 256;
    const rad = 0.6 + Math.random() * 2.6;
    const isDarkRust = Math.random() > 0.40;
    ctx.fillStyle = isDarkRust ? "rgba(118, 30, 6, 0.98)" : "rgba(232, 84, 18, 0.92)";
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Baked motor oil drips & dark carbon grease stains
  for (let d = 0; d < 50; d++) {
    const dx = Math.random() * 1024;
    const dy = Math.random() * 140;
    const len = 20 + Math.random() * 110;
    const dGrad = ctx.createLinearGradient(dx, dy, dx, dy + len);
    dGrad.addColorStop(0.0, "rgba(20, 12, 6, 0.92)");
    dGrad.addColorStop(0.5, "rgba(65, 38, 14, 0.65)"); // Oxidized dark amber oil
    dGrad.addColorStop(1.0, "rgba(90, 58, 22, 0.0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.4 + Math.random() * 2.4;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + (Math.random() - 0.5) * 6, dy + len);
    ctx.stroke();
  }

  // 5. Engineering Calibration Ticks & Degree Markings along hoop circumference
  ctx.fillStyle = "rgba(245, 250, 255, 0.95)";
  ctx.font = "bold 12px monospace";
  ctx.textAlign = "center";

  for (let x = 0; x < 1024; x += 16) {
    const isMajor = x % 64 === 0;
    const isMedium = x % 32 === 0;
    const tickLen = isMajor ? 22 : (isMedium ? 14 : 8);

    // Top edge ticks
    ctx.strokeStyle = isMajor ? "rgba(255, 255, 255, 0.98)" : "rgba(220, 235, 250, 0.65)";
    ctx.lineWidth = isMajor ? 1.8 : 1.0;
    ctx.beginPath();
    ctx.moveTo(x, 4);
    ctx.lineTo(x, 4 + tickLen);
    ctx.stroke();

    // Degree labels on major ticks
    if (isMajor) {
      const deg = Math.round((x / 1024) * 360);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${deg}°`, x, 38);
    }

    // Bottom edge micro-ticks
    ctx.beginPath();
    ctx.moveTo(x, 252);
    ctx.lineTo(x, 252 - (isMajor ? 18 : 8));
    ctx.stroke();
  }

  // 6. Laser-Etched Aerospace Identification & Spec Stampings
  ctx.font = "bold 13px monospace";
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fillText("VRDE-AERO // 180HP CYLINDER TENSION HOOP // SPEC-4140-HT // TORQUE: 24 N·m", 320, 134);
  ctx.fillText("▲ TDC 0° INDEX // DRDO-AV-QUAL // SER# CYL-80-B4 // BDC 180° ▼", 820, 134);

  // 7. Heavy Sand-Cast Micro-Porosity (9,000+ specks)
  for (let p = 0; p < 9000; p++) {
    const px = Math.random() * 1024;
    const py = Math.random() * 256;
    const r = 0.5 + Math.random() * 1.6;
    const isDark = Math.random() > 0.45;
    ctx.fillStyle = isDark ? "rgba(14, 18, 24, 0.55)" : "rgba(255, 255, 255, 0.50)";
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 8. Dual-Stroke Tool Marks & Handling Scratches (500+ scratches)
  for (let s = 0; s < 500; s++) {
    const sx = Math.random() * 1024;
    const sy = Math.random() * 256;
    const angle = Math.random() * Math.PI * 2;
    const slen = 8 + Math.random() * 50;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    // Dark groove
    ctx.strokeStyle = "rgba(10, 14, 20, 0.90)";
    ctx.lineWidth = 0.90;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Catching bright bare metal highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.94)";
    ctx.lineWidth = 0.65;
    ctx.beginPath();
    ctx.moveTo(sx + 0.6, sy - 0.6);
    ctx.lineTo(sx + dx + 0.6, sy + dy - 0.6);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered Cast Aluminum Texture (Noticeable Scratches, Porosity & Oil Stains) ──
export function createWeatheredCastAluminumTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Raw weathered cast aluminum alloy base
  ctx.fillStyle = "#8a929b";
  ctx.fillRect(0, 0, 512, 512);

  // High-contrast micro-pitting and foundry sand-cast porosity
  for (let i = 0; i < 12000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 0.5 + Math.random() * 1.8;
    const dark = Math.random() > 0.45;
    ctx.fillStyle = dark ? "rgba(10, 14, 18, 0.60)" : "rgba(240, 248, 255, 0.40)";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark motor oil smudges, grease spots, and oxidized fuel residue
  for (let g = 0; g < 80; g++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const gr = 8 + Math.random() * 30;
    const greaseGrad = ctx.createRadialGradient(gx, gy, 2, gx, gy, gr);
    greaseGrad.addColorStop(0.0, "rgba(20, 15, 10, 0.68)");
    greaseGrad.addColorStop(0.5, "rgba(85, 58, 22, 0.38)"); // Yellowed oxidized oil
    greaseGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = greaseGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // HIGH-CONTRAST NOTICEABLE SCRATCHES & HANDLING TOOL MARKS EVERYWHERE (550+ scratches)
  for (let s = 0; s < 550; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 10 + Math.random() * 55;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    // Dark gouge groove
    ctx.strokeStyle = "rgba(10, 15, 20, 0.85)";
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    // Bright exposed bare metal edge
    ctx.strokeStyle = "rgba(255, 255, 255, 0.80)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx + 0.6, sy - 0.6);
    ctx.lineTo(sx + dx + 0.6, sy + dy - 0.6);
    ctx.stroke();
  }

  // Cluster scrape marks
  for (let c = 0; c < 30; c++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    for (let k = 0; k < 5; k++) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.70)";
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      ctx.moveTo(cx + k * 3, cy);
      ctx.lineTo(cx + k * 3 + 18, cy + 12);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}



// Procedural Weathered Silkscreened Label Texture for Oil Filter (Aged Charcoal, NOT pitch black)
export function createOilFilterLabelTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  // Aged dark charcoal/graphite coating (NOT pitch black!)
  const grad = ctx.createLinearGradient(0, 0, 512, 256);
  grad.addColorStop(0.0, "#262c35");
  grad.addColorStop(0.5, "#323a44");
  grad.addColorStop(1.0, "#222730");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 256);

  // Surface micro-stippling and foundry speckles
  for (let p = 0; p < 4000; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 256;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(12, 16, 20, 0.45)" : "rgba(220, 230, 240, 0.20)";
    ctx.beginPath();
    ctx.arc(px, py, 0.5 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Yellowed oxidized engine oil drips running down the canister
  for (let d = 0; d < 18; d++) {
    const dx = 20 + Math.random() * 472;
    const dy = 10 + Math.random() * 80;
    const dlen = 40 + Math.random() * 150;
    const dGrad = ctx.createLinearGradient(dx, dy, dx, dy + dlen);
    dGrad.addColorStop(0.0, "rgba(20, 15, 8, 0.75)");
    dGrad.addColorStop(0.5, "rgba(75, 52, 20, 0.40)");
    dGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.2 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + (Math.random() - 0.5) * 4, dy + dlen);
    ctx.stroke();
  }

  // Border frame (slightly weathered and chipped)
  ctx.strokeStyle = "rgba(230, 240, 250, 0.75)";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(20, 20, 472, 216);

  // Silkscreened white text
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "bold 44px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("VRDE 180HP", 256, 85);

  ctx.font = "bold 24px 'Inter', sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("AERO OIL FILTER — HIGH EFFICIENCY", 256, 130);

  ctx.font = "18px 'Inter', monospace";
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("PART NO: VRDE-OF-180-A1  •  DRDO / VRDE", 256, 175);
  ctx.fillText("TIGHTEN 3/4 TURN AFTER GASKET CONTACT", 256, 205);

  // High-contrast scratches across label and body
  for (let s = 0; s < 90; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 256;
    const angle = Math.random() * Math.PI * 2;
    const slen = 10 + Math.random() * 45;
    ctx.strokeStyle = "rgba(10, 14, 18, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ── Procedural Weathered Carbon Fiber Composite Texture (Aged Graphite Weave, Stone Dings & Scratches) ──
export function createWeatheredCarbonFiberTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged charcoal/graphite composite base (NOT pitch black!)
  ctx.fillStyle = "#323942";
  ctx.fillRect(0, 0, 512, 512);

  // Twill 2x2 woven carbon fiber pattern
  const tileSize = 16;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const isAlt = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isAlt ? "#3c444f" : "#282e36";
      ctx.fillRect(x, y, tileSize, tileSize);

      // Fiber bundle filament sheen
      ctx.strokeStyle = isAlt ? "rgba(200, 215, 230, 0.18)" : "rgba(15, 20, 26, 0.25)";
      ctx.lineWidth = 1.0;
      for (let f = 2; f < tileSize; f += 3) {
        ctx.beginPath();
        if (isAlt) {
          ctx.moveTo(x + f, y);
          ctx.lineTo(x + f, y + tileSize);
        } else {
          ctx.moveTo(x, y + f);
          ctx.lineTo(x + tileSize, y + f);
        }
        ctx.stroke();
      }
    }
  }

  // Worn UV oxidation & hazy resin wash
  for (let o = 0; o < 25; o++) {
    const ox = Math.random() * 512;
    const oy = Math.random() * 512;
    const or = 20 + Math.random() * 60;
    const oxGrad = ctx.createRadialGradient(ox, oy, 5, ox, oy, or);
    oxGrad.addColorStop(0.0, "rgba(180, 195, 210, 0.18)");
    oxGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = oxGrad;
    ctx.beginPath();
    ctx.arc(ox, oy, or, 0, Math.PI * 2);
    ctx.fill();
  }

  // Leading-edge stone dings and chip marks
  for (let d = 0; d < 80; d++) {
    const dx = Math.random() * 512;
    const dy = Math.random() * 512;
    const dr = 1.0 + Math.random() * 2.8;
    ctx.fillStyle = Math.random() > 0.4 ? "rgba(220, 235, 250, 0.65)" : "rgba(10, 14, 18, 0.75)";
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scratches and flight abrasion lines
  for (let s = 0; s < 200; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 10 + Math.random() * 45;
    ctx.strokeStyle = "rgba(10, 14, 18, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(220, 235, 250, 0.70)";
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// ── Procedural Weathered Aero Polymer Texture (ECU & Ignition Coils — Stippled Graphite, Heat Dust & Tool Scuffs) ──
export function createWeatheredAeroPolymerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged dark graphite polymer base (NOT pitch black!)
  ctx.fillStyle = "#343b44";
  ctx.fillRect(0, 0, 512, 512);

  // Stippled molding grain & micro-porosity
  for (let p = 0; p < 10000; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const dark = Math.random() > 0.45;
    ctx.fillStyle = dark ? "rgba(12, 16, 20, 0.55)" : "rgba(190, 205, 220, 0.22)";
    ctx.beginPath();
    ctx.arc(px, py, 0.6 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Baked engine heat dust in crevices
  for (let d = 0; d < 35; d++) {
    const dx = Math.random() * 512;
    const dy = Math.random() * 512;
    const dr = 12 + Math.random() * 35;
    const dustGrad = ctx.createRadialGradient(dx, dy, 2, dx, dy, dr);
    dustGrad.addColorStop(0.0, "rgba(85, 75, 60, 0.35)"); // Heat dust
    dustGrad.addColorStop(0.6, "rgba(45, 38, 30, 0.18)");
    dustGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = dustGrad;
    ctx.beginPath();
    ctx.arc(dx, dy, dr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Tool scuffs and scratches
  for (let s = 0; s < 180; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 8 + Math.random() * 40;
    ctx.strokeStyle = "rgba(10, 14, 18, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(220, 230, 240, 0.70)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

// ── Procedural Weathered Braided Harness & Rubber Texture (Weave, Rubber Bloom & Grease) ──
export function createWeatheredBraidedHarnessTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged dark slate rubber/loom base
  ctx.fillStyle = "#30363f";
  ctx.fillRect(0, 0, 512, 512);

  // Braided herringbone heat-shield weave
  for (let y = 0; y < 512; y += 10) {
    for (let x = 0; x < 512; x += 10) {
      ctx.strokeStyle = ((x + y) / 10) % 2 === 0 ? "rgba(190, 205, 220, 0.20)" : "rgba(10, 14, 18, 0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10, y + 10);
      ctx.stroke();
    }
  }

  // Oxidized rubber chalking / white bloom
  for (let b = 0; b < 25; b++) {
    const bx = Math.random() * 512;
    const by = Math.random() * 512;
    const br = 15 + Math.random() * 45;
    const bloomGrad = ctx.createRadialGradient(bx, by, 3, bx, by, br);
    bloomGrad.addColorStop(0.0, "rgba(200, 215, 225, 0.16)");
    bloomGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Grease and motor oil smudges
  for (let g = 0; g < 30; g++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const gr = 8 + Math.random() * 24;
    const gGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, gr);
    gGrad.addColorStop(0.0, "rgba(15, 12, 8, 0.65)");
    gGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = gGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Handling scuffs
  for (let s = 0; s < 140; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const slen = 8 + Math.random() * 32;
    ctx.strokeStyle = "rgba(220, 230, 240, 0.40)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + slen, sy + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function createHoneycombTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#05070a";
  ctx.fillRect(0, 0, 256, 256);
  ctx.strokeStyle = "#475569";
  ctx.lineWidth = 1.5;
  const hexRadius = 9;
  const dx = hexRadius * Math.sqrt(3);
  const dy = hexRadius * 1.5;
  for (let row = -1; row < 22; row++) {
    for (let col = -1; col < 22; col++) {
      const cx = col * dx + ((row % 2) * dx) / 2;
      const cy = row * dy;
      ctx.beginPath();
      for (let a = 0; a < 6; a++) {
        const angle = (Math.PI / 3) * a + Math.PI / 6;
        const x = cx + hexRadius * Math.cos(angle);
        const y = cy + hexRadius * Math.sin(angle);
        if (a === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = "#020406";
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

// ── Procedural Weathered Aviation Brass Texture (Scratches, Verdigris Patina & Oil Grime) ──
export function createWeatheredBrassTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged golden brass base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0.0, "#a8852a");
  grad.addColorStop(0.4, "#bfa042");
  grad.addColorStop(0.7, "#9c761f");
  grad.addColorStop(1.0, "#856214");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Brushed directional metal grain
  for (let i = 0; i < 2800; i++) {
    const y = Math.random() * 512;
    const x = Math.random() * 512;
    const len = 20 + Math.random() * 90;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(255, 245, 210, 0.18)" : "rgba(30, 22, 10, 0.25)";
    ctx.lineWidth = 0.5 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // Verdigris and dark brownish tarnish patina in crevices
  for (let p = 0; p < 45; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    const pr = 10 + Math.random() * 32;
    const tarnishGrad = ctx.createRadialGradient(px, py, 2, px, py, pr);
    tarnishGrad.addColorStop(0.0, "rgba(28, 38, 22, 0.48)"); // Subtle verdigris green
    tarnishGrad.addColorStop(0.6, "rgba(55, 40, 18, 0.32)"); // Brownish oxidation
    tarnishGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = tarnishGrad;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark motor oil stains and grease fingerprints
  for (let g = 0; g < 35; g++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const gr = 6 + Math.random() * 22;
    const oilGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, gr);
    oilGrad.addColorStop(0.0, "rgba(18, 12, 6, 0.70)");
    oilGrad.addColorStop(0.6, "rgba(42, 28, 14, 0.30)");
    oilGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = oilGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // HIGH-CONTRAST DUAL-STROKE SCRATCHES & TOOL MARKS
  for (let s = 0; s < 220; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 10 + Math.random() * 45;
    const dx = Math.cos(angle) * slen;
    const dy = Math.sin(angle) * slen;

    ctx.strokeStyle = "rgba(12, 10, 6, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + dx, sy + dy);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 235, 0.85)";
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + dx + 0.5, sy + dy - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered Copper Compression Gasket Texture (Dark Oxidation, Scratches & Soot) ──
export function createWeatheredCopperTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged industrial copper base (NOT bright orange, authentic deep copper)
  ctx.fillStyle = "#7c3e20";
  ctx.fillRect(0, 0, 512, 512);

  // Carbon scorch rings and heat halos
  for (let c = 0; c < 20; c++) {
    const cx = Math.random() * 512;
    const cy = Math.random() * 512;
    const cr = 15 + Math.random() * 45;
    const scorchGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, cr);
    scorchGrad.addColorStop(0.0, "rgba(15, 12, 10, 0.70)");
    scorchGrad.addColorStop(0.5, "rgba(65, 30, 15, 0.40)");
    scorchGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = scorchGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro-pitting and compression tool impressions
  for (let p = 0; p < 4500; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(10, 8, 6, 0.55)" : "rgba(255, 190, 150, 0.28)";
    ctx.beginPath();
    ctx.arc(px, py, 0.6 + Math.random() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dual-stroke scratch marks
  for (let s = 0; s < 180; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 8 + Math.random() * 38;
    ctx.strokeStyle = "rgba(10, 8, 6, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 205, 175, 0.80)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered Red Silicone & Wire Texture (Grime, Oil Soot & Tool Scuffs) ──
export function createWeatheredRedSiliconeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged military aerospace red silicone base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0.0, "#9c2424");
  grad.addColorStop(0.5, "#a82a2a");
  grad.addColorStop(1.0, "#871c1c");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Burnt engine oil soot and greasy handling smudges
  for (let g = 0; g < 45; g++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const gr = 8 + Math.random() * 26;
    const grimeGrad = ctx.createRadialGradient(gx, gy, 2, gx, gy, gr);
    grimeGrad.addColorStop(0.0, "rgba(18, 12, 10, 0.70)");
    grimeGrad.addColorStop(0.6, "rgba(45, 22, 18, 0.35)");
    grimeGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = grimeGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro-porosity and rubber molding flecks
  for (let p = 0; p < 5000; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.55 ? "rgba(12, 8, 8, 0.50)" : "rgba(240, 160, 160, 0.22)";
    ctx.beginPath();
    ctx.arc(px, py, 0.5 + Math.random() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Scuffs, cuts, and scratch abrasions
  for (let s = 0; s < 200; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 10 + Math.random() * 40;
    ctx.strokeStyle = "rgba(12, 8, 8, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 200, 200, 0.70)";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered Anodized Blue Aluminum Texture (Wrench Wear, Scratches & Grease) ──
export function createWeatheredAnodizedBlueTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Deep aerospace anodized cobalt blue base
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0.0, "#1a3e8c");
  grad.addColorStop(0.45, "#2252b5");
  grad.addColorStop(1.0, "#153375");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Machined turning lines
  for (let i = 0; i < 2200; i++) {
    const y = Math.random() * 512;
    const x = Math.random() * 512;
    const len = 15 + Math.random() * 80;
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(180, 220, 255, 0.20)" : "rgba(8, 16, 40, 0.35)";
    ctx.lineWidth = 0.5 + Math.random() * 0.7;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }

  // Wrench-wear edges revealing bare silver aluminum
  for (let w = 0; w < 30; w++) {
    const wx = Math.random() * 512;
    const wy = Math.random() * 512;
    const wlen = 20 + Math.random() * 60;
    ctx.strokeStyle = "rgba(225, 238, 255, 0.85)";
    ctx.lineWidth = 1.0 + Math.random() * 1.2;
    ctx.beginPath();
    ctx.moveTo(wx, wy);
    ctx.lineTo(wx + wlen, wy + (Math.random() - 0.5) * 4);
    ctx.stroke();
  }

  // Tool scratches & gouges
  for (let s = 0; s < 180; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 8 + Math.random() * 35;
    ctx.strokeStyle = "rgba(5, 12, 28, 0.85)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(240, 248, 255, 0.85)";
    ctx.lineWidth = 0.55;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  // Thread grease smudges
  for (let g = 0; g < 25; g++) {
    const gx = Math.random() * 512;
    const gy = Math.random() * 512;
    const gr = 6 + Math.random() * 20;
    const greaseGrad = ctx.createRadialGradient(gx, gy, 1, gx, gy, gr);
    greaseGrad.addColorStop(0.0, "rgba(10, 14, 20, 0.70)");
    greaseGrad.addColorStop(0.7, "rgba(20, 30, 45, 0.30)");
    greaseGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.fillStyle = greaseGrad;
    ctx.beginPath();
    ctx.arc(gx, gy, gr, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── Procedural Weathered Oil Cooler Matrix Texture (Stamped Fins, Dirt Wash & Scratches) ──
export function createWeatheredCoolerMatrixTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  // Aged stamped aluminum alloy base
  ctx.fillStyle = "#6e7782";
  ctx.fillRect(0, 0, 512, 512);

  // Horizontal matrix fin shadowing
  for (let y = 0; y < 512; y += 8) {
    ctx.fillStyle = "rgba(12, 16, 22, 0.65)";
    ctx.fillRect(0, y, 512, 3);
    ctx.fillStyle = "rgba(230, 240, 250, 0.30)";
    ctx.fillRect(0, y + 3, 512, 2);
  }

  // Dark road grime and motor oil wash streaks
  for (let d = 0; d < 40; d++) {
    const dx = Math.random() * 512;
    const dy = Math.random() * 300;
    const dlen = 40 + Math.random() * 180;
    const dGrad = ctx.createLinearGradient(dx, dy, dx, dy + dlen);
    dGrad.addColorStop(0.0, "rgba(15, 12, 8, 0.75)");
    dGrad.addColorStop(0.6, "rgba(35, 26, 16, 0.35)");
    dGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.0)");
    ctx.strokeStyle = dGrad;
    ctx.lineWidth = 1.5 + Math.random() * 3.0;
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(dx + (Math.random() - 0.5) * 6, dy + dlen);
    ctx.stroke();
  }

  // Stone-chip dings and high-contrast scratches
  for (let s = 0; s < 250; s++) {
    const sx = Math.random() * 512;
    const sy = Math.random() * 512;
    const angle = Math.random() * Math.PI * 2;
    const slen = 6 + Math.random() * 32;
    ctx.strokeStyle = "rgba(10, 14, 18, 0.85)";
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + Math.cos(angle) * slen, sy + Math.sin(angle) * slen);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.80)";
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.moveTo(sx + 0.5, sy - 0.5);
    ctx.lineTo(sx + Math.cos(angle) * slen + 0.5, sy + Math.sin(angle) * slen - 0.5);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

// ── EXACT AEROSPACE MATERIALS PALETTE (CALIBRATED FROM DRDO VRDE PHOTOS) ─────
export function createVRDEMaterials(envMap) {
  const brushedMap = createBrushedMetalTexture();
  const meshMap = createHoneycombTexture();
  const filterLabelMap = createOilFilterLabelTexture();
  const weatheredCastMap = createWeatheredCastAluminumTexture();
  const mufflerWeatheredMap = createWeatheredStainlessMufflerTexture();
  const charredExhaustMap = createCharredGraphiteExhaustTexture();
  const weatheredBrassMap = createWeatheredBrassTexture();
  const weatheredCopperMap = createWeatheredCopperTexture();
  const weatheredRedSiliconeMap = createWeatheredRedSiliconeTexture();
  const weatheredAnodizedBlueMap = createWeatheredAnodizedBlueTexture();
  const weatheredCoolerMatrixMap = createWeatheredCoolerMatrixTexture();
  const weatheredCarbonMap = createWeatheredCarbonFiberTexture();
  const weatheredPolymerMap = createWeatheredAeroPolymerTexture();
  const weatheredHarnessMap = createWeatheredBraidedHarnessTexture();
  const weatheredCylinderMap = createWeatheredCylinderTexture();
  const weatheredFinRimMap = createWeatheredFinRimTexture();
  const darkFinCreviceMap = createDarkFinCreviceTexture();
  const weatheredCylinderRingMap = createWeatheredCylinderRingTexture();

  const mats = {
    // A. Main Weathered Cast Aluminum: crankcase, cylinder head, reduction housing, rear housing, oil pan
    // Authentic sand-cast porosity, micro-pits, and grease smudges matching the reference image
    castAluminum: new THREE.MeshStandardMaterial({
      color: 0x828b95,
      roughness: 0.40,
      metalness: 0.80,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.20,
      name: "castAluminum",
    }),

    // B. Machined / Stamped Aluminum: flanges, bearing housings, circular covers, rocker cover casing
    machinedAluminum: new THREE.MeshStandardMaterial({
      color: 0x9099a4,
      roughness: 0.30,
      metalness: 0.86,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.30,
      name: "machinedAluminum",
    }),

    // C. Dark Forged Steel: crankshaft, connecting rods, gears, main bearings, mounting struts (Aged weathered graphite, NOT pitch black)
    forgedSteel: new THREE.MeshStandardMaterial({
      color: 0x48515c,
      roughness: 0.28,
      metalness: 0.88,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.25,
      name: "forgedSteel",
    }),

    // D. Cylinder Barrels: Authentically aged, used, and prominent air-cooled aero engine profile
    // Deep dark nitrided cast iron with baked oil & thermal cycle halos + aged tool-used satin steel fin rims
    cylinderBarrel: new THREE.MeshStandardMaterial({
      color: 0x1e222a,
      roughness: 0.62,
      metalness: 0.62,
      map: darkFinCreviceMap,
      bumpMap: darkFinCreviceMap,
      bumpScale: 0.0022,
      envMap,
      envMapIntensity: 0.80,
      name: "cylinderBarrel",
    }),
    darkCylinderFin: new THREE.MeshStandardMaterial({
      color: 0x262c36,
      roughness: 0.60,
      metalness: 0.65,
      map: darkFinCreviceMap,
      bumpMap: darkFinCreviceMap,
      bumpScale: 0.0026,
      envMap,
      envMapIntensity: 0.85,
      name: "darkCylinderFin",
    }),
    // Weathered satin steel fin rim edges: Aged, tool-used metallic edge with heat patina and light-catching worn crest
    finGlintSilver: new THREE.MeshStandardMaterial({
      color: 0x929ca9,
      roughness: 0.40,
      metalness: 0.80,
      map: weatheredFinRimMap,
      bumpMap: weatheredFinRimMap,
      bumpScale: 0.0028,
      envMap,
      envMapIntensity: 1.25,
      name: "finGlintSilver",
    }),
    cylinderFinRim: new THREE.MeshStandardMaterial({
      color: 0x8893a1,
      roughness: 0.44,
      metalness: 0.76,
      map: weatheredFinRimMap,
      bumpMap: weatheredFinRimMap,
      bumpScale: 0.0032,
      envMap,
      envMapIntensity: 1.20,
      name: "cylinderFinRim",
    }),
    // D2. Cylinder Retention Hoops / Rings: Weathered titanium-steel with calibration ticks, rust blooms, oil weeps, and tool marks
    cylinderRetentionRing: new THREE.MeshStandardMaterial({
      color: 0xd5dce4,
      roughness: 0.28,
      metalness: 0.84,
      map: weatheredCylinderRingMap,
      envMap,
      envMapIntensity: 1.45,
      name: "cylinderRetentionRing",
    }),

    // E. Pistons: machined aluminum alloy
    pistonAlloy: new THREE.MeshStandardMaterial({
      color: 0x949ca5,
      roughness: 0.24,
      metalness: 0.88,
      envMap,
      envMapIntensity: 1.1,
      name: "pistonAlloy",
    }),

    // F. Piston Rings: aged dark graphite steel with cast micro-grain
    pistonRing: new THREE.MeshStandardMaterial({
      color: 0x424a54,
      roughness: 0.30,
      metalness: 0.85,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.10,
      name: "pistonRing",
    }),
    pistonSkirtMoly: new THREE.MeshStandardMaterial({
      color: 0x3a424c,
      roughness: 0.44,
      metalness: 0.38,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 0.95,
      name: "pistonSkirtMoly",
    }),

    // H. Fuel Rail & Aviation Brass: aged aeronautical oxidized brass with warm bronze-gold patina, scratches & verdigris
    fuelRail: new THREE.MeshStandardMaterial({
      color: 0x9c7b28,
      roughness: 0.28,
      metalness: 0.88,
      map: weatheredBrassMap,
      envMap,
      envMapIntensity: 1.35,
      name: "fuelRail",
    }),
    aviationBrass: new THREE.MeshStandardMaterial({
      color: 0x9c7b28,
      roughness: 0.28,
      metalness: 0.88,
      map: weatheredBrassMap,
      envMap,
      envMapIntensity: 1.35,
      name: "aviationBrass",
    }),

    // I. Fuel Injectors: weathered polymer composite body with signature aviation red clip
    fuelInjector: new THREE.MeshStandardMaterial({
      color: 0x3a424c,
      roughness: 0.36,
      metalness: 0.38,
      map: weatheredPolymerMap,
      envMap,
      envMapIntensity: 1.10,
      name: "fuelInjector",
    }),
    fuelInjectorRed: new THREE.MeshStandardMaterial({
      color: 0x962222,
      roughness: 0.32,
      metalness: 0.20,
      map: weatheredRedSiliconeMap,
      name: "fuelInjectorRed",
    }),

    // J. Ignition Coils & ECU: weathered dark slate/graphite polymer with micro-porosity and tool scuffs (NOT pitch black!)
    ignitionCoil: new THREE.MeshStandardMaterial({
      color: 0x3c444e,
      roughness: 0.40,
      metalness: 0.30,
      map: weatheredPolymerMap,
      envMap,
      envMapIntensity: 1.10,
      name: "ignitionCoil",
    }),
    ecu: new THREE.MeshStandardMaterial({
      color: 0x3c444e,
      roughness: 0.40,
      metalness: 0.30,
      map: weatheredPolymerMap,
      envMap,
      envMapIntensity: 1.10,
      name: "ecu",
    }),
    ecuBlack: new THREE.MeshStandardMaterial({
      color: 0x363d46,
      roughness: 0.40,
      metalness: 0.28,
      map: weatheredPolymerMap,
      envMap,
      envMapIntensity: 1.05,
      name: "ecuBlack",
    }),

    // K. Ignition Wires & Silicone (Aged, soiled with engine grime, tool scuffs)
    ignitionWire: new THREE.MeshStandardMaterial({
      color: 0x962222,
      roughness: 0.38,
      metalness: 0.12,
      map: weatheredRedSiliconeMap,
      name: "ignitionWire",
    }),
    ignitionHarness: new THREE.MeshStandardMaterial({
      color: 0x3a414b,
      roughness: 0.58,
      metalness: 0.18,
      map: weatheredHarnessMap,
      envMap,
      envMapIntensity: 1.05,
      name: "ignitionHarness",
    }),
    redSilicone: new THREE.MeshStandardMaterial({
      color: 0x962222,
      roughness: 0.38,
      metalness: 0.12,
      map: weatheredRedSiliconeMap,
      emissive: 0x220606,
      emissiveIntensity: 0.10,
      name: "redSilicone",
    }),

    // L. Spark Plugs: silver metal body + ceramic insulator
    sparkPlugMetal: new THREE.MeshStandardMaterial({
      color: 0x949da6,
      roughness: 0.16,
      metalness: 0.92,
      envMap,
      envMapIntensity: 1.3,
      name: "sparkPlugMetal",
    }),
    sparkPlugCeramic: new THREE.MeshStandardMaterial({
      color: 0xd8dee6,
      roughness: 0.22,
      metalness: 0.05,
      name: "sparkPlugCeramic",
    }),
    ceramicWhite: new THREE.MeshStandardMaterial({
      color: 0xd8dee6,
      roughness: 0.22,
      metalness: 0.05,
      name: "ceramicWhite",
    }),

    // M. Exhaust & Intake Runners: Aged industrial stainless/titanium alloy base with authentic golden-straw, burnt copper, and tempered cobalt blue heat effects (ZERO garish purple!)
    exhaustManifold: new THREE.MeshStandardMaterial({
      color: 0xb4bcc6,
      roughness: 0.28,
      metalness: 0.82,
      map: charredExhaustMap,
      envMap,
      envMapIntensity: 1.55,
      name: "exhaustManifold",
    }),
    exhaustHeatBlued: new THREE.MeshStandardMaterial({
      color: 0xb4bcc6,
      roughness: 0.28,
      metalness: 0.82,
      map: charredExhaustMap,
      envMap,
      envMapIntensity: 1.55,
      name: "exhaustHeatBlued",
    }),
    exhaustTitaniumHeat: new THREE.MeshStandardMaterial({
      color: 0xb4bcc6,
      roughness: 0.28,
      metalness: 0.82,
      map: charredExhaustMap,
      envMap,
      envMapIntensity: 1.55,
      name: "exhaustTitaniumHeat",
    }),
    exhaustChrome: new THREE.MeshStandardMaterial({
      color: 0x98a2ad,
      roughness: 0.14,
      metalness: 0.94,
      envMap,
      envMapIntensity: 1.4,
      name: "exhaustChrome",
    }),

    // N. Muffler Canister: Weathered brushed stainless steel with burnt amber/rust heat bands and scratches
    mufflerSilencer: new THREE.MeshStandardMaterial({
      color: 0xa0a8b2,
      roughness: 0.30,
      metalness: 0.88,
      map: mufflerWeatheredMap,
      envMap,
      envMapIntensity: 1.40,
      name: "mufflerSilencer",
    }),
    mirrorStainless: new THREE.MeshStandardMaterial({
      color: 0x8e97a2,
      roughness: 0.16,
      metalness: 0.90,
      envMap,
      envMapIntensity: 1.2,
      name: "mirrorStainless",
    }),

    // O. Oil Filter & Canister: Weathered dark satin canister with white silkscreen label & oil drips (NOT pitch black!)
    oilFilter: new THREE.MeshStandardMaterial({
      color: 0x303740,
      roughness: 0.28,
      metalness: 0.28,
      map: filterLabelMap,
      envMap,
      envMapIntensity: 1.15,
      name: "oilFilter",
    }),
    oilFilterCanister: new THREE.MeshStandardMaterial({
      color: 0x303740,
      roughness: 0.26,
      metalness: 0.28,
      map: filterLabelMap,
      envMap,
      envMapIntensity: 1.15,
      name: "oilFilterCanister",
    }),

    // P. Oil Cooler & Matrix: Stamped aluminum matrix with oil wash & stone dings
    oilCooler: new THREE.MeshStandardMaterial({
      color: 0x727c88,
      roughness: 0.36,
      metalness: 0.80,
      map: weatheredCoolerMatrixMap,
      envMap,
      envMapIntensity: 1.25,
      name: "oilCooler",
    }),

    // Q. Mounting Brackets: Aged weathered industrial alloy (NOT pitch black)
    mountingBrackets: new THREE.MeshStandardMaterial({
      color: 0x48505a,
      roughness: 0.30,
      metalness: 0.85,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.20,
      name: "mountingBrackets",
    }),

    // R. Propeller: Weathered dark graphite carbon composite with 2x2 twill weave, UV haze & stone dings (NOT pitch black!)
    propellerCarbon: new THREE.MeshStandardMaterial({
      color: 0x3e454e,
      roughness: 0.38,
      metalness: 0.24,
      map: weatheredCarbonMap,
      envMap,
      envMapIntensity: 1.15,
      name: "propellerCarbon",
    }),
    carbonPropeller: new THREE.MeshStandardMaterial({
      color: 0x3e454e,
      roughness: 0.38,
      metalness: 0.24,
      map: weatheredCarbonMap,
      envMap,
      envMapIntensity: 1.15,
      name: "carbonPropeller",
    }),

    // S. Propeller Tips: Painted safety tips
    propellerTip: new THREE.MeshStandardMaterial({
      color: 0xe5eaf0,
      roughness: 0.22,
      metalness: 0.05,
      name: "propellerTip",
    }),
    propellerWhiteTip: new THREE.MeshStandardMaterial({
      color: 0xe5eaf0,
      roughness: 0.22,
      metalness: 0.05,
      name: "propellerWhiteTip",
    }),

    // T. Spinner: Weathered dark graphite composite nose cone with authentic surface wear (NOT pitch black!)
    spinnerAluminum: new THREE.MeshStandardMaterial({
      color: 0x8a939d,
      roughness: 0.12,
      metalness: 0.92,
      envMap,
      envMapIntensity: 1.25,
      name: "spinnerAluminum",
    }),
    spinnerCone: new THREE.MeshStandardMaterial({
      color: 0x343a42,
      roughness: 0.28,
      metalness: 0.38,
      map: weatheredCarbonMap,
      envMap,
      envMapIntensity: 1.30,
      name: "spinnerCone",
    }),

    // U. Fasteners & General Hardware
    // Zinc / cadmium plated steel (authentic aged aerospace bolt heads)
    polishedChrome: new THREE.MeshStandardMaterial({
      color: 0x949da6,
      roughness: 0.18,
      metalness: 0.92,
      envMap,
      envMapIntensity: 1.4,
      name: "polishedChrome",
    }),
    darkAnodized: new THREE.MeshStandardMaterial({
      color: 0x3a414a,
      roughness: 0.30,
      metalness: 0.82,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.20,
      name: "darkAnodized",
    }),
    bronzeBushing: new THREE.MeshStandardMaterial({
      color: 0x946f28,
      roughness: 0.28,
      metalness: 0.86,
      map: weatheredBrassMap,
      envMap,
      envMapIntensity: 1.35,
      name: "bronzeBushing",
    }),
    copperWinding: new THREE.MeshStandardMaterial({
      color: 0x7a3c1e,
      roughness: 0.32,
      metalness: 0.84,
      map: weatheredCopperMap,
      envMap,
      envMapIntensity: 1.20,
      name: "copperWinding",
    }),
    blackRubber: new THREE.MeshStandardMaterial({
      color: 0x30363e,
      roughness: 0.65,
      metalness: 0.12,
      map: weatheredHarnessMap,
      envMap,
      envMapIntensity: 1.05,
      name: "blackRubber",
    }),
    anodizedBlue: new THREE.MeshStandardMaterial({
      color: 0x224da0,
      roughness: 0.24,
      metalness: 0.84,
      map: weatheredAnodizedBlueMap,
      envMap,
      envMapIntensity: 1.35,
      name: "anodizedBlue",
    }),
    anodizedRed: new THREE.MeshStandardMaterial({
      color: 0x8c1c1c,
      roughness: 0.26,
      metalness: 0.82,
      map: weatheredRedSiliconeMap,
      envMap,
      envMapIntensity: 1.3,
      name: "anodizedRed",
    }),
    // V. Aerospace TIG Weld Bead (Heat-tempered straw/bronze stainless weld alloy)
    tigWeldAlloy: new THREE.MeshStandardMaterial({
      color: 0xb89858,
      roughness: 0.34,
      metalness: 0.86,
      map: charredExhaustMap,
      envMap,
      envMapIntensity: 1.40,
      name: "tigWeldAlloy",
    }),
    meshScreen: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      map: meshMap,
      roughness: 0.25,
      metalness: 0.85,
      name: "meshScreen",
    }),
    spinnerBlueRing: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.5,
      name: "spinnerBlueRing",
    }),
    oilPanCast: new THREE.MeshStandardMaterial({
      color: 0x6e7681,
      roughness: 0.46,
      metalness: 0.76,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.2,
      name: "oilPanCast",
    }),
    castIron: new THREE.MeshStandardMaterial({
      color: 0x444c56,
      metalness: 0.86,
      roughness: 0.40,
      map: weatheredCastMap,
      envMap,
      envMapIntensity: 1.15,
      name: "castIron",
    }),

    // Concentric witness / diagnostic rings: textured aerospace steel with rust, tick marks, and oil stains
    concentricScanRing: new THREE.MeshStandardMaterial({
      color: 0xd5dce4,
      roughness: 0.28,
      metalness: 0.84,
      map: weatheredCylinderRingMap,
      envMap,
      envMapIntensity: 1.45,
      name: "concentricScanRing",
    }),
  };

  Object.values(mats).forEach((mat) => {
    applyAerospaceThermalShader(mat);
  });

  return mats;
}

