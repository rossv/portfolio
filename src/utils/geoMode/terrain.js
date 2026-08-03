// Contour backdrop for geospatial mode.
//
// A scalar terrain field sampled onto a grid, then real marching squares to
// trace iso-lines, with every fifth drawn as a heavier index contour. The
// cursor acts as a movable high point, so the surface responds to probing.
//
// The peaks wander, but very slowly on purpose: a full breath takes minutes,
// so on its own the terrain reads as still unless you watch for it. Scrolling
// drives a second, far more deliberate motion — the whole field pans upward
// with the page, so the ground reads as a place the hero is moving through
// rather than a decal pinned to the viewport.
//
// Cut into that ground is a valley along the same reach the hero flood raster
// draws (see reach.js), the basin falling downstream so contours cross the
// stream as V's aimed upstream rather than square. The valley reads its
// geometry from the band instead of keeping its own copy, so it tracks the
// band frame for frame; once the band has scrolled off the top the valley
// has gone with it too.
//
// Clicking raises the ground. A placed peak is the same kind of Gaussian the
// cursor already contributes, so the click persists a mechanism the field
// function was built around rather than adding one beside it; the contours
// re-solve around it on the next frame and new rings bloom outward. Clicking
// an existing rise again stacks it higher instead of dropping a second peak
// alongside, so repeat clicks read as building one hill.
//
// Each rise is marked the way a topo sheet marks a spot elevation: a small
// cross and a bare figure, no prefix and no leader. The figure is read off the
// terrain excluding the cursor probe — the probe is an artifact of where the
// pointer happens to be, and including it made the number climb as you
// approached the very label you were trying to read.

import { BAND_TOP, createReach } from './reach';

// Contour spacing. The field now runs roughly -2.14 to +0.64 thanks to the
// valley and the downstream fall, so a top-and-count-of-levels pair no longer
// describes anything real — this is the one quantity that does.
const CONTOUR_INTERVAL = 1.9 / 14;

const PLACED_CAP = 14;         // click-placed rises
const PLACED_AMP = 0.62;       // a fresh rise
const PLACED_SIGMA = 0.085;
const STACK_RADIUS = 0.055;    // normalised: inside this, a click stacks
const STACK_STEP = 0.34;
const STACK_MAX = 2.4;
const GROW_MS = 140;           // amplitude ease-in, so contours bloom
const MARK_R = 4;              // spot-elevation cross
const LABEL_PX = 11;
const LABEL_NEAR = 150;        // cursor distance at which a figure is fully up
const LABEL_REST = 0.46;
const LABEL_LIT = 0.92;

const VALLEY_DEPTH = 1.25;     // how far the trench cuts below the ground
const VALLEY_HALF = 90;        // px to the trench shoulder, at plainWidth 1
const DOWNSTREAM_FALL = 0.9;   // fall from one side of the basin to the other

const DRIFT = 0.1;             // ground pan, per px of scroll

// Feet, so a figure reads as an Allegheny-plateau spot elevation. Re-based for a
// field that now runs negative in the valley and at the downstream end.
const ELEV_BASE = 940;
const ELEV_SCALE = 120;
const ELEV_STEP = 5;           // the valley slides past a mark; don't churn digits

const PEAKS = Array.from({ length: 5 }, (_, i) => ({
    x: 0.15 + ((i * 0.19) % 0.8),
    y: 0.25 + ((i * 0.37) % 0.6),
    amp: 0.55 + (i % 3) * 0.22,
    sx: 0.16 + (i % 2) * 0.07,
    sy: 0.13 + (i % 3) * 0.05,
    dx: (i % 2 ? 1 : -1) * 0.0000015,
    dy: (i % 3 ? -1 : 1) * 0.0000011,
}));

// Nearest-image offset, which makes the peak field tile vertically. Panning the
// ground without this would strip the bottom of the frame bare; with it the field
// repeats every viewport height, and since the widest peak sigma is 0.23 a
// neighbouring copy contributes under 1% at the seam.
const wrapN = (d) => d - Math.round(d);

// The surface, with no canvas in sight: drifting peaks, anything clicked into the
// ground, the basin's fall, and the valley cut along the reach. Separate from the
// drawing so the shape of the ground can be checked without a browser.
export function createSurface(width, height, placed = [], { drift = DRIFT } = {}) {
    const reach = createReach(width, height);

    // Screen to ground: the ground has moved up by this much.
    const panAt = (scrollY) => (drift * scrollY) / height;

    function terrainAt(nx, ny, t, scrollY) {
        const gy = ny + panAt(scrollY);
        let v = 0;
        for (const p of PEAKS) {
            const px = p.x + Math.sin(t * p.dx * 60) * 0.035;
            const py = p.y + Math.cos(t * p.dy * 60) * 0.028;
            const ex = (nx - px) / p.sx;
            const ey = wrapN(gy - py) / p.sy;
            v += p.amp * Math.exp(-(ex * ex + ey * ey));
        }
        for (const p of placed) {
            const ex = (nx - p.x) / PLACED_SIGMA;
            const ey = (gy - p.y) / PLACED_SIGMA;
            v += p.shown * Math.exp(-(ex * ex + ey * ey));
        }
        // The basin drains to the right. This is the term that aims the contour
        // V's upstream where they cross the corridor — without it they cross
        // square, and the ground says nothing about which way the water goes.
        v -= DOWNSTREAM_FALL * nx;
        // The valley, tracking the band one for one so the contours and the
        // raster never disagree, and widened where the floodplain is wide. Once
        // the band has cleared the top the thalweg is negative and the valley
        // has gone with it, which is the whole of "let it go".
        const thalweg = BAND_TOP - scrollY + reach.chanY(nx * width);
        const dy = (ny * height - thalweg) / (VALLEY_HALF * reach.plainWidth(nx));
        v -= VALLEY_DEPTH * Math.exp(-dy * dy);
        return v;
    }

    // What gets contoured: the surface plus the cursor probe.
    function fieldAt(nx, ny, t, scrollY, mouse) {
        let v = terrainAt(nx, ny, t, scrollY);
        if (mouse.x > -1000) {
            const ex = (nx - mouse.x / width) / 0.1;
            const ey = (ny - mouse.y / height) / 0.1;
            v += 0.7 * Math.exp(-(ex * ex + ey * ey));
        }
        return v;
    }

    const elevationAt = (nx, ny, t, scrollY) =>
        Math.round((ELEV_BASE + terrainAt(nx, ny, t, scrollY) * ELEV_SCALE) / ELEV_STEP)
        * ELEV_STEP;

    return { reach, panAt, terrainAt, fieldAt, elevationAt };
}

// `placed` is owned by the caller and holds click-placed rises. They are kept
// in normalised coordinates, which is what the field function works in, so
// they need no re-application on resize and survive a theme rebuild intact.
export function createTerrain(ctx, palette, placed = [], { reduceMotion = false } = {}) {
    let width = 0;
    let height = 0;
    let cell = 0;
    let gx = 0;
    let gy = 0;
    let field = null;
    let surface = null;

    function resize(w, h) {
        width = w;
        height = h;
        // Grid resolution follows the smaller dimension, so contour detail is
        // consistent from a laptop to a large display.
        cell = Math.max(14, Math.round(Math.min(w, h) / 46));
        gx = Math.ceil(w / cell) + 1;
        gy = Math.ceil(h / cell) + 1;
        field = new Float32Array(gx * gy);
        surface = createSurface(w, h, placed, { drift: reduceMotion ? 0 : DRIFT });
    }

    // Raise the ground at a screen position. A click near an existing rise
    // stacks that one higher rather than adding a peak beside it.
    function addPeak(x, y, { instant = false, scrollY = 0 } = {}) {
        const nx = x / width;
        const ny = y / height + surface.panAt(scrollY);

        let hit = null;
        let bestD = Infinity;
        for (const p of placed) {
            const d = Math.hypot(p.x - nx, p.y - ny);
            if (d < bestD) { bestD = d; hit = p; }
        }

        if (hit && bestD < STACK_RADIUS) {
            hit.amp = Math.min(STACK_MAX, hit.amp + STACK_STEP);
            if (instant) hit.shown = hit.amp;
            return hit;
        }

        if (placed.length >= PLACED_CAP) placed.shift();
        const peak = { x: nx, y: ny, amp: PLACED_AMP, shown: instant ? PLACED_AMP : 0 };
        placed.push(peak);
        return peak;
    }

    // Spot elevations, drawn over the contours. The dimmer contour sienna
    // rather than the index colour, so a mark never out-weighs the index
    // contours it sits among.
    function drawMarks(t, mouse, scrollY) {
        if (!placed.length) return;

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = `${LABEL_PX}px "Space Mono", ui-monospace, monospace`;
        ctx.lineWidth = 1;

        const pan = surface.panAt(scrollY);
        for (const p of placed) {
            if (p.shown < 0.02) continue;

            const x = p.x * width;
            const y = (p.y - pan) * height;
            // Panned off the top or bottom: nothing to draw.
            if (y < -MARK_R || y > height + MARK_R) continue;

            // Subtle at rest, readable with the cursor on it. Squared falloff,
            // so it lights the one mark you are on and not the region.
            let near = 0;
            if (mouse.x > -1000) {
                const d = Math.hypot(x - mouse.x, y - mouse.y);
                if (d < LABEL_NEAR) {
                    const k = 1 - d / LABEL_NEAR;
                    near = k * k;
                }
            }
            // Fades up with the rise, so the mark arrives as the ground does.
            const grow = Math.min(1, p.shown / PLACED_AMP);
            const a = (LABEL_REST + (LABEL_LIT - LABEL_REST) * near) * grow;

            ctx.strokeStyle = `rgba(${palette.line}, ${a * 0.85})`;
            ctx.fillStyle = `rgba(${palette.line}, ${a})`;

            ctx.beginPath();
            ctx.moveTo(x - MARK_R, y - MARK_R);
            ctx.lineTo(x + MARK_R, y + MARK_R);
            ctx.moveTo(x + MARK_R, y - MARK_R);
            ctx.lineTo(x - MARK_R, y + MARK_R);
            ctx.stroke();

            const text = String(surface.elevationAt(p.x, (p.y - pan), t, scrollY));
            const tw = ctx.measureText(text).width;
            // Flip to the other side of the cross rather than run off the edge.
            if (x + MARK_R + 3.5 + tw + 4 > width) {
                ctx.textAlign = 'right';
                ctx.fillText(text, x - MARK_R - 3.5, y + 0.5);
                ctx.textAlign = 'left';
            } else {
                ctx.fillText(text, x + MARK_R + 3.5, y + 0.5);
            }
        }
    }

    function frame(t, dt, mouse, scrollY) {
        if (!field) return;

        // Ease each rise up to its amplitude, so a click blooms rings outward
        // rather than snapping a finished hill into place.
        for (const p of placed) {
            if (p.shown === p.amp) continue;
            p.shown += (p.amp - p.shown) * Math.min(1, dt / GROW_MS);
            if (Math.abs(p.amp - p.shown) < 0.002) p.shown = p.amp;
        }

        for (let j = 0; j < gy; j++) {
            for (let i = 0; i < gx; i++) {
                field[j * gx + i] = surface.fieldAt(
                    (i * cell) / width, (j * cell) / height, t, scrollY, mouse);
            }
        }

        const step = CONTOUR_INTERVAL;

        for (let j = 0; j < gy - 1; j++) {
            for (let i = 0; i < gx - 1; i++) {
                const a = field[j * gx + i];
                const b = field[j * gx + i + 1];
                const c = field[(j + 1) * gx + i + 1];
                const d = field[(j + 1) * gx + i];
                // Only test levels that actually fall inside this cell. Without
                // this the loop runs every level over every cell.
                const from = Math.ceil(Math.min(a, b, c, d) / step);
                const to = Math.floor(Math.max(a, b, c, d) / step);
                if (to < from) continue;

                const x0 = i * cell;
                const y0 = j * cell;
                const x1 = x0 + cell;
                const y1 = y0 + cell;

                for (let L = from; L <= to; L++) {
                    const v = L * step;
                    const isIndex = L % 5 === 0;
                    ctx.strokeStyle = `rgba(${isIndex ? palette.index : palette.line}, ${isIndex ? 0.6 : 0.28})`;
                    ctx.lineWidth = isIndex ? 1.5 : 0.8;

                    const ix = (va, vb, xa, xb) => xa + ((v - va) / (vb - va)) * (xb - xa);
                    const pts = [];
                    if ((a < v) !== (b < v)) pts.push([ix(a, b, x0, x1), y0]);
                    if ((b < v) !== (c < v)) pts.push([x1, ix(b, c, y0, y1)]);
                    if ((c < v) !== (d < v)) pts.push([ix(d, c, x0, x1), y1]);
                    if ((d < v) !== (a < v)) pts.push([x0, ix(a, d, y0, y1)]);
                    if (pts.length < 2) continue;

                    ctx.beginPath();
                    ctx.moveTo(pts[0][0], pts[0][1]);
                    ctx.lineTo(pts[1][0], pts[1][1]);
                    if (pts.length === 4) {
                        ctx.moveTo(pts[2][0], pts[2][1]);
                        ctx.lineTo(pts[3][0], pts[3][1]);
                    }
                    ctx.stroke();
                }
            }
        }

        drawMarks(t, mouse, scrollY);
    }

    return { resize, frame, addPeak };
}
