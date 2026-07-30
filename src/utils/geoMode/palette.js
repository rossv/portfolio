// Palettes for geospatial mode.
//
// Two grounds, as with space mode — a dark-only palette silently breaks the
// other theme, which is the mistake space mode shipped with first.

export const PALETTES = {
    dark: {
        ground: '#020617',
        line: '229, 160, 84',      // contour, sienna
        index: '246, 197, 122',    // index contour, every fifth
        fill: '120, 88, 46',       // hypsometric tint / hatching
        // Blue through violet for the inundation, deliberately its own ramp
        // rather than the topo colours.
        flood: ['165, 243, 252', '125, 211, 252', '96, 165, 250', '129, 140, 248', '167, 139, 250'],
        accentFrom: '#f6c57a',
        accentTo: '#a3b18a',
    },
    light: {
        ground: '#f8fafc',
        line: '146, 82, 24',
        index: '110, 58, 12',
        fill: '180, 140, 82',
        flood: ['14, 165, 233', '2, 132, 199', '37, 99, 235', '79, 70, 229', '109, 40, 217'],
        accentFrom: '#925218',
        accentTo: '#4d7c0f',
    },
};

export const paletteFor = (isDark) => (isDark ? PALETTES.dark : PALETTES.light);

export const rand = (a, b) => a + Math.random() * (b - a);

// Smoothstep, used for the soft edge on each flood front.
export const smooth = (v) => (v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v));

// Deterministic value noise. Stable frame to frame, so the irregularity in
// the flood raster does not shimmer.
export const hash = (i, j) => {
    const n = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
    return n - Math.floor(n);
};

export const hexToRgb = (hex) => {
    const v = parseInt(hex.slice(1), 16);
    return `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
};
