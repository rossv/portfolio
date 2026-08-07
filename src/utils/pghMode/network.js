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

// `blocked` is the ground the landmarks stand on. The landmarks are fixed and the
// rivers are not, so a river gives way: if the axis it wants would put it on a
// plinth, it takes the other. That is possible because the path is only monotone
// in depth â€” sideways it is free, so it can pass a box on either hand and still
// arrive exactly where it has to. If both axes are blocked it takes whichever has
// budget and accepts the crossing, which beats looping.
function staircase(rnd, from, to, blocked, corridor = null) {
    let dx = to[0] - from[0];
    let dy = to[1] - from[1];
    const total = dx + dy;
    const fromAcross = from[0] - from[1];
    const toAcross = to[0] - to[1];
    let [x, y] = from;
    const pts = [[x, y]];
    let axis = -1;
    let run = 0;
    let guard = 0;

    while ((dx > 0 || dy > 0) && guard++ < 6000) {
        const canX = dx > 0;
        const canY = dy > 0;

        // On a narrow screen a long, unconstrained random walk can spend most
        // of the page several viewport-widths away from its endpoints. Keep
        // mobile reaches in a loose corridor around the straight line joining
        // their endpoints. The reach still meanders inside that corridor, but
        // the river cannot disappear off one side for the rest of the page.
        if (corridor && canX && canY) {
            const progress = (total - dx - dy) / total;
            const guide = fromAcross + (toAcross - fromAcross) * progress;
            const across = x - y;
            if (across >= guide + corridor) {
                axis = 1;
                run = Math.max(run, 1);
            } else if (across <= guide - corridor) {
                axis = 0;
                run = Math.max(run, 1);
            }
        }

        // Keep the current reach going where possible; long reaches are what make
        // these read as rivers rather than as a sawtooth.
        if (run <= 0 || (axis === 0 && !canX) || (axis === 1 && !canY)) {
            axis = !canY ? 0 : !canX ? 1 : (rnd() < dx / (dx + dy) ? 0 : 1);
            run = RUN_MIN + Math.floor(rnd() * RUN_SPREAD);
        }

        let nx = x + AXES[axis][0];
        let ny = y + AXES[axis][1];
        if (blocked && blocked(nx, ny)) {
            const other = axis === 0 ? 1 : 0;
            const otherOk = other === 0 ? canX : canY;
            const ox = x + AXES[other][0];
            const oy = y + AXES[other][1];
            if (otherOk && !blocked(ox, oy)) {
                axis = other;
                nx = ox;
                ny = oy;
                run = RUN_MIN + Math.floor(rnd() * RUN_SPREAD);
            }
        }

        x = nx;
        y = ny;
        if (axis === 0) dx -= 1; else dy -= 1;
        run -= 1;
        pts.push([x, y]);
    }
    return pts;
}

// A straight run along one axis.
function straight(from, axis, n) {
    const pts = [];
    let [x, y] = from;
    for (let i = 0; i < n; i += 1) {
        x += axis[0];
        y += axis[1];
        pts.push([x, y]);
    }
    return pts;
}

// How far back from the Point each river runs dead straight. The two use
// different axes over this stretch, so they arrive at a right angle instead of
// converging along the same line.
const APPROACH = 9;

// Chebyshev distance between two lattice cells.
const gap = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));

// The closest the two water rivers come to each other, ignoring the stretch
// where they are meant to be converging.
function closestApproach(a, b) {
    const endA = a.length - APPROACH - 2;
    const endB = b.length - APPROACH - 2;
    let min = Infinity;
    for (let i = 0; i < endA; i += 1) {
        for (let j = 0; j < endB; j += 1) {
            const d = gap(a[i], b[j]);
            if (d < min) min = d;
            if (min <= 1) return min;
        }
    }
    return min;
}

export function buildNetwork(lattice, seed, sourceDepth, blocked) {
    // Rivers that run within two cells of each other read as one doubled channel
    // rather than as two rivers, so a layout that does that is thrown away and
    // re-rolled. Ten attempts is plenty; past that, take what we have.
    for (let attempt = 0; attempt < 10; attempt += 1) {
        const built = attemptNetwork(lattice, seed + attempt * 7919, sourceDepth, blocked);
        if (!built) continue;
        if (built.separation >= 3 || attempt === 9) return built;
    }
    return attemptNetwork(lattice, seed, sourceDepth, blocked);
}

function attemptNetwork(lattice, seed, sourceDepth, blocked) {
    const rnd = mulberry(seed);
    const u = lattice.halfWidth();
    const v = lattice.depth();
    // Desktop has room for the broad, naturally wandering routes. On phones,
    // bound that wandering to a few cells so both the water and molten-iron
    // streams remain part of the on-screen composition throughout the page.
    const mobileCorridor = u <= 12 ? Math.max(2, Math.floor(u * 0.3)) : null;

    // The Point: right of centre, about a third of the way down.
    const confA = Math.round(u * 0.34);
    const confD = Math.round(v * 0.30 + rnd() * v * 0.04);
    const confluence = lattice.cellAt(confA, confD);

    // Each river runs straight into the Point over its last stretch, on its own
    // axis: the Allegheny down-right, the Monongahela down-left. That is what
    // makes the junction a V rather than two channels sliding together.
    const alleghenyGate = [confluence[0] - APPROACH * AXES[0][0], confluence[1] - APPROACH * AXES[0][1]];
    const monGate = [confluence[0] - APPROACH * AXES[1][0], confluence[1] - APPROACH * AXES[1][1]];

    // Allegheny: in at the very top, so it runs out from behind the hero.
    const alleghenyStart = lattice.cellAt(Math.round(u * (0.05 + rnd() * 0.3)), 0);

    // Monongahela: in from the right edge. Its start has to be upstream of its
    // own gate on both axes, which â€” the edge being far across â€” puts it above as
    // well as beside. A river entering from the side still runs downhill.
    const monA = u;
    const monD = confD - Math.round(u * 0.66) - 2 - Math.floor(rnd() * 5);
    if (monD < 1) return null;
    const monStart = lattice.cellAt(monA, monD);

    // A river's destination must not itself sit on a plinth. The staircase can
    // dodge a box on the way, but on its final approach only one axis has budget
    // left, so it has no freedom to steer — if the target is inside a landmark it
    // will walk in. Shift the target sideways until it is clear.
    const clearTarget = (across, depth) => {
        for (let k = 0; k <= 24; k += 1) {
            for (const s of (k === 0 ? [0] : [-k, k])) {
                const cell = lattice.cellAt(across + s, depth);
                if (!blocked || !blocked(cell[0], cell[1])) return cell;
            }
        }
        return lattice.cellAt(across, depth);
    };

    // Ohio: away from the Point and down the right.
    const ohio = clearTarget(Math.round(u * (0.62 + rnd() * 0.24)), v);

    // Iron: from the crucible, down the left, all the way off the foot.
    const source = lattice.cellAt(Math.round(-u * 0.46), sourceDepth);
    const ironOut = clearTarget(Math.round(-u * (0.6 + rnd() * 0.25)), v);

    const alleghenyPts = staircase(rnd, alleghenyStart, alleghenyGate, blocked, mobileCorridor)
        .concat(straight(alleghenyGate, AXES[0], APPROACH));
    const monPts = staircase(rnd, monStart, monGate, blocked, mobileCorridor)
        .concat(straight(monGate, AXES[1], APPROACH));

    const channels = [
        { kind: 'water', name: 'allegheny', pts: alleghenyPts },
        { kind: 'water', name: 'monongahela', pts: monPts },
        // The Ohio is water. It leaves the Point as a river, not as iron: the
        // iron never reaches the confluence, it runs its own course down the left.
        { kind: 'water', name: 'ohio', pts: staircase(rnd, confluence, ohio, blocked, mobileCorridor) },
        { kind: 'molten', name: 'iron', pts: staircase(rnd, source, ironOut, blocked, mobileCorridor) },
    ];

    return {
        channels,
        source,
        confluence,
        separation: closestApproach(alleghenyPts, monPts),
    };
}
