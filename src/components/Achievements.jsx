import React from 'react';
import { motion } from 'framer-motion';
import innovatorAwardImg from '../assets/recognition/innovator-award.webp';
import leadershipAcademyImg from '../assets/recognition/recognition-leadership-academy.webp';
import optimizationDataScienceImg from '../assets/recognition/recognition-optimization-data-science.webp';
import sewersFutureImg from '../assets/recognition/recognition-sewers-future.webp';
import aiTaskForceImg from '../assets/recognition/recognition-ai-task-force.webp';
import gisTechnicalLeadImg from '../assets/recognition/recognition-gis-technical-lead.webp';
import daleCarnegieImg from '../assets/recognition/recognition-dale-carnegie.webp';
import asceEwriImg from '../assets/recognition/recognition-asce-ewri.webp';

const positions = [
    {
        title: "Leadership Academy",
        category: "Leadership",
        company: "Wade Trim",
        year: "2024-2025",
        details: "Selected for intensive leadership development program",
        image: leadershipAcademyImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
        )
    },
    {
        title: "Optimization & Data Science Lead",
        category: "Innovation",
        company: "Wade Trim",
        year: "Since 2024",
        details: "Innovation Lead",
        image: optimizationDataScienceImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        )
    },
    {
        title: "Sewers of the Future Lead",
        category: "Strategy",
        company: "Wade Trim",
        year: "Since 2024",
        details: "Under Wet Weather Practice",
        image: sewersFutureImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 7" /></svg>
        )
    },
    {
        title: "AI Task Force",
        category: "Committee",
        company: "Wade Trim",
        year: "Since 2023",
        details: "Member",
        image: aiTaskForceImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        )
    },
    {
        title: "GIS Technical Lead",
        category: "Leadership",
        company: "Wade Trim",
        year: "Since 2022",
        details: "Under Advanced Design Practice",
        image: gisTechnicalLeadImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        )
    },
    {
        title: "Dale Carnegie Graduate",
        category: "Public Speaking",
        company: "Independent",
        year: "2008",
        details: "Effective Communications",
        image: daleCarnegieImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        )
    },
    {
        title: "1st Place Technical Writing",
        category: "Award",
        company: "Student",
        year: "2011",
        details: "ASCE EWRI Conference",
        image: asceEwriImg,
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        )
    },
];

const award = {
    title: "2024 Innovator of the Year",
    organization: "Wade Trim",
    description: "Awarded for outstanding contributions to innovation and technical excellence.",
    image: innovatorAwardImg
};

const presentations = [
    {
        title: "Building a More Accurate AI Chatbot for Engineering",
        conference: "OneWater 2025 - Cleveland, OH",
        types: ["Presentation"],
        roles: ["Co-Presenter"],
        featured: true // Make this spans 2 cols
    },
    {
        title: "GIS-Driven Hydraulic Model Expansion",
        conference: "3 Rivers Wet Weather 2025 - Pittsburgh, PA",
        types: ["Presentation"],
        roles: ["Lead Presenter"],
    },
    {
        title: "Advancing SWMM Parameter Optimization",
        conference: "ICWWMM 2025 - Toronto Canada",
        types: ["Paper", "Presentation"],
        roles: ["Co-Author"],
    },
    {
        title: "GIS-Driven Hydraulic Model Expansion",
        conference: "PA KeystoneGIS Conference - State College, PA 2024",
        types: ["Presentation"],
        roles: ["Lead Presenter"],
    },
    {
        title: "PWSA Model Expansion Case Study",
        conference: "IMGIS 2024 - Palm Springs, CA",
        types: ["Presentation"],
        roles: ["Presenter"],
    },
    {
        title: "Manifolded Force Main System Prioritization",
        conference: "Optimatics North America Users Conference - Denver, CO 2024",
        types: ["Presentation"],
        roles: ["Presenter"],
    },
    {
        title: "Comparison and analysis of hydrodynamic models for restoration projects: the case of pool-riffle structures",
        conference: "EWRI Congress 2011",
        types: ["Paper", "Presentation"],
        roles: ["Lead Author"],
        link: "https://ascelibrary.org/doi/abs/10.1061/41173(414)328"
    }
];

const positionGradientMap = {
    Leadership: "bg-gradient-to-br from-indigo-50 via-white to-white dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900",
    Innovation: "bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900",
    Strategy: "bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-900",
    Committee: "bg-gradient-to-br from-sky-50 via-white to-white dark:from-sky-950/25 dark:via-slate-900 dark:to-slate-900",
    "Public Speaking": "bg-gradient-to-br from-pink-50 via-white to-white dark:from-pink-950/30 dark:via-slate-900 dark:to-slate-900",
    Award: "bg-gradient-to-br from-amber-50 via-white to-white dark:from-amber-950/25 dark:via-slate-900 dark:to-slate-900",
};

const getPresentationGradient = (types) => {
    if (types.includes("Paper") && types.includes("Presentation")) {
        return "bg-gradient-to-br from-purple-50 via-white to-emerald-50 dark:from-purple-950/25 dark:via-slate-900 dark:to-emerald-950/20";
    }
    if (types.includes("Paper")) {
        return "bg-gradient-to-br from-emerald-50 via-white to-white dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-900";
    }
    return "bg-gradient-to-br from-purple-50 via-white to-white dark:from-purple-950/25 dark:via-slate-900 dark:to-slate-900";
};

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
        <section id="achievements" className="py-24 bg-transparent relative overflow-hidden">
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
                            Highlighting industry leadership, technical contributions, and recognition.
                        </p>
                    </div>
                    {/* Decorative Line */}
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1 ml-10 hidden md:block mb-4"></div>
                </motion.div>

                {/* Benton Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]">

                    {/* 1. Innovator Award (2x2) */}
                    <BentoItem className="md:col-span-2 md:row-span-2 bg-slate-900 border-none relative flex flex-col justify-end overflow-hidden group">
                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={award.image.src || award.image}
                                alt="Innovator of the Year Award"
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500 scale-105 group-hover:scale-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-2">
                            <span className="inline-block px-3 py-1 bg-amber-500/90 backdrop-blur-md rounded-full text-xs font-bold text-white mb-4 shadow-lg shadow-amber-500/20">
                                Career Highlight
                            </span>
                            <h3 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4 text-white drop-shadow-lg">
                                {award.title}
                            </h3>
                            <p className="text-slate-200 text-lg font-medium leading-relaxed max-w-sm drop-shadow-md">
                                {award.description}
                            </p>
                        </div>

                        <div className="relative z-10 mt-auto pt-8 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <span className="font-bold tracking-wide text-white">{award.organization}</span>
                        </div>
                    </BentoItem>

                    {positions.map((pos, i) => (
                        <BentoItem
                            key={i}
                            delay={0.1 + (i * 0.05)}
                            className={`flex flex-col justify-between group hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors ${positionGradientMap[pos.category] || ""}`}
                        >
                            <div className="absolute inset-0 pointer-events-none">
                                <img
                                    src={pos.image?.src || pos.image}
                                    alt={`${pos.title} highlight`}
                                    className="w-full h-full object-cover object-right opacity-35 group-hover:opacity-45 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/40 to-white/10 dark:from-slate-900/70 dark:via-slate-900/45 dark:to-slate-900/15" />
                            </div>
                            <div className="relative z-10 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-4 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                                {pos.icon}
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 leading-tight mb-0.5">
                                    {pos.title}
                                </h4>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">{pos.company}</p>
                                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">{pos.category}</span>

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/50">
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">{pos.year}</p>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                        {pos.details}
                                    </p>
                                </div>
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
                    {presentations.map((item, i) => (
                        <BentoItem
                            key={i + "paper"}
                            delay={0.3 + (i * 0.05)}
                            className={`${item.featured ? 'md:col-span-2' : ''} hover:border-blue-300 dark:hover:border-blue-700 ${getPresentationGradient(item.types)}`}
                        >
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {/* Types Icons */}
                                        <div className="flex gap-1">
                                            {item.types.includes("Paper") && (
                                                item.link ? (
                                                    <a
                                                        href={item.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        data-badge-action="journal-link"
                                                        title="View paper"
                                                        aria-label={`View paper: ${item.title}`}
                                                        className="p-1.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 hover:text-emerald-700 hover:bg-emerald-200/80 dark:hover:bg-emerald-500/40 ring-1 ring-emerald-200/70 hover:ring-emerald-300 dark:ring-emerald-500/30 dark:hover:ring-emerald-400 transition-all"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </a>
                                                ) : (
                                                    <div title="Paper" className="p-1.5 rounded bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                    </div>
                                                )
                                            )}
                                            {item.types.includes("Presentation") && (
                                                <div title="Presentation" className="p-1.5 rounded bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Roles Badges */}
                                        {item.roles.map((role, idx) => (
                                            <span
                                                key={idx}
                                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex items-center
                                                    ${role.includes("Lead") || role.includes("Presenter") ?
                                                        'bg-slate-800 text-white dark:bg-white dark:text-slate-900' :
                                                        'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                                    }`}
                                            >
                                                {role}
                                            </span>
                                        ))}
                                    </div>

                                    <h4 className={`${item.featured ? 'text-xl' : 'text-base'} font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2`}>
                                        {item.link ? (
                                            <a
                                                href={item.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 underline decoration-emerald-300/70 underline-offset-4 decoration-1 hover:decoration-2 text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                                aria-label={`Open paper: ${item.title}`}
                                            >
                                                {item.title}
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 6H19m0 0v5.5M19 6l-7 7M5 5h6a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /></svg>
                                            </a>
                                        ) : (
                                            item.title
                                        )}
                                    </h4>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/50 flex items-center gap-2 text-sm text-slate-500 font-medium">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <span className="">{item.conference}</span>
                                </div>
                            </div>
                        </BentoItem>
                    ))}

                </div>
            </div>
        </section>
    );
}
