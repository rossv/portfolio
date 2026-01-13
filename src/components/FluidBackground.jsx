import { useEffect, useRef } from 'react';

export default function FluidBackground() {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        let width = window.innerWidth;
        let height = window.innerHeight;

        canvas.width = width;
        canvas.height = height;

        const particles = [];
        const particleCount = 120; // Increased density slightly

        // Water-themed palette (Cyan, Sky, Blue, Teal)
        const colors = [
            'rgba(6, 182, 212, ', // cyan-500
            'rgba(59, 130, 246, ', // blue-500
            'rgba(14, 165, 233, ', // sky-500
            'rgba(20, 184, 166, '  // teal-500
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
            }

            update(mouseX, mouseY) {
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

                // Friction to stabilize velocity after interaction
                this.vx *= this.friction;

                // Apply buoyancy force constantly to ensure they eventually go up
                // Use a soft target velocity for Y to simulate terminal velocity in water
                if (this.vy > -0.5) {
                    this.vy -= 0.02;
                }

                // Reset when out of bounds
                if (this.y < -20 || this.x < -20 || this.x > width + 20) {
                    // Check if strictly out of view
                    if (this.y < -20) {
                        this.reset();
                    }
                    else if (this.x < -20) this.x = width + 20;
                    else if (this.x > width + 20) this.x = -20;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.alpha + ')';
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.update(mouseRef.current.x, mouseRef.current.y);

                // Fade out particles near the top (approaching water surface at y=0)
                // Strict fade out: Ensure bubbles are invisible above the video banner (approx 450px)
                const surfaceY = 450; // Bubbles fully disappear above this Y
                const fadeZone = 400; // Distance over which they fade out

                let fadeFactor = 0;
                if (p.y > surfaceY) {
                    fadeFactor = Math.min(1, (p.y - surfaceY) / fadeZone);
                }

                // Transient alpha for drawing only
                const drawAlpha = p.alpha * fadeFactor;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color + drawAlpha + ')';
                ctx.fill();
            });

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
        render();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

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
