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
        plate: '#131A22',       // channel banks
        // Rivers are held well back. This is a backdrop, and the earlier values
        // read as neon against near-black.
        water: '#11242D',
        waterLit: '#244A56',
        surf: '#3B6472',        // tracers on the surface
        hot: '#A51F0B',         // red-orange crust at the channel edges
        hotter: '#E23B12',      // exposed, fast-moving iron
        molten: '#FF7440',      // the white-hot centre of the channel
        glow: '#E32612',        // red bloom around a molten channel
        steel: '#8FA1AE',       // truss members, piers
        structure: '#C9D4DC',
        deck: '#9FADB7',
        accent: '#FFB612',      // Aztec gold, for the hero cable
        // The bridges you place are structure, not signage. Gold on every one of
        // them pulled the eye away from the page, so they carry a weathered
        // bronze instead and let the hero keep the only true gold.
        bridge: '#9C7A3A',
        // The hero cable: shaded underside, the collars at each hanger, the
        // handrope, and the lit crown that makes it read as round.
        cableLow: '#A06D00',
        bandCollar: '#765000',
        rope: '#B9C4CD',
        crown: '#FFECB4',
        shadow: 'rgba(0, 0, 0, 0.38)',
    },
    light: {
        light: true,
        ground: '#EAEEF1',
        plate: '#DCE3E8',
        water: '#C2D2DA',
        waterLit: '#9BB4BF',
        surf: '#5C7B86',
        hot: '#A82C18',
        hotter: '#D94A24',
        molten: '#F47A45',
        glow: '#D83A20',
        steel: '#52646F',
        structure: '#2C3A45',
        deck: '#41525F',
        accent: '#C58A00',      // Pittsburgh gold, deepened for contrast on paper
        bridge: '#8A7449',
        cableLow: '#8A5F00',
        bandCollar: '#684700',
        rope: '#41525F',
        crown: '#FFFFFF',
        shadow: 'rgba(20, 30, 40, 0.18)',
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
