// ... imports
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import projects from '../data/project.json';
import ProjectFilters from './ProjectFilters';
import ProjectStats from './ProjectStats';
import { getCompanyColor } from '../utils/companyColors';


// Dynamic Asset Imports using Vite glob
// This loads all images from the projects directory
// eager: true means they are loaded synchronously as modules
const projectAssets = import.meta.glob('../assets/projects/*', { eager: true });

// Helper to resolve image path from JSON to actual asset URL
const getProjectImageSrc = (imgProperty) => {
    if (!imgProperty) return null;

    // Return as-is if it's an external URL (http/https)
    if (imgProperty.startsWith('http')) {
        return imgProperty;
    }

    // For local paths like "/src/assets/projects/filename.jpg"
    // We need to match it to the keys in projectAssets which are relative: "../assets/projects/filename.jpg"
    const filename = imgProperty.split('/').pop();
    const globKey = `../assets/projects/${filename}`;

    const assetModule = projectAssets[globKey];

    if (!assetModule) return null;

    const def = assetModule.default;
    // Handle case where image is imported as object with src (Astro/Vite specific)
    if (def && typeof def === 'object' && 'src' in def) {
        return def.src;
    }
    return def;
};

// Helper to extract year for display and filtering
// Handles formats like "2024", "2021-Present", "1/1/2025"
const extractYear = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? match[0] : null;
};

export default function ProjectDashboard() {
    // ... items ...

    const [filterText, setFilterText] = useState('');
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // Scroll Reference for resetting scroll
    const scrollContainerRef = useRef(null);

    // Extract unique options for filters
    const allYears = useMemo(() =>
        [...new Set(projects.map(p => extractYear(p.year) || 'Unknown'))].sort().reverse(),
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

    const allTags = useMemo(() => {
        const tagSet = new Set();
        projects.forEach(p => (p.tags || []).forEach(tag => tagSet.add(tag)));
        return [...tagSet].sort();
    }, []);



    // Derived State: Filtering
    const filteredProjects = useMemo(() => {
        let result = projects.filter(project => {
            // 1. Text Search
            const searchContent = [
                project.name,
                project.client,
                project.company,
                project.description,
                project.category,
                project.location,
                project.project_role, // Add project_role to search
                project.role, // Add role to search
                ...(project.tags || [])
            ].join(' ').toLowerCase();

            if (filterText && !searchContent.includes(filterText.toLowerCase())) {
                return false;
            }

            // 2. Slicers
            if (selectedYears.length > 0) {
                const projectYear = extractYear(project.year) || 'Unknown';
                if (!selectedYears.includes(projectYear)) return false;
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

        // 3. Sorting: Reverse Chronological (Newest First)
        return result.sort((a, b) => {
            const getDateValue = (y) => {
                if (!y) return 0;
                // "Present" implies current (highest value)
                if (y.toLowerCase().includes('present')) return 9999999999999;

                // Try parsing full date first (e.g. "1/1/2025")
                // We split by '-' to handle "2021-2022" -> parse "2021" if full date not present
                // But for "1/1/2025", split('-') creates ["1/1/2025"].
                const parts = y.split('-');
                const mainPart = parts[0].trim();

                const parsedDate = Date.parse(mainPart);
                if (!isNaN(parsedDate)) return parsedDate;

                // Fallback: extract year integer
                return parseInt(mainPart) || 0;
            };
            return getDateValue(b.year) - getDateValue(a.year);
        });

    }, [filterText, selectedYears, selectedClients, selectedCompanies, selectedCategories, selectedTags]);

    // Scroll to top when filters change
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [filteredProjects]);

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

    // Expandable Card State
    const [selectedProject, setSelectedProject] = useState(null);

    return (
        <div className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden flex flex-col h-[1100px] relative">

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
                        filterText={filterText}
                    />
                </div>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/30 dark:bg-slate-900/10 scroll-smooth">
                {/* Stats Dashboard */}
                <ProjectStats projects={filteredProjects} />

                {/* Results Grid - Simplified Layout for Stability */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map((project, index) => (
                        <ProjectCard
                            key={`${project.name}-${index}`}
                            project={project}
                            onClick={() => setSelectedProject(project)}
                            isSelected={selectedProject?.name === project.name}
                        />
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-500 dark:text-slate-400 text-lg">No projects match your filters.</p>
                        <button onClick={handleReset} className="mt-4 text-blue-500 hover:underline">Clear all filters</button>
                    </div>
                )}
            </div>

            {/* Expanded Card Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedProject(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90%] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 border-t-4 p-8 cursor-default"
                            style={{ borderTopColor: getCompanyColor(selectedProject.company) }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Hero Image with Fade Mask */}
                            {(() => {
                                const imageSrc = getProjectImageSrc(selectedProject.image);

                                return imageSrc && (
                                    <div className="w-[calc(100%+4rem)] h-80 -mx-8 -mt-8 mb-6 relative group">
                                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent opacity-90"></div>
                                        <img
                                            src={imageSrc}
                                            alt={selectedProject.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                );
                            })()}

                            {/* ... Content ... */}
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{selectedProject.category}</span>
                                <div className="flex items-center gap-2">
                                    {selectedProject.year && <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{extractYear(selectedProject.year)}</span>}
                                    <button
                                        onClick={() => setSelectedProject(null)}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </div>
                            {/* ... Rest of content omitted for brevity in replace tool, but included in visual inspection context ... */}
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedProject.name}</h2>
                            {/* ... */}
                            <div className="text-base text-slate-600 dark:text-slate-400 mb-6 flex flex-col gap-1">
                                {(selectedProject.company || selectedProject.client) && (
                                    <div className="font-medium flex flex-wrap gap-2 items-center">
                                        {selectedProject.company && <span className="font-bold text-slate-700 dark:text-slate-300">{selectedProject.company}</span>}
                                        {selectedProject.company && selectedProject.client && selectedProject.client !== selectedProject.company && (
                                            <>
                                                <span className="text-slate-300">|</span>
                                                <span className="text-indigo-600 dark:text-indigo-400">{selectedProject.client}</span>
                                            </>
                                        )}
                                        {!selectedProject.company && selectedProject.client && <span className="text-indigo-600 dark:text-indigo-400">{selectedProject.client}</span>}
                                    </div>
                                )}
                                {(selectedProject.role || selectedProject.project_role) && (
                                    <div className="text-sm flex flex-wrap gap-1 items-center mt-1">
                                        {selectedProject.role && <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedProject.role}</span>}
                                        {selectedProject.role && selectedProject.project_role && <span className="text-slate-300">•</span>}
                                        {selectedProject.project_role && <span className="italic text-slate-500">{selectedProject.project_role}</span>}
                                    </div>
                                )}
                            </div>
                            {selectedProject.location && <p className="text-sm text-slate-500 dark:text-slate-500 mb-6 italic flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block"></span>
                                {selectedProject.location}
                            </p>}
                            <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
                                {selectedProject.description}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-auto">
                                {selectedProject.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium">#{tag}</span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sub-component for individual card (Extracted from old ProjectGrid but simplified/styled)
function ProjectCard({ project, onClick, isSelected }) {
    // Truncate description to ~80 chars for tighter tiles
    const truncatedDescription = project.description?.length > 80
        ? project.description.substring(0, 80) + "..."
        : project.description;

    const accentColor = getCompanyColor(project.company);

    return (
        <div className="h-full">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={onClick}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border-t-4 flex flex-col h-full group cursor-pointer hover:shadow-xl transition-all"
                style={{ borderTopColor: accentColor }}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{project.category}</span>
                    {project.year && <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{extractYear(project.year)}</span>}
                </div>

                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-slate-600 transition-colors">{project.name}</h3>

                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3 flex flex-col gap-1">
                    {(project.company || project.client) && (
                        <div className="font-medium flex flex-wrap gap-2 items-center">
                            {project.company && <span className="font-bold text-slate-700 dark:text-slate-300">{project.company}</span>}
                            {project.company && project.client && project.client !== project.company && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-indigo-600 dark:text-indigo-400">{project.client}</span>
                                </>
                            )}
                            {/* Fallback if no company but client exists */}
                            {!project.company && project.client && <span className="text-indigo-600 dark:text-indigo-400">{project.client}</span>}
                        </div>
                    )}

                    {(project.role || project.project_role) && (
                        <div className="text-xs flex flex-wrap gap-1 items-center">
                            {project.role && <span className="font-semibold">{project.role}</span>}
                        </div>
                    )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">
                    {truncatedDescription}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {project.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">#{tag}</span>
                    ))}
                    {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded text-xs">+{project.tags.length - 3}</span>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
