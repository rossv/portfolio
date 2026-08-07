# Pittsburgh Site Mode Implementation Plan

> **Status: superseded.** This plan executed the elevation design in
> `../specs/2026-08-06-pittsburgh-site-mode-design.md`, which was then retired in
> favour of an isometric valley. Tasks 1 to 7 and 12 describe modules that no
> longer exist. Tasks 8 to 11 — registering the mode, the `FluidBackground` branch,
> the icon carriers and the badges — are still live and still accurate.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the hero's `Pittsburgh` word to a fifth site backdrop that runs the full parallax scene from `docs/prototypes/pittsburgh-parallax.html`.

**Architecture:** A new `src/utils/pghMode/` folder holds the scene as small factory modules, following `spaceMode`/`geoMode`/`techMode`. A thin `scene.js` orchestrates the station loop so drawing stays front-to-back; `FluidBackground` gains one `isPgh` branch that builds the scene, calls one frame, and forwards taps.

**Tech Stack:** Astro 4, React 18, Canvas 2D, Tailwind 3. No new dependencies.

## Global Constraints

- Mode key is `pgh`; label is `Pittsburgh`.
- Locked look, from `docs/prototypes/pittsburgh-parallax.html:553`: palette `gold` (dark) / `paper` (light), river `flow`, landmarks `duo`, depth `deep` = `{ scene: 0.55, hillFar: 0.05, hillNear: 0.13, city: 0.22 }`, bridges `mixed`, sky `grad`. The prototype's other palettes and styles are **not** ported.
- Canvas works in CSS pixels. `FluidBackground` sets `canvas.width = window.innerWidth` with no DPR transform, so drop the prototype's `dpr`/`setTransform` code at line 646.
- Seven stations at `i / 6` of `document.documentElement.scrollHeight - window.innerHeight`. No DOM selectors, no `offsetTop`.
- Reduced motion: no drift, no plumes, no spray, no spark physics; a span still places and draws complete.
- Every palette read goes through `paletteFor(isDark)`. No literal hex outside `palette.js`.
- No new npm packages. No test runner, no lint config (`CLAUDE.md`).
- Never push to `main`. Work stays on `claude/pittsburgh-hero-theme-qaop7e`.

## Verification gate (every task)

`npx astro check` must report no **new** errors, and `npm run build` must succeed. Tasks 6 onward add a browser check on `npm run dev`.

## File Structure

| File | Responsibility |
|---|---|
| `src/utils/pghMode/palette.js` | Two palettes, `paletteFor`, and the `rgba`/`lerp`/`clamp`/`smooth`/`hash` helpers the folder shares |
| `src/utils/pghMode/stations.js` | The seven stations and all geometry: anchors, `riverTopOf`, `riverH`, `visible`, `stationAt` |
| `src/utils/pghMode/hills.js` | Sky gradient, two ridge layers, background skyline |
| `src/utils/pghMode/rivers.js` | River body, waterline, `flow` tracers, near-bank fill |
| `src/utils/pghMode/spans.js` | The three bridge types, the span store, click sparks |
| `src/utils/pghMode/landmarks.js` | Six landmark shapes, the Sisters band, the nameplate |
| `src/utils/pghMode/scene.js` | Composes the above; owns the front-to-back station loop and the tap hit test |
| `src/utils/siteMode.js` | Register `pgh` |
| `src/components/Hero.jsx` | Make `Pittsburgh` a `ModeWord` |
| `src/components/FluidBackground.jsx` | The `isPgh` branch |
| `src/components/FloatingIcons.jsx` | Three Pittsburgh carriers; `carrierFor` reads arrays |
| `src/components/BadgeCollection.jsx` | Two badges, `MODE_BADGES.pgh`, `span-place` listener |
| `src/assets/badges/badge-steel-city.svg` | New keystone badge |
| `src/assets/badges/badge-bridge-builder.svg` | New gusset badge |

Why `stations.js` and `scene.js` are not in the design doc: the design gave no owner for the geometry all four drawing modules share, and calling `hills.frame()` then `rivers.frame()` would draw all ridges before all rivers, which breaks the stacking the prototype depends on at line 777 — a nearer station's bank fill must paint over the station receding above it. Update the design doc to match.

---

### Task 1: Palette and shared helpers

**Files:**
- Create: `src/utils/pghMode/palette.js`

**Interfaces:**
- Produces: `PALETTES`, `paletteFor(isDark)`, `rgb(hex)`, `rgba(hex, a)`, `lerp(a,b,t)`, `clamp(v,a,b)`, `smooth(v)`, `hash(i)`

- [ ] **Step 1: Write the module.** Copy the `gold` and `paper` entries verbatim from `docs/prototypes/pittsburgh-parallax.html:567` and `:591`, keeping every key. Copy the helpers from lines 610–626. Mirror the file comment style of `src/utils/geoMode/palette.js:1`.
- [ ] **Step 2: Verify.** `npx astro check`
- [ ] **Step 3: Commit.** `git commit -m "Add the Pittsburgh mode palette"`

### Task 2: Station geometry

**Files:**
- Create: `src/utils/pghMode/stations.js`

**Interfaces:**
- Consumes: `clamp` from `./palette`
- Produces: `DEPTH` (the `deep` numbers), `STATIONS` (7 entries: `kind`, `name`, `year`, optional `x`), `createGeometry()` → `{ resize(w, h), relayout(), riverTopOf(station), riverH(), visible(station), stationAt(x, y), nearest(), width(), height() }`

- [ ] **Step 1: Write the module.** `relayout()` sets `station.at = (i / (STATIONS.length - 1)) * Math.max(1, document.documentElement.scrollHeight - window.innerHeight)`. `riverTopOf` ports line 664 as `height * 0.80 + (station.at - scrollY) * DEPTH.scene`, taking `scrollY` as an argument rather than reading a global. `riverH` ports line 668. `visible` ports the cull at line 1417. `stationAt` ports the hit test at line 1482 and returns `{ station, index }` or `null`. Station data comes from lines 631–639, dropping the `sel` keys.
- [ ] **Step 2: Verify.** `npx astro check`
- [ ] **Step 3: Commit.** `git commit -m "Add Pittsburgh station geometry"`

### Task 3: Hills, sky and skyline

**Files:**
- Create: `src/utils/pghMode/hills.js`

**Interfaces:**
- Consumes: `rgba`, `hash`, `lerp` from `./palette`; the geometry object from Task 2
- Produces: `createHills(ctx, palette, geom)` → `{ sky(), station(sc, i, scrollY) }`

- [ ] **Step 1: Write the module.** `sky()` ports the `grad` branch of line 1385 only. `station()` ports `ridgeY` (674), `sceneRidge` (686) twice with the seeds and amplitudes from lines 1419–1420, then `drawSkyline` (700) with seed `i * 13 + 3`.
- [ ] **Step 2: Verify.** `npx astro check`
- [ ] **Step 3: Commit.** `git commit -m "Add the Pittsburgh hills, sky and skyline"`

### Task 4: Rivers

**Files:**
- Create: `src/utils/pghMode/rivers.js`

**Interfaces:**
- Consumes: `rgba`, `hash` from `./palette`; geometry from Task 2
- Produces: `createRivers(ctx, palette, geom, { reduceMotion })` → `{ station(sc, t, scrollY) }`

- [ ] **Step 1: Write the module.** Port `drawRiver` (724) keeping only the `flow` tracer branch (758). Under `reduceMotion` hold the tracers at `t = 0` instead of skipping them, so the water still reads as water in a static frame. Keep the near-bank gradient at line 779 — it is what stacks the valley front to back.
- [ ] **Step 2: Verify.** `npx astro check`
- [ ] **Step 3: Commit.** `git commit -m "Add the Pittsburgh river bands"`

### Task 5: Spans and sparks

**Files:**
- Create: `src/utils/pghMode/spans.js`

**Interfaces:**
- Consumes: `rgba`, `lerp`, `clamp`, `smooth` from `./palette`; geometry from Task 2
- Produces: `createSpans(ctx, palette, geom, placed, { reduceMotion })` → `{ station(sc, i, scrollY), draw(sc, span, idx, scrollY), add(index, xFraction), sparkAt(x, y), frameSparks(), count() }`

- [ ] **Step 1: Write the module.** Port `drawBridge` (800) with all three types, `cat`/`K` (797), and `bridgeTypeFor` (791) fixed to the `mixed` rule `TYPES[i % 3]`. Port `spark` (1358) and the spark integration at line 1453. `add` refuses a span within `0.14` of an existing one on the same station (line 1485) and returns `true` only when one is placed. `placed` is the caller's array of `{ station, x, t }`, so spans survive a palette rebuild; new spans start at `t = 0`, or `t = 1` under `reduceMotion`.
- [ ] **Step 2: Verify.** `npx astro check`
- [ ] **Step 3: Commit.** `git commit -m "Add the Pittsburgh spans and sparks"`

### Task 6: Landmarks and the nameplate

**Files:**
- Create: `src/utils/pghMode/landmarks.js`

**Interfaces:**
- Consumes: everything from `./palette`; geometry from Task 2; `createSpans` result for the Sisters band
- Produces: `createLandmarks(ctx, palette, geom, spans, { reduceMotion })` → `{ station(sc, i, t, scrollY), plate(sc, scrollY, alpha) }`

- [ ] **Step 1: Write the module.** Port `paint()` (945) with the style fixed to `duo`, `rectPath` (986), and all six shapes: `lmIncline` (989), `lmMill` (1082), `lmCathedral` (1147), `lmPPG` (1194), `lmPhipps` (1237), `lmFountain` (1280). Replace the prototype's `reduced` global with the passed flag. `lmSisters` (1345) delegates to `spans.draw` with `t: 1` at `x = 0.15 + i * 0.26`. Scale is `clamp(height / 640, 0.72, 1.75)` (line 1424).
- [ ] **Step 2: Write the plate.** The prototype's plate is a DOM element (line 1373); draw it on the canvas instead so the component surface does not change. Draw the name in `palette.structure` and the year in `palette.accent`, in `font-mono`, on the near bank below the landmark baseline, at the end of the frame so nothing paints over it. Ramp alpha from `nearestD` rather than toggling, mirroring the CSS transition the `.on` class had.
- [ ] **Step 3: Verify.** `npx astro check`
- [ ] **Step 4: Commit.** `git commit -m "Add the Pittsburgh landmarks and nameplate"`

### Task 7: Scene orchestrator

**Files:**
- Create: `src/utils/pghMode/scene.js`

**Interfaces:**
- Consumes: Tasks 1–6
- Produces: `createScene(ctx, palette, placed, { reduceMotion })` → `{ resize(width, height), frame(t, scrollY), tap(x, y), spanCount() }`

- [ ] **Step 1: Write the module.** `frame` calls `hills.sky()` once, then loops stations in order, skipping any that fail `geom.visible`, and per station calls `hills.station`, `rivers.station`, `landmarks.station`, then `spans.station` — the prototype's order at lines 1419–1434. It tracks the nearest station by `Math.abs(top - height * 0.80)` (1436) and, after the loop, calls `landmarks.plate` when `nearestD < height * 0.3` (1441), then `spans.frameSparks()`.
- [ ] **Step 2: Write `tap`.** Call `geom.stationAt(x, y)`. On a hit, `spans.add(index, x / width)`; return `true` when a span was placed. On a miss, `spans.sparkAt(x, y)` and return `false`.
- [ ] **Step 3: Verify.** `npx astro check`
- [ ] **Step 4: Commit.** `git commit -m "Add the Pittsburgh scene orchestrator"`

### Task 8: Register the mode and wire the hero word

**Files:**
- Modify: `src/utils/siteMode.js:7`, `src/utils/siteMode.js:9`
- Modify: `src/components/Hero.jsx:154`

- [ ] **Step 1: Register.** `MODES = ['water', 'stars', 'geo', 'tech', 'pgh']` and `MODE_LABELS.pgh = 'Pittsburgh'`. Update the file comment at line 1, which lists four modes.
- [ ] **Step 2: Wire the word.** `• <ModeWord mode="pgh">Pittsburgh</ModeWord>`
- [ ] **Step 3: Verify.** `npm run dev`, click `Pittsburgh`, confirm `<html data-site-mode="pgh">` in the inspector. The backdrop stays blank until Task 9 — that is expected here.
- [ ] **Step 4: Commit.** `git commit -m "Register the Pittsburgh site mode"`

### Task 9: The `FluidBackground` branch

**Files:**
- Modify: `src/components/FluidBackground.jsx` — imports near line 11, a ref near line 32, `isPgh` near line 90, a build block after line 161, `spawnClickEffect` near line 319, `render` near line 431, `handleResize` near line 536

- [ ] **Step 1: Add the ref and the flag.** `const pghSpansRef = useRef([]);` beside `geoPeaksRef`, and `const isPgh = mode === 'pgh';` beside `isTech`.
- [ ] **Step 2: Build the scene.**

```jsx
/* ---------- Pittsburgh mode -------------------------------- */
let pgh = null;

if (isPgh) {
    // Spans are held as { station, x } so a theme rebuild — or a resize —
    // brings back every crossing the visitor put up.
    pgh = createScene(ctx, pghPaletteFor(isDark), pghSpansRef.current, {
        reduceMotion: prefersReduced,
    });
    pgh.resize(width, height);
}
```

- [ ] **Step 3: Handle the tap.** Add a branch to `spawnClickEffect` before the water `else`:

```jsx
} else if (isPgh) {
    // A click on the water throws a span; anywhere else strikes sparks.
    // Fires before the reduced-motion bail, so Bridge Builder is earnable
    // without the build animation.
    if (pgh?.tap(x, y)) {
        window.dispatchEvent(
            new CustomEvent('span-place', { detail: { count: pgh.spanCount() } })
        );
    }
```

- [ ] **Step 4: Call the frame.** Add `} else if (isPgh) { pgh.frame(now, currentScroll); }` to the render chain beside the `isTech` branch.
- [ ] **Step 5: Resize.** Add `pgh?.resize(width, height);` to `handleResize`.
- [ ] **Step 6: Verify.** `npx astro check`, `npm run build`, then in the browser: the scene draws, scrolling reveals landmarks, a click on a river builds a span, a click on land strikes sparks, and a theme flip keeps the spans.
- [ ] **Step 7: Commit.** `git commit -m "Run the Pittsburgh scene as a fifth backdrop"`

### Task 10: Floating-icon carriers

**Files:**
- Modify: `src/components/FloatingIcons.jsx:161` (`CARRIERS`), `:176` (`STAR_CARRIERS`), `:195` (`carrierFor`)

- [ ] **Step 1: Generalize `carrierFor`.**

```jsx
const carrierFor = (mode, i) => {
    const carrier = CARRIERS[mode] ?? WATER_CARRIER;
    return Array.isArray(carrier) ? carrier[i % carrier.length] : carrier;
};
```

- [ ] **Step 2: Move `STAR_CARRIERS` into `CARRIERS.stars`** so the array path has one caller shape, not two.
- [ ] **Step 3: Add `CARRIERS.pgh`** as an array of three frames — keystone, riveted gusset, truss span — each an SVG `Frame` in the same shape as the existing entries, with `icon` geometry as percentages of the carrier box (line 153) and `tint` set from the gold accent.
- [ ] **Step 4: Verify.** `npx astro check`, then in the browser confirm stars mode still cycles three carriers and Pittsburgh mode shows the three new frames.
- [ ] **Step 5: Commit.** `git commit -m "Give Pittsburgh mode its own icon carriers"`

### Task 11: Badges

**Files:**
- Create: `src/assets/badges/badge-steel-city.svg`, `src/assets/badges/badge-bridge-builder.svg`
- Modify: `src/components/BadgeCollection.jsx` — imports near line 20, badge list near line 141, `MODE_BADGES` at line 193, listeners near line 644

- [ ] **Step 1: Draw the SVGs** to match the existing badge files: same `viewBox`, same stroke weights, `currentColor` where the existing ones use it. Keystone for `steel-city`, riveted gusset for `bridge-builder`.
- [ ] **Step 2: Add the entries.**

```jsx
{
  id: 'steel-city',
  name: 'Steel City',
  description: 'Entered Pittsburgh mode.',
  icon: badgeSteelCity,
  iconAccent: 'bg-amber-100 text-amber-800 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40',
},
{
  id: 'bridge-builder',
  name: 'Bridge Builder',
  description: 'Threw 10 spans across the rivers.',
  icon: badgeBridgeBuilder,
  iconAccent: 'bg-amber-100 text-amber-800 ring-amber-300/70 dark:bg-amber-500/20 dark:text-amber-200 dark:ring-amber-400/40',
},
```

- [ ] **Step 3: Wire the unlocks.** `MODE_BADGES.pgh = 'steel-city'`; add `const SPANS_TARGET = 10;` beside `STARS_TARGET`, a `spansBuiltRef`, a `handleSpanPlace` that mirrors `handleStarPlace` at line 644, and register `span-place` in both the add and remove lists.
- [ ] **Step 4: Verify.** `npx astro check`, `npm run build`, then in the browser: entering Pittsburgh unlocks Steel City, ten spans unlock Bridge Builder, and "Backdrops tried" reads `5/5` after all five words.
- [ ] **Step 5: Commit.** `git commit -m "Add the Steel City and Bridge Builder badges"`

### Task 12: Documentation and final pass

**Files:**
- Modify: `docs/superpowers/specs/2026-08-06-pittsburgh-site-mode-design.md`, `CHANGELOG.md`, `CLAUDE.md`

- [ ] **Step 1: Reconcile the design doc** with the seven-module structure, recording why `stations.js` and `scene.js` exist.
- [ ] **Step 2: Update `CLAUDE.md`** — the tag/mode notes and any four-mode wording.
- [ ] **Step 3: Add a `CHANGELOG.md` entry**, matching the existing style.
- [ ] **Step 4: Full manual pass** — the list in the design doc's Verification section, all seven checks.
- [ ] **Step 5: Commit.** `git commit -m "Document the Pittsburgh site mode"`

---

## Self-review

**Spec coverage.** Scope → Tasks 8–9. Scene content → 3–7. Locked look → Global Constraints and Task 1. Station model → Task 2. House pattern → Tasks 1–7. Free behaviours → Task 9 (no code, inherited). Badges → Task 11. Carriers → Task 10. Fallbacks → the reduced-motion clauses in Tasks 4, 5, 6 and the `prefersReduced` pass-through in Task 9. Out-of-scope items appear nowhere. Verification → the per-task gate plus Task 12 Step 4.

**Placeholders.** None. Every port step names an exact source line range, and every glue change carries its code.

**Type consistency.** `geom` is the Task 2 object throughout. `station(sc, ...)` is the per-station entry point in Tasks 3, 4, 6; `spans.station(sc, i, scrollY)` also takes the index because `bridgeTypeFor` needs it. `scene.tap` returns a boolean, which is what Task 9 Step 3 tests. `placed` entries are `{ station, x, t }` in Task 5 and are described the same way in Task 9 Step 2.
