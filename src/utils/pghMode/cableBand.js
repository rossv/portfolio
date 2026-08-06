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

// Matches WaterBanner: absolute top-20 (5rem), clamp(250px, 30vh, 450px) tall,
// masked from 40% down. Keeping these in step means the five backdrops all
// occupy the same slot.
const BAND_TOP = 80;
const bandHeight = (viewportH) => clamp(viewportH * 0.30, 250, 450);
const MASK_START = 0.40;

// Catenary through the band. The vertex sits off to the left, so the cable
// rises left to right the way it does in the photograph.
const K = 1.55;
const VERTEX = -0.55;
const DENOM = Math.cosh(K * (1 - VERTEX)) - 1;

function cableY(t, h) {
    const raw = (Math.cosh(K * (t - VERTEX)) - 1) / DENOM;
    return h * (0.80 - raw * 0.66);
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

        const tube = Math.max(11, h * 0.075);
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
