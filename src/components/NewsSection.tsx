import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import newsData from '../data/news.json';

interface NewsItem {
    id: string;
    title: string;
    source: string;
    url: string;
    date: string;
    description: string;
    imageUrl: string;
}

const getNewsImageSrc = (imgProperty: string) => {
    if (!imgProperty) return null;
    if (imgProperty.startsWith('http')) return imgProperty;
    if (imgProperty.startsWith('/assets/')) return imgProperty;

    const filename = imgProperty.split('/').pop();
    return filename ? `/assets/news/${filename}` : null;
};

const NewsCard = ({ item, index }: { item: NewsItem; index: number }) => {
    const imageSrc = getNewsImageSrc(item.imageUrl);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group relative bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 flex flex-col h-full w-80 sm:w-96 shrink-0"
        >
            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-slate-200 dark:bg-slate-700">
                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt={item.title}
                        width={384}
                        height={192}
                        className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none'; // Hide if broken
                        }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {item.source}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                        {item.date}
                    </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="before:absolute before:inset-0">
                        {item.title}
                    </a>
                </h3>

                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {item.description}
                </p>

                <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300">
                    Read Article
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>
        </motion.div>
    );
};

export default function NewsSection() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        let animationFrameId = 0;
        let direction = 1;
        let lastTime = performance.now();
        let isPaused = false;
        const scrollSpeed = 0.08;

        const handlePause = () => {
            isPaused = true;
        };

        const handleResume = () => {
            isPaused = false;
            lastTime = performance.now();
        };

        const tick = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;

            if (!isPaused) {
                const maxScrollLeft = container.scrollWidth - container.clientWidth;

                if (maxScrollLeft > 0) {
                    const nextScrollLeft = container.scrollLeft + direction * delta * scrollSpeed;

                    if (nextScrollLeft <= 0) {
                        container.scrollLeft = 0;
                        direction = 1;
                    } else if (nextScrollLeft >= maxScrollLeft) {
                        container.scrollLeft = maxScrollLeft;
                        direction = -1;
                    } else {
                        container.scrollLeft = nextScrollLeft;
                    }
                }
            }

            animationFrameId = requestAnimationFrame(tick);
        };

        const startAnimation = () => {
            if (animationFrameId) return;
            lastTime = performance.now();
            animationFrameId = requestAnimationFrame(tick);
        };

        const stopAnimation = () => {
            if (!animationFrameId) return;
            cancelAnimationFrame(animationFrameId);
            animationFrameId = 0;
        };

        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const handlePreferenceChange = () => {
            if (mediaQuery.matches) {
                stopAnimation();
            } else {
                startAnimation();
            }
        };

        handlePreferenceChange();

        container.addEventListener('mouseenter', handlePause);
        container.addEventListener('mouseleave', handleResume);
        container.addEventListener('focusin', handlePause);
        container.addEventListener('focusout', handleResume);
        container.addEventListener('touchstart', handlePause);
        container.addEventListener('touchend', handleResume);
        if ('addEventListener' in mediaQuery) {
            mediaQuery.addEventListener('change', handlePreferenceChange);
        } else {
            mediaQuery.addListener(handlePreferenceChange);
        }

        return () => {
            stopAnimation();
            container.removeEventListener('mouseenter', handlePause);
            container.removeEventListener('mouseleave', handleResume);
            container.removeEventListener('focusin', handlePause);
            container.removeEventListener('focusout', handleResume);
            container.removeEventListener('touchstart', handlePause);
            container.removeEventListener('touchend', handleResume);
            if ('removeEventListener' in mediaQuery) {
                mediaQuery.removeEventListener('change', handlePreferenceChange);
            } else {
                mediaQuery.removeListener(handlePreferenceChange);
            }
        };
    }, []);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const updateProgress = () => {
            const maxScrollLeft = container.scrollWidth - container.clientWidth;
            if (maxScrollLeft <= 0) {
                setScrollProgress(0);
                return;
            }
            setScrollProgress(container.scrollLeft / maxScrollLeft);
        };

        updateProgress();
        container.addEventListener('scroll', updateProgress, { passive: true });
        window.addEventListener('resize', updateProgress);

        return () => {
            container.removeEventListener('scroll', updateProgress);
            window.removeEventListener('resize', updateProgress);
        };
    }, []);

    const sortedNews = [...newsData].sort((a, b) => {
        const dateA = Date.parse(a.date);
        const dateB = Date.parse(b.date);

        if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
        if (Number.isNaN(dateA)) return 1;
        if (Number.isNaN(dateB)) return -1;

        return dateB - dateA;
    });

    return (
        <section id="news" className="section-shell section-shell--alt relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="mx-auto px-6 relative z-10 w-full max-w-none">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 tracking-tight">
                            In the News
                        </h2>
                        <p className="font-mono text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Recent features, mentions, and updates from across the web.
                        </p>
                    </motion.div>
                </div>

                <div className="relative">
                    <div
                        ref={scrollRef}
                        className="flex gap-8 overflow-x-auto pb-6 w-full snap-x snap-mandatory"
                        style={{ scrollSnapType: 'x mandatory' }}
                    >
                        {sortedNews.map((item, index) => (
                            <div key={item.id} className="shrink-0 snap-start">
                                <NewsCard item={item} index={index} />
                            </div>
                        ))}
                    </div>
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white/70 via-white/20 to-transparent dark:from-slate-950/60 dark:via-slate-950/20" />
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white/70 via-white/20 to-transparent dark:from-slate-950/60 dark:via-slate-950/20" />
                </div>
                <div className="relative mt-4 h-1.5 w-full max-w-3xl mx-auto rounded-full bg-slate-200/70 dark:bg-slate-700/50 overflow-hidden">
                    <div
                        className="absolute top-0 h-full rounded-full bg-gradient-to-r from-indigo-400/60 via-purple-400/60 to-indigo-400/60 transition-[left] duration-150"
                        style={{
                            width: '30%',
                            left: `${scrollProgress * 70}%`,
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
