import { useEffect, useRef, useState } from 'react';
import { makeStarSprites, makePuffSprites, makeWarmGlow, paletteFor } from '../utils/spaceMode/sprites';
import { createStarfield } from '../utils/spaceMode/starfield';
import { createAurora } from '../utils/spaceMode/aurora';
import { createFleet } from '../utils/spaceMode/launchFleet';
import { paletteFor as geoPaletteFor } from '../utils/geoMode/palette';
import { createTerrain } from '../utils/geoMode/terrain';
import { createFlood } from '../utils/geoMode/flood';
import { paletteFor as techPaletteFor } from '../utils/techMode/palette';
import { createPipeline } from '../utils/techMode/pipeline';
import { createWaveform } from '../utils/techMode/waveform';
import { readMode, reflectMode, MODE_EVENT } from '../utils/siteMode';

export default function FluidBackground() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const [mode, setMode] = useState('water');
    // Space mode is drawn light-on-dark or ink-on-paper, so the canvas has to
    // follow the theme. ThemeToggle only flips a class, hence the observer.
    const [isDark, setIsDark] = useState(true);

    const scrollRef = useRef(0);
    const lastScrollRef = useRef(0);
    // Set when a mode is switched on, so its arrival animation only plays on
    // arrival — the fleet launch, and the flood's raster scan.
    const arrivedRef = useRef(false);
    // Placed stars outlive a palette rebuild.
    const placedRef = useRef([]);

    useEffect(() => {
        const stored = readMode();
        setMode(stored);
        reflectMode(stored);

        const handleMode = (event) => {
            const next = event.detail?.mode ?? 'water';
            arrivedRef.current = true;
            setMode(next);
        };
        window.addEventListener(MODE_EVENT, handleMode);

        const root = document.documentElement;
        const readTheme = () => setIsDark(root.classList.contains('dark'));
        readTheme();
        const observer = new MutationObserver(readTheme);
        observer.observe(root, { attributes: true, attributeFilter: ['class'] });

        return () => {
            window.removeEventListener(MODE_EVENT, handleMode);
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        // Respect reduced-motion: draw a single static frame instead of the
        // continuous, mouse-reactive rAF loop. (The global CSS reduced-motion
        // rule only covers CSS animations, not this canvas.)
        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let animationFrameId;
        // Click effects, drawn on the same canvas as the particles.
        const ripples = []; // water: expanding rings | space: placement pulse
        const sparks = [];  // space: radial starburst
        let bubbleCollectCount = Number.parseInt(window.localStorage.getItem('bubbleCollectCount') || '0', 10);
        if (!Number.isFinite(bubbleCollectCount) || bubbleCollectCount < 0) {
            bubbleCollectCount = 0;
        }

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        // Water-themed palette (Cyan, Sky, Blue, Teal)
        const colors = [
            'rgba(6, 182, 212, ', // cyan-500
            'rgba(59, 130, 246, ', // blue-500
            'rgba(14, 165, 233, ', // sky-500
            'rgba(20, 184, 166, '  // teal-500
        ];

        const isStarfield = mode === 'stars';
        const isGeo = mode === 'geo';
        const isTech = mode === 'tech';

        /* ---------- space mode ------------------------------------- */
        // Each mode builds only its own pieces, so the others carry no cost.
        let starfield = null;
        let aurora = null;
        let fleet = null;

        const palette = paletteFor(isDark);
        // Click sparks and the placement pulse follow the same palette.
        const sparkTints = palette.starTints;

        /* ---------- geospatial mode -------------------------------- */
        let terrain = null;
        let flood = null;

        if (isGeo) {
            const geoPalette = geoPaletteFor(isDark);
            terrain = createTerrain(ctx, geoPalette);
            flood = createFlood(ctx, geoPalette);
            terrain.resize(width, height);
            flood.resize(width, height);
            // The scan replays on arrival; on a reload it is already settled.
            if (arrivedRef.current && !prefersReduced) {
                arrivedRef.current = false;
                flood.replay();
            } else {
                flood.settle();
            }
        }

        /* ---------- technologist mode ------------------------------ */
        let pipeline = null;
        let waveform = null;

        if (isTech) {
            const techPalette = techPaletteFor(isDark);
            pipeline = createPipeline(ctx, techPalette);
            waveform = createWaveform(ctx, techPalette);
            pipeline.resize(width, height);
            waveform.resize(width, height);
            // The graph fires on arrival, the way the fleet launches.
            if (arrivedRef.current && !prefersReduced) {
                arrivedRef.current = false;
                pipeline.run();
            }
        }

        if (isStarfield) {
            starfield = createStarfield(ctx, makeStarSprites(palette), palette);
            aurora = createAurora(ctx, palette);
            fleet = createFleet(ctx, {
                puffSprites: makePuffSprites(palette),
                warmGlow: makeWarmGlow(palette),
                palette,
            });
            starfield.resize(width, height);
            aurora.resize(width, height, 1);
            fleet.resize(width, height);
            // Restore whatever was placed before the last palette rebuild.
            for (const p of placedRef.current) starfield.place(p.x, p.y);
            if (arrivedRef.current && !prefersReduced) {
                arrivedRef.current = false;
                fleet.launch();
            }
        }

        /* ---------- water mode ------------------------------------- */
        const particles = [];

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : height + 20;
                this.vx = (Math.random() - 0.5) * 0.5; // Gentle horizontal drift
                this.vy = -(Math.random() * 0.5 + 0.3); // Upward buoyancy
                this.size = Math.random() * 4 + 2; // Increased size: 2-6px
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.alpha = Math.random() * 0.5 + 0.4; // Increased opacity: 0.4-0.9
                this.friction = 0.96; // For mouse interaction decay
                this.collected = false;
            }

            update(mouseX, mouseY, scrollDelta) {
                // Parallax effect: bubbles move with scroll
                // If scrolling down (positive delta), bubbles move up (subtract delta)
                // We multiply by a factor < 1 to make them move slower than background (depth effect)
                this.y -= scrollDelta * 0.5;

                // Basic movement
                this.x += this.vx;
                this.y += this.vy;

                // Mouse Interaction (Attraction field)
                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const interactionRadius = 200;

                if (distance < interactionRadius) {
                    const force = (interactionRadius - distance) / interactionRadius;
                    const angle = Math.atan2(dy, dx);

                    // Gentle attraction
                    const pull = force * 0.8;
                    this.vx += Math.cos(angle) * pull;
                    this.vy += Math.sin(angle) * pull;
                }

                if (!this.collected && distance < this.size + 12) {
                    this.collected = true;
                    bubbleCollectCount += 1;
                    window.localStorage.setItem('bubbleCollectCount', String(bubbleCollectCount));
                    window.dispatchEvent(
                        new CustomEvent('bubble-collect', { detail: { count: bubbleCollectCount, increment: 1 } })
                    );
                }

                // Friction to stabilize velocity after interaction
                this.vx *= this.friction;

                // Apply buoyancy force constantly to ensure they eventually go up
                // Use a soft target velocity for Y to simulate terminal velocity in water
                if (this.vy > -0.5) {
                    this.vy -= 0.02;
                }

                // Reset when out of bounds
                // Note: With scroll, they can go off top or bottom
                if (this.y < -50 || this.x < -20 || this.x > width + 20) {
                    // Check if strictly out of view
                    if (this.y < -50) {
                        this.reset();
                    }
                    else if (this.x < -20) this.x = width + 20;
                    else if (this.x > width + 20) this.x = -20;
                }

                // Also reset if they go too far down (e.g. scrolling up fast)
                if (this.y > height + 50) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
            }
        }

        if (mode === 'water') {
            for (let i = 0; i < 120; i++) particles.push(new Particle());
        }

        // Spawn a themed click effect at (x, y). No-op under reduced motion.
        const spawnClickEffect = (x, y) => {
            if (isStarfield) {
                // Space-nerd: clicking the sky places a star. The pulse and
                // sparks double as its birth effect.
                starfield?.place(x, y);
                placedRef.current.push({ x, y });
                // Fires before the reduced-motion bail below, so the Stargazer
                // badge is still earnable without the birth animation.
                window.dispatchEvent(
                    new CustomEvent('star-place', { detail: { count: placedRef.current.length } })
                );
                if (prefersReduced) return;
                ripples.push({ x, y, age: 0, maxAge: 34, kind: 'warp' });
                const count = 16;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.35;
                    const speed = Math.random() * 3.2 + 1.8;
                    sparks.push({
                        x, y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 0,
                        maxLife: Math.random() * 26 + 26,
                        size: Math.random() * 1.4 + 0.9,
                        color: sparkTints[Math.floor(Math.random() * sparkTints.length)],
                    });
                }
            } else if (isGeo) {
                if (prefersReduced) return;
                // Geospatial: a survey ping, echoing the placement pulse but
                // in the topo palette rather than the star tints.
                ripples.push({ x, y, age: 0, maxAge: 40, kind: 'ping' });
            } else if (isTech) {
                // Technologist: inject packets from the nearest node, so a
                // click sends data down the graph.
                pipeline?.pulse(x, y);
            } else {
                if (prefersReduced) return;
                // Water: a couple of expanding ripple rings + a splash that
                // nudges nearby bubbles outward.
                ripples.push({ x, y, age: 0, maxAge: 46, kind: 'ripple' });
                ripples.push({ x, y, age: -9, maxAge: 46, kind: 'ripple' });
                particles.forEach((p) => {
                    const dx = p.x - x;
                    const dy = p.y - y;
                    const d = Math.hypot(dx, dy);
                    if (d > 0.001 && d < 90) {
                        const f = ((90 - d) / 90) * 2.6;
                        p.vx += (dx / d) * f;
                        p.vy += (dy / d) * f;
                    }
                });
            }
            // Bound the work if someone clicks rapidly.
            if (ripples.length > 12) ripples.splice(0, ripples.length - 12);
            if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
        };

        const handlePointerDown = (e) => {
            // Ignore clicks on real UI: placing a star behind a button or a
            // project card is never what was meant.
            if (e.target instanceof Element && e.target.closest('a, button, input, [role="button"]')) return;
            spawnClickEffect(e.clientX, e.clientY);
            if (prefersReduced) render();
        };

        // Scroll handling
        const updateScroll = () => {
            scrollRef.current = window.scrollY;
        };
        window.addEventListener('scroll', updateScroll);

        let lastFrame = 0;

        const render = () => {
            const now = performance.now();
            // Clamped so a backgrounded tab does not resume with a huge step.
            const dt = Math.min(48, lastFrame ? now - lastFrame : 16);
            lastFrame = now;

            const currentScroll = scrollRef.current;
            const scrollDelta = currentScroll - lastScrollRef.current;
            lastScrollRef.current = currentScroll;

            ctx.clearRect(0, 0, width, height);

            // Camera rumble while craft are still low. Held under 3px: more
            // than that and it fights the page content sitting on top.
            const shake = fleet ? fleet.rumble() : 0;
            ctx.save();
            if (shake > 0.02) {
                ctx.translate(Math.sin(now * 0.11) * shake, Math.cos(now * 0.17) * shake * 0.7);
            }

            if (isStarfield) {
                starfield.frame(now, scrollDelta, mouseRef.current);
                aurora.frame(now, currentScroll);
            } else if (isGeo) {
                terrain.frame(now, mouseRef.current);
                // Knock the contours back under the band before drawing it,
                // so the two are not competing for the same lines.
                flood.dim(currentScroll);
                flood.frame(dt, currentScroll);
            } else if (isTech) {
                pipeline.frame(now, dt, currentScroll, mouseRef.current);
                waveform.frame(now, currentScroll);
            } else {
                particles.forEach(p => {
                    p.update(mouseRef.current.x, mouseRef.current.y, scrollDelta);

                    // Fade out particles near the top (approaching water surface)
                    // key change: The 'surface' effectively moves up as we scroll down
                    // At scroll 0, surface is at ~450px.
                    // At scroll 450, surface is at 0px (top of screen).
                    const surfaceY = 450 - currentScroll;

                    // Bubbles fully disappear above surfaceY
                    const fadeZone = 400; // Distance over which they fade out

                    let fadeFactor = 0;
                    // Only visible below surfaceY
                    if (p.y > surfaceY) {
                        fadeFactor = Math.min(1, (p.y - surfaceY) / fadeZone);
                    }

                    // Transient alpha for drawing only
                    const drawAlpha = p.alpha * fadeFactor;

                    if (drawAlpha > 0.01) {
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                        ctx.fillStyle = p.color + drawAlpha + ')';
                        ctx.fill();
                    }
                });
            }

            // Click effects (same canvas/layer as the particles).
            for (let i = ripples.length - 1; i >= 0; i--) {
                const r = ripples[i];
                r.age += 1;
                if (r.age < 0) continue; // delayed start
                const t = r.age / r.maxAge;
                if (t >= 1) { ripples.splice(i, 1); continue; }
                const ease = 1 - Math.pow(1 - t, 2); // ease-out expansion
                if (r.kind === 'warp') {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, ease * 95, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${palette.link}, ${(1 - t) * 0.55})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                } else if (r.kind === 'ping') {
                    // Survey ping: two rings, the trailing one lagging.
                    const geo = geoPaletteFor(isDark);
                    for (const lag of [0, 0.22]) {
                        const k = t - lag;
                        if (k <= 0) continue;
                        ctx.beginPath();
                        ctx.arc(r.x, r.y, (1 - Math.pow(1 - k, 2)) * 88, 0, Math.PI * 2);
                        ctx.strokeStyle = `rgba(${geo.index}, ${(1 - k) * 0.5})`;
                        ctx.lineWidth = 1.4;
                        ctx.stroke();
                    }
                } else {
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, ease * 72, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(56, 189, 248, ${(1 - t) * 0.45})`; // sky/cyan
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }
            for (let i = sparks.length - 1; i >= 0; i--) {
                const s = sparks[i];
                s.life += 1;
                if (s.life >= s.maxLife) { sparks.splice(i, 1); continue; }
                s.x += s.vx;
                s.y += s.vy;
                s.vx *= 0.93;
                s.vy *= 0.93;
                const a = 1 - s.life / s.maxLife;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fillStyle = `${s.color}${a})`;
                ctx.fill();
            }

            // The fleet flies above the field but still behind page content.
            if (fleet) {
                fleet.frame(dt);
                fleet.decayRumble();
            }

            ctx.restore();

            if (!prefersReduced) {
                animationFrameId = requestAnimationFrame(render);
            }
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
            starfield?.resize(width, height);
            aurora?.resize(width, height, 1);
            fleet?.resize(width, height);
            terrain?.resize(width, height);
            flood?.resize(width, height);
            pipeline?.resize(width, height);
            waveform?.resize(width, height);
        };

        const handleMouseMove = (e) => {
            mouseRef.current.x = e.clientX;
            mouseRef.current.y = e.clientY;
        };

        const handleTouchMove = (e) => {
            if (e.touches.length > 0) {
                mouseRef.current.x = e.touches[0].clientX;
                mouseRef.current.y = e.touches[0].clientY;
            }
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('pointerdown', handlePointerDown);

        // Initial scroll position
        scrollRef.current = window.scrollY;
        lastScrollRef.current = window.scrollY;

        render();

        return () => {
            window.removeEventListener('scroll', updateScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('pointerdown', handlePointerDown);
            cancelAnimationFrame(animationFrameId);
        };
        // Only the canvas modes read a palette, so a theme change in water
        // mode must not tear down and restart the bubbles.
    }, [mode, mode !== 'water' && isDark]);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-canvas dark:bg-slate-950 transition-colors duration-300">
            {/* Base gradient for atmosphere */}
            <div className="absolute inset-0 vignette-layer" />

            <canvas
                ref={canvasRef}
                // The canvas modes run brighter: their marks are points and
                // lines, and holding the whole canvas at 50% muted the marks
                // rather than the glow.
                className={mode === 'water'
                    ? 'absolute inset-0 w-full h-full opacity-70 dark:opacity-50'
                    : 'absolute inset-0 w-full h-full opacity-95'}
            />
        </div>
    );
}
