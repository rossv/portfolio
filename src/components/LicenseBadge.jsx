import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LicenseBadge({ label, number, since, location, bgColor }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            className={`relative cursor-pointer overflow-hidden rounded bg-transparent ${isHovered ? 'z-50' : 'z-10'}`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={() => setIsHovered(!isHovered)}
            initial={false}
        >
            <motion.div
                layout
                className={`flex items-center ${bgColor} text-white shadow-lg`}
                style={{ borderRadius: '0.25rem' }} // standard rounded
            >
                <motion.div
                    layout
                    className="px-4 py-1.5 flex flex-col items-center justify-center relative z-10"
                >
                    <motion.span layout className="font-mono font-bold text-sm md:text-base">
                        {label}
                    </motion.span>
                </motion.div>

                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, width: 0, paddingRight: 0 }}
                            animate={{
                                opacity: 1,
                                width: 'auto',
                                paddingRight: 16,
                                transition: {
                                    opacity: { duration: 0.2, delay: 0.1 },
                                    width: { type: "spring", stiffness: 300, damping: 30 }
                                }
                            }}
                            exit={{
                                opacity: 0,
                                width: 0,
                                paddingRight: 0,
                                transition: { duration: 0.2 }
                            }}
                            className="flex flex-col justify-center overflow-hidden whitespace-nowrap -ml-2"
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
            </motion.div>
        </motion.div>
    );
}
