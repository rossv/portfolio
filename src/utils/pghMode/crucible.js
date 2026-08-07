// The ladle at the head of the molten river.
//
// Built as mill equipment rather than as a vessel on its own: an overhead crane
// beam, hoist ropes down to a sheave block, a heavy hook into the bail, and the
// ladle hanging in its trunnions under all of it. Most of what makes a photo of
// a pour read as industrial is the gear above the ladle, not the ladle.
//
// The yoke and the rigging do not rotate. The vessel turns on its trunnions
// inside the bail, which is how the real thing works.
//
// Timing lives in the scene: it decides when the pour starts and hands the tip
// down. Nothing here is tied to scroll.

import { rgba, clamp, hash } from './palette';

export function createCrucible(ctx, palette, lattice) {
    const disc = (cx, cy, r, squash = 0.42) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * squash, 0, 0, Math.PI * 2);
    };

    const MAX_ANGLE = 2.05;

    function frame(anchor, t, tip, reduceMotion) {
        const [ax, ay] = anchor;
        const S = lattice.cell();
        const R = S * 2.25;          // rim radius
        const H = S * 2.85;          // barrel height
        const angle = tip * MAX_ANGLE;

        // Pivot: the trunnion line. The ladle hangs above and left of where the
        // iron lands, and tips toward it.
        const px = ax - S * 2.6;
        const py = ay - H * 1.5;
        const beamY = py - H * 1.5;

        /* ---------- the crane above ---------- */
        // main girder, with a lit top flange and a dark web beneath
        const halfBeam = R * 3.1;
        ctx.fillStyle = rgba(palette.steel, 0.5);
        ctx.fillRect(px - halfBeam, beamY, halfBeam * 2, S * 0.62);
        ctx.fillStyle = rgba(palette.structure, 0.34);
        ctx.fillRect(px - halfBeam, beamY, halfBeam * 2, S * 0.16);
        ctx.fillStyle = rgba(palette.ground, 0.34);
        ctx.fillRect(px - halfBeam, beamY + S * 0.46, halfBeam * 2, S * 0.16);
        // web stiffeners
        ctx.strokeStyle = rgba(palette.ground, 0.4);
        ctx.lineWidth = 1.4;
        for (let i = -5; i <= 5; i += 1) {
            const x = px + (halfBeam * i) / 5.5;
            ctx.beginPath();
            ctx.moveTo(x, beamY + S * 0.1);
            ctx.lineTo(x, beamY + S * 0.56);
            ctx.stroke();
        }
        // end trucks
        ctx.fillStyle = rgba(palette.steel, 0.42);
        for (const s of [-1, 1]) {
            ctx.fillRect(px + s * halfBeam - (s < 0 ? 0 : S * 0.5), beamY - S * 0.3, S * 0.5, S * 1.15);
        }

        /* ---------- hoist ropes and sheave block ---------- */
        const blockY = py - H * 0.62;
        ctx.strokeStyle = rgba(palette.steel, 0.62);
        ctx.lineWidth = Math.max(1, S * 0.035);
        for (let i = -3; i <= 3; i += 1) {
            if (!i) continue;
            ctx.beginPath();
            ctx.moveTo(px + i * S * 0.24, beamY + S * 0.62);
            ctx.lineTo(px + i * S * 0.1, blockY - S * 0.3);
            ctx.stroke();
        }
        // the block: a shackle plate carrying two sheaves
        ctx.fillStyle = rgba(palette.steel, 0.78);
        ctx.beginPath();
        ctx.roundRect?.(px - S * 0.62, blockY - S * 0.3, S * 1.24, S * 0.95, S * 0.22);
        if (!ctx.roundRect) ctx.rect(px - S * 0.62, blockY - S * 0.3, S * 1.24, S * 0.95);
        ctx.fill();
        ctx.fillStyle = rgba(palette.structure, 0.45);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(px + s * S * 0.26, blockY + S * 0.16, S * 0.24, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = rgba(palette.ground, 0.5);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(px + s * S * 0.26, blockY + S * 0.16, S * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }

        /* ---------- the hook, into the bail ---------- */
        ctx.strokeStyle = rgba(palette.steel, 0.9);
        ctx.lineWidth = Math.max(3, S * 0.2);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px, blockY + S * 0.62);
        ctx.lineTo(px, py - R * 0.72);
        ctx.stroke();
        // the hook's throat, curling back on itself
        ctx.lineWidth = Math.max(3.4, S * 0.24);
        ctx.beginPath();
        ctx.arc(px + S * 0.34, py - R * 0.5, S * 0.44, Math.PI * 1.06, Math.PI * 0.36, false);
        ctx.stroke();

        // the bail: a heavy ring across the trunnions, which does not rotate
        ctx.strokeStyle = rgba(palette.steel, 0.86);
        ctx.lineWidth = Math.max(2.6, S * 0.15);
        ctx.beginPath();
        ctx.moveTo(px - R * 1.06, py);
        ctx.lineTo(px - R * 1.06, py - R * 0.42);
        ctx.lineTo(px + R * 1.06, py - R * 0.42);
        ctx.lineTo(px + R * 1.06, py);
        ctx.stroke();

        /* ---------- the ladle ---------- */
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);

        const bottomR = R * 0.8;
        const shell = ctx.createLinearGradient(-R, 0, R, 0);
        shell.addColorStop(0, rgba(palette.steel, 0.55));
        shell.addColorStop(0.26, rgba(palette.structure, 0.7));
        shell.addColorStop(0.55, rgba(palette.structure, 0.44));
        shell.addColorStop(1, rgba(palette.steel, 0.28));
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.lineTo(-bottomR, H * 0.8);
        ctx.quadraticCurveTo(0, H * 1.18, bottomR, H * 0.8);
        ctx.lineTo(R, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(palette.steel, 0.9);
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // a heavy top collar, the thickest band on the vessel
        ctx.fillStyle = rgba(palette.steel, 0.72);
        ctx.fillRect(-R * 1.03, -S * 0.06, R * 2.06, S * 0.5);
        ctx.strokeStyle = rgba(palette.ground, 0.4);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-R * 1.03, -S * 0.06, R * 2.06, S * 0.5);

        // banding, riveted
        for (const f of [0.26, 0.5, 0.74]) {
            const halfW = R + (bottomR - R) * f;
            ctx.fillStyle = rgba(palette.steel, 0.55);
            ctx.fillRect(-halfW, H * f, halfW * 2, S * 0.3);
            ctx.strokeStyle = rgba(palette.ground, 0.35);
            ctx.lineWidth = 1;
            ctx.strokeRect(-halfW, H * f, halfW * 2, S * 0.3);
            ctx.fillStyle = rgba(palette.structure, 0.45);
            for (let i = -4; i <= 4; i += 1) {
                ctx.beginPath();
                ctx.arc((halfW * i) / 4.5, H * f + S * 0.15, Math.max(1, S * 0.036), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // shadowed seam down the far side
        ctx.strokeStyle = rgba(palette.ground, 0.32);
        ctx.lineWidth = S * 0.2;
        ctx.beginPath();
        ctx.moveTo(R * 0.74, H * 0.06);
        ctx.quadraticCurveTo(R * 0.62, H * 0.62, bottomR * 0.7, H * 0.92);
        ctx.stroke();

        // slag streaks: the wear that stops it looking new
        ctx.strokeStyle = rgba(palette.crust ?? palette.ground, 0.22);
        ctx.lineWidth = S * 0.09;
        for (let i = 0; i < 5; i += 1) {
            const x = -R * 0.7 + hash(i * 3) * R * 1.4;
            ctx.beginPath();
            ctx.moveTo(x, S * 0.5);
            ctx.lineTo(x + (hash(i + 6) - 0.5) * S * 0.3, S * 0.5 + hash(i + 2) * H * 0.5);
            ctx.stroke();
        }

        // trunnion bosses on the pivot line
        for (const s of [-1, 1]) {
            ctx.fillStyle = rgba(palette.steel, 0.95);
            ctx.beginPath();
            ctx.arc(s * R * 1.02, 0, S * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(palette.structure, 0.6);
            ctx.beginPath();
            ctx.arc(s * R * 1.02, 0, S * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        // rim and refractory lining
        ctx.fillStyle = rgba(palette.steel, 0.85);
        disc(0, 0, R);
        ctx.fill();
        ctx.fillStyle = rgba(palette.plate, 0.95);
        disc(0, 0, R * 0.85);
        ctx.fill();

        // the bath, its surface level in the world as the vessel turns
        const left = 1 - tip;
        if (left > 0.02) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 0.85, R * 0.85 * 0.42, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.rotate(-angle);
            const bath = ctx.createLinearGradient(0, -R * 0.4, 0, R * 0.4);
            bath.addColorStop(0, rgba(palette.molten, 0.98));
            bath.addColorStop(1, rgba(palette.hotter, 0.92));
            ctx.fillStyle = bath;
            ctx.fillRect(-R * 1.6, R * 0.32 - R * 0.86 * left, R * 3.2, R * 2.4);
            ctx.restore();
        }

        // glare off the mouth
        const mouth = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.7);
        mouth.addColorStop(0, rgba(palette.glow, 0.34 * (0.3 + left * 0.7)));
        mouth.addColorStop(1, rgba(palette.glow, 0));
        ctx.fillStyle = mouth;
        disc(0, 0, R * 1.7, 0.75);
        ctx.fill();

        ctx.restore();

        /* ---------- the stream ---------- */
        if (tip > 0.07) {
            const strength = clamp((tip - 0.07) / 0.25, 0, 1);
            const lipX = px + Math.cos(angle) * R;
            const lipY = py + Math.sin(angle) * R;

            // the flare around the whole pour
            const flare = ctx.createRadialGradient(
                (lipX + ax) / 2, (lipY + ay) / 2, 0,
                (lipX + ax) / 2, (lipY + ay) / 2, S * 4.5,
            );
            flare.addColorStop(0, rgba(palette.glow, 0.26 * strength));
            flare.addColorStop(1, rgba(palette.glow, 0));
            ctx.fillStyle = flare;
            ctx.beginPath();
            ctx.arc((lipX + ax) / 2, (lipY + ay) / 2, S * 4.5, 0, Math.PI * 2);
            ctx.fill();

            // The stream is a ribbon with a width profile, not a stroked arc.
            // Iron leaving a lip accelerates, and a falling stream has to thin as
            // it speeds up to carry the same iron — so it necks through the fall
            // and swells again where it piles into the ground. Three stacked
            // strokes of even width could not say any of that.
            const c0 = [lipX, lipY];
            const c1 = [lipX + (ax - lipX) * 0.3, lipY + (ay - lipY) * 0.06];
            const c2 = [ax - (ax - lipX) * 0.1, lipY + (ay - lipY) * 0.6];
            const c3 = [ax, ay];
            const at = (s) => {
                const m = 1 - s;
                return [
                    m * m * m * c0[0] + 3 * m * m * s * c1[0] + 3 * m * s * s * c2[0] + s * s * s * c3[0],
                    m * m * m * c0[1] + 3 * m * m * s * c1[1] + 3 * m * s * s * c2[1] + s * s * s * c3[1],
                ];
            };
            const w0 = S * 0.44 * strength;
            const widthAt = (s) => {
                const neck = w0 / Math.sqrt(1 + 2.8 * s);
                const swell = w0 * 0.6 * clamp((s - 0.76) / 0.24, 0, 1) ** 2;
                // A slow travelling undulation, so the column is never a static
                // arc: real iron ropes and wobbles on the way down.
                const flow = reduceMotion ? 1 : 1 + 0.14 * Math.sin(s * 8.5 - t * 0.005);
                return (neck + swell) * flow;
            };

            const STEPS = 34;
            const spine = [];
            for (let i = 0; i <= STEPS; i += 1) {
                const s = i / STEPS;
                const p = at(s);
                const q = at(Math.min(1, s + 0.01));
                const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
                spine.push({ s, p, n: [-(q[1] - p[1]) / len, (q[0] - p[0]) / len] });
            }
            const ribbon = (k) => {
                ctx.beginPath();
                spine.forEach(({ p, n, s }, i) => {
                    const w = widthAt(s) * k;
                    const x = p[0] + n[0] * w;
                    const y = p[1] + n[1] * w;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                });
                for (let i = spine.length - 1; i >= 0; i -= 1) {
                    const { p, n, s } = spine[i];
                    const w = widthAt(s) * k;
                    ctx.lineTo(p[0] - n[0] * w, p[1] - n[1] * w);
                }
                ctx.closePath();
            };

            // heat haze around the column
            ctx.fillStyle = rgba(palette.hot, 0.22);
            ribbon(1.75);
            ctx.fill();

            // the body, hottest where it is thinnest and fastest
            const body = ctx.createLinearGradient(lipX, lipY, ax, ay);
            body.addColorStop(0, rgba(palette.hotter, 0.96));
            body.addColorStop(0.45, rgba(palette.molten, 0.98));
            body.addColorStop(1, rgba(palette.hot, 0.94));
            ctx.fillStyle = body;
            ribbon(1);
            ctx.fill();

            // striations running down the inside, which is what reads as flow
            if (!reduceMotion) {
                ctx.lineWidth = Math.max(1, S * 0.035);
                for (let k = -1; k <= 1; k += 1) {
                    ctx.strokeStyle = rgba(palette.crown, 0.3 + Math.abs(k) * -0.12);
                    ctx.beginPath();
                    let started = false;
                    for (const { s, p, n } of spine) {
                        // each streak is a moving window down the column
                        const phase = (s * 2.4 - t * 0.0016 + k * 0.31) % 1;
                        if (phase < 0.08 || phase > 0.46) { started = false; continue; }
                        const off = widthAt(s) * k * 0.44;
                        const x = p[0] + n[0] * off;
                        const y = p[1] + n[1] * off;
                        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }

                // iron shedding off the edges on the way down
                for (let i = 0; i < 9; i += 1) {
                    const s = (hash(i * 13) + t * 0.0004) % 1;
                    const { p, n } = spine[Math.floor(s * STEPS)];
                    const side = hash(i) < 0.5 ? -1 : 1;
                    const drift = ((t * 0.0007 + hash(i + 2)) % 1);
                    const w = widthAt(s);
                    ctx.fillStyle = rgba(palette.hotter, (1 - drift) * 0.8);
                    ctx.beginPath();
                    ctx.arc(
                        p[0] + n[0] * side * (w + drift * S * 0.7),
                        p[1] + n[1] * side * (w * 0.4) + drift * S * 1.1,
                        S * 0.045 * (1 - drift) + 0.6, 0, Math.PI * 2,
                    );
                    ctx.fill();
                }
            }

            // the pool of light where it lands
            const pool = ctx.createRadialGradient(ax, ay, 0, ax, ay, S * 3.4);
            pool.addColorStop(0, rgba(palette.molten, 0.34 * strength));
            pool.addColorStop(0.35, rgba(palette.glow, 0.26 * strength));
            pool.addColorStop(1, rgba(palette.glow, 0));
            ctx.fillStyle = pool;
            disc(ax, ay, S * 3.4, 0.62);
            ctx.fill();

            // iron thrown back out of the impact, continuously
            if (!reduceMotion) {
                for (let i = 0; i < 22; i += 1) {
                    const age = ((t * 0.0016 + hash(i * 5)) % 1);
                    const dir = hash(i) < 0.5 ? -1 : 1;
                    const reach = S * (1 + hash(i + 3) * 2.6);
                    const sx = ax + dir * age * reach;
                    const sy = ay - Math.sin(age * Math.PI) * S * (0.9 + hash(i + 9) * 1.7);
                    ctx.fillStyle = rgba(
                        age > 0.62 ? palette.hot : age > 0.3 ? palette.hotter : palette.molten,
                        (1 - age) * 0.9 * strength,
                    );
                    ctx.beginPath();
                    ctx.arc(sx, sy, S * 0.07 * (1 - age) + 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    return { frame };
}
