// Drawing the channels: water, molten iron, and the combined river below the
// confluence, which cools from one into the other as it runs to the foot of the
// page.

import { rgba, hash, clamp } from './palette';

// Three times the earlier width. These are the subject of the backdrop now that
// nothing branches, so they carry it.
const WIDTH = 1.86;

export function createChannels(ctx, palette, lattice, { reduceMotion = false } = {}) {
    function screenPoints(channel, scrollY) {
        const pts = [];
        let anyVisible = false;
        for (const [gx, gy] of channel.pts) {
            pts.push(lattice.project(gx, gy, scrollY));
            if (!anyVisible && lattice.onScreen(gx, gy, scrollY)) anyVisible = true;
        }
        return anyVisible ? pts : null;
    }

    const trace = (pts, from = 0, to = pts.length) => {
        ctx.beginPath();
        for (let i = from; i < to; i += 1) {
            const [x, y] = pts[i];
            if (i === from) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    };

    function water(pts, wide, g, t) {
        ctx.strokeStyle = rgba(palette.water, 0.98 * g);
        ctx.lineWidth = wide;
        trace(pts);
        ctx.strokeStyle = rgba(palette.waterLit, 0.42 * g);
        ctx.lineWidth = wide * 0.52;
        trace(pts);
        ctx.strokeStyle = rgba(palette.surf, 0.42 * g);
        ctx.lineWidth = 1.6;
        const count = Math.min(16, Math.floor(pts.length / 6));
        for (let i = 0; i < count; i += 1) {
            const k = (hash(i + pts.length) + (reduceMotion ? 0 : t * 0.00009)) % 1;
            const a = Math.floor(k * (pts.length - 3));
            ctx.beginPath();
            ctx.moveTo(pts[a][0], pts[a][1]);
            ctx.lineTo(pts[a + 2][0], pts[a + 2][1]);
            ctx.stroke();
        }
    }

    // The perpendicular at a point, for anything riding off the centreline.
    function normalAt(pts, i) {
        const a = pts[Math.max(0, i - 1)];
        const b = pts[Math.min(pts.length - 1, i + 1)];
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        return [-dy / len, dx / len];
    }

    function molten(pts, wide, g, t) {
        // Held back hard. At this width the bright core is a big area, and the
        // earlier weighting made the iron the loudest thing on the page — which
        // is wrong for something sitting behind text.
        ctx.strokeStyle = rgba(palette.glow, (palette.light ? 0.08 : 0.10) * g);
        ctx.lineWidth = wide * 1.6;
        trace(pts);
        ctx.strokeStyle = rgba(palette.hot, 0.9 * g);
        ctx.lineWidth = wide;
        trace(pts);
        ctx.strokeStyle = rgba(palette.hotter, 0.5 * g);
        ctx.lineWidth = wide * 0.40;
        trace(pts);
        ctx.strokeStyle = rgba(palette.molten, 0.42 * g);
        ctx.lineWidth = wide * 0.11;
        trace(pts);

        if (reduceMotion || pts.length < 6) return;

        // Surface texture. Deliberately sparse: the point is that the iron is
        // moving, not that the channel is a light show, and this sits behind
        // page copy. Everything below is driven by hash and time, so it needs no
        // state and never has to be reset when the network rebuilds.
        ctx.lineCap = 'round';

        // Streaks riding the surface at their own speeds, off the centreline.
        const streaks = clamp(Math.floor(pts.length / 16), 2, 6);
        for (let i = 0; i < streaks; i += 1) {
            const k = (hash(i * 7 + 1) + t * (0.00006 + hash(i + 3) * 0.00005)) % 1;
            const a = Math.floor(k * (pts.length - 4));
            const n = normalAt(pts, a);
            const off = (hash(i + 11) - 0.5) * wide * 0.42;
            ctx.strokeStyle = rgba(palette.molten, 0.4 * g);
            ctx.lineWidth = wide * 0.1;
            ctx.beginPath();
            ctx.moveTo(pts[a][0] + n[0] * off, pts[a][1] + n[1] * off);
            ctx.lineTo(pts[a + 2][0] + n[0] * off, pts[a + 2][1] + n[1] * off);
            ctx.stroke();
        }

        // Sparks lifting off and dying, a couple alive at any moment.
        const sparks = clamp(Math.floor(pts.length / 22), 2, 5);
        for (let i = 0; i < sparks; i += 1) {
            const life = (hash(i * 13 + 5) + t * 0.0007) % 1;
            const a = Math.floor(hash(i * 29 + 2) * (pts.length - 2));
            const n = normalAt(pts, a);
            const lift = Math.sin(life * Math.PI) * wide * 0.7;
            const drift = (hash(i + 17) - 0.5) * wide * 0.5 * life;
            ctx.fillStyle = rgba(life > 0.6 ? palette.hotter : palette.molten, (1 - life) * 0.75 * g);
            ctx.beginPath();
            ctx.arc(
                pts[a][0] + n[0] * drift,
                pts[a][1] + n[1] * drift - lift,
                wide * 0.045 * (1 - life) + 0.7, 0, Math.PI * 2,
            );
            ctx.fill();
        }

        // The odd splash: a low crescent on the surface where the iron breaks.
        const splashes = clamp(Math.floor(pts.length / 34), 1, 3);
        for (let i = 0; i < splashes; i += 1) {
            const life = (hash(i * 41 + 9) + t * 0.00045) % 1;
            if (life > 0.55) continue;
            const a = Math.floor(hash(i * 53 + 4) * (pts.length - 2));
            const n = normalAt(pts, a);
            const fade = 1 - life / 0.55;
            ctx.strokeStyle = rgba(palette.molten, 0.5 * fade * g);
            ctx.lineWidth = wide * 0.07;
            ctx.beginPath();
            ctx.arc(
                pts[a][0], pts[a][1] - wide * 0.1,
                wide * (0.16 + life * 0.5), Math.PI * 1.15, Math.PI * 1.85,
            );
            ctx.stroke();
            ctx.fillStyle = rgba(palette.hotter, 0.6 * fade * g);
            for (const s of [-1, 1]) {
                ctx.beginPath();
                ctx.arc(
                    pts[a][0] + n[0] * s * wide * 0.3 * (0.4 + life),
                    pts[a][1] + n[1] * s * wide * 0.3 * (0.4 + life) - wide * (0.2 + life * 0.4),
                    wide * 0.04 * fade + 0.6, 0, Math.PI * 2,
                );
                ctx.fill();
            }
        }
    }

    // `reveal` per kind: the molten is scrubbed by the crucible's pour, the rest
    // simply arrives.
    function frame(network, scrollY, t, g, reveal) {
        const wide = lattice.cell() * WIDTH;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const projected = new Map();

        for (const channel of network.channels) {
            const pts = screenPoints(channel, scrollY);
            if (!pts) continue;
            const cut = clamp(reveal[channel.kind] ?? 1, 0, 1);
            if (cut <= 0.001) continue;
            const to = Math.max(2, Math.ceil(pts.length * cut));
            projected.set(channel, pts.slice(0, to));
        }

        // Banks under everything, so a bank never cuts across a channel crossing
        // behind it.
        for (const [, pts] of projected) {
            ctx.strokeStyle = rgba(palette.plate, 0.95 * g);
            ctx.lineWidth = wide * 1.28;
            trace(pts);
        }

        // Water first, then molten on top: the hot channel reads as the nearest
        // thing, and it crosses the water rather than being interrupted by it.
        for (const pass of ['water', 'molten']) {
            for (const [channel, pts] of projected) {
                if (channel.kind !== pass) continue;
                if (pass === 'water') water(pts, wide, g, t);
                else molten(pts, wide, g, t);
            }
        }

        return projected;
    }

    return { frame };
}
