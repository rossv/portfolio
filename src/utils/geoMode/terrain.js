// Contour backdrop for geospatial mode.
//
// A scalar terrain field sampled onto a grid, then real marching squares to
// trace iso-lines, with every fifth drawn as a heavier index contour. The
// cursor acts as a movable high point, so the surface responds to probing.
//
// The field drifts, but very slowly on purpose: a full breath takes minutes,
// so the terrain reads as still unless you watch for it.

const LEVELS = 14;
const LMAX = 1.9;

const PEAKS = Array.from({ length: 5 }, (_, i) => ({
    x: 0.15 + ((i * 0.19) % 0.8),
    y: 0.25 + ((i * 0.37) % 0.6),
    amp: 0.55 + (i % 3) * 0.22,
    sx: 0.16 + (i % 2) * 0.07,
    sy: 0.13 + (i % 3) * 0.05,
    dx: (i % 2 ? 1 : -1) * 0.0000015,
    dy: (i % 3 ? -1 : 1) * 0.0000011,
}));

export function createTerrain(ctx, palette) {
    let width = 0;
    let height = 0;
    let cell = 0;
    let gx = 0;
    let gy = 0;
    let field = null;

    function resize(w, h) {
        width = w;
        height = h;
        // Grid resolution follows the smaller dimension, so contour detail is
        // consistent from a laptop to a large display.
        cell = Math.max(14, Math.round(Math.min(w, h) / 46));
        gx = Math.ceil(w / cell) + 1;
        gy = Math.ceil(h / cell) + 1;
        field = new Float32Array(gx * gy);
    }

    function fieldAt(nx, ny, t, mouse) {
        let v = 0;
        for (const p of PEAKS) {
            const px = p.x + Math.sin(t * p.dx * 60) * 0.035;
            const py = p.y + Math.cos(t * p.dy * 60) * 0.028;
            const ex = (nx - px) / p.sx;
            const ey = (ny - py) / p.sy;
            v += p.amp * Math.exp(-(ex * ex + ey * ey));
        }
        if (mouse.x > -1000) {
            const ex = (nx - mouse.x / width) / 0.1;
            const ey = (ny - mouse.y / height) / 0.1;
            v += 0.7 * Math.exp(-(ex * ex + ey * ey));
        }
        return v;
    }

    function frame(t, mouse) {
        if (!field) return;

        for (let j = 0; j < gy; j++) {
            for (let i = 0; i < gx; i++) {
                field[j * gx + i] = fieldAt((i * cell) / width, (j * cell) / height, t, mouse);
            }
        }

        const step = LMAX / LEVELS;

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
    }

    return { resize, frame };
}
