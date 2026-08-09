// Prepares isometric landmark art for the Pittsburgh backdrop.
//
// Generated tiles arrive with a baked dark vignette rather than transparency, so
// dropped straight onto the backdrop they show as a dark rectangle. A global
// colour key cannot lift a gradient, so this floods inward from the border
// instead: a pixel joins the background only if it is close in colour to a
// neighbour already known to be background, and only if it is locally smooth.
// That walks the vignette however bright it gets and stops dead at the inked
// outlines the artwork is drawn with.
//
// Then trim to content, cap the width, and write WebP with alpha into
// src/assets/pgh/.
//
// Run: node scripts/prepare-landmarks.mjs <slug> <file> [<slug> <file> ...]

import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'src', 'assets', 'pgh');

// How close two neighbouring pixels must be to count as the same background,
// summed over the three channels. Low enough that an inked outline stops the
// flood, high enough to walk a gradient.
const TOL = 24;

// The subject reaches the frame edge in this artwork — a plaza or a base plate
// runs off the bottom — so the flood cannot simply start from every border pixel
// or it begins inside the building and eats it from the inside out. It seeds only
// where the border actually looks like vignette: dark and nearly grey.
const SEED_LUMA = 72;
const SEED_SAT = 16;

// And it may only spread into pixels that still look like background. What marks
// a baked vignette is not its colour — one of these glows runs up to a bright
// acid green, brighter and far more saturated than any stonework — but that it is
// perfectly smooth. The artwork is inked, so every part of it disagrees sharply
// with a neighbour somewhere. So the gate is local roughness: the largest
// channel-sum difference to any of the eight neighbours, which stays near zero
// across a gradient and jumps at the first drawn line.
//
// This matters at a silhouette where the art is itself dark — a shadowed deck
// against a dark corner of the vignette. Colour alone cannot tell those apart and
// the flood walks straight through the building; roughness stops it dead.
const FLAT = 24;

const MAX_WIDTH = 720;

async function ingest(slug, file) {
    const { data, info } = await sharp(file).ensureAlpha().raw()
        .toBuffer({ resolveWithObject: true });
    const { width: W, height: H, channels } = info;

    const alpha = new Uint8Array(W * H).fill(255);
    const seen = new Uint8Array(W * H);
    const at = (i) => i * channels;
    const luma = (i) => {
        const s = at(i);
        return 0.2126 * data[s] + 0.7152 * data[s + 1] + 0.0722 * data[s + 2];
    };
    const sat = (i) => {
        const s = at(i);
        return Math.max(data[s], data[s + 1], data[s + 2])
            - Math.min(data[s], data[s + 1], data[s + 2]);
    };
    const near = (a, b) => {
        const ia = at(a);
        const ib = at(b);
        return Math.abs(data[ia] - data[ib])
            + Math.abs(data[ia + 1] - data[ib + 1])
            + Math.abs(data[ia + 2] - data[ib + 2]) <= TOL;
    };
    const roughness = (i) => {
        const x = i % W;
        const y = (i - x) / W;
        const ia = at(i);
        let worst = 0;
        for (let dy = -1; dy <= 1; dy += 1) {
            for (let dx = -1; dx <= 1; dx += 1) {
                const nx = x + dx;
                const ny = y + dy;
                if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
                const ib = at(ny * W + nx);
                const d = Math.abs(data[ia] - data[ib])
                    + Math.abs(data[ia + 1] - data[ib + 1])
                    + Math.abs(data[ia + 2] - data[ib + 2]);
                if (d > worst) worst = d;
            }
        }
        return worst;
    };
    const joinable = (i) => roughness(i) <= FLAT;

    const border = [];
    for (let x = 0; x < W; x += 1) border.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y += 1) border.push(y * W, y * W + W - 1);

    const queue = [];
    for (const i of border) {
        if (seen[i]) continue;
        if (luma(i) > SEED_LUMA || sat(i) > SEED_SAT) continue;
        seen[i] = 1;
        queue.push(i);
    }
    if (!queue.length) throw new Error(`${slug}: no border pixel looks like vignette`);

    let head = 0;
    while (head < queue.length) {
        const i = queue[head];
        head += 1;
        alpha[i] = 0;
        const x = i % W;
        const y = (i - x) / W;
        const push = (nx, ny) => {
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
            const j = ny * W + nx;
            if (seen[j] || !joinable(j) || !near(i, j)) return;
            seen[j] = 1;
            queue.push(j);
        };
        push(x - 1, y); push(x + 1, y); push(x, y - 1); push(x, y + 1);
    }

    let minX = W;
    let minY = H;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < H; y += 1) {
        for (let x = 0; x < W; x += 1) {
            if (!alpha[y * W + x]) continue;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }
    }
    if (maxX < 0) throw new Error(`${slug}: the flood removed everything, lower TOL`);

    const out = Buffer.alloc(W * H * 4);
    for (let i = 0; i < W * H; i += 1) {
        const s = at(i);
        out[i * 4] = data[s];
        out[i * 4 + 1] = data[s + 1];
        out[i * 4 + 2] = data[s + 2];
        out[i * 4 + 3] = alpha[i];
    }

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;
    const kept = alpha.reduce((n, v) => n + (v ? 1 : 0), 0);

    const buf = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
        .extract({ left: minX, top: minY, width: cropW, height: cropH })
        .resize({ width: Math.min(cropW, MAX_WIDTH), withoutEnlargement: true })
        .webp({ quality: 88, effort: 6 })
        .toBuffer();

    await writeFile(path.join(OUT_DIR, `${slug}.webp`), buf);
    return {
        slug,
        source: `${W}x${H}`,
        trimmed: `${cropW}x${cropH}`,
        subjectPct: `${((100 * kept) / (W * H)).toFixed(1)}%`,
        kb: (buf.length / 1024).toFixed(0),
    };
}

const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2 !== 0) {
    console.error('usage: node scripts/prepare-landmarks.mjs <slug> <file> [<slug> <file> ...]');
    process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });
for (let i = 0; i < args.length; i += 2) {
    // eslint-disable-next-line no-await-in-loop
    console.log(await ingest(args[i], args[i + 1]));
}
