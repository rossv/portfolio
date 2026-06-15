import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Cursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const reduceMotion = useReducedMotion();

    // Only enable the custom cursor for genuine mouse users (fine pointer +
    // hover capability). 'ontouchstart'/maxTouchPoints misfires on hybrid
    // touchscreen laptops driven by a mouse; matchMedia is the reliable test
    // and matches the convention used elsewhere in the app.
    const [enabled, setEnabled] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia('(hover: hover) and (pointer: fine)');
        const apply = () => setEnabled(mql.matches);
        apply();
        mql.addEventListener('change', apply);
        return () => mql.removeEventListener('change', apply);
    }, []);

    useEffect(() => {
        if (!enabled) return;

        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button') || e.target.closest('.cursor-pointer')) {
                setIsHovering(true);
            } else {
                setIsHovering(false);
            }
        };

        window.addEventListener('mousemove', updateMousePosition);
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
            window.removeEventListener('mouseover', handleMouseOver);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50 flex items-center justify-center mix-blend-difference"
            animate={{
                x: mousePosition.x - 16,
                y: mousePosition.y - 16,
                scale: isHovering ? 2.5 : 1,
            }}
            transition={reduceMotion
                ? { duration: 0 }
                : {
                    type: "spring",
                    stiffness: 150,
                    damping: 15,
                    mass: 0.1
                }}
        >
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <motion.div
                className="absolute inset-0 border border-white rounded-full"
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    opacity: isHovering ? 0 : 0.5
                }}
            />
        </motion.div>
    );
}
