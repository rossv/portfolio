// The mill around the ladle.
//
// A ladle on its own is an object; a ladle inside a bay of lattice columns, under
// a crane rail, over a refractory trough, is a place. This draws that bay: the
// structure the crane runs in, the walkway across it, the trough the iron lands
// in, and the haze and embers in the air.
//
// All of it is anchored to the same lattice cell as the ladle, so it drifts with
// the ground plane rather than sliding against it. It is drawn before the crane
// and the ladle, so they read as standing inside it.

import { rgba, hash, clamp } from './palette';

// The bay, in cell units relative to where the iron lands.
const LEFT = -19;
const RIGHT = 6;
const ROOF = -13.4;
const FLOOR = 3.6;

// Column centres. None sits at the pour, so nothing stands in front of it.
const COLUMNS = [-18, -12.5, -7.5, 3.5];

export function createMillHall(ctx, palette, lattice) {
    // A built-up lattice column: two flanges with X lacing between them, which
    // is what mill columns actually are and what reads as one at this size.
    function column(x, top, bottom, S, warmth) {
        const w = S * 0.62;
        ctx.strokeStyle = rgba(palette.steel, (0.34 + warmth * 0.18));
        ctx.lineWidth = Math.max(1.6, S * 0.1);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.moveTo(x + s * w * 0.5, top);
            ctx.lineTo(x + s * w * 0.5, bottom);
            ctx.stroke();
        }
        // lacing
        ctx.strokeStyle = rgba(palette.steel, 0.2 + warmth * 0.12);
        ctx.lineWidth = Math.max(1, S * 0.05);
        const step = S * 0.8;
        let up = true;
        for (let y = top; y < bottom - step; y += step) {
            ctx.beginPath();
            ctx.moveTo(x + (up ? -w * 0.5 : w * 0.5), y);
            ctx.lineTo(x + (up ? w * 0.5 : -w * 0.5), y + step);
            ctx.stroke();
            up = !up;
        }
        // base plate
        ctx.fillStyle = rgba(palette.steel, 0.3 + warmth * 0.15);
        ctx.fillRect(x - w, bottom - S * 0.18, w * 2, S * 0.24);
    }

    function frame(anchor, t, glow, reduceMotion) {
        const [ax, ay] = anchor;
        const S = lattice.cell();
        const x0 = ax + LEFT * S;
        const x1 = ax + RIGHT * S;
        const roofY = ay + ROOF * S;
        const floorY = ay + FLOOR * S;

        // Warmth: everything near the pour picks up its light. One number drives
        // every tone here, so the bay brightens as the iron runs.
        const warmth = clamp(glow, 0, 1);

        /* ---- the back of the bay ---- */
        // Panels between the columns, barely lighter than the ground, so the hall
        // has depth without becoming a second subject.
        for (let i = 0; i < COLUMNS.length - 1; i += 1) {
            const a = ax + COLUMNS[i] * S;
            const b = ax + COLUMNS[i + 1] * S;
            ctx.fillStyle = rgba(palette.plate, 0.5);
            ctx.fillRect(a, roofY + S * 0.6, b - a, floorY - roofY - S * 0.6);
        }

        /* ---- roof trusses ---- */
        ctx.strokeStyle = rgba(palette.steel, 0.22 + warmth * 0.1);
        ctx.lineWidth = Math.max(1.2, S * 0.06);
        ctx.beginPath();
        ctx.moveTo(x0, roofY);
        ctx.lineTo(x1, roofY);
        ctx.moveTo(x0, roofY + S * 0.9);
        ctx.lineTo(x1, roofY + S * 0.9);
        ctx.stroke();
        ctx.lineWidth = Math.max(1, S * 0.04);
        for (let x = x0; x < x1; x += S * 1.1) {
            ctx.beginPath();
            ctx.moveTo(x, roofY);
            ctx.lineTo(x + S * 0.55, roofY + S * 0.9);
            ctx.lineTo(x + S * 1.1, roofY);
            ctx.stroke();
        }

        /* ---- columns ---- */
        for (const c of COLUMNS) column(ax + c * S, roofY + S * 0.9, floorY, S, warmth);

        /* ---- the walkway across the bay ---- */
        const walkY = ay - S * 1.6;
        ctx.strokeStyle = rgba(palette.steel, 0.3 + warmth * 0.14);
        ctx.lineWidth = Math.max(1.4, S * 0.07);
        ctx.beginPath();
        ctx.moveTo(x0, walkY);
        ctx.lineTo(ax - S * 4.4, walkY);
        ctx.moveTo(ax + S * 1.2, walkY);
        ctx.lineTo(x1, walkY);
        ctx.stroke();
        // handrail and stanchions, on the runs either side of the pour
        ctx.lineWidth = Math.max(1, S * 0.04);
        ctx.strokeStyle = rgba(palette.steel, 0.2 + warmth * 0.1);
        ctx.beginPath();
        ctx.moveTo(x0, walkY - S * 0.55);
        ctx.lineTo(ax - S * 4.4, walkY - S * 0.55);
        ctx.moveTo(ax + S * 1.2, walkY - S * 0.55);
        ctx.lineTo(x1, walkY - S * 0.55);
        ctx.stroke();
        for (let x = x0; x < x1; x += S * 1.6) {
            if (x > ax - S * 4.6 && x < ax + S * 1.4) continue;
            ctx.beginPath();
            ctx.moveTo(x, walkY);
            ctx.lineTo(x, walkY - S * 0.55);
            ctx.stroke();
        }

        /* ---- the trough the iron lands in ---- */
        // A refractory-lined runner, so the river has somewhere to start rather
        // than the iron simply arriving on bare ground.
        const tw = S * 2.0;
        ctx.fillStyle = rgba(palette.steel, 0.34);
        ctx.beginPath();
        ctx.ellipse(ax, ay + S * 0.3, tw, tw * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(palette.plate, 0.96);
        ctx.beginPath();
        ctx.ellipse(ax, ay + S * 0.12, tw * 0.86, tw * 0.34, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(palette.hot, 0.3 + warmth * 0.4);
        ctx.lineWidth = Math.max(1, S * 0.05);
        ctx.beginPath();
        ctx.ellipse(ax, ay + S * 0.12, tw * 0.86, tw * 0.34, 0, 0, Math.PI * 2);
        ctx.stroke();

        /* ---- light thrown onto the structure ---- */
        if (warmth > 0.02) {
            const wash = ctx.createRadialGradient(ax, ay, 0, ax, ay, S * 11);
            wash.addColorStop(0, rgba(palette.glow, 0.16 * warmth));
            wash.addColorStop(0.5, rgba(palette.hot, 0.07 * warmth));
            wash.addColorStop(1, rgba(palette.hot, 0));
            ctx.fillStyle = wash;
            ctx.beginPath();
            ctx.arc(ax, ay, S * 11, 0, Math.PI * 2);
            ctx.fill();
        }

        /* ---- haze in the roof, and embers going up ---- */
        for (let i = 0; i < 5; i += 1) {
            const drift = reduceMotion ? 0.4 : ((t * 0.00007 + hash(i * 9)) % 1);
            const hx = x0 + ((hash(i * 5) + drift * 0.3) % 1) * (x1 - x0);
            const hy = roofY + S * 1.4 + hash(i + 3) * S * 3;
            const r = S * (2 + hash(i + 7) * 2.5);
            const puff = ctx.createRadialGradient(hx, hy, 0, hx, hy, r);
            puff.addColorStop(0, rgba(palette.steel, 0.06 + warmth * 0.05));
            puff.addColorStop(1, rgba(palette.steel, 0));
            ctx.fillStyle = puff;
            ctx.beginPath();
            ctx.arc(hx, hy, r, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!reduceMotion && warmth > 0.1) {
            for (let i = 0; i < 9; i += 1) {
                const life = ((t * 0.00021 + hash(i * 17 + 2)) % 1);
                const ex = ax + (hash(i * 3) - 0.5) * S * 7 + Math.sin(life * 5 + i) * S * 0.6;
                const ey = ay - life * S * 10;
                ctx.fillStyle = rgba(
                    life > 0.6 ? palette.hot : palette.hotter,
                    (1 - life) * 0.5 * warmth,
                );
                ctx.beginPath();
                ctx.arc(ex, ey, S * 0.045 * (1 - life) + 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    return { frame };
}
