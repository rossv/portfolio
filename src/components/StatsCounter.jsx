import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

function Counter({ value, suffix = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString() + suffix
    );

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, value, spring]);

    return <motion.span ref={ref}>{display}</motion.span>;
}

export default function StatsCounter({ className = "" }) {
    const yearsOfExperience = new Date().getFullYear() - 2012;

    return (
        <div className={`flex flex-col sm:flex-row gap-8 sm:gap-12 items-center justify-center ${className}`}>
            {/* Stat 1 */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center sm:items-start text-center sm:text-left"
            >
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1 font-sans">
                    <Counter value={yearsOfExperience} suffix="+" />
                </div>
                <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">Years Exp.</div>
            </motion.div>

            <div className="hidden sm:block h-12 w-px bg-slate-300 dark:bg-slate-700"></div>

            {/* Stat 2 */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col items-center sm:items-start text-center sm:text-left"
            >
                <div className="text-4xl md:text-5xl font-extrabold text-sky-500 mb-1 font-sans">
                    <Counter value={100} suffix="+" />
                </div>
                <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">Projects Delivered</div>
            </motion.div>

            <div className="hidden sm:block h-12 w-px bg-slate-300 dark:bg-slate-700"></div>

            {/* Stat 3 */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center sm:items-start text-center sm:text-left"
            >
                <div className="text-4xl md:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-1 font-sans">
                    <Counter value={20} suffix="+" />
                </div>
                <div className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">Tools Architected</div>
            </motion.div>
        </div>
    );
}
