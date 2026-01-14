import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

const StatCard = ({ title, children, className = "" }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col ${className}`}
    >
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{title}</h4>
        <div className="flex-grow flex items-center justify-center">
            {children}
        </div>
    </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 rounded shadow-lg text-xs">
                <p className="font-bold text-slate-800 dark:text-slate-100">{label || payload[0].name}</p>
                <p className="text-blue-500 font-mono">Count: {payload[0].value}</p>
            </div>
        );
    }
    return null;
};

export default function ProjectStats({ projects }) {
    // Process Data
    const yearData = Object.entries(
        projects.reduce((acc, p) => {
            // Extract year (handle ranges like "2021-Present")
            const year = p.year ? p.year.split('-')[0] : 'Unknown';
            acc[year] = (acc[year] || 0) + 1;
            return acc;
        }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.name.localeCompare(a.name)); // Sort years desc

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
        projects.flatMap(p => p.tags).reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {})
    ).map(([text, value]) => ({ text, value })).sort((a, b) => b.value - a.value).slice(0, 15);


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Projects" className="justify-center items-center">
                <div className="text-5xl font-black text-slate-800 dark:text-slate-100 font-mono">
                    {projects.length}
                </div>
                <div className="text-xs text-slate-500 mt-1">Found</div>
            </StatCard>

            <StatCard title="By Year">
                <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={yearData}>
                            <XAxis dataKey="name" hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </StatCard>

            <StatCard title="Categories">
                <div className="w-full h-48">
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
                </div>
            </StatCard>

            <StatCard title="Top Tags">
                <div className="flex flex-wrap gap-1 justify-center content-center h-full overflow-hidden">
                    {tagData.map((tag, i) => (
                        <span
                            key={tag.text}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded text-[10px]"
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
