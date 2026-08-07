// The iron ladle at the head of the molten river.
//
// It hangs in a yoke beside the expertise section and tips as you scroll it up
// the viewport, pouring the river it feeds. The pour is scrubbed by scroll
// rather than played on a timer, so it is the reader who tips it — scroll back
// and the ladle rights itself and the iron drains away.
//
// The yoke does not rotate; the vessel rotates inside it, on its trunnions.
// That is how a real ladle works and it is most of why this reads as a machine
// rather than as a tipping cup.

import { rgba, clamp, smooth, hash } from './palette';

// Where in the viewport the tip begins and ends, as fractions of its height.
// The ladle tips as it climbs the screen, so scrolling is what pours it.
const TIP_START = 0.78;
const TIP_END = 0.34;

const MAX_ANGLE = 1.95;   // radians at a full pour

// How far over the ladle is, for a given screen height. The scene needs this
// before it draws the rivers — the pour is what reveals the iron — and the
// ladle needs the same number, so it lives here and both read it.
export const tipFor = (anchorY, viewportH) => smooth(clamp(
    (TIP_START * viewportH - anchorY) / ((TIP_START - TIP_END) * viewportH),
    0, 1,
));

export function createCrucible(ctx, palette, lattice) {
    // An isometric ellipse: the ground plane is squashed to 0.42 vertically.
    const disc = (cx, cy, r, squash = 0.42) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * squash, 0, 0, Math.PI * 2);
    };

    function frame(anchor, t, tip, reduceMotion) {
        const [ax, ay] = anchor;
        const S = lattice.cell();
        const angle = tip * MAX_ANGLE;

        const R = S * 1.55;          // rim radius
        const H = S * 1.9;           // barrel height
        // The pivot sits above the landing point; the vessel hangs from it.
        const px = ax - S * 1.5;
        const py = ay - H * 1.35;

        /* ---- the yoke, which does not rotate ---- */
        ctx.strokeStyle = rgba(palette.steel, 0.9);
        ctx.lineWidth = Math.max(2.4, S * 0.13);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(px - R * 1.32, py + S * 0.5);
        ctx.lineTo(px - R * 1.32, py - H * 0.72);
        ctx.lineTo(px + R * 1.32, py - H * 0.72);
        ctx.lineTo(px + R * 1.32, py + S * 0.5);
        ctx.stroke();
        // lifting eye
        ctx.lineWidth = Math.max(2, S * 0.1);
        ctx.beginPath();
        ctx.arc(px, py - H * 0.72 - S * 0.34, S * 0.32, Math.PI * 0.1, Math.PI * 0.9, true);
        ctx.stroke();
        ctx.strokeStyle = rgba(palette.structure, 0.5);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(px - R * 1.32, py - H * 0.72);
        ctx.lineTo(px + R * 1.32, py - H * 0.72);
        ctx.stroke();

        /* ---- the vessel, which does ---- */
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);

        const bottomR = R * 0.74;
        // Shell, shaded across its width so the barrel reads as round.
        const shell = ctx.createLinearGradient(-R, 0, R, 0);
        shell.addColorStop(0, rgba(palette.steel, 0.5));
        shell.addColorStop(0.28, rgba(palette.structure, 0.72));
        shell.addColorStop(0.52, rgba(palette.structure, 0.5));
        shell.addColorStop(1, rgba(palette.steel, 0.3));
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.lineTo(-bottomR, H * 0.82);
        // rounded belly
        ctx.quadraticCurveTo(0, H * 1.16, bottomR, H * 0.82);
        ctx.lineTo(R, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(palette.steel, 0.85);
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // A darker seam down the far side, which sells the curvature.
        ctx.strokeStyle = rgba(palette.ground, 0.35);
        ctx.lineWidth = S * 0.14;
        ctx.beginPath();
        ctx.moveTo(R * 0.72, H * 0.06);
        ctx.quadraticCurveTo(R * 0.6, H * 0.6, bottomR * 0.72, H * 0.9);
        ctx.stroke();

        // Hoops with rivets.
        for (const f of [0.24, 0.52, 0.78]) {
            const halfW = R + (bottomR - R) * f;
            ctx.strokeStyle = rgba(palette.steel, 0.62);
            ctx.lineWidth = Math.max(1.6, S * 0.07);
            ctx.beginPath();
            ctx.moveTo(-halfW, H * f);
            ctx.lineTo(halfW, H * f);
            ctx.stroke();
            ctx.fillStyle = rgba(palette.structure, 0.42);
            for (let i = -3; i <= 3; i += 1) {
                ctx.beginPath();
                ctx.arc((halfW * i) / 3.5, H * f, Math.max(1, S * 0.032), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Trunnion bosses, on the pivot line.
        ctx.fillStyle = rgba(palette.steel, 0.95);
        for (const s of [-1, 1]) {
            disc(s * R * 1.04, 0, S * 0.2, 1);
            ctx.fill();
            ctx.fillStyle = rgba(palette.structure, 0.6);
            disc(s * R * 1.04, 0, S * 0.09, 1);
            ctx.fill();
            ctx.fillStyle = rgba(palette.steel, 0.95);
        }

        // Rim: the steel lip, then the refractory lining inside it.
        ctx.fillStyle = rgba(palette.steel, 0.8);
        disc(0, 0, R);
        ctx.fill();
        ctx.fillStyle = rgba(palette.plate, 0.95);
        disc(0, 0, R * 0.86);
        ctx.fill();

        // The iron still in it, draining as the ladle goes over. The surface
        // stays level in the world, so it climbs the wall as the vessel turns.
        const left = 1 - tip;
        if (left > 0.03) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, R * 0.86, R * 0.86 * 0.42, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.rotate(-angle);
            const bath = ctx.createLinearGradient(0, -R * 0.4, 0, R * 0.4);
            bath.addColorStop(0, rgba(palette.molten, 0.95));
            bath.addColorStop(1, rgba(palette.hotter, 0.9));
            ctx.fillStyle = bath;
            ctx.fillRect(-R * 1.4, R * 0.34 - R * 0.9 * left, R * 2.8, R * 2);
            ctx.restore();
        }

        // Heat off the mouth.
        const mouth = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.5);
        mouth.addColorStop(0, rgba(palette.glow, 0.3 * (0.35 + left * 0.65)));
        mouth.addColorStop(1, rgba(palette.glow, 0));
        ctx.fillStyle = mouth;
        disc(0, 0, R * 1.5, 0.7);
        ctx.fill();

        ctx.restore();

        /* ---- the stream ---- */
        if (tip > 0.08) {
            // The lip is the rim's edge, carried round by the rotation.
            const lipX = px + Math.cos(angle) * R;
            const lipY = py + Math.sin(angle) * R;
            const w = S * 0.19 * smooth(clamp((tip - 0.08) / 0.28, 0, 1));
            const stream = ctx.createLinearGradient(lipX, lipY, ax, ay);
            stream.addColorStop(0, rgba(palette.molten, 0.95));
            stream.addColorStop(0.55, rgba(palette.hotter, 0.9));
            stream.addColorStop(1, rgba(palette.hot, 0.8));
            ctx.strokeStyle = stream;
            ctx.lineWidth = w;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(lipX, lipY);
            // Falls away from the lip, then straightens under gravity.
            ctx.bezierCurveTo(
                lipX + (ax - lipX) * 0.28, lipY + (ay - lipY) * 0.08,
                ax - (ax - lipX) * 0.12, lipY + (ay - lipY) * 0.62,
                ax, ay,
            );
            ctx.stroke();

            // Where it lands: a pool of light, and iron thrown back up.
            const pool = ctx.createRadialGradient(ax, ay, 0, ax, ay, S * 2.1);
            pool.addColorStop(0, rgba(palette.glow, 0.34 * tip));
            pool.addColorStop(1, rgba(palette.glow, 0));
            ctx.fillStyle = pool;
            disc(ax, ay, S * 2.1, 0.6);
            ctx.fill();

            if (!reduceMotion) {
                for (let i = 0; i < 10; i += 1) {
                    const age = ((t * 0.0013 + hash(i * 5)) % 1);
                    const dir = hash(i) < 0.5 ? -1 : 1;
                    const sx = ax + dir * age * S * (0.7 + hash(i + 3) * 1.5);
                    const sy = ay - Math.sin(age * Math.PI) * S * (0.5 + hash(i + 9));
                    ctx.fillStyle = rgba(age > 0.6 ? palette.hot : palette.molten, (1 - age) * 0.85 * tip);
                    ctx.beginPath();
                    ctx.arc(sx, sy, S * 0.055 * (1 - age) + 0.7, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        return tip;
    }

    return { frame };
}
