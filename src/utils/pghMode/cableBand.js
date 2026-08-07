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

// Catenary through the band, normalised so the two ends are stated outright
// rather than falling out of the constants. Both are fractions of band height:
// the cable enters low on the left and climbs to a tower beyond the right edge.
const CABLE_LEFT = 0.70;
const CABLE_RIGHT = 0.04;
// On narrow screens the stacked hero copy starts much higher than it does in
// the desktop two-column layout. Lift the cable's low end into the open space
// above the wordmark so the gold tube never runs through the name. The desktop
// composition keeps the deeper sweep from the reference image.
const MOBILE_CABLE_LEFT = 0.40;
const MOBILE_CABLE_RIGHT = 0.02;
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
// The lights run four to a bay, so they read as a necklace along the cable
// rather than as one lamp per hanger.
const LIGHT_STEP = BAND_STEP / 4;

function cableY(t, h, w) {
    const raw = (Math.cosh(K * (t - VERTEX)) - 1 - RAW_0) / (RAW_1 - RAW_0);
    const desktopMix = clamp((w - MOBILE_WIDTH) / (DESKTOP_WIDTH - MOBILE_WIDTH), 0, 1);
    const left = MOBILE_CABLE_LEFT + (CABLE_LEFT - MOBILE_CABLE_LEFT) * desktopMix;
    const right = MOBILE_CABLE_RIGHT + (CABLE_RIGHT - MOBILE_CABLE_RIGHT) * desktopMix;
    return h * (left + (right - left) * raw);
}

export function createCableBand(ctx, palette, geom, { clouds = null } = {}) {
    // Drawn to a buffer so the bottom fade can be a real mask rather than a
    // rectangle painted over the top of it. The buffer is also a cache: the band
    // does not change as the page scrolls, it only moves, so a scroll costs one
    // drawImage rather than a full repaint.
    const buffer = document.createElement('canvas');
    const bufferCtx = buffer.getContext('2d');
    let painted = -1;
    let tick = 0;

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

    function paint(w, h, progress, t) {
        const c = bufferCtx;
        const full = h + BAND_TOP;
        c.clearRect(0, 0, w, full);

        // Overcast behind the cable, over the whole buffer so it reaches the top
        // of the page, and inside the band so the mask at its foot fades the
        // weather out along with the structure.
        if (clouds) {
            c.imageSmoothingEnabled = true;
            c.imageSmoothingQuality = 'high';
            c.drawImage(clouds.frame(t, w), 0, 0, w, full);
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
        for (const t of bands) {
            // Each hanger falls over its own short window, once the cable has
            // arrived overhead.
            const drop = clamp((progress - t) / 0.16, 0, 1);
            if (drop <= 0) continue;
            const x = t * w;
            const y = cableY(t, h, w);
            const spread = tube * 0.42;
            c.globalAlpha = 0.92;
            for (const dx of [-spread, spread]) {
                c.beginPath();
                c.moveTo(x + dx, y);
                c.lineTo(x + dx, y + (h - y) * drop);
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
        // Only on the dark ground. Every other lit detail in this mode does the
        // same: on paper a warm dot reads as dirt, not as a lamp.
        if (!palette.light) {
            const core = Math.max(1.1, tube * 0.075);
            const halo = core * 4.6;
            for (let t = BAND_FIRST; t < 1; t += LIGHT_STEP) {
                // Lights come on behind the cable's leading edge, so the run
                // lights up in sequence rather than all at once.
                const on = clamp((progress - t - 0.06) / 0.22, 0, 1);
                if (on <= 0) continue;
                const x = t * w;
                const y = cableY(t, h, w) - tube * 0.52;
                const glow = c.createRadialGradient(x, y, 0, x, y, halo);
                glow.addColorStop(0, rgba(palette.accent, 0.30 * on));
                glow.addColorStop(1, rgba(palette.accent, 0));
                c.fillStyle = glow;
                c.beginPath();
                c.arc(x, y, halo, 0, Math.PI * 2);
                c.fill();
                c.fillStyle = rgba(palette.crown, 0.82 * on);
                c.beginPath();
                c.arc(x, y, core, 0, Math.PI * 2);
                c.fill();
            }
        }

        c.restore();

        // Fade the lower part out, so the band never reaches the wordmark. In
        // buffer coordinates, which is BAND_TOP below the band's own.
        const fadeFrom = BAND_TOP + h * MASK_START;
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
        tick += 1;
        if (progress !== painted || (clouds && tick % 4 === 0)) {
            paint(width, h, progress, t);
            painted = progress;
        }
        ctx.drawImage(buffer, 0, top);
    }

    return { resize, frame };
}
