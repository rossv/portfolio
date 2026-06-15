// Downscales + recompresses oversized raster assets in place. Many skill/tool
// "icons" ship as 1–1.5 MB full-resolution PNGs yet render at ≤48–80 px; the
// netl logo is 2.2 MB at ~112 px. We cap them to a retina-safe max dimension
// and write back only when the result is actually smaller. Transparency is
// preserved (PNG). Run: node scripts/optimize-images.mjs
//
// Display sizes: hex icons ≤48 px, hero icons ≤80 px → 160 px covers 2x.

import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function optimize(path, maxDim) {
  const before = (await stat(path)).size;
  const input = await readFile(path);
  const out = await sharp(input)
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();
  if (out.length < before) {
    await writeFile(path, out);
    return { before, after: out.length };
  }
  return { before, after: before, kept: true };
}

const targets = [];
for await (const p of walk(join(root, 'src/assets/icons'))) {
  if (extname(p).toLowerCase() === '.png') targets.push([p, 160]);
}
targets.push([join(root, 'src/assets/logos/netl.png'), 256]);

let totalBefore = 0;
let totalAfter = 0;
for (const [p, dim] of targets) {
  const r = await optimize(p, dim);
  totalBefore += r.before;
  totalAfter += r.after;
  const rel = p.replace(root, '').replace(/\\/g, '/');
  console.log(
    `${(r.before / 1024).toFixed(0).padStart(5)}KB -> ${(r.after / 1024).toFixed(0).padStart(5)}KB  ${rel}${r.kept ? ' (kept)' : ''}`,
  );
}
console.log(`\nTotal: ${(totalBefore / 1024 / 1024).toFixed(2)}MB -> ${(totalAfter / 1024 / 1024).toFixed(2)}MB`);
