// The eleven bridges of Pittsburgh mode, as models of the real structures.
//
// Nothing here touches the canvas. Each entry is handed a kit — a point mapper
// into its own bridge's frame, a palette, and a small vocabulary of volumes —
// and builds the structure in that frame:
//
//   t  0 → 1   along the deck, abutment to abutment
//   s -1 → 1   across the deck; -1 is the far kerb, +1 the near one
//   z          height above the deck's plane, in pixels, straight up the screen
//
// Two things separate this from a line drawing of a bridge.
//
// Members are volumes. A chord is a filled ribbon with a lit top edge, not a
// stroke — which is what lets a three-pixel member read at a glance against a
// busy backdrop, and what makes the near and far sides of a truss look like two
// sides of one object rather than two overlapping diagrams.
//
// And the eleven are the real eleven. A Pratt through truss is not stood in for
// by an arch; the Sixteenth Street arches sit under their deck because that is
// where they are; the bridges that land piers in the real river land them here.
//
// This file is also the source the review page is generated from, so it imports
// nothing. Hosts build the kit — see `bridges.js` for the site's, and
// `scripts/preview-bridges.mjs` for the one behind the gallery.

// Member thicknesses, in fractions of a lattice cell so they hold their weight
// if the cell ever changes. Chunkier than a hairline on purpose: the old shapes
// were drawn with one- and two-pixel strokes, which vanished against the ground
// at anything but full attention.
export const MEMBERS = {
    rib: 0.095,        // arch ribs — the heaviest thing on most of these
    chord: 0.080,      // truss top and bottom chords, tie girders
    chain: 0.085,      // eyebar chain
    cable: 0.065,      // wire rope
    tower: 0.100,      // tower legs
    post: 0.070,       // spandrel columns, portal posts, deck-to-deck posts
    web: 0.048,        // truss diagonals and verticals
    hanger: 0.040,     // suspenders
    lateral: 0.038,    // overhead bracing between the two sides
    trim: 0.032,       // handrails, finial stems, kerb lines
};

// A single dial over every member above.
export const CHUNK = 0.75;

// How opaque the roadway is.
//
// Its own dial because it trades off against everything else here: the deck is
// the one surface wide enough to hide the structure behind it, and on the
// double-deckers and the deck trusses it hides the part that names the bridge.
// Lower lets the far truss and the far arch rib read through it.
export const DECK_ALPHA = 0.82;

// The near face of a deck, as a fraction of its top. One ratio for every deck in
// the set, so a change to DECK_ALPHA keeps the slab reading as a solid.
export const DECK_FACE = 0.54;

// What each bridge is painted, taken off photographs of the real thing.
//
// The gold ones take the palette's accent outright. The rest carry their own
// paint: Smithfield's pale blue with cream ironwork, the West End's white, the
// pale blue-green shared by Birmingham and McKees Rocks, Liberty's concrete
// grey, and the Hot Metal's near-black.
//
// One compromise, and it is the Hot Metal's. The real bridge is very nearly
// black, and black on the dark ground is nothing at all — so on that ground it
// goes only as dark as stays legible, and on paper it goes where it belongs.
export const TINTS = {
    dark: {
        tenth: '#7E97AA',           // 10th Street — pale blue steel
        smithfield: '#9FB6C4',      // Smithfield — light blue-grey
        smithfieldTrim: '#D8CDB4',  // its cast-iron portals, in cream
        westend: '#E4EBEF',         // white
        birmingham: '#A2CFBD',      // pale blue-green
        mckeesrocks: '#8FC3B2',     // the same family, a shade cooler
        liberty: '#B0AFA6',         // concrete grey, faintly warm
        hotmetal: '#49525A',        // as near black as the dark ground allows
        copper: '#6E9B84',          // the Sixteenth Street pylon caps, patinated
    },
    light: {
        tenth: '#4A6270',
        smithfield: '#41606F',
        smithfieldTrim: '#7A6A48',
        westend: '#8B99A1',
        birmingham: '#5E7D73',
        mckeesrocks: '#54746B',
        liberty: '#6E6C62',
        hotmetal: '#2E3439',
        copper: '#41705A',
    },
};

// ---------------------------------------------------------------------------
// Shared structural vocabulary.
//
// Six builders cover the eleven. Keeping them here rather than inlining each
// bridge's own truss is what makes the differences between the bridges legible:
// Sixteenth Street is the tied arch three times at two rises, and the Hot Metal
// is the through truss three times with a bowed top chord.
// ---------------------------------------------------------------------------

// Sample a curve at fixed s into ribbon samples.
const arc = (from, to, s, base, crown, steps = 22) => {
    const out = [];
    for (let i = 0; i <= steps; i += 1) {
        const f = i / steps;
        out.push([from + (to - from) * f, s, base + (crown - base) * Math.sin(f * Math.PI)]);
    }
    return out;
};

// A parallel- or polygonal-chord truss standing on the deck, with Pratt web:
// verticals at every panel point, diagonals falling toward midspan.
//
// `camel` lifts the top chord over the middle of the span, which is the whole
// difference between the Hot Metal's flat run and Liberty's hump.
function throughTruss(K, from, to, height, panels, {
    camel = 0,
    bow = false,        // top chord curves down into the deck at both ends
    chordKey = 'chord',
} = {}) {
    const { p, thick, ink, side, bar, ribbon, hue, m } = K;
    const at = (i) => from + ((to - from) * i) / panels;
    // Polygonal top chord.
    //
    // A camelback climbs off short end posts, runs flat over midstream, and
    // falls away again — three straight runs, because a riveted top chord is
    // straight between panel points. A smooth curve there reads as a bowstring
    // arch rather than as a truss.
    //
    // A bowstring is the other case, and it is the Hot Metal's: the top chord
    // curves the whole way and dies into the bottom chord at each end, so the
    // span has no end posts at all.
    const SHOULDER = 0.3;
    const topZ = (i) => {
        const f = i / panels;
        if (bow) return thick + height * Math.sin(f * Math.PI) ** 0.72;
        if (!camel) return thick + height;
        const ramp = Math.min(1, f / SHOULDER, (1 - f) / SHOULDER);
        return thick + height * (1 - camel + camel * ramp);
    };

    for (const s of [-1, 1]) {
        const sd = side(s);
        // top chord, panel point to panel point
        const samples = [];
        for (let i = 0; i <= panels; i += 1) samples.push([at(i), s, topZ(i)]);
        ribbon(samples, m(chordKey) * sd.w, ink(hue, 0.95 * sd.a), ink(p.structure, 0.3 * sd.a));
        // bottom chord along the deck
        bar([from, s, thick], [to, s, thick], m(chordKey) * sd.w * 0.9, ink(hue, 0.8 * sd.a));
        // verticals and Pratt diagonals
        for (let i = 0; i <= panels; i += 1) {
            const end = i === 0 || i === panels;
            bar([at(i), s, thick], [at(i), s, topZ(i)],
                m(end ? 'post' : 'web') * sd.w, ink(end ? hue : p.steel, (end ? 0.9 : 0.7) * sd.a));
            if (i === panels) continue;
            // Tension diagonals fall toward the middle from both ends, which is
            // what makes a Pratt a Pratt rather than a Warren.
            const downhill = at(i) + (to - from) / (panels * 2) < (from + to) / 2;
            const a = downhill ? [at(i), s, topZ(i)] : [at(i), s, thick];
            const b = downhill ? [at(i + 1), s, thick] : [at(i + 1), s, topZ(i + 1)];
            bar(a, b, m('web') * sd.w, ink(p.steel, 0.6 * sd.a));
        }
    }
    // Portal bracing at each end — a header with knee braces, which is the frame
    // you drive through and the detail that stops a truss reading as a fence. A
    // bowstring has no end posts to brace, so it gets none.
    if (!bow) {
        for (const i of [0, panels]) {
            const z = topZ(i);
            const tt = at(i);
            bar([tt, -1, z], [tt, 1, z], m('chord'), ink(hue, 0.85));
            for (const s of [-1, 1]) {
                bar([tt, s, z], [tt, s * 0.35, z - height * 0.26], m('web'), ink(p.steel, 0.7));
            }
        }
    }
    // Overhead bracing between the two top chords. A bowstring gets a strut at
    // every panel point — on the Hot Metal that ladder of cross members over the
    // arch is as recognisable as the arch itself. A flat truss gets an X per bay,
    // drawn thin so it sits behind the chords rather than fighting them.
    if (bow) {
        for (let i = 1; i < panels; i += 1) {
            bar([at(i), -1, topZ(i)], [at(i), 1, topZ(i)], m('lateral'), ink(hue, 0.6));
        }
    } else {
        for (let i = 1; i < panels; i += 1) {
            K.stroke([at(i), -1, topZ(i)], [at(i + 1), 1, topZ(i + 1)], ink(p.steel, 0.26), m('lateral'));
            K.stroke([at(i), 1, topZ(i)], [at(i + 1), -1, topZ(i + 1)], ink(p.steel, 0.26), m('lateral'));
        }
    }
}

// A deck truss: the whole structure below the roadway, with the deck itself
// acting as the top chord and a curved bottom chord under it. Liberty, and the
// only bridge in the set with nothing above its own deck.
function deckTruss(K, from, to, depth, panels) {
    const { thick, ink, side, bar, ribbon, hue, p, m } = K;
    const at = (i) => from + ((to - from) * i) / panels;
    // Deepest between the pier and the abutment, shallow at both — which is what
    // the photograph shows, and the opposite of a haunched continuous truss.
    const lowZ = (i) => {
        const f = i / panels;
        return -depth * Math.sin(f * Math.PI) ** 0.8;
    };
    for (const s of [-1, 1]) {
        const sd = side(s);
        const samples = [];
        for (let i = 0; i <= panels; i += 1) samples.push([at(i), s, lowZ(i)]);
        ribbon(samples, m('chord') * sd.w, ink(hue, 0.92 * sd.a));
        bar([from, s, thick], [to, s, thick], m('chord') * sd.w, ink(hue, 0.88 * sd.a),
            ink(p.structure, 0.3 * sd.a));
        for (let i = 0; i <= panels; i += 1) {
            bar([at(i), s, 0], [at(i), s, lowZ(i)], m('web') * sd.w, ink(p.steel, 0.66 * sd.a));
            if (i === panels) continue;
            bar([at(i), s, lowZ(i)], [at(i + 1), s, 0], m('web') * sd.w * 0.85,
                ink(p.steel, 0.48 * sd.a));
        }
    }
}

// A tied arch: rib over the deck, hangers down to it, tie along the deck, and
// lateral bracing between the two ribs. Fort Pitt, Fort Duquesne, Birmingham
// and the McKees Rocks centre span are all this, at different rises.
function tiedArch(K, from, to, rise, {
    springs = 0,        // z the rib springs from, relative to the deck top
    hangers = 8,
    braced = false,     // two chords and a lattice web, as at the West End
    deckZ = null,       // where the hangers land; the deck top by default
    laterals = [0.3, 0.5, 0.7],
    // Cross bracing between the two ribs instead of plain struts. Birmingham's
    // overhead Xs are as much of its silhouette as the rib is.
    xBrace = false,
    // Drawn after the far rib and before the near one. Fort Pitt's upper deck
    // has to go here: drawn after both ribs it paints over the near one, and
    // drawn before both it hides the far one's springings.
    between = null,
} = {}) {
    const { p, thick, ink, side, bar, ribbon, hue, m } = K;
    const base = thick + springs;
    const crown = thick + rise;
    const land = deckZ === null ? thick : deckZ;
    const ribZ = (t) => base + (crown - base) * Math.sin(((t - from) / (to - from)) * Math.PI);

    const drawSide = (s) => {
        const sd = side(s);
        if (braced) {
            // The braced rib: an outer and an inner chord that converge at the
            // springings, with a zig-zag web between them. This is the West End's
            // signature and it is worth the extra members — a single rib that
            // heavy just looks like a fat line.
            // The two chords have to be far enough apart for the web between them
            // to be legible. At a tenth of the rise they merged into one fat rib
            // and the lattice was invisible, which threw away the point of it.
            const gap = rise * 0.26;
            const outerZ = (f) => base + (crown - base) * Math.sin(f * Math.PI);
            const innerZ = (f) => outerZ(f) - gap * Math.sin(f * Math.PI);
            const sample = (fn) => {
                const out = [];
                for (let i = 0; i <= 22; i += 1) out.push([from + (to - from) * (i / 22), s, fn(i / 22)]);
                return out;
            };
            ribbon(sample(outerZ), m('rib') * sd.w * 0.85,
                ink(hue, 0.95 * sd.a), ink(p.structure, 0.32 * sd.a));
            ribbon(sample(innerZ), m('chord') * sd.w * 0.85, ink(hue, 0.82 * sd.a));
            // Eight bays rather than twelve, at full web weight: fewer, heavier
            // diagonals read as a lattice; more, lighter ones read as noise.
            for (let i = 0; i < 8; i += 1) {
                const f0 = i / 8;
                const f1 = (i + 1) / 8;
                const t0 = from + (to - from) * f0;
                const t1 = from + (to - from) * f1;
                bar([t0, s, outerZ(f0)], [t1, s, innerZ(f1)], m('web') * sd.w, ink(p.steel, 0.68 * sd.a));
                bar([t0, s, innerZ(f0)], [t1, s, outerZ(f1)], m('web') * sd.w * 0.8,
                    ink(p.steel, 0.5 * sd.a));
            }
        } else {
            ribbon(arc(from, to, s, base, crown), m('rib') * sd.w,
                ink(hue, 0.95 * sd.a), ink(p.structure, 0.34 * sd.a));
        }
        // hangers
        for (let i = 1; i < hangers; i += 1) {
            const t = from + ((to - from) * i) / hangers;
            bar([t, s, ribZ(t)], [t, s, land], m('hanger') * sd.w, ink(p.steel, 0.7 * sd.a));
        }
        // the tie, which is the reason the thing needs no thrust block
        bar([from, s, land], [to, s, land], m('chord') * sd.w, ink(hue, 0.7 * sd.a));
    };

    drawSide(-1);
    if (between) between();
    drawSide(1);

    for (const f of laterals) {
        const t = from + (to - from) * f;
        bar([t, -1, ribZ(t)], [t, 1, ribZ(t)], m('lateral'), ink(p.steel, 0.34));
    }
    if (!xBrace) return;
    for (let i = 0; i < laterals.length - 1; i += 1) {
        const t0 = from + (to - from) * laterals[i];
        const t1 = from + (to - from) * laterals[i + 1];
        bar([t0, -1, ribZ(t0)], [t1, 1, ribZ(t1)], m('lateral') * 0.9, ink(p.steel, 0.4));
        bar([t0, 1, ribZ(t0)], [t1, -1, ribZ(t1)], m('lateral') * 0.9, ink(p.steel, 0.28));
    }
}

// An open-spandrel deck arch: the arch sits *under* the deck, springing low at
// the piers and rising to just beneath the deck at midspan, with spandrel
// columns carrying the deck down onto it. Sixteenth Street, three times over.
// A lens: top chord bowing up, bottom chord bowing down, meeting at the ends,
// with a web between them. The Smithfield, and the only one of these in the city.
function lens(K, from, to, rise, sag, panels) {
    const { p, thick, ink, side, bar, ribbon, hue, m } = K;
    const upZ = (t) => thick + rise * Math.sin(((t - from) / (to - from)) * Math.PI);
    const dnZ = (t) => thick - sag * Math.sin(((t - from) / (to - from)) * Math.PI);
    for (const s of [-1, 1]) {
        const sd = side(s);
        ribbon(arc(from, to, s, thick, thick + rise), m('chord') * sd.w,
            ink(hue, 0.95 * sd.a), ink(p.structure, 0.32 * sd.a));
        ribbon(arc(from, to, s, thick, thick - sag), m('chord') * sd.w * 0.9, ink(hue, 0.82 * sd.a));
        for (let i = 1; i < panels; i += 1) {
            const t = from + ((to - from) * i) / panels;
            bar([t, s, upZ(t)], [t, s, dnZ(t)], m('web') * sd.w, ink(p.steel, 0.62 * sd.a));
            // the diagonals that make it a Pauli truss rather than a hoop
            const t2 = from + ((to - from) * (i + 1)) / panels;
            if (i + 1 < panels) {
                const rising = t < (from + to) / 2;
                bar([t, s, rising ? dnZ(t) : upZ(t)], [t2, s, rising ? upZ(t2) : dnZ(t2)],
                    m('web') * sd.w * 0.8, ink(p.steel, 0.45 * sd.a));
            }
        }
    }
    for (let i = 1; i < panels; i += 1) {
        const t = from + ((to - from) * i) / panels;
        bar([t, -1, upZ(t)], [t, 1, upZ(t)], m('lateral'), ink(p.steel, 0.28));
    }
}

// A suspension tower: two legs, a portal strut, a cap, and the saddle the chain
// or cable actually sits in. The saddle matters — without it the chain looks as
// though it passes through the tower rather than over it.
function tower(K, t, height, { braced = false, saddle = true } = {}) {
    const { p, thick, ink, side, bar, hue, m, cell } = K;
    const top = thick + height;
    for (const s of [-1, 1]) {
        const sd = side(s);
        bar([t, s, thick], [t, s, top], m('tower') * sd.w, ink(hue, 0.95 * sd.a),
            ink(p.structure, 0.3 * sd.a));
    }
    bar([t, -1, top], [t, 1, top], m('post'), ink(hue, 0.88));
    if (braced) {
        bar([t, -1, thick + height * 0.42], [t, 1, thick + height * 0.62], m('web'), ink(p.steel, 0.5));
        bar([t, 1, thick + height * 0.42], [t, -1, thick + height * 0.62], m('web'), ink(p.steel, 0.5));
    } else {
        bar([t, -1, thick + height * 0.66], [t, 1, thick + height * 0.66], m('lateral'), ink(p.steel, 0.5));
    }
    if (!saddle) return;
    // The saddle the chain sits in. Without it the chain looks as though it
    // passes through the tower rather than over it.
    const r = cell * 0.055;
    for (const s of [-1, 1]) {
        K.dot([t, s, top + r * 0.6], r, ink(p.structure, 0.62 * side(s).a));
    }
}

// A plate-girder approach span: a deep beam hanging below each kerb. Short,
// plain, and what actually carries the deck onto the bank at Birmingham and
// Liberty. Drawn below the deck rather than beside it, because a girder that
// stops at deck level is indistinguishable from the deck's own edge.
// Kept shallow and dark. Deeper and lighter it stops reading as a beam under the
// road and starts reading as an abutment wall, which is what the first pass at
// Liberty and Birmingham looked like at each end.
function girderSpan(K, from, to, depth) {
    const { thick, ink, side, quad, bar, hue, p, m } = K;
    for (const s of [-1, 1]) {
        const sd = side(s);
        quad([from, s, 0], [to, s, 0], [to, s, -depth], [from, s, -depth],
            ink(p.steel, 0.34 * sd.a));
        bar([from, s, thick], [to, s, thick], m('chord') * sd.w * 0.9, ink(hue, 0.85 * sd.a));
        bar([from, s, -depth], [to, s, -depth], m('trim') * sd.w, ink(p.steel, 0.55 * sd.a));
    }
}

// A railing along both kerbs. Every one of these has one, and at this scale it
// is most of what tells you which way the deck runs.
// The height is given unscaled and grown here, so a railing rises with the rest
// of the superstructure instead of snapping to full height the moment it appears.
function railing(K, from, to, rise, base = null) {
    const { thick, ink, side, bar, p, m, k } = K;
    const foot = base === null ? thick : base;
    const h = foot + rise * k;
    for (const s of [-1, 1]) {
        const sd = side(s);
        bar([from, s, h], [to, s, h], m('trim') * sd.w, ink(p.structure, 0.42 * sd.a));
        for (let i = 0; i <= 10; i += 1) {
            const t = from + ((to - from) * i) / 10;
            bar([t, s, foot], [t, s, h], m('trim') * sd.w * 0.7, ink(p.steel, 0.3 * sd.a));
        }
    }
}

// ---------------------------------------------------------------------------
// The eleven.
//
//   label      what it is called on a map
//   note       the one thing that makes it that bridge and not another
//   hue        'gold' for the accent, or a key into TINTS
//   piers      deck fractions that stand on something; anything strictly
//              between 0 and 1 is standing in the river, as it does in life
//   pierDepth  multiplier on the pier shaft, for the tall-pier bridges
//   deckWidth  multiplier on the deck's half-width
// ---------------------------------------------------------------------------

export const BRIDGES = {
    // --- suspension ------------------------------------------------------
    sisters: {
        label: 'Three Sisters',
        real: 'Roberto Clemente / Andy Warhol / Rachel Carson',
        note: 'Self-anchored eyebar suspension. The chain is straight between pins,'
            + ' so it kinks rather than curves, and it dies into the deck ends'
            + ' instead of into a ground anchorage.',
        hue: 'gold',
        piers: [0, 1],
        draw(K) {
            const { p, thick, cell, k, ink, side, bar, hue, m } = K;
            const rise = cell * 0.95 * k;
            const [tA, tB] = [0.22, 0.78];
            // The chain: straight eyebar runs up the side spans, and a shallow
            // sag across the middle. Sampled at panel points only, so the kinks
            // at the pins survive.
            const sag = (t) => {
                if (t <= tA) return thick + rise * (t / tA);
                if (t >= tB) return thick + rise * ((1 - t) / (1 - tB));
                // Highest at the towers, lowest at midstream. Stated as a sag off
                // the tower tops rather than as a raised cosine, which is how this
                // came to be drawn upside down — an arch between the towers rather
                // than a chain hanging between them.
                const f = (t - tA) / (tB - tA);
                return thick + rise * (1 - 0.44 * Math.sin(f * Math.PI));
            };
            const pins = [0];
            for (let i = 1; i <= 3; i += 1) pins.push((tA * i) / 3);
            for (let i = 1; i <= 9; i += 1) pins.push(tA + ((tB - tA) * i) / 9);
            for (let i = 1; i <= 3; i += 1) pins.push(tB + ((1 - tB) * i) / 3);

            for (const s of [-1, 1]) {
                const sd = side(s);
                const samples = pins.map((t) => [t, s, sag(t)]);
                K.ribbon(samples, m('chain') * sd.w, ink(hue, 0.95 * sd.a),
                    ink(p.structure, 0.34 * sd.a));
                for (const t of pins) {
                    if (t <= 0.001 || t >= 0.999) continue;
                    if (Math.abs(t - tA) < 0.01 || Math.abs(t - tB) < 0.01) continue;
                    bar([t, s, sag(t)], [t, s, thick], m('hanger') * sd.w, ink(p.steel, 0.72 * sd.a));
                }
                // The stiffening truss under the deck. A self-anchored chain puts
                // the span into compression, so the deck has to be stiff, and on
                // the Sisters you can see it.
                const deep = cell * 0.2;
                bar([0, s, -deep], [1, s, -deep], m('chord') * sd.w * 0.85, ink(hue, 0.6 * sd.a));
                for (let i = 0; i <= 10; i += 1) {
                    const t = i / 10;
                    bar([t, s, 0], [t, s, -deep], m('web') * sd.w * 0.8, ink(p.steel, 0.4 * sd.a));
                }
            }
            for (const t of [tA, tB]) tower(K, t, rise, { saddle: true });
            railing(K, 0, 1, cell * 0.1);
        },
    },

    tenth: {
        label: 'Tenth Street',
        real: 'Philip Murray Bridge',
        note: 'Also self-anchored, but wire rope rather than eyebars — a smooth'
            + ' catenary, a deeper sag, slimmer towers with X bracing, and a'
            + ' plain girder deck instead of a stiffening truss.',
        hue: 'tenth',
        piers: [0, 1],
        deckWidth: 0.85,
        draw(K) {
            const { p, thick, cell, k, ink, side, bar, hue, m } = K;
            const rise = cell * 0.8 * k;
            const [tA, tB] = [0.2, 0.8];
            const sag = (t) => {
                if (t <= tA) return thick + rise * (t / tA) ** 1.1;
                if (t >= tB) return thick + rise * ((1 - t) / (1 - tB)) ** 1.1;
                // A true catenary, and deep enough to be seen as one — at a
                // shallower sag the cable read as a flat bar over the towers.
                const f = (t - tA) / (tB - tA);
                return thick + rise * (0.14 + 0.86 * Math.cosh((f - 0.5) * 2.8) / Math.cosh(1.4));
            };
            for (const s of [-1, 1]) {
                const sd = side(s);
                const samples = [];
                for (let i = 0; i <= 40; i += 1) samples.push([i / 40, s, sag(i / 40)]);
                K.ribbon(samples, m('cable') * sd.w, ink(hue, 0.95 * sd.a),
                    ink(p.structure, 0.3 * sd.a));
                for (let i = 1; i < 14; i += 1) {
                    const t = tA + ((tB - tA) * i) / 14;
                    bar([t, s, sag(t)], [t, s, thick], m('hanger') * sd.w * 0.9,
                        ink(p.steel, 0.62 * sd.a));
                }
                bar([0, s, thick], [1, s, thick], m('chord') * sd.w, ink(hue, 0.8 * sd.a));
            }
            for (const t of [tA, tB]) tower(K, t, rise, { braced: true, saddle: true });
            railing(K, 0, 1, cell * 0.09);
        },
    },

    // --- lenticular ------------------------------------------------------
    smithfield: {
        label: 'Smithfield Street',
        real: 'Smithfield Street Bridge, 1883',
        note: 'Two equal lenticular spans on a mid-river pier, and the cast-iron'
            + ' portals at each end — the lens and the portal together are the'
            + ' only pair like it in the city.',
        hue: 'smithfield',
        trim: 'smithfieldTrim',
        piers: [0, 0.5, 1],
        deckWidth: 0.9,
        draw(K) {
            const { p, thick, cell, k, ink, side, bar, quad, m, trim } = K;
            const rise = cell * 0.62 * k;
            const sag = cell * 0.4 * k;
            lens(K, 0, 0.5, rise, sag, 6);
            lens(K, 0.5, 1, rise, sag, 6);
            // The portals. A header on two posts, a shallow pediment above it,
            // and a finial on each post — drawn in the cream the ironwork is
            // painted, which is what stops them reading as more truss.
            const h = cell * 0.72 * k;
            for (const t of [0, 1]) {
                for (const s of [-1, 1]) {
                    const sd = side(s);
                    bar([t, s, thick], [t, s, thick + h], m('post') * sd.w * 1.2,
                        ink(trim, 0.92 * sd.a), ink(p.structure, 0.3 * sd.a));
                    K.dot([t, s, thick + h + cell * 0.055], cell * 0.05,
                        ink(trim, 0.95 * sd.a));
                }
                bar([t, -1, thick + h], [t, 1, thick + h], m('chord') * 1.3, ink(trim, 0.9));
                bar([t, -1, thick + h * 0.78], [t, 1, thick + h * 0.78], m('trim'), ink(trim, 0.6));
                quad([t, -0.7, thick + h], [t, 0, thick + h + cell * 0.16],
                    [t, 0.7, thick + h], [t, 0, thick + h], ink(trim, 0.55));
            }
            railing(K, 0, 1, cell * 0.09);
        },
    },

    // --- tied arches -----------------------------------------------------
    fortpitt: {
        label: 'Fort Pitt',
        real: 'Fort Pitt Bridge, 1959',
        note: 'The double-decker. Two decks between the arch springings, the'
            + ' hangers landing on the upper one — the only bowstring in the'
            + ' city stacked two roadways deep.',
        hue: 'gold',
        piers: [0, 1],
        deckWidth: 1.1,
        draw(K) {
            const { thick, cell, k, ink, hue, p, bar, side, m, slab, deckAlpha } = K;
            const gap = cell * 0.44 * k;
            const upper = thick + gap;
            // posts carrying the upper deck off the lower one at the ends
            for (const s of [-1, 1]) {
                const sd = side(s);
                for (const t of [0, 0.12, 0.88, 1]) {
                    bar([t, s, thick], [t, s, upper], m('post') * sd.w, ink(hue, 0.75 * sd.a));
                }
            }
            tiedArch(K, 0, 1, cell * 1.3 * k, {
                springs: 0,
                hangers: 9,
                deckZ: upper,
                between: () => slab(0, 1, upper, -1, 1, thick * 0.85,
                    ink(p.deck, deckAlpha), ink(p.steel, deckAlpha * DECK_FACE)),
            });
            railing(K, 0, 1, cell * 0.1, upper);
            // The lower deck's own kerb line, read against the underside of the
            // upper one — the sliver of open air between the two roadways is
            // what tells you there are two of them.
            for (const s of [-1, 1]) {
                bar([0, s, thick + cell * 0.05], [1, s, thick + cell * 0.05],
                    m('trim') * side(s).w, ink(p.steel, 0.4 * side(s).a));
            }
        },
    },

    fortduquesne: {
        label: 'Fort Duquesne',
        real: 'Fort Duquesne Bridge, 1969',
        note: 'The other double-decker, and the wide one. Two decks like Fort Pitt,'
            + ' but a broader roadway and a much flatter crown over it.',
        hue: 'gold',
        piers: [0, 1],
        deckWidth: 1.3,
        draw(K) {
            const { cell, k, thick, ink, p, bar, side, m, hue, slab, deckAlpha } = K;
            const gap = cell * 0.4 * k;
            const upper = thick + gap;
            for (const s of [-1, 1]) {
                const sd = side(s);
                for (const t of [0, 0.1, 0.9, 1]) {
                    bar([t, s, thick], [t, s, upper], m('post') * sd.w, ink(hue, 0.75 * sd.a));
                }
            }
            // Flatter than Fort Pitt by a third, over a deck a fifth wider. Those
            // two together are the whole difference between the pair of them.
            tiedArch(K, 0, 1, cell * 0.92 * k, {
                hangers: 11,
                deckZ: upper,
                laterals: [0.26, 0.42, 0.58, 0.74],
                between: () => slab(0, 1, upper, -1, 1, thick * 0.85,
                    ink(p.deck, deckAlpha), ink(p.steel, deckAlpha * DECK_FACE)),
            });
            railing(K, 0, 1, cell * 0.1, upper);
            for (const s of [-1, 1]) {
                bar([0, s, thick + cell * 0.05], [1, s, thick + cell * 0.05],
                    m('trim') * side(s).w, ink(p.steel, 0.4 * side(s).a));
            }
        },
    },

    westend: {
        label: 'West End',
        real: 'West End Bridge, 1932',
        note: 'White, and a braced rib — two chords with a lattice web between'
            + ' them — springing from below deck level, with the roadway hung low'
            + ' inside the arch.',
        hue: 'westend',
        piers: [0, 1],
        pierDepth: 1.2,
        draw(K) {
            const { cell, k, ink, p, bar, side, m, thick } = K;
            tiedArch(K, 0, 1, cell * 1.15 * k, {
                springs: -cell * 0.26 * k,
                hangers: 11,
                braced: true,
                laterals: [0.24, 0.38, 0.5, 0.62, 0.76],
            });
            // The rib carries on below the deck to its skewback, so the deck
            // reads as threaded through the arch rather than sat on top of it.
            for (const s of [-1, 1]) {
                const sd = side(s);
                for (const t of [0.06, 0.94]) {
                    bar([t, s, thick], [t, s, -cell * 0.26 * k], m('web') * sd.w,
                        ink(p.steel, 0.5 * sd.a));
                }
            }
            railing(K, 0, 1, cell * 0.09);
        },
    },

    birmingham: {
        label: 'Birmingham',
        real: 'Birmingham Bridge, 1976',
        note: 'A steep tied arch over the channel with plain girder approaches'
            + ' either side, standing on tall slim piers in the water.',
        hue: 'birmingham',
        piers: [0, 0.22, 0.78, 1],
        // Very tall and narrow, which is the approach viaduct's own look and the
        // clearest thing separating this from the McKees Rocks arch beside it.
        pierDepth: 1.9,
        deckWidth: 1.15,
        draw(K) {
            const { cell, k } = K;
            girderSpan(K, 0, 0.22, cell * 0.13);
            girderSpan(K, 0.78, 1, cell * 0.13);
            // A plain solid rib, many close thin hangers, and Xs overhead between
            // the two ribs. The bracing is the recognisable part.
            tiedArch(K, 0.22, 0.78, cell * 1.06 * k, {
                hangers: 12,
                laterals: [0.2, 0.36, 0.5, 0.64, 0.8],
                xBrace: true,
            });
            railing(K, 0, 1, cell * 0.1);
        },
    },

    mckeesrocks: {
        label: 'McKees Rocks',
        real: 'McKees Rocks Bridge, 1931',
        note: 'The big one: one dominant centre arch flanked by continuous deck'
            + ' trusses under the roadway, all of it on very tall river piers.',
        hue: 'mckeesrocks',
        piers: [0, 0.26, 0.74, 1],
        pierDepth: 1.6,
        draw(K) {
            const { cell, k, thick, ink, p, bar, side, m, hue } = K;
            // Flanking deck trusses: chords under the roadway with an X per bay.
            const deep = cell * 0.34;
            for (const [from, to] of [[0, 0.26], [0.74, 1]]) {
                for (const s of [-1, 1]) {
                    const sd = side(s);
                    bar([from, s, -deep], [to, s, -deep], m('chord') * sd.w, ink(hue, 0.8 * sd.a));
                    bar([from, s, thick], [to, s, thick], m('chord') * sd.w * 0.9,
                        ink(hue, 0.85 * sd.a));
                    for (let i = 0; i <= 3; i += 1) {
                        const t = from + ((to - from) * i) / 3;
                        bar([t, s, thick], [t, s, -deep], m('web') * sd.w, ink(p.steel, 0.6 * sd.a));
                        if (i === 3) continue;
                        const t2 = from + ((to - from) * (i + 1)) / 3;
                        K.stroke([t, s, thick], [t2, s, -deep], ink(p.steel, 0.45 * sd.a), m('web'));
                        K.stroke([t, s, -deep], [t2, s, thick], ink(p.steel, 0.45 * sd.a), m('web'));
                    }
                }
            }
            tiedArch(K, 0.26, 0.74, cell * 1.05 * k, {
                hangers: 8,
                laterals: [0.28, 0.5, 0.72],
                xBrace: true,
            });
            railing(K, 0, 1, cell * 0.09);
        },
    },

    sixteenth: {
        label: 'Sixteenth Street',
        real: 'David McCullough Bridge, 1922',
        note: 'Three latticed arches over the deck — one big one over midstream'
            + ' with a smaller one either side — and a stone pylon at each corner'
            + ' capped in patinated copper.',
        hue: 'gold',
        trim: 'copper',
        piers: [0, 0.28, 0.72, 1],
        draw(K) {
            const { cell, k, thick, ink, p, quad, side, trim } = K;
            // Small, large, small. The centre arch is the bridge; the flanking
            // pair are shorter in both span and rise, which is the proportion
            // that names it from a distance.
            tiedArch(K, 0, 0.28, cell * 0.6 * k, { hangers: 4, braced: true, laterals: [0.4, 0.6] });
            tiedArch(K, 0.28, 0.72, cell * 1.08 * k, {
                hangers: 9,
                braced: true,
                laterals: [0.26, 0.42, 0.58, 0.74],
            });
            tiedArch(K, 0.72, 1, cell * 0.6 * k, { hangers: 4, braced: true, laterals: [0.4, 0.6] });
            // The pylons: a stone mass, a cap, and the patinated copper on top.
            // Wide and short on purpose — at pylon proportions they read as
            // masonry, at mast proportions as aerials.
            const h = cell * 0.46 * k;
            for (const t of [0, 1]) {
                for (const s of [-1, 1]) {
                    const sd = side(s);
                    quad([t, s * 1.14, thick], [t, s * 0.44, thick],
                        [t, s * 0.52, thick + h], [t, s * 1.04, thick + h],
                        ink(p.plate, 0.95 * sd.a));
                    quad([t, s * 1.08, thick + h], [t, s * 0.48, thick + h],
                        [t, s * 0.56, thick + h * 1.3], [t, s * 1.0, thick + h * 1.3],
                        ink(trim, 0.9 * sd.a));
                    K.dot([t, s * 0.78, thick + h * 1.3 + cell * 0.05], cell * 0.055,
                        ink(trim, 0.95 * sd.a));
                }
            }
            railing(K, 0, 1, cell * 0.1);
        },
    },

    // --- through trusses -------------------------------------------------
    hotmetal: {
        label: 'Hot Metal',
        real: 'Monongahela Connecting Railroad bridges',
        note: 'Three bowstring through trusses of unequal size, near-black, and a'
            + ' plain girder road deck alongside — the rail crossing that carried'
            + ' crucibles of iron, and the bridge that took its place.',
        hue: 'hotmetal',
        piers: [0, 0.24, 0.62, 1],
        deckWidth: 0.78,
        twin: true,
        // The road deck sits downstream of the trusses, so the shadow has to
        // reach out past the near kerb with it.
        shadow: [-1.5, 3.4],
        draw(K) {
            const { cell, k, thick, ink, p, m, side, bar, hue, slab, twin, deckAlpha } = K;
            // Unequal spans, descending toward the bank, with the top chord
            // curving into the deck at each pier rather than standing on end
            // posts. Both of those are what the photograph shows and neither is
            // what a parallel-chord Pratt truss looks like.
            throughTruss(K, 0, 0.24, cell * 0.4 * k, 3, { bow: true });
            throughTruss(K, 0.24, 0.62, cell * 0.82 * k, 6, { bow: true });
            throughTruss(K, 0.62, 1, cell * 0.78 * k, 6, { bow: true });
            railing(K, 0, 1, cell * 0.07);
            if (!twin) return;
            // The road bridge beside it: a plain concrete deck on plate girders,
            // no truss at all. Drawn in the same frame simply by pushing s out
            // past the near kerb — far enough out that open water shows between
            // the two, because otherwise they read as one wide platform.
            const s0 = 1.75;
            const s1 = 3.2;
            const drop = cell * 0.2;
            for (const s of [s0, s1]) {
                const sd = side(s > 2.4 ? 1 : -1);
                K.quad([0, s, 0], [1, s, 0], [1, s, -drop], [0, s, -drop],
                    ink(p.steel, 0.34 * sd.a));
                bar([0, s, -drop], [1, s, -drop], m('trim') * sd.w, ink(hue, 0.6 * sd.a));
            }
            slab(0, 1, thick, s0, s1, thick * 0.9,
                ink(p.deck, deckAlpha), ink(p.steel, deckAlpha * DECK_FACE));
            for (const s of [s0, s1]) {
                bar([0, s, thick + cell * 0.06 * k], [1, s, thick + cell * 0.06 * k],
                    m('trim'), ink(p.structure, 0.4));
            }
        },
    },

    liberty: {
        label: 'Liberty',
        real: 'Liberty Bridge, 1928',
        note: 'The whole structure is under the roadway — two shallow deck-truss'
            + ' spans on one mid-river pier, deepest between pier and bank. The'
            + ' only bridge here with nothing at all above its deck.',
        hue: 'liberty',
        piers: [0, 0.5, 1],
        pierDepth: 1.5,
        deckWidth: 1.1,
        draw(K) {
            const { cell, k } = K;
            deckTruss(K, 0, 0.5, cell * 0.44 * k, 6);
            deckTruss(K, 0.5, 1, cell * 0.44 * k, 6);
            railing(K, 0, 1, cell * 0.08);
        },
    },
};

export const BRIDGE_ORDER = Object.keys(BRIDGES);
