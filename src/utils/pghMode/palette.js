// Palettes for Pittsburgh mode.
//
// Two grounds, as with space and geospatial mode — a dark-only palette silently
// breaks the other theme. The accent is the only saturated thing in either of
// them, apart from the molten iron, which is the one place heat is allowed.
//
// On paper the gold becomes bronze: #FFB612 on white is a highlighter.

export const PALETTES = {
    dark: {
        light: false,
        ground: '#0A0E13',      // the ground plane
        plate: '#131A22',       // channel banks and terraced massing
        water: '#123243',
        waterLit: '#2E6070',
        surf: '#4E8494',        // tracers on the surface
        crust: '#2A1509',       // the skin on the molten
        hot: '#D2500F',
        hotter: '#FF7A1A',
        molten: '#FFE3B0',      // the incandescent core
        glow: '#FFB05A',        // the bloom around a molten channel
        steel: '#8FA1AE',       // truss members, piers
        deck: '#B9C4CD',
        accent: '#FFB612',      // Aztec gold: chains, arches, top chords
        shadow: 'rgba(0, 0, 0, 0.34)',
    },
    light: {
        light: true,
        ground: '#EAEEF1',
        plate: '#DCE3E8',
        water: '#B6CBD6',
        waterLit: '#7FA6B8',
        surf: '#3F6D82',
        crust: '#B9A493',
        hot: '#A83A08',
        hotter: '#D2500F',
        molten: '#FFF0CC',
        glow: '#E08A2E',
        steel: '#52646F',
        deck: '#33424C',
        accent: '#9A6A00',      // bronze
        shadow: 'rgba(20, 30, 40, 0.16)',
    },
};

export const paletteFor = (isDark) => (isDark ? PALETTES.dark : PALETTES.light);

// Hex is the authoring format above, but every draw call wants an alpha, so the
// channels get cached rather than reparsed each frame.
const rgbCache = {};

export const rgb = (hex) => {
    if (rgbCache[hex]) return rgbCache[hex];
    let h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const v = parseInt(h, 16);
    const out = `${(v >> 16) & 255}, ${(v >> 8) & 255}, ${v & 255}`;
    rgbCache[hex] = out;
    return out;
};

export const rgba = (hex, a) => `rgba(${rgb(hex)}, ${a})`;

export const lerp = (a, b, t) => a + (b - a) * t;

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// Smoothstep, used on every bridge's build progress and on the arrival reveal.
export const smooth = (v) => (v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v));

// Deterministic pseudo-random, so tracers and crust plates hold still frame to
// frame instead of shimmering.
export const hash = (i) => {
    const n = Math.sin(i * 127.1) * 43758.5453;
    return n - Math.floor(n);
};
