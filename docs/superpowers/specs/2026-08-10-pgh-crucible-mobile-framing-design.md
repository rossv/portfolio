# Hold the crucible on screen on a phone

**Date:** 2026-08-10
**Modules:** `src/utils/pghMode/lattice.js`, `network.js`, `crucible.js`
**Mode affected:** `pgh` only

## Problem

In Pittsburgh mode the ladle stands mostly off the left edge of a phone. Two
numbers disagree about how much room it needs.

The ladle's reach is a fixed count of cells. `crucible.js` hangs it
`S * 2.6` left of the point the iron lands, and the shell radius is `S * 2.25`,
so the vessel reaches 4.85 cells — about 185 px — left of the landing.

Where the iron lands is a fraction of the field. `network.js:262` puts the head
at `Math.round(-u * 0.46)` cells across, and `u` shrinks with the viewport. The
fraction knows nothing about the vessel that pours into it.

On a wide screen there is room for both. On a phone the field is only about six
cells from centre to edge, the fraction puts the head four cells out, and the
vessel then hangs 121 px past the left edge.

| Viewport | Landing x | Ladle left edge |
|---|---|---|
| 1440 px | 358 | 174 |
| 768 px | 154 | −31 |
| 390 px | 63 | −121 |

## Goal

On a phone, the whole vessel, its stream and the landing must be in frame.

Nothing at desktop width may move. The owner asked for this explicitly: an
earlier draft that also un-clipped 768 px was rejected because it shifted the
landing there by 66 px.

No vertical change. The pour stays 62 % into the Technical Toolkit section.

## Design

One test decides everything: `lattice.narrow()`, which is the `u <= 12` check
`network.js` already applied inline for the river corridor. It is true at a
viewport of about 592 px or less. Above that, every number keeps its present
value and the code path is the one that runs today.

### 1. `lattice.js` — the shared numbers

The ladle's cell dimensions move here, beside `CHANNEL_WIDTH` and
`FOUNTAIN_RADIUS`, and for the same reason: the router needs the same numbers
the vessel is drawn with.

```js
export const LADLE_RADIUS = 2.25;
export const LADLE_OFFSET = 2.6;
export const LADLE_OFFSET_TIGHT = 1.2;
```

Two accessors join them:

- `room()` — cells from the centre of the screen to its edge, as
  `width / 2 / W2`. Not `halfWidth`, which is padded by three cells and rounded
  up; a limit computed from that is a cell and a half too generous.
- `narrow()` — `u <= NARROW_FIELD`, with `NARROW_FIELD = 12`.

The `+ 3` in `resize` becomes the named `FIELD_PAD`.

### 2. `network.js` — hold the head in

The fraction stays as the preference. A limit stops it going further out than
the room allows, measured with the tight offset the vessel will be drawn at,
plus a cell in hand so the shell sits comfortably inside the edge:

```js
const ironLimit = narrow
    ? -Math.max(0, lattice.room() - LADLE_OFFSET_TIGHT - LADLE_RADIUS - IRON_EDGE_MARGIN)
    : -Infinity;
const source = lattice.cellAt(
    Math.max(Math.round(-u * 0.46), Math.ceil(ironLimit)),
    sourceDepth,
);
```

The inline `u <= 12` corridor test becomes `lattice.narrow()`, so the router and
the ladle cannot disagree about what is tight.

No parity guard is needed. `cellAt` computes `gx` with `Math.round`, which
always rounds a half up, so the across it returns is either the one asked for or
one cell *inward* — never further out. A guard against an outward shift could
never fire.

### 3. `crucible.js` — bring the vessel in

`R` reads `LADLE_RADIUS`. The offset and the parking spot come from
`lattice.narrow()`:

```js
const tight = lattice.narrow();
const parkX = ax - S * (tight ? PARK_TIGHT : PARK);      // 9 cells, else 14
const pourX = ax - S * (tight ? LADLE_OFFSET_TIGHT : LADLE_OFFSET);
```

The park distance comes in as well. Parked 14 cells out on a six-cell field,
the whole travel happens past the left edge and the vessel is simply there at
the end of it, with nothing fetched. At 9 cells the reader sees the crane bring
it in.

The stream leaves the lip steeper, which is the honest thing for a shorter drop.
The lip stays above and left of the landing, so the pour geometry in
`crucible.js` needs no change.

## Result

| Viewport | Landing x | Ladle left edge | Change |
|---|---|---|---|
| 320 px | 160 | +29 | in frame |
| 390 px | 195 | +64 | in frame |
| 430 px | 149 | +18 | in frame |
| 592 px | 164 | +33 | in frame |
| 768 px | 154 | −31 | none |
| 1440 px | 358 | 174 | none |

## Accepted consequences

- Viewports from about 600 px to 830 px keep the clip they have today — 30 px at
  768 px, up to 80 px at 600 px. That is a narrow desktop window or a tablet in
  portrait. Holding desktop still is worth more.
- On a phone the iron's head sits nearer the centre, so it may cross the
  Allegheny higher up the page than before. The mode already draws iron over
  water for that reason, and the fountain keep-out is unchanged.
- At 320 px the depth parity can put the head one cell right of centre. There is
  no better placement for a 171 px vessel on a 320 px screen without scaling the
  whole scene, which is out of scope.

## Out of scope

- Any vertical move of the pour.
- Scaling the 38 px lattice cell on narrow screens. That would move the rivers,
  bridges, fountain and landmarks too.
- The mill hall's own bay dimensions. Its walkway gap already spans the tight
  ladle's position.

## Verification

`npm run build` passes.

Checked in the browser by rendering the real scene into fixed-size canvases —
390 px and 1440 px — at the same scroll position, since the Chrome window in use
refused to leave its maximized state. `buildNetwork` and `createLattice` were
driven directly to read the placement back:

| Width | `u` | `room()` | `narrow()` | across | landing x | ladle left | ladle right |
|---|---|---|---|---|---|---|---|
| 390 | 9 | 5.93 | true | 0 | 195.0 | 63.9 | 234.9 |
| 1440 | 25 | 21.88 | false | −10 | 390.9 | 206.6 | 377.6 |

The before/after screenshots at 390 px show the vessel going from entirely off
the left edge to fully in frame. The 1440 px frame is identical in both, which
is what the code says it must be: with `narrow` false, `ironLimit` is
`-Infinity`, so `Math.max(Math.round(-u * 0.46), -Infinity)` reduces to the
original expression, and `tight` is false, so the offset, the park and the
radius all keep their original values.
