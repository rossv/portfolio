// The drawing kit the bridge shapes are built with.
//
// Everything in `bridgeShapes.js` is expressed in one bridge's own frame and in
// a handful of volumes. This is where those volumes meet the canvas.
//
// The one idea worth stating outright: a member is a band, not a stroke. Given
// the points a member passes through, `band` offsets them perpendicular in
// *screen* space and fills the polygon between the two edges, then lights the
// upper edge. That is what lets a three-pixel chord read as a piece of steel at
// a glance, and it works the same for a straight tower leg and for the crown of
// an arch — which a stroked path with a lineWidth cannot claim, because a stroke
// has no top edge to light.

import { rgba } from './palette';
import { MEMBERS, CHUNK, DECK_ALPHA, DECK_FACE } from './bridgeShapes';

// The two offset edges of a band through `pts`, in screen space.
//
// The normal is taken from the averaged tangent at each point and is *not*
// re-oriented per point: flipping it to always face up would twist the band
// where a curve passes its crown, because the up-facing side swaps there.
function edgesOf(pts, width) {
    const hw = Math.max(0.4, width) / 2;
    const near = [];
    const far = [];
    for (let i = 0; i < pts.length; i += 1) {
        const prev = pts[Math.max(0, i - 1)];
        const next = pts[Math.min(pts.length - 1, i + 1)];
        let tx = next[0] - prev[0];
        let ty = next[1] - prev[1];
        const len = Math.hypot(tx, ty) || 1;
        tx /= len;
        ty /= len;
        const nx = -ty * hw;
        const ny = tx * hw;
        near.push([pts[i][0] + nx, pts[i][1] + ny]);
        far.push([pts[i][0] - nx, pts[i][1] - ny]);
    }
    return [near, far];
}

const meanY = (edge) => edge.reduce((sum, pt) => sum + pt[1], 0) / edge.length;

export function createKit(ctx, {
    P,
    palette,
    g = 1,
    k = 1,
    thick,
    cell,
    hue,
    trim = null,
    twin = true,
    chunk = CHUNK,
    deckAlpha = DECK_ALPHA,
}) {
    const ink = (hex, a) => rgba(hex, Math.min(1, Math.max(0, a * g)));
    const m = (key) => (MEMBERS[key] ?? MEMBERS.web) * cell * chunk;
    const side = (s) => (s < 0 ? { a: 0.62, w: 0.86 } : { a: 1, w: 1 });

    const path = (pts) => {
        ctx.beginPath();
        for (const [i, pt] of pts.entries()) {
            if (i === 0) ctx.moveTo(pt[0], pt[1]);
            else ctx.lineTo(pt[0], pt[1]);
        }
    };

    // A member through a run of frame points, filled across its thickness and
    // lit along whichever of its two edges faces up the screen.
    function band(samples, width, fill, crown) {
        const pts = samples.map((sp) => P(sp[0], sp[1], sp[2] ?? 0));
        const [near, far] = edgesOf(pts, width);
        path([...near, ...far.slice().reverse()]);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (!crown || width < 1.6) return;
        const lit = meanY(near) <= meanY(far) ? near : far;
        path(lit);
        ctx.strokeStyle = crown;
        ctx.lineWidth = Math.max(0.7, width * 0.22);
        ctx.stroke();
    }

    const kit = {
        P,
        p: palette,
        g,
        k,
        thick,
        cell,
        hue,
        trim: trim ?? hue,
        twin,
        deckAlpha,
        ink,
        m,
        side,

        // A straight member between two frame points.
        bar: (a, b, width, fill, crown) => band([a, b], width, fill, crown),

        // A curved member through a run of frame points.
        ribbon: (samples, width, fill, crown) => band(samples, width, fill, crown),

        // A flat face. Four frame points, filled.
        quad: (a, b, c, d, fill) => {
            path([a, b, c, d].map((pt) => P(pt[0], pt[1], pt[2] ?? 0)));
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
        },

        // Secondary bracing, where a hairline is what is wanted — overhead sway
        // bracing reads better thin, because at band weight it fights the chords
        // it is meant to sit behind.
        stroke: (a, b, colour, width) => {
            const [x1, y1] = P(a[0], a[1], a[2] ?? 0);
            const [x2, y2] = P(b[0], b[1], b[2] ?? 0);
            ctx.strokeStyle = colour;
            ctx.lineWidth = Math.max(0.6, width);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        },

        // Saddles, finials, and the sea-horses on the Sixteenth Street pylons.
        dot: (pt, r, fill) => {
            const [x, y] = P(pt[0], pt[1], pt[2] ?? 0);
            ctx.fillStyle = fill;
            ctx.beginPath();
            ctx.ellipse(x, y, r, r * 0.82, 0, 0, Math.PI * 2);
            ctx.fill();
        },

        // A deck: lit top, near face, and the far end that closes the box.
        slab: (from, to, topZ, s0, s1, depth, topFill, faceFill) => {
            kit.quad([from, s0, topZ], [to, s0, topZ], [to, s1, topZ], [from, s1, topZ], topFill);
            kit.quad([from, s1, topZ], [to, s1, topZ], [to, s1, topZ - depth],
                [from, s1, topZ - depth], faceFill);
            kit.quad([to, s0, topZ], [to, s1, topZ], [to, s1, topZ - depth],
                [to, s0, topZ - depth], faceFill);
        },

        // --- what every bridge gets, whatever it is ------------------------
        //
        // These three are the model too, not scaffolding around it, so they live
        // with the members rather than in whatever happens to be hosting them.

        // The shadow on the water, laid down before anything else so the model
        // sits in the channel instead of hovering over it.
        shadow: (to, sLo = -1.5, sHi = 1.5) => {
            kit.quad([0, sLo, -thick * 1.4], [to, sLo, -thick * 1.4],
                [to, sHi, -thick * 1.4], [0, sHi, -thick * 1.4], palette.shadow);
        },

        // The roadway, as far along as it has been built.
        //
        // Held back from the near-white it used to be. With the members at stroke
        // weight the deck could be the brightest thing on the model and still
        // read as its floor; against bands it became the only thing you saw, and
        // the structure — the part that says which bridge this is — sat behind it.
        deck: (to) => {
            kit.slab(0, to, thick, -1, 1, thick,
                ink(palette.deck, deckAlpha), ink(palette.steel, deckAlpha * DECK_FACE));
            ctx.strokeStyle = ink(palette.structure, 0.35);
            ctx.lineWidth = 1;
            for (const s of [-1, 1]) {
                const [x1, y1] = P(0, s, thick);
                const [x2, y2] = P(to, s, thick);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        },

        // A pier at an abutment is a face across the full width of the deck,
        // because that is what a bank looks like cut back. A pier between the
        // abutments is standing in the water, so it is a narrower shaft with a
        // cap — a full-width face out in the channel reads as a dam.
        pier: (at01, depth) => {
            const river = at01 > 0.001 && at01 < 0.999;
            const w = river ? 0.62 : 1;
            kit.quad([at01, -w, 0], [at01, w, 0], [at01, w, -depth], [at01, -w, -depth],
                ink(palette.steel, river ? 0.5 : 0.42));
            if (!river) return;
            kit.quad([at01, -0.86, 0], [at01, 0.86, 0], [at01, 0.86, -depth * 0.12],
                [at01, -0.86, -depth * 0.12], ink(palette.structure, 0.3));
        },
    };

    return kit;
}
