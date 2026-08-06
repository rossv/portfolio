// Pittsburgh mode: an isometric ground plane carrying two river networks, one
// water and one molten iron, crossed by bridges the visitor puts up.
//
// The plane drifts with the page. Everything on it — lattice, channels, bridges
// — moves at the one rate, because giving the two networks different rates would
// slide them against each other and break the gap that holds channels apart.
//
// Composition lives here rather than in FluidBackground: the order matters in
// both directions. Banks go down before any water, water before molten so the
// hot channel reads as nearer, and bridges last so a deck is never buried by the
// channel it crosses.

import { paletteFor, rgba, smooth, clamp } from './palette';
import { createLattice } from './lattice';
import { buildNetworks } from './network';
import { createChannels } from './channels';
import { createBridges } from './bridges';

export { paletteFor };

const ARRIVE_MS = 1700;
const SEED = 20260806;

export function createScene(ctx, palette, placed = [], { reduceMotion = false } = {}) {
    const lattice = createLattice();
    const channels = createChannels(ctx, palette, lattice, { reduceMotion });
    const bridges = createBridges(ctx, palette, lattice, placed, { reduceMotion });
    let network = [];

    // The page's own height decides how deep the lattice has to run, and it
    // changes as islands hydrate and images load. That is an observer's job:
    // reading scrollHeight forces a synchronous reflow, which does not belong in
    // a callback that already runs every frame.
    let heightObserver = null;
    let pendingRebuild = true;

    let arriveFrom = null;
    let arrived = true;

    function arrive() {
        if (reduceMotion) return;
        arriveFrom = null;
        arrived = false;
    }

    const documentScroll = () => Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
    );

    // Re-routes only when the field's dimensions actually moved. The observer
    // fires for any body-height nudge, and re-routing on each one rebuilt the
    // whole valley under the reader — and re-pointed their bridges onto whichever
    // new channel happened to match, which moved them.
    function rebuildIfNeeded(force) {
        const changed = lattice.resize(lattice.width(), lattice.height(), documentScroll());
        pendingRebuild = false;
        if (!force && !changed && network.length) return;

        network = buildNetworks(lattice, SEED);
        // Anything already placed points at a channel object that no longer
        // exists, and there is no honest way to map it onto the new layout, so
        // the list is reseeded from scratch.
        placed.length = 0;
        const trunks = network.filter((c) => c.order === 1);
        trunks.forEach((channel, i) => {
            if (i % 2) return;   // every other trunk, so the valley is not overbuilt
            bridges.add(channel, Math.floor(channel.pts.length * 0.34), true);
        });
    }

    function resize(width, height) {
        const changed = lattice.resize(width, height, documentScroll());
        if (changed || !network.length) pendingRebuild = true;
        if (heightObserver || typeof ResizeObserver === 'undefined') return;
        heightObserver = new ResizeObserver(() => { pendingRebuild = true; });
        heightObserver.observe(document.body);
    }

    function dispose() {
        heightObserver?.disconnect();
        heightObserver = null;
    }

    function frame(t, scrollY) {
        if (pendingRebuild) rebuildIfNeeded(false);
        const width = lattice.width();
        const height = lattice.height();

        let arrival = 1;
        if (!arrived) {
            if (arriveFrom === null) arriveFrom = t;
            arrival = Math.min(1, (t - arriveFrom) / ARRIVE_MS);
            if (arrival >= 1) arrived = true;
        }

        ctx.fillStyle = palette.ground;
        ctx.fillRect(0, 0, width, height);

        // The lattice itself, faint, and only the lines that cross the viewport.
        ctx.strokeStyle = rgba(palette.steel, palette.light ? 0.15 : 0.10);
        ctx.lineWidth = 1;
        const u = lattice.halfWidth();
        const v = lattice.depth();
        for (let i = -u; i <= v; i += 1) {
            for (const [a, b] of [[[i, 0], [i, v]], [[0, i], [u + v, i]]]) {
                const p0 = lattice.project(a[0], a[1], scrollY);
                const p1 = lattice.project(b[0], b[1], scrollY);
                if (Math.max(p0[1], p1[1]) < 0 || Math.min(p0[1], p1[1]) > height) continue;
                ctx.beginPath();
                ctx.moveTo(p0[0], p0[1]);
                ctx.lineTo(p1[0], p1[1]);
                ctx.stroke();
            }
        }

        // On arrival the networks fill in from their headwaters down.
        const reveal = smooth(arrival);
        channels.frame(network, scrollY, t, 1, reveal);
        if (reveal > 0.55) bridges.frame(scrollY, t, clamp((reveal - 0.55) / 0.45, 0, 1));
    }

    // A click on any channel throws a bridge across it. Returns true only when
    // one was really placed, which is what the badge count is made of.
    function tap(x, y, scrollY) {
        if (lattice.width() <= 0) return false;
        const hit = bridges.pick(x, y, scrollY, network);
        if (!hit) return false;
        return bridges.add(hit.channel, hit.at, false);
    }

    return { resize, frame, tap, arrive, dispose, bridgeCount: () => bridges.count() };
}
