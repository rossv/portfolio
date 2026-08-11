// Builds the bridge review page.
//
// The page is generated rather than written, and generated out of the site's own
// source: `palette.js`, `bridgeShapes.js` and `bridgeKit.js` are read off disk,
// stripped of their import and export keywords, and inlined into one script tag.
// So the eleven bridges in the gallery are the eleven bridges on the site, drawn
// by the same code through the same isometric projection — not a second set of
// drawings that will drift away from the first one by Thursday.
//
// The harness around them is the only thing this file adds: a patch of lattice,
// a river on it, and the controls.
//
//   node scripts/preview-bridges.mjs
//   → preview/bridges.html
//
// Open that file, or publish it as an artifact to review it somewhere other than
// this machine.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const mode = join(root, 'src', 'utils', 'pghMode');

// Strip the module syntax, leaving plain script. Every one of these files keeps
// its imports on single lines for exactly this reason.
const plain = (src) => src
    .split('\n')
    .filter((line) => !/^\s*import\s.*from\s.*;\s*$/.test(line))
    .join('\n')
    .replace(/^export const /gm, 'const ')
    .replace(/^export function /gm, 'function ')
    .replace(/^export \{[^}]*\};?\s*$/gm, '');

// lattice.js comes in too, so the harness uses the real CHANNEL_WIDTH,
// CHANNEL_EDGE and AXES rather than its own copies of them. Its createLattice is
// not used — the cards each build their own small projection — but every number
// the channel and the bridge span are derived from is the site's.
const [palette, lattice, shapes, kit] = await Promise.all([
    readFile(join(mode, 'palette.js'), 'utf8'),
    readFile(join(mode, 'lattice.js'), 'utf8'),
    readFile(join(mode, 'bridgeShapes.js'), 'utf8'),
    readFile(join(mode, 'bridgeKit.js'), 'utf8'),
]);

const source = [plain(palette), plain(lattice), plain(shapes), plain(kit)].join('\n\n');

// The source goes in through a placeholder rather than an interpolation, because
// `palette.js` is full of template literals of its own and interpolating the file
// would evaluate every one of them here instead of in the browser.
const PLACEHOLDER = '/* __INLINED_SOURCE__ */';

const page = `<title>Pittsburgh bridges — architecture review</title>
<style>
/* Neutrals carry a blue-steel bias off the river tokens in palette.js, so the
   page around the canvases belongs to the same world as what is inside them.
   The accent is the site's own gold, deepened on paper exactly as palette.js
   deepens it — #FFB612 on white is a highlighter. */
:root {
    --ground: #edf1f4;
    --panel: #ffffff;
    --sunk: #e3e9ee;
    --line: #ccd8e0;
    --ink: #101a21;
    --muted: #566875;
    --gold: #9a6b00;
    --lift: 0 1px 1px rgba(16, 26, 33, 0.05), 0 10px 26px rgba(16, 26, 33, 0.07);

    --display: "Segoe UI Variable Display", "Segoe UI Semibold", "Segoe UI", system-ui, sans-serif;
    --body: "Segoe UI Variable Text", "Segoe UI", system-ui, -apple-system, sans-serif;
    --data: "Cascadia Mono", Consolas, "SF Mono", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
        --ground: #0a0f14;
        --panel: #121a21;
        --sunk: #0d141a;
        --line: #223039;
        --ink: #e6eef3;
        --muted: #8ca0ae;
        --gold: #ffb612;
        --lift: 0 1px 1px rgba(0, 0, 0, 0.5), 0 10px 26px rgba(0, 0, 0, 0.34);
    }
}
:root[data-theme="dark"] {
    --ground: #0a0f14;
    --panel: #121a21;
    --sunk: #0d141a;
    --line: #223039;
    --ink: #e6eef3;
    --muted: #8ca0ae;
    --gold: #ffb612;
    --lift: 0 1px 1px rgba(0, 0, 0, 0.5), 0 10px 26px rgba(0, 0, 0, 0.34);
}

* { box-sizing: border-box; }
body {
    margin: 0;
    background: var(--ground);
    color: var(--ink);
    font: 15px/1.6 var(--body);
    -webkit-font-smoothing: antialiased;
}
.wrap {
    max-width: 1160px;
    margin: 0 auto;
    padding: 44px 20px 72px;
    display: flex;
    flex-direction: column;
    gap: 34px;
}

/* --- masthead --- */
.masthead { display: flex; flex-direction: column; gap: 12px; }
.eyebrow {
    font: 600 11px/1 var(--data);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--gold);
}
h1 {
    font-family: var(--display);
    font-weight: 700;
    font-size: clamp(27px, 4.4vw, 40px);
    line-height: 1.08;
    letter-spacing: -0.025em;
    text-wrap: balance;
    margin: 0;
    max-width: 22ch;
}
.lede { color: var(--muted); max-width: 66ch; margin: 0; }
.lede code { font: 0.88em var(--data); color: var(--ink); }

/* --- control bar --- */
.controls {
    position: sticky;
    top: 0;
    z-index: 5;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 24px;
    padding: 13px 17px;
    background: color-mix(in srgb, var(--panel) 90%, transparent);
    backdrop-filter: blur(10px);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: var(--lift);
}
.ctl { display: flex; align-items: center; gap: 9px; }
.ctl > .tag { font: 600 10.5px/1 var(--data); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
.ctl output { font: 13px/1 var(--data); font-variant-numeric: tabular-nums; min-width: 3.6em; }
input[type=range] { width: 124px; accent-color: var(--gold); }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }
.seg button {
    font: 13px/1 var(--body);
    padding: 6px 12px;
    border: 0;
    cursor: pointer;
    background: transparent;
    color: var(--muted);
}
.seg button[aria-pressed=true] { background: var(--gold); color: var(--panel); font-weight: 600; }
.check { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; font-size: 13px; color: var(--muted); }
button:focus-visible, input:focus-visible, canvas:focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 2px;
}
.perf { margin-left: auto; font: 12px/1 var(--data); font-variant-numeric: tabular-nums; color: var(--muted); }

/* --- families ---
   The eleven group into five structures. That grouping is the review question:
   two bridges in the same family have to still read as two bridges. */
#families { display: flex; flex-direction: column; gap: 34px; }
.family { display: flex; flex-direction: column; gap: 14px; }
.family > header { display: flex; flex-direction: column; gap: 4px; }
.family h2 {
    font-family: var(--display);
    font-size: 19px;
    font-weight: 600;
    letter-spacing: -0.015em;
    margin: 0;
    display: flex;
    align-items: baseline;
    gap: 10px;
}
.family h2 .count { font: 400 11.5px/1 var(--data); color: var(--muted); }
.family > header p { margin: 0; font-size: 13.5px; color: var(--muted); max-width: 74ch; }
.rule { height: 1px; background: var(--line); }

/* Every card is the same width, and therefore every model is drawn at the same
   scale. That is the page's whole job — the question is whether eleven bridges
   read as eleven at the size the site actually draws them, and a card widened to
   fill a short row would answer a different question. Short rows it is. */
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(322px, 1fr)); gap: 18px; }
.card {
    display: flex;
    flex-direction: column;
    background: var(--panel);
    border: 1px solid var(--line);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: var(--lift);
}
.card canvas { display: block; width: 100%; height: auto; cursor: pointer; background: var(--sunk); }
.meta { display: flex; flex-direction: column; gap: 7px; padding: 13px 15px 15px; border-top: 1px solid var(--line); }
.meta h3 { font-family: var(--display); font-size: 15.5px; font-weight: 600; letter-spacing: -0.01em; margin: 0; }
.real { font: 11.5px/1.4 var(--data); color: var(--muted); margin: -4px 0 0; }
.note { margin: 0; font-size: 13px; color: var(--ink); }
.facts { margin: 2px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 3px 14px; }
.facts li { font: 11px/1.5 var(--data); font-variant-numeric: tabular-nums; color: var(--muted); }
.facts b { color: var(--ink); font-weight: 600; }
.facts .gold { color: var(--gold); font-weight: 600; }

/* --- footer --- */
footer { display: flex; flex-direction: column; gap: 10px; padding-top: 20px; border-top: 1px solid var(--line); }
footer p { margin: 0; font-size: 13px; color: var(--muted); max-width: 76ch; }
.weights { overflow-x: auto; }
.weights table { border-collapse: collapse; font: 12px/1 var(--data); font-variant-numeric: tabular-nums; }
.weights th, .weights td { text-align: right; padding: 5px 12px 5px 0; white-space: nowrap; }
.weights th { color: var(--muted); font-weight: 400; text-align: right; }
.weights tbody th { text-align: left; color: var(--ink); }
</style>

<div class="wrap">
<header class="masthead">
    <span class="eyebrow">Pittsburgh mode · click-to-build</span>
    <h1>Eleven bridges, drawn as the bridges they are</h1>
    <p class="lede">Every model here comes from the site's own source — <code>bridgeShapes.js</code>
    through <code>bridgeKit.js</code> — on the same isometric lattice, at the same cell size, over a
    real channel. Nothing was redrawn for this page. Click a bridge to rebuild it; the controls
    change what the site itself would draw.</p>
</header>

<div class="controls">
    <div class="ctl">
        <label class="tag" for="chunk">Weight</label>
        <input id="chunk" type="range" min="0.5" max="2" step="0.05" value="0.75">
        <output id="chunkOut">0.75×</output>
    </div>
    <div class="ctl">
        <label class="tag" for="deck">Deck</label>
        <input id="deck" type="range" min="0.2" max="1" step="0.02" value="0.82">
        <output id="deckOut">82%</output>
    </div>
    <div class="ctl">
        <label class="tag" for="cell">Cell</label>
        <input id="cell" type="range" min="30" max="64" step="1" value="38">
        <output id="cellOut">38px</output>
    </div>
    <div class="ctl">
        <span class="tag">Ground</span>
        <span class="seg" id="theme">
            <button type="button" data-theme="dark" aria-pressed="true">Dark</button>
            <button type="button" data-theme="light" aria-pressed="false">Light</button>
        </span>
    </div>
    <div class="ctl">
        <span class="tag">Channel</span>
        <span class="seg" id="kind">
            <button type="button" data-kind="water" aria-pressed="true">Water</button>
            <button type="button" data-kind="molten" aria-pressed="false">Molten</button>
        </span>
    </div>
    <label class="check"><input id="twin" type="checkbox" checked> Hot Metal pair</label>
    <label class="check"><input id="grow" type="checkbox"> Replay build</label>
    <span class="perf" id="perf"></span>
</div>

<main id="families"></main>

<footer>
    <p>Member thicknesses are fractions of a lattice cell, so they hold their weight if the cell
    changes. Each is multiplied by the cell and by the weight dial above.</p>
    <div class="weights"><table id="weights">
        <thead><tr><th>member</th><th>cell fraction</th><th>px at 38 · 1.25×</th></tr></thead>
        <tbody></tbody>
    </table></div>
    <p>Cell 38px is the live value in <code>lattice.js</code>. The larger cell sizes are here to
    judge the members at a size the site does not currently use — they are not a proposal.</p>
</footer>
</div>

<script>
${PLACEHOLDER}

// ---------------------------------------------------------------------------
// The harness: a patch of the real lattice, a river on it, and one card each.
// Everything above this line is the site's own source, inlined.
// ---------------------------------------------------------------------------

// The three numbers bridges.js derives its span from. CHANNEL_WIDTH and
// CHANNEL_EDGE come from the inlined lattice.js above.
const AXIS_SPREAD = Math.sin((2 * Math.PI) / 3);
const ABUTMENT = 0.42;
const DECK_HALF = 0.34;
const SPAN = (CHANNEL_EDGE * CHANNEL_WIDTH * 0.5 + ABUTMENT) / AXIS_SPREAD;

const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const state = {
    chunk: CHUNK,
    deckAlpha: DECK_ALPHA,
    cell: 38,
    theme: 'dark',
    kind: 'water',
    twin: true,
};
const cards = [];
const dpr = Math.min(2, window.devicePixelRatio || 1);

// A card's own little lattice. The river runs on AXES[0] and the deck therefore
// crosses on AXES[1], which is exactly the case on the site — rivers only ever
// run on an axis, and the deck always takes the other one.
function makeProjection(canvas, cell) {
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const W2 = cell * 0.866;
    const H2 = cell * 0.5;
    // Two thirds down, so a tall arch has room over the crossing node.
    return (gx, gy) => [w / 2 + (gx - gy) * W2, h * 0.66 + (gx + gy) * H2];
}

// A simplified channel: banks, water, and a lit thread down the middle. The real
// one carries tracers and crust plates; none of that changes how a bridge reads
// over it, and inlining channels.js would drag the whole router in with it.
function drawChannel(ctx, project, p, kind, cell) {
    const pts = [];
    for (let i = -10; i <= 10; i += 1) pts.push(project(i, 0));
    const run = (width, colour, alpha) => {
        ctx.strokeStyle = rgba(colour, alpha);
        ctx.lineWidth = width;
        ctx.lineCap = 'butt';
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
    };
    // Both kinds reach exactly CHANNEL_EDGE, which is the point of that constant.
    const w = CHANNEL_WIDTH * cell;
    run(w * CHANNEL_EDGE, p.plate, 0.95);
    if (kind === 'molten') {
        run(w * CHANNEL_EDGE, p.glow, p.light ? 0.13 : 0.22);
        run(w, p.hot, 0.9);
        run(w * 0.46, p.hotter, 0.72);
        run(w * 0.14, p.molten, 0.72);
    } else {
        run(w, p.water, 0.98);
        run(w * 0.52, p.waterLit, 0.42);
        run(w * 0.14, p.surf, 0.42);
    }
}

function drawGround(ctx, project, p, w, h) {
    ctx.fillStyle = p.ground;
    ctx.fillRect(0, 0, w, h);
    // The lattice itself, a faint mark at each node — the field the rivers are
    // routed between and the bridges are placed on.
    ctx.fillStyle = rgba(p.plate, p.light ? 0.95 : 0.75);
    for (let gx = -16; gx <= 16; gx += 1) {
        for (let gy = -16; gy <= 16; gy += 1) {
            const [x, y] = project(gx, gy);
            if (x < -3 || x > w + 3 || y < -3 || y > h + 3) continue;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
    }
}

function frameFor(project, span, half) {
    const deckAxis = AXES[1];
    const acrossAxis = AXES[0];
    const A = project(-deckAxis[0] * span, -deckAxis[1] * span);
    const B = project(deckAxis[0] * span, deckAxis[1] * span);
    const O = project(0, 0);
    const W = project(acrossAxis[0], acrossAxis[1]);
    const wx = (W[0] - O[0]) * half;
    const wy = (W[1] - O[1]) * half;
    return (t, s, z = 0) => [
        A[0] + (B[0] - A[0]) * t + wx * s,
        A[1] + (B[1] - A[1]) * t + wy * s - z,
    ];
}

let drawMs = 0;

function paint(card, now) {
    const { canvas, ctx, spec } = card;
    const p = paletteFor(state.theme === 'dark');
    const cell = state.cell;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const project = makeProjection(canvas, cell);
    drawGround(ctx, project, p, w, h);
    drawChannel(ctx, project, p, state.kind, cell);

    const P = frameFor(project, SPAN, DECK_HALF * (spec.deckWidth ?? 1));
    const thick = cell * 0.16;
    const grow = card.born === null ? 1 : smooth(clamp((now - card.born) / 560, 0, 1));
    const to = Math.max(0.04, grow);

    const tints = TINTS[p.light ? 'light' : 'dark'];
    const hueFor = (key) => {
        if (!key || key === 'bridge') return p.bridge;
        if (key === 'gold') return p.accent;
        return tints[key] ?? p.bridge;
    };

    const started = performance.now();
    const kit = createKit(ctx, {
        P,
        palette: p,
        g: 1,
        k: smooth(clamp((grow - 0.4) / 0.6, 0, 1)),
        thick,
        cell,
        hue: hueFor(spec.hue),
        trim: spec.trim ? hueFor(spec.trim) : null,
        twin: spec.twin === true && state.twin,
        chunk: state.chunk,
        deckAlpha: state.deckAlpha,
    });

    const [sLo, sHi] = spec.shadow ?? [-1.5, 1.5];
    kit.shadow(to, sLo, sHi);
    const depth = cell * 0.34 * (spec.pierDepth ?? 1);
    for (const at01 of spec.piers ?? [0, 1]) {
        if (to < at01 - 0.02) continue;
        kit.pier(at01, depth);
    }
    kit.deck(to);
    if (grow > 0.4) spec.draw(kit);
    drawMs += performance.now() - started;

    if (grow >= 1) card.born = null;
}

// The five structures the eleven fall into, and what separates the members of
// each. This is the review question: same family still has to mean two bridges.
const FAMILIES = [
    {
        title: 'Self-anchored suspension',
        note: 'Both hang their deck from a chain or cable that dies into the deck ends rather'
            + ' than into a ground anchorage. Eyebars against wire rope is the whole difference.',
        keys: ['sisters', 'tenth'],
    },
    {
        title: 'Lenticular truss',
        note: 'One of a kind in the city, and the only bridge here whose bottom chord bows'
            + ' below its own deck.',
        keys: ['smithfield'],
    },
    {
        title: 'Tied arch',
        note: 'The crowded family, and the one to judge hardest. Fort Pitt and Fort Duquesne both'
            + ' carry two decks and separate on rise and width; the West End rib is braced and'
            + ' white; Birmingham braces overhead in Xs; McKees Rocks flanks its arch with deck'
            + ' trusses; and Sixteenth Street does the arch three times at two different rises.',
        keys: ['fortpitt', 'fortduquesne', 'westend', 'birmingham', 'mckeesrocks', 'sixteenth'],
    },
    {
        title: 'Through truss',
        note: 'Three bowstring spans of unequal size, with the road bridge alongside carrying'
            + ' no truss at all.',
        keys: ['hotmetal'],
    },
    {
        title: 'Deck truss',
        note: 'The odd one out: everything below the roadway and nothing above it.',
        keys: ['liberty'],
    },
];

const families = document.getElementById('families');

for (const family of FAMILIES) {
    const section = document.createElement('section');
    section.className = 'family';
    const plural = family.keys.length === 1 ? 'bridge' : 'bridges';
    section.innerHTML = \`
        <header>
            <h2>\${family.title} <span class="count">\${family.keys.length} \${plural}</span></h2>
            <p>\${family.note}</p>
        </header>
        <div class="rule"></div>
        <div class="grid"></div>\`;
    const grid = section.querySelector('.grid');

    for (const key of family.keys) {
        const spec = BRIDGES[key];
        const piers = spec.piers ?? [0, 1];
        const river = piers.filter((f) => f > 0.001 && f < 0.999).length;
        const paint2 = spec.hue === 'gold'
            ? '<span class="gold">Aztec gold</span>'
            : \`<b>\${spec.hue}</b>\`;
        const card = document.createElement('article');
        card.className = 'card';
        card.innerHTML = \`
            <canvas tabindex="0" aria-label="\${spec.label}, \${family.title}"></canvas>
            <div class="meta">
                <h3>\${spec.label}</h3>
                <p class="real">\${spec.real}</p>
                <p class="note">\${spec.note}</p>
                <ul class="facts">
                    <li>spans <b>\${piers.length - 1}</b></li>
                    <li>piers in water <b>\${river}</b></li>
                    <li>deck <b>\${(spec.deckWidth ?? 1).toFixed(2)}×</b></li>
                    <li>paint \${paint2}</li>
                </ul>
            </div>\`;
        grid.appendChild(card);
        const canvas = card.querySelector('canvas');
        const entry = { canvas, ctx: canvas.getContext('2d'), key, spec, born: null };
        const rebuild = () => {
            entry.born = still ? null : performance.now();
            schedule();
        };
        canvas.addEventListener('click', rebuild);
        canvas.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            rebuild();
        });
        cards.push(entry);
    }
    families.appendChild(section);
}

// --- painting ---
//
// On demand, not on a permanent animation loop. The models are static once
// built, so a standing requestAnimationFrame would burn a frame budget redrawing
// eleven identical canvases forever — and it would be motion a reader who asked
// for none never agreed to.
let queued = false;
const perf = document.getElementById('perf');

// The quickest pass seen, not the last one. A single frame is a noisy way to time
// eleven canvases — the first pass after a reload pays for the JIT, and any pass
// can land on a collection — and the minimum is the honest estimate of what the
// draw actually costs. It is reset when the weight or the cell changes, because
// both of those genuinely change the cost.
let bestMs = Infinity;
const resetTiming = () => { bestMs = Infinity; };

function paintAll(now) {
    drawMs = 0;
    for (const card of cards) paint(card, now);
    if (drawMs < bestMs) bestMs = drawMs;
    perf.textContent = \`\${bestMs.toFixed(2)} ms to draw 11 · \${(bestMs / 11).toFixed(3)} ms each\`;
}

function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame((now) => {
        queued = false;
        paintAll(now);
        if (cards.some((card) => card.born !== null)) schedule();
    });
}

function resize() {
    for (const card of cards) {
        const w = card.canvas.clientWidth || 322;
        const h = Math.round(w * 0.7);
        card.canvas.width = Math.round(w * dpr);
        card.canvas.height = Math.round(h * dpr);
        card.canvas.style.height = h + 'px';
    }
    schedule();
}

// --- controls ---
const chunk = document.getElementById('chunk');
const chunkOut = document.getElementById('chunkOut');
chunk.addEventListener('input', () => {
    state.chunk = Number(chunk.value);
    chunkOut.textContent = state.chunk.toFixed(2) + '×';
    fillWeights();
    resetTiming();
    schedule();
});
const deckIn = document.getElementById('deck');
const deckOut = document.getElementById('deckOut');
deckIn.addEventListener('input', () => {
    state.deckAlpha = Number(deckIn.value);
    deckOut.textContent = Math.round(state.deckAlpha * 100) + '%';
    schedule();
});
const cellIn = document.getElementById('cell');
const cellOut = document.getElementById('cellOut');
cellIn.addEventListener('input', () => {
    state.cell = Number(cellIn.value);
    cellOut.textContent = state.cell + 'px';
    fillWeights();
    resetTiming();
    schedule();
});
for (const [id, prop] of [['theme', 'theme'], ['kind', 'kind']]) {
    const group = document.getElementById(id);
    group.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        state[prop] = button.dataset[prop];
        for (const b of group.querySelectorAll('button')) {
            b.setAttribute('aria-pressed', String(b === button));
        }
        if (id === 'theme') document.documentElement.dataset.theme = state.theme;
        schedule();
    });
}
document.getElementById('twin').addEventListener('change', (e) => {
    state.twin = e.target.checked;
    schedule();
});
document.getElementById('grow').addEventListener('change', (e) => {
    if (!e.target.checked) return;
    if (!still) {
        for (const [i, card] of cards.entries()) card.born = performance.now() + i * 80;
        schedule();
    }
    setTimeout(() => { e.target.checked = false; }, 1600);
});

function fillWeights() {
    const body = document.querySelector('#weights tbody');
    body.innerHTML = Object.entries(MEMBERS).map(([name, v]) =>
        \`<tr><th>\${name}</th><td>\${v.toFixed(3)}</td><td>\${(v * state.cell * state.chunk).toFixed(2)}</td></tr>\`
    ).join('');
    document.querySelector('#weights thead th:last-child').textContent =
        \`px at \${state.cell} · \${state.chunk.toFixed(2)}×\`;
}

// The host may already have stamped a theme on the document; honour it rather
// than arguing with it, and only fall back to the media query when it has not.
const stamped = document.documentElement.dataset.theme;
state.theme = stamped === 'light' || stamped === 'dark'
    ? stamped
    : (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
document.documentElement.dataset.theme = state.theme;
for (const b of document.getElementById('theme').querySelectorAll('button')) {
    b.setAttribute('aria-pressed', String(b.dataset.theme === state.theme));
}

fillWeights();
window.addEventListener('resize', resize);
resize();
</script>
`;

// Replaced through a function, so a `$&` or a `$'` in the source cannot be read
// as a replacement pattern.
const html = page.replace(PLACEHOLDER, () => source);

await mkdir(join(root, 'preview'), { recursive: true });
const out = join(root, 'preview', 'bridges.html');
await writeFile(out, html, 'utf8');
process.stdout.write(`wrote ${out}\n`);
