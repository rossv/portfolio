// ... imports
import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import projects from '../data/project.json';
import ProjectFilters from './ProjectFilters';
import ProjectStats from './ProjectStats';
import ExperienceMap from './ExperienceMap';
import { getCompanyColor } from '../utils/companyColors';
import { TAG_HIERARCHY } from '../constants/tagHierarchy';


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

// Helper to extract year from date string
const getYear = (dateStr) => {
    if (!dateStr) return null;
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : null;
};

// Helper to format date range for display
const formatDateRange = (start, end) => {
    const startYear = getYear(start);
    const isPresent = !end || end.toLowerCase() === 'present';
    const endYear = isPresent ? 'Present' : getYear(end);

    if (!startYear) return '';
    if (!endYear || startYear === endYear) return `${startYear}`;
    return `${startYear} - ${endYear}`;
};

// Helper to get all years a project was active
const getProjectActiveYears = (start, end) => {
    const startYear = getYear(start);
    if (!startYear) return [];

    let endYear = getYear(end);
    if (!end || end.toLowerCase() === 'present') {
        endYear = new Date().getFullYear();
    }

    // If no end date, assume single year
    if (!endYear) return [startYear];

    const years = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y); // Keep as numbers for comparison
    }
    return years;
};

export default function ProjectDashboard({ onFilteredProjects }) {
    // ... items ...

    const [filterText, setFilterText] = useState('');
    const [selectedYears, setSelectedYears] = useState([]);
    const [selectedClients, setSelectedClients] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // Scroll Reference for resetting scroll
    const scrollContainerRef = useRef(null);
    const modalRef = useRef(null);
    const lastFocusedElementRef = useRef(null);

    // Extract unique options for filters
    const allYears = useMemo(() => {
        const yearSet = new Set();
        projects.forEach(p => {
            const activeYears = getProjectActiveYears(p.start_date, p.end_date);
            activeYears.forEach(y => yearSet.add(y));
        });
        return [...yearSet].sort((a, b) => b - a).map(String); // Return as strings for filter UI
    }, []);

    const allClients = useMemo(() =>
        [...new Set(projects.map(p => p.client_sort || p.client))].filter(Boolean).sort(),
        []);

    const allCompanies = useMemo(() =>
        [...new Set(projects.map(p => p.company))].filter(Boolean).sort(),
        []);

    const allCategories = useMemo(() =>
        [...new Set(projects.flatMap(p => p.category ? p.category.split(',').map(c => c.trim()) : []))].filter(Boolean).sort(),
        []);

    const allRoles = useMemo(() =>
        [...new Set(projects.flatMap(p => p.project_role ? p.project_role.split(',').map(r => r.trim()) : []))].filter(Boolean).sort(),
        []);

    const allTags = useMemo(() => {
        const projectTagSet = new Set();
        projects.forEach(p => (p.tags || []).forEach(tag => projectTagSet.add(tag)));
        const projectTags = [...projectTagSet];

        // Helper to reconstruct the hierarchy based on what actually exists in the data
        const buildHierarchy = (nodes) => {
            return nodes.map(node => {
                const label = node.label || node;
                // Check if this node (parent) exists in project tags
                const exists = projectTagSet.has(label);

                // Process children if any
                if (node.children) {
                    const children = buildHierarchy(node.children).filter(Boolean); // Clean out nulls

                    // If no children exist in data AND parent doesn't exist, skip this node
                    // But if parent exists, we keep it. 
                    // Or if kids exist, we keep parent (even if parent tag itself isn't on a project?) -> 
                    // Usually we only show filters that have matching data.
                    // Let's say: Show node if (exists) OR (has visible children)

                    if (exists || children.length > 0) {
                        return { label, children: children.length > 0 ? children : undefined };
                    }
                    return null;
                }

                // Leaf node
                return exists ? label : null;
            }).filter(Boolean);
        };

        const hierarchy = buildHierarchy(TAG_HIERARCHY);

        // Find "Orphan" tags (tags in data that aren't in the hierarchy)
        const flatHierarchyTags = new Set();
        const traverse = (nodes) => {
            nodes.forEach(n => {
                if (typeof n === 'string') flatHierarchyTags.add(n);
                else {
                    flatHierarchyTags.add(n.label);
                    if (n.children) traverse(n.children);
                }
            });
        };
        traverse(TAG_HIERARCHY); // Use full hierarchy to check coverage

        const orphans = projectTags.filter(t => !flatHierarchyTags.has(t)).sort();

        // Append orphans to the top level
        return [...hierarchy, ...orphans];
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
                project.title, // Add title to search
                ...(project.tags || [])
            ].join(' ').toLowerCase();

            if (filterText && !searchContent.includes(filterText.toLowerCase())) {
                return false;
            }

            // 2. Slicers
            if (selectedYears.length > 0) {
                const projectYears = getProjectActiveYears(project.start_date, project.end_date).map(String);
                // Check if ANY of the selected years overlap with project years
                const hasOverlap = selectedYears.some(y => projectYears.includes(y));
                if (!hasOverlap) return false;
            }

            if (selectedClients.length > 0 && !selectedClients.includes(project.client_sort || project.client)) {
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

            if (selectedRoles.length > 0) {
                const projectRoles = project.project_role ? project.project_role.split(',').map(r => r.trim()) : [];
                const hasRole = selectedRoles.some(role => projectRoles.includes(role));
                if (!hasRole) return false;
            }

            if (selectedTags.length > 0) {
                const projectTags = project.tags ?? [];
                const hasTag = projectTags.some(t => selectedTags.includes(t));
                if (!hasTag) return false;
            }

            return true;
        });

        // 3. Sorting: Active/Present first, then End Date (desc), then Start Date (desc)
        return result.sort((a, b) => {
            // Helper to get comparable value for end date
            const getEndDateValue = (d) => {
                if (!d || d.toLowerCase() === 'present') return 9999999999999;
                return new Date(d).getTime() || 0;
            };

            const getStartDateValue = (d) => {
                if (!d) return 0;
                return new Date(d).getTime() || 0;
            };

            const endA = getEndDateValue(a.end_date);
            const endB = getEndDateValue(b.end_date);

            if (endA !== endB) {
                return endB - endA;
            }

            // If end dates are same, sort by start date
            return getStartDateValue(b.start_date) - getStartDateValue(a.start_date);
        });

    }, [filterText, selectedYears, selectedClients, selectedCompanies, selectedCategories, selectedRoles, selectedTags]);

    useEffect(() => {
        onFilteredProjects?.(filteredProjects);
    }, [filteredProjects, onFilteredProjects]);

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

    const handleTagToggle = (itemLabel) => {
        setSelectedTags(prev => {
            // 1. Find the node in the FULL hierarchy to check for children
            const findNode = (nodes, target) => {
                for (const node of nodes) {
                    const label = typeof node === 'string' ? node : node.label;
                    if (label === target) return node;
                    if (node.children) {
                        const found = findNode(node.children, target);
                        if (found) return found;
                    }
                }
                return null;
            };

            const node = findNode(TAG_HIERARCHY, itemLabel);

            // Collect all descendants if it's a parent
            const getDescendants = (n) => {
                if (!n || typeof n === 'string' || !n.children) return [];
                let descendants = [];
                n.children.forEach(child => {
                    const childLabel = typeof child === 'string' ? child : child.label;
                    descendants.push(childLabel);
                    descendants = descendants.concat(getDescendants(child));
                });
                return descendants;
            };

            const descendants = node ? getDescendants(node) : [];
            const allAffected = [itemLabel, ...descendants];

            const isAlreadySelected = prev.includes(itemLabel);

            if (isAlreadySelected) {
                // Deselect parent AND all descendants
                return prev.filter(t => !allAffected.includes(t));
            } else {
                // Select parent AND all descendants (that aren't already selected)
                const toAdd = allAffected.filter(t => !prev.includes(t));
                return [...prev, ...toAdd];
            }
        });
    };

    const handleReset = () => {
        setFilterText('');
        setSelectedYears([]);
        setSelectedClients([]);
        setSelectedCompanies([]);
        setSelectedCategories([]);
        setSelectedRoles([]);
        setSelectedTags([]);
    };

    // Expandable Card State
    const [selectedProject, setSelectedProject] = useState(null);
    const modalTitleId = selectedProject
        ? `project-modal-title-${selectedProject.name
            ?.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}`
        : undefined;

    const closeModal = () => {
        setSelectedProject(null);
    };

    const handleCardClick = (project, event) => {
        lastFocusedElementRef.current = event.currentTarget;
        setSelectedProject(project);
    };

    const handleMapProjectClick = (project) => {
        // 1. Set the project as selected (opens modal)
        setSelectedProject(project);

        // 2. Ideally scroll to it in the grid as well? 
        // For now, opening the modal is the best "link". 
        // If we wanted to just scroll, we'd need refs for each card.
    };

    useEffect(() => {
        if (selectedProject) {
            modalRef.current?.focus();
        }
    }, [selectedProject]);

    useEffect(() => {
        if (!selectedProject && lastFocusedElementRef.current) {
            lastFocusedElementRef.current.focus();
        }
    }, [selectedProject]);

    useEffect(() => {
        if (!selectedProject) return;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeModal();
                return;
            }

            if (event.key !== 'Tab' || !modalRef.current) return;

            const focusableElements = Array.from(
                modalRef.current.querySelectorAll(
                    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
                )
            );

            if (focusableElements.length === 0) {
                event.preventDefault();
                modalRef.current.focus();
                return;
            }

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            } else if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedProject]);

    return (
        <div className="rounded-2xl relative h-[calc(100vh-100px)] min-h-[600px] max-h-[1200px]">

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                {/* Left Column: Search & List (Scrollable) */}
                <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full bg-transparent rounded-2xl overflow-hidden">

                    {/* Sticky Header: Search & Filters */}
                    <div className="p-4 md:p-6 z-20 bg-transparent transition-all">
                        <div className="max-w-4xl mx-auto space-y-4">
                            {/* Mobile Map Toggle / Preview could go here if needed, keeping it simple for now */}
                            <div className="relative group">
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={filterText}
                                    onChange={(e) => setFilterText(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white/20 dark:bg-slate-800/30 border border-white/20 dark:border-slate-700/30 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 backdrop-blur-sm"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none z-10" size={20} />
                            </div>

                            <ProjectFilters
                                allYears={allYears}
                                allCompanies={allCompanies}
                                allClients={allClients}
                                allCategories={allCategories}
                                allRoles={allRoles}
                                allTags={allTags}
                                selectedYears={selectedYears}
                                selectedCompanies={selectedCompanies}
                                selectedClients={selectedClients}
                                selectedCategories={selectedCategories}
                                selectedRoles={selectedRoles}
                                selectedTags={selectedTags}
                                onYearChange={(item) => handleToggle(setSelectedYears, item)}
                                onCompanyChange={(item) => handleToggle(setSelectedCompanies, item)}
                                onClientChange={(item) => handleToggle(setSelectedClients, item)}
                                onCategoryChange={(item) => handleToggle(setSelectedCategories, item)}
                                onRoleChange={(item) => handleToggle(setSelectedRoles, item)}
                                onTagChange={(item) => handleTagToggle(typeof item === 'string' ? item : item.label)}
                                onReset={handleReset}
                                filterText={filterText}
                            />
                        </div>
                    </div>

                    {/* Scrollable Content Area */}
                    <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth bg-transparent relative custom-scrollbar">
                        {/* Mobile Map (Visible only on small screens) */}
                        <div className="lg:hidden mb-8">
                            <ExperienceMap
                                projects={filteredProjects}
                                className="h-[300px] w-full shadow-md border-slate-200 dark:border-slate-700"
                                onProjectClick={handleMapProjectClick}
                            />
                        </div>

                        <ProjectStats projects={filteredProjects} />

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
                            {filteredProjects.map((project, index) => (
                                <ProjectCard
                                    key={`${project.name}-${index}`}
                                    project={project}
                                    onClick={(event) => handleCardClick(project, event)}
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

                        {/* Footer spacing */}
                        <div className="h-12"></div>
                    </div>
                </div>

                {/* Right Column: Map (Desktop Sticky) */}
                <div className="hidden lg:block lg:col-span-5 xl:col-span-4 h-full">
                    <div className="h-full w-full rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-slate-900 sticky top-4">
                        <ExperienceMap
                            projects={filteredProjects}
                            className="h-full w-full"
                            onProjectClick={handleMapProjectClick}
                        />
                    </div>
                </div>
            </div>

            {/* Expanded Card Modal */}
            <AnimatePresence>
                {selectedProject && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md" onClick={closeModal}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90%] overflow-hidden rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 border-t-4 cursor-default relative flex flex-col"
                            style={{ borderTopColor: getCompanyColor(selectedProject.company) }}
                            onClick={(e) => e.stopPropagation()}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={modalTitleId}
                            tabIndex={-1}
                            ref={modalRef}
                        >
                            <div className="overflow-y-auto p-8 h-full custom-scrollbar">
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
                                        {selectedProject.start_date && <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{formatDateRange(selectedProject.start_date, selectedProject.end_date)}</span>}
                                        <button
                                            onClick={closeModal}
                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>
                                </div>

                                <h2 id={modalTitleId} className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{selectedProject.name}</h2>

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
                                    {(selectedProject.title || selectedProject.project_role) && (
                                        <div className="text-sm flex flex-wrap gap-1 items-center mt-1">
                                            {selectedProject.title && <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedProject.title}</span>}
                                            {selectedProject.title && selectedProject.project_role && <span className="text-slate-300">•</span>}
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
                                    {(selectedProject.tags ?? []).map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-sm font-medium">#{tag}</span>
                                    ))}
                                </div>
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
                className="bg-white/10 dark:bg-slate-900/20 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/10 dark:border-slate-700/30 border-t-4 flex flex-col h-full group cursor-pointer hover:bg-white/20 dark:hover:bg-slate-900/40 hover:shadow-xl transition-all"
                style={{ borderTopColor: accentColor }}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{project.category}</span>
                    {project.start_date && <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{formatDateRange(project.start_date, project.end_date)}</span>}
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

                    {(project.title || project.project_role) && (
                        <div className="text-xs flex flex-wrap gap-1 items-center">
                            {project.title && <span className="font-semibold">{project.title}</span>}
                            {project.title && project.project_role && <span className="text-slate-300">•</span>}
                            {project.project_role && <span className="italic text-slate-500">{project.project_role}</span>}
                        </div>
                    )}
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-grow">
                    {truncatedDescription}
                </p>

                <div className="flex flex-wrap gap-2 mt-auto">
                    {(project.tags ?? []).slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">#{tag}</span>
                    ))}
                    {(project.tags ?? []).length > 3 && (
                        <span className="px-2 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-400 rounded text-xs">+{(project.tags ?? []).length - 3}</span>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
