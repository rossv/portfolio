// Branching river networks on the lattice.
//
// Every river enters at the top of the field and works down the page. It ends in
// one of three honest ways: it runs off the side, it reaches the bottom, or it
// flows into another river of its own kind — a confluence. Molten and water pass
// straight through each other, so an iron river crossing a water one is a
// crossing rather than a collision.
//
// Turns are 90 degrees, always, because the only directions available are the
// two downstream lattice axes and switching between them is a right angle.
//
// The seed is chosen per visit, so the valley is different every time, but it is
// held for the life of the mount so the layout does not shift under the reader.

import { AXES, DOWN } from './lattice';

// Deterministic PRNG. Seeded from outside so one visit is one world.
const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const key = (x, y) => `${x},${y}`;
const clampInt = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// One trunk per this much of the field's width, so a wide viewport gets more
// rivers rather than the same few stretched across it. Kept sparse: this is a
// backdrop, and eight trunks zigzagging at once read as lightning.
const CELLS_PER_TRUNK = 36;

// Cells before a river turns. Long reaches are what make it a river — short runs
// with a right angle at the end of each one are a sawtooth.
const RUN_MIN = 7;
const RUN_SPREAD = 14;

export function buildNetworks(lattice, seed) {
    const rnd = mulberry(seed);
    // Occupancy is per kind. Water knows where water is, so it can flow into it;
    // it has no idea where the iron runs, which is what lets them cross.
    const taken = { water: new Map(), molten: new Map() };
    const channels = [];

    const cellOwner = (kind, x, y) => taken[kind].get(key(x, y));

    function claim(kind, pts, channel) {
        for (const [x, y] of pts) {
            if (!taken[kind].has(key(x, y))) taken[kind].set(key(x, y), channel);
        }
    }

    // Walks from a start cell until it leaves the field, meets its own kind, or
    // runs out of legs. `dirs` is the pair of axis indices it alternates between.
    function walk(kind, startX, startY, firstDir, dirs, legs) {
        let x = startX;
        let y = startY;
        let d = firstDir;
        const pts = [[x, y]];
        let joined = null;

        for (let leg = 0; leg < legs; leg += 1) {
            const run = RUN_MIN + Math.floor(rnd() * RUN_SPREAD);
            let stop = false;
            for (let s = 0; s < run; s += 1) {
                const nx = x + AXES[d][0];
                const ny = y + AXES[d][1];
                if (!lattice.inField(nx, ny)) {
                    // Off the edge of the world: a clean end.
                    pts.push([nx, ny]);
                    stop = true;
                    break;
                }
                const owner = cellOwner(kind, nx, ny);
                if (owner) {
                    // Its own kind: this is a confluence. Take the cell so the
                    // join is exact, then stop.
                    pts.push([nx, ny]);
                    joined = owner;
                    stop = true;
                    break;
                }
                x = nx;
                y = ny;
                pts.push([x, y]);
            }
            if (stop) break;
            d = dirs[0] === d ? dirs[1] : dirs[0];   // the 90 degree turn
        }
        return { pts, joined };
    }

    const across = lattice.halfWidth();
    const trunkCount = clampInt(Math.round((across * 2) / CELLS_PER_TRUNK), 2, 4);

    for (let n = 0; n < trunkCount; n += 1) {
        // Enter at the top, spread across the width with a little jitter so the
        // spacing never looks stepped.
        const kind = n % 3 === 1 ? 'molten' : 'water';
        const slot = ((n + 0.5) / trunkCount) * 2 - 1;
        const u = Math.round(slot * across * 0.94 + (rnd() - 0.5) * 3);
        const v = Math.floor(rnd() * 3);
        const gx = Math.round((v + u) / 2);
        const gy = v - gx;
        if (!lattice.inField(gx, gy)) continue;

        const trunk = walk(kind, gx, gy, DOWN[Math.floor(rnd() * 2)], DOWN, 140);
        if (trunk.pts.length < 5) continue;
        const channel = { kind, order: 1, pts: trunk.pts };
        channels.push(channel);
        claim(kind, trunk.pts, channel);

        // Tributaries: trace back upstream from a point on the trunk until they
        // reach the top of the field or leave it at the side, so a headwater is
        // never left dangling in the middle of the page.
        const branches = kind === 'molten' ? 1 : 2;
        for (let b = 0; b < branches; b += 1) {
            const at = Math.floor((0.2 + 0.6 * ((b + rnd()) / branches)) * (trunk.pts.length - 2)) + 1;
            const [jx, jy] = trunk.pts[Math.min(trunk.pts.length - 2, Math.max(1, at))];
            const upDir = 2 + Math.floor(rnd() * 2);   // one of the two upstream axes
            const first = [jx + AXES[upDir][0], jy + AXES[upDir][1]];
            if (!lattice.inField(...first) || cellOwner(kind, ...first)) continue;

            const up = walk(kind, first[0], first[1], upDir, [2, 3], 60);
            if (up.pts.length < 4) continue;
            // Reverse so the geometry flows into the confluence, and finish on
            // the trunk cell itself so the join is exact.
            const pts = [...up.pts].reverse();
            pts.push([jx, jy]);
            const tributary = { kind, order: 2, pts };
            channels.push(tributary);
            claim(kind, pts, tributary);
        }
    }

    return channels;
}
