import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import portrait from '../assets/portrait.png';
import StatsCounter from './StatsCounter';
import LicenseBadge from './LicenseBadge';
import waterNetworkIcon from '../assets/icons/hero/water-network.png';
import webUiIcon from '../assets/icons/hero/web-ui.png';
import codingLaptopIcon from '../assets/icons/hero/coding-laptop.png';
import aiChipIcon from '../assets/icons/hero/ai-chip.png';
import gisMapIcon from '../assets/icons/hero/gis-map.png';

function FloatingElement({ children, delay = 0, className = "" }) {
    return (
        <motion.div
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: delay,
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export default function Hero() {
    const targetRef = useRef(null);
    const [isStarfield, setIsStarfield] = useState(false);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0.2, 0.7], [1, 0]);
    useEffect(() => {
        const stored = localStorage.getItem('spaceNerdMode') === 'stars';
        setIsStarfield(stored);
        document.documentElement.dataset.spaceNerd = stored ? 'stars' : 'water';

        const handleToggle = (event) => {
            setIsStarfield(event.detail?.enabled ?? false);
        };
        window.addEventListener('space-nerd-toggle', handleToggle);
        return () => window.removeEventListener('space-nerd-toggle', handleToggle);
    }, []);

    const handleSpaceNerdClick = (event) => {
        if (event.detail !== 3) {
            return;
        }
        const nextState = !isStarfield;
        setIsStarfield(nextState);
        localStorage.setItem('spaceNerdMode', nextState ? 'stars' : 'water');
        document.documentElement.dataset.spaceNerd = nextState ? 'stars' : 'water';
        window.dispatchEvent(
            new CustomEvent('space-nerd-toggle', { detail: { enabled: nextState } })
        );
    };
    const scrollToSection = (id, event) => {
        if (event) {
            event.preventDefault();
        }
        const element = document.getElementById(id);
        if (element) {
            // Using scrollIntoView with block: 'start' ensures it snaps to the top
            // The sections themselves have padding/scroll-margin to handle spacing
            console.log(`Scrolling to #${id}`);
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.warn(`Section #${id} not found in DOM`);
            // Fallback: multiple checks or querySelector
            const fallback = document.querySelector(`#${id}`);
            if (fallback) fallback.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const sectionLinks = [
        { label: "Skills", id: "skills", accent: "from-indigo-500/90 to-sky-400/90" },
        { label: "Timeline", id: "timeline", accent: "from-sky-500/90 to-cyan-400/90" },
        { label: "Achievements", id: "achievements", accent: "from-purple-500/90 to-indigo-400/90" },
        { label: "Projects", id: "projects", accent: "from-emerald-500/90 to-lime-400/90" }
    ];

    return (
        <section ref={targetRef} className="relative min-h-screen flex flex-col xl:flex-row items-center justify-center p-6 sm:p-12 overflow-hidden z-10 font-sans">


            {/* Text Content - Left/Top */}
            <motion.div
                style={{ y: yText, opacity }}
                className="flex-1 flex flex-col items-center xl:items-start z-20 text-center xl:text-left pt-52 xl:pt-40"
            >


                <h1 className="text-6xl sm:text-7xl md:text-8xl xl:text-9xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tighter leading-[0.9]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        ROSS
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 dark:from-indigo-400 dark:to-sky-300"
                    >
                        VOLKWEIN
                    </motion.div>
                </h1>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="flex flex-wrap justify-center xl:justify-start gap-4 mb-8"
                >
                    <LicenseBadge
                        label="PE"
                        number="PE087020"
                        since="2017"
                        location="PA"
                        bgColor="bg-indigo-600 shadow-indigo-600/30"
                    />
                    <LicenseBadge
                        label="GISP"
                        number="161338"
                        since="2022"
                        bgColor="bg-sky-500 shadow-sky-500/30"
                    />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="font-mono text-sm md:text-lg text-slate-700 dark:text-slate-300 max-w-lg leading-relaxed relative"
                >
                    <span className="absolute -left-4 top-0 text-slate-300 dark:text-slate-700 text-4xl -z-10 animate-pulse"></span>
                    Delivering technical solutions driven by emerging technologies. <br />
                    Expertise in <span className="font-bold text-slate-900 dark:text-white">H&H Modeling</span>, <span className="font-bold text-slate-900 dark:text-white">GIS</span>, and <span className="font-bold text-slate-900 dark:text-white">Python</span>. <br />
                    <span className="text-xs md:text-sm opacity-75 mt-2 block">
                        Technologist • Geospatial &{' '}
                        <button
                            type="button"
                            onClick={handleSpaceNerdClick}
                            className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-sky-300 transition-colors"
                            aria-label="Triple click to toggle space nerd mode"
                        >
                            Space Nerd
                        </button>{' '}
                        • Pittsburgh
                    </span>
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.95 }}
                    className="mt-6 flex flex-wrap justify-center xl:justify-start gap-3"
                >
                    {sectionLinks.map((section) => (
                        <motion.button
                            key={section.id}
                            onClick={(e) => scrollToSection(section.id, e)}
                            whileHover={{ y: -3, scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className={`group relative inline-flex items-center gap-2 rounded-full border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-slate-800 dark:text-slate-100 shadow-lg shadow-indigo-500/10 backdrop-blur transition-all duration-300 cursor-pointer`}
                        >
                            <span
                                className={`absolute inset-0 rounded-full bg-gradient-to-r ${section.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-active:opacity-90`}
                                aria-hidden="true"
                            ></span>
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-slate-900 dark:bg-white transition-transform duration-300 group-hover:scale-110"></span>
                                {section.label}
                            </span>
                            <span className="relative z-10 text-slate-500 dark:text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5">
                                ↗
                            </span>
                        </motion.button>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.0 }}
                    className="mt-8"
                >
                    <StatsCounter />
                </motion.div>
            </motion.div>

            {/* Image Content - Right/Bottom */}
            <motion.div
                style={{ y: yImage, opacity }}
                className="flex-1 w-full max-w-[500px] xl:max-w-none relative mt-16 xl:mt-20 flex justify-center xl:justify-end"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative z-10 w-[80%] md:w-[90%] xl:w-[80%]"
                >
                    {/* Decorative Elements around image */}
                    <div className="absolute -top-6 -right-6 w-full h-full border-2 border-slate-900 dark:border-slate-500 rounded-2xl z-0 hidden xl:block opacity-50"></div>
                    <div className="absolute -bottom-6 -left-6 w-full h-full bg-slate-200 dark:bg-slate-900 rounded-2xl z-0 hidden xl:block opacity-50"></div>

                    <div
                        className="relative overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/20 group"
                        data-badge-target="portrait"
                    >
                        <img
                            src={portrait.src}
                            alt="Ross Volkwein"
                            className="w-full h-auto object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-in-out transform hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
                    </div>

                    {!isStarfield && (
                        <>
                            {/* Floating Bubbles */}
                            <FloatingElement delay={0} className="absolute -left-12 top-1/4 hidden xl:block">
                                <img src={aiChipIcon.src} alt="AI" className="w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-2xl" />
                            </FloatingElement>

                            <FloatingElement delay={1} className="absolute -right-8 top-10 hidden xl:block">
                                <img src={gisMapIcon.src} alt="GIS" className="w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-2xl" />
                            </FloatingElement>

                            <FloatingElement delay={2} className="absolute -bottom-4 right-1/4 hidden xl:block">
                                <img src={codingLaptopIcon.src} alt="Coding" className="w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-2xl" />
                            </FloatingElement>

                            <FloatingElement delay={1.5} className="absolute -right-12 bottom-1/3 hidden xl:block">
                                <img src={webUiIcon.src} alt="Web UI" className="w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-2xl" />
                            </FloatingElement>

                            <FloatingElement delay={0.5} className="absolute left-0 -top-8 hidden xl:block">
                                <img src={waterNetworkIcon.src} alt="H&H" className="w-16 h-16 xl:w-20 xl:h-20 object-contain drop-shadow-2xl" />
                            </FloatingElement>
                        </>
                    )}

                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
            >
                <div
                    className="animate-bounce cursor-pointer"
                    onClick={() => scrollToSection('timeline')}
                >
                    <div className="font-mono text-[10px] tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase flex flex-col items-center gap-2">
                        Explore
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
