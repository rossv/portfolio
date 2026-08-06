// The crossings the visitor builds, and the sparks a miss strikes.
//
// A click on any river throws a span across it. Spans are stored per station
// with x as a fraction of width, so a resize — or a theme rebuild, which
// reconstructs this whole module — keeps every crossing where it was put.
//
// Three types, cycling by index: self-anchored suspension, arch, through
// truss. Each one builds in stages rather than appearing whole.

import { rgba, lerp, clamp, smooth } from './palette';

const TYPES = ['susp', 'arch', 'truss'];

// Catenary shape for the suspension cable, normalised to 0..1 across the span.
const K = 2.1;
const COSH_K = Math.cosh(K);
const cat = (t) => (Math.cosh(K * t) - 1) / (COSH_K - 1);

const SPARK_CAP = 180;

// Every span redraws in full each frame — catenary, hangers, deck, piers — and
// the list outlives a palette rebuild, so it needs a ceiling like the one space
// mode puts on placed stars. The oldest crossing retires to make room.
export const SPAN_CAP = 24;

export function createSpans(ctx, palette, geom, placed = [], { reduceMotion = false } = {}) {
    const sparks = [];

    function draw(index, span, ordinal, scrollY) {
        const width = geom.width();
        const height = geom.height();
        const top = geom.riverTopOf(index, scrollY);
        if (top > height + 60 || top < -160) return;

        const length = clamp(width * 0.22, 150, 300);
        const cx = span.x * width;
        const x0 = cx - length / 2;
        const x1 = cx + length / 2;
        const deckY = top - 12;
        const rise = length * 0.19;
        const type = TYPES[ordinal % 3];
        const t = smooth(clamp(span.t, 0, 1));

        const tA = x0 + length * 0.17;
        const tB = x1 - length * 0.17;
        const towerY = deckY - rise;

        // piers into the water
        ctx.fillStyle = rgba(palette.structure, 0.55);
        [tA, tB].forEach((px) => {
            ctx.fillRect(px - 3, deckY, 6, geom.riverH() * 0.62);
        });

        if (type === 'susp') {
            const pT = smooth(clamp(t / 0.34, 0, 1));
            const pC = smooth(clamp((t - 0.24) / 0.42, 0, 1));
            const pH = smooth(clamp((t - 0.52) / 0.34, 0, 1));
            const sagY = deckY - rise * 0.15;

            ctx.strokeStyle = rgba(palette.structure, 0.9);
            ctx.lineWidth = 3;
            [tA, tB].forEach((px) => {
                ctx.beginPath();
                ctx.moveTo(px, deckY + 6);
                ctx.lineTo(px, lerp(deckY, towerY - rise * 0.1, pT));
                ctx.stroke();
            });

            ctx.strokeStyle = rgba(palette.accent, 0.95);
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(x0, deckY);
            const lx = lerp(x0, tA, pC);
            const ly = lerp(deckY, towerY, pC);
            ctx.quadraticCurveTo((x0 + lx) / 2, (deckY + ly) / 2 + rise * 0.11, lx, ly);
            if (pC > 0.55) {
                const seg = clamp((pC - 0.55) / 0.45, 0, 1);
                for (let i = 0; i <= 34; i += 1) {
                    const k = i / 34;
                    if (k > seg) break;
                    ctx.lineTo(lerp(tA, tB, k), sagY + (towerY - sagY) * cat(-1 + k * 2));
                }
            }
            if (pC > 0.99) {
                ctx.lineTo(tB, towerY);
                ctx.quadraticCurveTo(
                    (tB + x1) / 2,
                    (towerY + deckY) / 2 + rise * 0.11,
                    x1,
                    deckY
                );
            }
            ctx.stroke();

            if (pH > 0) {
                ctx.strokeStyle = rgba(palette.edge, 0.55);
                ctx.lineWidth = 1;
                for (let j = 1; j < 14; j += 1) {
                    const kk = j / 14;
                    if (kk > pH) break;
                    const hx = lerp(tA, tB, kk);
                    ctx.beginPath();
                    ctx.moveTo(hx, sagY + (towerY - sagY) * cat(-1 + kk * 2));
                    ctx.lineTo(hx, deckY);
                    ctx.stroke();
                }
            }
        } else if (type === 'arch') {
            ctx.strokeStyle = rgba(palette.accent, 0.95);
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            for (let a = 0; a <= 40; a += 1) {
                const ka = a / 40;
                if (ka > t) break;
                const ax = lerp(x0, x1, ka);
                const ay = deckY - Math.sin(ka * Math.PI) * rise * 1.05;
                if (a === 0) ctx.moveTo(ax, ay); else ctx.lineTo(ax, ay);
            }
            ctx.stroke();
            ctx.strokeStyle = rgba(palette.edge, 0.5);
            ctx.lineWidth = 1;
            for (let h = 1; h < 11; h += 1) {
                const kh = h / 11;
                if (kh > t) break;
                const hx = lerp(x0, x1, kh);
                ctx.beginPath();
                ctx.moveTo(hx, deckY - Math.sin(kh * Math.PI) * rise * 1.05);
                ctx.lineTo(hx, deckY);
                ctx.stroke();
            }
        } else {
            // through truss: top chord, verticals, alternating diagonals
            const tip = lerp(x0, x1, t);
            const chordY = deckY - rise * 0.72;
            ctx.strokeStyle = rgba(palette.accent, 0.9);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x0, deckY);
            ctx.lineTo(Math.min(tip, x0 + length * 0.12), chordY);
            if (t > 0.12) {
                ctx.lineTo(Math.min(tip, x1 - length * 0.12), chordY);
                if (t > 0.88) ctx.lineTo(x1, deckY);
            }
            ctx.stroke();
            ctx.strokeStyle = rgba(palette.edge, 0.5);
            ctx.lineWidth = 1;
            for (let m = 0; m <= 8; m += 1) {
                const km = 0.12 + (m / 8) * 0.76;
                if (lerp(x0, x1, km) > tip) break;
                const mx = lerp(x0, x1, km);
                ctx.beginPath();
                ctx.moveTo(mx, chordY);
                ctx.lineTo(mx, deckY);
                ctx.stroke();
                if (m < 8) {
                    const nx = lerp(x0, x1, 0.12 + ((m + 1) / 8) * 0.76);
                    if (nx > tip) break;
                    ctx.beginPath();
                    ctx.moveTo(mx, m % 2 ? chordY : deckY);
                    ctx.lineTo(nx, m % 2 ? deckY : chordY);
                    ctx.stroke();
                }
            }
        }

        // deck last, so it reads in front of the web
        ctx.strokeStyle = rgba(palette.structure, 0.95);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x0, deckY);
        ctx.lineTo(lerp(x0, x1, Math.max(t, 0.06)), deckY);
        ctx.stroke();

        // deck lights, once it is carrying traffic
        if (t > 0.98 && !palette.light) {
            for (let l = 1; l < 7; l += 1) {
                const lx = lerp(x0, x1, l / 7);
                ctx.fillStyle = rgba(palette.accent, 0.85);
                ctx.beginPath();
                ctx.arc(lx, deckY - 4, 1.3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // Every span on one station, advancing whatever is still building.
    function station(index, scrollY) {
        let ordinal = 0;
        for (const span of placed) {
            if (span.station !== index) continue;
            if (span.t < 1) span.t = Math.min(1, span.t + 0.022);
            draw(index, span, ordinal, scrollY);
            ordinal += 1;
        }
    }

    // One span per stretch of water, so repeated clicks in the same place do
    // not stack. Returns false when the click was too close to an existing one.
    function add(index, xFraction) {
        for (const span of placed) {
            if (span.station !== index) continue;
            if (Math.abs(span.x - xFraction) < 0.14) return false;
        }
        placed.push({ station: index, x: xFraction, t: reduceMotion ? 1 : 0 });
        if (placed.length > SPAN_CAP) placed.splice(0, placed.length - SPAN_CAP);
        return true;
    }

    function sparkAt(x, y) {
        if (reduceMotion) return;
        for (let i = 0; i < 16; i += 1) {
            const a = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3.6;
            sparks.push({
                x,
                y,
                vx: Math.cos(a) * speed,
                vy: Math.sin(a) * speed - 1,
                life: 0,
                max: 28 + Math.random() * 26,
                color: Math.random() < 0.5 ? palette.accent : palette.hot,
            });
        }
        if (sparks.length > SPARK_CAP) sparks.splice(0, sparks.length - SPARK_CAP);
    }

    function frameSparks() {
        for (let i = sparks.length - 1; i >= 0; i -= 1) {
            const s = sparks[i];
            s.life += 1;
            if (s.life >= s.max) { sparks.splice(i, 1); continue; }
            s.x += s.vx;
            s.y += s.vy;
            s.vx *= 0.94;
            s.vy = s.vy * 0.94 + 0.07;
            const a = 1 - s.life / s.max;
            ctx.fillStyle = rgba(s.color, a);
            ctx.beginPath();
            ctx.arc(s.x, s.y, 1.6 * a + 0.4, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    return { draw, station, add, sparkAt, frameSparks, count: () => placed.length };
}
