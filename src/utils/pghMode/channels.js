// Drawing the channels: water, and molten iron.
//
// Tributaries run narrower than the trunk they join, which is the one cue that
// makes a branching network read as a drainage system rather than as a tangle of
// unrelated lines.

import { rgba, hash } from './palette';

const widthFor = (cell, order) => cell * (order === 1 ? 0.62 : 0.42);

export function createChannels(ctx, palette, lattice, { reduceMotion = false } = {}) {
    // Screen-space points for one channel, culled to the visible band. Cheaper
    // than projecting a whole page-deep network every frame.
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
        ctx.strokeStyle = rgba(palette.waterLit, 0.48 * g);
        ctx.lineWidth = wide * 0.5;
        trace(pts);
        // Tracers, so the water is moving without anything obviously looping.
        ctx.strokeStyle = rgba(palette.surf, 0.5 * g);
        ctx.lineWidth = 1.4;
        const count = Math.min(14, Math.floor(pts.length / 6));
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
        // A clean incandescent channel: bloom, body, hot centre. No crust — the
        // drifting skin read as debris on the surface rather than as metal.
        ctx.strokeStyle = rgba(palette.glow, (palette.light ? 0.11 : 0.14) * g);
        ctx.lineWidth = wide * 2.0;
        trace(pts);
        ctx.strokeStyle = rgba(palette.hot, 0.95 * g);
        ctx.lineWidth = wide;
        trace(pts);
        ctx.strokeStyle = rgba(palette.hotter, 0.85 * g);
        ctx.lineWidth = wide * 0.60;
        trace(pts);
        ctx.strokeStyle = rgba(palette.molten, 0.80 * g);
        ctx.lineWidth = wide * 0.24;
        trace(pts);
    }

    // Draws every channel and hands back the screen points, which the bridges
    // need too — projecting the network twice per frame would be wasteful.
    function frame(channels, scrollY, t, g, reveal = 1) {
        const cell = lattice.cell();
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        const projected = new Map();

        // Banks first, for every channel, so a bank never cuts across the
        // channel that crosses behind it.
        for (const channel of channels) {
            const pts = screenPoints(channel, scrollY);
            if (!pts) continue;
            projected.set(channel, pts);
            ctx.strokeStyle = rgba(palette.plate, 0.95 * g);
            ctx.lineWidth = widthFor(cell, channel.order) * 1.5;
            trace(pts, 0, Math.max(2, Math.ceil(pts.length * reveal)));
        }

        // Water, then molten, so the hot channel reads as the nearer thing.
        for (const pass of ['water', 'molten']) {
            for (const [channel, pts] of projected) {
                if (channel.kind !== pass) continue;
                const to = Math.max(2, Math.ceil(pts.length * reveal));
                const visible = pts.slice(0, to);
                const wide = widthFor(cell, channel.order);
                if (pass === 'water') water(visible, wide, g, t);
                else molten(visible, wide, g);
            }
        }

        return projected;
    }

    return { frame };
}
