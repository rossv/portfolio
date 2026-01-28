import { useEffect, useRef, useState } from 'react';

export default function FluidBackground() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const [isStarfield, setIsStarfield] = useState(false);

    const scrollRef = useRef(0);
    const lastScrollRef = useRef(0);

    useEffect(() => {
        const stored = localStorage.getItem('spaceNerdMode') === 'stars';
        setIsStarfield(stored);
        document.documentElement.dataset.spaceNerd = stored ? 'stars' : 'water';

        const handleToggle = (event) => {
            const nextState = event.detail?.enabled ?? false;
            setIsStarfield(nextState);
        };
        window.addEventListener('space-nerd-toggle', handleToggle);
        return () => window.removeEventListener('space-nerd-toggle', handleToggle);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let bubbleCollectCount = 0;

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const particles = [];
        const particleCount = isStarfield ? 200 : 120;

        // Water-themed palette (Cyan, Sky, Blue, Teal)
        const colors = [
            'rgba(6, 182, 212, ', // cyan-500
            'rgba(59, 130, 246, ', // blue-500
            'rgba(14, 165, 233, ', // sky-500
            'rgba(20, 184, 166, '  // teal-500
        ];

        const starColors = [
            'rgba(255, 255, 255, ',
            'rgba(191, 219, 254, ',
            'rgba(165, 243, 252, ',
            'rgba(196, 181, 253, '
        ];

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
                    window.dispatchEvent(
                        new CustomEvent('bubble-collect', { detail: { count: bubbleCollectCount } })
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

        class Star {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : -20;
                this.radius = Math.random() * 1.8 + 0.4;
                this.speed = Math.random() * 0.6 + 0.2;
                this.alpha = Math.random() * 0.5 + 0.4;
                this.twinkle = Math.random() * 0.015 + 0.005;
                this.color = starColors[Math.floor(Math.random() * starColors.length)];
                this.depth = Math.random() * 0.8 + 0.2;
            }

            update(mouseX, mouseY, scrollDelta) {
                this.y += this.speed + scrollDelta * 0.15 * this.depth;
                if (this.y > height + 30) {
                    this.reset();
                }

                const dx = mouseX - this.x;
                const dy = mouseY - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const influence = Math.max(0, 160 - distance) / 160;
                this.x += (dx / 200) * influence * this.depth;

                this.alpha += this.twinkle;
                if (this.alpha > 1 || this.alpha < 0.2) {
                    this.twinkle *= -1;
                }
            }

            draw() {
                const glow = this.radius * 6;
                const gradient = ctx.createRadialGradient(
                    this.x,
                    this.y,
                    0,
                    this.x,
                    this.y,
                    glow
                );
                gradient.addColorStop(0, `${this.color}${this.alpha})`);
                gradient.addColorStop(1, `${this.color}0)`);
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, glow, 0, Math.PI * 2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `${this.color}${this.alpha})`;
                ctx.fill();
            }
        }

        const ParticleType = isStarfield ? Star : Particle;

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new ParticleType());
        }

        // Scroll handling
        const updateScroll = () => {
            scrollRef.current = window.scrollY;
        };
        window.addEventListener('scroll', updateScroll);

        const render = () => {
            const currentScroll = scrollRef.current;
            const scrollDelta = currentScroll - lastScrollRef.current;
            lastScrollRef.current = currentScroll;

            ctx.clearRect(0, 0, width, height);

            if (isStarfield) {
                particles.forEach(p => {
                    p.update(mouseRef.current.x, mouseRef.current.y, scrollDelta);
                    p.draw();
                });
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

            animationFrameId = requestAnimationFrame(render);
        };

        const handleResize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
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

        // Initial scroll position
        scrollRef.current = window.scrollY;
        lastScrollRef.current = window.scrollY;

        render();

        return () => {
            window.removeEventListener('scroll', updateScroll);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isStarfield]);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-canvas dark:bg-slate-950 transition-colors duration-300">
            {/* Base gradient for atmosphere */}
            <div className="absolute inset-0 vignette-layer" />

            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full opacity-70 dark:opacity-50"
            />
        </div>
    );
}
