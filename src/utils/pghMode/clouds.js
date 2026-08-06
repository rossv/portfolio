// The overcast for Pittsburgh mode.
//
// Fractal value noise on a small offscreen buffer, scaled up with smoothing.
// Stacked radial gradients were the first attempt and they read as grey
// lozenges rather than weather; a noise field gives the billow and the soft
// edges an overcast sky actually has.
//
// The field is biased dense and held in a narrow value range, because it sits
// behind the name and the licence badges and must never compete with them.

// The buffer is coarse, but not fixed: upscaling one small buffer to a very wide
// viewport turns the banks to mush, so its width follows the viewport within
// bounds. Regenerating it costs four octaves per pixel, so it is rebuilt every
// few frames rather than every frame — at this drift rate the difference is
// invisible, and it keeps the per-frame cost flat.
const MIN_W = 160;
const MAX_W = 256;
const REBUILD_EVERY = 4;

const smoothstep = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

const vhash = (x, y) => {
    const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return n - Math.floor(n);
};

function vnoise(x, y) {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = smoothstep(x - xi);
    const yf = smoothstep(y - yi);
    const a = vhash(xi, yi);
    const b = vhash(xi + 1, yi);
    const c = vhash(xi, yi + 1);
    const d = vhash(xi + 1, yi + 1);
    const top = a + (b - a) * xf;
    const bottom = c + (d - c) * xf;
    return top + (bottom - top) * yf;
}

function fbm(x, y) {
    let sum = 0;
    let amp = 0.5;
    let fx = x;
    let fy = y;
    for (let o = 0; o < 4; o += 1) {
        sum += vnoise(fx, fy) * amp;
        fx *= 2.03;
        fy *= 2.03;
        amp *= 0.5;
    }
    return sum;
}

export function createClouds(ctx, palette, { reduceMotion = false } = {}) {
    const buffer = document.createElement('canvas');
    const bufferCtx = buffer.getContext('2d');
    let NW = 0;
    let NH = 0;
    let image = null;
    let sinceRebuild = REBUILD_EVERY;

    function fit(viewportW) {
        const w = Math.round(Math.min(MAX_W, Math.max(MIN_W, viewportW / 10)));
        if (w === NW) return;
        NW = w;
        NH = Math.round(w * 0.5625);
        buffer.width = NW;
        buffer.height = NH;
        image = bufferCtx.createImageData(NW, NH);
        sinceRebuild = REBUILD_EVERY;
    }

    // Two tones out of the palette: the shadowed underside of the bank, and the
    // lit top. On paper the lit tone goes nearly white; on the dark ground it
    // stops well short, so the cloud never glows.
    const shadow = palette.light ? [126, 138, 148] : [58, 72, 86];
    const lit = palette.light ? [252, 253, 254] : [128, 146, 162];

    function frame(t, viewportW) {
        fit(viewportW);
        sinceRebuild += 1;
        if (sinceRebuild < REBUILD_EVERY) return buffer;
        sinceRebuild = 0;

        // Drift rate. The first pass read as almost static — this is three times
        // that, which still takes a bank about half a minute to cross, so it
        // reads as weather rather than as a scrolling texture.
        const drift = (reduceMotion ? 12000 : t) * 0.000055;
        const px = image.data;

        // Frequency scales inversely with the buffer, so a wider viewport buys
        // sharper edges on the same bank rather than a different, busier sky.
        const freq = MIN_W / NW;

        for (let y = 0; y < NH; y += 1) {
            // The bank thins toward the bottom of the field, so the sky is
            // clear behind the page content below the hero.
            const fade = 1 - smoothstep((y / NH - 0.30) / 0.70);
            for (let x = 0; x < NW; x += 1) {
                let v = fbm(x * 0.045 * freq + drift, y * 0.075 * freq + drift * 0.35);
                v = smoothstep((v - 0.34) / 0.42);
                const k = v * fade;
                const i = (y * NW + x) * 4;
                px[i] = shadow[0] + (lit[0] - shadow[0]) * k;
                px[i + 1] = shadow[1] + (lit[1] - shadow[1]) * k;
                px[i + 2] = shadow[2] + (lit[2] - shadow[2]) * k;
                px[i + 3] = Math.round(255 * (0.28 + 0.60 * k) * fade);
            }
        }

        bufferCtx.putImageData(image, 0, 0);
        return buffer;
    }

    return { frame };
}
