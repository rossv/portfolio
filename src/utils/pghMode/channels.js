// Drawing the channels: water, molten iron, and the combined river below the
// confluence, which cools from one into the other as it runs to the foot of the
// page.

import { rgba, hash, clamp } from './palette';
import { CHANNEL_WIDTH } from './lattice';

// A hovered river lifts, and settles again when the pointer leaves. Quick up so
// it feels answered, slow down so a pointer crossing several channels does not
// leave a trail of hard cut-offs behind it.
const RISE_MS = 130;
const FALL_MS = 460;

export function createChannels(ctx, palette, lattice, { reduceMotion = false } = {}) {
    // Keyed by name, not by the channel object: the network is rebuilt on every
    // resize and the objects are replaced, but the four rivers keep their names.
    const lift = new Map();
    let lastT = null;

    function liftFor(name, wanted, t) {
        const dt = lastT === null ? 16 : clamp(t - lastT, 0, 120);
        const now = lift.get(name) ?? 0;
        const span = wanted > now ? RISE_MS : FALL_MS;
        const next = now + (wanted - now) * clamp(dt / span, 0, 1);
        const settled = Math.abs(next - wanted) < 0.002 ? wanted : next;
        lift.set(name, settled);
        return settled;
    }

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

    function water(pts, wide, g, t, e) {
        // Lit, the river carries a sheen off its own surface colour, laid under
        // the water so it reads as light on the channel rather than a line
        // beside it.
        if (e > 0.01) {
            ctx.strokeStyle = rgba(palette.surf, 0.34 * e * g);
            ctx.lineWidth = wide * 1.58;
            trace(pts);
        }
        ctx.strokeStyle = rgba(palette.water, 0.98 * g);
        ctx.lineWidth = wide;
        trace(pts);
        ctx.strokeStyle = rgba(palette.waterLit, (0.42 + 0.38 * e) * g);
        ctx.lineWidth = wide * (0.52 + 0.16 * e);
        trace(pts);

        // The tracers run denser and quicker under the pointer, which is what
        // makes it read as the water moving rather than as a highlight.
        ctx.strokeStyle = rgba(palette.surf, (0.42 + 0.3 * e) * g);
        ctx.lineWidth = 1.6 + e;
        const count = Math.min(16 + Math.round(12 * e), Math.floor(pts.length / (6 - 2 * e)));
        const speed = 0.00009 * (1 + 1.1 * e);
        for (let i = 0; i < count; i += 1) {
            const k = (hash(i + pts.length) + (reduceMotion ? 0 : t * speed)) % 1;
            const a = Math.floor(k * (pts.length - 3));
            ctx.beginPath();
            ctx.moveTo(pts[a][0], pts[a][1]);
            ctx.lineTo(pts[a + 2][0], pts[a + 2][1]);
            ctx.stroke();
        }

        // Ripples: rings opening across the channel and dying as they widen.
        // Only ever on hover — this is the answer to the pointer, so it should
        // not be part of the river's resting state.
        if (e <= 0.01 || reduceMotion) return;
        const rings = 3;
        for (let i = 0; i < rings; i += 1) {
            const life = (hash(i * 17 + 5) + t * 0.0005) % 1;
            const a = Math.floor(hash(i * 31 + 2) * (pts.length - 2));
            const n = normalAt(pts, a);
            const fade = (1 - life) * e;
            ctx.strokeStyle = rgba(palette.surf, 0.5 * fade * g);
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.ellipse(
                pts[a][0], pts[a][1],
                wide * (0.1 + life * 0.52), wide * (0.05 + life * 0.26),
                Math.atan2(n[1], n[0]), 0, Math.PI * 2,
            );
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

    function molten(pts, wide, g, t, e) {
        // A broad red bloom separates the iron from the dark valley while the
        // narrow, hotter centre keeps it from becoming a flat neon stripe.
        // Under the pointer the bloom opens up and the iron works harder — the
        // same channel running hotter, not a different colour.
        ctx.strokeStyle = rgba(palette.glow, ((palette.light ? 0.13 : 0.22) + 0.17 * e) * g);
        ctx.lineWidth = wide * (1.9 + 0.55 * e);
        trace(pts);
        ctx.strokeStyle = rgba(palette.hot, 0.9 * g);
        ctx.lineWidth = wide;
        trace(pts);
        ctx.strokeStyle = rgba(palette.hotter, 0.72 * g);
        ctx.lineWidth = wide * 0.46;
        trace(pts);
        ctx.strokeStyle = rgba(palette.molten, 0.72 * g);
        ctx.lineWidth = wide * 0.14;
        trace(pts);

        if (reduceMotion || pts.length < 6) return;

        // Surface texture. Deliberately sparse: the point is that the iron is
        // moving, not that the channel is a light show, and this sits behind
        // page copy. Everything below is driven by hash and time, so it needs no
        // state and never has to be reset when the network rebuilds.
        ctx.lineCap = 'round';

        // Streaks riding the surface at their own speeds, off the centreline.
        const streaks = clamp(Math.floor(pts.length / 16), 2, 6) + Math.round(4 * e);
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

        // Sparks lifting off and dying, a couple alive at any moment — several
        // more, thrown higher, while the pointer is on the channel.
        const sparks = clamp(Math.floor(pts.length / 22), 2, 5) + Math.round(7 * e);
        for (let i = 0; i < sparks; i += 1) {
            const life = (hash(i * 13 + 5) + t * (0.0007 + 0.0003 * e)) % 1;
            const a = Math.floor(hash(i * 29 + 2) * (pts.length - 2));
            const n = normalAt(pts, a);
            const lift = Math.sin(life * Math.PI) * wide * (0.7 + 0.5 * e);
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
    // simply arrives. `hovered` is the one channel the pointer is over, if any.
    function frame(network, scrollY, t, g, reveal, hovered = null) {
        const wide = lattice.cell() * CHANNEL_WIDTH;
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
                const e = liftFor(channel.name, channel === hovered ? 1 : 0, t);
                if (pass === 'water') water(pts, wide, g, t, e);
                else molten(pts, wide, g, t, e);
            }
        }
        lastT = t;

        return projected;
    }

    return { frame };
}
