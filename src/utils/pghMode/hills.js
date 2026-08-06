// Sky, ridges and background skyline for Pittsburgh mode.
//
// Pittsburgh is a plateau cut by rivers, so the far profile is a flat-topped
// ridge with valleys notched into it, not the row of triangles a generic
// mountain layer would give.
//
// Hills and skyline belong to a station, not to one global horizon. A global
// layer gets painted over by the first station's bank fill, which is what
// leaves dead flat expanses between rivers. Drawing them per station means
// every stretch of land has something standing on it, and each one still
// slides at its own rate against the water.

import { rgba, hash } from './palette';
import { DEPTH } from './stations';

const ridgeY = (x, seed, amp, base) =>
    base
    - Math.sin(x * 0.0016 + seed) * amp
    - Math.sin(x * 0.00071 + seed * 2.3) * amp * 0.8
    - Math.sin(x * 0.0034 + seed * 0.7) * amp * 0.22;

export function createHills(ctx, palette, geom) {
    function sky() {
        const height = geom.height();
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, palette.skyTop);
        gradient.addColorStop(1, palette.skyBot);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, geom.width(), height);
    }

    function ridge(base, seed, amp, hex, slide, scrollY) {
        const width = geom.width();
        const off = scrollY * slide;
        ctx.beginPath();
        ctx.moveTo(-6, base + 2);
        for (let x = -6; x <= width + 10; x += 8) {
            ctx.lineTo(x, ridgeY(x + off, seed, amp, base));
        }
        ctx.lineTo(width + 6, base + 2);
        ctx.closePath();
        ctx.fillStyle = rgba(hex, 1);
        ctx.fill();
    }

    // The buildings standing on the far bank. Windows only light on the dark
    // ground; on paper they would read as dirt.
    function skyline(base, seed, scrollY) {
        const width = geom.width();
        const off = scrollY * DEPTH.city;
        const span = width + 300;
        ctx.fillStyle = rgba(palette.ridgeNear, 1);
        for (let i = 0; i < 26; i += 1) {
            const bx = ((((i * 129.4 + seed * 57) - off) % span) + span) % span - 150;
            const bw = 20 + hash(i + seed) * 32;
            const bh = 24 + hash(i + seed + 90) * 96;
            ctx.fillRect(bx, base - bh, bw, bh + 6);
            if (!palette.light && hash(i + seed + 7) > 0.45) {
                ctx.fillStyle = rgba(palette.accent, 0.14);
                for (let k = 0; k < 5; k += 1) {
                    if (hash(i * 9 + k + seed) < 0.45) continue;
                    ctx.fillRect(
                        bx + 4 + (k % 2) * 9,
                        base - bh + 8 + Math.floor(k / 2) * 13,
                        3.5,
                        5
                    );
                }
                ctx.fillStyle = rgba(palette.ridgeNear, 1);
            }
        }
    }

    // One station's land: far ridge, near ridge, then its skyline.
    function station(index, scrollY) {
        const height = geom.height();
        const base = geom.riverTopOf(index, scrollY);
        if (base >= -40 && base <= height + 60) {
            ridge(base, 1.7 + index * 2.3, height * 0.115, palette.ridgeFar, DEPTH.hillFar, scrollY);
            ridge(base, 4.1 + index * 3.7, height * 0.070, palette.ridgeNear, DEPTH.hillNear, scrollY);
        }
        if (base >= -20 && base <= height + 40) {
            skyline(base, index * 13 + 3, scrollY);
        }
    }

    return { sky, station };
}
