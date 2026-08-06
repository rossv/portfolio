// The landmarks standing on each station's far bank.
//
// Every shape draws from a baseline in the two-tone rendering: filled mass,
// drawn edge, and lit detail on the dark ground only. `paint()` hides that
// treatment so the shapes themselves stay readable.
//
// The prototype carried three renderings behind its control rail. Only the
// two-tone one ships, so the style branch collapses to a constant here.

import { rgba, lerp, clamp, hash } from './palette';

export function createLandmarks(ctx, palette, geom, spans, { reduceMotion = false } = {}) {
    // Filled mass with a drawn edge, plus the two helpers each shape needs for
    // its own detail lines and its lit windows.
    function paint() {
        return {
            body(path, accentFill) {
                ctx.beginPath();
                path();
                ctx.fillStyle = accentFill ? rgba(palette.accent, 0.16) : rgba(palette.mass, 1);
                ctx.fill();
                ctx.strokeStyle = rgba(palette.edge, 0.8);
                ctx.lineWidth = 1.2;
                ctx.stroke();
            },
            det(path, w) {
                ctx.beginPath();
                path();
                ctx.strokeStyle = rgba(palette.edge, 0.45);
                ctx.lineWidth = w || 1;
                ctx.stroke();
            },
            lit(path) {
                if (palette.light) return;
                ctx.beginPath();
                path();
                ctx.fillStyle = rgba(palette.accent, 0.75);
                ctx.fill();
            },
        };
    }

    const rectPath = (x, y, w, h) => () => ctx.rect(x, y, w, h);

    /* ---- Duquesne Incline ---- */
    function incline(cx, baseY, S, t) {
        const q = paint();
        const width = geom.width();
        const w = 300 * S;
        const h = 205 * S;
        const x = cx - w / 2;
        const yb = baseY;

        // Mount Washington rises out of the water and runs off the right of the
        // frame at full height, rather than closing into a plateau with a
        // visible cliff edge. Filled in mass so it separates from the hills.
        ctx.beginPath();
        ctx.moveTo(x - 70 * S, yb + 2);
        ctx.lineTo(x - 34 * S, yb - h * 0.08);
        ctx.lineTo(x + w * 0.30, yb - h * 0.48);
        ctx.lineTo(x + w * 0.58, yb - h * 0.86);
        ctx.lineTo(x + w * 0.82, yb - h * 1.00);
        ctx.lineTo(width + 20, yb - h * 1.05);
        ctx.lineTo(width + 20, yb + 2);
        ctx.closePath();
        ctx.fillStyle = rgba(palette.mass, 1);
        ctx.fill();
        ctx.strokeStyle = rgba(palette.edge, 0.55);
        ctx.lineWidth = 1.3;
        ctx.stroke();

        const bx = x + w * 0.16;
        const by = yb - h * 0.10;
        const tx = x + w * 0.72;
        const ty = yb - h * 0.92;
        const dx = tx - bx;
        const dy = ty - by;
        const L = Math.hypot(dx, dy);
        const ux = dx / L;
        const uy = dy / L;
        const nx = -uy;
        const ny = ux;
        const G = 8 * S;

        // ties
        q.det(() => {
            for (let i = 0; i <= 12; i += 1) {
                const k = i / 12;
                ctx.moveTo(bx + dx * k + nx * (G + 4 * S), by + dy * k + ny * (G + 4 * S));
                ctx.lineTo(bx + dx * k - nx * (G + 4 * S), by + dy * k - ny * (G + 4 * S));
            }
        }, 1);

        // rails
        ctx.strokeStyle = rgba(palette.structure, 0.9);
        ctx.lineWidth = 2.2;
        [G, -G].forEach((o) => {
            ctx.beginPath();
            ctx.moveTo(bx + nx * o, by + ny * o);
            ctx.lineTo(tx + nx * o, ty + ny * o);
            ctx.stroke();
        });

        // Houses along the crest. The lit hillside is most of what the incline
        // actually looks like from across the water. Only along the flat crest,
        // where the bluff profile is known — spread down the slope they hung in
        // mid-air.
        const crestL = x + w * 0.84;
        const crestR = width + 10;
        for (let i = 0; i < 8; i += 1) {
            const k = 0.04 + i * 0.132;
            const hx = crestL + (crestR - crestL) * k;
            const hy = yb - h * lerp(1.00, 1.05, k) + 3;
            const hw = (11 + hash(i * 3) * 9) * S;
            const hh = (10 + hash(i * 7) * 9) * S;
            ctx.fillStyle = rgba(palette.ridgeNear, 1);
            ctx.fillRect(hx, hy - hh, hw, hh + 4);
            if (!palette.light && hash(i + 5) > 0.3) {
                ctx.fillStyle = rgba(palette.accent, 0.7);
                ctx.fillRect(hx + 3 * S, hy - hh + 4 * S, 3.4 * S, 4 * S);
            }
        }

        // counterbalanced cars — one up as the other comes down
        const pos = reduceMotion ? 0.32 : (Math.sin(t * 0.00028) * 0.5 + 0.5);
        [[pos, G], [1 - pos, -G]].forEach(([k, o]) => {
            const px = bx + dx * k + nx * o;
            const py = by + dy * k + ny * o;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(Math.atan2(uy, ux));
            const s = S * 1.6;
            ctx.beginPath();
            ctx.moveTo(-13 * s, 3 * s);
            ctx.lineTo(13 * s, 3 * s);
            ctx.lineTo(13 * s, -4 * s);
            ctx.lineTo(4 * s, -4 * s);
            ctx.lineTo(4 * s, -8 * s);
            ctx.lineTo(-5 * s, -8 * s);
            ctx.lineTo(-5 * s, -12 * s);
            ctx.lineTo(-13 * s, -12 * s);
            ctx.closePath();
            ctx.fillStyle = rgba(palette.mass, 1);
            ctx.fill();
            ctx.strokeStyle = rgba(palette.structure, 0.95);
            ctx.lineWidth = 1.6;
            ctx.stroke();
            if (!palette.light) {
                ctx.fillStyle = rgba(palette.accent, 0.8);
                ctx.fillRect(-11 * s, -10 * s, 5 * s, 3 * s);
                ctx.fillRect(-2 * s, -6.5 * s, 5 * s, 3 * s);
            }
            ctx.restore();
        });

        q.body(rectPath(tx - 4 * S, ty - 34 * S, 42 * S, 40 * S));
        q.body(rectPath(bx - 30 * S, by - 26 * S, 30 * S, 30 * S));
    }

    /* ---- Mon Valley Works ---- */
    function mill(cx, baseY, S, t) {
        const q = paint();
        const w = 380 * S;
        const x = cx - w / 2;

        // sawtooth shed
        q.body(() => {
            ctx.moveTo(x, baseY);
            ctx.lineTo(x, baseY - 40 * S);
            for (let i = 0; i < 7; i += 1) {
                const sx = x + i * (w * 0.5 / 7);
                ctx.lineTo(sx + (w * 0.5 / 7) * 0.45, baseY - 56 * S);
                ctx.lineTo(sx + (w * 0.5 / 7) * 0.5, baseY - 40 * S);
            }
            ctx.lineTo(x + w * 0.5, baseY - 40 * S);
            ctx.lineTo(x + w * 0.5, baseY);
            ctx.closePath();
        });

        // blast furnace stoves
        const fx = x + w * 0.58;
        for (let f = 0; f < 3; f += 1) {
            q.body(rectPath(fx + f * 26 * S, baseY - (86 + f * 7) * S, 18 * S, (86 + f * 7) * S));
        }
        q.body(() => {
            ctx.moveTo(x + w * 0.86, baseY);
            ctx.lineTo(x + w * 0.86, baseY - 72 * S);
            ctx.lineTo(x + w * 0.93, baseY - 104 * S);
            ctx.lineTo(x + w * 0.99, baseY - 72 * S);
            ctx.lineTo(x + w * 0.99, baseY);
            ctx.closePath();
        });

        // stacks, and their plumes
        const stacks = [0.06, 0.16, 0.30, 0.42];
        for (let s = 0; s < stacks.length; s += 1) {
            const sh = (100 + hash(s + 3) * 62) * S;
            const sx = x + w * stacks[s];
            q.body(rectPath(sx, baseY - sh, 9 * S, sh));
            if (reduceMotion) continue;
            for (let k = 0; k < 7; k += 1) {
                const age = ((t * 0.00006 + k / 7 + hash(s * 5)) % 1);
                const py = baseY - sh - age * 90 * S;
                const pr = (4 + age * 22) * S;
                ctx.fillStyle = rgba(palette.haze, (1 - age) * (palette.light ? 0.30 : 0.20));
                ctx.beginPath();
                ctx.arc(sx + 4 * S + Math.sin(age * 5 + s) * 12 * S, py, pr, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Hot metal at the base — the one place molten is allowed.
        if (!palette.light) {
            const glow = ctx.createRadialGradient(
                fx + 26 * S, baseY - 6 * S, 0,
                fx + 26 * S, baseY - 6 * S, 70 * S
            );
            glow.addColorStop(0, rgba(palette.hot, 0.5));
            glow.addColorStop(1, rgba(palette.hot, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(fx + 26 * S, baseY - 6 * S, 70 * S, 0, Math.PI * 2);
            ctx.fill();
        }
        q.lit(() => ctx.rect(fx - 4 * S, baseY - 12 * S, 66 * S, 8 * S));
    }

    /* ---- Cathedral of Learning ---- */
    function cathedral(cx, baseY, S) {
        const q = paint();
        const bw = 130 * S;
        const th = 300 * S;

        q.body(rectPath(cx - bw / 2, baseY - 56 * S, bw, 56 * S));            // commons block
        q.body(rectPath(cx - 46 * S, baseY - th * 0.62, 92 * S, th * 0.62));  // lower shaft
        q.body(rectPath(cx - 34 * S, baseY - th * 0.86, 68 * S, th * 0.86));  // setback
        q.body(rectPath(cx - 24 * S, baseY - th, 48 * S, th));                // crown

        // The vertical mullions are the whole reason it reads gothic.
        q.det(() => {
            for (let i = -3; i <= 3; i += 1) {
                ctx.moveTo(cx + i * 7 * S, baseY - th + 10 * S);
                ctx.lineTo(cx + i * 7 * S, baseY - th * 0.86);
            }
            for (let j = -4; j <= 4; j += 1) {
                ctx.moveTo(cx + j * 7.5 * S, baseY - th * 0.86 + 6 * S);
                ctx.lineTo(cx + j * 7.5 * S, baseY - th * 0.62);
            }
            for (let k = -6; k <= 6; k += 1) {
                ctx.moveTo(cx + k * 7 * S, baseY - th * 0.62 + 6 * S);
                ctx.lineTo(cx + k * 7 * S, baseY - 56 * S);
            }
        }, 1);

        // pinnacles
        q.body(() => {
            [-24, -12, 0, 12, 24].forEach((o) => {
                ctx.moveTo(cx + o * S - 3 * S, baseY - th);
                ctx.lineTo(cx + o * S, baseY - th - 13 * S);
                ctx.lineTo(cx + o * S + 3 * S, baseY - th);
            });
        });

        q.lit(() => {
            for (let r = 0; r < 9; r += 1) {
                for (let c = 0; c < 4; c += 1) {
                    if (hash(r * 11 + c) < 0.55) continue;
                    ctx.rect(cx - 18 * S + c * 10 * S, baseY - th + 22 * S + r * 24 * S, 4 * S, 7 * S);
                }
            }
        });
    }

    /* ---- PPG Place ---- */
    function ppg(cx, baseY, S) {
        const q = paint();
        function tower(ox, wdt, hgt, spire) {
            q.body(() => {
                const x = cx + ox * S;
                const w = wdt * S;
                const h = hgt * S;
                ctx.moveTo(x - w / 2, baseY);
                ctx.lineTo(x - w / 2, baseY - h);
                // crown of spires
                const n = Math.max(2, Math.round(w / (9 * S)));
                for (let i = 0; i < n; i += 1) {
                    const sx = x - w / 2 + (w / n) * i;
                    ctx.lineTo(sx + (w / n) * 0.5, baseY - h - spire * S);
                    ctx.lineTo(sx + (w / n), baseY - h);
                }
                ctx.lineTo(x + w / 2, baseY);
                ctx.closePath();
            }, true);
            q.det(() => {
                const x = cx + ox * S;
                const w = wdt * S;
                const h = hgt * S;
                const bays = Math.round(wdt / 9);
                for (let i = 1; i < bays; i += 1) {
                    ctx.moveTo(x - w / 2 + (w / bays) * i, baseY - h + 4 * S);
                    ctx.lineTo(x - w / 2 + (w / bays) * i, baseY - 3 * S);
                }
            }, 0.9);
        }
        tower(-92, 46, 108, 13);
        tower(-46, 40, 132, 12);
        tower(0, 66, 218, 22);
        tower(52, 40, 140, 12);
        tower(96, 46, 100, 13);
        q.lit(() => {
            for (let r = 0; r < 10; r += 1) {
                for (let c = -2; c <= 2; c += 1) {
                    if (hash(r * 13 + c + 40) < 0.6) continue;
                    ctx.rect(cx + c * 12 * S - 2 * S, baseY - 200 * S + r * 20 * S, 4 * S, 6 * S);
                }
            }
        });
    }

    /* ---- Phipps Conservatory ---- */
    function phipps(cx, baseY, S) {
        const q = paint();
        function house(ox, rx, ry) {
            q.body(() => {
                ctx.moveTo(cx + (ox - rx) * S, baseY);
                ctx.lineTo(cx + (ox - rx) * S, baseY - 14 * S);
                ctx.ellipse(cx + ox * S, baseY - 14 * S, rx * S, ry * S, 0, Math.PI, 0);
                ctx.lineTo(cx + (ox + rx) * S, baseY);
                ctx.closePath();
            }, true);
            // glazing ribs — the thing that makes it read as a glass house
            q.det(() => {
                for (let i = 1; i < 7; i += 1) {
                    const a = Math.PI + (Math.PI / 7) * i;
                    ctx.moveTo(cx + ox * S, baseY - 14 * S);
                    ctx.lineTo(
                        cx + ox * S + Math.cos(a) * rx * S,
                        baseY - 14 * S + Math.sin(a) * ry * S
                    );
                }
            }, 0.9);
        }
        house(-74, 34, 44);
        house(0, 54, 82);
        house(76, 32, 40);
        q.body(() => {
            ctx.moveTo(cx - 3 * S, baseY - 96 * S);
            ctx.lineTo(cx, baseY - 112 * S);
            ctx.lineTo(cx + 3 * S, baseY - 96 * S);
            ctx.closePath();
        });
        // Lit from inside, but softly. Filling the whole dome with accent turned
        // it into a gold blob rather than a glass house.
        if (!palette.light) {
            const glow = ctx.createRadialGradient(
                cx, baseY - 14 * S, 0,
                cx, baseY - 14 * S, 62 * S
            );
            glow.addColorStop(0, rgba(palette.accent, 0.42));
            glow.addColorStop(0.7, rgba(palette.accent, 0.16));
            glow.addColorStop(1, rgba(palette.accent, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(cx, baseY - 14 * S, 52 * S, 78 * S, 0, Math.PI, 0);
            ctx.fill();
        }
    }

    /* ---- the fountain at the Point ---- */
    function fountain(cx, baseY, S, t) {
        const q = paint();
        q.body(() => {
            ctx.moveTo(cx - 96 * S, baseY);
            ctx.lineTo(cx - 76 * S, baseY - 15 * S);
            ctx.lineTo(cx + 76 * S, baseY - 15 * S);
            ctx.lineTo(cx + 96 * S, baseY);
            ctx.closePath();
        });

        const pulse = reduceMotion ? 1 : 0.84 + 0.16 * Math.sin(t * 0.0009);
        const jh = 215 * S * pulse;
        const col = palette.light ? palette.surf : '#FFFFFF';
        const lip = baseY - 15 * S;

        // Main plume. The real one throws water 150 feet, so a thin sliver
        // undersells it — this is the widest, brightest thing on the page.
        const g = ctx.createLinearGradient(0, lip - jh, 0, lip);
        g.addColorStop(0, rgba(col, 0));
        g.addColorStop(0.35, rgba(col, palette.light ? 0.34 : 0.30));
        g.addColorStop(1, rgba(col, palette.light ? 0.8 : 0.78));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(cx - 13 * S, lip);
        ctx.quadraticCurveTo(cx - 20 * S, lip - jh * 0.55, cx - 3 * S, lip - jh);
        ctx.quadraticCurveTo(cx + 3 * S, lip - jh * 1.02, cx + 5 * S, lip - jh);
        ctx.quadraticCurveTo(cx + 21 * S, lip - jh * 0.55, cx + 13 * S, lip);
        ctx.closePath();
        ctx.fill();

        // spray breaking off the top of the column
        if (!reduceMotion) {
            for (let d = 0; d < 16; d += 1) {
                const age = ((t * 0.00022 + hash(d)) % 1);
                const spread = age * 46 * S * (hash(d + 40) - 0.5) * 2;
                const sy = lip - jh * (0.62 + age * 0.5);
                ctx.fillStyle = rgba(col, (1 - age) * 0.4);
                ctx.beginPath();
                ctx.arc(cx + spread, sy, (1.6 + hash(d + 9) * 1.8) * S, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // ring of side jets, arcing outward
        ctx.strokeStyle = rgba(col, palette.light ? 0.45 : 0.34);
        ctx.lineWidth = 1.4;
        for (let i = -3; i <= 3; i += 1) {
            if (!i) continue;
            const reach = 22 * S * Math.abs(i);
            ctx.beginPath();
            ctx.moveTo(cx, baseY - 18 * S);
            ctx.quadraticCurveTo(
                cx + reach * 0.6 * Math.sign(i),
                baseY - (58 + 14 * Math.abs(i)) * S * pulse,
                cx + reach * Math.sign(i),
                baseY - 15 * S
            );
            ctx.stroke();
        }
        if (!palette.light) {
            const glow = ctx.createRadialGradient(
                cx, baseY - 40 * S, 0,
                cx, baseY - 40 * S, 110 * S
            );
            glow.addColorStop(0, rgba(palette.accent, 0.16));
            glow.addColorStop(1, rgba(palette.accent, 0));
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, baseY - 40 * S, 110 * S, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const SHAPES = { incline, mill, cathedral, ppg, phipps, fountain };

    // Station 0 carries the Sisters instead: three suspension spans already
    // built, in the same slot the water video and the waveform occupy.
    function sisters(index, scrollY) {
        for (let i = 0; i < 3; i += 1) {
            spans.draw(index, { x: 0.15 + i * 0.26, t: 1 }, 0, scrollY);
        }
    }

    function station(index, kind, x, t, scrollY) {
        const height = geom.height();
        const top = geom.riverTopOf(index, scrollY);
        if (kind === 'sisters') {
            sisters(index, scrollY);
            return;
        }
        const S = clamp(height / 640, 0.72, 1.75);
        SHAPES[kind](geom.width() * (x || 0.62), top, S, t);
    }

    // The nameplate for whichever landmark is nearest its mark. Drawn on the
    // near bank under the landmark, at the end of the frame so no later station
    // paints over it, and faded by distance rather than switched on and off.
    function plate(index, name, year, scrollY, alpha) {
        if (alpha <= 0.01) return;
        const S = clamp(geom.height() / 640, 0.72, 1.75);
        const top = geom.riverTopOf(index, scrollY);
        const y = top + geom.riverH() + 26 * S;
        const x = 28;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.textBaseline = 'alphabetic';
        ctx.font = `600 ${Math.round(13 * S)}px "Space Mono", ui-monospace, monospace`;
        ctx.fillStyle = rgba(palette.structure, 0.92);
        ctx.fillText(name.toUpperCase(), x, y);
        ctx.font = `400 ${Math.round(11 * S)}px "Space Mono", ui-monospace, monospace`;
        ctx.fillStyle = rgba(palette.accent, 0.9);
        ctx.fillText(year, x, y + 16 * S);
        // A short rule under the plate, the width of the year, tying it down.
        ctx.strokeStyle = rgba(palette.accent, 0.55);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 5 * S);
        ctx.lineTo(x + 34 * S, y + 5 * S);
        ctx.stroke();
        ctx.restore();
    }

    return { station, plate };
}
