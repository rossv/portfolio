// The isometric lattice Pittsburgh mode is built on.
//
// Everything in this mode lives on one ground plane. Rivers are routed between
// lattice nodes, turning only 90 or 45 degrees, and bridges cross square to the
// channel — all of which falls out of the lattice for free.
//
// The plane drifts with the page rather than sitting fixed. One rate for the
// whole plane, deliberately: giving the water and the molten different rates
// would slide them against each other and break the one-cell gap that keeps
// channels from touching. Depth has to come from a separate layer, not from two
// halves of the same ground.

export const CELL = 38;        // px between neighbouring lattice nodes
export const PARALLAX = 0.45;  // ground-plane travel per pixel of page scroll

// Channel width, in cells. Lives here rather than in channels.js because the hit
// test needs the same number the channel is drawn with: when they disagree, the
// clickable strip stops matching the thing on screen.
export const CHANNEL_WIDTH = 1.86;

// Rivers run on the lattice axes only, which is the whole routing vocabulary:
// every turn between them is 90 degrees, and because the axes project to the
// screen's two 30-degree diagonals, a channel never runs straight up, down, or
// across. The lattice diagonals — which would project to screen vertical and
// horizontal — are deliberately not available.
//
//   AXES[0], AXES[1]  carry a river downstream (down the page)
//   AXES[2], AXES[3]  are their opposites, used only to trace a tributary back
//                     up to its headwater
export const AXES = [[1, 0], [0, 1], [-1, 0], [0, -1]];

// The two downstream axes. Alternating between them is the 90-degree turn.
export const DOWN = [0, 1];

const W2 = CELL * 0.866;
const H2 = CELL * 0.5;

export function createLattice() {
    let width = 0;
    let height = 0;
    // The field is a diagonal band, not a square: `u` is how far a node sits
    // across the screen, `v` how far down it. A square lattice big enough to
    // carry a long page would be ten thousand pixels wide for no reason.
    let u = 0;
    let v = 0;
    let originY = 0;

    // Returns true only when the field's own dimensions changed. The routing is
    // bounded by them, so the scene uses this to avoid re-routing the network
    // every time something on the page nudges the body height.
    function resize(w, h, documentScroll) {
        const nextU = Math.ceil(w / (2 * W2)) + 3;
        // The plane travels scroll * PARALLAX, so the band has to be deep
        // enough to still be under the page when the reader reaches the bottom.
        //
        // Quantised, and that matters: the routing is bounded by this depth, so
        // taking the page height raw meant every few-hundred-pixel wobble while
        // islands hydrated changed the field and re-routed the whole network
        // under the reader. Rounding up to the nearest 2000px of scroll makes the
        // depth stable across that settling.
        const bucket = Math.ceil(Math.max(0, documentScroll) / 2000) * 2000;
        const travel = bucket * PARALLAX;
        // Depth is measured in gx+gy, and screen y is (gx+gy) * H2 — one H2, not
        // two. Halving it left the field ending well above the bottom of a long
        // page, so the last third of the document had no valley under it at all.
        const nextV = Math.ceil((h + travel) / H2) + 10;
        const changed = nextU !== u || nextV !== v || w !== width || h !== height;
        width = w;
        height = h;
        u = nextU;
        v = nextV;
        originY = -H2 * 3;
        return changed;
    }

    const inField = (gx, gy) =>
        Math.abs(gx - gy) <= u && gx + gy >= 0 && gx + gy <= v;

    const project = (gx, gy, scrollY) => [
        width / 2 + (gx - gy) * W2,
        originY + (gx + gy) * H2 - scrollY * PARALLAX,
    ];

    // Generous margins: a channel is drawn with a wide stroke, and a bridge
    // stands well above its deck.
    const onScreen = (gx, gy, scrollY) => {
        const y = originY + (gx + gy) * H2 - scrollY * PARALLAX;
        return y > -CELL * 4 && y < height + CELL * 4;
    };

    // The field is easier to reason about in (across, down) than in (gx, gy):
    // `a` is how far a cell sits across the screen from centre, `d` how far down.
    const cellAt = (a, d) => {
        const gx = Math.round((d + a) / 2);
        return [gx, d - gx];
    };

    // Which depth a screen height corresponds to at a given scroll — used to put
    // the crucible just below the hero, and the confluence a third down.
    const depthAtScreenY = (y, scrollY) =>
        Math.round((y - originY + scrollY * PARALLAX) / H2);

    return {
        resize,
        inField,
        project,
        onScreen,
        cellAt,
        depthAtScreenY,
        // Depth gained per pixel of document, for anything pinned to the page
        // rather than to the field.
        depthPerDocPx: () => PARALLAX / H2,
        cell: () => CELL,
        halfWidth: () => u,
        depth: () => v,
        width: () => width,
        height: () => height,
    };
}
