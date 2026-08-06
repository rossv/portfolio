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

export { paletteFor };

export function createScene(ctx, palette, placed = [], { reduceMotion = false } = {}) {
    const geom = createGeometry();
    const hills = createHills(ctx, palette, geom);
    const rivers = createRivers(ctx, palette, geom, { reduceMotion });
    const spans = createSpans(ctx, palette, geom, placed, { reduceMotion });
    const landmarks = createLandmarks(ctx, palette, geom, spans, { reduceMotion });

    function resize(width, height) {
        geom.resize(width, height);
    }

    function frame(t, scrollY) {
        const height = geom.height();
        // The page's own height changes as islands hydrate and images load, so
        // the anchors are recomputed rather than fixed at mount.
        geom.relayout();
        hills.sky();

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
        const hit = geom.stationAt(x, y, scrollY);
        if (hit && spans.add(hit.index, x / geom.width())) return true;
        spans.sparkAt(x, y);
        return false;
    }

    return { resize, frame, tap, spanCount: () => spans.count() };
}
