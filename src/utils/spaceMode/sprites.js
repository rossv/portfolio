// Pre-rendered canvas sprites for space nerd mode.
//
// The original starfield built a fresh radial gradient for every star on every
// frame — 200 gradient allocations per frame, which was its dominant cost.
// Every glow here is rendered once and then blitted with drawImage instead.

export const STAR_TINTS = [
    'rgba(255, 255, 255, ',
    'rgba(191, 219, 254, ',
    'rgba(165, 243, 252, ',
    'rgba(196, 181, 253, ',
];

// Split accent palette: violet leads, site cyan stays as the secondary.
export const ACCENT = {
    link: '167, 139, 250',   // violet-400
    node: '125, 211, 252',   // sky-300
    glow: '99, 102, 241',    // indigo-500
};

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

// One glow per star tint.
export const makeStarSprites = () => STAR_TINTS.map((t) => radial(64, [
    [0, `${t}1)`],
    [0.18, `${t}0.55)`],
    [0.45, `${t}0.12)`],
    [1, `${t}0)`],
]));

// Exhaust puffs, warm near the nozzle and cooling to blue-grey with age.
export const makePuffSprites = () => [
    'rgba(255, 196, 128,',
    'rgba(206, 202, 198,',
    'rgba(132, 142, 162,',
].map((rgb) => radial(96, [
    [0, `${rgb} 0.5)`],
    [0.45, `${rgb} 0.2)`],
    [1, `${rgb} 0)`],
]));

// Used for engine light spilling onto a hull, and for lift-off glow.
export const makeWarmGlow = () => radial(128, [
    [0, 'rgba(255, 178, 92, 0.75)'],
    [0.4, 'rgba(255, 140, 50, 0.24)'],
    [1, 'rgba(255, 120, 40, 0)'],
]);

export const rand = (a, b) => a + Math.random() * (b - a);
