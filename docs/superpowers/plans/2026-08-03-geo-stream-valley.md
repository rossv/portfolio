# Geo Stream Valley Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the geospatial contour backdrop carve a valley along the same reach the hero's flood raster draws, with the ground falling downstream, so the two read as one landscape.

**Architecture:** The reach geometry moves out of `flood.js` into a new `reach.js` that both consumers read. `terrain.js` grows a pure `createSurface` export — peaks, downstream fall, the valley trench, and the elevation mapping — which `createTerrain` uses for drawing. Splitting the surface from the drawing is what makes the maths checkable in Node, since this repo has no browser test harness.

**Tech Stack:** Astro 4, React 18, plain ES modules, Canvas 2D. `package.json` has `"type": "module"`, so `src/utils/geoMode/*.js` can be imported directly by `node`.

**Spec:** `docs/superpowers/specs/2026-08-03-geo-stream-valley-contours-design.md`

## Global Constraints

- No test runner exists in this repo and none may be added (`CLAUDE.md`). Verification is: Node check scripts against the pure maths, `npm run build`, and a driven browser pass.
- Check scripts live in the scratchpad, never in the repo. Referred to below as `$SCRATCH`:
  `C:\Users\RVOLKW~1\AppData\Local\Temp\claude\C--GitRepos-portfolio\1437bb01-bfac-4383-8f58-4b5b6305287d\scratchpad`
- Two things the check scripts need, learned the hard way in Tasks 1 and 2. Import the modules
  by **absolute `file://` URL**, not by a relative path — the scratchpad is nowhere near the
  repo. And these modules import each other **extensionlessly** (`from './reach'`), which Vite
  resolves and plain `node` does not, so a script that reaches `terrain.js` needs a small
  scratchpad-only resolver shim. Do not "fix" the repo's import style to suit the checks.
- When a check fails, establish whether the assertion or the code is wrong before changing
  either. Task 2's first run failed on test data that asserted the valley was on screen at a
  scroll where it provably is not.
- Work in the worktree: `C:\GitRepos\portfolio\.claude\worktrees\geo-stream-valley`, branch `worktree-geo-stream-valley`.
- Settled values, exact — do not re-tune while implementing: valley depth `1.25`, valley half-width `90` px at `plainWidth` 1.0, downstream fall `0.90`, background drift `0.10 ×` scroll, elevation `940 + v × 120` rounded to `5` ft.
- The valley tracks the band one for one and leaves with it. No clamp, no resting line.
- Do not touch `flood.dim` — the band veil is explicitly out of scope.
- Do not add tributaries, hachures, or hypsometric tint. Do not reposition the five peaks.
- Comments follow the surrounding style in these files: explain *why*, in prose, not *what*.
- `src/data/*.json` is being edited by another process outside this worktree. Never stage it.

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/geoMode/reach.js` (new) | Where the water is: band top, band height, the meander, floodplain width. Imports nothing. |
| `src/utils/geoMode/flood.js` (modify) | Unchanged behaviour; reads its geometry from `reach.js` instead of owning it. |
| `src/utils/geoMode/terrain.js` (modify) | Gains `createSurface` (pure field + elevations) and consumes it for drawing. Marching squares and spot-elevation marks stay here. |
| `src/components/FluidBackground.jsx` (modify) | Passes `scrollY` into `terrain.frame` and `addPeak`, and the reduced-motion flag into `createTerrain`. |

---

### Task 1: Extract the reach into its own module

Pure refactor. Geo mode must look **identical** after this task.

**Files:**
- Create: `src/utils/geoMode/reach.js`
- Modify: `src/utils/geoMode/flood.js:14` (drop `BAND_TOP`), `:27-34` (`resize`), `:45-52` (drop `chanY`/`plainWidth`), and their call sites at `:110`, `:113`, `:155`
- Check: `$SCRATCH/checks/check-reach.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `BAND_TOP` (number, 80), `bandHeightFor(height) → number`, `createReach(width, height) → { width, height, bandH, chanY(x), plainWidth(nx) }`. `chanY` takes canvas x in px and returns y in **band-local** px. `plainWidth` takes normalised x (0–1) and returns a multiplier.

- [ ] **Step 1: Write the failing check**

The check pins the new module against the formulas as they exist today. Copy of the current
formulas is deliberate: it is the oracle, so it must not import the code under test.

Create `$SCRATCH/checks/check-reach.mjs`:

```js
// Oracle: the reach formulas as they stood inside flood.js before extraction.
const oldBandH = (h) => Math.max(250, Math.min(450, h * 0.3));
const oldChanY = (x, width, bandH) => bandH * 0.36
    + Math.sin((x / width) * 6.0) * bandH * 0.135
    + Math.sin((x / width) * 13.0 + 1.2) * bandH * 0.042;
const oldPlainWidth = (nx) => Math.max(0.35,
    0.86 + 0.32 * Math.sin(nx * 7.3 + 0.6) + 0.17 * Math.sin(nx * 17.1 + 2.1));

const { BAND_TOP, bandHeightFor, createReach } =
    await import('../../../../../GitRepos/portfolio/.claude/worktrees/geo-stream-valley/src/utils/geoMode/reach.js');

let failures = 0;
const ok = (name, cond, extra = '') => {
    if (!cond) { failures++; console.error(`FAIL ${name} ${extra}`); }
    else console.log(`ok   ${name}`);
};
const near = (a, b, eps = 1e-12) => Math.abs(a - b) <= eps;

ok('BAND_TOP is 80', BAND_TOP === 80, `got ${BAND_TOP}`);

// The band fills clamp(250px, 30vh, 450px).
ok('band height clamps low', bandHeightFor(600) === 250, `got ${bandHeightFor(600)}`);
ok('band height scales', bandHeightFor(900) === 270, `got ${bandHeightFor(900)}`);
ok('band height clamps high', bandHeightFor(2000) === 450, `got ${bandHeightFor(2000)}`);

for (const [w, h] of [[1440, 900], [390, 700], [3840, 2160]]) {
    const reach = createReach(w, h);
    const bandH = oldBandH(h);
    ok(`bandH ${w}x${h}`, reach.bandH === bandH, `got ${reach.bandH} want ${bandH}`);
    for (let i = 0; i <= 20; i++) {
        const x = (w * i) / 20;
        ok(`chanY ${w}x${h} x=${Math.round(x)}`,
            near(reach.chanY(x), oldChanY(x, w, bandH)),
            `got ${reach.chanY(x)} want ${oldChanY(x, w, bandH)}`);
        const nx = i / 20;
        ok(`plainWidth nx=${nx}`,
            near(reach.plainWidth(nx), oldPlainWidth(nx)),
            `got ${reach.plainWidth(nx)} want ${oldPlainWidth(nx)}`);
    }
}

console.log(failures ? `\n${failures} FAILURES` : '\nall checks passed');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Run the check to verify it fails**

Run from the worktree root:
`node "$SCRATCH/checks/check-reach.mjs"`

Expected: `ERR_MODULE_NOT_FOUND` for `reach.js`.

- [ ] **Step 3: Create `reach.js`**

```js
// Where the water is, in geospatial mode.
//
// The reach lived inside flood.js, which was fine while the raster was the only
// thing that needed it. The contour field now cuts a valley along the same line,
// and two copies of one meander is a desync waiting to happen — so the geometry
// sits here and both consumers read it.

export const BAND_TOP = 80;          // matches WaterBanner's `top-20`

// The band fills the slot the water video uses: clamp(250px, 30vh, 450px).
export const bandHeightFor = (height) => Math.max(250, Math.min(450, height * 0.3));

export function createReach(width, height) {
    const bandH = bandHeightFor(height);

    // A meander with non-harmonic terms, so it does not read as a sine wave.
    const chanY = (x) => bandH * 0.36
        + Math.sin((x / width) * 6.0) * bandH * 0.135
        + Math.sin((x / width) * 13.0 + 1.2) * bandH * 0.042;

    // Floodplain width along the reach: wide flats in places, pinched in others,
    // so an inundation edge reads as floodplain rather than as a buffer.
    const plainWidth = (nx) => Math.max(0.35,
        0.86 + 0.32 * Math.sin(nx * 7.3 + 0.6) + 0.17 * Math.sin(nx * 17.1 + 2.1));

    return { width, height, bandH, chanY, plainWidth };
}
```

The spec floated a `meander` helper for the two anchoring options that were not
chosen. "Let it go" needs no caller for it, and the spec says to cut it if so — do
not add it.

- [ ] **Step 4: Run the check to verify it passes**

Run: `node "$SCRATCH/checks/check-reach.mjs"`
Expected: `all checks passed`, exit 0.

- [ ] **Step 5: Point `flood.js` at the module**

In `src/utils/geoMode/flood.js`:

Add to the imports, below the existing `palette` import:

```js
import { BAND_TOP, createReach } from './reach';
```

Delete the local constant:

```js
const BAND_TOP = 80;          // matches WaterBanner's `top-20`
```

Add `reach` to the closure state beside `band`/`bandCtx`/`bandH`, then replace the body of
`resize` so the geometry comes from the module:

```js
    function resize(w, h) {
        width = w;
        reach = createReach(w, h);
        bandH = reach.bandH;
        band = document.createElement('canvas');
        band.width = Math.max(1, Math.floor(w));
        band.height = Math.max(1, Math.floor(bandH));
        bandCtx = band.getContext('2d');
    }
```

Delete the two local definitions — the comments above them move to `reach.js`, so remove
them here too:

```js
    const chanY = (x) => bandH * 0.36 + ...;
    const plainWidth = (nx) => Math.max(0.35, ...);
```

Update the three call sites to read from `reach`:
- in `frame`, `const line = chanY(cx);` → `const line = reach.chanY(cx);`
- in `frame`, `plainWidth(cx / width)` → `reach.plainWidth(cx / width)`
- in the centreline loop, both `chanY(x)` → `reach.chanY(x)`

- [ ] **Step 6: Verify the refactor changed nothing**

Run: `npm run build`
Expected: `[build] Complete!`, 4 pages, no errors.

Then start `npm run dev`, open `http://localhost:4321`, switch to geospatial mode (click
"GIS" in the hero paragraph), and confirm at desktop width: the raster band scans in, the
wetting and recession fronts cross, the centreline draws, and the contours are unchanged.
Check the console is clean.

- [ ] **Step 7: Commit**

```bash
git add src/utils/geoMode/reach.js src/utils/geoMode/flood.js
git commit -m "Move the reach out of flood.js into its own module"
```

---

### Task 2: Carve the valley along the reach

**Files:**
- Modify: `src/utils/geoMode/terrain.js` — constants at `:23-41`, replace `terrainAt`/`fieldAt` inside `createTerrain` with a new exported `createSurface`, update `frame` and `drawMarks`
- Modify: `src/components/FluidBackground.jsx:363` (pass scroll into `terrain.frame`)
- Check: `$SCRATCH/checks/check-surface.mjs`

**Interfaces:**
- Consumes: `BAND_TOP`, `createReach` from Task 1.
- Produces: `createSurface(width, height, placed) → { reach, terrainAt(nx, ny, t, scrollY), fieldAt(nx, ny, t, scrollY, mouse), elevationAt(nx, ny, t, scrollY) }`. `nx`/`ny` are normalised to the **viewport**, `t` is ms, `scrollY` is px. `terrainAt` returns field units; `elevationAt` returns feet rounded to 5. `createTerrain(ctx, palette, placed)` keeps its signature; its `frame` becomes `frame(t, dt, mouse, scrollY)`.

- [ ] **Step 1: Write the failing check**

Create `$SCRATCH/checks/check-surface.mjs`:

```js
const base = '../../../../../GitRepos/portfolio/.claude/worktrees/geo-stream-valley/src/utils/geoMode/';
const { createSurface } = await import(base + 'terrain.js');
const { BAND_TOP, createReach } = await import(base + 'reach.js');

let failures = 0;
const ok = (name, cond, extra = '') => {
    if (!cond) { failures++; console.error(`FAIL ${name} ${extra}`); }
    else console.log(`ok   ${name}`);
};

const W = 1440, H = 900;
const surface = createSurface(W, H, []);
const reach = createReach(W, H);

// 1. The trench sits under the raster's centreline, and follows it as it scrolls.
//    Tolerance is one grid cell: terrain.js samples at min(w,h)/46 ≈ 20px.
for (const scrollY of [0, 120, 300]) {
    for (const nx of [0.1, 0.3, 0.5, 0.7, 0.9]) {
        let bestNy = 0, best = Infinity;
        for (let i = 0; i <= 900; i++) {
            const ny = i / 900;
            const v = surface.terrainAt(nx, ny, 0, scrollY);
            if (v < best) { best = v; bestNy = ny; }
        }
        const want = BAND_TOP - scrollY + reach.chanY(nx * W);
        ok(`thalweg scroll=${scrollY} nx=${nx}`,
            Math.abs(bestNy * H - want) <= 24,
            `min at ${Math.round(bestNy * H)}px, reach at ${Math.round(want)}px`);
    }
}

// 2. The basin falls downstream, which is what aims the contour V's upstream.
const onThalweg = (nx, scrollY = 0) =>
    surface.terrainAt(nx, (BAND_TOP - scrollY + reach.chanY(nx * W)) / H, 0, scrollY);
ok('thalweg falls downstream',
    onThalweg(0.15) - onThalweg(0.85) > 0.3,
    `upstream ${onThalweg(0.15).toFixed(3)} downstream ${onThalweg(0.85).toFixed(3)}`);

// 3. The trench is a real cut: the floor sits well below the ground beside it.
for (const nx of [0.25, 0.55, 0.8]) {
    const thalwegNy = (BAND_TOP + reach.chanY(nx * W)) / H;
    const rimNy = thalwegNy + (3 * 90 * reach.plainWidth(nx)) / H;
    const cut = surface.terrainAt(nx, rimNy, 0, 0) - surface.terrainAt(nx, thalwegNy, 0, 0);
    ok(`trench depth nx=${nx}`, cut > 0.8, `cut ${cut.toFixed(3)}`);
}

// 4. Spot elevations stay plausible, including on stacked ground.
const stacked = [
    { x: 0.2, y: 0.3, shown: 2.4 },
    { x: 0.85, y: 0.75, shown: 2.4 },
];
const loaded = createSurface(W, H, stacked);
let lo = Infinity, hi = -Infinity, offStep = 0;
for (const scrollY of [0, 300]) {
    for (let i = 0; i <= 60; i++) {
        for (let j = 0; j <= 40; j++) {
            const ft = loaded.elevationAt(i / 60, j / 40, 0, scrollY);
            lo = Math.min(lo, ft); hi = Math.max(hi, ft);
            if (ft % 5 !== 0) offStep++;
        }
    }
}
ok('elevations plausible', lo >= 600 && hi <= 1300, `range ${lo}–${hi} ft`);
ok('elevations round to 5ft', offStep === 0, `${offStep} off-step values`);

// 5. The cursor probe still lifts the ground under the pointer.
const probe = surface.fieldAt(0.5, 0.5, 0, 0, { x: 720, y: 450 });
const bare = surface.terrainAt(0.5, 0.5, 0, 0);
ok('cursor probe raises the field', probe - bare > 0.6, `delta ${(probe - bare).toFixed(3)}`);

console.log(failures ? `\n${failures} FAILURES` : '\nall checks passed');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `node "$SCRATCH/checks/check-surface.mjs"`
Expected: `SyntaxError` — `createSurface` is not exported by `terrain.js`.

- [ ] **Step 3: Add the constants and the exported surface**

In `src/utils/geoMode/terrain.js`, add the import:

```js
import { BAND_TOP, createReach } from './reach';
```

Add beside the existing constants:

```js
const VALLEY_DEPTH = 1.25;     // how far the trench cuts below the ground
const VALLEY_HALF = 90;        // px to the trench shoulder, at plainWidth 1
const DOWNSTREAM_FALL = 0.9;   // fall from one side of the basin to the other
```

Replace the two existing elevation constants with the re-based pair. The old values
assumed a field of 0 to 2.4; a valley and a fall take it to about −2.2, which printed
170ft:

```js
// Feet, so a figure reads as an Allegheny-plateau spot elevation. Re-based for a
// field that now runs negative in the valley and at the downstream end.
const ELEV_BASE = 940;
const ELEV_SCALE = 120;
const ELEV_STEP = 5;           // the valley slides past a mark; don't churn digits
```

Now add `createSurface` above `createTerrain`, and delete `terrainAt` and `fieldAt` from
inside `createTerrain` — they move here:

```js
// The surface, with no canvas in sight: drifting peaks, anything clicked into the
// ground, the basin's fall, and the valley cut along the reach. Separate from the
// drawing so the shape of the ground can be checked without a browser.
export function createSurface(width, height, placed = []) {
    const reach = createReach(width, height);

    function terrainAt(nx, ny, t, scrollY) {
        let v = 0;
        for (const p of PEAKS) {
            const px = p.x + Math.sin(t * p.dx * 60) * 0.035;
            const py = p.y + Math.cos(t * p.dy * 60) * 0.028;
            const ex = (nx - px) / p.sx;
            const ey = (ny - py) / p.sy;
            v += p.amp * Math.exp(-(ex * ex + ey * ey));
        }
        for (const p of placed) {
            const ex = (nx - p.x) / PLACED_SIGMA;
            const ey = (ny - p.y) / PLACED_SIGMA;
            v += p.shown * Math.exp(-(ex * ex + ey * ey));
        }
        // The basin drains to the right. This is the term that aims the contour
        // V's upstream where they cross the corridor — without it they cross
        // square, and the ground says nothing about which way the water goes.
        v -= DOWNSTREAM_FALL * nx;
        // The valley, tracking the band one for one so the contours and the
        // raster never disagree, and widened where the floodplain is wide. Once
        // the band has cleared the top the thalweg is negative and the valley
        // has gone with it, which is the whole of "let it go".
        const thalweg = BAND_TOP - scrollY + reach.chanY(nx * width);
        const dy = (ny * height - thalweg) / (VALLEY_HALF * reach.plainWidth(nx));
        v -= VALLEY_DEPTH * Math.exp(-dy * dy);
        return v;
    }

    // What gets contoured: the surface plus the cursor probe.
    function fieldAt(nx, ny, t, scrollY, mouse) {
        let v = terrainAt(nx, ny, t, scrollY);
        if (mouse.x > -1000) {
            const ex = (nx - mouse.x / width) / 0.1;
            const ey = (ny - mouse.y / height) / 0.1;
            v += 0.7 * Math.exp(-(ex * ex + ey * ey));
        }
        return v;
    }

    const elevationAt = (nx, ny, t, scrollY) =>
        Math.round((ELEV_BASE + terrainAt(nx, ny, t, scrollY) * ELEV_SCALE) / ELEV_STEP)
        * ELEV_STEP;

    return { reach, terrainAt, fieldAt, elevationAt };
}
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `node "$SCRATCH/checks/check-surface.mjs"`
Expected: `all checks passed`, exit 0.

- [ ] **Step 5: Wire `createTerrain` to the surface**

Still in `terrain.js`, inside `createTerrain`: add `let surface = null;` beside the other
closure state, and build it in `resize` after the grid is sized:

```js
        surface = createSurface(w, h, placed);
```

Change `frame(t, dt, mouse)` to `frame(t, dt, mouse, scrollY)` and the sampling loop to
pass the scroll through:

```js
                field[j * gx + i] = surface.fieldAt(
                    (i * cell) / width, (j * cell) / height, t, scrollY, mouse);
```

Change `drawMarks(t, mouse)` to `drawMarks(t, mouse, scrollY)`, its call at the end of
`frame` to `drawMarks(t, mouse, scrollY)`, and the figure to come from the surface:

```js
            const text = String(surface.elevationAt(p.x, p.y, t, scrollY));
```

- [ ] **Step 6: Pass the scroll in from `FluidBackground`**

In `src/components/FluidBackground.jsx:363`:

```js
                terrain.frame(now, dt, mouseRef.current, currentScroll);
```

- [ ] **Step 7: Verify in the build and the browser**

Run: `npm run build`
Expected: `[build] Complete!`, no errors.

Then in `npm run dev`, geospatial mode, desktop width:
- At the top of the page the raster centreline runs along the floor of a contour corridor.
- Contours crossing the corridor bend upstream (apex pointing left).
- Scrolling down to ~100px keeps the corridor under the band. The corridor itself clears the
  top of the screen around 130–206px of scroll — the thalweg sits `BAND_TOP + chanY(x)` down,
  which is 130–206px on a 900px viewport — and the band's lower floodplain keeps drawing
  until its own bottom clears at `BAND_TOP + bandH`. Do not expect the valley and the band to
  disappear together; the valley's centreline goes first.
- Click twice to raise ground; the figure printed reads between 676 and 1144 ft.
- Toggle to light mode: same geometry, topo palette intact.
- Console clean.

- [ ] **Step 8: Commit**

```bash
git add src/utils/geoMode/terrain.js src/components/FluidBackground.jsx
git commit -m "Cut a valley along the reach in the contour field"
```

---

### Task 3: Drift the ground with the page

**Files:**
- Modify: `src/utils/geoMode/terrain.js` — `DRIFT`, a wrap helper, `createSurface` options, `addPeak`, `drawMarks`
- Modify: `src/components/FluidBackground.jsx:118` (reduced-motion flag), `:288` (scroll into `addPeak`)
- Check: `$SCRATCH/checks/check-drift.mjs`

**Interfaces:**
- Consumes: `createSurface` from Task 2.
- Produces: `createSurface(width, height, placed, { drift }) → { ..., panAt(scrollY) }` where `panAt` returns the normalised vertical pan. `createTerrain(ctx, palette, placed, { reduceMotion })`. `addPeak(x, y, { instant, scrollY })` stores **ground** coordinates.

- [ ] **Step 1: Write the failing check**

Create `$SCRATCH/checks/check-drift.mjs`:

```js
const base = '../../../../../GitRepos/portfolio/.claude/worktrees/geo-stream-valley/src/utils/geoMode/';
const { createSurface } = await import(base + 'terrain.js');

let failures = 0;
const ok = (name, cond, extra = '') => {
    if (!cond) { failures++; console.error(`FAIL ${name} ${extra}`); }
    else console.log(`ok   ${name}`);
};

const W = 1440, H = 900;
const drifting = createSurface(W, H, [], { drift: 0.1 });
const still = createSurface(W, H, [], { drift: 0 });

// 1. Pan is a tenth of scroll, in normalised units.
ok('pan is 0.10x', Math.abs(drifting.panAt(900) - 0.1) < 1e-12, `got ${drifting.panAt(900)}`);
ok('pan off when drift is 0', still.panAt(900) === 0, `got ${still.panAt(900)}`);

// 2. The peak field tiles vertically with no seam: sample one point across a long
//    scroll and assert the ground never jumps. A missing wrap shows up here as a
//    cliff when a peak's neighbouring copy should have arrived.
let worst = 0, prev = null;
for (let scrollY = 0; scrollY <= 20000; scrollY += 37) {
    // Well below the thalweg, so this is the peak field alone.
    const v = drifting.terrainAt(0.5, 0.92, 0, scrollY);
    if (prev !== null) worst = Math.max(worst, Math.abs(v - prev));
    prev = v;
}
ok('ground is continuous across the seam', worst < 0.02, `worst step ${worst.toFixed(4)}`);

// 3. One period is height / drift of scroll — the ground repeats exactly.
const at0 = drifting.terrainAt(0.42, 0.7, 0, 0);
const atPeriod = drifting.terrainAt(0.42, 0.7, 0, H / 0.1);
ok('one period repeats', Math.abs(at0 - atPeriod) < 1e-9,
    `${at0.toFixed(6)} vs ${atPeriod.toFixed(6)}`);

// 4. With drift off, the ground away from the valley does not move at all.
const a = still.terrainAt(0.42, 0.9, 0, 0);
const b = still.terrainAt(0.42, 0.9, 0, 5000);
ok('no drift means no movement', Math.abs(a - b) < 1e-6, `${a.toFixed(6)} vs ${b.toFixed(6)}`);

// 5. A placed rise is ground, not screen furniture: its screen position moves by
//    the pan, so it stays on the hill it was clicked onto.
const placed = [{ x: 0.5, y: 0.6, shown: 1.0 }];
const withRise = createSurface(W, H, placed, { drift: 0.1 });
const screenArgmax = (scrollY) => {
    let bestNy = 0, best = -Infinity;
    for (let i = 0; i <= 900; i++) {
        const ny = i / 900;
        // Far from the thalweg at this scroll, so the rise is the local maximum.
        const v = withRise.terrainAt(0.5, ny, 0, scrollY);
        if (ny > 0.35 && v > best) { best = v; bestNy = ny; }
    }
    return bestNy * H;
};
const moved = screenArgmax(0) - screenArgmax(600);
ok('placed rise pans with the ground', Math.abs(moved - 60) <= 3, `moved ${moved.toFixed(1)}px, want 60`);

console.log(failures ? `\n${failures} FAILURES` : '\nall checks passed');
process.exit(failures ? 1 : 0);
```

- [ ] **Step 2: Run the check to verify it fails**

Run: `node "$SCRATCH/checks/check-drift.mjs"`
Expected: `TypeError: drifting.panAt is not a function`.

- [ ] **Step 3: Add drift, the wrap, and the pan accessor**

In `terrain.js`, add beside the other constants:

```js
const DRIFT = 0.1;             // ground pan, per px of scroll
```

Add above `createSurface`:

```js
// Nearest-image offset, which makes the peak field tile vertically. Panning the
// ground without this would strip the bottom of the frame bare; with it the field
// repeats every viewport height, and since the widest peak sigma is 0.23 a
// neighbouring copy contributes under 1% at the seam.
const wrapN = (d) => d - Math.round(d);
```

Change the signature and add the pan:

```js
export function createSurface(width, height, placed = [], { drift = DRIFT } = {}) {
    const reach = createReach(width, height);

    // Screen to ground: the ground has moved up by this much.
    const panAt = (scrollY) => (drift * scrollY) / height;
```

Inside `terrainAt`, take the pan once and use the wrapped offset for the peaks. Placed
rises are read at the panned position but **not** wrapped — the tiling is a device for
keeping ground on screen, whereas a rise you clicked is one specific spot and should not
reappear down the page:

```js
    function terrainAt(nx, ny, t, scrollY) {
        const gy = ny + panAt(scrollY);
        let v = 0;
        for (const p of PEAKS) {
            const px = p.x + Math.sin(t * p.dx * 60) * 0.035;
            const py = p.y + Math.cos(t * p.dy * 60) * 0.028;
            const ex = (nx - px) / p.sx;
            const ey = wrapN(gy - py) / p.sy;
            v += p.amp * Math.exp(-(ex * ex + ey * ey));
        }
        for (const p of placed) {
            const ex = (nx - p.x) / PLACED_SIGMA;
            const ey = (gy - p.y) / PLACED_SIGMA;
            v += p.shown * Math.exp(-(ex * ex + ey * ey));
        }
```

The fall, the trench and `fieldAt` are unchanged: they work in screen space, and the
valley is pinned to the band rather than to the ground.

Return `panAt` alongside the rest:

```js
    return { reach, panAt, terrainAt, fieldAt, elevationAt };
```

- [ ] **Step 4: Run the check to verify it passes**

Run: `node "$SCRATCH/checks/check-drift.mjs"`
Expected: `all checks passed`, exit 0.

- [ ] **Step 5: Store clicks as ground, and pan the marks**

Still in `terrain.js`, `createTerrain` takes the reduced-motion flag and hands the drift to
the surface:

```js
export function createTerrain(ctx, palette, placed = [], { reduceMotion = false } = {}) {
```

and in `resize`:

```js
        surface = createSurface(w, h, placed, { drift: reduceMotion ? 0 : DRIFT });
```

`addPeak` converts the click to a ground coordinate, so the rise stays on the ground it
was placed on rather than on the viewport:

```js
    function addPeak(x, y, { instant = false, scrollY = 0 } = {}) {
        const nx = x / width;
        const ny = y / height + surface.panAt(scrollY);
```

The rest of `addPeak` is unchanged — the stack test and the cap both work in the same
normalised space.

`drawMarks` converts back the other way for both the cross and the figure:

```js
        const pan = surface.panAt(scrollY);
        for (const p of placed) {
            if (p.shown < 0.02) continue;

            const x = p.x * width;
            const y = (p.y - pan) * height;
            // Panned off the top or bottom: nothing to draw.
            if (y < -MARK_R || y > height + MARK_R) continue;
```

and the figure reads the surface at the mark's screen position:

```js
            const text = String(surface.elevationAt(p.x, (p.y - pan), t, scrollY));
```

- [ ] **Step 6: Pass the flag and the scroll from `FluidBackground`**

`src/components/FluidBackground.jsx:118`:

```js
            terrain = createTerrain(ctx, geoPalette, geoPeaksRef.current, {
                reduceMotion: prefersReduced,
            });
```

`src/components/FluidBackground.jsx:288`:

```js
                terrain?.addPeak(x, y, { instant: prefersReduced, scrollY: scrollRef.current });
```

- [ ] **Step 7: Verify in the build and the browser**

Run: `npm run build`
Expected: `[build] Complete!`, no errors.

Then in `npm run dev`, geospatial mode:
- Scroll slowly: the hills creep upward about a tenth as fast as the page, and the bottom
  of the frame never runs out of contours.
- Click to raise a hill, then scroll 400px: the cross and figure travel with the hill, not
  with the viewport.
- In DevTools, emulate `prefers-reduced-motion: reduce`, reload, and scroll: the hills do
  not drift. Clicking still raises ground, with no bloom.
- Console clean.

- [ ] **Step 8: Commit**

```bash
git add src/utils/geoMode/terrain.js src/components/FluidBackground.jsx
git commit -m "Drift the contour ground with the page"
```

---

### Task 4: Full verification sweep and changelog

**Files:**
- Modify: `CHANGELOG.md`
- Check: all three scripts under `$SCRATCH/checks/`

- [ ] **Step 1: Re-run all three checks together**

```bash
node "$SCRATCH/checks/check-reach.mjs" && node "$SCRATCH/checks/check-surface.mjs" && node "$SCRATCH/checks/check-drift.mjs"
```

Expected: three `all checks passed`, exit 0.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `[build] Complete!`, 4 pages.

- [ ] **Step 3: Browser matrix**

In `npm run dev`, geospatial mode, confirm each and note anything that looks off:

| Case | What must hold |
|---|---|
| Desktop dark, scroll 0 | Centreline in the corridor floor; V's aim upstream |
| Desktop light, scroll 0 | Same geometry; sienna contours, blue-violet raster |
| Scroll 100 | Corridor still under the band |
| Scroll 250 | Corridor has cleared the top; band's lower floodplain still drawing |
| Scroll 400 | Band gone, no valley left behind |
| Scroll 900 | Hills only, drifted ~90px, no bare ground at the bottom |
| Narrow (390px wide) | Band 250px; no contour crowding under the hero type |
| Click ×3 near the valley | Stacks one rise; figure 676–1144 ft |
| `prefers-reduced-motion` | No drift; clicks still register |
| Mode switch geo → water → geo | Contours rebuild; no stuck valley, no console noise |

- [ ] **Step 4: Add the changelog entry**

`CHANGELOG.md` is maintained by hand for significant PRs. Add an entry in the existing
style at the top of the current section:

```markdown
- Geospatial mode: the contour backdrop now carves a valley along the same reach the flood
  raster draws, with the basin falling downstream so contours cross the stream as V's
  aimed upstream. The ground drifts at a tenth of scroll, and spot elevations were re-based
  for the deeper field.
```

Match the surrounding heading and bullet conventions — read the file before editing.

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md
git commit -m "Note the geo stream valley in the changelog"
```

---

## Self-Review

**Spec coverage:**

| Spec item | Task |
|---|---|
| `reach.js` with `BAND_TOP`, `bandHeightFor`, `createReach` | 1 |
| `flood.js` reads its geometry from the module | 1 |
| `meander` cut for want of a caller | 1, Step 3 |
| Drift term, wrapped, `0.10 ×` | 3 |
| Downstream fall `0.90` | 2 |
| Trench: depth `1.25`, half-width `90`, `plainWidth`-widened, tracking the band | 2 |
| "Let it go" needs no code | 2, Step 3 comment |
| `frame(t, dt, mouse, scrollY)` plumbed from `FluidBackground` | 2 |
| Placed rises in ground coordinates; marks pan; marks do not wrap | 3 |
| Elevations re-based to `940 + v × 120`, rounded to 5ft | 2 |
| Drift zero under reduced motion | 3 |
| Veil untouched | Global constraints |
| Verification: build, probe the thalweg, scroll positions, click, narrow, reduced motion | 2, 3, 4 |

**Type consistency:** `createSurface(width, height, placed, { drift })` returns
`{ reach, panAt, terrainAt, fieldAt, elevationAt }` — Task 2 defines the first four, Task 3
adds `panAt` and the options argument, and every call site named in Task 3 matches.
`createTerrain(ctx, palette, placed, { reduceMotion })` and
`addPeak(x, y, { instant, scrollY })` are used with exactly those names in
`FluidBackground`. `frame(t, dt, mouse, scrollY)` matches the call at `:363`.

**Note on Task 2's check, item 1:** the argmin scan is over the whole column, so it finds
the trench only because the trench is deeper than any peak-driven variation. If a future
tuning pass lowers `VALLEY_DEPTH` below about 0.5, that check needs to search a window
around the reach instead of the whole column.
