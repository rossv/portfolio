// The fountain at the Point.
//
// Where the Allegheny and the Monongahela meet there is a fountain, so there is
// one here. Built as a real isometric object rather than a symbol: a paved
// plaza, a stepped basin with a rim you can see the thickness of, a water
// surface with ripples running out from the centre, a tall tapered column, and
// a ring of side jets.
//
// The ring is drawn in two halves — the jets behind the column first, then the
// column, then the jets in front. That ordering is what makes it a ring you are
// looking into rather than a fan pasted on top.

import { rgba, clamp, smooth, hash } from './palette';

const SQUASH = 0.42;   // the isometric foreshortening of the ground plane
const JETS = 10;

export function createFountain(ctx, palette, lattice) {
    const disc = (cx, cy, r, squash = SQUASH) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * squash, 0, 0, Math.PI * 2);
    };

    // One side jet: leaves the ring, arcs up and inward, falls back to the water.
    function jet(cx, cy, R, theta, reach, g, pulse) {
        const bx = cx + Math.cos(theta) * R * 0.72;
        const by = cy + Math.sin(theta) * R * 0.72 * SQUASH;
        // Jets at the front of the ring are nearer, so they read a little larger.
        const near = 0.72 + 0.28 * (Math.sin(theta) * 0.5 + 0.5);
        const apex = reach * pulse * near;
        ctx.strokeStyle = rgba(palette.crown, 0.34 * near * g);
        ctx.lineWidth = 1.2 + near * 0.9;
        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.quadraticCurveTo(
            (bx + cx) / 2, by - apex,
            cx + Math.cos(theta) * R * 0.16,
            cy + Math.sin(theta) * R * 0.16 * SQUASH - apex * 0.06,
        );
        ctx.stroke();
    }

    function frame(centre, t, g, reduceMotion) {
        const [cx, cy] = centre;
        const S = lattice.cell();
        const R = S * 2.3;
        const pulse = reduceMotion ? 1 : 0.9 + 0.1 * Math.sin(t * 0.0011);

        /* ---- plaza and basin ---- */
        ctx.fillStyle = rgba(palette.plate, 0.55 * g);
        disc(cx, cy, R * 1.5);
        ctx.fill();

        // The rim has thickness: a lower ellipse, then the top face over it.
        ctx.fillStyle = rgba(palette.steel, 0.28 * g);
        disc(cx, cy + S * 0.22, R);
        ctx.fill();
        ctx.fillStyle = rgba(palette.plate, 0.98 * g);
        disc(cx, cy, R);
        ctx.fill();
        ctx.strokeStyle = rgba(palette.structure, 0.4 * g);
        ctx.lineWidth = 1.6;
        disc(cx, cy, R);
        ctx.stroke();
        // inner step
        ctx.strokeStyle = rgba(palette.structure, 0.22 * g);
        ctx.lineWidth = 1.1;
        disc(cx, cy, R * 0.88);
        ctx.stroke();

        /* ---- the water in the basin ---- */
        const pool = ctx.createLinearGradient(cx, cy - R * SQUASH, cx, cy + R * SQUASH);
        pool.addColorStop(0, rgba(palette.water, 0.98 * g));
        pool.addColorStop(1, rgba(palette.waterLit, 0.72 * g));
        ctx.fillStyle = pool;
        disc(cx, cy, R * 0.82);
        ctx.fill();

        // Ripples running out from where the column lands.
        ctx.strokeStyle = rgba(palette.surf, 0.3 * g);
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 3; i += 1) {
            const age = reduceMotion ? 0.4 + i * 0.2 : ((t * 0.00035 + i / 3) % 1);
            ctx.globalAlpha = (1 - age) * 0.8;
            disc(cx, cy, R * 0.18 + age * R * 0.62);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        /* ---- the ring, behind ---- */
        const reach = S * 2.6;
        for (let i = 0; i < JETS; i += 1) {
            const theta = (i / JETS) * Math.PI * 2;
            if (Math.sin(theta) > 0) continue;          // front half comes later
            jet(cx, cy, R, theta, reach, g, pulse);
        }

        /* ---- the column ---- */
        const jetH = S * 4.6 * pulse;
        const col = ctx.createLinearGradient(cx, cy - jetH, cx, cy);
        col.addColorStop(0, rgba(palette.crown, 0));
        col.addColorStop(0.3, rgba(palette.crown, 0.3 * g));
        col.addColorStop(0.75, rgba(palette.crown, 0.66 * g));
        col.addColorStop(1, rgba(palette.crown, 0.9 * g));
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(cx - S * 0.42, cy);
        ctx.quadraticCurveTo(cx - S * 0.44, cy - jetH * 0.5, cx - S * 0.1, cy - jetH);
        ctx.quadraticCurveTo(cx, cy - jetH * 1.06, cx + S * 0.1, cy - jetH);
        ctx.quadraticCurveTo(cx + S * 0.44, cy - jetH * 0.5, cx + S * 0.42, cy);
        ctx.closePath();
        ctx.fill();

        // A brighter core inside it, narrower and shorter.
        const core = ctx.createLinearGradient(cx, cy - jetH * 0.86, cx, cy);
        core.addColorStop(0, rgba(palette.crown, 0));
        core.addColorStop(1, rgba(palette.crown, 0.55 * g));
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.moveTo(cx - S * 0.15, cy);
        ctx.quadraticCurveTo(cx - S * 0.1, cy - jetH * 0.6, cx, cy - jetH * 0.86);
        ctx.quadraticCurveTo(cx + S * 0.1, cy - jetH * 0.6, cx + S * 0.15, cy);
        ctx.closePath();
        ctx.fill();

        // The crown breaking off the top.
        if (!reduceMotion) {
            for (let i = 0; i < 18; i += 1) {
                const age = ((t * 0.0004 + hash(i * 7)) % 1);
                const spread = age * R * 0.85 * (hash(i + 21) - 0.5) * 2;
                const y = cy - jetH * (0.72 + age * 0.4);
                ctx.fillStyle = rgba(palette.crown, (1 - age) * 0.5 * g);
                ctx.beginPath();
                ctx.arc(cx + spread, y, S * 0.06 * (1 - age) + 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        /* ---- the ring, in front ---- */
        for (let i = 0; i < JETS; i += 1) {
            const theta = (i / JETS) * Math.PI * 2;
            if (Math.sin(theta) <= 0) continue;
            jet(cx, cy, R, theta, reach, g, pulse);
        }

        // Mist over the basin, which softens the foot of the column.
        if (!reduceMotion) {
            for (let i = 0; i < 7; i += 1) {
                const age = ((t * 0.00026 + hash(i * 11 + 3)) % 1);
                const sx = cx + (hash(i + 4) - 0.5) * R * 1.3;
                const sy = cy - age * S * 1.6;
                const rad = S * (0.5 + age * 1.4);
                const puff = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
                puff.addColorStop(0, rgba(palette.crown, (1 - age) * 0.12 * g));
                puff.addColorStop(1, rgba(palette.crown, 0));
                ctx.fillStyle = puff;
                ctx.beginPath();
                ctx.arc(sx, sy, rad, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    return { frame };
}
