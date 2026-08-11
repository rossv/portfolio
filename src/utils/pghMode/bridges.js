// The bridges you build, as 2.5D models of eleven real Pittsburgh crossings.
//
// The structures themselves live in `bridgeShapes.js` and the volumes they are
// drawn with in `bridgeKit.js`. What is left here is everything about placing
// one: where a click lands, which stretch of river is free, how far the deck has
// to reach to find dry ground, and what stands under it.
//
// Each bridge is built in its own local frame:
//
//   t  0 → 1   along the deck, abutment to abutment
//   s -1 → 1   across the deck; -1 is the far kerb, +1 the near one
//   z          height above the deck's own plane, straight up the screen
//
// Because rivers only run on the lattice axes, the deck always crosses on the
// other axis — which projects to a 30-degree screen diagonal, never to vertical.
// That is what makes the near and far sides of a truss separate on screen, and
// it is why these read as objects rather than as flat symbols.

import { clamp, smooth } from './palette';
import { AXES, CHANNEL_WIDTH, CHANNEL_EDGE } from './lattice';
import { BRIDGES, BRIDGE_ORDER, TINTS } from './bridgeShapes';
import { createKit } from './bridgeKit';

// Nodes a new bridge must keep clear of an existing one, so two do not overlap.
const MIN_GAP = 3;

// How far a deck reaches either side of the channel's centreline, in cells along
// its own axis, so that both abutments land on dry ground.
//
// Derived rather than chosen, because a deck that falls short reads as the river
// running out from under its own bridge. Two things set it. The deck crosses on
// the other lattice axis, and the two axes are 120 degrees apart on screen, not
// 90 — so a deck one cell long only covers sin(120) of a cell measured square to
// the river. And the thing to clear is not the channel but the widest stroke the
// channel is drawn with, which is CHANNEL_EDGE.
//
// One span for both kinds, because both kinds are now drawn to the same edge. It
// used to depend on the kind, so the same bridge came out a third longer over
// molten iron than over water.
//
// The multi-span bridges do not lengthen this. They divide it, and land their
// intermediate piers in the water — which is what the real Smithfield, the real
// Sixteenth Street and the real Hot Metal do.
const AXIS_SPREAD = Math.sin((2 * Math.PI) / 3);
const ABUTMENT = 0.42;      // cells of dry ground under each abutment

const SPAN = (CHANNEL_EDGE * CHANNEL_WIDTH * 0.5 + ABUTMENT) / AXIS_SPREAD;

// Half the deck's width as a fraction of a cell, before a bridge's own multiplier.
const DECK_HALF = 0.34;

// Distance from a point to a segment, and how far along it the foot fell.
function toSegment(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const s = clamp(((px - ax) * dx + (py - ay) * dy) / len2, 0, 1);
    return { d: Math.hypot(px - (ax + dx * s), py - (ay + dy * s)), s };
}

export function createBridges(ctx, palette, lattice, placed = [], {
    reduceMotion = false,
    chunk = undefined,
} = {}) {
    const tints = TINTS[palette.light ? 'light' : 'dark'];

    // A bridge is painted either the accent — the four that really are Aztec
    // gold — or its own steel out of the tint table. Anything unlisted falls
    // back to the palette's bronze, so a new entry draws before it is coloured.
    const hueFor = (key) => {
        if (!key || key === 'bridge') return palette.bridge;
        if (key === 'gold') return palette.accent;
        return tints[key] ?? palette.bridge;
    };

    // Builds the local frame for one bridge and returns a point mapper.
    function frameFor(channel, at, scrollY, span, half) {
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
        const wx = (W[0] - O[0]) * half;
        const wy = (W[1] - O[1]) * half;

        return (t, s, z = 0) => [
            A[0] + (B[0] - A[0]) * t + wx * s,
            A[1] + (B[1] - A[1]) * t + wy * s - z,
        ];
    }

    const blocked = (channel, at) =>
        placed.some((b) => b.channel === channel && Math.abs(b.at - at) < MIN_GAP);

    // One bridge per stretch: repeated clicks in the same place do not stack.
    function add(channel, at, silent = false) {
        const index = clamp(at, 1, channel.pts.length - 2);
        if (blocked(channel, index)) return false;
        const channelBridgeCount = placed.filter((bridge) => bridge.channel === channel).length;
        placed.push({
            channel,
            at: index,
            type: BRIDGE_ORDER[channelBridgeCount % BRIDGE_ORDER.length],
            born: silent || reduceMotion ? -1 : performance.now(),
        });
        return true;
    }

    function frame(scrollY, t, g) {
        const cell = lattice.cell();
        const thick = cell * 0.16;
        for (const bridge of placed) {
            const spec = BRIDGES[bridge.type] ?? BRIDGES[BRIDGE_ORDER[0]];
            const pts = bridge.channel.pts;
            const at = clamp(bridge.at, 1, pts.length - 2);
            if (!lattice.onScreen(pts[at][0], pts[at][1], scrollY)) continue;

            const half = DECK_HALF * (spec.deckWidth ?? 1);
            const P = frameFor(bridge.channel, at, scrollY, SPAN, half);
            const grow = bridge.born < 0 ? 1 : smooth(clamp((t - bridge.born) / 560, 0, 1));
            const to = Math.max(0.04, grow);

            const kit = createKit(ctx, {
                P,
                palette,
                g,
                k: smooth(clamp((grow - 0.4) / 0.6, 0, 1)),
                thick,
                cell,
                hue: hueFor(spec.hue),
                trim: spec.trim ? hueFor(spec.trim) : null,
                twin: spec.twin === true,
                chunk,
            });

            const [sLo, sHi] = spec.shadow ?? [-1.5, 1.5];
            kit.shadow(to, sLo, sHi);

            // Piers, as each one is reached by the deck growing over it.
            const depth = cell * 0.34 * (spec.pierDepth ?? 1);
            for (const at01 of spec.piers ?? [0, 1]) {
                if (to < at01 - 0.02) continue;
                kit.pier(at01, depth);
            }
            kit.deck(to);

            // The superstructure waits until the deck is most of the way over,
            // so a bridge does not arrive roof-first.
            if (grow > 0.4) spec.draw(kit);
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
