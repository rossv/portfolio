// The bridges you build, as 2.5D models in four Pittsburgh silhouettes.
//
//   sisters     — self-anchored eyebar suspension, the Three Sisters
//   lenticular  — the Smithfield Street lens
//   arch        — a tied arch, Fort Pitt and the West End
//   hotmetal    — a through truss; the real Hot Metal Bridge carried crucibles
//                 of iron across the Mon, so the molten river always gets it
//
// These are volumes, not line drawings. Each bridge is built in its own local
// frame and every piece is a shaded quad or a paired near/far member:
//
//   t  0 → 1   along the deck, abutment to abutment
//   s -1 → 1   across the deck; -1 is the far kerb, +1 the near one
//   z          height above the deck's own plane, straight up the screen
//
// Because rivers only run on the lattice axes, the deck always crosses on the
// other axis — which projects to a 30-degree screen diagonal, never to vertical.
// That is what makes the near and far sides of a truss separate on screen, and
// it is why these read as objects rather than as flat symbols.

import { rgba, clamp, smooth } from './palette';
import { AXES, CHANNEL_WIDTH } from './lattice';

const WATER_TYPES = ['sisters', 'lenticular', 'arch'];

// Nodes a new bridge must keep clear of an existing one, so two do not overlap.
const MIN_GAP = 3;

// Distance from a point to a segment, and how far along it the foot fell.
function toSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const s = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
    return { d: Math.hypot(px - (ax + dx * s), py - (ay + dy * s)), s };
}

export function createBridges(ctx, palette, lattice, placed = [], { reduceMotion = false } = {}) {
    // Builds the local frame for one bridge and returns a point mapper.
    function frameFor(channel, at, scrollY, span) {
        const pts = channel.pts;
        const [cx, cy] = pts[at];
        const prev = pts[at - 1];
        const next = pts[at + 1];
        // The river runs on one axis here, so the deck takes the other one.
        const along = [next[0] - prev[0], next[1] - prev[1]];
        const river = Math.abs(along[0]) >= Math.abs(along[1]) ? 0 : 1;
        const deckAxis = AXES[river === 0 ? 1 : 0];
        const acrossAxis = AXES[river];

        const A = lattice.project(cx - deckAxis[0] * span, cy - deckAxis[1] * span, scrollY);
        const B = lattice.project(cx + deckAxis[0] * span, cy + deckAxis[1] * span, scrollY);
        const O = lattice.project(cx, cy, scrollY);
        const W = lattice.project(cx + acrossAxis[0], cy + acrossAxis[1], scrollY);
        // Half the deck's width, as a screen vector along the river.
        const half = 0.34;
        const wx = (W[0] - O[0]) * half;
        const wy = (W[1] - O[1]) * half;

        return (t, s, z = 0) => [
            A[0] + (B[0] - A[0]) * t + wx * s,
            A[1] + (B[1] - A[1]) * t + wy * s - z,
        ];
    }

    const quad = (P, a, b, c, d, fill) => {
        ctx.beginPath();
        for (const [i, pt] of [a, b, c, d].entries()) {
            const [x, y] = P(...pt);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
    };

    const line = (P, from, to, stroke, w) => {
        const [x1, y1] = P(...from);
        const [x2, y2] = P(...to);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    };

    // A curve in one of the two vertical planes (s fixed), used for cables,
    // arches and lens chords.
    const curve = (P, s, rise, bulge, stroke, w, from = 0, to = 1) => {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = w;
        ctx.beginPath();
        const steps = 26;
        for (let i = 0; i <= steps; i += 1) {
            const t = from + (to - from) * (i / steps);
            const z = rise * bulge(t);
            const [x, y] = P(t, s, z);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    // The deck itself: a slab with a lit top, a near face and two ends.
    function deckSlab(P, p, g, thick, to) {
        quad(P, [0, -1, thick], [to, -1, thick], [to, 1, thick], [0, 1, thick],
            rgba(p.deck, 0.95 * g));                        // top
        quad(P, [0, 1, thick], [to, 1, thick], [to, 1, 0], [0, 1, 0],
            rgba(p.steel, 0.55 * g));                       // near face
        quad(P, [to, -1, thick], [to, 1, thick], [to, 1, 0], [to, -1, 0],
            rgba(p.steel, 0.34 * g));                       // far end
        ctx.strokeStyle = rgba(p.structure, 0.35 * g);
        ctx.lineWidth = 1;
        for (const s of [-1, 1]) {
            const [x1, y1] = P(0, s, thick);
            const [x2, y2] = P(to, s, thick);
            ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
    }

    // A pier face under each abutment, so the deck stands on something rather
    // than floating over the channel.
    function pier(P, p, g, t, depth) {
        quad(P, [t, -1, 0], [t, 1, 0], [t, 1, -depth], [t, -1, -depth],
            rgba(p.steel, 0.42 * g));
    }

    const SHAPES = {
        // Two towers, and the shallow self-anchored chain slung between them.
        sisters(P, p, g, k, thick) {
            const rise = 34 * k;
            const towers = [0.2, 0.8];
            for (const t of towers) {
                for (const s of [-1, 1]) {
                    line(P, [t, s, thick], [t, s, thick + rise], rgba(p.steel, 0.9 * g), 3);
                }
                // portal strut across the tower top, which is what makes the two
                // legs read as one tower rather than two posts
                line(P, [t, -1, thick + rise], [t, 1, thick + rise], rgba(p.steel, 0.8 * g), 2.4);
            }
            const sag = (t) => {
                if (t < towers[0]) return thick + rise * (t / towers[0]) * 0.86;
                if (t > towers[1]) return thick + rise * ((1 - t) / (1 - towers[1])) * 0.86;
                const f = (t - towers[0]) / (towers[1] - towers[0]);
                return thick + rise * (0.62 + 0.38 * Math.cos((f - 0.5) * Math.PI * 1.6));
            };
            for (const s of [-1, 1]) {
                curve(P, s, 1, sag, rgba(p.bridge, s < 0 ? 0.6 * g : 0.95 * g), s < 0 ? 1.6 : 2.2);
            }
            for (let i = 1; i < 8; i += 1) {
                const t = towers[0] + ((towers[1] - towers[0]) * i) / 8;
                for (const s of [-1, 1]) {
                    line(P, [t, s, thick], [t, s, sag(t)], rgba(p.steel, 0.5 * g), 1);
                }
            }
        },

        // Smithfield: a lens either side, chords bulging above and below.
        lenticular(P, p, g, k, thick) {
            const rise = 24 * k;
            const up = (t) => thick + Math.sin(t * Math.PI) * rise;
            const dn = (t) => thick - Math.sin(t * Math.PI) * rise * 0.62;
            for (const s of [-1, 1]) {
                const a = s < 0 ? 0.6 : 1;
                curve(P, s, 1, up, rgba(p.bridge, 0.92 * a * g), s < 0 ? 1.6 : 2.2);
                curve(P, s, 1, dn, rgba(p.bridge, 0.7 * a * g), s < 0 ? 1.4 : 1.9);
                for (let i = 1; i < 7; i += 1) {
                    const t = i / 7;
                    line(P, [t, s, up(t)], [t, s, dn(t)], rgba(p.steel, 0.45 * a * g), 1);
                }
            }
            // top lateral bracing between the two lenses
            for (let i = 1; i < 7; i += 1) {
                const t = i / 7;
                line(P, [t, -1, up(t)], [t, 1, up(t)], rgba(p.steel, 0.3 * g), 1);
            }
        },

        // A tied arch: two ribs, hangers, and the tie along the deck.
        arch(P, p, g, k, thick) {
            const rise = 42 * k;
            const rib = (t) => thick + Math.sin(t * Math.PI) * rise;
            for (const s of [-1, 1]) {
                const a = s < 0 ? 0.6 : 1;
                curve(P, s, 1, rib, rgba(p.bridge, 0.95 * a * g), s < 0 ? 2 : 2.8);
                for (let i = 1; i < 8; i += 1) {
                    const t = i / 8;
                    line(P, [t, s, rib(t)], [t, s, thick], rgba(p.steel, 0.45 * a * g), 1);
                }
            }
            for (const t of [0.32, 0.5, 0.68]) {
                line(P, [t, -1, rib(t)], [t, 1, rib(t)], rgba(p.steel, 0.32 * g), 1.1);
            }
        },

        // Hot Metal: a through truss, so the deck runs between the two trusses.
        hotmetal(P, p, g, k, thick) {
            const h = 26 * k;
            const N = 6;
            for (const s of [-1, 1]) {
                const a = s < 0 ? 0.6 : 1;
                line(P, [0, s, thick + h], [1, s, thick + h], rgba(p.bridge, 0.9 * a * g), 2.2);
                for (let i = 0; i <= N; i += 1) {
                    const t = i / N;
                    line(P, [t, s, thick], [t, s, thick + h], rgba(p.steel, 0.55 * a * g), 1.2);
                    if (i === N) continue;
                    const t2 = (i + 1) / N;
                    line(P, [t, s, i % 2 ? thick : thick + h], [t2, s, i % 2 ? thick + h : thick],
                        rgba(p.steel, 0.45 * a * g), 1);
                }
            }
            // portal bracing at each end, and sway bracing overhead
            for (const t of [0, 1]) {
                line(P, [t, -1, thick + h], [t, 1, thick + h], rgba(p.steel, 0.6 * g), 1.6);
            }
            for (let i = 1; i < N; i += 1) {
                const t = i / N;
                line(P, [t, -1, thick + h], [t, 1, thick + h], rgba(p.steel, 0.26 * g), 1);
            }
        },
    };

    const blocked = (channel, at) =>
        placed.some((b) => b.channel === channel && Math.abs(b.at - at) < MIN_GAP);

    // One bridge per stretch: repeated clicks in the same place do not stack.
    function add(channel, at, silent = false) {
        const index = clamp(at, 1, channel.pts.length - 2);
        if (blocked(channel, index)) return false;
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
        const thick = cell * 0.16;
        for (const bridge of placed) {
            const pts = bridge.channel.pts;
            const at = clamp(bridge.at, 1, pts.length - 2);
            if (!lattice.onScreen(pts[at][0], pts[at][1], scrollY)) continue;

            const span = bridge.channel.order === 1 ? 1.6 : 1.2;
            const P = frameFor(bridge.channel, at, scrollY, span);
            const grow = bridge.born < 0 ? 1 : smooth(clamp((t - bridge.born) / 560, 0, 1));
            const to = Math.max(0.04, grow);

            // Shadow on the water first, so the model sits in the channel.
            quad(P, [0, -1.5, -thick * 1.4], [to, -1.5, -thick * 1.4],
                [to, 1.5, -thick * 1.4], [0, 1.5, -thick * 1.4], palette.shadow);

            pier(P, palette, g, 0, cell * 0.34);
            if (grow > 0.9) pier(P, palette, g, 1, cell * 0.34);
            deckSlab(P, palette, g, thick, to);

            if (grow > 0.4) {
                SHAPES[bridge.type](P, palette, g, smooth(clamp((grow - 0.4) / 0.6, 0, 1)), thick);
            }
        }
    }

    // Where a click lands on a channel.
    //
    // Measured to the channel's segments rather than to its nodes. Nodes are a
    // cell apart, so a node test makes the target a string of circles with thin
    // spots between them — which is what made this feel fussy. Against segments
    // the target is the drawn ribbon itself, and the reach is the ribbon's own
    // half-width plus a margin, so anywhere on the water counts.
    function pick(px, py, scrollY, channels) {
        const cell = lattice.cell();
        const reach = cell * CHANNEL_WIDTH * 0.5 + cell * 0.7;
        let best = null;

        for (const channel of channels) {
            const pts = channel.pts;
            for (let i = 1; i < pts.length - 2; i += 1) {
                const a = pts[i];
                const b = pts[i + 1];
                if (!lattice.onScreen(a[0], a[1], scrollY) && !lattice.onScreen(b[0], b[1], scrollY)) continue;
                const [ax, ay] = lattice.project(a[0], a[1], scrollY);
                const [bx, by] = lattice.project(b[0], b[1], scrollY);
                const hit = toSegment(px, py, ax, ay, bx, by);
                if (!best || hit.d < best.d) {
                    best = { d: hit.d, channel, at: i + Math.round(hit.s) };
                }
            }
        }
        if (!best || best.d > reach) return null;

        // If that spot is too close to a bridge already standing, step along the
        // channel to the nearest place that will take one. Falling through to a
        // splash instead made a refused placement indistinguishable from a miss,
        // which is most of why this read as needing precision.
        const last = best.channel.pts.length - 2;
        if (blocked(best.channel, best.at)) {
            for (let step = 1; step <= MIN_GAP + 2; step += 1) {
                if (best.at + step <= last && !blocked(best.channel, best.at + step)) {
                    best.at += step;
                    break;
                }
                if (best.at - step >= 1 && !blocked(best.channel, best.at - step)) {
                    best.at -= step;
                    break;
                }
            }
        }
        return best;
    }

    return { add, frame, pick, count: () => placed.length };
}
