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
import { createCrucible } from './crucible';
import { createFountain } from './fountain';
import { createSplash } from './splash';

export { paletteFor };

const ARRIVE_MS = 1700;

// The crucible stands in the expertise section, a little past its top edge, and
// in the same place every visit — only the shape of the reaches is seeded. If
// that section is not on the page, it falls back to a fixed document height.
const SOURCE_FALLBACK_Y = 2400;
// How far into the expertise section the ladle stands, as a fraction of that
// section's own height with a floor — a fraction rather than a fixed offset so
// it stays well down the section whatever the section grows to.
const SOURCE_INTO_SECTION = 0.62;
const SOURCE_MIN_INTO = 700;

// The hero band's foot, and how far below it the rivers finish emerging.
const HERO_FOOT = 700;
const HERO_FADE = 260;

function sourceDocumentY() {
    const skills = document.getElementById('skills');
    if (!skills) return SOURCE_FALLBACK_Y;
    return skills.offsetTop
        + Math.max(SOURCE_MIN_INTO, skills.offsetHeight * SOURCE_INTO_SECTION);
}

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

    // The pour is its own event, not a scroll position. It starts the first time
    // the ladle comes into view and then runs on its own clock: the vessel goes
    // over, iron lands, and the river flows down the page whatever the reader
    // does next. Scrubbing it with scroll meant the river drained backwards when
    // they scrolled up, which is not what a poured river does.
    const TIP_MS = 900;
    const FLOW_MS = 2600;
    let pourFrom = null;
    let splashed = false;

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
        // Pin the ladle to a document position: the depth that puts it mid
        // viewport when the reader has that part of the page in front of them.
        const docY = sourceDocumentY();
        const half = lattice.height() / 2;
        network = buildNetwork(lattice, SEED, lattice.depthAtScreenY(half, docY - half));
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
        // Tied to the hero band, not to the ladle: the ladle is far down the
        // page now, and the fade only has the hero to hide behind.
        const bandFoot = HERO_FOOT - scrollY;
        const clearBy = HERO_FOOT + HERO_FADE - scrollY;
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

        // Start the pour the first time the ladle is on screen, then let it run.
        const src = lattice.project(network.source[0], network.source[1], scrollY);
        if (pourFrom === null && src[1] < height * 0.92 && src[1] > -lattice.cell() * 6) {
            pourFrom = reduceMotion ? t - TIP_MS - FLOW_MS : t;
        }
        const since = pourFrom === null ? 0 : t - pourFrom;
        const pour = smooth(clamp(since / TIP_MS, 0, 1));
        const flow = smooth(clamp((since - TIP_MS * 0.55) / FLOW_MS, 0, 1));

        // One heavy splash the moment the stream lands.
        if (!splashed && pour > 0.34) {
            splashed = true;
            splash.burst(src[0], src[1], 4.5);
        }

        const reveal = {
            molten: flow,
            water: smooth(arrival),
        };
        channels.frame(network, scrollY, t, 1, reveal);

        // Ground back over the top, so the rivers emerge from behind the hero.
        heroFade(scrollY, width);

        // The fountain stands at the Point, where the two water rivers meet.
        const conf = lattice.project(network.confluence[0], network.confluence[1], scrollY);
        if (conf[1] > -lattice.cell() * 8 && conf[1] < height + lattice.cell() * 8) {
            fountain.frame(conf, t, smooth(arrival), reduceMotion);
        }

        if (arrival > 0.55) bridges.frame(scrollY, t, clamp((arrival - 0.55) / 0.45, 0, 1));

        // The ladle, at the head of the iron.
        if (src[1] > -lattice.cell() * 10 && src[1] < height + lattice.cell() * 10) {
            crucible.frame(src, t, pour, reduceMotion);
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
