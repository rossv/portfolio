// ... imports
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import projects from '../data/project.json';
import ProjectFilters from './ProjectFilters';
import ProjectStats from './ProjectStats';

export default function ProjectDashboard() {
    const [filterText, setFilterText] = useState('');
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // Extract unique options for filters
    const allYears = useMemo(() =>
        [...new Set(projects.map(p => p.year ? p.year.split('-')[0] : 'Unknown'))].sort().reverse(),
        []);

    const allClients = useMemo(() =>
        [...new Set(projects.map(p => p.client))].filter(Boolean).sort(),
        []);

    const allCompanies = useMemo(() =>
        [...new Set(projects.map(p => p.company))].filter(Boolean).sort(),
        []);

    const allCategories = useMemo(() =>
        [...new Set(projects.flatMap(p => p.category ? p.category.split(',').map(c => c.trim()) : []))].filter(Boolean).sort(),
        []);

    // Get top 20 most common tags for the filter list (to avoid overwhelming)
    const allTags = useMemo(() => {
        const counts = {};
        projects.forEach(p => p.tags.forEach(t => counts[t] = (counts[t] || 0) + 1));
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1]) // Sort by count desc
            .slice(0, 20)
            .map(([tag]) => tag)
            .sort();
    }, []);


    // Derived State: Filtering
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // 1. Text Search
            const searchContent = [
                project.name,
                project.client,
                project.company,
                project.description,
                project.category,
                project.location,
                ...(project.tags || [])
            ].join(' ').toLowerCase();

            if (filterText && !searchContent.includes(filterText.toLowerCase())) {
                return false;
            }

            // 2. Slicers
            if (selectedYears.length > 0) {
                // Handle "2021-Present" type ranges or just simple years
                const projectBaseYear = project.year ? project.year.split('-')[0] : 'Unknown';
                if (!selectedYears.includes(projectBaseYear)) return false;
            }

            if (selectedClients.length > 0 && !selectedClients.includes(project.client)) {
                return false;
            }

            if (selectedCompanies.length > 0 && !selectedCompanies.includes(project.company)) {
                return false;
            }

            if (selectedCategories.length > 0) {
                const projectCategories = project.category ? project.category.split(',').map(c => c.trim()) : [];
                const hasCategory = selectedCategories.some(cat => projectCategories.includes(cat));
                if (!hasCategory) return false;
            }

            if (selectedTags.length > 0) {
                const hasTag = project.tags.some(t => selectedTags.includes(t));
                if (!hasTag) return false;
            }

            return true;
        });
    }, [filterText, selectedYears, selectedClients, selectedCompanies, selectedCategories, selectedTags]);

    // Handlers
    const handleToggle = (setter, item) => {
        setter(prev =>
            prev.includes(item)
                ? prev.filter(i => i !== item)
                : [...prev, item]
        );
    };

    const handleReset = () => {
        setFilterText('');
        setSelectedYears([]);
        setSelectedClients([]);
        setSelectedCompanies([]);
        setSelectedCategories([]);
        setSelectedTags([]);
    };

    return (
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[1100px]">

            {/* Search Header - Fixed at Top */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md z-10 sticky top-0">
                <div className="max-w-4xl mx-auto space-y-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search projects by keyword, tech, location..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm text-slate-700 dark:text-slate-200"
                        />
                    </div>

                    <ProjectFilters
                        allYears={allYears}
                        allCompanies={allCompanies}
                        allClients={allClients}
                        allCategories={allCategories}
                        allTags={allTags}
                        selectedYears={selectedYears}
                        selectedCompanies={selectedCompanies}
                        selectedClients={selectedClients}
                        selectedCategories={selectedCategories}
                        selectedTags={selectedTags}
                        onYearChange={(item) => handleToggle(setSelectedYears, item)}
                        onCompanyChange={(item) => handleToggle(setSelectedCompanies, item)}
                        onClientChange={(item) => handleToggle(setSelectedClients, item)}
                        onCategoryChange={(item) => handleToggle(setSelectedCategories, item)}
                        onTagChange={(item) => handleToggle(setSelectedTags, item)}
                        onReset={handleReset}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/10">
                {/* Stats Dashboard */}
                <ProjectStats projects={filteredProjects} />

                {/* Results Grid */}
                <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((project) => (
                            <ProjectCard key={`${project.name}-${project.client}`} project={project} />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No projects match your filters.</p>
                        <button onClick={handleReset} className="mt-4 text-blue-500 hover:underline">Clear all filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for individual card (Extracted from old ProjectGrid but simplified/styled)
function ProjectCard({ project }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-t-4 border-blue-600 flex flex-col h-full group"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{project.category}</span>
                {project.year && <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{project.year}</span>}
            </div>

            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 transition-colors">{project.name}</h3>

            {(project.client || project.role) && (
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                    {project.client && <span className="text-indigo-600 dark:text-indigo-400">{project.client}</span>}
                    {project.client && project.role && <span className="mx-2">•</span>}
                    {project.role && <span>{project.role}</span>}
                </div>
            )}

            {project.location && <p className="text-sm text-slate-500 dark:text-slate-500 mb-4 italic flex items-center gap-1">
                <span className="w-1 h-1 bg-slate-400 rounded-full inline-block"></span>
                {project.location}
            </p>}

            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>

            <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">#{tag}</span>
                ))}
                {project.tags.length > 4 && (
                    <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded text-xs">+{project.tags.length - 4}</span>
                )}
            </div>
        </motion.div>
    );
}
