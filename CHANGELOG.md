# Changelog

## Week of 2026-08-03

### Highlights
- Added Pittsburgh as a fifth site backdrop, reachable from the `Pittsburgh` word in the hero, which was the one descriptor in that line that switched nothing. It is an isometric valley behind the whole page: the Allegheny runs out from behind the hero, the Monongahela enters from the right, they meet at a fountain about a third of the way down, and the Ohio carries on down the right. Rivers turn only 90°, on the lattice axes, so none of them ever runs straight up, down or across ([#240](https://github.com/rossv/portfolio/pull/240)).
- A ladle hangs in a mill bay in the expertise section — crane girder, hoist chains, sheave block, lattice columns, walkway, refractory trough. The crane traverses it into position and tips it, and the iron it pours runs down the left of the page on its own clock rather than being scrubbed by scroll.
- Clicking a river throws a bridge across it, in one of four Pittsburgh silhouettes: the Three Sisters suspension, the Smithfield lenticular truss, a tied arch, and the Hot Metal through-truss, which the molten always gets. Clicking anywhere else throws molten iron at the ground. Bridges are refused in the hero, where the rivers are washed out.
- Four isometric landmark tiles stand in the margins below the timeline — Carrie Furnace, the Cathedral of Learning, Phipps Conservatory, and the Duquesne Incline just above the portfolio heading. Their positions are fixed and the art is held at 0.70 so it stays a backdrop. A water river gives way to the plinth and runs behind the building above it; the molten iron is kept off the whole silhouette, and off the fountain, because it glows through the art and its bloom reaches past it.
- Bridges now span what the river is actually drawn with. The deck reaches past the widest stroke of its channel — the bank on water, the bloom on iron — allowing for the 120° between the two lattice axes on screen, so a river no longer runs out from under its own bridge.
- The hero keeps its own band: a gold main cable on a catenary with hanger ropes, cable bands and a lit necklace, over a drifting overcast.
- Added two badges — Steel City for finding the backdrop, Bridge Builder for ten bridges — and Mode Collector now asks for all five backdrops. Pittsburgh also takes the site's three accent hooks, so the `VOLKWEIN` wordmark and the licence pills carry the gold.
- Generalized `carrierFor` in `FloatingIcons` to read either a single carrier or a list, which retired the `stars` special case instead of adding a second one beside it, and gave Pittsburgh three carriers of its own: a keystone, a riveted gusset plate and a Pratt through-truss.
- The palette carries two grounds throughout, so the light theme substitutes bronze for gold rather than breaking.
- Carved a valley into the geospatial mode's contour backdrop along the same reach the hero flood raster draws, with the basin falling downstream so contours cross the stream as V's aimed upstream; the ground now drifts at a tenth of scroll, and spot elevations were re-based for the deeper field ([#230](https://github.com/rossv/portfolio/pull/230)).
- Fixed the mobile backdrop interaction: a touch scroll no longer plants stars, terrain peaks, or pipeline nodes, because the space, geospatial, and technologist modes now wait for a real tap (short, still, and with no scroll) before they spawn. Water and the mouse keep their immediate response ([#232](https://github.com/rossv/portfolio/pull/232)).
- Held the star replay list to the starfield's placed cap, so it no longer grows past the field it rebuilds on a theme change ([#232](https://github.com/rossv/portfolio/pull/232)).

### Key PR Links
- [#240](https://github.com/rossv/portfolio/pull/240): Add Pittsburgh as a fifth site backdrop.
- [#230](https://github.com/rossv/portfolio/pull/230): Carve a stream valley into the geospatial contour field.
- [#232](https://github.com/rossv/portfolio/pull/232): Wait for a real tap before the canvas backdrops spawn on touch.

## Week of 2026-06-22

### Highlights
- Added a "Tools I built" facet to the project dashboard: an `isTool` flag on entries, a dedicated filter toggle, and distinct tool cards (TOOL badge, monospace stack chips, optional Live/Code/Internal links) ([#180](https://github.com/rossv/portfolio/pull/180)).

### Key PR Links
- [#180](https://github.com/rossv/portfolio/pull/180): Add a "Tools I built" facet to the project dashboard.

## Week of 2026-03-09

### Highlights
- Centered wide news tiles on the portfolio site ([32b3857](https://github.com/rossv/portfolio/commit/32b3857bba2d678e2b02663510031d232ee94f83)).
- Improved mobile project portfolio spacing via merge of PR #132 ([5047808](https://github.com/rossv/portfolio/commit/5047808d893426a6f22513dc8da9ae18eac8e8f3)).
- Removed tracked junk files and tightened ignore coverage ([58c31d2](https://github.com/rossv/portfolio/commit/58c31d2d8b453167f7f6cb9cc98a67b55030d0f2)).
- Fixed mobile leadership section scrolling behavior ([4a2c71a](https://github.com/rossv/portfolio/commit/4a2c71a9f89a82febf6f771d595ece58267fc1df)).
- Added light mode styling to the leadership section ([213fa59](https://github.com/rossv/portfolio/commit/213fa592e0de2f1379f0e8ae276ac77f037cf6b1)).
- Updated leadership section details/content ([f0a2ae0](https://github.com/rossv/portfolio/commit/f0a2ae083f9326524b72f3df81e9f4c89d98ce13)).

### Key PR Links
- [#132](https://github.com/rossv/portfolio/pull/132): Improve mobile project portfolio spacing.
