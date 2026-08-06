// The main cable across the top of the hero.
//
// This fills the same slot the water video, the aurora, the flood raster and
// the waveform fill — pinned near the top of the page, a little over a quarter
// of the viewport tall, faded out before it reaches the name. The geometry is
// the reference photograph's: the cable enters low on the left and climbs
// toward a tower beyond the right edge, cable bands at intervals, a pair of
// hanger ropes dropping from each one, and a handrope above carried on short
// struts.
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

// Vertex off to the left, so the whole visible run is one rising limb.
const K = 1.8;
const VERTEX = -0.55;
const RAW_0 = Math.cosh(K * -VERTEX) - 1;
const RAW_1 = Math.cosh(K * (1 - VERTEX)) - 1;

function cableY(t, h) {
    const raw = (Math.cosh(K * (t - VERTEX)) - 1 - RAW_0) / (RAW_1 - RAW_0);
    return h * (CABLE_LEFT + (CABLE_RIGHT - CABLE_LEFT) * raw);
}

export function createCableBand(ctx, palette, geom) {
    // Drawn to a buffer so the bottom fade can be a real mask rather than a
    // rectangle painted over the top of it.
    const buffer = document.createElement('canvas');
    const bufferCtx = buffer.getContext('2d');

    function resize(width, height) {
        const h = Math.ceil(bandHeight(height));
        if (buffer.width === width && buffer.height === h) return;
        buffer.width = Math.max(1, width);
        buffer.height = Math.max(1, h);
    }

    function paint(w, h) {
        const c = bufferCtx;
        c.clearRect(0, 0, w, h);

        // Held to a ceiling: tied straight to the taller band the cable came out
        // chunky, and the tube should read the same weight at any viewport.
        const tube = clamp(h * 0.055, 12, 40);
        const STEP = 0.02;

        // Cable bands, and therefore the hanger pairs, at even intervals.
        const bands = [];
        for (let t = 0.06; t < 1; t += 0.108) bands.push(t);

        const handropeY = (t) => cableY(t, h) - tube * 2.6 - (1 - t) * h * 0.03;

        // --- handrope, straighter than the cable it runs above ---
        c.strokeStyle = palette.rope;
        c.globalAlpha = 0.55;
        c.lineWidth = Math.max(1, tube * 0.09);
        c.beginPath();
        for (let t = 0; t <= 1.0001; t += STEP) {
            const x = t * w;
            const y = handropeY(t);
            if (t === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();

        // --- hangers: a pair per band, plus the strut up to the handrope ---
        c.strokeStyle = palette.structure;
        c.globalAlpha = 0.92;
        c.lineWidth = Math.max(1.2, tube * 0.085);
        for (const t of bands) {
            const x = t * w;
            const y = cableY(t, h);
            const spread = tube * 0.42;
            for (const dx of [-spread, spread]) {
                c.beginPath();
                c.moveTo(x + dx, y);
                c.lineTo(x + dx, h);
                c.stroke();
            }
            c.beginPath();
            c.moveTo(x, y - tube * 0.4);
            c.lineTo(x, handropeY(t));
            c.stroke();
        }
        c.globalAlpha = 1;

        // --- the cable, shaded across its thickness so it reads as round ---
        const mid = cableY(0.5, h);
        const shade = c.createLinearGradient(0, mid - tube, 0, mid + tube);
        shade.addColorStop(0, palette.cableLow);
        shade.addColorStop(0.32, palette.accent);
        shade.addColorStop(0.62, palette.accent);
        shade.addColorStop(1, palette.cableLow);
        c.strokeStyle = shade;
        c.lineWidth = tube;
        c.lineCap = 'round';
        c.beginPath();
        for (let t = 0; t <= 1.0001; t += STEP) {
            const x = t * w;
            const y = cableY(t, h);
            if (t === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();

        // A lit crown along the top edge. This is what sells the cylinder.
        c.strokeStyle = rgba(palette.crown, palette.light ? 0.5 : 0.42);
        c.lineWidth = Math.max(1, tube * 0.16);
        c.beginPath();
        for (let t = 0; t <= 1.0001; t += STEP) {
            const x = t * w;
            const y = cableY(t, h) - tube * 0.3;
            if (t === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();

        // --- cable bands: a darker collar square to the cable ---
        c.fillStyle = palette.bandCollar;
        for (const t of bands) {
            const x = t * w;
            const y = cableY(t, h);
            const ahead = cableY(Math.min(1, t + 0.01), h);
            c.save();
            c.translate(x, y);
            c.rotate(Math.atan2(ahead - y, 0.01 * w));
            c.fillRect(-tube * 0.30, -tube * 0.60, tube * 0.60, tube * 1.20);
            c.restore();
        }

        // Fade the lower part out, so the band never reaches the wordmark.
        c.globalCompositeOperation = 'destination-out';
        const mask = c.createLinearGradient(0, h * MASK_START, 0, h);
        mask.addColorStop(0, 'rgba(0,0,0,0)');
        mask.addColorStop(1, 'rgba(0,0,0,1)');
        c.fillStyle = mask;
        c.fillRect(0, h * MASK_START, w, h - h * MASK_START);
        c.globalCompositeOperation = 'source-over';
    }

    function frame(scrollY) {
        const width = geom.width();
        const height = geom.height();
        const h = Math.ceil(bandHeight(height));
        resize(width, height);

        // Scrolls with the page, like the DOM banner it stands in for.
        const top = BAND_TOP - scrollY;
        if (top + h <= 0 || top >= height) return;

        paint(width, h);
        ctx.drawImage(buffer, 0, top);
    }

    return { resize, frame };
}
