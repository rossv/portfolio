// The iron crucible at the head of the molten river.
//
// It stands upright at the very top of the page and tips as you scroll away from
// it, pouring the river it feeds. The pour is scrubbed by scroll rather than
// played on a timer, so it is the reader who tips it — scroll back up and the
// ladle rights itself and the iron drains away.
//
// Drawn as a 2.5D vessel: an elliptical rim, a shaded barrel, trunnions on a
// yoke, and a pouring lip that swings as it goes over.

import { rgba, clamp, smooth, hash } from './palette';

export const POUR_SCROLL = 620;   // px of scroll from the top to a full pour

export function createCrucible(ctx, palette, lattice) {
    // Local frame: the vessel is drawn in screen space around its anchor, with
    // vertical straight up as isometric requires.
    function frame(anchor, scrollY, t, reduceMotion) {
        const [ax, ay] = anchor;
        const cell = lattice.cell();
        const R = cell * 1.7;                      // rim radius
        const H = cell * 1.85;                     // barrel height
        const tip = smooth(clamp(scrollY / POUR_SCROLL, 0, 1));
        const angle = tip * 1.15;                  // radians, toward the river

        ctx.save();
        ctx.translate(ax, ay - H * 1.5);
        ctx.rotate(angle);

        // yoke arms and trunnions, which stay with the vessel as it rotates
        ctx.strokeStyle = rgba(palette.steel, 0.85);
        ctx.lineWidth = Math.max(2, cell * 0.09);
        ctx.beginPath();
        ctx.moveTo(-R * 1.25, -H * 0.1);
        ctx.lineTo(-R * 1.25, -H * 0.75);
        ctx.moveTo(R * 1.25, -H * 0.1);
        ctx.lineTo(R * 1.25, -H * 0.75);
        ctx.stroke();

        // the barrel: a tapered body with a lit near face and a dark far face
        const body = ctx.createLinearGradient(-R, 0, R, 0);
        body.addColorStop(0, rgba(palette.steel, 0.45));
        body.addColorStop(0.42, rgba(palette.structure, 0.62));
        body.addColorStop(1, rgba(palette.steel, 0.32));
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.lineTo(-R * 0.78, H);
        ctx.lineTo(R * 0.78, H);
        ctx.lineTo(R, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(palette.steel, 0.75);
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // banding hoops, and the rivets along them
        ctx.strokeStyle = rgba(palette.steel, 0.5);
        ctx.lineWidth = 1.3;
        for (const f of [0.28, 0.58, 0.86]) {
            const halfW = R * (1 - 0.22 * f);
            ctx.beginPath();
            ctx.moveTo(-halfW, H * f);
            ctx.lineTo(halfW, H * f);
            ctx.stroke();
            ctx.fillStyle = rgba(palette.structure, 0.35);
            for (let i = -3; i <= 3; i += 1) {
                ctx.beginPath();
                ctx.arc((halfW * i) / 3.6, H * f, Math.max(0.9, cell * 0.035), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // the pouring lip, cut into the rim on the side it tips toward
        ctx.fillStyle = rgba(palette.steel, 0.8);
        ctx.beginPath();
        ctx.moveTo(R * 0.62, -R * 0.1);
        ctx.lineTo(R * 1.12, -R * 0.3);
        ctx.lineTo(R * 1.12, R * 0.06);
        ctx.lineTo(R * 0.66, R * 0.12);
        ctx.closePath();
        ctx.fill();

        // the rim, and the iron still inside it
        ctx.fillStyle = rgba(palette.steel, 0.7);
        ctx.beginPath();
        ctx.ellipse(0, 0, R, R * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        const left = 1 - tip;
        if (left > 0.02) {
            ctx.fillStyle = rgba(palette.hotter, 0.85);
            ctx.beginPath();
            ctx.ellipse(0, R * 0.06, R * 0.82 * (0.5 + left * 0.5), R * 0.26 * left, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // trunnion pins, drawn over the rim so they read as in front
        ctx.fillStyle = rgba(palette.structure, 0.8);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.ellipse(s * R * 1.02, -H * 0.02, cell * 0.1, cell * 0.1, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        // The stream, drawn unrotated: it leaves the lip and falls to the head of
        // the river. It only exists while the ladle is actually over.
        if (tip > 0.06) {
            const lipX = ax + Math.sin(angle) * (H * 1.5) + Math.cos(angle) * R * 0.9;
            const lipY = ay - H * 1.5 + Math.cos(angle) * (H * 0.0) + Math.sin(angle) * R * 0.9;
            const width = cell * 0.16 * smooth(clamp((tip - 0.06) / 0.3, 0, 1));
            const stream = ctx.createLinearGradient(lipX, lipY, ax, ay);
            stream.addColorStop(0, rgba(palette.molten, 0.95));
            stream.addColorStop(0.6, rgba(palette.hotter, 0.9));
            stream.addColorStop(1, rgba(palette.hot, 0.75));
            ctx.strokeStyle = stream;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lipX, lipY);
            ctx.quadraticCurveTo(lipX + (ax - lipX) * 0.4, (lipY + ay) / 2, ax, ay);
            ctx.stroke();

            // splash where it lands, and a little glow off the pour
            const glow = ctx.createRadialGradient(ax, ay, 0, ax, ay, cell * 1.6);
            glow.addColorStop(0, rgba(palette.glow, 0.32 * tip));
            glow.addColorStop(1, rgba(palette.glow, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(ax, ay, cell * 1.6, 0, Math.PI * 2);
            ctx.fill();

            if (!reduceMotion) {
                for (let i = 0; i < 7; i += 1) {
                    const age = ((t * 0.0012 + hash(i * 5)) % 1);
                    const spread = (hash(i) - 0.5) * cell * 1.5 * age;
                    const rise = -Math.sin(age * Math.PI) * cell * 0.6;
                    ctx.fillStyle = rgba(palette.molten, (1 - age) * 0.7 * tip);
                    ctx.beginPath();
                    ctx.arc(ax + spread, ay + rise, cell * 0.05 * (1 - age) + 0.6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        return tip;
    }

    return { frame };
}
