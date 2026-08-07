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

    function molten(pts, wide, g) {
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
                else molten(pts, wide, g);
            }
        }

        return projected;
    }

    return { frame };
}
