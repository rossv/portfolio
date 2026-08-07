// The valley: two rivers and one confluence, and nothing else.
//
//   molten    poured from a crucible just below the hero, running down the page
//   water     entering from the side, about a third of the way down
//   combined  from the confluence to the foot of the field
//
// Nothing branches. Both rivers are monotone staircases on the lattice: because
// only the two downstream axes are available, any target that is downstream of
// a start can always be reached by interleaving runs of the two, which makes
// "meet exactly here" exact rather than a random walk that lands nearby.
//
// The seed is drawn per visit, so the valley is different every time.

import { AXES } from './lattice';

const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Long reaches with a right angle at the end of each. Short runs read as a
// sawtooth rather than as a river.
const RUN_MIN = 6;
const RUN_SPREAD = 13;

// A staircase from one cell to another, using only the two downstream axes.
// Requires the target to be downstream on both.
function staircase(rnd, from, to) {
    let dx = to[0] - from[0];
    let dy = to[1] - from[1];
    let [x, y] = from;
    const pts = [[x, y]];
    let guard = 0;
    while ((dx > 0 || dy > 0) && guard++ < 4000) {
        const useX = dy <= 0 ? true : dx <= 0 ? false : rnd() < dx / (dx + dy);
        const budget = useX ? dx : dy;
        const run = Math.max(1, Math.min(budget, RUN_MIN + Math.floor(rnd() * RUN_SPREAD)));
        for (let i = 0; i < run; i += 1) {
            if (useX) { x += AXES[0][0]; y += AXES[0][1]; dx -= 1; } else { x += AXES[1][0]; y += AXES[1][1]; dy -= 1; }
            pts.push([x, y]);
        }
    }
    return pts;
}

export function buildNetwork(lattice, seed, heroDepth) {
    const rnd = mulberry(seed);
    const across = lattice.halfWidth();
    const depth = lattice.depth();

    // The crucible stands just below the hero, left or right of centre.
    const side = rnd() < 0.5 ? -1 : 1;
    const sourceA = Math.round(side * across * (0.22 + rnd() * 0.16));
    const sourceD = heroDepth + 2;
    const source = lattice.cellAt(sourceA, sourceD);

    // The confluence sits about a third of the way down the page, pulled a
    // little toward the far side from the crucible so the molten has a run.
    const confA = Math.round(-side * across * (0.05 + rnd() * 0.2));
    const confD = Math.round(depth * (0.30 + rnd() * 0.08));
    const confluence = lattice.cellAt(confA, confD);

    // The water enters from the opposite edge. Its start has to be upstream of
    // the confluence on both axes, which — because the edge is far across — puts
    // it above as well as beside. That is the geometry, not a compromise: a
    // river entering from the side still has to run downhill to the meeting.
    const waterA = -side * across;
    const waterD = confD - Math.abs(confA - waterA) - 2 - Math.floor(rnd() * 6);
    const waterStart = lattice.cellAt(waterA, waterD);

    // Below the meeting, one combined river to the foot of the field.
    const outA = Math.round(confA + side * across * (0.1 + rnd() * 0.3));
    const outD = depth;
    const out = lattice.cellAt(outA, outD);

    const molten = { kind: 'molten', pts: staircase(rnd, source, confluence) };
    const water = { kind: 'water', pts: staircase(rnd, waterStart, confluence) };
    const combined = { kind: 'combined', pts: staircase(rnd, confluence, out) };

    return {
        channels: [molten, water, combined],
        molten,
        water,
        combined,
        source,
        confluence,
    };
}
