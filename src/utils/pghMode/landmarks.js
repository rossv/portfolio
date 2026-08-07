// Isometric landmark tiles standing on the ground plane.
//
// Three of them, spread down the page: the Cathedral of Learning, Phipps, and a
// Mon Valley works. They are raster art rather than drawn here, so the only real
// work is deciding where they stand — and the rule is that they never sit on a
// river.
//
// Placement is solved once, in screen space at zero scroll. That is exact rather
// than approximate: the whole plane drifts at one rate, so the geometry between a
// tile and a channel never changes as the page moves. Test it once and it holds
// for every scroll position.

import { rgba, clamp } from './palette';

// `?url` explicitly, not a bare import: Astro's asset pipeline resolves a bare
// `src/assets` import to an ImageMetadata object rather than a string, and
// assigning that to img.src silently loads "[object Object]".
import cathedralUrl from '../../assets/pgh/cathedral-of-learning.webp?url';
import phippsUrl from '../../assets/pgh/phipps-conservatory.webp?url';
import worksUrl from '../../assets/pgh/mon-valley-works.webp?url';

// `widthCells` is the tile's footprint across the lattice, and `depth` is where
// down the field it wants to stand, as a fraction. The works sits high, near the
// iron it belongs to; Phipps and the Cathedral are further down, in Oakland
// order.
const TILES = [
    { url: worksUrl, name: 'Mon Valley Works', widthCells: 10.5, depth: 0.17 },
    { url: cathedralUrl, name: 'Cathedral of Learning', widthCells: 8, depth: 0.47 },
    { url: phippsUrl, name: 'Phipps Conservatory', widthCells: 7.5, depth: 0.73 },
];

// Clear space demanded around a tile, in px at zero scroll.
const MARGIN = 26;

export function createLandmarks(ctx, palette, lattice) {
    const images = TILES.map(({ url }) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        return img;
    });

    let placed = [];

    // Does a tile's rectangle keep clear of every channel, and of the fixtures
    // already standing on the plane?
    function isClear(rect, network, avoid) {
        for (const channel of network.channels) {
            for (const [gx, gy] of channel.pts) {
                const [x, y] = lattice.project(gx, gy, 0);
                if (x > rect.x0 && x < rect.x1 && y > rect.y0 && y < rect.y1) return false;
            }
        }
        for (const { x, y, r } of avoid) {
            if (x > rect.x0 - r && x < rect.x1 + r && y > rect.y0 - r && y < rect.y1 + r) return false;
        }
        return true;
    }

    // Solve the standing positions. Called on rebuild, and again once the art has
    // decoded, because a tile's height is not known until then.
    function place(network, avoid) {
        const cell = lattice.cell();
        const u = lattice.halfWidth();
        const v = lattice.depth();
        placed = [];

        TILES.forEach((tile, i) => {
            const img = images[i];
            if (!img.complete || !img.naturalWidth) return;
            const w = tile.widthCells * cell;
            const h = w * (img.naturalHeight / img.naturalWidth);

            // Walk across the field, and a little up and down it, for the first
            // spot that is clear. Alternating outward from centre so a tile sits
            // as close to the middle of the page as the rivers allow.
            const depths = [0, -0.035, 0.035, -0.07, 0.07];
            const acrosses = [];
            for (let step = 0; step <= 12; step += 1) {
                acrosses.push(-step * (u / 13), step * (u / 13));
            }

            for (const dd of depths) {
                for (const aa of acrosses) {
                    const d = Math.round((tile.depth + dd) * v);
                    const a = Math.round(aa);
                    if (d < 2 || d > v - 2) continue;
                    const [gx, gy] = lattice.cellAt(a, d);
                    const [bx, by] = lattice.project(gx, gy, 0);
                    const rect = {
                        x0: bx - w / 2 - MARGIN,
                        x1: bx + w / 2 + MARGIN,
                        y0: by - h - MARGIN,
                        y1: by + h * 0.1 + MARGIN,
                    };
                    if (!isClear(rect, network, avoid)) continue;
                    placed.push({ tile, img, cell: [gx, gy], w, h });
                    return;
                }
            }
        });
        return placed.length;
    }

    function frame(scrollY, g) {
        const height = lattice.height();
        for (const { img, cell, w, h } of placed) {
            const [bx, by] = lattice.project(cell[0], cell[1], scrollY);
            if (by < -h - 40 || by > height + 80) continue;

            // A soft contact shadow, so the tile sits on the plane instead of
            // floating over it.
            ctx.fillStyle = rgba(palette.ground, 0.5);
            ctx.beginPath();
            ctx.ellipse(bx, by - h * 0.02, w * 0.42, w * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Held a little back: the art is more saturated than anything else in
            // this palette, and it is still a backdrop.
            ctx.globalAlpha = clamp(0.88 * g, 0, 1);
            ctx.drawImage(img, bx - w / 2, by - h, w, h);
            ctx.globalAlpha = 1;
        }
    }

    const ready = () => images.every((img) => img.complete && img.naturalWidth);
    const decoded = () => Promise.all(images.map((img) => (img.complete
        ? Promise.resolve()
        : new Promise((res) => { img.onload = res; img.onerror = res; }))));

    return { place, frame, ready, decoded, count: () => placed.length };
}
