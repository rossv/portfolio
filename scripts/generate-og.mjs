// Generates branded social/share assets from inline SVG using sharp.
//   public/og-image.png        1200x630  Open Graph / Twitter card
//   public/apple-touch-icon.png 180x180  iOS home-screen icon (opaque)
//   public/icon-192.png         192x192  PWA manifest icon
//   public/icon-512.png         512x512  PWA manifest icon
//
// Run: node scripts/generate-og.mjs
// Brand: slate-950 background (#020617), sky->indigo accent, concentric
// "target" logo motif matching public/favicon.svg.

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public');

// --- shared defs -----------------------------------------------------------
const accent = `<linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#38bdf8"/><stop offset="1" stop-color="#4f46e5"/>
  </linearGradient>`;

// --- OG image (1200x630) ---------------------------------------------------
const gridLines = () => {
  let l = '';
  for (let x = 0; x <= 1200; x += 40) l += `<line x1="${x}" y1="0" x2="${x}" y2="630"/>`;
  for (let y = 0; y <= 630; y += 40) l += `<line x1="0" y1="${y}" x2="1200" y2="${y}"/>`;
  return l;
};

const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#020617"/><stop offset="1" stop-color="#0f172a"/>
    </linearGradient>
    ${accent}
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#0ea5e9" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#0ea5e9" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g stroke="#1e293b" stroke-width="1" opacity="0.45">${gridLines()}</g>
  <circle cx="955" cy="315" r="280" fill="url(#glow)"/>
  <g transform="translate(955,315)" fill="none" stroke="url(#accent)" stroke-linecap="round">
    <circle r="40" stroke-width="15"/>
    <circle r="85" stroke-width="15"/>
    <circle r="128" stroke-width="12"/>
    <circle r="166" stroke-width="9"/>
  </g>
  <circle cx="955" cy="315" r="15" fill="#38bdf8"/>
  <g font-family="Arial, Helvetica, sans-serif" fill="#f8fafc">
    <text x="90" y="248" font-size="96" font-weight="800" letter-spacing="2">ROSS</text>
    <text x="90" y="344" font-size="96" font-weight="800" letter-spacing="2">VOLKWEIN</text>
  </g>
  <rect x="93" y="386" width="70" height="7" rx="3.5" fill="url(#accent)"/>
  <text x="90" y="446" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700"
        fill="#38bdf8" letter-spacing="3">PE · GISP</text>
  <text x="90" y="498" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="400"
        fill="#94a3b8">Hydraulic &amp; Hydrologic Modeling · GIS · Software</text>
  <text x="90" y="566" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700"
        fill="#64748b" letter-spacing="1">www.rossvolkwein.com</text>
</svg>`;

// --- square icon -----------------------------------------------------------
const iconSvg = (size, opaqueSquare = false) => {
  const c = size / 2;
  const rx = opaqueSquare ? 0 : size * 0.22;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>${accent}</defs>
    <rect width="${size}" height="${size}" rx="${rx}" fill="#0b1220"/>
    <g transform="translate(${c},${c})" fill="none" stroke="url(#accent)" stroke-linecap="round">
      <circle r="${size * 0.11}" stroke-width="${size * 0.06}"/>
      <circle r="${size * 0.24}" stroke-width="${size * 0.06}"/>
      <circle r="${size * 0.36}" stroke-width="${size * 0.045}"/>
    </g>
    <circle cx="${c}" cy="${c}" r="${size * 0.045}" fill="#38bdf8"/>
  </svg>`;
};

const render = (svg, file) =>
  sharp(Buffer.from(svg)).png().toFile(join(out, file)).then(() => console.log('wrote', file));

await Promise.all([
  render(ogSvg, 'og-image.png'),
  render(iconSvg(180, true), 'apple-touch-icon.png'),
  render(iconSvg(192), 'icon-192.png'),
  render(iconSvg(512), 'icon-512.png'),
]);
