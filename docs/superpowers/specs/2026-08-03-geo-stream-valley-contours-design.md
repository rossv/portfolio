# Geo mode: a stream valley in the contour field

**Date:** 2026-08-03
**Status:** design, awaiting review
**Prototype:** https://claude.ai/code/artifact/082346f0-39c6-404f-8495-ef972c406990

## Problem

Geospatial mode draws two things that do not know about each other:

- `src/utils/geoMode/flood.js` draws the hero band — a flood inundation raster along a
  meandering reach, with a wetting front and a recession front.
- `src/utils/geoMode/terrain.js` draws the backdrop — a contour field built from five
  drifting Gaussian peaks, plus click-placed rises and a cursor probe.

The contours are therefore random hills behind a river. Nothing in the ground explains
where the stream is or which way it flows, which is exactly the tell a topographic sheet
gives you: contours cross a stream as V's aimed upstream, and elevations fall downstream.

## Goal

The contour field carves a valley along the same reach the raster draws, with the ground
falling downstream, so the backdrop and the hero read as one landscape.

## Decisions

| Question | Decision |
|---|---|
| Scope | Valley only. No tributary hollows, no repositioning of the five peaks. |
| Anchor | The valley tracks the band one for one while the band is on screen. |
| After the band leaves | Let it go. The valley exits with the band; no clamp, no resting line. |
| Background drift | The peak field pans at `0.10 ×` scroll. |
| Valley shape | Depth `1.25`, half-width `90px`, downstream fall `0.90`. |

Depth, width and fall were chosen against the prototype: deep and narrow with a strong
fall. At those values the trench flanks sit about ten pixels apart, which reads as a steep
corridor without collapsing into a solid band.

## Architecture

### New module: `src/utils/geoMode/reach.js`

The reach geometry currently lives inside `flood.js`'s closure. It becomes the one shared
definition, because two consumers deriving the same meander from two copies of the formula
is a silent desync waiting to happen.

```js
export const BAND_TOP = 80;                  // matches WaterBanner's `top-20`
export const bandHeightFor = (h) => Math.max(250, Math.min(450, h * 0.3));

// Everything about where the water is, for a given canvas size.
export function createReach(width, height) {
  const bandH = bandHeightFor(height);
  const chanY = (x) => /* the existing meander, unchanged */;
  const meander = (x) => chanY(x) - bandH * 0.36;   // the wander, mean removed
  const plainWidth = (nx) => /* the existing floodplain width, unchanged */;
  return { width, bandH, chanY, meander, plainWidth };
}
```

`chanY` and `plainWidth` move across verbatim. `meander` is new and unused by this change —
it exists because "park at the top edge" and "ease to a resting line" were live options in
the prototype, and it is the one line either would need. **Cut it if it has no caller.**

Both consumers build their own instance inside their existing `resize(w, h)`, which is how
every other size-dependent value in these modules is handled. No new plumbing in
`FluidBackground` for resize ordering, and the formula still exists in exactly one file.

### `flood.js`

Delete its private `BAND_TOP`, `bandH` computation, `chanY` and `plainWidth`; take them
from a `createReach(w, h)` built in `resize`. No behaviour change — this is the same
geometry read from its new home.

### `terrain.js`

New constants:

```js
const DRIFT = 0.1;            // peak-field pan, per px of scroll
const VALLEY_DEPTH = 1.25;
const VALLEY_HALF = 90;       // px, at plainWidth 1.0
const DOWNSTREAM_FALL = 0.9;  // field units across the full width
const ELEV_BASE = 940;        // was 720
const ELEV_SCALE = 120;       // was 260
```

`terrainAt(nx, ny, t, scrollY)` gains three terms:

1. **Drift.** Peaks are sampled at `ny + DRIFT * scrollY / height`, with the offset wrapped
   to the nearest image (`d - Math.round(d)`) so the field tiles vertically at one viewport
   height per period. Without the wrap, panning strips the bottom of the frame bare. The
   peak sigmas top out at `0.23`, so a neighbouring copy contributes under 1% at the seam
   and the tiling is invisible. Ground repeats once per `height / DRIFT` = 9000px of scroll
   on a 900px viewport — at most once on this page.
2. **Downstream fall.** `v -= DOWNSTREAM_FALL * nx`. This is what bends the iso-lines
   upstream inside the corridor; with fall at zero the V's flatten into straight crossings.
3. **The trench.** A Gaussian cross-section about the channel, widened where the floodplain
   is wide:

```js
const chanYView = BAND_TOP - scrollY + reach.chanY(nx * width);   // tracks the band
const dy = (ny * height - chanYView) / (VALLEY_HALF * reach.plainWidth(nx));
v -= VALLEY_DEPTH * Math.exp(-dy * dy);
```

"Let it go" needs no code: once the band is off screen, `chanYView` is negative and the
trench leaves with it.

`frame` becomes `frame(t, dt, mouse, scrollY)`; `FluidBackground` already holds
`currentScroll` where it calls both `flood.dim` and `flood.frame`.

### Click-placed rises pan with the ground

`placed[]` holds normalised coordinates. With drift, a stored coordinate is a **ground**
coordinate, not a screen one:

- `addPeak(x, y, { instant, scrollY })` stores `y / height + DRIFT * scrollY / height`.
- Sampling and `drawMarks` convert back with `screenY = (p.y - pan) * height`.

Otherwise a clicked hill stays nailed to the viewport while the ground it sits on moves.
Marks do not wrap — at `0.10 ×` they drift 100px per 1000px of scroll and simply leave.

### Spot elevations get re-based

`drawMarks` prints `ELEV_BASE + terrainAt(...) * ELEV_SCALE`, written for a field of
roughly 0 to 2.4. Depth 1.25 plus fall 0.90 takes the field to about −2.2, which prints
170ft, and at the prototype's slider extremes it goes negative. Re-based to
`940 + v * 120`, the range lands at roughly 676–1144ft, which is plausible for the
Allegheny plateau.

Figures are rounded to the nearest 5ft. A mark's reported elevation now changes as the
valley slides past it, and rounding keeps the digits from churning. This is the honest
reading: a spot elevation must agree with the contours it sits among, so it has to include
the trench. If it reads badly in review, the fallback is to report the surface without the
trench — recorded here so the alternative is not rediscovered from scratch.

### Reduced motion

`DRIFT` becomes `0` under `prefers-reduced-motion`. Scroll-linked parallax is the kind of
motion that setting is for. The valley still tracks the band, because that is not extra
motion — it is the valley matching something already moving.

## Data flow

```
FluidBackground (owns scroll, mouse, palette, placed[])
  │
  ├── createTerrain(ctx, palette, placed) ── resize(w,h) → createReach(w,h)
  │      frame(t, dt, mouse, scrollY) → contours + spot elevations
  │
  └── createFlood(ctx, palette) ────────── resize(w,h) → createReach(w,h)
         dim(scrollY), frame(dt, scrollY) → veil + raster band
```

Neither consumer imports the other. `reach.js` imports nothing.

## Out of scope

- **The band veil.** `flood.dim` knocks the contours back 70% across the band, which is
  where the valley is, so some of the payoff lands below the band rather than under it.
  Changing it trades against the raster's own legibility and was deliberately deepened in
  #222. Decide separately.
- Tributary hollows, and moving the five peaks onto interfluves.
- Hypsometric tint or hachures in the valley.

## Verification

No test runner in this repo, so verification is a build plus a driven browser check.

1. `npm run build` clean.
2. Geo mode, desktop, dark and light: at `scrollY 0` the raster centreline sits inside the
   corridor. Probe it rather than eyeball it — sample the field down a column and confirm
   its minimum falls within a cell of `BAND_TOP + chanY(x)`.
3. Scroll to 100 / 250 / 400 / 900: the valley stays under the raster centreline throughout.
   Note the two do not leave together — the thalweg sits `BAND_TOP + chanY(x)` down, so the
   corridor clears the top of the screen at 130–206px of scroll on a 900px viewport, while
   the band keeps drawing its lower floodplain until `BAND_TOP + bandH` (350px there).
4. Contours cross the corridor as V's pointing upstream (left), and the field falls to the
   right.
5. Click to raise a hill, then scroll: the cross and figure stay with the hill, and figures
   land in 676–1144ft.
6. Narrow viewport (band 250px, veil guard 360px): no contour crowding under the hero type.
7. `prefers-reduced-motion`: no drift.
8. Console clean; frame cost unchanged beyond two extra evaluations per grid sample.
