// Pittsburgh mode: an isometric valley behind the whole page.
//
// A crucible stands just below the hero and tips as you scroll away from the
// top, pouring a river of molten iron down the page. A water river enters from
// the far side about a third of the way down; where they meet there is a
// fountain, and below it one combined river runs to the foot of the field,
// cooling from iron into water as it goes.
//
// Nothing branches. Clicking a river throws a bridge across it; clicking
// anywhere else throws molten iron at the ground.
//
// Composition lives here because the order matters in both directions: banks
// before water, water before iron so the hot channel crosses on top, the
// fountain over the confluence it stands in, and the hero's cable last of all.

import { paletteFor, rgba, smooth, clamp } from './palette';
import { createLattice } from './lattice';
import { buildNetwork } from './network';
import { createChannels } from './channels';
import { createBridges } from './bridges';
import { createClouds } from './clouds';
import { createCableBand } from './cableBand';
import { createCrucible, POUR_SCROLL } from './crucible';
import { createFountain } from './fountain';
import { createSplash } from './splash';

export { paletteFor };

const ARRIVE_MS = 1700;

// Where the crucible stands, as a screen height at the top of the page. Below
// the hero band, which ends at 700.
const SOURCE_Y = 880;

// A different valley every visit, held for the life of the mount so the layout
// never shifts under the reader — including across a theme flip.
const SEED = Math.floor(Math.random() * 0x7fffffff);

export function createScene(ctx, palette, placed = [], { reduceMotion = false } = {}) {
    const lattice = createLattice();
    const channels = createChannels(ctx, palette, lattice, { reduceMotion });
    const bridges = createBridges(ctx, palette, lattice, placed, { reduceMotion });
    const clouds = createClouds(ctx, palette, { reduceMotion });
    const cableBand = createCableBand(ctx, palette, lattice, { clouds });
    const crucible = createCrucible(ctx, palette, lattice);
    const fountain = createFountain(ctx, palette, lattice);
    const splash = createSplash(ctx, palette, { reduceMotion });

    let network = null;
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

    function rebuildIfNeeded() {
        const changed = lattice.resize(lattice.width(), lattice.height(), documentScroll());
        pendingRebuild = false;
        if (!changed && network) return;
        network = buildNetwork(lattice, SEED, lattice.depthAtScreenY(SOURCE_Y, 0));
        placed.length = 0;
    }

    function resize(width, height) {
        const changed = lattice.resize(width, height, documentScroll());
        cableBand.resize(width, height);
        if (changed || !network) pendingRebuild = true;
        if (heightObserver || typeof ResizeObserver === 'undefined') return;
        heightObserver = new ResizeObserver(() => { pendingRebuild = true; });
        heightObserver.observe(document.body);
    }

    function dispose() {
        heightObserver?.disconnect();
        heightObserver = null;
    }

    // The rivers should look as though they run out from under the hero rather
    // than starting at a hard edge. This lays the ground colour back over them,
    // opaque under the band and clearing by the time the crucible appears.
    function heroFade(scrollY, width) {
        const bandFoot = 700 - scrollY;
        const clearBy = SOURCE_Y - 120 - scrollY;
        if (clearBy <= 0) return;
        const wash = ctx.createLinearGradient(0, bandFoot - 220, 0, clearBy);
        wash.addColorStop(0, rgba(palette.ground, 1));
        wash.addColorStop(1, rgba(palette.ground, 0));
        ctx.fillStyle = wash;
        ctx.fillRect(0, Math.min(0, bandFoot - 220), width, Math.max(0, clearBy) + 4);
    }

    function frame(t, scrollY) {
        if (pendingRebuild) rebuildIfNeeded();
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

        // The pour is scrubbed by scroll: it is the reader who tips the ladle.
        const pour = smooth(clamp(scrollY / POUR_SCROLL, 0, 1));
        const reveal = {
            molten: pour,
            water: smooth(arrival),
            combined: pour * smooth(arrival),
        };
        channels.frame(network, scrollY, t, 1, reveal);

        // Ground back over the top, so the rivers emerge from behind the hero.
        heroFade(scrollY, width);

        // The fountain stands in the confluence, once there is iron reaching it.
        const conf = lattice.project(network.confluence[0], network.confluence[1], scrollY);
        if (conf[1] > -lattice.cell() * 6 && conf[1] < height + lattice.cell() * 6) {
            fountain.frame(conf, t, clamp(pour * 1.4, 0, 1) * smooth(arrival), reduceMotion);
        }

        if (arrival > 0.55) bridges.frame(scrollY, t, clamp((arrival - 0.55) / 0.45, 0, 1));

        // The crucible sits at the head of the molten, above the fade.
        const src = lattice.project(network.source[0], network.source[1], scrollY);
        if (src[1] > -lattice.cell() * 8 && src[1] < height + lattice.cell() * 8) {
            crucible.frame(src, scrollY, t, reduceMotion);
        }

        splash.frame();

        // The hero's cable last, so it reads as the nearest thing on the page.
        cableBand.frame(scrollY, arrival, t);
    }

    // A click on a river throws a bridge across it. A miss throws iron.
    function tap(x, y, scrollY) {
        if (lattice.width() <= 0 || !network) return false;
        const hit = bridges.pick(x, y, scrollY, network.channels);
        if (hit && bridges.add(hit.channel, hit.at, false)) return true;
        splash.burst(x, y);
        return false;
    }

    return { resize, frame, tap, arrive, dispose, bridgeCount: () => bridges.count() };
}
