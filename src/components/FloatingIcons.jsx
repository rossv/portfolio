import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    Map as MapIcon,
    Terminal, GitBranch, Database, Cog, Layers,
    Users, Presentation, Lightbulb, GraduationCap, Compass,
    Trophy, FileText, Mic, Newspaper, BadgeCheck,
} from 'lucide-react';

const PythonLogo = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.31.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.83l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.23l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05L0 11.97l.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.24l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05 1.07.13zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22zM21.1 6.11l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46-.26-.38-.3-.32-.33-.24-.35-.2-.35-.14-.33-.1-.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01.21.03zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08-.33.23z" fill="url(#python-floating-gradient)" transform="scale(0.8) translate(2,2)" />
        <defs>
            <linearGradient id="python-floating-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#306998" />
                <stop offset="100%" stopColor="#FFD43B" />
            </linearGradient>
        </defs>
    </svg>
);

const PipeSection = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Pipe Wall */}
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-slate-500/80 dark:text-slate-300/80" />
        {/* Water Level */}
        <path d="M2.5 14C4.5 13 7.5 15 9.5 14C11.5 13 13.5 13 15.5 14C17.5 15 20.5 13 21.5 14L20.2 18.5C18.5 20.5 15.5 21.8 12 21.8C8.5 21.8 5.5 20.5 3.8 18.5L2.5 14Z" fill="currentColor" className="text-cyan-400/60 dark:text-cyan-500/60" />
    </svg>
);

const SewerNetwork = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Trunk Line - Thicker */}
        <path d="M4 20 L12 12 L20 4" stroke="currentColor" strokeWidth="2.5" className="text-slate-500/80 dark:text-slate-400/80" strokeLinecap="round" />

        {/* Feeder Lines - Thinner */}
        <path d="M8 16 L5 13" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" strokeLinecap="round" />
        <path d="M16 8 L19 11" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" strokeLinecap="round" />
        <path d="M12 12 L15 15" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" strokeLinecap="round" />

        {/* Nodes (Manholes) - Circles */}
        <circle cx="4" cy="20" r="2" fill="currentColor" className="text-emerald-500/90" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" className="text-emerald-500/90" />
        <circle cx="20" cy="4" r="2" fill="currentColor" className="text-emerald-500/90" />

        {/* Feeder Nodes */}
        <circle cx="5" cy="13" r="1.5" fill="currentColor" className="text-emerald-400/80" />
        <circle cx="19" cy="11" r="1.5" fill="currentColor" className="text-emerald-400/80" />
        <circle cx="15" cy="15" r="1.5" fill="currentColor" className="text-emerald-400/80" />
    </svg>
);

const AppDashboard = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* App Window Frame */}
        <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" />

        {/* Sidebar */}
        <path d="M8 3 V21" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/60 dark:text-slate-600/60" />

        {/* Header Area */}
        <rect x="10" y="5" width="10" height="3" rx="1" fill="currentColor" className="text-indigo-400/40" />

        {/* Mini Graphs/Data */}
        {/* Line Chart */}
        <path d="M10 16 L12 14 L14 17 L17 12 L19 13" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/80" strokeLinecap="round" strokeLinejoin="round" />

        {/* Bar Chart Bars */}
        <rect x="10" y="10" width="2" height="4" rx="0.5" fill="currentColor" className="text-indigo-500/60" />
        <rect x="13" y="11" width="2" height="3" rx="0.5" fill="currentColor" className="text-indigo-500/60" />
        <rect x="16" y="9" width="2" height="5" rx="0.5" fill="currentColor" className="text-indigo-500/60" />
    </svg>
);

const FloatingItem = ({ children, delay, x, y, duration, size = "w-24 h-24", rotationRange = [-10, 10] }) => {
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.div
            className={`absolute z-0 pointer-events-none ${size} flex items-center justify-center p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl`}
            initial={{ left: x, top: y, opacity: 0 }}
            animate={prefersReducedMotion
                ? { opacity: 0.8 }
                : { y: [0, -20, 0], rotate: [0, ...rotationRange, 0], opacity: 0.8 }
            }
            transition={prefersReducedMotion
                ? { opacity: { duration: 1 } }
                : {
                    y: { duration: duration, repeat: Infinity, ease: "easeInOut", delay: delay },
                    rotate: { duration: duration * 1.5, repeat: Infinity, ease: "easeInOut", delay: delay },
                    opacity: { duration: 1 }
                }
            }
        >
            {children}
        </motion.div>
    );
};

const Bubble = ({ x, y, size, delay, duration }) => {
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.div
            className={`absolute z-0 pointer-events-none rounded-full bg-blue-300/10 backdrop-blur-[1px] border border-white/10 shadow-sm`}
            style={{ width: size, height: size }}
            initial={{ left: x, top: y, opacity: 0 }}
            animate={prefersReducedMotion
                ? { opacity: 0.3 }
                : { y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }
            }
            transition={prefersReducedMotion
                ? { opacity: { duration: 1 } }
                : { duration: duration, repeat: Infinity, ease: "easeInOut", delay: delay }
            }
        />
    );
};

// Lucide-based bubble sets for the non-skills sections. Each render fn takes a
// className so the icon fills its floating bubble.
const LINE = (Icon, tint) => (cls) => <Icon className={`${cls} ${tint}`} strokeWidth={1.5} />;

const VARIANTS = {
    toolkit: {
        items: [
            { render: LINE(Terminal, 'text-indigo-500/80'), x: '4%', y: '20%', delay: 0, duration: 6, size: 'w-20 h-20' },
            { render: LINE(GitBranch, 'text-cyan-500/80'), x: '89%', y: '15%', delay: 1, duration: 7, size: 'w-20 h-20' },
            { render: LINE(Database, 'text-emerald-500/80'), x: '8%', y: '68%', delay: 0.5, duration: 6.5, size: 'w-20 h-20' },
            { render: LINE(Cog, 'text-slate-500/80'), x: '90%', y: '62%', delay: 1.5, duration: 5.5, size: 'w-16 h-16' },
            { render: LINE(Layers, 'text-indigo-500/80'), x: '84%', y: '82%', delay: 2, duration: 6, size: 'w-16 h-16' },
        ],
        bubbles: [
            { x: '3%', y: '45%', size: 18, delay: 0, duration: 4 },
            { x: '93%', y: '38%', size: 22, delay: 2, duration: 5 },
            { x: '6%', y: '90%', size: 14, delay: 1, duration: 3.5 },
        ],
    },
    leadership: {
        items: [
            { render: LINE(Users, 'text-cyan-500/80'), x: '4%', y: '20%', delay: 0, duration: 6, size: 'w-20 h-20' },
            { render: LINE(Presentation, 'text-indigo-500/80'), x: '89%', y: '15%', delay: 1, duration: 7, size: 'w-20 h-20' },
            { render: LINE(Lightbulb, 'text-amber-500/80'), x: '7%', y: '68%', delay: 0.5, duration: 6.5, size: 'w-16 h-16' },
            { render: LINE(GraduationCap, 'text-emerald-500/80'), x: '90%', y: '64%', delay: 1.5, duration: 5.5, size: 'w-20 h-20' },
            { render: LINE(Compass, 'text-slate-500/80'), x: '85%', y: '84%', delay: 2, duration: 6, size: 'w-16 h-16' },
        ],
        bubbles: [
            { x: '3%', y: '45%', size: 20, delay: 0, duration: 4.5 },
            { x: '94%', y: '40%', size: 16, delay: 1.5, duration: 4 },
            { x: '5%', y: '90%', size: 14, delay: 1, duration: 3.5 },
        ],
    },
    recognition: {
        items: [
            { render: LINE(Trophy, 'text-amber-500/80'), x: '4%', y: '20%', delay: 0, duration: 6, size: 'w-20 h-20' },
            { render: LINE(FileText, 'text-indigo-500/80'), x: '89%', y: '15%', delay: 1, duration: 7, size: 'w-20 h-20' },
            { render: LINE(Mic, 'text-cyan-500/80'), x: '8%', y: '68%', delay: 0.5, duration: 6.5, size: 'w-16 h-16' },
            { render: LINE(Newspaper, 'text-slate-500/80'), x: '90%', y: '62%', delay: 1.5, duration: 5.5, size: 'w-20 h-20' },
            { render: LINE(BadgeCheck, 'text-emerald-500/80'), x: '85%', y: '84%', delay: 2, duration: 6, size: 'w-16 h-16' },
        ],
        bubbles: [
            { x: '3%', y: '45%', size: 18, delay: 0, duration: 4 },
            { x: '93%', y: '40%', size: 22, delay: 2, duration: 5 },
            { x: '6%', y: '90%', size: 14, delay: 1, duration: 3.5 },
        ],
    },
};

// The bubbles are a desktop, pointer-only flourish (matches the hero's
// client:media gate) — render nothing otherwise, on all variants.
function useDesktopHover() {
    const [ok, setOk] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return undefined;
        const mq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');
        const update = () => setOk(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    return ok;
}

export default function FloatingIcons({ variant = 'skills' }) {
    const canShow = useDesktopHover();
    if (!canShow) return null;

    if (variant === 'skills') {
        // Original hero/skills bubbles (H&H + GIS + coding themed).
        const pos = {
            python: { x: '4%', y: '15%' },
            sewer: { x: '85%', y: '12%' },
            pipe: { x: '12%', y: '22%' },
            dashboard: { x: '80%', y: '22%' },
            map: { x: '90%', y: '18%' },
            bubbles: [
                { x: '40%', y: '10%', size: 20, delay: 0, duration: 4 },
                { x: '60%', y: '80%', size: 30, delay: 2, duration: 5 },
                { x: '90%', y: '50%', size: 15, delay: 1, duration: 3 },
                { x: '20%', y: '40%', size: 25, delay: 3, duration: 6 },
                { x: '50%', y: '90%', size: 18, delay: 1.5, duration: 4.5 },
            ],
        };
        return (
            <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                <FloatingItem x={pos.python.x} y={pos.python.y} delay={0} duration={6}>
                    <PythonLogo className="w-full h-full drop-shadow-md" />
                </FloatingItem>
                <FloatingItem x={pos.sewer.x} y={pos.sewer.y} delay={2} duration={8} size="w-28 h-28" rotationRange={[-5, 5]}>
                    <SewerNetwork className="w-full h-full drop-shadow-md" />
                </FloatingItem>
                <FloatingItem x={pos.pipe.x} y={pos.pipe.y} delay={0.5} duration={7} size="w-28 h-28" rotationRange={[-15, 15]}>
                    <PipeSection className="w-full h-full drop-shadow-md" />
                </FloatingItem>
                <FloatingItem x={pos.dashboard.x} y={pos.dashboard.y} delay={1} duration={6.5} size="w-24 h-24" rotationRange={[-5, 5]}>
                    <AppDashboard className="w-full h-full drop-shadow-md" />
                </FloatingItem>
                <FloatingItem x={pos.map.x} y={pos.map.y} delay={1.5} duration={5} size="w-20 h-20">
                    <MapIcon className="w-full h-full text-emerald-500/80 drop-shadow-md" strokeWidth={1.5} />
                </FloatingItem>
                {pos.bubbles.map((b, i) => (
                    <Bubble key={`${b.x}-${b.y}-${i}`} x={b.x} y={b.y} size={b.size} delay={b.delay} duration={b.duration} />
                ))}
            </div>
        );
    }

    const config = VARIANTS[variant];
    if (!config) return null;
    return (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {config.items.map((it, i) => (
                <FloatingItem key={i} x={it.x} y={it.y} delay={it.delay} duration={it.duration} size={it.size} rotationRange={it.rotationRange}>
                    {it.render('w-full h-full drop-shadow-md')}
                </FloatingItem>
            ))}
            {config.bubbles.map((b, i) => (
                <Bubble key={`${b.x}-${b.y}-${i}`} x={b.x} y={b.y} size={b.size} delay={b.delay} duration={b.duration} />
            ))}
        </div>
    );
}
