import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LicenseBadge({ label, number, since, location, bgColor }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        // onHoverStart/End are pointer-aware and ignore touch, so tapping on
        // mobile toggles via onClick alone (no double-fire).
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

                {/* The detail stays mounted and reveals by animating a grid
                    track from 0fr to 1fr (see .license-reveal in global.css).
                    This grows to the content's exact width with no measured
                    pixel value and no auto handoff, so the box eases to a stop
                    cleanly — the width:auto tween it replaced snapped to a
                    slightly different final width on the last frame, which is
                    what still read as a jump at the end of the expansion. */}
                <div className={`license-reveal relative z-10 -ml-2 ${isHovered ? 'is-open' : ''}`}>
                    <div className="license-reveal__inner flex flex-col justify-center whitespace-nowrap">
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
                    </div>
                </div>

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
