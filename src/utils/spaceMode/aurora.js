// Aurora banner: the space-mode stand-in for the water video.
//
// It occupies the same slot the video does — 80px from the top of the document,
// height clamp(250px, 30vh, 450px), masked to fade out downward — and scrolls
// away with the page rather than sticking to the viewport, so the two modes
// behave the same way.

const BAND_TOP = 80;   // matches WaterBanner's `top-20`

export function createAurora(ctx, palette) {
    const { blend, hues, fill: FILL, crease: CREASE } = palette.aurora;
    let band = null;
    let bandCtx = null;
    let bandH = 0;
    let width = 0;
    let dpr = 1;

    function resize(w, h, devicePixelRatio) {
        width = w;
        dpr = devicePixelRatio;
        bandH = Math.max(250, Math.min(450, h * 0.3));
        band = document.createElement('canvas');
        band.width = Math.max(1, Math.floor(w * dpr));
        band.height = Math.max(1, Math.floor(bandH * dpr));
        bandCtx = band.getContext('2d');
    }

    // One ribbon of the curtain. Two sine terms keep the crease from looking
    // like a single clean wave.
    const ribbonY = (x, baseY, phase) => baseY
        + Math.sin(phase + (x / width) * 5.2) * bandH * 0.16
        + Math.sin(phase * 1.7 + (x / width) * 9.4) * bandH * 0.06;

    function frame(t, scrollY) {
        if (!bandCtx) return;
        // Fully scrolled past, so there is nothing to composite.
        if (scrollY > BAND_TOP + bandH) return;

        const g = bandCtx;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, width, bandH);

        // Additive on a dark ground; normal on paper, where 'lighter' would
        // simply saturate to white and vanish.
        g.globalCompositeOperation = blend;
        for (let ribbon = 0; ribbon < 3; ribbon++) {
            const phase = t * 0.00022 + ribbon * 2.1;
            const baseY = bandH * (0.3 + ribbon * 0.12);
            const hue = hues[ribbon % hues.length];

            g.beginPath();
            g.moveTo(-40, bandH);
            for (let x = -40; x <= width + 40; x += 14) g.lineTo(x, ribbonY(x, baseY, phase));
            g.lineTo(width + 40, bandH);
            g.closePath();

            const fill = g.createLinearGradient(0, baseY - bandH * 0.2, 0, bandH);
            fill.addColorStop(0, `rgba(${hue}, 0)`);
            fill.addColorStop(0.35, `rgba(${hue}, ${FILL})`);
            fill.addColorStop(1, `rgba(${hue}, 0)`);
            g.fillStyle = fill;
            g.fill();

            // Crease along the leading edge.
            g.strokeStyle = `rgba(${hue}, ${CREASE})`;
            g.lineWidth = 1.4;
            g.beginPath();
            for (let x = -40; x <= width + 40; x += 14) {
                const y = ribbonY(x, baseY, phase);
                if (x === -40) g.moveTo(x, y); else g.lineTo(x, y);
            }
            g.stroke();
        }
        g.globalCompositeOperation = 'source-over';

        // The same downward fade as WaterBanner's CSS mask.
        g.globalCompositeOperation = 'destination-out';
        const mask = g.createLinearGradient(0, bandH * 0.4, 0, bandH);
        mask.addColorStop(0, 'rgba(0, 0, 0, 0)');
        mask.addColorStop(1, 'rgba(0, 0, 0, 1)');
        g.fillStyle = mask;
        g.fillRect(0, 0, width, bandH);
        g.globalCompositeOperation = 'source-over';

        ctx.drawImage(band, 0, BAND_TOP - scrollY, width, bandH);
    }

    return { resize, frame };
}
