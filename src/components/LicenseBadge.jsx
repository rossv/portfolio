import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// One shared easing curve for the whole unfold — the same cubic-bezier the
// badge chips elsewhere on the site use. Deliberately a tween, not a spring:
// the box eases to its final width and stops, with no overshoot. The previous
// spring (stiffness 300 / damping 30) was underdamped, so the width sprang
// past its target and settled back — which read as the box "jumping a little
// bigger" at the end of the expansion, especially on touch.
const UNFOLD = { duration: 0.42, ease: [0.22, 0.61, 0.36, 1] };

export default function LicenseBadge({ label, number, since, location, bgColor }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        // onHoverStart/End are pointer-aware and ignore touch, so tapping on
        // mobile toggles via onClick alone (no double-fire). No `layout` here:
        // the pill's width follows its animating content frame-by-frame, so a
        // second, transform-based layout animation would only fight the width
        // tween and cause the end-of-expansion snap.
        <motion.div
            role="button"
            tabIndex={0}
            aria-expanded={isHovered}
            aria-label={`${label} license — ${isHovered ? 'hide' : 'show'} details`}
            className={`relative h-11 cursor-pointer rounded bg-transparent ${isHovered ? 'z-50' : 'z-10'}`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => setIsHovered((v) => !v)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsHovered((v) => !v);
                }
            }}
            initial={false}
        >
            <div
                className={`space-accent-pill relative flex h-full items-center overflow-hidden rounded ${bgColor} text-white shadow-lg`}
            >
                <div className="px-4 py-1.5 flex flex-col items-center justify-center relative z-10">
                    <span className="font-mono font-bold text-sm md:text-base">
                        {label}
                    </span>
                </div>

                <AnimatePresence initial={false}>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, width: 0, paddingRight: 0 }}
                            animate={{
                                opacity: 1,
                                width: 'auto',
                                paddingRight: 16,
                                transition: {
                                    ...UNFOLD,
                                    opacity: { duration: 0.25, delay: 0.08 },
                                },
                            }}
                            exit={{
                                opacity: 0,
                                width: 0,
                                paddingRight: 0,
                                transition: { ...UNFOLD, opacity: { duration: 0.15 } },
                            }}
                            className="relative z-10 flex flex-col justify-center overflow-hidden whitespace-nowrap -ml-2"
                        >
                            <span className="font-mono font-bold text-sm">{number}</span>
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider opacity-90 font-mono">
                                <span>Est. {since}</span>
                                {location && (
                                    <>
                                        <span>•</span>
                                        <span>{location}</span>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* A soft highlight that chases around the outline once the chip
                    is fully open. Faded in after the unfold finishes (delay ≈
                    the unfold duration) so it lands as a finishing flourish
                    instead of competing with the expansion. The travelling comet
                    itself is a masked conic-gradient ring — see .badge-glow in
                    global.css. */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.span
                            aria-hidden="true"
                            className="badge-glow"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, transition: { duration: 0.35, delay: 0.42 } }}
                            exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        />
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
