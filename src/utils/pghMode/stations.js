// Station geometry for Pittsburgh mode.
//
// A station is one river band with one landmark standing on its far bank. Both
// share a depth, so they never drift apart.
//
// The prototype anchored each station to a page section through offsetTop.
// Five of its seven selectors do not exist on this site, so most stations
// would have landed on its i * H fallback anyway. Here they are spread evenly
// across the document's own scroll range instead, which keeps the backdrop
// independent of page markup: adding or removing a section never breaks it.

import { clamp } from './palette';

// The `deep` setting from the prototype's control rail. Each layer slides at
// its own rate against the water, which is what gives the valley depth.
export const DEPTH = { scene: 0.55, hillFar: 0.05, hillNear: 0.13, city: 0.22 };

// Station 0 is the hero, and carries the Sisters rather than a landmark.
// `x` is the landmark's centre as a fraction of width.
export const STATIONS = [
    { kind: 'sisters', name: 'The Three Sisters', year: '1926' },
    { kind: 'incline', name: 'Duquesne Incline', year: '1877', x: 0.66 },
    { kind: 'mill', name: 'Mon Valley Works', year: '1881', x: 0.57 },
    { kind: 'cathedral', name: 'Cathedral of Learning', year: '1937', x: 0.70 },
    { kind: 'ppg', name: 'PPG Place', year: '1984', x: 0.55 },
    { kind: 'phipps', name: 'Phipps Conservatory', year: '1893', x: 0.71 },
    { kind: 'fountain', name: 'Point State Park', year: '1974', x: 0.62 },
];

export function createGeometry() {
    let width = 0;
    let height = 0;
    // Document scroll offset at which each station's river sits on its mark.
    const anchors = new Array(STATIONS.length).fill(0);

    // Called on resize and on every frame's first read, because the page's own
    // height changes as images load and as sections mount their islands.
    function relayout() {
        const scrollable = Math.max(
            1,
            document.documentElement.scrollHeight - window.innerHeight
        );
        for (let i = 0; i < STATIONS.length; i += 1) {
            anchors[i] = (i / (STATIONS.length - 1)) * scrollable;
        }
    }

    function resize(w, h) {
        width = w;
        height = h;
        relayout();
    }

    // Screen y of a station's waterline. At scrollY === its anchor the river
    // sits at 0.80 of the viewport; past that it drifts up at the scene rate,
    // so the station recedes toward the horizon instead of just scrolling off.
    const riverTopOf = (index, scrollY) =>
        height * 0.80 + (anchors[index] - scrollY) * DEPTH.scene;

    // Narrower viewports get a shallower channel — a 150px band on a phone is
    // a third of the screen.
    const riverH = () =>
        (width < 720 ? clamp(height * 0.10, 54, 92) : clamp(height * 0.15, 74, 150));

    // Culled generously at both edges: a station's hills and landmark stand
    // well above its waterline, and its bank fill runs well below.
    const visible = (index, scrollY) => {
        const top = riverTopOf(index, scrollY);
        return top <= height + 220 && top >= -320;
    };

    // Which river is under this point, if any. Six pixels of tolerance at each
    // edge, so a click on the waterline itself counts.
    function stationAt(x, y, scrollY) {
        const rh = riverH();
        for (let i = 0; i < STATIONS.length; i += 1) {
            const top = riverTopOf(i, scrollY);
            if (y >= top - 6 && y <= top + rh + 6) {
                return { station: STATIONS[i], index: i };
            }
        }
        return null;
    }

    return {
        resize,
        relayout,
        riverTopOf,
        riverH,
        visible,
        stationAt,
        width: () => width,
        height: () => height,
    };
}
