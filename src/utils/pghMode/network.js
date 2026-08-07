// The valley: the Point, and a river of iron beside it.
//
//   allegheny    enters at the top, from behind the hero
//   monongahela  enters from the right edge, about a third of the way down
//   ohio         from where those two meet, down the right of the page
//   molten       poured from the crucible in the expertise section, down the left
//
// Sides are fixed, not seeded: iron always runs left, the Ohio always right.
// Only the shape of each reach varies from visit to visit.
//
// Nothing branches. Every river is a monotone staircase on the lattice: because
// only the two downstream axes are available, any target downstream of a start
// can always be reached by interleaving runs of the two, which makes "meet
// exactly here" exact rather than a walk that lands nearby.
//
// Screen sense of the two axes, which is what puts a river on a side:
//   AXES[0] = [1, 0]  moves right and down
//   AXES[1] = [0, 1]  moves left and down

import { AXES } from './lattice';

const mulberry = (a) => () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const RUN_MIN = 6;
const RUN_SPREAD = 13;

function staircase(rnd, from, to) {
    let dx = to[0] - from[0];
    let dy = to[1] - from[1];
    let [x, y] = from;
    const pts = [[x, y]];
    let guard = 0;
    while ((dx > 0 || dy > 0) && guard++ < 5000) {
        const useX = dy <= 0 ? true : dx <= 0 ? false : rnd() < dx / (dx + dy);
        const budget = useX ? dx : dy;
        const run = Math.max(1, Math.min(budget, RUN_MIN + Math.floor(rnd() * RUN_SPREAD)));
        const axis = useX ? AXES[0] : AXES[1];
        for (let i = 0; i < run; i += 1) {
            x += axis[0];
            y += axis[1];
            if (useX) dx -= 1; else dy -= 1;
            pts.push([x, y]);
        }
    }
    return pts;
}

export function buildNetwork(lattice, seed, sourceDepth) {
    const rnd = mulberry(seed);
    const u = lattice.halfWidth();
    const v = lattice.depth();

    // The Point: right of centre, about a third of the way down.
    const confA = Math.round(u * 0.34);
    const confD = Math.round(v * 0.30 + rnd() * v * 0.04);
    const confluence = lattice.cellAt(confA, confD);

    // Allegheny: in at the very top, so it runs out from behind the hero.
    const alleghenyStart = lattice.cellAt(Math.round(u * (0.05 + rnd() * 0.3)), 0);

    // Monongahela: in from the right edge. Its start has to be upstream of the
    // Point on both axes, which — the edge being far across — puts it above as
    // well as beside. A river entering from the side still runs downhill.
    const monA = u;
    const monD = Math.min(
        confD + confA - monA,
        confD - confA + monA,
    ) - 2 - Math.floor(rnd() * 5);
    const monStart = lattice.cellAt(monA, monD);

    // Ohio: away from the Point and down the right.
    const ohio = lattice.cellAt(Math.round(u * (0.62 + rnd() * 0.24)), v);

    // Iron: from the crucible, down the left, all the way off the foot.
    const source = lattice.cellAt(Math.round(-u * 0.46), sourceDepth);
    const ironOut = lattice.cellAt(Math.round(-u * (0.6 + rnd() * 0.25)), v);

    const channels = [
        { kind: 'water', name: 'allegheny', pts: staircase(rnd, alleghenyStart, confluence) },
        { kind: 'water', name: 'monongahela', pts: staircase(rnd, monStart, confluence) },
        { kind: 'combined', name: 'ohio', pts: staircase(rnd, confluence, ohio) },
        { kind: 'molten', name: 'iron', pts: staircase(rnd, source, ironOut) },
    ];

    return { channels, source, confluence };
}
