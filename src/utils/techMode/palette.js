// Palettes for technologist mode.
//
// Python's own blue and yellow on a dark ground; on paper the yellow has to
// become an amber, since #ffd43b on white is effectively invisible.

export const PALETTES = {
    dark: {
        ground: '#020617',
        // The same colour as an rgb triple, for gradients that fade the
        // backdrop out toward the page ground (see waveform's dim()).
        groundRgb: '2, 6, 23',
        kw: '255, 212, 59',      // Python yellow — packets, active nodes
        fn: '77, 171, 247',      // Python blue — nodes, the trace
        dim: '108, 132, 163',
        edge: '55, 118, 171',
        panel: '10, 17, 25',     // node fill, so edges do not show through
        accentFrom: '#ffd43b',
        accentTo: '#4dabf7',
    },
    light: {
        ground: '#f8fafc',
        groundRgb: '248, 250, 252',
        kw: '180, 83, 9',
        fn: '30, 100, 170',
        dim: '110, 124, 147',
        edge: '55, 118, 171',
        panel: '255, 255, 255',
        accentFrom: '#b45309',
        accentTo: '#1e64aa',
    },
};

export const paletteFor = (isDark) => (isDark ? PALETTES.dark : PALETTES.light);
