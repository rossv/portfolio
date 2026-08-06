// The bridges you build, in four Pittsburgh silhouettes.
//
//   sisters     — self-anchored eyebar suspension, the Three Sisters
//   lenticular  — the Smithfield Street lens
//   arch        — a tied arch, Fort Pitt and the West End
//   hotmetal    — a through truss; the real Hot Metal Bridge carried crucibles
//                 of iron across the Mon, so the molten river always gets it
//
// Each is drawn along its deck line in screen space. In isometric, vertical is
// straight up the screen, so towers, arches and chords all rise on the screen's
// own y axis.

import { rgba, clamp, smooth } from './palette';
import { DIRS } from './lattice';

const WATER_TYPES = ['sisters', 'lenticular', 'arch'];

const SHAPES = {
    sisters(c, ax, ay, bx, by, p, g, k) {
        const len = Math.hypot(bx - ax, by - ay);
        const rise = len * 0.26 * k;
        const tA = [ax + (bx - ax) * 0.18, ay + (by - ay) * 0.18];
        const tB = [ax + (bx - ax) * 0.82, ay + (by - ay) * 0.82];
        c.strokeStyle = rgba(p.steel, 0.95 * g);
        c.lineWidth = 2.4;
        for (const t of [tA, tB]) {
            c.beginPath(); c.moveTo(t[0], t[1]); c.lineTo(t[0], t[1] - rise); c.stroke();
        }
        // The chain: shallow and self-anchored, dipping between the towers.
        c.strokeStyle = rgba(p.accent, 0.95 * g);
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(ax, ay);
        c.quadraticCurveTo(tA[0], tA[1] - rise * 0.94, tA[0], tA[1] - rise);
        c.quadraticCurveTo((tA[0] + tB[0]) / 2, (tA[1] + tB[1]) / 2 - rise * 0.42, tB[0], tB[1] - rise);
        c.quadraticCurveTo(tB[0], tB[1] - rise * 0.94, bx, by);
        c.stroke();
        c.strokeStyle = rgba(p.steel, 0.55 * g);
        c.lineWidth = 1;
        for (let i = 1; i < 9; i += 1) {
            const f = i / 9;
            const x = tA[0] + (tB[0] - tA[0]) * f;
            const y = tA[1] + (tB[1] - tA[1]) * f;
            c.beginPath();
            c.moveTo(x, y - rise + Math.sin(f * Math.PI) * rise * 0.58);
            c.lineTo(x, y);
            c.stroke();
        }
    },

    lenticular(c, ax, ay, bx, by, p, g, k) {
        const len = Math.hypot(bx - ax, by - ay);
        const rise = len * 0.17 * k;
        c.strokeStyle = rgba(p.accent, 0.95 * g);
        c.lineWidth = 2;
        for (const s of [-1, 1]) {
            c.beginPath();
            c.moveTo(ax, ay);
            c.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - rise * 2 * s, bx, by);
            c.stroke();
        }
        c.strokeStyle = rgba(p.steel, 0.55 * g);
        c.lineWidth = 1;
        for (let i = 1; i < 7; i += 1) {
            const f = i / 7;
            const x = ax + (bx - ax) * f;
            const y = ay + (by - ay) * f;
            const off = Math.sin(f * Math.PI) * rise;
            c.beginPath(); c.moveTo(x, y - off); c.lineTo(x, y + off); c.stroke();
        }
    },

    arch(c, ax, ay, bx, by, p, g, k) {
        const len = Math.hypot(bx - ax, by - ay);
        const rise = len * 0.30 * k;
        c.strokeStyle = rgba(p.accent, 0.95 * g);
        c.lineWidth = 2.4;
        c.beginPath();
        c.moveTo(ax, ay);
        c.quadraticCurveTo((ax + bx) / 2, (ay + by) / 2 - rise * 2, bx, by);
        c.stroke();
        c.strokeStyle = rgba(p.steel, 0.55 * g);
        c.lineWidth = 1;
        for (let i = 1; i < 8; i += 1) {
            const f = i / 8;
            const x = ax + (bx - ax) * f;
            const y = ay + (by - ay) * f;
            c.beginPath();
            c.moveTo(x, y - Math.sin(f * Math.PI) * rise * 1.5);
            c.lineTo(x, y);
            c.stroke();
        }
    },

    hotmetal(c, ax, ay, bx, by, p, g, k) {
        const len = Math.hypot(bx - ax, by - ay);
        const h = len * 0.17 * k;
        const N = 7;
        c.strokeStyle = rgba(p.accent, 0.92 * g);
        c.lineWidth = 2;
        c.beginPath(); c.moveTo(ax, ay - h); c.lineTo(bx, by - h); c.stroke();
        c.strokeStyle = rgba(p.steel, 0.62 * g);
        c.lineWidth = 1.1;
        for (let i = 0; i <= N; i += 1) {
            const f = i / N;
            const x = ax + (bx - ax) * f;
            const y = ay + (by - ay) * f;
            c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke();
            if (i === N) continue;
            const f2 = (i + 1) / N;
            const x2 = ax + (bx - ax) * f2;
            const y2 = ay + (by - ay) * f2;
            c.beginPath();
            c.moveTo(x, i % 2 ? y : y - h);
            c.lineTo(x2, i % 2 ? y2 - h : y2);
            c.stroke();
        }
    },
};

export function createBridges(ctx, palette, lattice, placed = [], { reduceMotion = false } = {}) {
    // Deck direction is chosen in SCREEN space, not lattice space. Isometric
    // squashes the vertical, so the lattice-perpendicular is not the screen-
    // perpendicular — and a deck that lands on the screen's vertical axis
    // collapses into the towers rising along it. Perpendicular wins first, but a
    // near-vertical deck is rejected: a slightly skew crossing is far more
    // legible, and skew crossings are common in the real thing anyway.
    function deckDir(channel, at, scrollY) {
        const pts = channel.pts;
        const [cx, cy] = pts[at];
        const [rx1, ry1] = lattice.project(...pts[at - 1], scrollY);
        const [rx2, ry2] = lattice.project(...pts[at + 1], scrollY);
        const rl = Math.hypot(rx2 - rx1, ry2 - ry1) || 1;
        const rdx = (rx2 - rx1) / rl;
        const rdy = (ry2 - ry1) / rl;
        const [ox, oy] = lattice.project(cx, cy, scrollY);
        let best = DIRS[0];
        let bestScore = -Infinity;
        for (const d of DIRS) {
            const [sx, sy] = lattice.project(cx + d[0], cy + d[1], scrollY);
            const vl = Math.hypot(sx - ox, sy - oy) || 1;
            const vx = (sx - ox) / vl;
            const vy = (sy - oy) / vl;
            const steep = Math.abs(vx) < 0.35 ? 1.9 : 0;
            const score = (1 - Math.abs(vx * rdx + vy * rdy)) * 2 + Math.abs(vx) * 0.7 - steep;
            if (score > bestScore) { bestScore = score; best = d; }
        }
        return best;
    }

    // One bridge per stretch: repeated clicks in the same place do not stack.
    function add(channel, at, silent = false) {
        const index = clamp(at, 1, channel.pts.length - 2);
        if (placed.some((b) => b.channel === channel && Math.abs(b.at - index) < 4)) return false;
        placed.push({
            channel,
            at: index,
            type: channel.kind === 'molten'
                ? 'hotmetal'
                : WATER_TYPES[placed.length % WATER_TYPES.length],
            born: silent || reduceMotion ? -1 : performance.now(),
        });
        return true;
    }

    function frame(scrollY, t, g) {
        const cell = lattice.cell();
        for (const bridge of placed) {
            const pts = bridge.channel.pts;
            const at = clamp(bridge.at, 1, pts.length - 2);
            const [cx, cy] = pts[at];
            if (!lattice.onScreen(cx, cy, scrollY)) continue;

            const perp = deckDir(bridge.channel, at, scrollY);
            const reach = bridge.channel.order === 1 ? 1.5 : 1.15;
            const A = lattice.project(cx - perp[0] * reach, cy - perp[1] * reach, scrollY);
            const B = lattice.project(cx + perp[0] * reach, cy + perp[1] * reach, scrollY);
            const grow = bridge.born < 0 ? 1 : smooth(clamp((t - bridge.born) / 520, 0, 1));
            const ex = A[0] + (B[0] - A[0]) * grow;
            const ey = A[1] + (B[1] - A[1]) * grow;

            // A shadow on the water, offset the way an isometric sun would put it
            ctx.strokeStyle = palette.shadow;
            ctx.lineWidth = cell * 0.16;
            ctx.beginPath(); ctx.moveTo(A[0] + 4, A[1] + 5); ctx.lineTo(ex + 4, ey + 5); ctx.stroke();

            ctx.strokeStyle = rgba(palette.steel, 0.75 * g);
            ctx.lineWidth = 2.6;
            for (const P of [A, B]) {
                ctx.beginPath(); ctx.moveTo(P[0], P[1]); ctx.lineTo(P[0], P[1] + cell * 0.30); ctx.stroke();
            }

            ctx.strokeStyle = rgba(palette.deck, 0.98 * g);
            ctx.lineWidth = cell * 0.15;
            ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(ex, ey); ctx.stroke();

            if (grow > 0.35) {
                SHAPES[bridge.type](ctx, A[0], A[1], ex, ey, palette, g,
                    smooth(clamp((grow - 0.35) / 0.65, 0, 1)));
            }
        }
    }

    // Nearest channel node to a click, within reach.
    function pick(px, py, scrollY, channels) {
        let best = null;
        for (const channel of channels) {
            for (let i = 1; i < channel.pts.length - 1; i += 1) {
                const [gx, gy] = channel.pts[i];
                if (!lattice.onScreen(gx, gy, scrollY)) continue;
                const [sx, sy] = lattice.project(gx, gy, scrollY);
                const d = Math.hypot(sx - px, sy - py);
                if (!best || d < best.d) best = { d, channel, at: i };
            }
        }
        return best && best.d <= lattice.cell() * 1.1 ? best : null;
    }

    return { add, frame, pick, count: () => placed.length };
}
