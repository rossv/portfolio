# Changelog

## Week of 2026-08-03

### Highlights
- Added Pittsburgh as a fifth site backdrop, reachable from the `Pittsburgh` word in the hero, which was the one descriptor in that line that switched nothing. Seven stations carry a river each, with the Three Sisters over the hero and six landmarks revealing on scroll — Duquesne Incline, Mon Valley Works, Cathedral of Learning, PPG Place, Phipps, and the fountain at the Point — each with a name-and-year plate. Clicking any river throws a span across it, and the spans stay where you put them.
- Ported that scene from `docs/prototypes/pittsburgh-parallax.html` into `src/utils/pghMode/`, following the `spaceMode`/`geoMode`/`techMode` pattern, and locked the look to the prototype's own tuned settings. The palette carries two grounds, so the light theme substitutes bronze for gold rather than breaking.
- Added two badges — Steel City for finding the backdrop, Bridge Builder for ten spans — and Mode Collector now asks for all five backdrops.
- Generalized `carrierFor` in `FloatingIcons` to read either a single carrier or a list, which retired the `stars` special case instead of adding a second one beside it.
- Carved a valley into the geospatial mode's contour backdrop along the same reach the hero flood raster draws, with the basin falling downstream so contours cross the stream as V's aimed upstream; the ground now drifts at a tenth of scroll, and spot elevations were re-based for the deeper field ([#230](https://github.com/rossv/portfolio/pull/230)).
- Fixed the mobile backdrop interaction: a touch scroll no longer plants stars, terrain peaks, or pipeline nodes, because the space, geospatial, and technologist modes now wait for a real tap (short, still, and with no scroll) before they spawn. Water and the mouse keep their immediate response ([#232](https://github.com/rossv/portfolio/pull/232)).
- Held the star replay list to the starfield's placed cap, so it no longer grows past the field it rebuilds on a theme change ([#232](https://github.com/rossv/portfolio/pull/232)).

### Key PR Links
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
