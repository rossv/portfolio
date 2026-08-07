// The fountain at the confluence.
//
// Point State Park's fountain stands where the two rivers meet, so this one
// stands where these two meet. Drawn as a 2.5D basin — an elliptical bowl with a
// rim and an inner water surface — carrying a tall central column and a ring of
// arcing side jets, the way the real one does.
//
// The plume is the brightest thing in the valley. That is deliberate: it marks
// the one place on the page where the iron meets the water.

import { rgba, clamp, smooth, hash } from './palette';

export function createFountain(ctx, palette, lattice) {
    function frame(centre, t, g, reduceMotion) {
        const [cx, cy] = centre;
        const cell = lattice.cell();
        const R = cell * 1.9;             // basin radius across the screen
        const ry = R * 0.42;              // and its isometric depth
        const pulse = reduceMotion ? 1 : 0.88 + 0.12 * Math.sin(t * 0.0011);

        // basin: outer rim, a shaded wall, then the water inside it
        ctx.fillStyle = rgba(palette.steel, 0.30 * g);
        ctx.beginPath();
        ctx.ellipse(cx, cy + cell * 0.16, R, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(palette.plate, 0.95 * g);
        ctx.beginPath();
        ctx.ellipse(cx, cy, R, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(palette.structure, 0.42 * g);
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.fillStyle = rgba(palette.waterLit, 0.55 * g);
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * 0.82, ry * 0.78, 0, 0, Math.PI * 2);
        ctx.fill();

        // the column: widest at the base, falling away to nothing at the top
        const jet = cell * 3.4 * pulse;
        const col = ctx.createLinearGradient(0, cy - jet, 0, cy);
        col.addColorStop(0, rgba(palette.crown, 0));
        col.addColorStop(0.42, rgba(palette.crown, 0.34 * g));
        col.addColorStop(1, rgba(palette.crown, 0.86 * g));
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(cx - cell * 0.30, cy);
        ctx.quadraticCurveTo(cx - cell * 0.34, cy - jet * 0.55, cx - cell * 0.06, cy - jet);
        ctx.quadraticCurveTo(cx, cy - jet * 1.04, cx + cell * 0.06, cy - jet);
        ctx.quadraticCurveTo(cx + cell * 0.34, cy - jet * 0.55, cx + cell * 0.30, cy);
        ctx.closePath();
        ctx.fill();

        // spray breaking off the top
        if (!reduceMotion) {
            for (let i = 0; i < 14; i += 1) {
                const age = ((t * 0.00035 + hash(i * 7)) % 1);
                const spread = age * R * 0.9 * (hash(i + 21) - 0.5) * 2;
                const y = cy - jet * (0.66 + age * 0.42);
                ctx.fillStyle = rgba(palette.crown, (1 - age) * 0.42 * g);
                ctx.beginPath();
                ctx.arc(cx + spread, y, cell * 0.05 * (1 - age) + 0.7, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // the ring of side jets, arcing out and back into the basin
        ctx.strokeStyle = rgba(palette.crown, 0.4 * g);
        ctx.lineWidth = 1.5;
        for (let i = -3; i <= 3; i += 1) {
            if (!i) continue;
            const reach = (R * 0.3) * Math.abs(i);
            const dir = Math.sign(i);
            ctx.beginPath();
            ctx.moveTo(cx, cy - cell * 0.18);
            ctx.quadraticCurveTo(
                cx + reach * 0.62 * dir,
                cy - (cell * 1.1 + Math.abs(i) * cell * 0.22) * pulse,
                cx + reach * dir,
                cy + ry * 0.28,
            );
            ctx.stroke();
        }

        // where the iron arrives, the basin glows and steam lifts off it
        const heat = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.5);
        heat.addColorStop(0, rgba(palette.glow, 0.20 * g));
        heat.addColorStop(1, rgba(palette.glow, 0));
        ctx.fillStyle = heat;
        ctx.beginPath();
        ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
        ctx.fill();

        if (!reduceMotion) {
            for (let i = 0; i < 8; i += 1) {
                const age = ((t * 0.00022 + hash(i * 11 + 3)) % 1);
                const sx = cx + (hash(i + 4) - 0.5) * R * 1.2 + age * R * 0.3;
                const sy = cy - age * cell * 3.2;
                const rad = cell * (0.3 + age * 1.1);
                const puff = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
                puff.addColorStop(0, rgba(palette.light ? palette.crown : palette.steel, (1 - age) * 0.16 * g));
                puff.addColorStop(1, rgba(palette.steel, 0));
                ctx.fillStyle = puff;
                ctx.beginPath();
                ctx.arc(sx, sy, rad, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    return { frame };
}
