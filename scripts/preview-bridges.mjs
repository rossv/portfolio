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
// Run with --open to launch it, or publish the file as an artifact to review it
// somewhere other than this machine.

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

const [palette, shapes, kit] = await Promise.all([
    readFile(join(mode, 'palette.js'), 'utf8'),
    readFile(join(mode, 'bridgeShapes.js'), 'utf8'),
    readFile(join(mode, 'bridgeKit.js'), 'utf8'),
].map((p) => p));

const source = [plain(palette), plain(shapes), plain(kit)].join('\n\n');

const html = `<title>Pittsburgh bridges — architecture review</title>
<style>
:root {
    --bg: #f4f6f8;
    --panel: #ffffff;
    --line: #d7dee4;
    --text: #16212b;
    --muted: #5c6a76;
    --accent: #9a6b00;
    --shadow: 0 1px 2px rgba(20, 32, 44, 0.06), 0 8px 24px rgba(20, 32, 44, 0.06);
}
:root:not([data-theme="light"]) {
    @media (prefers-color-scheme: dark) {
        --bg: #0b1016;
        --panel: #131b24;
        --line: #26333f;
        --text: #e7eef4;
        --muted: #93a3b1;
        --accent: #ffb612;
        --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3);
    }
}
:root[data-theme="dark"] {
    --bg: #0b1016;
    --panel: #131b24;
    --line: #26333f;
    --text: #e7eef4;
    --muted: #93a3b1;
    --accent: #ffb612;
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3);
}
* { box-sizing: border-box; }
body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font: 15px/1.55 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
}
.wrap { max-width: 1180px; margin: 0 auto; padding: 40px 20px 80px; }
header { margin-bottom: 28px; }
h1 { font-size: clamp(24px, 4vw, 34px); line-height: 1.15; margin: 0 0 10px; letter-spacing: -0.02em; }
.lede { color: var(--muted); max-width: 68ch; margin: 0; }
.lede code { font-size: 0.9em; background: color-mix(in srgb, var(--text) 8%, transparent); padding: 1px 5px; border-radius: 4px; }

.controls {
    position: sticky; top: 0; z-index: 5;
    display: flex; flex-wrap: wrap; gap: 18px 26px; align-items: center;
    margin: 26px 0 30px; padding: 14px 18px;
    background: color-mix(in srgb, var(--panel) 92%, transparent);
    backdrop-filter: blur(8px);
    border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow);
}
.ctl { display: flex; align-items: center; gap: 9px; font-size: 13px; }
.ctl > label:first-child { color: var(--muted); white-space: nowrap; }
.ctl output { font-variant-numeric: tabular-nums; min-width: 3.2em; color: var(--text); font-weight: 600; }
input[type=range] { width: 132px; accent-color: var(--accent); }
.seg { display: inline-flex; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
.seg button {
    font: inherit; font-size: 13px; padding: 5px 12px; border: 0; cursor: pointer;
    background: transparent; color: var(--muted);
}
.seg button[aria-pressed=true] { background: var(--accent); color: var(--bg); font-weight: 600; }
.check { display: inline-flex; align-items: center; gap: 7px; cursor: pointer; font-size: 13px; color: var(--muted); }
.perf { margin-left: auto; font-size: 12px; color: var(--muted); font-variant-numeric: tabular-nums; }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(330px, 1fr)); gap: 20px; }
.card {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    overflow: hidden; box-shadow: var(--shadow);
    display: flex; flex-direction: column;
}
.card canvas { display: block; width: 100%; height: auto; cursor: pointer; }
.meta { padding: 13px 16px 16px; border-top: 1px solid var(--line); }
.name { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.name h2 { font-size: 16px; margin: 0; letter-spacing: -0.01em; }
.kind {
    font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.07em;
    color: var(--muted); border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px;
}
.real { margin: 3px 0 7px; font-size: 12.5px; color: var(--muted); }
.note { margin: 0; font-size: 13px; color: var(--text); opacity: 0.9; }
.facts { margin: 10px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 4px 14px; }
.facts li { font-size: 11.5px; color: var(--muted); font-variant-numeric: tabular-nums; }
.facts b { color: var(--text); font-weight: 600; }
footer { margin-top: 42px; padding-top: 22px; border-top: 1px solid var(--line); color: var(--muted); font-size: 13px; }
footer p { max-width: 74ch; }
</style>

<div class="wrap">
<header>
    <h1>Pittsburgh mode — the eleven bridges</h1>
    <p class="lede">Every bridge here is drawn by the site's own code: <code>bridgeShapes.js</code>
    through <code>bridgeKit.js</code>, on the same isometric lattice, at the same cell size, over a
    real channel. Click a bridge to rebuild it. The controls change what the site would draw, so
    anything that looks right here looks right there.</p>
</header>

<div class="controls">
    <div class="ctl">
        <label for="chunk">Member weight</label>
        <input id="chunk" type="range" min="0.6" max="2" step="0.05" value="1">
        <output id="chunkOut">1.00×</output>
    </div>
    <div class="ctl">
        <label for="cell">Cell</label>
        <input id="cell" type="range" min="30" max="64" step="1" value="38">
        <output id="cellOut">38px</output>
    </div>
    <div class="ctl">
        <label>Ground</label>
        <span class="seg" id="theme">
            <button data-theme="dark" aria-pressed="true">Dark</button>
            <button data-theme="light" aria-pressed="false">Light</button>
        </span>
    </div>
    <div class="ctl">
        <label>Channel</label>
        <span class="seg" id="kind">
            <button data-kind="water" aria-pressed="true">Water</button>
            <button data-kind="molten" aria-pressed="false">Molten</button>
        </span>
    </div>
    <label class="check"><input id="twin" type="checkbox" checked> Hot Metal pair</label>
    <label class="check"><input id="grow" type="checkbox"> Replay build</label>
    <span class="perf" id="perf"></span>
</div>

<div class="grid" id="grid"></div>

<footer>
    <p id="fact"></p>
    <p>Cell 38px is the live value in <code>lattice.js</code>. The larger cell sizes are here to
    judge the members at a size the site does not currently use — they are not a proposal.</p>
</footer>
</div>

<script>
${source}

// ---------------------------------------------------------------------------
// The harness: a patch of the real lattice, a river on it, and one card each.
// Everything above this line is the site's own source, inlined.
// ---------------------------------------------------------------------------

const SQUASH_UNUSED = 0;
const CHANNEL_WIDTH = 1.86;
const AXES = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const AXIS_SPREAD = Math.sin((2 * Math.PI) / 3);
const WIDEST = { water: 1.28, molten: 1.9 };
const ABUTMENT = 0.42;
const DECK_HALF = 0.34;
const spanFor = (kind) =>
    ((WIDEST[kind] ?? WIDEST.water) * CHANNEL_WIDTH * 0.5 + ABUTMENT) / AXIS_SPREAD;

const state = {
    chunk: 1,
    cell: 38,
    theme: 'dark',
    kind: 'water',
    twin: true,
    grow: false,
};

const cards = [];
const dpr = Math.min(2, window.devicePixelRatio || 1);

// A card's own little lattice. The river runs on AXES[0] and the deck therefore
// crosses on AXES[1], which is exactly the case on the site — rivers only ever
// run on an axis, and the deck always takes the other one.
function makeProjection(canvas, cell) {
    const W2 = cell * 0.866;
    const H2 = cell * 0.5;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    // Put the crossing node in the middle of the card, low enough to leave room
    // for a tall arch above it.
    return {
        W2,
        H2,
        project: (gx, gy) => [w / 2 + (gx - gy) * W2, h * 0.66 + (gx + gy) * H2],
    };
}

// A simplified channel: banks, water, and a lit thread down the middle. The real
// one carries tracers and crust plates; none of that changes how a bridge reads
// over it, and inlining channels.js would drag in the router with it.
function drawChannel(ctx, proj, p, kind, cell, nodes) {
    const pts = nodes.map(([gx, gy]) => proj.project(gx, gy));
    const run = (width, colour, alpha) => {
        ctx.strokeStyle = rgba(colour, alpha);
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
    };
    const w = CHANNEL_WIDTH * cell;
    if (kind === 'molten') {
        run(w * 1.9, p.glow, 0.12);
        run(w * 1.28, p.hot, 0.85);
        run(w, p.hotter, 0.9);
        run(w * 0.52, p.molten, 0.95);
    } else {
        run(w * 1.28, p.plate, 1);
        run(w, p.water, 1);
        run(w * 0.46, p.waterLit, 0.55);
        run(w * 0.14, p.surf, 0.5);
    }
}

function drawGround(ctx, proj, p, cell, w, h) {
    ctx.fillStyle = p.ground;
    ctx.fillRect(0, 0, w, h);
    // The lattice itself, as a faint dot at each node — the same field the
    // rivers are routed between.
    ctx.fillStyle = rgba(p.plate, p.light ? 0.9 : 0.7);
    for (let gx = -14; gx <= 14; gx += 1) {
        for (let gy = -14; gy <= 14; gy += 1) {
            const [x, y] = proj.project(gx, gy);
            if (x < -4 || x > w + 4 || y < -4 || y > h + 4) continue;
            ctx.fillRect(x - 1, y - 1, 2, 2);
        }
    }
}

function frameFor(proj, cell, span, half) {
    const deckAxis = AXES[1];
    const acrossAxis = AXES[0];
    const A = proj.project(-deckAxis[0] * span, -deckAxis[1] * span);
    const B = proj.project(deckAxis[0] * span, deckAxis[1] * span);
    const O = proj.project(0, 0);
    const W = proj.project(acrossAxis[0], acrossAxis[1]);
    const wx = (W[0] - O[0]) * half;
    const wy = (W[1] - O[1]) * half;
    return (t, s, z = 0) => [
        A[0] + (B[0] - A[0]) * t + wx * s,
        A[1] + (B[1] - A[1]) * t + wy * s - z,
    ];
}

let drawMs = 0;

function paint(card, now) {
    const { canvas, ctx, key, spec } = card;
    const p = paletteFor(state.theme === 'dark');
    const cell = state.cell;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const proj = makeProjection(canvas, cell);
    drawGround(ctx, proj, p, cell, w, h);
    const nodes = [];
    for (let i = -9; i <= 9; i += 1) nodes.push([i, 0]);
    drawChannel(ctx, proj, p, state.kind, cell, nodes);

    const span = spanFor(state.kind);
    const half = DECK_HALF * (spec.deckWidth ?? 1);
    const P = frameFor(proj, cell, span, half);
    const thick = cell * 0.16;

    const grow = card.born === null ? 1 : smooth(clamp((now - card.born) / 560, 0, 1));
    const to = Math.max(0.04, grow);

    const tints = TINTS[p.light ? 'light' : 'dark'];
    const hueFor = (hueKey) => {
        if (!hueKey || hueKey === 'bridge') return p.bridge;
        if (hueKey === 'gold') return p.accent;
        return tints[hueKey] ?? p.bridge;
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

    if (grow >= 1 && card.born !== null) card.born = null;
    void key;
}

// The structural family, for the badge on each card.
const FAMILY = {
    sisters: 'Self-anchored suspension',
    tenth: 'Self-anchored suspension',
    smithfield: 'Lenticular truss',
    fortpitt: 'Tied arch · double deck',
    fortduquesne: 'Tied arch',
    westend: 'Tied arch · braced rib',
    birmingham: 'Tied arch',
    mckeesrocks: 'Tied arch · deck truss',
    sixteenth: 'Open-spandrel deck arch',
    hotmetal: 'Pratt through truss',
    liberty: 'Camelback through truss',
};

const grid = document.getElementById('grid');
for (const key of BRIDGE_ORDER) {
    const spec = BRIDGES[key];
    const card = document.createElement('div');
    card.className = 'card';
    const piers = spec.piers ?? [0, 1];
    const river = piers.filter((f) => f > 0.001 && f < 0.999).length;
    card.innerHTML = \`
        <canvas></canvas>
        <div class="meta">
            <div class="name"><h2>\${spec.label}</h2><span class="kind">\${FAMILY[key] ?? ''}</span></div>
            <p class="real">\${spec.real}</p>
            <p class="note">\${spec.note}</p>
            <ul class="facts">
                <li>spans <b>\${piers.length - 1}</b></li>
                <li>river piers <b>\${river}</b></li>
                <li>deck <b>\${(spec.deckWidth ?? 1).toFixed(2)}×</b></li>
                <li>paint <b>\${spec.hue === 'gold' ? 'Aztec gold' : spec.hue}</b></li>
            </ul>
        </div>\`;
    grid.appendChild(card);
    const canvas = card.querySelector('canvas');
    const entry = {
        canvas,
        ctx: canvas.getContext('2d'),
        key,
        spec,
        born: null,
    };
    canvas.addEventListener('click', () => { entry.born = performance.now(); });
    cards.push(entry);
}

function resize() {
    for (const card of cards) {
        const w = card.canvas.clientWidth || 330;
        const h = Math.round(w * 0.72);
        card.canvas.width = Math.round(w * dpr);
        card.canvas.height = Math.round(h * dpr);
        card.canvas.style.height = h + 'px';
    }
}

let frames = 0;
let acc = 0;
let last = performance.now();
function tick(now) {
    drawMs = 0;
    for (const card of cards) paint(card, now);
    frames += 1;
    acc += drawMs;
    if (now - last > 500) {
        document.getElementById('perf').textContent =
            \`\${(acc / frames).toFixed(2)} ms to draw all 11 · \${(acc / frames / 11).toFixed(3)} ms each\`;
        frames = 0;
        acc = 0;
        last = now;
    }
    requestAnimationFrame(tick);
}

// --- controls ---
const chunk = document.getElementById('chunk');
const chunkOut = document.getElementById('chunkOut');
chunk.addEventListener('input', () => {
    state.chunk = Number(chunk.value);
    chunkOut.textContent = state.chunk.toFixed(2) + '×';
});
const cellIn = document.getElementById('cell');
const cellOut = document.getElementById('cellOut');
cellIn.addEventListener('input', () => {
    state.cell = Number(cellIn.value);
    cellOut.textContent = state.cell + 'px';
});
for (const [id, prop, attr] of [['theme', 'theme', 'theme'], ['kind', 'kind', 'kind']]) {
    document.getElementById(id).addEventListener('click', (e) => {
        const button = e.target.closest('button');
        if (!button) return;
        state[prop] = button.dataset[attr];
        for (const b of document.getElementById(id).querySelectorAll('button')) {
            b.setAttribute('aria-pressed', String(b === button));
        }
        if (id === 'theme') document.documentElement.dataset.theme = state.theme;
    });
}
document.getElementById('twin').addEventListener('change', (e) => {
    state.twin = e.target.checked;
});
document.getElementById('grow').addEventListener('change', (e) => {
    if (!e.target.checked) return;
    for (const [i, card] of cards.entries()) card.born = performance.now() + i * 90;
    setTimeout(() => { e.target.checked = false; }, 1800);
});

document.documentElement.dataset.theme = 'dark';
document.getElementById('fact').textContent =
    'Member weights are fractions of a lattice cell: '
    + Object.entries(MEMBERS).map(([k, v]) => k + ' ' + v).join(', ')
    + \` — each multiplied by the cell (\${state.cell}px) and the weight dial.\`;

window.addEventListener('resize', resize);
resize();
requestAnimationFrame(tick);
void SQUASH_UNUSED;
</script>
`;

await mkdir(join(root, 'preview'), { recursive: true });
const out = join(root, 'preview', 'bridges.html');
await writeFile(out, html, 'utf8');
process.stdout.write(`wrote ${out}\n`);
