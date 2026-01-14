import React from 'react';
import { motion } from 'framer-motion';

const positions = [
    { title: "GIS Technical Lead", category: "Leadership" },
    { title: "Optimization Lead", category: "Strategy" }, // Shortened for tile fit
    { title: "Data Science Lead", category: "Innovation" },
    { title: "AI Task Force", category: "Committee" },
];

const award = {
    title: "2024 Innovator of the Year",
    organization: "Wade Trim",
    description: "Awarded for outstanding contributions to innovation and technical excellence.",
    icon: (
        <svg className="w-full h-full text-amber-500/20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
    )
};

const presentations = [
    {
        title: "Building a More Accurate AI Chatbot for Engineering",
        conference: "OneWater 2025",
        role: "Co-presented",
        featured: true // Make this spans 2 cols
    },
    {
        title: "GIS‑Driven Hydraulic Model Expansion",
        conference: "3 Rivers Wet Weather 2025",
        role: "Co-authored",
    },
    {
        title: "Advancing SWMM Parameter Optimization",
        conference: "ICWWMM (Ongoing)",
        role: "Authored",
    },
    {
        title: "GIS Leadership & Innovation",
        conference: "PA GIS Conf 2024",
        role: "Presenter",
    },
    {
        title: "PWSA Model Expansion Case Study",
        conference: "IMGIS 2024",
        role: "Author",
    },
    {
        title: "Manifolded Force Main System Prioritization",
        conference: "Optimatics 2024",
        role: "Presenter",
    },
    {
        title: "Hydrodynamic Models for Restoration",
        conference: "EWRI Congress 2011",
        role: "Author",
    }
];

const BentoItem = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay }}
        className={`bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden relative group ${className}`}
    >
        {children}
    </motion.div>
);

export default function Achievements() {
    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">
                            Recognition & Insights
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg">
                            Highlighting industry leadership, technical contributions, and shared knowledge.
                        </p>
                    </div>
                    {/* Decorative Line */}
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 ml-10 hidden md:block mb-4"></div>
                </motion.div>

                {/* Benton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

                    {/* 1. Innovator Award (2x2) */}
                    <BentoItem className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 text-white !border-none relative flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-64 h-64 translate-x-16 -translate-y-16 opacity-20">
                            {award.icon}
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/30 text-white mb-4">
                                Career Highlight
                            </span>
                            <h3 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
                                {award.title}
                            </h3>
                            <p className="text-indigo-100 text-lg font-medium leading-relaxed max-w-sm">
                                {award.description}
                            </p>
                        </div>
                        <div className="relative z-10 mt-auto pt-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <span className="font-bold tracking-wide">{award.organization}</span>
                        </div>
                    </BentoItem>

                    {/* 2. Key Positions (Individual Tiles) */}
                    {positions.map((pos, i) => (
                        <BentoItem key={i} delay={0.1 + (i * 0.05)} className="flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1">
                                    {pos.title}
                                </h4>
                                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{pos.category}</span>
                            </div>
                        </BentoItem>
                    ))}

                    {/* 3. Section Divider / Label for Papers */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-4 mt-8 mb-2 flex items-center gap-4 opacity-60">
                        <span className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></span>
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Publications & Speaking</span>
                        <span className="h-px bg-slate-300 dark:bg-slate-600 flex-1"></span>
                    </div>

                    {/* 4. Papers & Presentations */}
                    {presentations.map((paper, i) => (
                        <BentoItem
                            key={i + "paper"}
                            delay={0.3 + (i * 0.05)}
                            className={`${paper.featured ? 'md:col-span-2' : ''} hover:border-blue-300 dark:hover:border-blue-700`}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${paper.featured ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                            {paper.role}
                                        </span>
                                    </div>
                                    <h4 className={`${paper.featured ? 'text-xl' : 'text-base'} font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2`}>
                                        {paper.title}
                                    </h4>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="truncate">{paper.conference}</span>
                                </div>
                            </div>
                        </BentoItem>
                    ))}

                </div>
            </div>
        </section>
    );
}
