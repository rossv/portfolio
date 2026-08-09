// Isometric landmark tiles standing on the ground plane.
//
// Four of them, and their positions are fixed rather than searched: flush into
// the left and right margins, alternating sides, and all of them below the
// timeline so the upper half of the page stays clear. Same places every visit.
//
// Because they are fixed, they are the thing the rivers have to work around
// rather than the other way about — `footprints` hands the router the ground each
// one stands on.
//
// Aspect ratios are constants rather than read from the decoded art. The assets
// are committed and their proportions are not going to change, and hard-coding
// them means a position, and therefore the river routing, is known immediately
// instead of waiting on an image to load.

import { rgba, clamp } from './palette';

// `?url` explicitly, not a bare import: Astro's asset pipeline resolves a bare
// `src/assets` import to an ImageMetadata object, and assigning that to img.src
// silently loads the string form of an object.
import cathedralUrl from '../../assets/pgh/cathedral-of-learning.webp?url';
import phippsUrl from '../../assets/pgh/phipps-conservatory.webp?url';
import furnaceUrl from '../../assets/pgh/carrie-furnace.webp?url';
import inclineUrl from '../../assets/pgh/duquesne-incline.webp?url';

// `down` is how far below the timeline the tile stands, in px of document.
// `side` is -1 for the left margin, +1 for the right.
const TILES = [
    { url: furnaceUrl, name: 'Carrie Furnace', widthCells: 10, aspect: 940 / 840, down: 420, side: 1 },
    { url: cathedralUrl, name: 'Cathedral of Learning', widthCells: 8, aspect: 975 / 833, down: 2300, side: -1 },
    { url: phippsUrl, name: 'Phipps Conservatory', widthCells: 7.5, aspect: 917 / 918, down: 4100, side: 1 },
    // Taller than it is wide, unlike the other three, so it is held narrower to
    // keep it from towering over them. Standing just above the portfolio heading
    // rather than further down: past that point the grid is wide enough to cover
    // the margin a tile stands in, so a tile placed inside the portfolio is a
    // tile nobody sees.
    { url: inclineUrl, name: 'Duquesne Incline', widthCells: 7, aspect: 1208 / 926, down: 4700, side: -1 },
];

// The plinth, as a fraction of tile height. Only the ground a tile stands on
// blocks a river. Anything higher is the building itself, and a channel passing
// at a shallower depth is drawn before the tile, so the tile occludes it — which
// is what should happen when a river runs behind a building.
const PLINTH = 0.15;

export function createLandmarks(ctx, palette, lattice) {
    const images = TILES.map(({ url }) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = url;
        return img;
    });

    let placed = [];

    // Fixed positions. `baseDepth` is the lattice depth of the timeline's foot.
    function place(baseDepth, depthPerPx) {
        const cell = lattice.cell();
        const halfW = lattice.width() / 2;
        const acrossPx = cell * 0.866;

        placed = TILES.map((tile, i) => {
            const w = tile.widthCells * cell;
            const h = w * tile.aspect;
            // Flush into the margin: as far out as the tile can sit and stay
            // whole on screen. Derived from the viewport rather than from the
            // field's own half-width, which reaches past the edge.
            //
            // Floored, and then one further in, because cellAt has to round gx to
            // an integer and that can carry the effective across-position a whole
            // cell further out than asked. Rounding here let a tile hang off the
            // right edge.
            const limit = Math.floor((halfW - w / 2 - 12) / acrossPx) - 1;
            const a = tile.side * Math.max(2, limit);
            const d = Math.round(baseDepth + tile.down * depthPerPx);
            return { tile, img: images[i], cell: lattice.cellAt(a, d), a, d, w, h };
        });
        return placed.length;
    }

    // The ground each tile stands on, as boxes in (across, depth) so the router
    // can steer a river clear of them.
    function footprints() {
        const cell = lattice.cell();
        const acrossPx = cell * 0.866;
        const downPx = cell * 0.5;
        return placed.map(({ a, d, w, h }) => ({
            a0: a - (w / 2) / acrossPx - 1,
            a1: a + (w / 2) / acrossPx + 1,
            d0: d - (h * PLINTH) / downPx - 1,
            d1: d + (h * PLINTH * 0.5) / downPx + 1,
        }));
    }

    // A pool of the bank colour under a tile — lighter than the ground on
    // near-black, darker on paper, because `plate` is one step off the ground in
    // both palettes. It has no edge and reads as nothing in particular, which is
    // the point: it settles the tile onto the plane without putting a second
    // built object behind the art. Squashed to an ellipse, because the ground it
    // pools on is seen at the lattice's angle rather than face on.
    const HALO_RX = 1.05;   // of tile width
    const HALO_RY = 0.62;   // of tile height
    const HALO_RISE = 0.32; // centre, above the base, as a fraction of height

    function halo(bx, by, w, h, g) {
        const cy = by - h * HALO_RISE;
        const rx = w * HALO_RX;
        const ry = h * HALO_RY;
        const pool = ctx.createRadialGradient(bx, cy, 0, bx, cy, rx);
        pool.addColorStop(0, rgba(palette.plate, 0.95 * g));
        pool.addColorStop(0.5, rgba(palette.plate, 0.6 * g));
        pool.addColorStop(1, rgba(palette.plate, 0));
        ctx.save();
        ctx.translate(bx, cy);
        ctx.scale(1, ry / rx);
        ctx.translate(-bx, -cy);
        ctx.fillStyle = pool;
        ctx.beginPath();
        ctx.arc(bx, cy, rx, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function frame(scrollY, g) {
        const height = lattice.height();
        for (const { img, cell: at, w, h } of placed) {
            if (!img.complete || !img.naturalWidth) continue;
            const [bx, by] = lattice.project(at[0], at[1], scrollY);
            // The halo reaches below the base as well as above it, so the foot of
            // the cull has to clear the pool and not just the art. Culling on the
            // art alone popped the pool off at the bottom edge of the viewport.
            if (by < -h - 40 || by > height + h * (HALO_RY - HALO_RISE) + 40) continue;

            halo(bx, by, w, h, g);

            // A soft contact shadow, so the tile sits on the plane rather than
            // floating over it.
            ctx.fillStyle = rgba(palette.ground, 0.5);
            ctx.beginPath();
            ctx.ellipse(bx, by - h * 0.02, w * 0.42, w * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Held well back: the art is more saturated than anything else in
            // this palette, and it is still a backdrop.
            ctx.globalAlpha = clamp(0.70 * g, 0, 1);
            ctx.drawImage(img, bx - w / 2, by - h, w, h);
            ctx.globalAlpha = 1;
        }
    }

    return { place, footprints, frame, count: () => placed.length };
}
