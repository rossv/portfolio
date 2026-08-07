// What a miss looks like.
//
// Clicking a river throws a bridge across it. Clicking anywhere else throws a
// gout of molten iron at the ground instead: heavy droplets that arc and cool as
// they fall, and thin sparks that fly further and burn out faster.
//
// Two populations rather than one, because that difference — heavy and slow
// against light and quick — is what reads as molten metal rather than confetti.

import { rgba, hash } from './palette';

const CAP = 220;

export function createSplash(ctx, palette, { reduceMotion = false } = {}) {
    const bits = [];

    function burst(x, y) {
        if (reduceMotion) return;
        // droplets
        for (let i = 0; i < 16; i += 1) {
            const a = -Math.PI / 2 + (hash(i * 3) - 0.5) * 2.3;
            const speed = 1.4 + hash(i + 7) * 3.4;
            bits.push({
                x, y,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed,
                life: 0,
                max: 46 + hash(i + 11) * 34,
                size: 1.5 + hash(i + 19) * 2.2,
                drop: true,
            });
        }
        // sparks
        for (let i = 0; i < 22; i += 1) {
            const a = Math.random() * Math.PI * 2;
            const speed = 2.6 + Math.random() * 5.2;
            bits.push({
                x, y,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed - 1.1,
                life: 0,
                max: 20 + Math.random() * 22,
                size: 0.8 + Math.random() * 0.9,
                drop: false,
            });
        }
        if (bits.length > CAP) bits.splice(0, bits.length - CAP);
    }

    function frame() {
        for (let i = bits.length - 1; i >= 0; i -= 1) {
            const b = bits[i];
            b.life += 1;
            if (b.life >= b.max) { bits.splice(i, 1); continue; }
            b.x += b.vx;
            b.y += b.vy;
            if (b.drop) {
                b.vx *= 0.985;
                b.vy = b.vy * 0.985 + 0.17;   // heavy: gravity wins quickly
            } else {
                b.vx *= 0.93;
                b.vy = b.vy * 0.93 + 0.09;    // light: air drag wins
            }
            const k = 1 - b.life / b.max;
            // Droplets cool as they fall: white through orange to a dull red.
            const colour = b.drop
                ? (k > 0.66 ? palette.molten : k > 0.33 ? palette.hotter : palette.hot)
                : palette.crown;
            ctx.fillStyle = rgba(colour, b.drop ? k : k * 0.9);
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size * (b.drop ? 0.4 + k * 0.6 : k), 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return { burst, frame, active: () => bits.length > 0 };
}
