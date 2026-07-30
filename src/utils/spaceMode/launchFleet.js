// The launch fleet that flies when space nerd mode is switched on.
//
// Five real launchers, each identified by silhouette alone rather than by
// surface detail — at six seconds across the screen, panel lines and legends
// are invisible, so the pixels go into shape, banding and exhaust instead.
//
// Craft sit on several depth planes: distant ones are smaller, dimmer and
// slower, and the nearest draw last so they pass in front.

import { rand } from './sprites';

const FLIGHT = 6000;      // ms for one climb, matching the original animation
const SMOKE_CAP = 260;    // this is a background: an unbounded column greys out the page
const EMBER_CAP = 220;

const ORDER = ['saturn', 'shuttle', 'falcon', 'starship', 'soyuz'];
const LANES = [0.12, 0.27, 0.41, 0.55, 0.69, 0.82, 0.93, 0.34];
const DELAYS = [0, 900, 380, 1500, 640, 2100, 1150, 2600];
const DEPTHS = [1.15, 0.62, 0.95, 0.72, 1.05, 0.55, 0.85, 0.68];
// Heavier vehicles climb slower, so the fleet staggers itself.
const CLIMB = { saturn: 1.22, shuttle: 1.16, starship: 1.18, falcon: 1.0, soyuz: 1.04 };

export function createFleet(ctx, { puffSprites, warmGlow, palette }) {
    let rockets = [];
    const smoke = [];
    const embers = [];
    let width = 0;
    let height = 0;
    let rumble = 0;
    let plumeExpand = 1;

    // Craft are drawn at fixed pixel sizes, so without this they shrink to
    // desk models on a large display.
    const craftScale = () => Math.max(0.8, Math.min(2, height / 900));

    const resize = (w, h) => { width = w; height = h; };

    /* ---- exhaust products ---------------------------------------- */

    function emitSmoke(x, y, w, count, spread) {
        for (let i = 0; i < count; i++) {
            if (smoke.length >= SMOKE_CAP) smoke.shift();
            smoke.push({
                x: x + rand(-w * 0.5, w * 0.5),
                y: y + rand(0, w * 0.8),
                r: w * rand(0.3, 0.6),
                grow: w * rand(0.012, 0.026),
                vx: rand(-spread, spread),
                vy: rand(0.1, 0.7),
                age: 0,
                max: rand(900, 1800),
            });
        }
    }

    function emitEmbers(x, y, w, count) {
        for (let i = 0; i < count; i++) {
            if (embers.length >= EMBER_CAP) embers.shift();
            embers.push({
                x, y,
                vx: rand(-1.4, 1.4),
                vy: rand(0.6, 3.4),
                age: 0,
                max: rand(320, 900),
                size: rand(0.8, 2.1),
            });
        }
    }

    function paintExhaust(dt) {
        for (let i = smoke.length - 1; i >= 0; i--) {
            const s = smoke[i];
            s.age += dt;
            if (s.age >= s.max) { smoke.splice(i, 1); continue; }
            const k = s.age / s.max;
            s.x += s.vx;
            s.y += s.vy;
            s.r += s.grow * (dt / 16);
            // Cools from ember-orange through grey to cold blue-grey.
            const sprite = k < 0.16 ? puffSprites[0] : k < 0.6 ? puffSprites[1] : puffSprites[2];
            ctx.globalAlpha = Math.sin(Math.PI * Math.min(1, k * 1.25)) * palette.smoke;
            ctx.drawImage(sprite, s.x - s.r, s.y - s.r, s.r * 2, s.r * 2);
        }
        ctx.globalAlpha = 1;

        for (let i = embers.length - 1; i >= 0; i--) {
            const e = embers[i];
            e.age += dt;
            if (e.age >= e.max) { embers.splice(i, 1); continue; }
            e.x += e.vx;
            e.y += e.vy;
            e.vy *= 0.985;
            const a = 1 - e.age / e.max;
            ctx.fillStyle = `rgba(255, ${(150 + 90 * a) | 0}, ${(60 * a) | 0}, ${a})`;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size * a, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const flicker = (seed) => 0.85 + Math.sin(performance.now() * 0.05 + seed) * 0.15;

    // Shared exhaust: launchers differ only in width, length and colour.
    function plume(w, len, f, hot, mid) {
        const ww = w * plumeExpand;
        const L = len * f * (0.85 + plumeExpand * 0.5);

        const grad = ctx.createLinearGradient(0, 0, 0, L);
        grad.addColorStop(0, hot);
        grad.addColorStop(0.24, mid);
        grad.addColorStop(0.58, 'rgba(255, 176, 60, 0.28)');
        grad.addColorStop(1, 'rgba(255, 170, 90, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        // Tapered cone — an ellipse reads as a balloon.
        ctx.moveTo(-ww, 0);
        ctx.quadraticCurveTo(-ww * 0.8, L * 0.5, 0, L);
        ctx.quadraticCurveTo(ww * 0.8, L * 0.5, ww, 0);
        ctx.closePath();
        ctx.fill();

        // Bright core with Mach diamonds.
        ctx.fillStyle = `rgba(255, 250, 238, ${0.94 * f})`;
        ctx.beginPath();
        ctx.moveTo(-ww * 0.32, 0);
        ctx.quadraticCurveTo(-ww * 0.18, L * 0.38, 0, L * 0.6);
        ctx.quadraticCurveTo(ww * 0.18, L * 0.38, ww * 0.32, 0);
        ctx.closePath();
        ctx.fill();
        for (let i = 1; i <= 4; i++) {
            ctx.globalAlpha = (0.5 - i * 0.1) * f;
            ctx.beginPath();
            ctx.arc(0, L * (0.085 * i), ww * (0.3 - i * 0.045), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Engine light on the hull. Tight, or it blooms over the craft.
        const gw = ww * 3;
        ctx.globalAlpha = 0.3 * f;
        ctx.drawImage(warmGlow, -gw / 2, -gw * 0.6, gw, gw);
        ctx.globalAlpha = 1;
    }

    // Emits this craft's exhaust column. Smoke lives in world coordinates so
    // it stays put as the craft climbs away, hence reading the current
    // transform rather than emitting inside the craft's local space.
    function wake(w) {
        const m = ctx.getTransform();
        const scale = m.a;                 // craft scale set by frame()
        if (Math.random() < 0.6) emitSmoke(m.e, m.f + w * scale, w * scale * 0.5, 1, 0.4);
        if (Math.random() < 0.3) emitEmbers(m.e, m.f + w * scale * 0.6, w * scale, 1);
    }

    function rim(x, top, bottom) {
        ctx.strokeStyle = `rgba(${palette.node}, 0.55)`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.stroke();
    }

    /* ---- the launchers ------------------------------------------- */

    // Falcon 9: the black interstage and a soot band low on the booster are
    // what identify it. Panel detail and legends are omitted deliberately.
    function drawFalcon(p, seed) {
        const f = flicker(seed);
        wake(13);
        plume(17, 165, f, 'rgba(255, 240, 210, 0.95)', 'rgba(255, 130, 20, 0.8)');

        ctx.fillStyle = '#eef0f3';
        ctx.fillRect(-13, -128, 26, 112);
        ctx.fillStyle = 'rgba(30, 32, 38, 0.55)';
        ctx.fillRect(-13, -46, 26, 30);
        ctx.fillStyle = '#15171c';
        ctx.fillRect(-14, -142, 28, 14);
        ctx.fillStyle = '#f4f5f7';
        ctx.fillRect(-12, -196, 24, 54);
        ctx.beginPath();
        ctx.moveTo(-12, -196);
        ctx.quadraticCurveTo(0, -232, 12, -196);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#3b3f46';
        ctx.fillRect(-18, -122, 5, 15);
        ctx.fillRect(13, -122, 5, 15);
        ctx.beginPath();
        ctx.moveTo(-13, -40); ctx.lineTo(-17, -18); ctx.lineTo(-13, -22);
        ctx.moveTo(13, -40); ctx.lineTo(17, -18); ctx.lineTo(13, -22);
        ctx.fill();
        ctx.fillStyle = '#101216';
        ctx.fillRect(-15, -18, 30, 18);
        rim(-13, -196, -16);
    }

    // Saturn V: mass and the black roll-pattern quadrants.
    function drawSaturnV(p, seed) {
        const f = flicker(seed);
        wake(22);
        plume(30, 250, f, 'rgba(255, 245, 220, 0.98)', 'rgba(255, 108, 10, 0.88)');

        ctx.fillStyle = '#f2f2ee';
        ctx.fillRect(-22, -150, 44, 132);
        ctx.fillStyle = '#15171c';
        ctx.fillRect(-22, -150, 12, 20);
        ctx.fillRect(10, -130, 12, 20);
        ctx.fillRect(-22, -46, 44, 12);
        ctx.beginPath();
        ctx.moveTo(-22, -34); ctx.lineTo(-31, -8); ctx.lineTo(-22, -12);
        ctx.moveTo(22, -34); ctx.lineTo(31, -8); ctx.lineTo(22, -12);
        ctx.fill();
        ctx.fillRect(-23, -18, 46, 18);
        ctx.fillStyle = '#e9e9e4';
        ctx.beginPath();
        ctx.moveTo(-22, -150); ctx.lineTo(-17, -166); ctx.lineTo(17, -166); ctx.lineTo(22, -150);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f2f2ee';
        ctx.fillRect(-17, -244, 34, 78);
        ctx.fillStyle = '#15171c';
        ctx.fillRect(-17, -244, 34, 10);
        ctx.fillStyle = '#eeeee9';
        ctx.beginPath();
        ctx.moveTo(-17, -244); ctx.lineTo(-10, -266); ctx.lineTo(10, -266); ctx.lineTo(17, -244);
        ctx.closePath();
        ctx.fill();
        ctx.fillRect(-10, -292, 20, 26);
        ctx.beginPath();
        ctx.moveTo(-10, -292); ctx.lineTo(0, -312); ctx.lineTo(10, -292);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#c9ccd2';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(0, -312); ctx.lineTo(0, -334);
        ctx.stroke();
        rim(-22, -244, -18);
    }

    // Shuttle stack: the asymmetry is the whole silhouette.
    function drawShuttle(p, seed) {
        const f = flicker(seed);
        wake(24);
        ctx.save(); ctx.translate(-21, 0);
        plume(15, 230, f, 'rgba(255, 246, 225, 0.96)', 'rgba(255, 118, 12, 0.85)');
        ctx.restore();
        ctx.save(); ctx.translate(21, 0);
        plume(15, 230, f, 'rgba(255, 246, 225, 0.96)', 'rgba(255, 118, 12, 0.85)');
        ctx.restore();

        ctx.save(); ctx.translate(11, -6);
        const ssme = ctx.createLinearGradient(0, 0, 0, 90 * f);
        ssme.addColorStop(0, 'rgba(214, 234, 255, 0.9)');
        ssme.addColorStop(0.5, 'rgba(150, 190, 255, 0.4)');
        ssme.addColorStop(1, 'rgba(150, 190, 255, 0)');
        ctx.fillStyle = ssme;
        ctx.beginPath();
        ctx.ellipse(0, 45 * f, 9, 45 * f, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // External tank.
        ctx.fillStyle = '#b4623a';
        ctx.fillRect(-11, -196, 22, 180);
        ctx.fillStyle = '#a25631';
        ctx.fillRect(-11, -196, 7, 180);
        ctx.fillStyle = '#b4623a';
        ctx.beginPath();
        ctx.moveTo(-11, -196);
        ctx.quadraticCurveTo(0, -228, 11, -196);
        ctx.closePath();
        ctx.fill();

        // Solid rocket boosters.
        for (const sx of [-27, 15]) {
            ctx.fillStyle = '#eceff3';
            ctx.fillRect(sx, -186, 12, 170);
            ctx.beginPath();
            ctx.moveTo(sx, -186); ctx.lineTo(sx + 6, -212); ctx.lineTo(sx + 12, -186);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#c2c7cf';
            ctx.fillRect(sx, -120, 12, 4);
            ctx.fillRect(sx, -70, 12, 4);
        }

        // Orbiter on the tank's right flank.
        ctx.fillStyle = '#f3f5f8';
        ctx.beginPath();
        ctx.moveTo(11, -30);
        ctx.lineTo(11, -150);
        ctx.quadraticCurveTo(13, -172, 20, -176);
        ctx.quadraticCurveTo(26, -172, 26, -150);
        ctx.lineTo(26, -60);
        ctx.lineTo(34, -34);
        ctx.lineTo(11, -30);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2a2e35';
        ctx.beginPath();
        ctx.moveTo(26, -60); ctx.lineTo(34, -34); ctx.lineTo(26, -34);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f3f5f8';
        ctx.beginPath();
        ctx.moveTo(15, -150); ctx.lineTo(19, -166); ctx.lineTo(21, -150);
        ctx.closePath();
        ctx.fill();
        rim(-11, -196, -16);
    }

    // Starship: bare steel, banding, and all four flaps.
    function drawStarship(p, seed) {
        const f = flicker(seed);
        wake(26);
        plume(34, 260, f, 'rgba(220, 240, 255, 0.95)', 'rgba(140, 180, 255, 0.7)');

        const steel = ctx.createLinearGradient(-21, 0, 21, 0);
        steel.addColorStop(0, '#7d8794');
        steel.addColorStop(0.35, '#d3dae2');
        steel.addColorStop(0.7, '#9aa4b1');
        steel.addColorStop(1, '#6e7784');
        ctx.fillStyle = steel;
        ctx.fillRect(-21, -168, 42, 150);
        ctx.strokeStyle = 'rgba(60, 68, 78, 0.35)';
        ctx.lineWidth = 0.8;
        for (let y = -160; y < -20; y += 16) {
            ctx.beginPath();
            ctx.moveTo(-21, y); ctx.lineTo(21, y);
            ctx.stroke();
        }
        ctx.fillStyle = '#4a525c';
        ctx.fillRect(-26, -162, 5, 16);
        ctx.fillRect(21, -162, 5, 16);
        ctx.fillRect(-22, -18, 44, 18);

        ctx.fillStyle = steel;
        ctx.fillRect(-19, -290, 38, 122);
        ctx.beginPath();
        ctx.moveTo(-19, -290);
        ctx.quadraticCurveTo(0, -336, 19, -290);
        ctx.closePath();
        ctx.fill();
        // Forward and aft flaps: [root x, tip x, root y, tip y, trailing y]
        ctx.fillStyle = '#5b636e';
        const flaps = [
            [-19, -31, -286, -272, -262],
            [19, 31, -286, -272, -262],
            [-19, -33, -196, -176, -170],
            [19, 33, -196, -176, -170],
        ];
        for (const [rootX, tipX, rootY, tipY, trailY] of flaps) {
            ctx.beginPath();
            ctx.moveTo(rootX, rootY);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(rootX, trailY);
            ctx.closePath();
            ctx.fill();
        }
    }

    // Soyuz: the splayed four-cone cluster, unlike anything else flying.
    function drawSoyuz(p, seed) {
        const f = flicker(seed);
        wake(20);
        for (const bx of [-19, -10, 10, 19]) {
            ctx.save();
            ctx.translate(bx, -6);
            plume(9, 150, f, 'rgba(255, 244, 220, 0.9)', 'rgba(255, 140, 30, 0.7)');
            ctx.restore();
        }
        plume(13, 190, f, 'rgba(255, 248, 228, 0.95)', 'rgba(255, 128, 24, 0.8)');

        for (const s of [-1, 1]) {
            for (const off of [11, 21]) {
                ctx.fillStyle = off === 11 ? '#e6e9ee' : '#d3d8e0';
                ctx.beginPath();
                ctx.moveTo(s * off, -12);
                ctx.lineTo(s * (off + 7), -12);
                ctx.lineTo(s * (off + 5), -104);
                ctx.lineTo(s * (off - 1), -128);
                ctx.closePath();
                ctx.fill();
            }
        }
        ctx.fillStyle = '#eef1f5';
        ctx.fillRect(-10, -180, 20, 168);
        ctx.fillStyle = '#c8ced7';
        ctx.fillRect(-10, -70, 20, 6);
        ctx.fillStyle = '#e2e6ec';
        ctx.fillRect(-11, -216, 22, 36);
        ctx.beginPath();
        ctx.moveTo(-11, -216);
        ctx.quadraticCurveTo(0, -248, 11, -216);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#9aa3af';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -248); ctx.lineTo(0, -262);
        ctx.stroke();
        rim(-10, -180, -12);
    }

    const DRAWERS = {
        falcon: drawFalcon,
        saturn: drawSaturnV,
        shuttle: drawShuttle,
        starship: drawStarship,
        soyuz: drawSoyuz,
    };

    /* ---- orchestration ------------------------------------------- */

    function launch() {
        rockets = [];
        smoke.length = 0;
        embers.length = 0;
        for (let i = 0; i < 8; i++) {
            const type = ORDER[i % ORDER.length];
            const depth = DEPTHS[i % DEPTHS.length];
            rockets.push({
                type,
                lane: LANES[i % LANES.length] + rand(-0.02, 0.02),
                delay: DELAYS[i % DELAYS.length],
                t: 0,
                depth,
                climb: CLIMB[type] * (1.5 - depth * 0.45),
                seed: Math.random() * 6.28,
                lit: false,
                sep: false,
            });
        }
        // Nearest craft draw last, so they pass in front.
        rockets.sort((a, b) => a.depth - b.depth);
    }

    function frame(dt) {
        if (!rockets.length && !smoke.length && !embers.length) return;
        const cs = craftScale();
        let alive = false;

        // Lift-off glow sits behind the smoke column.
        for (const r of rockets) {
            const p = (r.t - r.delay) / (FLIGHT * r.climb);
            if (p < 0 || p > 0.22) continue;
            const k = 1 - p / 0.22;
            const gw = 260 * cs * r.depth * k;
            ctx.globalAlpha = 0.3 * k;
            ctx.drawImage(warmGlow, r.lane * width - gw / 2, height - gw * 0.5, gw, gw);
            ctx.globalAlpha = 1;
        }

        paintExhaust(dt);

        for (const r of rockets) {
            r.t += dt;
            const p = (r.t - r.delay) / (FLIGHT * r.climb);
            if (r.t < r.delay) { alive = true; continue; }
            if (p >= 1) continue;
            alive = true;

            // Fast off the pad, decelerating as it leaves frame.
            const eased = 1 - (1 - p) ** 2.4;
            const x = r.lane * width;
            const y = height * 1.15 - eased * (height * 2.4);

            if (!r.lit) {
                r.lit = true;
                emitSmoke(x, y + 30 * cs * r.depth, 22 * cs * r.depth, 9, 2.2);
                emitEmbers(x, y + 20 * cs * r.depth, 30 * cs * r.depth, 18);
            }

            // A puff and a flash as the spent stage lets go.
            if (!r.sep && p > 0.46 && (r.type === 'falcon' || r.type === 'saturn' || r.type === 'starship')) {
                r.sep = true;
                emitSmoke(x, y + 10 * cs * r.depth, 14 * cs * r.depth, 6, 2.8);
                emitEmbers(x, y, 24 * cs * r.depth, 10);
            }

            if (p < 0.3) rumble = Math.max(rumble, (1 - p / 0.3) * 2.6 * r.depth);

            plumeExpand = 1 + p * 0.5;
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(cs * r.depth, cs * r.depth);
            // Distance haze: far craft sit back into the sky.
            ctx.globalAlpha = 0.55 + r.depth * 0.42;
            // On paper, pale hulls need an edge or they disappear into it.
            if (palette.craftEdge) {
                ctx.shadowColor = palette.craftEdge;
                ctx.shadowBlur = 6 / (cs * r.depth);
            }
            DRAWERS[r.type](p, r.seed);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();
            plumeExpand = 1;
        }

        if (!alive && !smoke.length && !embers.length) rockets = [];
    }

    const decayRumble = () => { rumble *= 0.94; };

    return {
        resize,
        launch,
        frame,
        decayRumble,
        rumble: () => rumble,
        active: () => rockets.length > 0 || smoke.length > 0,
    };
}
