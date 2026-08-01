// Flood inundation hero for geospatial mode.
//
// Occupies the slot the water video uses — 80px from the top of the document,
// clamp(250px, 30vh, 450px) tall, masked to fade downward, scrolling away with
// the page — so all three modes behave the same way in that band.
//
// Two motions, sequenced. First the raster loads one cell at a time, top to
// bottom then left to right. Once it has crossed, a wetting front runs left to
// right widening and deepening the wetted corridor, and a recession front
// follows the same way and returns it to the base channel.

import { smooth, hash, hexToRgb } from './palette';

const BAND_TOP = 80;          // matches WaterBanner's `top-20`
const TILES_PER_SEC = 520;    // raster-scan load rate
const CYCLE = 15000;          // one flood in and out

export function createFlood(ctx, palette) {
    let band = null;
    let bandCtx = null;
    let bandH = 0;
    let width = 0;
    let clock = 0;

    function resize(w, h) {
        width = w;
        bandH = Math.max(250, Math.min(450, h * 0.3));
        band = document.createElement('canvas');
        band.width = Math.max(1, Math.floor(w));
        band.height = Math.max(1, Math.floor(bandH));
        bandCtx = band.getContext('2d');
    }

    // Restart the scan. Called when the mode is switched on.
    const replay = () => { clock = 0; };

    // Settle straight into a mapped, partly-flooded state — used under
    // reduced motion, where there is only one frame to tell the story.
    const settle = () => { clock = 9000; };

    // The reach: a meander with non-harmonic terms so it does not read as a
    // sine wave. Shared with nothing else, but kept here as the one alignment.
    const chanY = (x) => bandH * 0.36
        + Math.sin((x / width) * 6.0) * bandH * 0.135
        + Math.sin((x / width) * 13.0 + 1.2) * bandH * 0.042;

    // Floodplain width along the reach: wide flats in places, pinched in
    // others, so the inundation edge is irregular rather than a buffer.
    const plainWidth = (nx) => Math.max(0.35,
        0.86 + 0.32 * Math.sin(nx * 7.3 + 0.6) + 0.17 * Math.sin(nx * 17.1 + 2.1));

    // Knocks the contours back under the band, so the two are not competing
    // for the same lines. Drawn on the main canvas, before the band itself.
    function dim(scrollY) {
        if (!bandCtx) return;
        const rgb = hexToRgb(palette.ground);
        const top = BAND_TOP - scrollY - 40;
        const bot = BAND_TOP - scrollY + bandH * 0.8;
        if (bot < 0) return;
        // 0.88 rather than 0.7, and full strength by 0.10 rather than 0.16:
        // the contours read through the band far enough to compete with the
        // reach and with the hero type over it. Kept in step with
        // waveform.dim().
        const grad = ctx.createLinearGradient(0, top, 0, bot);
        grad.addColorStop(0, `rgba(${rgb}, 0)`);
        grad.addColorStop(0.10, `rgba(${rgb}, 0.88)`);
        grad.addColorStop(0.7, `rgba(${rgb}, 0.88)`);
        grad.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, top, width, bot - top);
    }

    function frame(dt, scrollY) {
        if (!bandCtx) return;
        clock += dt;
        // Fully scrolled past, so there is nothing to composite.
        if (scrollY > BAND_TOP + bandH) return;

        const g = bandCtx;
        g.clearRect(0, 0, width, bandH);

        const ramp = palette.flood;
        const size = Math.max(18, bandH * 0.062);
        const cols = Math.ceil(width / size) + 1;
        const baseExtent = bandH * 0.055;     // channel that is always wet
        const floodExtent = bandH * 0.30;     // full inundation
        const halfRows = Math.ceil(floodExtent / size) + 2;
        const rowsPerCol = halfRows * 2 + 1;

        const revealed = (clock / 1000) * TILES_PER_SEC;

        // The flood only starts once the scan has crossed, so a front never
        // arrives in ground that has not loaded yet.
        const scanMs = (cols * rowsPerCol / TILES_PER_SEC) * 1000;
        const ph = (Math.max(0, clock - scanMs) % CYCLE) / CYCLE;
        const riseX = (ph < 0.42 ? ph / 0.42 : 1) * width * 1.12;
        const recedeX = (ph < 0.54 ? 0 : Math.min(1, (ph - 0.54) / 0.42)) * width * 1.12;

        for (let c = 0; c < cols; c++) {
            const x = c * size;
            const cx = x + size / 2;
            const line = chanY(cx);
            const wet = smooth((riseX - cx) / 170) * (1 - smooth((recedeX - cx) / 170));
            // Inundation widens the corridor and deepens its colour.
            const extent = baseExtent + (floodExtent * plainWidth(cx / width) - baseExtent) * wet;
            const boldness = 0.5 + 0.5 * wet;

            for (let r = -halfRows; r <= halfRows; r++) {
                const ordinal = c * rowsPerCol + (r + halfRows);
                if (ordinal > revealed) continue;

                const y = line + r * size - size / 2;
                if (y > bandH || y + size < 0) continue;

                // Per-cell jitter breaks the classed bands into a mottled
                // edge, so it reads as floodplain and not as a buffer.
                const jitter = 0.8 + 0.4 * hash(c, r);
                const depth = Math.max(0, 1 - (Math.abs(r * size) / extent) * jitter);

                g.fillStyle = `rgba(${palette.line}, 0.03)`;
                g.fillRect(x, y, size - 0.7, size - 0.7);
                g.strokeStyle = `rgba(${palette.line}, 0.08)`;
                g.lineWidth = 0.6;
                g.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

                if (depth > 0.02) {
                    const cls = Math.min(4, Math.floor(depth * 5));
                    g.fillStyle = `rgba(${ramp[cls]}, ${(0.04 + cls * 0.05) * boldness})`;
                    g.fillRect(x, y, size - 0.7, size - 0.7);
                }

                // The scan cursor: cells just laid down read brighter.
                const age = revealed - ordinal;
                if (age < 14) {
                    g.fillStyle = `rgba(${ramp[4]}, ${(1 - age / 14) * 0.3})`;
                    g.fillRect(x, y, size - 0.7, size - 0.7);
                }
            }
        }

        // Centreline, drawn only as far as the scan has reached.
        const scannedX = Math.min(width, (revealed / rowsPerCol) * size);
        g.strokeStyle = `rgba(${ramp[4]}, 0.5)`;
        g.lineWidth = 1.6;
        g.beginPath();
        for (let x = 0; x <= scannedX; x += 6) {
            if (x === 0) g.moveTo(x, chanY(x)); else g.lineTo(x, chanY(x));
        }
        g.stroke();

        // The same downward fade as WaterBanner's CSS mask.
        g.globalCompositeOperation = 'destination-out';
        const mask = g.createLinearGradient(0, bandH * 0.72, 0, bandH);
        mask.addColorStop(0, 'rgba(0, 0, 0, 0)');
        mask.addColorStop(1, 'rgba(0, 0, 0, 1)');
        g.fillStyle = mask;
        g.fillRect(0, 0, width, bandH);
        g.globalCompositeOperation = 'source-over';

        ctx.drawImage(band, 0, BAND_TOP - scrollY, width, bandH);
    }

    return { resize, frame, dim, replay, settle };
}
