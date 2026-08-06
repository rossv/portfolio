# Pittsburgh site mode — design

Date: 2026-08-06
Branch: `claude/pittsburgh-hero-theme-qaop7e`
Status: built. See `docs/superpowers/plans/2026-08-06-pittsburgh-site-mode.md` for the
plan, and "As built" at the foot of this document for where the implementation
departed from this design.

## Problem

The hero paragraph ends with `Technologist • Geospatial & Space Nerd • Pittsburgh`.
The first three words are `ModeWord` buttons (`src/components/Hero.jsx:36`) and each
switches the site backdrop. `Pittsburgh` is plain text at `src/components/Hero.jsx:154`,
because no Pittsburgh backdrop exists — `MODES` holds four entries
(`src/utils/siteMode.js:7`).

This branch adds the theme only as two standalone files under `docs/prototypes/`,
which sit outside the Astro build. Its own commit says so: *"Not wired into the
site; docs/ is outside the Astro build."*

This design makes Pittsburgh a fifth backdrop, reachable from that word, with the
full scene the prototype demonstrates.

## Decisions

| Question | Decision |
|---|---|
| Scope | A full fifth backdrop mode, at parity with water, stars, geo and tech |
| Mode key | `pgh` |
| Scene content | The full scene: rivers, hills, skyline, landmark reveals, name-and-year plates, click-to-build spans |
| Look | Locked to the prototype's own tuned defaults (below) |
| Structure | The house pattern — a `src/utils/pghMode/` folder of factory modules, plus a thin branch in `FluidBackground` |
| Station anchoring | Document scroll fraction, with no dependency on page markup |
| Badges | Two new: `steel-city` on entry, `bridge-builder` at 10 spans |
| Carriers | `FloatingIcons` gains three Pittsburgh carriers, and `carrierFor` learns to read arrays |
| Branch | Continue on `claude/pittsburgh-hero-theme-qaop7e` |

## Look — locked values

Taken from `CFG` at `docs/prototypes/pittsburgh-parallax.html:553`, which is what the
prototype author tuned in place:

| Control | Value |
|---|---|
| Palette | `gold` (dark theme) / `paper` (light theme) |
| Rivers | `flow` — slow drift |
| Landmarks | `duo` — two-tone |
| Depth | `deep` — `{ scene: 0.55, hillFar: 0.05, hillNear: 0.13, city: 0.22 }` |
| Bridges | `mixed` — span type varies by station |
| Sky | `grad` — gradient |

`palette.js` carries two grounds, because a dark-only palette silently breaks the
other theme — the mistake `src/utils/geoMode/palette.js:3` records space mode
shipping with. The prototype's `paper` palette is the light substitution, and its
bronze accent `#9A6A00` is what the branch commit calls the light-theme bronze.

```
dark  (gold)                         light (paper)
skyTop     #080B0F                   skyTop     #F2F4F6
skyBot     #151C25                   skyBot     #DFE5EA
ridgeFar   #141A22                   ridgeFar   #CDD6DD
ridgeNear  #1C242E                   ridgeNear  #B8C4CE
water      #0D1A23                   water      #C9D9E2
waterTint  #2E6070                   waterTint  #7FA6B8
surf       #4E8494                   surf       #4E7A8E
ground     #0A0E13                   ground     #C3CED6
ground2    #05070A                   ground2    #AEBDC9
mass       #232E39                   mass       #93A5B3
edge       #8FA1AE                   edge       #41525F
structure  #C9D4DC                   structure  #2C3A45
accent     #FFB612                   accent     #9A6A00
hot        #D2500F                   hot        #A83A08
haze       #2A3642                   haze       #C6D0D8
```

One risk to check in the manual pass: `deep` parallax is strong, and the real page
carries text over the backdrop where the prototype carried mock cards. If the scene
fights the copy, fall back to `soft` — `{ scene: 0.78, hillFar: 0.22, hillNear: 0.36,
city: 0.52 }`. Changing that constant is the whole fix.

## Station model

The prototype defines seven scenes (`docs/prototypes/pittsburgh-parallax.html:631`) and
anchors each to a DOM selector through `el.offsetTop`, falling back to `i * H` when the
element is absent. Five of its seven selectors do not exist on the real page —
`index.astro` carries only `#skills`, `#timeline` and `#projects` — so most stations
would silently land on the fallback.

The real mode therefore drops DOM anchoring and spreads seven stations evenly across
document scroll fraction 0 → 1: station `i` sits at `i / (STATIONS.length - 1)` of
`document.documentElement.scrollHeight - window.innerHeight`, so station 0 lands at the
top of the hero and station 6 at the foot of the page. The backdrop then depends on
nothing in the page markup, and adding or removing a page section never breaks it.

Station 0 sits at the hero and carries the Three Sisters band. The remaining six carry
one landmark each:

| Station | Landmark | Year |
|---|---|---|
| 0 | The Three Sisters | 1926 |
| 1 | Duquesne Incline | 1877 |
| 2 | Mon Valley Works | 1881 |
| 3 | Cathedral of Learning | 1937 |
| 4 | PPG Place | 1984 |
| 5 | Phipps Conservatory | 1893 |
| 6 | Point State Park | 1974 |

Each station owns one river band and one landmark on its far bank, and both share a
depth so they never drift apart. A station only draws when its river is within the
viewport band the prototype uses at line 1417 (`top > H + 220 || top < -320` culls it).

## Architecture

### New — `src/utils/pghMode/`

Each module is a factory in the shape `src/utils/geoMode/terrain.js:140` sets: it
takes the context, a palette and any persisted marks, and returns its own actions.
The drawing modules each expose a per-station entry point rather than a whole-scene
`frame`, because `scene.js` drives the loop. These are the signatures as built.

| Module | Export | Returns |
|---|---|---|
| `palette.js` | `PALETTES`, `paletteFor(isDark)`, `rgb`, `rgba`, `lerp`, `clamp`, `smooth`, `hash` | — |
| `stations.js` | `DEPTH`, `STATIONS`, `createGeometry()` | `{ resize, relayout, riverTopOf, riverH, visible, stationAt, width, height }` |
| `hills.js` | `createHills(ctx, palette, geom)` | `{ sky(), station(index, scrollY) }` — `sky()` also owns the gradient, since `skyTop`/`skyBot` belong to the same static field |
| `rivers.js` | `createRivers(ctx, palette, geom, { reduceMotion })` | `{ station(index, t, scrollY) }` |
| `spans.js` | `createSpans(ctx, palette, geom, placed, { reduceMotion })` | `{ draw, station, add, sparkAt, frameSparks, count }` |
| `landmarks.js` | `createLandmarks(ctx, palette, geom, spans, { reduceMotion })` | `{ station(index, kind, x, t, scrollY), plate(index, name, year, scrollY, alpha) }` |
| `scene.js` | `createScene(ctx, palette, placed, { reduceMotion })` | `{ resize, frame(t, scrollY), tap(x, y, scrollY), dispose, spanCount }` |

`geom.stationAt(x, y, scrollY)` is the hit test: it returns `{ station, index }` for
the river covering that point, or `null`. `spans.add` holds one span per stretch of
water, refusing anything within 0.14 of width of an existing span on the same station,
so repeated clicks in one place do not stack — the rule the prototype applies at line
1483. `scene.tap` returns `true` only when a span was really placed, which is what the
Bridge Builder count is made of.

Draw order per frame: `hills` (sky gradient, then far and near ridges), `rivers`,
`spans`, `landmarks`. Landmarks draw last so a plate is never covered by a river band.

### Changed

| File | Change |
|---|---|
| `src/utils/siteMode.js` | `MODES` gains `'pgh'`; `MODE_LABELS.pgh = 'Pittsburgh'` |
| `src/components/Hero.jsx` | Line 154 becomes `• <ModeWord mode="pgh">Pittsburgh</ModeWord>` |
| `src/components/FluidBackground.jsx` | An `isPgh` branch that builds the five pieces and calls their frames |
| `src/components/FloatingIcons.jsx` | Three Pittsburgh carriers; `carrierFor` reads arrays |
| `src/components/BadgeCollection.jsx` | Two badge entries; `MODE_BADGES.pgh`; a `span-place` listener and `SPANS_TARGET` |
| `src/assets/badges/badge-steel-city.svg` | New — a keystone |
| `src/assets/badges/badge-bridge-builder.svg` | New — a riveted gusset |

`reflectMode` needs no change: it writes `data-space-nerd="water"` for `pgh`, exactly
as it does for geo and tech, so the WaterBanner hide rule and the legacy badge path
keep working. `readMode` needs no change either — a stored `pgh` validates through
`MODES.includes`.

### What arrives free

`FluidBackground` already expresses four behaviours as "not water", so the new mode
inherits them with no new code:

- `usesTapGate` (line 106) — on a touch screen the spawn waits for a real tap, so a
  scroll does not throw spans
- `tracksPointerMove` (line 100) — a coarse-pointer drag does not track
- the palette effect key (line 594) — a theme flip rebuilds canvas modes only
- canvas opacity (line 606) — the mode gets the brighter `0.95` canvas-mode class

Spans persist across a palette rebuild through a ref held in the component, the way
`placedRef` and `geoPeaksRef` already do for stars and geo.

## Badges

Two entries in the badge list, in the shape `src/components/BadgeCollection.jsx:136`
uses:

| Badge | Name | Description | Unlocks on |
|---|---|---|---|
| `steel-city` | Steel City | `Entered Pittsburgh mode.` | `MODE_BADGES.pgh`, on first entry |
| `bridge-builder` | Bridge Builder | `Threw 10 spans across the rivers.` | A `span-place` event, counted to `SPANS_TARGET = 10` |

The span badge copies the `star-place` / `STARS_TARGET` path at
`src/components/BadgeCollection.jsx:644` exactly. Ten, against 25 for stars, because a
span is a much heavier mark than a star.

`mode-collector` counts `MODES.length`, so its target becomes five backdrops. Anyone
who already earned it keeps it, because an unlock is a stored flag and is never
recomputed. Their progress line at line 1018 reads `4/5` until they try Pittsburgh,
which one click corrects. This is accepted, not a defect to fix.

## Carriers

`CARRIERS` (`src/components/FloatingIcons.jsx:161`) holds one frame per mode, while
stars keeps three in a separate `STAR_CARRIERS` array with its own branch in
`carrierFor` at line 195. The prototype supplies three Pittsburgh frames — keystone,
riveted gusset, truss span — so rather than add a second special case, `carrierFor`
learns to read an array:

```js
const c = CARRIERS[mode];
return Array.isArray(c) ? c[i % c.length] : (c ?? WATER_CARRIER);
```

`STAR_CARRIERS` then moves into `CARRIERS.stars`, and `pgh` supplies its three. One
special case is removed and none is added.

## Fallbacks and accessibility

- **Reduced motion.** The existing `prefersReduced` path draws one static frame.
  Rivers hold still, landmarks draw already revealed, and a click still places a span.
- **Touch.** The tap gate above, unchanged from geo and tech.
- **Light theme.** The `paper` palette, through `paletteFor(isDark)`.
- **Screen readers.** `ModeWord` already builds its label from `MODE_LABELS`, so the
  new word announces as "Switch the backdrop to Pittsburgh" with no extra work.
- **Pointer events.** The backdrop container is `pointer-events-none`, so clicks are
  read from the window listeners the other canvas modes already use.

## Out of scope

- The control rail. The site ships one locked combination, not the tuning panel.
- The `docs/prototypes/` files. They stay as reference material and are not deleted.
- `BadgeCollection` bubble centering and the `SkillsRadar` title change. These looked
  at first like unrelated work riding along on this branch; they had in fact already
  merged to `main` as #236–#239, and a stale local `main` was what made them show up
  in the comparison. Nothing here touches them.
- Any test runner or lint config, per `CLAUDE.md`.

## Verification

This repo has no test runner, and `CLAUDE.md` says not to add one without the owner's
say-so. The gate is therefore:

1. `npx astro check`
2. `npm run build`
3. A manual pass on `npm run dev`:
   - all five mode words switch the backdrop
   - a reload restores the stored mode
   - both themes, and a theme flip while Pittsburgh runs
   - reduced motion on — one static frame, no drift
   - touch emulation — a scroll throws no spans, a tap does
   - `mode-collector` reaches 5 of 5, and `bridge-builder` unlocks at the tenth span
   - the copy stays readable over the `deep` parallax; if it does not, switch to `soft`

## Branch and PR

Work continues on `claude/pittsburgh-hero-theme-qaop7e`, which already carries the
prototypes. Never push to `main`; the PR targets `main` and is squash-merged.

Measured against `origin/main`, the branch contains only this work: the two prototype
files, these two documents, the seven `pghMode` modules, the two badge SVGs, and the
five component and util files the mode touches.

## As built

Five departures from the design above, all found while building or verifying.

**Seven modules, not five.** The design gave no owner for the geometry that all four
drawing modules share, so `stations.js` holds the station list, the anchors,
`riverTopOf`, `riverH`, the visibility cull and the hit test. And calling each
module's own frame in turn would have drawn every ridge before every river, losing
the front-to-back stacking the scene depends on — a nearer station's bank fill has to
paint over the station receding above it. `scene.js` therefore owns the station loop
and composes the other five. `FluidBackground` calls one frame.

**The document height is watched, not polled.** The anchors derive from
`document.documentElement.scrollHeight`, which changes as islands hydrate and images
load. Reading it inside the frame loop forces a synchronous reflow on every frame, so
a `ResizeObserver` on `document.body` recomputes the anchors instead, and the scene
exposes `dispose()` for the effect's cleanup.

**Reduced motion repaints on scroll.** `render()` draws a single frame and schedules
no rAF when the visitor prefers reduced motion. Every part of this scene is positioned
by scroll, so that one frame goes stale the moment the page moves — a problem the
other four backdrops do not have. The scroll handler repaints for this mode only.
Nothing moves on its own; the backdrop only answers the visitor's own scrolling.

**Spans are capped at 24.** Each span redraws in full every frame, and the list
outlives a palette rebuild, so it needs the ceiling space mode already puts on placed
stars. The oldest crossing retires to make room.

**The plate sits at the left margin.** The design said "under the landmark". At this
page's widths that put it under the section copy, so it draws at a fixed left inset on
the near bank instead, like a museum label, where it never competes with content.

One characteristic worth knowing rather than fixing: because the anchors are a
fraction of total document height, the rivers shift slightly while the page is still
settling on first load. The observer corrects them as soon as the height stops
changing.
