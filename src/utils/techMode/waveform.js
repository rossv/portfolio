// Waveform hero for technologist mode.
//
// Occupies the slot the water video uses — 80px from the top of the document,
// clamp(250px, 30vh, 450px) tall, masked to fade downward, scrolling away with
// the page — so all four modes behave the same way in that band.
//
// One instrument trace on a slow envelope over a faint axis and tick scale.
// It is about measurement rather than code, which is the point: every other
// candidate for this slot ended up being "look, source".

const BAND_TOP = 80;

export function createWaveform(ctx, palette) {
    let band = null;
    let bandCtx = null;
    let bandH = 0;
    let width = 0;

    function resize(w, h) {
        width = w;
        bandH = Math.max(250, Math.min(450, h * 0.3));
        band = document.createElement('canvas');
        band.width = Math.max(1, Math.floor(w));
        band.height = Math.max(1, Math.floor(bandH));
        bandCtx = band.getContext('2d');
    }

    function frame(t, scrollY) {
        if (!bandCtx) return;
        if (scrollY > BAND_TOP + bandH) return;

        const g = bandCtx;
        g.clearRect(0, 0, width, bandH);

        const mid = bandH * 0.3;

        // Axis and tick scale.
        g.strokeStyle = `rgba(${palette.edge}, 0.16)`;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0, mid);
        g.lineTo(width, mid);
        g.stroke();
        for (let i = 0; i <= 28; i++) {
            const x = (i / 28) * width;
            const major = i % 4 === 0;
            g.beginPath();
            g.moveTo(x, mid - (major ? 7 : 3));
            g.lineTo(x, mid + (major ? 7 : 3));
            g.stroke();
        }

        // Three harmonics on a slow amplitude envelope, so the trace breathes
        // rather than scrolling past at a fixed size.
        const env = 0.62 + 0.38 * Math.sin(t * 0.00038);
        // A dim echo behind the live trace gives depth without adding clutter.
        for (const L of [
            { a: 0.16, amp: 1.4, sp: 0.85, w: 1 },
            { a: 0.8, amp: 1, sp: 1, w: 1.8 },
        ]) {
            g.strokeStyle = `rgba(${palette.fn}, ${L.a})`;
            g.lineWidth = L.w;
            g.beginPath();
            for (let x = 0; x <= width; x += 4) {
                const k = x / width;
                const y = mid + (
                    Math.sin(k * 9 + t * 0.0011 * L.sp) * 0.5
                    + Math.sin(k * 23 + t * 0.0007 * L.sp) * 0.27
                    + Math.sin(k * 41 - t * 0.0016 * L.sp) * 0.11
                ) * bandH * 0.15 * L.amp * env;
                if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
            }
            g.stroke();
        }

        g.font = `10px ${getComputedStyle(document.body).fontFamily}`;
        g.textAlign = 'left';
        g.fillStyle = `rgba(${palette.dim}, 0.45)`;
        g.fillText('1.024 kHz · ±2.5 V', 14, mid + bandH * 0.26);

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

    return { resize, frame };
}
