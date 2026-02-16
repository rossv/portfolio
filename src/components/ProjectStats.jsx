import { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const StatCard = ({ title, children, className = "" }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/10 dark:bg-slate-900/20 backdrop-blur-md border border-white/20 dark:border-slate-700/30 rounded-xl p-4 flex flex-col ${className}`}
    >
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{title}</h4>
        <div className="flex-grow flex items-center justify-center">
            {children}
        </div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-2 rounded shadow-lg text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-100">{label || payload[0].name}</p>
                <p className="text-blue-500 font-mono">Count: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function ProjectStats({ projects }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const extractYear = (dateStr) => {
        if (!dateStr) return null;
        const match = dateStr.match(/\b(19|20)\d{2}\b/);
        return match ? Number(match[0]) : null;
    };

    const getProjectYears = (project) => {
        const startYear = extractYear(project.start_date);
        const endYearFromDate = extractYear(project.end_date);

        if (startYear) {
            const endYear = endYearFromDate ?? (project.end_date ? null : new Date().getFullYear());
            if (!endYear) return [startYear];
            const years = [];
            for (let year = startYear; year <= endYear; year++) {
                years.push(year);
            }
            return years;
        }

        const fallbackYears = project.year?.match(/\d{4}/g)?.map(Number);
        return fallbackYears?.length ? fallbackYears : [];
    };

    // Process Data
    const yearData = Object.entries(
        projects.reduce((acc, project) => {
            const years = getProjectYears(project);
            if (years.length === 0) {
                acc.Unknown = (acc.Unknown || 0) + 1;
                return acc;
            }
            years.forEach((year) => {
                acc[year] = (acc[year] || 0) + 1;
            });
            return acc;
        }, {})
    )
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            if (a.name === 'Unknown') return 1;
            if (b.name === 'Unknown') return -1;
            return Number(a.name) - Number(b.name);
        }); // Sort years asc, keep Unknown last

    const categoryData = Object.entries(
        projects.reduce((acc, p) => {
            const categories = p.category ? p.category.split(',').map(c => c.trim()) : ['Other'];
            categories.forEach(cat => {
                if (cat) acc[cat] = (acc[cat] || 0) + 1;
            });
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const clientData = Object.entries(
        projects.reduce((acc, p) => {
            const client = p.client || 'Unknown';
            acc[client] = (acc[client] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5); // Limit to top 5 clients

    // Calculate top tags for cloud
    const tagData = Object.entries(
        projects.flatMap(p => p.tags ?? []).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {})
    ).map(([text, value]) => ({ text, value })).sort((a, b) => b.value - a.value).slice(0, 15);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Projects" className="justify-center items-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-blue-500/5 dark:bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex flex-col items-center z-10 relative">
                    <div className="text-6xl font-black text-slate-800 dark:text-slate-100 font-mono drop-shadow-sm">
                        {projects.length}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-bold uppercase tracking-widest">
                        Projects Found
                    </div>
                </div>
                {/* Decorative Background */}
                <div className="absolute -right-4 -bottom-8 text-9xl text-slate-200 dark:text-slate-800 opacity-20 transform rotate-12 select-none pointer-events-none">
                    P
                </div>
            </StatCard>

            <StatCard title="By Year">
                <div className="w-full h-48">
                    {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={yearData} barCategoryGap={4}>
                                <XAxis dataKey="name" type="category" hide />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded bg-slate-200/40 dark:bg-slate-700/40" aria-hidden="true" />
                    )}
                </div>
            </StatCard>

            <StatCard title="Categories">
                <div className="w-full h-48">
                    {isMounted ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    innerRadius={40}
                                    outerRadius={65}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full w-full animate-pulse rounded-full bg-slate-200/40 dark:bg-slate-700/40" aria-hidden="true" />
                    )}
                </div>
            </StatCard>

            <StatCard title="Top Tags">
                <div className="flex flex-wrap gap-1 justify-center content-center">
                    {tagData.map((tag, i) => (
                        <span
                            key={tag.text}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs"
                            style={{ opacity: 1 - (i * 0.05) }}
                        >
                            {tag.text}
                        </span>
                    ))}
                </div>
            </StatCard>
        </div>
    );
}
