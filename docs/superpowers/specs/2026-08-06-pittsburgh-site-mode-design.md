# Pittsburgh site mode — design

Date: 2026-08-06
Branch: `claude/pittsburgh-hero-theme-qaop7e`
Status: approved, ready for an implementation plan

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

Each module is a factory in the shape `src/utils/geoMode/terrain.js:140` sets:
it takes the context, a palette and any persisted marks, and returns `resize`,
`frame` and its own actions. `frame` signatures differ per module across the
existing folders, so each is stated here explicitly.

| Module | Export | Returns |
|---|---|---|
| `palette.js` | `PALETTES`, `paletteFor(isDark)`, plus the `rgb`/`hexToRgb` helpers the folder needs | — |
| `rivers.js` | `createRivers(ctx, palette, { reduceMotion })` | `{ resize, frame(t, scrollY), stationAt(x, y) }` |
| `hills.js` | `createHills(ctx, palette)` | `{ resize, frame(scrollY) }` — also owns the sky gradient, since the palette's `skyTop`/`skyBot` belong to the same static field |
| `landmarks.js` | `createLandmarks(ctx, palette, { reduceMotion })` | `{ resize, frame(t, scrollY) }` |
| `spans.js` | `createSpans(ctx, palette, placed = [], { reduceMotion })` | `{ resize, frame(t, scrollY), addSpan(station, x) }` |

`stationAt(x, y)` is the hit test for a click: it returns the station whose river
covers that point, or `null`. `spans.js` holds one span per stretch of water, so
repeated clicks on the same river do not stack — the rule the prototype applies at
line 1483.

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
- `BadgeCollection` bubble centering and the `SkillsRadar` title change already on
  this branch. They are unrelated to this work and are not touched.
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
prototypes. Never push to `main`; the PR targets `main` and is squash-merged. The PR
description must call out that the branch also carries the unrelated badge-bubble and
radar-title changes.
