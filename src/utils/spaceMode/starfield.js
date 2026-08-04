// Constellation starfield: a nebula ground, three-ish parallax depths via
// per-star factors, and a survey network that only assembles near the cursor.
//
// Clicking the sky places a star, which then joins the network like any other
// node and survives resizes.

import { rand } from './sprites';

// Exported so the caller's replay list can be held to the same length; past
// this the oldest placed star retires.
export const PLACED_CAP = 150;
const REACH = 320;        // cursor radius that recruits nodes
const LINK = 170;         // max distance between linked nodes

export function createStarfield(ctx, starSprites, palette) {
    const TINTS = palette.starTints;
    let stars = [];
    let width = 0;
    let height = 0;
    let nebula = null;
    let placedCount = 0;

    // Density follows viewport area. A flat count leaves a large display
    // looking nearly empty and a laptop looking busy.
    const areaScale = () => Math.max(0.55, Math.min(2.6, (width * height) / (1440 * 900)));

    const makeStar = () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: rand(0.6, 2.3),
        base: rand(0.3, 0.8),
        amp: rand(0.1, 0.3),
        phase: rand(0, Math.PI * 2),
        rate: rand(0.0006, 0.002),
        tint: Math.floor(Math.random() * TINTS.length),
        par: rand(0.06, 0.34),
    });

    // Rendered once at half resolution, then composited with one drawImage.
    function buildNebula() {
        const w = Math.max(320, Math.ceil(width / 2));
        const h = Math.max(240, Math.ceil(height / 2));
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const g = canvas.getContext('2d');

        for (const cl of palette.nebula) {
            const cx = cl.x * w;
            const cy = cl.y * h;
            const rr = cl.r * Math.max(w, h);
            const grad = g.createRadialGradient(cx, cy, 0, cx, cy, rr);
            grad.addColorStop(0, `rgba(${cl.c}, ${cl.a})`);
            grad.addColorStop(0.5, `rgba(${cl.c}, ${cl.a * 0.35})`);
            grad.addColorStop(1, `rgba(${cl.c}, 0)`);
            g.fillStyle = grad;
            g.fillRect(0, 0, w, h);
        }

        // Breaks the banding so the clouds read as dust rather than gradients.
        g.globalAlpha = 0.05;
        for (let i = 0; i < 900; i++) {
            g.fillStyle = i % 3 ? palette.dust[0] : palette.dust[1];
            g.fillRect(rand(0, w), rand(0, h), rand(1, 2.5), rand(1, 2.5));
        }
        g.globalAlpha = 1;
        nebula = canvas;
    }

    function resize(w, h) {
        width = w;
        height = h;
        buildNebula();
        // Anything the visitor placed outlives the rebuild.
        const kept = stars.filter((s) => s.placed);
        const count = Math.round(300 * areaScale());
        stars = Array.from({ length: count }, makeStar).concat(kept);
    }

    function place(x, y) {
        const placed = stars.filter((s) => s.placed);
        if (placed.length >= PLACED_CAP) {
            stars.splice(stars.indexOf(placed[0]), 1);
        }
        stars.push({
            x,
            y,
            r: rand(1.8, 2.9),
            base: rand(0.72, 0.95),
            amp: rand(0.05, 0.14),
            phase: rand(0, Math.PI * 2),
            rate: rand(0.0008, 0.0018),
            tint: palette.placedTint,   // violet, so a placed star reads as yours
            par: 0.02,          // barely parallaxed, so it stays put
            placed: true,
            born: performance.now(),
        });
        placedCount += 1;
        return placedCount;
    }

    function drawNebula(t, scrollDelta) {
        if (!nebula) return;
        const dx = Math.sin(t * 0.00004) * 26 - scrollDelta * 0.06;
        const dy = Math.cos(t * 0.00003) * 18 - scrollDelta * 0.10;
        ctx.globalAlpha = palette.nebulaAlpha;
        ctx.drawImage(nebula, dx, dy, width + 60, height + 60);
        ctx.globalAlpha = 1;
    }

    function frame(t, scrollDelta, mouse) {
        drawNebula(t, scrollDelta);

        const near = [];
        const now = performance.now();

        for (const s of stars) {
            s.y += 0.04 + scrollDelta * s.par;
            if (s.y > height + 20) {
                s.y -= height + 40;
                s.x = Math.random() * width;
            } else if (s.y < -20) {
                s.y += height + 40;
            }

            // Sine twinkle on a per-star phase and rate, so no two stars
            // pulse together the way a shared linear ramp made them.
            const a = Math.min(1, Math.max(0.05, s.base + s.amp * Math.sin(t * s.rate + s.phase)));

            ctx.globalAlpha = a * (s.placed ? 1 : palette.starGlow);
            const d = s.r * (s.placed ? 8 : 6);
            ctx.drawImage(starSprites[s.tint], s.x - d / 2, s.y - d / 2, d, d);
            ctx.globalAlpha = 1;

            ctx.fillStyle = TINTS[s.tint] + a + ')';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r * 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Birth flash for the first 700ms after placement.
            if (s.placed) {
                const age = (now - s.born) / 700;
                if (age < 1) {
                    const ease = 1 - (1 - age) ** 2;
                    ctx.strokeStyle = `rgba(${palette.node}, ${(1 - age) * 0.8})`;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, 6 + ease * 42, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }

            if (Math.abs(s.x - mouse.x) < REACH && Math.abs(s.y - mouse.y) < REACH) near.push(s);
        }

        // Only stars already near the cursor enter the pair loop, so this
        // stays cheap regardless of total star count.
        ctx.lineWidth = 0.9;
        for (let i = 0; i < near.length; i++) {
            const a = near[i];
            const da = Math.hypot(a.x - mouse.x, a.y - mouse.y);
            if (da > REACH) continue;
            const fade = 1 - da / REACH;

            ctx.strokeStyle = `rgba(${palette.link}, ${fade * 0.42})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            ctx.strokeStyle = `rgba(${palette.node}, ${fade * 0.55})`;
            ctx.beginPath();
            ctx.arc(a.x, a.y, 3.5 + a.r, 0, Math.PI * 2);
            ctx.stroke();

            for (let j = i + 1; j < near.length; j++) {
                const b = near[j];
                const dist = Math.hypot(a.x - b.x, a.y - b.y);
                if (dist > LINK) continue;
                const link = (1 - dist / LINK) * fade;
                ctx.strokeStyle = `rgba(${palette.node}, ${link * 0.85})`;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // A reticle, so the cursor reads as an instrument rather than a pointer.
        if (mouse.x > -1000) {
            const rr = Math.max(26, Math.min(width, height) * 0.028);
            ctx.strokeStyle = `rgba(${palette.link}, 0.5)`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(mouse.x, mouse.y, rr, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(mouse.x - rr * 1.35, mouse.y); ctx.lineTo(mouse.x - rr * 1.12, mouse.y);
            ctx.moveTo(mouse.x + rr * 1.12, mouse.y); ctx.lineTo(mouse.x + rr * 1.35, mouse.y);
            ctx.moveTo(mouse.x, mouse.y - rr * 1.35); ctx.lineTo(mouse.x, mouse.y - rr * 1.12);
            ctx.moveTo(mouse.x, mouse.y + rr * 1.12); ctx.lineTo(mouse.x, mouse.y + rr * 1.35);
            ctx.stroke();
        }
    }

    return { resize, place, frame, count: () => stars.length };
}
