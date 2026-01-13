import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import portrait from '../assets/portrait.png';
import StatsCounter from './StatsCounter';

export default function Hero() {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yImage = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

    return (
        <section ref={targetRef} className="relative min-h-screen flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 overflow-hidden z-10 font-sans">

            {/* Text Content - Left/Top */}
            <motion.div
                style={{ y: yText, opacity }}
                className="flex-1 flex flex-col items-center md:items-start z-20 text-center md:text-left pt-52 md:pt-40"
            >


                <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tighter leading-[0.9]">
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
                    className="flex flex-wrap justify-center md:justify-start gap-4 mb-8"
                >
                    <span className="font-mono bg-indigo-600 text-white px-4 py-1.5 text-sm md:text-base font-bold shadow-lg shadow-indigo-600/30 transform hover:-translate-y-1 transition-transform">PE</span>
                    <span className="font-mono bg-sky-500 text-white px-4 py-1.5 text-sm md:text-base font-bold shadow-lg shadow-sky-500/30 transform hover:-translate-y-1 transition-transform">GISP</span>
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
                    <span className="text-xs md:text-sm opacity-75 mt-2 block">Technologist • Space Nerd • Pittsburgh</span>
                </motion.p>

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
                className="flex-1 w-full max-w-[500px] md:max-w-none relative mt-16 md:mt-20 flex justify-center md:justify-end"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="relative z-10 w-[80%] md:w-[90%] lg:w-[80%]"
                >
                    {/* Decorative Elements around image */}
                    <div className="absolute -top-6 -right-6 w-full h-full border-2 border-slate-900 dark:border-slate-500 rounded-2xl z-0 hidden md:block opacity-50"></div>
                    <div className="absolute -bottom-6 -left-6 w-full h-full bg-slate-200 dark:bg-slate-900 rounded-2xl z-0 hidden md:block opacity-50"></div>

                    <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-indigo-500/20 group">
                        <img
                            src={portrait.src}
                            alt="Ross Volkwein"
                            className="w-full h-auto object-cover filter grayscale hover:grayscale-0 transition-all duration-700 ease-in-out transform hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 mix-blend-overlay"></div>
                    </div>
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
                    onClick={() => document.querySelector('#timeline')?.scrollIntoView({ behavior: 'smooth' })}
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
