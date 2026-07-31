import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
    Map as MapIcon,
    Terminal, GitBranch, Database, Cog, Layers,
    Users, Presentation, Lightbulb, GraduationCap, Compass,
    Trophy, FileText, Mic, Newspaper, BadgeCheck,
} from 'lucide-react';
import { readMode, MODE_EVENT } from '../utils/siteMode';

// Floating motes for the section backgrounds.
//
// Two independent axes, which is what keeps this from becoming sixteen
// hand-authored sets:
//
//   * The section picks the icons. Skills gets the domain glyphs, toolkit gets
//     tools, leadership and recognition get their own — unchanged from before.
//   * The mode picks the carrier. Water keeps the frosted bubble, geospatial
//     gets a map pin, technologist a chip package, space a mix of star, ringed
//     world and asterism.
//
// The frosted circle used to do two jobs at once: hold the icon and signal
// "water". Splitting them is the whole point of the carrier — the frame says
// which mode you are in, the icon says what it is about, and every carrier
// draws its own frame in SVG so the frame and the glyph scale together.
//
// Only water drifts. The other three sit still: a pin or a seated chip is an
// object placed somewhere, and drifting made them read as ambience instead.

/* ---------- domain glyphs (skills section) ------------------------------- */

const PythonLogo = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.31.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.83l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.23l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05L0 11.97l.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.24l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05 1.07.13zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22z"
            fill="#306998" transform="translate(3.2,2.4) scale(0.78)" />
        {/* The mark is 180-degree rotationally symmetric, so the same half
            rotated gives the yellow snake. Two solid fills rather than one
            gradient across both: a single sweep turns each snake olive. */}
        <path d="M14.31.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.83l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.23l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05L0 11.97l.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.24l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05 1.07.13zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09-.33.22z"
            fill="#e3a81a" transform="translate(3.2,2.4) scale(0.78) rotate(180 12 12)" />
    </svg>
);

const PipeSection = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-slate-500/80 dark:text-slate-300/80" />
        <path d="M2.5 14C4.5 13 7.5 15 9.5 14C11.5 13 13.5 13 15.5 14C17.5 15 20.5 13 21.5 14L20.2 18.5C18.5 20.5 15.5 21.8 12 21.8C8.5 21.8 5.5 20.5 3.8 18.5L2.5 14Z" fill="currentColor" className="text-cyan-400/60 dark:text-cyan-500/60" />
    </svg>
);

const SewerNetwork = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 20 L12 12 L20 4" stroke="currentColor" strokeWidth="2.5" className="text-slate-500/80 dark:text-slate-400/80" strokeLinecap="round" />
        <path d="M8 16 L5 13" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" strokeLinecap="round" />
        <path d="M16 8 L19 11" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" strokeLinecap="round" />
        <path d="M12 12 L15 15" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" strokeLinecap="round" />
        <circle cx="4" cy="20" r="2" fill="currentColor" className="text-emerald-500/90" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" className="text-emerald-500/90" />
        <circle cx="20" cy="4" r="2" fill="currentColor" className="text-emerald-500/90" />
        <circle cx="5" cy="13" r="1.5" fill="currentColor" className="text-emerald-400/80" />
        <circle cx="19" cy="11" r="1.5" fill="currentColor" className="text-emerald-400/80" />
        <circle cx="15" cy="15" r="1.5" fill="currentColor" className="text-emerald-400/80" />
    </svg>
);

const AppDashboard = ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="3" width="20" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/80 dark:text-slate-500/80" />
        <path d="M8 3 V21" stroke="currentColor" strokeWidth="1.5" className="text-slate-400/60 dark:text-slate-600/60" />
        <rect x="10" y="5" width="10" height="3" rx="1" fill="currentColor" className="text-indigo-400/40" />
        <path d="M10 16 L12 14 L14 17 L17 12 L19 13" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400/80" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="10" y="10" width="2" height="4" rx="0.5" fill="currentColor" className="text-indigo-500/60" />
        <rect x="13" y="11" width="2" height="3" rx="0.5" fill="currentColor" className="text-indigo-500/60" />
        <rect x="16" y="9" width="2" height="5" rx="0.5" fill="currentColor" className="text-indigo-500/60" />
    </svg>
);

/* ---------- carrier frames ---------------------------------------------- */

const PinFrame = () => (
    <svg viewBox="0 0 44 60" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 58C22 58 41 33 41 20A19 19 0 0 0 3 20C3 33 22 58 22 58Z" className="fill-red-600 dark:fill-red-500" />
        {/* A darker limb down one side, so the head reads as round. */}
        <path d="M22 58C22 58 41 33 41 20a19 19 0 0 0-6.6-14.4C37 8.6 38.6 13 38.6 18 38.6 30 22 58 22 58Z" className="fill-red-900/50" />
        <circle cx="22" cy="20" r="13.4" className="fill-white dark:fill-red-50" />
    </svg>
);

// Leg positions along each edge of the package.
const CHIP_LEGS = [15, 22.4, 29.8, 37.2];

const ChipFrame = () => (
    <svg viewBox="0 0 52 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <g className="stroke-amber-600 dark:stroke-amber-300" strokeWidth="2.2">
            {CHIP_LEGS.map((p) => (
                <React.Fragment key={p}>
                    <line x1={p} y1="11" x2={p} y2="3.5" />
                    <line x1={p} y1="41" x2={p} y2="48.5" />
                    <line x1="11" y1={p} x2="3.5" y2={p} />
                    <line x1="41" y1={p} x2="48.5" y2={p} />
                </React.Fragment>
            ))}
        </g>
        {/* Chamfered corner, the way a package marks pin one. */}
        <path d="M11 11h24l6 6v24H11Z" className="fill-slate-900 stroke-sky-400" strokeWidth="1.6" />
        <rect x="15.5" y="15.5" width="21" height="21" rx="1.5" className="fill-sky-400/20 stroke-sky-400/90" strokeWidth="1" />
        <circle cx="13.6" cy="13.6" r="1.3" className="fill-amber-600 dark:fill-amber-300" />
    </svg>
);

const StarFrame = () => (
    <svg viewBox="0 0 60 60" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M30 1C32.6 22 37 26.4 59 30 37 33.6 32.6 38 30 59 27.4 38 23 33.6 1 30 23 26.4 27.4 22 30 1Z"
            className="fill-violet-700/80 dark:fill-violet-200/85" />
        {/* A pad under the icon: dropped straight onto the starfield it is lost. */}
        <circle cx="30" cy="30" r="13" strokeWidth="1"
            className="fill-white/90 stroke-violet-700/40 dark:fill-slate-950/75 dark:stroke-violet-200/55" />
    </svg>
);

const PlanetFrame = () => (
    <svg viewBox="0 0 64 52" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="32" cy="27" rx="29" ry="8.4" transform="rotate(-14 32 27)" fill="none" strokeWidth="2"
            className="stroke-violet-700/50 dark:stroke-violet-400/50" />
        <circle cx="32" cy="26" r="15.4" strokeWidth="1.3"
            className="fill-sky-200 stroke-sky-700 dark:fill-slate-700 dark:stroke-sky-300" />
        {/* The near arc of the ring, drawn over the body so it passes in front. */}
        <ellipse cx="32" cy="27" rx="29" ry="8.4" transform="rotate(-14 32 27)" fill="none" strokeWidth="2"
            strokeDasharray="34 120" strokeDashoffset="17"
            className="stroke-violet-700 dark:stroke-violet-400" />
    </svg>
);

const ClusterFrame = () => (
    <svg viewBox="0 0 62 56" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 22 8 42M22 22 41 9M22 22 44 34M44 34 54 50" fill="none" strokeWidth="1.1"
            className="stroke-violet-700/45 dark:stroke-violet-400/60" />
        <g className="fill-violet-900 dark:fill-indigo-100">
            <circle cx="8" cy="42" r="2" />
            <circle cx="41" cy="9" r="2.6" />
            <circle cx="44" cy="34" r="1.9" />
            <circle cx="54" cy="50" r="1.5" />
        </g>
        <circle cx="22" cy="22" r="12.4" strokeWidth="1"
            className="fill-white/90 stroke-violet-700/45 dark:fill-slate-950/75 dark:stroke-violet-400/60" />
    </svg>
);

/* ---------- carriers ----------------------------------------------------- */

// `scale` is applied to the section's base size, so a pin does not come out as
// wide as the bubble it replaces. `icon` is where the glyph sits inside the
// frame, as percentages of the carrier box.
const FROSTED = 'rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl';

const WATER_CARRIER = {
    aspect: 1, scale: 1, drift: true, shell: FROSTED, Frame: null,
    icon: { left: '22%', top: '22%', width: '56%', height: '56%' },
};

const CARRIERS = {
    water: WATER_CARRIER,
    geo: {
        aspect: 44 / 60, scale: 0.65, drift: false, shell: 'drop-shadow-lg', Frame: PinFrame,
        icon: { left: '29.5%', top: '18.3%', width: '41%', height: '30%' },
        tint: 'text-red-900',
    },
    tech: {
        aspect: 1, scale: 0.83, drift: false, shell: 'drop-shadow-lg', Frame: ChipFrame,
        icon: { left: '33.7%', top: '33.7%', width: '32.7%', height: '32.7%' },
        tint: 'text-sky-400',
    },
};

// Space cycles the three families, so no two motes in view are the same object.
const STAR_CARRIERS = [
    {
        aspect: 1, scale: 0.9, drift: false, Frame: StarFrame,
        shell: 'drop-shadow-[0_0_10px_rgba(167,139,250,0.45)]',
        icon: { left: '35.8%', top: '35.8%', width: '28.3%', height: '28.3%' },
        tint: 'text-violet-900 dark:text-violet-100',
    },
    {
        aspect: 64 / 52, scale: 0.875, drift: false, Frame: PlanetFrame, shell: 'drop-shadow-lg',
        icon: { left: '36.7%', top: '33.7%', width: '26.6%', height: '32.7%' },
        tint: 'text-sky-900 dark:text-sky-100',
    },
    {
        aspect: 62 / 56, scale: 0.83, drift: false, Frame: ClusterFrame, shell: 'drop-shadow-lg',
        icon: { left: '22.6%', top: '25%', width: '25.8%', height: '28.6%' },
        tint: 'text-violet-900 dark:text-violet-100',
    },
];

const carrierFor = (mode, i) =>
    mode === 'stars' ? STAR_CARRIERS[i % STAR_CARRIERS.length] : (CARRIERS[mode] ?? WATER_CARRIER);

/* ---------- section sets ------------------------------------------------- */

// `tint` applies in water mode only; every other carrier colours its own icon.
// The domain glyphs carry their own fills and ignore both.
const SETS = {
    skills: [
        { C: PythonLogo, size: 96, x: '4%', y: '15%', delay: 0, dur: 6, sway: 10 },
        { C: SewerNetwork, size: 112, x: '85%', y: '12%', delay: 2, dur: 8, sway: 5 },
        { C: PipeSection, size: 112, x: '12%', y: '22%', delay: 0.5, dur: 7, sway: 15 },
        { C: AppDashboard, size: 96, x: '80%', y: '22%', delay: 1, dur: 6.5, sway: 5 },
        { C: MapIcon, tint: 'text-emerald-500/80', size: 80, x: '90%', y: '18%', delay: 1.5, dur: 5, sway: 10 },
    ],
    toolkit: [
        { C: Terminal, tint: 'text-indigo-500/80', size: 80, x: '4%', y: '20%', delay: 0, dur: 6, sway: 10 },
        { C: GitBranch, tint: 'text-cyan-500/80', size: 80, x: '89%', y: '15%', delay: 1, dur: 7, sway: 10 },
        { C: Database, tint: 'text-emerald-500/80', size: 80, x: '8%', y: '68%', delay: 0.5, dur: 6.5, sway: 10 },
        { C: Cog, tint: 'text-slate-500/80', size: 64, x: '90%', y: '62%', delay: 1.5, dur: 5.5, sway: 10 },
        { C: Layers, tint: 'text-indigo-500/80', size: 64, x: '84%', y: '82%', delay: 2, dur: 6, sway: 10 },
    ],
    leadership: [
        { C: Users, tint: 'text-cyan-500/80', size: 80, x: '4%', y: '20%', delay: 0, dur: 6, sway: 10 },
        { C: Presentation, tint: 'text-indigo-500/80', size: 80, x: '89%', y: '15%', delay: 1, dur: 7, sway: 10 },
        { C: Lightbulb, tint: 'text-amber-500/80', size: 64, x: '7%', y: '68%', delay: 0.5, dur: 6.5, sway: 10 },
        { C: GraduationCap, tint: 'text-emerald-500/80', size: 80, x: '90%', y: '64%', delay: 1.5, dur: 5.5, sway: 10 },
        { C: Compass, tint: 'text-slate-500/80', size: 64, x: '85%', y: '84%', delay: 2, dur: 6, sway: 10 },
    ],
    recognition: [
        { C: Trophy, tint: 'text-amber-500/80', size: 80, x: '4%', y: '20%', delay: 0, dur: 6, sway: 10 },
        { C: FileText, tint: 'text-indigo-500/80', size: 80, x: '89%', y: '15%', delay: 1, dur: 7, sway: 10 },
        { C: Mic, tint: 'text-cyan-500/80', size: 64, x: '8%', y: '68%', delay: 0.5, dur: 6.5, sway: 10 },
        { C: Newspaper, tint: 'text-slate-500/80', size: 80, x: '90%', y: '62%', delay: 1.5, dur: 5.5, sway: 10 },
        { C: BadgeCheck, tint: 'text-emerald-500/80', size: 64, x: '85%', y: '84%', delay: 2, dur: 6, sway: 10 },
    ],
};

const SPECKS = {
    skills: [
        { x: '40%', y: '10%', size: 20, delay: 0, dur: 4 },
        { x: '60%', y: '80%', size: 30, delay: 2, dur: 5 },
        { x: '90%', y: '50%', size: 15, delay: 1, dur: 3 },
        { x: '20%', y: '40%', size: 25, delay: 3, dur: 6 },
        { x: '50%', y: '90%', size: 18, delay: 1.5, dur: 4.5 },
    ],
    toolkit: [
        { x: '3%', y: '45%', size: 18, delay: 0, dur: 4 },
        { x: '93%', y: '38%', size: 22, delay: 2, dur: 5 },
        { x: '6%', y: '90%', size: 14, delay: 1, dur: 3.5 },
    ],
    leadership: [
        { x: '3%', y: '45%', size: 20, delay: 0, dur: 4.5 },
        { x: '94%', y: '40%', size: 16, delay: 1.5, dur: 4 },
        { x: '5%', y: '90%', size: 14, delay: 1, dur: 3.5 },
    ],
    recognition: [
        { x: '3%', y: '45%', size: 18, delay: 0, dur: 4 },
        { x: '93%', y: '40%', size: 22, delay: 2, dur: 5 },
        { x: '6%', y: '90%', size: 14, delay: 1, dur: 3.5 },
    ],
};

// The specks follow the mode too, so a blue bubble is not drifting past a
// contour map.
const SPECK_TINT = {
    water: 'bg-blue-300/10 border-white/10',
    geo: 'bg-amber-700/10 border-amber-600/20',
    tech: 'bg-sky-400/10 border-sky-300/20',
    stars: 'bg-violet-300/10 border-violet-200/20',
};

/* ---------- pieces ------------------------------------------------------- */

function Mote({ item, carrier, mode }) {
    const prefersReducedMotion = useReducedMotion();
    const w = Math.round(item.size * carrier.scale);
    const h = Math.round(w / carrier.aspect);
    const drift = carrier.drift && !prefersReducedMotion;
    const tint = mode === 'water' ? (item.tint ?? '') : carrier.tint;

    return (
        <motion.div
            className={`absolute z-0 pointer-events-none ${carrier.shell ?? ''}`}
            style={{ width: w, height: h }}
            initial={{ left: item.x, top: item.y, opacity: 0 }}
            animate={drift
                ? { y: [0, -20, 0], rotate: [0, -item.sway, item.sway, 0], opacity: 0.8 }
                : { opacity: 0.8 }
            }
            transition={drift
                ? {
                    y: { duration: item.dur, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
                    rotate: { duration: item.dur * 1.5, repeat: Infinity, ease: 'easeInOut', delay: item.delay },
                    opacity: { duration: 1 },
                }
                : { opacity: { duration: 1, delay: item.delay * 0.25 } }
            }
        >
            {carrier.Frame ? <carrier.Frame /> : null}
            <span className="absolute" style={carrier.icon}>
                <item.C className={`w-full h-full ${tint}`} strokeWidth={1.5} />
            </span>
        </motion.div>
    );
}

function Speck({ spec, tint }) {
    const prefersReducedMotion = useReducedMotion();
    return (
        <motion.div
            className={`absolute z-0 pointer-events-none rounded-full backdrop-blur-[1px] border shadow-sm ${tint}`}
            style={{ width: spec.size, height: spec.size }}
            initial={{ left: spec.x, top: spec.y, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 0.3 } : { y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={prefersReducedMotion
                ? { opacity: { duration: 1 } }
                : { duration: spec.dur, repeat: Infinity, ease: 'easeInOut', delay: spec.delay }
            }
        />
    );
}

// The motes are a desktop, pointer-only flourish (matches the hero's
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

// Follows the mode live, so triple-clicking the portrait swaps the carriers
// without a reload — the same contract FluidBackground uses.
function useSiteMode() {
    const [mode, setMode] = useState('water');
    useEffect(() => {
        setMode(readMode());
        const handle = (event) => setMode(event.detail?.mode ?? 'water');
        window.addEventListener(MODE_EVENT, handle);
        return () => window.removeEventListener(MODE_EVENT, handle);
    }, []);
    return mode;
}

export default function FloatingIcons({ variant = 'skills' }) {
    const canShow = useDesktopHover();
    const mode = useSiteMode();

    const items = SETS[variant];
    if (!canShow || !items) return null;

    return (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none select-none">
            {items.map((item, i) => (
                <Mote key={`${variant}-${i}`} item={item} carrier={carrierFor(mode, i)} mode={mode} />
            ))}
            {(SPECKS[variant] ?? []).map((spec, i) => (
                <Speck key={`${spec.x}-${spec.y}-${i}`} spec={spec} tint={SPECK_TINT[mode] ?? SPECK_TINT.water} />
            ))}
        </div>
    );
}
