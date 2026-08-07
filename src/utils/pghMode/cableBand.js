// The main cable across the top of the hero.
//
// This fills the same slot the water video, the aurora, the flood raster and
// the waveform fill — pinned near the top of the page, faded out before it
// reaches the name. The geometry is the reference photograph's: the cable
// enters low on the left and climbs toward a tower beyond the right edge, with
// cable bands at intervals and a pair of hanger ropes dropping from each one.
//
// The photograph also carries a handrope above the main cable, on short struts.
// It is not drawn here: at this scale it read as a stray second cable rather
// than as rigging, and the struts were what made it look like a mistake.
//
// It scrolls with the page rather than sitting fixed, so it leaves with the
// hero instead of hanging over every section below it.

import { clamp, rgba } from './palette';

// Starts where WaterBanner starts — absolute top-20, 5rem — but runs deeper
// than the water video's 30vh, because the cable enters low on the left and its
// hangers want room to fall. The fade starts later than the video's 40% for the
// same reason: at 40% the whole lower half of the sweep was being erased.
const BAND_TOP = 80;
const bandHeight = (viewportH) => clamp(viewportH * 0.42, 300, 620);
const MASK_START = 0.55;
const MOBILE_MASK_START = 0.38;

// Catenary through the band, normalised so the two ends are stated outright
// rather than falling out of the constants. Both are fractions of band height:
// the cable enters low on the left and climbs to a tower beyond the right edge.
const CABLE_LEFT = 0.70;
const CABLE_RIGHT = 0.04;
// On narrow screens the stacked hero copy starts much higher than it does in
// the desktop two-column layout. Lift the cable's low end into the open space
// above the wordmark so the gold tube never runs through the name. The desktop
// composition keeps the deeper sweep from the reference image.
const MOBILE_CABLE_LEFT = 0.27;
const MOBILE_CABLE_RIGHT = 0.01;
const MOBILE_WIDTH = 640;
const DESKTOP_WIDTH = 1024;

// Vertex off to the left, so the whole visible run is one rising limb.
const K = 1.8;
const VERTEX = -0.55;
const RAW_0 = Math.cosh(K * -VERTEX) - 1;
const RAW_1 = Math.cosh(K * (1 - VERTEX)) - 1;

// Cable bands, and therefore the hanger pairs, at even intervals.
const BAND_FIRST = 0.06;
const BAND_STEP = 0.108;
// How much of the run's progress a single hanger takes to fall.
const DROP_SPAN = 0.16;
// The lights run four to a bay, so they read as a necklace along the cable
// rather than as one lamp per hanger.
const LIGHT_STEP = BAND_STEP / 4;

// Every so often a crest of light runs the length of the necklace, brightening
// each bulb as it passes and leaving it guttering for a moment behind. It is a
// long wait between runs on purpose: the point is to catch someone who has
// stopped to read, not to give the hero a permanent shimmer.
const WAVE_PERIOD = 9200;
const WAVE_TRAVEL = 1500;
// How much of the run the crest covers. Wide enough that the bulbs light in a
// swell rather than one at a time.
const WAVE_WIDTH = 0.18;
// The flicker holds each value for this long. Kept well clear of a strobe: the
// bulbs gutter like a filament settling, they do not blink.
const FLICKER_MS = 130;

// Where the crest is, in the same 0..1 the bulbs are spaced along, or null
// between runs. It starts one crest-width off each end so the bulbs there get
// the whole swell rather than half of it.
function waveCrest(time) {
    const into = time % WAVE_PERIOD;
    if (into > WAVE_TRAVEL) return null;
    const head = -WAVE_WIDTH + (into / WAVE_TRAVEL) * (1 + 2 * WAVE_WIDTH);
    // Alternate the direction, so the run does not always sweep the same way.
    return Math.floor(time / WAVE_PERIOD) % 2 ? 1 - head : head;
}

// Per-bulb stutter. Deterministic in the bulb and the time step, so a repaint
// inside one step draws the same thing rather than re-rolling every frame.
function stutter(index, time) {
    const s = Math.sin((index * 7.31 + Math.floor(time / FLICKER_MS)) * 127.1) * 43758.5453;
    return s - Math.floor(s);
}

function cableY(t, h, w) {
    const raw = (Math.cosh(K * (t - VERTEX)) - 1 - RAW_0) / (RAW_1 - RAW_0);
    const desktopMix = clamp((w - MOBILE_WIDTH) / (DESKTOP_WIDTH - MOBILE_WIDTH), 0, 1);
    const left = MOBILE_CABLE_LEFT + (CABLE_LEFT - MOBILE_CABLE_LEFT) * desktopMix;
    const right = MOBILE_CABLE_RIGHT + (CABLE_RIGHT - MOBILE_CABLE_RIGHT) * desktopMix;
    return h * (left + (right - left) * raw);
}

function mobileMix(w) {
    return 1 - clamp((w - MOBILE_WIDTH) / (DESKTOP_WIDTH - MOBILE_WIDTH), 0, 1);
}

export function createCableBand(ctx, palette, geom, { clouds = null, reduceMotion = false } = {}) {
    // Drawn to a buffer so the bottom fade can be a real mask rather than a
    // rectangle painted over the top of it. The buffer is also a cache: the band
    // does not change as the page scrolls, it only moves, so a scroll costs one
    // drawImage rather than a full repaint.
    const buffer = document.createElement('canvas');
    const bufferCtx = buffer.getContext('2d');
    let painted = -1;
    let tick = 0;
    let waved = false;

    // The buffer runs from the very top of the page, not from BAND_TOP. Starting
    // it at the band left a strip of bare ground above the weather — a black bar
    // across the top of the hero. The cable still sits where it did: it is drawn
    // BAND_TOP further down inside a taller buffer.
    const bufferHeight = (viewportH) => Math.ceil(bandHeight(viewportH)) + BAND_TOP;

    function resize(width, height) {
        const h = bufferHeight(height);
        if (buffer.width === width && buffer.height === h) return;
        buffer.width = Math.max(1, width);
        buffer.height = Math.max(1, h);
        painted = -1;
    }

    // Named rather than left as `t`, because the bulb and band loops below use
    // `t` for a position along the run and would otherwise shadow it.
    function paint(w, h, progress, time) {
        const c = bufferCtx;
        const full = h + BAND_TOP;
        c.clearRect(0, 0, w, full);

        // Overcast behind the cable, over the whole buffer so it reaches the top
        // of the page, and inside the band so the mask at its foot fades the
        // weather out along with the structure.
        if (clouds) {
            c.imageSmoothingEnabled = true;
            c.imageSmoothingQuality = 'high';
            c.drawImage(clouds.frame(time, w), 0, 0, w, full);
        }

        // Everything below is the cable's own band, which begins BAND_TOP down.
        c.save();
        c.translate(0, BAND_TOP);

        // Held to a ceiling: tied straight to the taller band the cable came out
        // chunky, and the tube should read the same weight at any viewport.
        const tube = clamp(h * 0.055, 12, 40);
        const STEP = 0.02;

        const bands = [];
        for (let t = BAND_FIRST; t < 1; t += BAND_STEP) bands.push(t);

        // --- hangers: a pair per band, dropping as the cable reaches them ---
        c.strokeStyle = palette.structure;
        c.lineWidth = Math.max(1.2, tube * 0.085);
        const narrow = mobileMix(w);
        for (const t of bands) {
            // Each hanger falls over its own short window, once the cable has
            // arrived overhead. The window is whatever is left of the run when
            // the cable gets there, because the last band is reached with less
            // than DROP_SPAN to go: on a fixed span it stopped at just under
            // half length and stayed there, ending on a hard edge exactly where
            // the mask begins while every other hanger faded out through it.
            const span = Math.min(DROP_SPAN, 1 - t);
            const drop = span > 0 ? clamp((progress - t) / span, 0, 1) : 1;
            if (drop <= 0) continue;
            const x = t * w;
            const y = cableY(t, h, w);
            const spread = tube * 0.42;
            // On phones, let the verticals recede quickly below the cable. They
            // retain the suspension-bridge silhouette without fencing in the
            // stacked hero copy.
            const hangerLength = (h - y) * drop * (1 - narrow * 0.42);
            const hangerFade = c.createLinearGradient(0, y, 0, y + hangerLength);
            hangerFade.addColorStop(0, rgba(palette.structure, 0.92));
            hangerFade.addColorStop(1 - narrow * 0.34, rgba(palette.structure, 0.72));
            hangerFade.addColorStop(1, rgba(palette.structure, narrow ? 0 : 0.5));
            c.strokeStyle = hangerFade;
            c.globalAlpha = 1;
            for (const dx of [-spread, spread]) {
                c.beginPath();
                c.moveTo(x + dx, y);
                c.lineTo(x + dx, y + hangerLength);
                c.stroke();
            }
        }
        c.globalAlpha = 1;

        // --- the cable, shaded across its thickness so it reads as round ---
        const mid = cableY(0.5, h, w);
        const shade = c.createLinearGradient(0, mid - tube, 0, mid + tube);
        shade.addColorStop(0, palette.cableLow);
        shade.addColorStop(0.32, palette.accent);
        shade.addColorStop(0.62, palette.accent);
        shade.addColorStop(1, palette.cableLow);
        c.strokeStyle = shade;
        c.lineWidth = tube;
        c.lineCap = 'round';
        c.beginPath();
        for (let t = 0; t <= progress; t += STEP) {
            const x = t * w;
            const y = cableY(t, h, w);
            if (t === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        if (progress > 0) c.lineTo(progress * w, cableY(progress, h, w));
        c.stroke();

        // A lit crown along the top edge. This is what sells the cylinder.
        c.strokeStyle = rgba(palette.crown, palette.light ? 0.5 : 0.42);
        c.lineWidth = Math.max(1, tube * 0.16);
        c.beginPath();
        for (let t = 0; t <= progress; t += STEP) {
            const x = t * w;
            const y = cableY(t, h, w) - tube * 0.3;
            if (t === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();

        // --- cable bands: a darker collar square to the cable ---
        c.fillStyle = palette.bandCollar;
        for (const t of bands) {
            if (progress < t) continue;
            const x = t * w;
            const y = cableY(t, h, w);
            const ahead = cableY(Math.min(1, t + 0.01), h, w);
            c.save();
            c.translate(x, y);
            c.rotate(Math.atan2(ahead - y, 0.01 * w));
            c.fillRect(-tube * 0.30, -tube * 0.60, tube * 0.60, tube * 1.20);
            c.restore();
        }

        // --- the necklace ---
        // A close-spaced string of warm bridge bulbs follows the crown. Keep a
        // smaller, edged version on the light ground instead of removing it:
        // the bulbs are an identifying detail of the Pittsburgh bridge motif.
        {
            const core = Math.max(1.5 + narrow * 0.8, tube * (0.085 + narrow * 0.035));
            const halo = core * (4.8 + narrow * 1.4);
            // Only once the run has settled. During the entrance the bulbs are
            // already lighting in sequence, and a second travelling effect on
            // top of that read as a fault rather than as a flourish.
            const crest = reduceMotion || progress < 1 ? null : waveCrest(time);
            let index = 0;
            for (let t = BAND_FIRST; t < 1; t += LIGHT_STEP) {
                // Lights come on behind the cable's leading edge, so the run
                // lights up in sequence rather than all at once.
                const on = clamp((progress - t - 0.06) / 0.22, 0, 1);
                index += 1;
                if (on <= 0) continue;

                // The swell this bulb is under, guttering as it goes. Squared
                // so the crest stays tight and the shoulders stay quiet.
                let surge = 0;
                if (crest !== null) {
                    const reach = 1 - Math.abs(t - crest) / WAVE_WIDTH;
                    if (reach > 0) surge = reach * reach * (0.45 + 0.55 * stutter(index, time));
                }

                const x = t * w;
                const y = cableY(t, h, w) - tube * 0.52;
                const glowR = halo * (1 + surge * 0.8);
                const glow = c.createRadialGradient(x, y, 0, x, y, glowR);
                const glowA = (palette.light ? 0.18 : 0.44) * on;
                // On the dark ground this is held just under the cap: boosted
                // harder it saturates at the crest, which flattens off the very
                // part of the flicker that is meant to be seen. The light
                // ground starts at a quarter of the alpha, so it has the room
                // to spare and needs it — the same boost there is invisible.
                const boost = palette.light ? 2.4 : 1.2;
                glow.addColorStop(0, rgba(palette.accent, clamp(glowA * (1 + surge * boost), 0, 1)));
                glow.addColorStop(1, rgba(palette.accent, 0));
                c.fillStyle = glow;
                c.beginPath();
                c.arc(x, y, glowR, 0, Math.PI * 2);
                c.fill();
                // The filament swells and burns hotter, which is what makes the
                // crest read as brighter rather than merely bigger. The colour
                // has to carry that on the dark ground, where the bulb already
                // sits at full alpha and cannot be boosted any further.
                const lit = palette.light ? palette.accent : palette.crown;
                c.fillStyle = rgba(
                    surge > 0.55 ? palette.filament : lit,
                    clamp((palette.light ? 0.9 : 1) * on * (1 + surge * 0.4), 0, 1),
                );
                c.beginPath();
                c.arc(x, y, core * (1 + surge * 0.42), 0, Math.PI * 2);
                c.fill();
            }
        }

        c.restore();

        // Fade the lower part out, so the band never reaches the wordmark. In
        // buffer coordinates, which is BAND_TOP below the band's own.
        const maskStart = MASK_START + (MOBILE_MASK_START - MASK_START) * mobileMix(w);
        const fadeFrom = BAND_TOP + h * maskStart;
        c.globalCompositeOperation = 'destination-out';
        const mask = c.createLinearGradient(0, fadeFrom, 0, full);
        mask.addColorStop(0, 'rgba(0,0,0,0)');
        mask.addColorStop(1, 'rgba(0,0,0,1)');
        c.fillStyle = mask;
        c.fillRect(0, fadeFrom, w, full - fadeFrom);
        c.globalCompositeOperation = 'source-over';
    }

    function frame(scrollY, arrival = 1, t = 0) {
        const width = geom.width();
        const height = geom.height();
        const h = Math.ceil(bandHeight(height));
        resize(width, height);

        // Ease out: the run is extruded quickly and settles into its far end,
        // rather than crawling across at one speed.
        const progress = 1 - (1 - arrival) * (1 - arrival);

        // Scrolls with the page, like the DOM banner it stands in for. The buffer
        // starts at the page top, so it lands at -scrollY.
        const top = -scrollY;
        if (top + bufferHeight(height) <= 0 || top >= height) return;

        // Repaint while the run is still building, and — because the overcast
        // drifts — every fourth frame after that. The cable itself is static, so
        // a quarter-rate cloud is invisible, and it keeps the necklace's three
        // dozen gradients off the hot path.
        // A crest travelling the run needs a smoother cadence than the drifting
        // overcast does — at a quarter rate it steps along in visible jumps. It
        // only gets one while a wave is actually running, which is a second and
        // a half in every nine, so the steady cost is unchanged.
        const waving = !reduceMotion && progress >= 1 && waveCrest(t) !== null;
        tick += 1;
        // The edges are repainted outright rather than waited for. Without that
        // the buffer can be left holding a lit crest until whatever repaints
        // next comes round, which today is the overcast and tomorrow might be
        // nothing at all.
        if (progress !== painted || waving !== waved || (waving && tick % 2 === 0)
            || (clouds && tick % 4 === 0)) {
            paint(width, h, progress, t);
            painted = progress;
            waved = waving;
        }
        ctx.drawImage(buffer, 0, top);
    }

    return { resize, frame };
}
