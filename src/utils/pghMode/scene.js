// Composes Pittsburgh mode into one frame, and owns the station loop.
//
// The loop lives here rather than in FluidBackground because the order matters
// in both directions. Stations draw far to near: the one lowest on screen is
// nearest, and its bank fill paints over the land of the one receding above it.
// Within a station, land goes down before water, and the landmark stands on the
// far bank before any span crosses in front of it. Calling each module's own
// frame in turn would draw every ridge before every river and lose the
// stacking entirely.

import { paletteFor } from './palette';
import { STATIONS, createGeometry } from './stations';
import { createHills } from './hills';
import { createRivers } from './rivers';
import { createSpans } from './spans';
import { createLandmarks } from './landmarks';
import { createCableBand } from './cableBand';

export { paletteFor };

export function createScene(ctx, palette, placed = [], { reduceMotion = false } = {}) {
    const geom = createGeometry();
    const hills = createHills(ctx, palette, geom, { reduceMotion });
    const rivers = createRivers(ctx, palette, geom, { reduceMotion });
    const spans = createSpans(ctx, palette, geom, placed, { reduceMotion });
    const landmarks = createLandmarks(ctx, palette, geom, spans, { reduceMotion });
    const cableBand = createCableBand(ctx, palette, geom);

    // The page's own height changes as islands hydrate and images load, and the
    // station anchors are derived from it. Watching for that change is an
    // observer's job, not the frame loop's: reading scrollHeight forces a
    // synchronous reflow, which does not belong in a rAF callback that already
    // runs on every frame.
    let heightObserver = null;

    // Arrival. Space mode launches its fleet, geo replays its flood scan, tech
    // runs its graph; here the cable is extruded left to right, its hangers drop
    // as it passes overhead, the necklace lights up behind the leading edge, and
    // the overcast slides in. Plays on switching into the mode, never on a
    // reload, and never under reduced motion.
    const ARRIVE_MS = 1600;
    let arriveFrom = null;
    let arrived = true;

    function arrive() {
        if (reduceMotion) return;
        arriveFrom = null;
        arrived = false;
    }

    function resize(width, height) {
        geom.resize(width, height);
        cableBand.resize(width, height);
        if (heightObserver || typeof ResizeObserver === 'undefined') return;
        heightObserver = new ResizeObserver(() => geom.relayout());
        heightObserver.observe(document.body);
    }

    function dispose() {
        heightObserver?.disconnect();
        heightObserver = null;
    }

    function frame(t, scrollY) {
        const height = geom.height();

        let arrival = 1;
        if (!arrived) {
            if (arriveFrom === null) arriveFrom = t;
            arrival = Math.min(1, (t - arriveFrom) / ARRIVE_MS);
            if (arrival >= 1) arrived = true;
        }

        hills.sky(t, arrival);
        // The cable belongs to the hero, so it draws over the sky but under the
        // stations: it scrolls away while their land is still coming forward.
        cableBand.frame(scrollY, arrival);

        let nearest = -1;
        let nearestDistance = Infinity;

        for (let i = 0; i < STATIONS.length; i += 1) {
            if (!geom.visible(i, scrollY)) continue;

            hills.station(i, scrollY);
            rivers.station(i, t, scrollY);
            landmarks.station(i, STATIONS[i].kind, STATIONS[i].x, t, scrollY);
            spans.station(i, scrollY);

            const distance = Math.abs(geom.riverTopOf(i, scrollY) - height * 0.80);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = i;
            }
        }

        // The plate fades in over the last third of the approach, so it arrives
        // with the landmark rather than snapping on at a threshold.
        if (nearest >= 0 && STATIONS[nearest].kind !== 'sisters') {
            const reveal = height * 0.3;
            const alpha = Math.max(0, Math.min(1, (reveal - nearestDistance) / (reveal * 0.35)));
            landmarks.plate(
                nearest,
                STATIONS[nearest].name,
                STATIONS[nearest].year,
                scrollY,
                alpha
            );
        }

        spans.frameSparks();
    }

    // A tap on any river throws a span; anywhere else strikes sparks off the
    // structure. Returns true only when a span was actually placed, which is
    // what the Bridge Builder count is made of.
    function tap(x, y, scrollY) {
        // No geometry, no crossing. Spans are stored as a fraction of width, so
        // placing one against a zero width would store an unmatchable span.
        if (geom.width() <= 0) return false;
        const hit = geom.stationAt(x, y, scrollY);
        if (hit && spans.add(hit.index, x / geom.width())) return true;
        spans.sparkAt(x, y);
        return false;
    }

    return { resize, frame, tap, arrive, dispose, spanCount: () => spans.count() };
}
