# Prototypes

Standalone HTML mockups. They live outside the Astro build and are never served —
open them straight from disk.

## Pittsburgh mode (superseded)

- `pittsburgh-theme.html` — five plates exploring a Pittsburgh site mode: a plan
  view of the confluence, the Three Sisters band, the incline as a mechanism,
  margin carriers, and the black-and-gold palette.
- `pittsburgh-parallax.html` — a full-page mockup of that backdrop in elevation,
  with a control rail offering 324 combinations of palette, river style, landmark
  rendering, parallax depth, bridge type and sky.

Both explore the mode **in elevation**, which is not what shipped. That approach
was built and then retired: the buildings and the incline were the part that never
worked. Pittsburgh mode is now an isometric valley — see `src/utils/pghMode/`.

They are kept because the control rail is still the quickest way to try a
palette or a river treatment against real geometry, and because the black-and-gold
values that ship were tuned in `pittsburgh-parallax.html` and are still readable
in its `PALETTES` block.
