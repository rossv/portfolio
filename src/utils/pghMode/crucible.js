// The ladle at the head of the molten river.
//
// Built as mill equipment rather than as a vessel on its own: an overhead crane
// beam, hoist ropes down to a sheave block, a heavy hook into the bail, and the
// ladle hanging in its trunnions under all of it. Most of what makes a photo of
// a pour read as industrial is the gear above the ladle, not the ladle.
//
// The yoke and the rigging do not rotate. The vessel turns on its trunnions
// inside the bail, which is how the real thing works.
//
// Timing lives in the scene: it decides when the pour starts and hands the tip
// down. Nothing here is tied to scroll.

import { rgba, clamp, hash } from './palette';

export function createCrucible(ctx, palette, lattice) {
    // The mouth's isometric squash. The pour geometry has to key off the same
    // number the mouth is drawn with, because the moment the lip is computed
    // on a circle instead it lands beside the painted rim.
    const MOUTH = 0.42;

    // The mouth's radius as a fraction of the shell's. Drawn at the full radius
    // the rim is tangent to the shell at the trunnion line, which leaves no wall
    // to see at the one place the vessel is widest — and because the shell starts
    // tapering immediately below that line, the lower arc of the rim then crosses
    // back over the outline it is supposed to sit inside. Holding it in gives the
    // vessel a wall you can see the thickness of, all the way round.
    const RIM = 0.94;

    const disc = (cx, cy, r, squash = MOUTH) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * squash, 0, 0, Math.PI * 2);
    };

    // A lifting chain, drawn along any segment. Links alternate face-on ring and
    // edge-on bar, and that alternation is the whole trick: a run of identical
    // ovals reads as a dotted line, while ring-bar-ring reads as steel links
    // passing through one another. Interlocked links overlap by a bar's width at
    // each end, so the pitch is shorter than a link.
    function chain(x0, y0, x1, y1, unit) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1;
        const rod = Math.max(1.6, unit * 0.24);
        const linkL = unit * 1.3;
        const linkW = unit * 0.82;
        const pitch = linkL - rod * 2;
        const count = Math.max(1, Math.round(len / pitch));

        ctx.save();
        ctx.translate(x0, y0);
        ctx.rotate(Math.atan2(dy, dx) - Math.PI / 2);   // chain runs down local +y
        ctx.lineCap = 'round';
        for (let i = 0; i < count; i += 1) {
            const yc = linkL * 0.5 + i * pitch;
            if (i % 2 === 0) {
                ctx.lineWidth = rod;
                ctx.strokeStyle = rgba(palette.steel, 0.95);
                ctx.beginPath();
                ctx.ellipse(0, yc, linkW * 0.5, linkL * 0.5, 0, 0, Math.PI * 2);
                ctx.stroke();
                // lit crown, shaded foot, so a link is forged and not outlined
                ctx.lineWidth = rod * 0.62;
                ctx.strokeStyle = rgba(palette.structure, 0.85);
                ctx.beginPath();
                ctx.ellipse(0, yc, linkW * 0.5, linkL * 0.5, 0, Math.PI * 1.12, Math.PI * 1.88);
                ctx.stroke();
                ctx.strokeStyle = rgba(palette.ground, 0.4);
                ctx.beginPath();
                ctx.ellipse(0, yc, linkW * 0.5, linkL * 0.5, 0, Math.PI * 0.12, Math.PI * 0.88);
                ctx.stroke();
            } else {
                ctx.lineWidth = rod * 1.55;
                ctx.strokeStyle = rgba(palette.steel, 0.95);
                ctx.beginPath();
                ctx.moveTo(0, yc - linkL * 0.5 + rod);
                ctx.lineTo(0, yc + linkL * 0.5 - rod);
                ctx.stroke();
                ctx.lineWidth = rod * 0.5;
                ctx.strokeStyle = rgba(palette.structure, 0.62);
                ctx.beginPath();
                ctx.moveTo(0, yc - linkL * 0.5 + rod * 1.2);
                ctx.lineTo(0, yc + linkL * 0.5 - rod * 1.2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // Under 90 degrees, deliberately. Tip a vessel past vertical and its near
    // lip swings round below and past the pivot, so the mouth ends up facing
    // away from where the iron is supposed to land and the stream appears to
    // start beside the ladle rather than out of it. At about 75 degrees the
    // mouth faces up-and-over and the low lip sits down-right, which is where
    // the ground is.
    const MAX_ANGLE = 1.32;

    function frame(anchor, t, tip, travel, reduceMotion) {
        const [ax, ay] = anchor;
        const S = lattice.cell();
        const R = S * 2.25;          // shell radius at the trunnion line
        const M = R * RIM;           // the mouth, held inside the shell
        const H = S * 2.85;          // barrel height
        const angle = tip * MAX_ANGLE;

        // Pivot: the trunnion line. The ladle travels along the girder before it
        // tips, from a parking spot at the far end of the bay to the pour, so the
        // crane reads as having fetched it rather than as having always been here.
        const py = ay - H * 1.5;
        const beamY = py - H * 1.5;
        const parkX = ax - S * 14;
        const pourX = ax - S * 2.6;
        const px = parkX + (pourX - parkX) * travel;

        // Everything the pour draws, in three layers that must agree with one
        // another: the spill sheet inside the mouth, the falling column, and
        // the crest at the lip. They all key off one shared fact: where the
        // DRAWN rim is lowest in world space. The rim is a squashed ellipse,
        // so its downhill point is not simply R along the tip angle, and iron
        // spills over whichever point of the edge hangs lowest as the vessel
        // turns.
        let pourGeom = null;
        if (tip > 0.07) {
            const strength = clamp((tip - 0.07) / 0.25, 0, 1);
            const theta = Math.atan2(MOUTH * Math.cos(angle), Math.sin(angle));
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const lx = Math.cos(theta) * M;
            const ly = Math.sin(theta) * M * MOUTH;
            const ox = lx * cosA - ly * sinA;
            const oy = lx * sinA + ly * cosA;
            const olen = Math.hypot(ox, oy) || 1;
            const w0 = S * 0.44 * strength;
            pourGeom = {
                strength,
                theta,
                w0,
                // The sheet and the column meet at the painted edge; if they
                // disagree about their width there, the join shows as a step.
                wLip: Math.max(w0 * 0.95, S * 0.05),
                ox,
                oy,
                dir: [ox / olen, oy / olen],
            };
        }

        /* ---------- the crane above ---------- */
        // The girder is fixed to the bay, not to the ladle: a crane rail does not
        // follow its load. It spans the whole hall so the ladle has somewhere to
        // have come from.
        const beamL = ax - S * 17.5;
        const beamR = ax + S * 5.5;
        ctx.fillStyle = rgba(palette.steel, 0.5);
        ctx.fillRect(beamL, beamY, beamR - beamL, S * 0.62);
        ctx.fillStyle = rgba(palette.structure, 0.34);
        ctx.fillRect(beamL, beamY, beamR - beamL, S * 0.16);
        ctx.fillStyle = rgba(palette.ground, 0.34);
        ctx.fillRect(beamL, beamY + S * 0.46, beamR - beamL, S * 0.16);
        // web stiffeners
        ctx.strokeStyle = rgba(palette.ground, 0.4);
        ctx.lineWidth = 1.4;
        for (let x = beamL + S; x < beamR; x += S * 1.4) {
            ctx.beginPath();
            ctx.moveTo(x, beamY + S * 0.1);
            ctx.lineTo(x, beamY + S * 0.56);
            ctx.stroke();
        }
        // end trucks, on the rails at either end of the bay
        ctx.fillStyle = rgba(palette.steel, 0.42);
        ctx.fillRect(beamL, beamY - S * 0.3, S * 0.5, S * 1.15);
        ctx.fillRect(beamR - S * 0.5, beamY - S * 0.3, S * 0.5, S * 1.15);

        // The trolley, which does travel: it is what carries the hoist along.
        ctx.fillStyle = rgba(palette.steel, 0.72);
        ctx.fillRect(px - S * 0.95, beamY - S * 0.34, S * 1.9, S * 0.4);
        ctx.fillStyle = rgba(palette.structure, 0.4);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(px + s * S * 0.6, beamY - S * 0.34, S * 0.14, 0, Math.PI * 2);
            ctx.fill();
        }

        /* ---------- hoist chains and sheave block ---------- */
        // Chains rather than wire rope. A ladle full of iron hangs on chain, and
        // two heavy runs carry the load where six hairlines just read as fuzz at
        // this size.
        const blockY = py - H * 0.62;
        for (const s of [-1, 1]) {
            chain(
                px + s * S * 0.34, beamY + S * 0.6,
                px + s * S * 0.16, blockY - S * 0.26,
                S * 0.34,
            );
        }
        // the block: a shackle plate carrying two sheaves
        ctx.fillStyle = rgba(palette.steel, 0.78);
        ctx.beginPath();
        ctx.roundRect?.(px - S * 0.62, blockY - S * 0.3, S * 1.24, S * 0.95, S * 0.22);
        if (!ctx.roundRect) ctx.rect(px - S * 0.62, blockY - S * 0.3, S * 1.24, S * 0.95);
        ctx.fill();
        ctx.fillStyle = rgba(palette.structure, 0.45);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(px + s * S * 0.26, blockY + S * 0.16, S * 0.24, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = rgba(palette.ground, 0.5);
        for (const s of [-1, 1]) {
            ctx.beginPath();
            ctx.arc(px + s * S * 0.26, blockY + S * 0.16, S * 0.08, 0, Math.PI * 2);
            ctx.fill();
        }

        /* ---------- the hook, into the bail ---------- */
        // The run from the block down to the hook is chain too, so the whole
        // lift reads as one rigged system rather than a hook on a stick.
        chain(px, blockY + S * 0.58, px, py - R * 0.78, S * 0.3);
        // the hook's throat, curling back on itself
        ctx.lineWidth = Math.max(3.4, S * 0.24);
        ctx.beginPath();
        ctx.arc(px + S * 0.34, py - R * 0.5, S * 0.44, Math.PI * 1.06, Math.PI * 0.36, false);
        ctx.stroke();

        // the bail: a heavy ring across the trunnions, which does not rotate
        ctx.strokeStyle = rgba(palette.steel, 0.86);
        ctx.lineWidth = Math.max(2.6, S * 0.15);
        ctx.beginPath();
        ctx.moveTo(px - R * 1.06, py);
        ctx.lineTo(px - R * 1.06, py - R * 0.42);
        ctx.lineTo(px + R * 1.06, py - R * 0.42);
        ctx.lineTo(px + R * 1.06, py);
        ctx.stroke();

        /* ---------- the ladle ---------- */
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);

        const bottomR = R * 0.8;
        const shell = ctx.createLinearGradient(-R, 0, R, 0);
        shell.addColorStop(0, rgba(palette.steel, 0.55));
        shell.addColorStop(0.26, rgba(palette.structure, 0.7));
        shell.addColorStop(0.55, rgba(palette.structure, 0.44));
        shell.addColorStop(1, rgba(palette.steel, 0.28));
        ctx.fillStyle = shell;
        ctx.beginPath();
        ctx.moveTo(-R, 0);
        ctx.lineTo(-bottomR, H * 0.8);
        ctx.quadraticCurveTo(0, H * 1.18, bottomR, H * 0.8);
        ctx.lineTo(R, 0);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = rgba(palette.steel, 0.9);
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // a heavy top collar, the thickest band on the vessel
        ctx.fillStyle = rgba(palette.steel, 0.72);
        ctx.fillRect(-R * 1.03, -S * 0.06, R * 2.06, S * 0.5);
        ctx.strokeStyle = rgba(palette.ground, 0.4);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-R * 1.03, -S * 0.06, R * 2.06, S * 0.5);

        // banding, riveted
        for (const f of [0.26, 0.5, 0.74]) {
            const halfW = R + (bottomR - R) * f;
            ctx.fillStyle = rgba(palette.steel, 0.55);
            ctx.fillRect(-halfW, H * f, halfW * 2, S * 0.3);
            ctx.strokeStyle = rgba(palette.ground, 0.35);
            ctx.lineWidth = 1;
            ctx.strokeRect(-halfW, H * f, halfW * 2, S * 0.3);
            ctx.fillStyle = rgba(palette.structure, 0.45);
            for (let i = -4; i <= 4; i += 1) {
                ctx.beginPath();
                ctx.arc((halfW * i) / 4.5, H * f + S * 0.15, Math.max(1, S * 0.036), 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // shadowed seam down the far side
        ctx.strokeStyle = rgba(palette.ground, 0.32);
        ctx.lineWidth = S * 0.2;
        ctx.beginPath();
        ctx.moveTo(R * 0.74, H * 0.06);
        ctx.quadraticCurveTo(R * 0.62, H * 0.62, bottomR * 0.7, H * 0.92);
        ctx.stroke();

        // slag streaks: the wear that stops it looking new
        ctx.strokeStyle = rgba(palette.crust ?? palette.ground, 0.22);
        ctx.lineWidth = S * 0.09;
        for (let i = 0; i < 5; i += 1) {
            const x = -R * 0.7 + hash(i * 3) * R * 1.4;
            ctx.beginPath();
            ctx.moveTo(x, S * 0.5);
            ctx.lineTo(x + (hash(i + 6) - 0.5) * S * 0.3, S * 0.5 + hash(i + 2) * H * 0.5);
            ctx.stroke();
        }

        // trunnion bosses on the pivot line
        for (const s of [-1, 1]) {
            ctx.fillStyle = rgba(palette.steel, 0.95);
            ctx.beginPath();
            ctx.arc(s * R * 1.02, 0, S * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(palette.structure, 0.6);
            ctx.beginPath();
            ctx.arc(s * R * 1.02, 0, S * 0.12, 0, Math.PI * 2);
            ctx.fill();
        }

        // rim and refractory lining
        ctx.fillStyle = rgba(palette.steel, 0.85);
        disc(0, 0, M);
        ctx.fill();
        ctx.fillStyle = rgba(palette.plate, 0.95);
        disc(0, 0, M * 0.85);
        ctx.fill();

        // the bath, its surface level in the world as the vessel turns
        const left = 1 - tip;
        if (left > 0.02) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, M * 0.85, M * 0.85 * MOUTH, 0, 0, Math.PI * 2);
            ctx.clip();
            ctx.rotate(-angle);
            const bath = ctx.createLinearGradient(0, -M * 0.4, 0, M * 0.4);
            bath.addColorStop(0, rgba(palette.molten, 0.98));
            bath.addColorStop(1, rgba(palette.hotter, 0.92));
            ctx.fillStyle = bath;
            ctx.fillRect(-M * 1.6, M * 0.32 - M * 0.86 * left, M * 3.2, M * 2.4);
            ctx.restore();
        }

        // The spill sheet: iron leaving the bath, converging on the rim's low
        // point and running out across the lip. Clipped to the mouth so it
        // stops at the painted edge, exactly where the falling column picks up
        // outside. Without this there is nothing tying the bath to the fall,
        // and the stream reads as starting in mid air beside the vessel.
        if (pourGeom) {
            const lx = Math.cos(pourGeom.theta) * M;
            const ly = Math.sin(pourGeom.theta) * M * MOUTH;
            // the rim's local tangent at the lip, for the sheet's width
            let tx = -Math.sin(pourGeom.theta) * M;
            let ty = Math.cos(pourGeom.theta) * M * MOUTH;
            const tl = Math.hypot(tx, ty) || 1;
            tx /= tl;
            ty /= tl;
            const wBase = M * (0.2 + 0.42 * pourGeom.strength);
            const wLip = pourGeom.wLip;
            ctx.save();
            disc(0, 0, M);
            ctx.clip();
            const sheet = ctx.createLinearGradient(lx * 0.12, ly * 0.12, lx, ly);
            sheet.addColorStop(0, rgba(palette.molten, 0.9));
            sheet.addColorStop(1, rgba(palette.hotter, 0.96));
            ctx.fillStyle = sheet;
            ctx.beginPath();
            ctx.moveTo(lx * 0.12 + tx * wBase, ly * 0.12 + ty * wBase);
            ctx.quadraticCurveTo(
                lx * 0.55 + tx * wBase * 0.5, ly * 0.55 + ty * wBase * 0.5,
                lx * 1.08 + tx * wLip, ly * 1.08 + ty * wLip,
            );
            ctx.lineTo(lx * 1.08 - tx * wLip, ly * 1.08 - ty * wLip);
            ctx.quadraticCurveTo(
                lx * 0.55 - tx * wBase * 0.5, ly * 0.55 - ty * wBase * 0.5,
                lx * 0.12 - tx * wBase, ly * 0.12 - ty * wBase,
            );
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // glare off the mouth
        const mouth = ctx.createRadialGradient(0, 0, 0, 0, 0, M * 1.7);
        mouth.addColorStop(0, rgba(palette.glow, 0.34 * (0.3 + left * 0.7)));
        mouth.addColorStop(1, rgba(palette.glow, 0));
        ctx.fillStyle = mouth;
        disc(0, 0, M * 1.7, 0.75);
        ctx.fill();

        ctx.restore();

        /* ---------- the stream ---------- */
        if (pourGeom) {
            const { strength, w0, wLip, dir, ox, oy } = pourGeom;
            // the lip in world space: the painted rim's lowest point
            const ex = px + ox;
            const ey = py + oy;

            // the flare around the whole pour
            const flare = ctx.createRadialGradient(
                (ex + ax) / 2, (ey + ay) / 2, 0,
                (ex + ax) / 2, (ey + ay) / 2, S * 4.5,
            );
            flare.addColorStop(0, rgba(palette.molten, 0.18 * strength));
            flare.addColorStop(0.35, rgba(palette.glow, 0.34 * strength));
            flare.addColorStop(1, rgba(palette.glow, 0));
            ctx.fillStyle = flare;
            ctx.beginPath();
            ctx.arc((ex + ax) / 2, (ey + ay) / 2, S * 4.5, 0, Math.PI * 2);
            ctx.fill();

            // The stream is a ribbon with a width profile, not a stroked arc.
            // Iron leaving a lip accelerates, and a falling stream has to thin as
            // it speeds up to carry the same iron — so it necks through the fall
            // and swells again where it piles into the ground. Three stacked
            // strokes of even width could not say any of that.
            //
            // The spine starts a shade inside the painted edge, under the spill
            // sheet, and leaves along the rim's outward downhill direction
            // rather than aiming at the landing. Gravity gets to bend it toward
            // the anchor on the way down, which is the difference between a
            // pour and a hose.
            const c0 = [px + ox * 0.94, py + oy * 0.94];
            const reach = Math.hypot(ax - c0[0], ay - c0[1]);
            const c1 = [c0[0] + dir[0] * reach * 0.32, c0[1] + dir[1] * reach * 0.32];
            const c2 = [ax - (ax - c0[0]) * 0.12, c0[1] + (ay - c0[1]) * 0.62];
            const c3 = [ax, ay];
            const at = (s) => {
                const m = 1 - s;
                return [
                    m * m * m * c0[0] + 3 * m * m * s * c1[0] + 3 * m * s * s * c2[0] + s * s * s * c3[0],
                    m * m * m * c0[1] + 3 * m * m * s * c1[1] + 3 * m * s * s * c2[1] + s * s * s * c3[1],
                ];
            };
            const widthAt = (s) => {
                const neck = w0 / Math.sqrt(1 + 2.8 * s);
                const swell = w0 * 0.6 * clamp((s - 0.76) / 0.24, 0, 1) ** 2;
                // A slow travelling undulation, so the column is never a static
                // arc: real iron ropes and wobbles on the way down.
                const flow = reduceMotion ? 1 : 1 + 0.14 * Math.sin(s * 8.5 - t * 0.005);
                return (neck + swell) * flow;
            };

            const STEPS = 34;
            const spine = [];
            for (let i = 0; i <= STEPS; i += 1) {
                const s = i / STEPS;
                const p = at(s);
                const q = at(Math.min(1, s + 0.01));
                const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
                spine.push({ s, p, n: [-(q[1] - p[1]) / len, (q[0] - p[0]) / len] });
            }
            const ribbon = (k) => {
                ctx.beginPath();
                spine.forEach(({ p, n, s }, i) => {
                    const w = widthAt(s) * k;
                    const x = p[0] + n[0] * w;
                    const y = p[1] + n[1] * w;
                    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                });
                for (let i = spine.length - 1; i >= 0; i -= 1) {
                    const { p, n, s } = spine[i];
                    const w = widthAt(s) * k;
                    ctx.lineTo(p[0] - n[0] * w, p[1] - n[1] * w);
                }
                ctx.closePath();
            };

            // heat haze around the column
            ctx.fillStyle = rgba(palette.glow, 0.32 * strength);
            ribbon(1.75);
            ctx.fill();

            // The body, hottest where it is thinnest and fastest. Its first
            // stop matches the spill sheet's last, so the hand-off at the rim
            // does not show as a colour step.
            const body = ctx.createLinearGradient(ex, ey, ax, ay);
            body.addColorStop(0, rgba(palette.hotter, 0.96));
            body.addColorStop(0.45, rgba(palette.molten, 0.98));
            body.addColorStop(1, rgba(palette.hot, 0.94));
            ctx.fillStyle = body;
            ribbon(1);
            ctx.fill();

            // The crest: the fold where the sheet turns over the edge, laid on
            // the seam between the sheet (which the mouth clips at the painted
            // rim) and the column that picks up outside it. It needs no
            // rotation: the lip is by construction the rim's lowest point, so
            // the rim runs horizontally through it.
            ctx.fillStyle = rgba(palette.molten, 0.9);
            ctx.beginPath();
            ctx.ellipse(ex, ey, wLip * 1.9, Math.max(S * 0.13, w0 * 0.5), 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = rgba(palette.crown, 0.5 * strength);
            ctx.beginPath();
            ctx.ellipse(ex, ey, wLip * 1.2, Math.max(S * 0.06, w0 * 0.24), 0, 0, Math.PI * 2);
            ctx.fill();

            // striations running down the inside, which is what reads as flow
            if (!reduceMotion) {
                ctx.lineWidth = Math.max(1, S * 0.035);
                for (let k = -1; k <= 1; k += 1) {
                    ctx.strokeStyle = rgba(palette.crown, 0.3 + Math.abs(k) * -0.12);
                    ctx.beginPath();
                    let started = false;
                    for (const { s, p, n } of spine) {
                        // each streak is a moving window down the column
                        const phase = (s * 2.4 - t * 0.0016 + k * 0.31) % 1;
                        if (phase < 0.08 || phase > 0.46) { started = false; continue; }
                        const off = widthAt(s) * k * 0.44;
                        const x = p[0] + n[0] * off;
                        const y = p[1] + n[1] * off;
                        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }

                // iron shedding off the edges on the way down
                for (let i = 0; i < 9; i += 1) {
                    const s = (hash(i * 13) + t * 0.0004) % 1;
                    const { p, n } = spine[Math.floor(s * STEPS)];
                    const side = hash(i) < 0.5 ? -1 : 1;
                    const drift = ((t * 0.0007 + hash(i + 2)) % 1);
                    const w = widthAt(s);
                    ctx.fillStyle = rgba(palette.hotter, (1 - drift) * 0.8);
                    ctx.beginPath();
                    ctx.arc(
                        p[0] + n[0] * side * (w + drift * S * 0.7),
                        p[1] + n[1] * side * (w * 0.4) + drift * S * 1.1,
                        S * 0.045 * (1 - drift) + 0.6, 0, Math.PI * 2,
                    );
                    ctx.fill();
                }
            }

            // The pool of light where it lands. Kept close to the trough it
            // lights: thrown wider, it stops reading as light off the iron and
            // starts reading as a painted ring on the floor.
            const poolR = S * 2.6;
            const pool = ctx.createRadialGradient(ax, ay, 0, ax, ay, poolR);
            pool.addColorStop(0, rgba(palette.molten, 0.34 * strength));
            pool.addColorStop(0.35, rgba(palette.glow, 0.26 * strength));
            pool.addColorStop(1, rgba(palette.glow, 0));
            ctx.fillStyle = pool;
            disc(ax, ay, poolR, 0.55);
            ctx.fill();

            // iron thrown back out of the impact, continuously
            if (!reduceMotion) {
                for (let i = 0; i < 22; i += 1) {
                    const age = ((t * 0.0016 + hash(i * 5)) % 1);
                    // named to stay clear of the stream's dir and reach above
                    const fling = hash(i) < 0.5 ? -1 : 1;
                    const span = S * (1 + hash(i + 3) * 2.6);
                    const sx = ax + fling * age * span;
                    const sy = ay - Math.sin(age * Math.PI) * S * (0.9 + hash(i + 9) * 1.7);
                    ctx.fillStyle = rgba(
                        age > 0.62 ? palette.hot : age > 0.3 ? palette.hotter : palette.molten,
                        (1 - age) * 0.9 * strength,
                    );
                    ctx.beginPath();
                    ctx.arc(sx, sy, S * 0.07 * (1 - age) + 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    return { frame };
}
