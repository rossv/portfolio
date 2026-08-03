// Where the water is, in geospatial mode.
//
// The reach lived inside flood.js, which was fine while the raster was the only
// thing that needed it. The contour field now cuts a valley along the same line,
// and two copies of one meander is a desync waiting to happen — so the geometry
// sits here and both consumers read it.

export const BAND_TOP = 80;          // matches WaterBanner's `top-20`

// The band fills the slot the water video uses: clamp(250px, 30vh, 450px).
export const bandHeightFor = (height) => Math.max(250, Math.min(450, height * 0.3));

export function createReach(width, height) {
    const bandH = bandHeightFor(height);

    // A meander with non-harmonic terms, so it does not read as a sine wave.
    const chanY = (x) => bandH * 0.36
        + Math.sin((x / width) * 6.0) * bandH * 0.135
        + Math.sin((x / width) * 13.0 + 1.2) * bandH * 0.042;

    // Floodplain width along the reach: wide flats in places, pinched in others,
    // so an inundation edge reads as floodplain rather than as a buffer.
    const plainWidth = (nx) => Math.max(0.35,
        0.86 + 0.32 * Math.sin(nx * 7.3 + 0.6) + 0.17 * Math.sin(nx * 17.1 + 2.1));

    return { width, height, bandH, chanY, plainWidth };
}
