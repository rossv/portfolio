// Palettes and pre-rendered canvas sprites for space nerd mode.
//
// The original starfield built a fresh radial gradient for every star on every
// frame — 200 gradient allocations per frame, which was its dominant cost.
// Every glow here is rendered once and then blitted with drawImage instead.
//
// Space mode has to work on both grounds. The dark palette is light-on-dark
// (glowing points); the light palette is the same scene in ink on paper —
// same elements throughout, inverted tonally rather than replaced.

export const PALETTES = {
    dark: {
        ink: false,
        // Pale points that glow.
        starTints: [
            'rgba(255, 255, 255, ',
            'rgba(191, 219, 254, ',
            'rgba(165, 243, 252, ',
            'rgba(196, 181, 253, ',
        ],
        glowStops: [[0, '1)'], [0.18, '0.55)'], [0.45, '0.12)'], [1, '0)']],
        starGlow: 0.8,
        placedTint: 3,
        nebula: [
            { x: 0.22, y: 0.30, r: 0.55, c: '124, 58, 237', a: 0.30 },
            { x: 0.74, y: 0.22, r: 0.42, c: '30, 64, 175', a: 0.26 },
            { x: 0.60, y: 0.72, r: 0.50, c: '13, 148, 136', a: 0.16 },
            { x: 0.08, y: 0.80, r: 0.34, c: '192, 38, 211', a: 0.12 },
        ],
        nebulaAlpha: 0.85,
        dust: ['rgba(196, 181, 253, 1)', 'rgba(255, 255, 255, 1)'],
        // Split accent: violet leads, site cyan secondary.
        link: '167, 139, 250',
        node: '125, 211, 252',
        aurora: {
            blend: 'lighter',
            hues: ['125, 211, 252', '167, 139, 250', '45, 212, 191'],
            fill: 0.16,
            crease: 0.4,
        },
        puffs: ['rgba(255, 196, 128,', 'rgba(206, 202, 198,', 'rgba(132, 142, 162,'],
        smoke: 0.18,
        craftEdge: null,
    },

    light: {
        ink: true,
        // Ink points on paper. Same four-tint structure, tonally inverted.
        starTints: [
            'rgba(30, 41, 59, ',
            'rgba(51, 65, 85, ',
            'rgba(67, 56, 202, ',
            'rgba(109, 40, 217, ',
        ],
        // A softer falloff: on paper a hard halo reads as a smudge.
        glowStops: [[0, '0.85)'], [0.25, '0.28)'], [0.6, '0.07)'], [1, '0)']],
        starGlow: 0.5,
        placedTint: 3,
        // Darker hues at lower alpha. Bright violet at 0.3 over white is what
        // turned the nebula into a pastel smear.
        nebula: [
            { x: 0.22, y: 0.30, r: 0.55, c: '109, 40, 217', a: 0.10 },
            { x: 0.74, y: 0.22, r: 0.42, c: '55, 48, 163', a: 0.09 },
            { x: 0.60, y: 0.72, r: 0.50, c: '15, 118, 110', a: 0.07 },
            { x: 0.08, y: 0.80, r: 0.34, c: '162, 28, 175', a: 0.05 },
        ],
        nebulaAlpha: 0.6,
        dust: ['rgba(109, 40, 217, 1)', 'rgba(30, 41, 59, 1)'],
        link: '109, 40, 217',
        node: '2, 132, 199',
        aurora: {
            // Additive blending is invisible on white, so the curtain darkens
            // the paper instead of lightening it.
            blend: 'source-over',
            hues: ['2, 132, 199', '109, 40, 217', '15, 118, 110'],
            // Stronger than the dark palette: a normal-blended wash on white
            // has far less presence than an additive one on black.
            fill: 0.24,
            crease: 0.5,
        },
        puffs: ['rgba(180, 110, 40,', 'rgba(110, 116, 128,', 'rgba(70, 80, 100,'],
        smoke: 0.16,
        // White hulls vanish on paper, so every craft gets a defining edge.
        craftEdge: 'rgba(15, 23, 42, 0.55)',
    },
};

export const paletteFor = (isDark) => (isDark ? PALETTES.dark : PALETTES.light);

function radial(size, stops) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const g = canvas.getContext('2d');
    const r = size / 2;
    const grad = g.createRadialGradient(r, r, 0, r, r, r);
    for (const [at, color] of stops) grad.addColorStop(at, color);
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    return canvas;
}

// One glow per star tint, built from the palette's falloff.
export const makeStarSprites = (palette) => palette.starTints.map((tint) => radial(
    64,
    palette.glowStops.map(([at, alpha]) => [at, tint + alpha]),
));

// Exhaust puffs, warm near the nozzle and cooling with age.
export const makePuffSprites = (palette) => palette.puffs.map((rgb) => radial(96, [
    [0, `${rgb} 0.5)`],
    [0.45, `${rgb} 0.2)`],
    [1, `${rgb} 0)`],
]));

// Engine light on a hull, and lift-off glow. Warm on both grounds — fire is
// fire — but weaker on paper, where it has less room to bloom.
export const makeWarmGlow = (palette) => radial(128, palette.ink ? [
    [0, 'rgba(217, 119, 6, 0.55)'],
    [0.4, 'rgba(194, 65, 12, 0.2)'],
    [1, 'rgba(194, 65, 12, 0)'],
] : [
    [0, 'rgba(255, 178, 92, 0.75)'],
    [0.4, 'rgba(255, 140, 50, 0.24)'],
    [1, 'rgba(255, 120, 40, 0)'],
]);

export const rand = (a, b) => a + Math.random() * (b - a);
