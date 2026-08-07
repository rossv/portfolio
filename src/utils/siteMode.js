// Background mode for the site: water, space nerd, geospatial, technologist,
// Pittsburgh.
//
// Triple-clicking the portrait cycles through them. The legacy `spaceNerdMode`
// key and the `data-space-nerd` attribute are still written, so the badge
// unlock and WaterBanner's hide rule keep working unchanged.

export const MODES = ['water', 'stars', 'geo', 'tech', 'pgh'];

export const MODE_LABELS = {
    water: 'water',
    stars: 'space nerd',
    geo: 'geospatial',
    tech: 'technologist',
    pgh: 'Pittsburgh',
};

export const MODE_EVENT = 'site-mode-change';

export function readMode() {
    if (typeof window === 'undefined') return 'water';
    const stored = window.localStorage.getItem('siteMode');
    if (MODES.includes(stored)) return stored;
    // Migrate anyone who set the mode before geospatial existed.
    return window.localStorage.getItem('spaceNerdMode') === 'stars' ? 'stars' : 'water';
}

// Reflects the mode onto <html> so CSS can key off it, without touching
// localStorage — used on mount to sync the attribute to stored state.
export function reflectMode(mode) {
    const root = document.documentElement;
    root.dataset.siteMode = mode;
    root.dataset.spaceNerd = mode === 'stars' ? 'stars' : 'water';
}

export function writeMode(mode) {
    window.localStorage.setItem('siteMode', mode);
    // Kept in sync for the badge listener, which predates this module.
    window.localStorage.setItem('spaceNerdMode', mode === 'stars' ? 'stars' : 'water');
    reflectMode(mode);
    window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: { mode } }));
    window.dispatchEvent(
        new CustomEvent('space-nerd-toggle', { detail: { enabled: mode === 'stars' } })
    );
}

export const nextMode = (mode) => MODES[(MODES.indexOf(mode) + 1) % MODES.length];
