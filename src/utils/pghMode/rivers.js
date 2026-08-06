// The river bands for Pittsburgh mode.
//
// One band per station, drawn from the far bank down. The near-bank fill runs
// all the way to the bottom of the viewport: the next station along is nearer
// and paints over it, and that overlap is what stacks the valley front to back.

import { rgba, hash } from './palette';

export function createRivers(ctx, palette, geom, { reduceMotion = false } = {}) {
    // Deliberately slow. A river seen from the bank barely moves, and an
    // earlier version of this read as a conveyor belt.
    function tracers(top, rh, t) {
        const width = geom.width();
        ctx.strokeStyle = rgba(palette.surf, palette.light ? 0.5 : 0.42);
        ctx.lineWidth = 1.1;
        ctx.lineCap = 'round';
        for (let i = 0; i < 26; i += 1) {
            const lane = (i % 5) / 5;
            const speed = 0.006 + lane * 0.004;
            const fx = ((hash(i) * 1.6 + t * speed) % 1.6) * (width + 200) - 100;
            const fy = top + rh * (0.16 + lane * 0.66) + Math.sin(i) * 3;
            const len = 12 + hash(i + 31) * 26;
            ctx.beginPath();
            ctx.moveTo(fx, fy);
            ctx.lineTo(fx + len, fy);
            ctx.stroke();
        }
    }

    function station(index, t, scrollY) {
        const width = geom.width();
        const height = geom.height();
        const top = geom.riverTopOf(index, scrollY);
        const rh = geom.riverH();
        if (top > height + 40 || top + rh < -40) return;

        // body
        const body = ctx.createLinearGradient(0, top, 0, top + rh);
        body.addColorStop(0, rgba(palette.waterTint, palette.light ? 0.55 : 0.42));
        body.addColorStop(1, rgba(palette.water, 1));
        ctx.fillStyle = body;
        ctx.fillRect(0, top, width, rh);

        // waterline
        ctx.strokeStyle = rgba(palette.surf, palette.light ? 0.75 : 0.6);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let x = 0; x <= width; x += 6) {
            const y = top + Math.sin(x * 0.011 + index * 1.7) * 1.4;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Under reduced motion the tracers still draw, frozen at t = 0. Water
        // with no surface texture at all stops reading as water.
        tracers(top, rh, reduceMotion ? 0 : t);

        // Near bank, down to the bottom of the frame.
        const bank = ctx.createLinearGradient(
            0,
            top + rh,
            0,
            Math.min(height, top + rh + height * 0.5)
        );
        bank.addColorStop(0, rgba(palette.ground, 1));
        bank.addColorStop(1, rgba(palette.ground2, 1));
        ctx.fillStyle = bank;
        ctx.fillRect(0, top + rh, width, Math.max(0, height - top - rh) + 4);
    }

    return { station };
}
