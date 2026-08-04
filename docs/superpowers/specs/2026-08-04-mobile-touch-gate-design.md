# Mobile touch gate for the canvas backdrops

**Date:** 2026-08-04
**Component:** `src/components/FluidBackground.jsx`
**Modes affected:** `stars`, `geo`, `tech` (water is unchanged)

## Problem

On a touch screen, every scroll gesture starts with a `pointerdown`. The
handler at `FluidBackground.jsx:323` spawns the themed click effect on that
event. So each scroll plants a star, a terrain peak, or a pipeline node. A
visitor who reads the page down to the projects section arrives with a sky
full of unwanted stars, or a heaved-up terrain, or a graph packed with nodes.

PR #219 (`1aadcd2`) closed the related half of this: on a coarse pointer the
non-water modes no longer feed `mouseRef` from `touchmove`, so a drag does not
push the terrain or fire the graph. The spawn on touch-down stayed open.

A second, smaller defect sits next to it. Line 262 pushes every placement into
`placedRef.current` with no limit, but `starfield.js:80` retires the oldest
placed star past `PLACED_CAP` (150). The ref and the theme-rebuild replay loop
at line 162 grow without end while the drawn field does not.

## Goal

A scroll must not spawn anything in the three canvas modes. A deliberate tap
must still spawn, so the interaction stays available on a phone. Mouse
behaviour must not change at all.

## Design

### 1. Tap gate

Add a tap state machine to the pointer handling. It is active only when
`isCoarsePointer` is true — the same
`(hover: none), (pointer: coarse)` query the file already reads at line 97.

```js
const TAP_SLOP = 10;   // px of movement still read as a tap
const TAP_TIME = 500;  // ms; longer is a press, not a tap
let pending = null;    // { x, y, id, t, scrollY }
```

| Event | Behaviour |
|-------|-----------|
| `pointerdown` | Keep the existing UI guard (`a, button, input, [role="button"]`). On a fine pointer, spawn immediately, as today. On a coarse pointer, store `pending` and wait. |
| `pointermove` | Clear `pending` when the finger has moved more than `TAP_SLOP` from the start point. |
| `scroll` | Clear `pending`, inside the existing `updateScroll`. This catches inertia scrolls, where the browser sends few move events. |
| `pointercancel` | Clear `pending`. iOS sends this when it takes the gesture over for scrolling, so it is the main signal on that platform. |
| `pointerup` | Spawn only when `pending` exists, the `pointerId` matches, the elapsed time is below `TAP_TIME`, and `window.scrollY` is unchanged. Spawn at the stored down coordinates. Then clear `pending`. |
| `blur` | Clear `pending`, the way `NewsSection.tsx:271` does. |

Rules:

- All listeners are `{ passive: true }`. Nothing calls `preventDefault`, so
  native scrolling is untouched.
- The move, up, and cancel listeners attach only on a coarse pointer. The
  desktop path gains no work.
- Keep the reduced-motion `render()` call on the spawn path (today at line
  328), so a tap still draws its single frame.
- The `scrollY` comparison is a backstop for a delayed `scroll` event. The
  `pointercancel` and slop checks are the primary guards.

### 2. Bound `placedRef`

Export the starfield cap as a named constant and trim `placedRef.current` to
it after each push, so the ref matches the drawn field.

`terrain.js` and `pipeline.js` own and cap their own arrays (`PLACED_CAP` 14
and 24), so they need no change.

The Stargazer badge keeps its own lifetime counter —
`BadgeCollection.jsx:607` increments a ref and does not read `detail.count` —
so the trim does not affect badge progress.

### 3. Water is unchanged

Water keeps the `pointerdown` spawn and keeps `touchmove` tracking. The
bubbles part around a dragging finger, which reads well, and the comment at
lines 92-98 records that decision.

## Out of scope

- No change to any mode's visual design.
- No change to the badge criteria.
- No test runner. CLAUDE.md forbids adding one without discussion.

## Verification

`npm run build` must pass. Then check by hand with `npm run dev`:

1. Mouse, all four modes: a click spawns immediately, as before.
2. Touch emulation (Chrome DevTools device mode), modes stars, geo, and tech:
   scroll the full page. No new stars, peaks, or nodes appear.
3. Same modes, touch emulation: a deliberate tap on empty background spawns
   one item.
4. Touch emulation, water mode: a drag still parts the bubbles, and a tap
   still makes a ripple.
5. A tap on a button or a project card spawns nothing.
6. Reduced motion on: a tap still records the placement and still fires
   `star-place`.
