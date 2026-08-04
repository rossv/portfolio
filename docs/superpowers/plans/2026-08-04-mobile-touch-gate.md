# Mobile Touch Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stop a touch scroll from spawning stars, terrain peaks, or pipeline nodes in the canvas backdrops, while a deliberate tap still spawns one.

**Architecture:** `FluidBackground.jsx` spawns its themed click effect on `pointerdown`. On a touch screen that fires at the start of every scroll. Move the spawn to `pointerup` on coarse pointers only, behind a tap test (small movement, short duration, no scroll). Leave the fine-pointer path on `pointerdown` so the mouse feel does not change. Separately, bound `placedRef` to the starfield cap it is meant to mirror.

**Tech Stack:** Astro 4, React 18, Canvas 2D. No test runner.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-04-mobile-touch-gate-design.md`.
- **No test runner.** CLAUDE.md forbids adding one without the owner's agreement. Verification is `npm run build` plus the manual checks in the spec.
- Water mode behaviour must not change: it keeps the `pointerdown` spawn and keeps `touchmove` tracking.
- Mouse behaviour must not change in any mode: the spawn stays on `pointerdown`.
- All new listeners use `{ passive: true }`. Nothing calls `preventDefault`; native scrolling must stay native.
- Coarse-pointer detection reuses the existing query at `FluidBackground.jsx:97`: `(hover: none), (pointer: coarse)`.
- Tag/asset conventions do not apply — no data or asset changes.
- Never push to `main`. Work on branch `claude/mobile-touch-gate`.

---

### Task 1: Bound `placedRef` to the starfield cap

`FluidBackground.jsx:262` pushes every placement into `placedRef.current` with no limit. `starfield.js:80` retires the oldest placed star past 150. The ref and the replay loop at line 162 therefore grow without end while the drawn field does not.

**Files:**
- Modify: `src/utils/spaceMode/starfield.js:9`
- Modify: `src/components/FluidBackground.jsx:1-12` (import), `:262`

**Interfaces:**
- Consumes: nothing.
- Produces: `PLACED_CAP` exported from `src/utils/spaceMode/starfield.js` as a named export, value `150`, type number. Task 2 does not use it.

- [ ] **Step 1: Export the cap from starfield.js**

Change line 9 from:

```js
const PLACED_CAP = 150;   // oldest placed star retires past this
```

to:

```js
// Exported so the caller's replay list can be held to the same length; past
// this the oldest placed star retires.
export const PLACED_CAP = 150;
```

Leave every use of `PLACED_CAP` inside the module as it is.

- [ ] **Step 2: Import it in FluidBackground.jsx**

Change the existing import on line 3 from:

```js
import { createStarfield } from '../utils/spaceMode/starfield';
```

to:

```js
import { createStarfield, PLACED_CAP as STAR_PLACED_CAP } from '../utils/spaceMode/starfield';
```

- [ ] **Step 3: Trim the ref after each push**

In `spawnClickEffect`, replace:

```js
                starfield?.place(x, y);
                placedRef.current.push({ x, y });
```

with:

```js
                starfield?.place(x, y);
                placedRef.current.push({ x, y });
                // starfield retires its own oldest past the cap, so the replay
                // list has to retire with it or it grows without end.
                if (placedRef.current.length > STAR_PLACED_CAP) {
                    placedRef.current.splice(0, placedRef.current.length - STAR_PLACED_CAP);
                }
```

Do not change the `star-place` event below it. `BadgeCollection.jsx:607` keeps its own lifetime counter and ignores `detail.count`, so badge progress is unaffected.

- [ ] **Step 4: Verify the build**

Run: `npm run build`
Expected: exit 0, no new warnings that name `starfield` or `FluidBackground`.

- [ ] **Step 5: Commit**

```bash
git add src/utils/spaceMode/starfield.js src/components/FluidBackground.jsx
git commit -m "Hold the star replay list to the starfield's placed cap"
```

---

### Task 2: Gate the spawn behind a real tap on coarse pointers

**Files:**
- Modify: `src/components/FluidBackground.jsx` — the constants near line 97, `handlePointerDown` at `:323-329`, `updateScroll` at `:332-335`, the listener block at `:493-504`, and the cleanup at `:512-519`.

**Interfaces:**
- Consumes: `isCoarsePointer` and `tracksPointerMove`, already defined at `FluidBackground.jsx:97-98`; `spawnClickEffect(x, y)`, already defined at `:257`; `render()`, already defined at `:339`.
- Produces: `usesTapGate`, a local boolean. Nothing outside the effect uses it.

**Note on the gate condition:** the gate is `isCoarsePointer && mode !== 'water'`, not `isCoarsePointer` alone. Water must keep its immediate `pointerdown` spawn on touch. This is the same condition as `!tracksPointerMove`, but it is named separately so a later reader is not made to invert a differently-purposed flag.

- [ ] **Step 1: Add the tap constants and state**

Directly below the existing `tracksPointerMove` line (line 98), add:

```js
        // A scroll on a touch screen also begins with a pointerdown, so
        // spawning there plants a star/peak/node on every scroll. In the canvas
        // modes the spawn therefore waits for pointerup and only fires if the
        // gesture was really a tap. Water and the mouse keep the immediate
        // pointerdown spawn.
        const usesTapGate = isCoarsePointer && mode !== 'water';
        const TAP_SLOP = 10;    // px of movement still read as a tap
        const TAP_TIME = 500;   // ms; longer is a press, not a tap
        let pendingTap = null;  // { x, y, id, t, scrollY }
```

- [ ] **Step 2: Split the pointer-down handler**

Replace `handlePointerDown` (lines 323-329) with:

```js
        // Placing a star behind a button or a project card is never what was
        // meant, in either branch below.
        const isUiTarget = (target) =>
            target instanceof Element && !!target.closest('a, button, input, [role="button"]');

        const fireSpawn = (x, y) => {
            spawnClickEffect(x, y);
            if (prefersReduced) render();
        };

        const handlePointerDown = (e) => {
            if (isUiTarget(e.target)) return;
            if (!usesTapGate) {
                fireSpawn(e.clientX, e.clientY);
                return;
            }
            pendingTap = {
                x: e.clientX,
                y: e.clientY,
                id: e.pointerId,
                t: performance.now(),
                scrollY: window.scrollY,
            };
        };

        const cancelTap = () => { pendingTap = null; };

        const handleTapMove = (e) => {
            if (!pendingTap || e.pointerId !== pendingTap.id) return;
            if (Math.hypot(e.clientX - pendingTap.x, e.clientY - pendingTap.y) > TAP_SLOP) {
                cancelTap();
            }
        };

        const handlePointerUp = (e) => {
            const tap = pendingTap;
            cancelTap();
            if (!tap || e.pointerId !== tap.id) return;
            // scrollY is a backstop for a scroll event the browser delayed;
            // pointercancel and the slop check are the primary guards.
            if (performance.now() - tap.t > TAP_TIME) return;
            if (window.scrollY !== tap.scrollY) return;
            fireSpawn(tap.x, tap.y);
        };
```

- [ ] **Step 3: Clear the pending tap on scroll**

Replace `updateScroll` (lines 332-334) with:

```js
        const updateScroll = () => {
            scrollRef.current = window.scrollY;
            // Inertia scrolls send few pointermove events, so the scroll event
            // itself has to disqualify the gesture.
            cancelTap();
        };
```

Leave the `window.addEventListener('scroll', updateScroll);` line below it as it is.

- [ ] **Step 4: Attach and detach the new listeners**

Replace the `window.addEventListener('pointerdown', handlePointerDown);` line (line 504) with:

```js
        window.addEventListener('pointerdown', handlePointerDown, { passive: true });
        if (usesTapGate) {
            // pointercancel is what iOS sends when it takes the gesture over
            // for scrolling, so it is the main disqualifier on that platform.
            window.addEventListener('pointermove', handleTapMove, { passive: true });
            window.addEventListener('pointerup', handlePointerUp, { passive: true });
            window.addEventListener('pointercancel', cancelTap, { passive: true });
            window.addEventListener('blur', cancelTap);
        }
```

In the cleanup (lines 512-519), replace the `pointerdown` removal line with:

```js
            window.removeEventListener('pointerdown', handlePointerDown);
            if (usesTapGate) {
                window.removeEventListener('pointermove', handleTapMove);
                window.removeEventListener('pointerup', handlePointerUp);
                window.removeEventListener('pointercancel', cancelTap);
                window.removeEventListener('blur', cancelTap);
            }
```

- [ ] **Step 5: Update the mode comment**

The comment at lines 92-96 explains only the `touchmove` half. Extend its last sentence so it also records the tap gate, so a later reader does not undo one half of the fix:

```js
        // On a touch screen a scroll *is* a finger drag, and it also begins
        // with a pointerdown. Water wears both well — the bubbles part around
        // the finger, and a ripple is cheap — but terrain heaving and pipeline
        // nodes firing on each scroll read as noise. So on a coarse pointer
        // those modes ignore drags (below) and wait for a real tap before they
        // spawn (see TAP_SLOP). Same query BadgeCollection uses.
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: exit 0, no new warnings naming `FluidBackground`.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, then work through the spec's checks. Record the result of each:

1. Mouse, each of the four modes: a click spawns at once.
2. DevTools device mode (touch), stars / geo / tech: scroll the whole page. No new stars, peaks, or nodes.
3. Same, touch: a deliberate tap on empty background spawns one item.
4. Touch, water: a drag still parts the bubbles; a tap still makes a ripple.
5. Touch: a tap on a button or a project card spawns nothing.
6. Reduced motion on, stars: a tap still records the star and still fires `star-place`.

- [ ] **Step 8: Commit**

```bash
git add src/components/FluidBackground.jsx
git commit -m "Wait for a real tap before the canvas modes spawn on touch"
```

---

### Task 3: Changelog and pull request

**Files:**
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Read the top of CHANGELOG.md and match its existing format**

Run: `head -40 CHANGELOG.md`

- [ ] **Step 2: Add an entry in that format**

Summarise as: touch scrolling no longer spawns stars, terrain peaks, or pipeline nodes; a deliberate tap still does; the star replay list is now held to the starfield's cap.

- [ ] **Step 3: Commit and open the PR**

```bash
git add CHANGELOG.md
git commit -m "Note the mobile touch gate in the changelog"
git push -u origin claude/mobile-touch-gate
gh pr create --base main --title "Wait for a real tap before the canvas backdrops spawn on touch" --body "<body>"
```

- [ ] **Step 4: Squash-merge**

Squash-merge is the repo's stated preference.

```bash
gh pr merge --squash --delete-branch
```
