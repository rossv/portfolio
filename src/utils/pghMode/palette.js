// Palettes for Pittsburgh mode.
//
// Two grounds, as with space and geospatial mode — a dark-only palette
// silently breaks the other theme. Each palette is a complete world: sky, two
// ridge tones, water, structure and one accent. The accent is the only
// saturated thing in either of them, and that restraint is what keeps black
// and gold off the scoreboard.
//
// Ported from docs/prototypes/pittsburgh-parallax.html, which carries two more
// palettes behind its control rail. Only these two ship.

export const PALETTES = {
    dark: {
        light: false,
        skyTop: '#080B0F', skyBot: '#151C25',
        ridgeFar: '#141A22', ridgeNear: '#1C242E',
        water: '#0D1A23', waterTint: '#2E6070', surf: '#4E8494',
        ground: '#0A0E13', ground2: '#05070A', mass: '#232E39',
        edge: '#8FA1AE', structure: '#C9D4DC',
        accent: '#FFB612', hot: '#D2500F', haze: '#2A3642',
    },
    // The light ground substitutes bronze for gold: #FFB612 on paper is a
    // highlighter, and the whole point of the accent is that it is the only
    // saturated mark on screen.
    light: {
        light: true,
        skyTop: '#F2F4F6', skyBot: '#DFE5EA',
        ridgeFar: '#CDD6DD', ridgeNear: '#B8C4CE',
        water: '#C9D9E2', waterTint: '#7FA6B8', surf: '#4E7A8E',
        ground: '#C3CED6', ground2: '#AEBDC9', mass: '#93A5B3',
        edge: '#41525F', structure: '#2C3A45',
        accent: '#9A6A00', hot: '#A83A08', haze: '#C6D0D8',
    },
};

export const paletteFor = (isDark) => (isDark ? PALETTES.dark : PALETTES.light);

// Hex is the authoring format in the palettes above, but every draw call wants
// an alpha, so the channels get cached rather than reparsed each frame.
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

// Smoothstep, used on every span's build progress.
export const smooth = (v) => (v <= 0 ? 0 : v >= 1 ? 1 : v * v * (3 - 2 * v));

// Deterministic pseudo-random, so ridges, windows and stack plumes hold still
// frame to frame instead of shimmering.
export const hash = (i) => {
    const n = Math.sin(i * 127.1) * 43758.5453;
    return n - Math.floor(n);
};
