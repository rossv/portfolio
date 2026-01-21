import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Filter, Check } from 'lucide-react';

const FilterDropdown = ({ title, options, selected, onChange, isOpen, onToggle, close }) => {
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const listId = useId();
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                close();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            // Focus input when opened
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            // Reset search when closed
            setSearchTerm('');
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, close]);

    // Helper to check if an option is selected
    const isSelected = (value) => selected.includes(value);

    // Simplified click handler that just passes the clicked value up
    const handleOptionClick = (value) => {
        onChange(value);
    };

    // Filter options based on search term
    const getFilteredOptions = (opts, term) => {
        if (!term) return opts;
        const lowerTerm = term.toLowerCase();

        return opts.reduce((acc, option) => {
            const isParent = option.children && option.children.length > 0;
            const label = typeof option === 'string' ? option : option.label;
            const matches = label.toLowerCase().includes(lowerTerm);

            if (isParent) {
                const filteredChildren = getFilteredOptions(option.children, term);
                // If parent matches, show it with all children (or filtered? let's show filtered for precision, 
                // but if parent matches drastically we might want context. 
                // Let's stick to showing parent if it matches OR if it has matching children)

                // UX decision: If I search "Design", I want to see "Design" group. 
                // If "Design" matches, maybe we should keep all children? 
                // For now, let's just filter children strictly to what matches the term, 
                // UNLESS the term exactly matches the parent, but partial match of parent 
                // usually implies looking for the category itself.
                // Let's try strictly filtering children.

                if (matches || filteredChildren.length > 0) {
                    // If parent matches but no children match, we still include parent (with empty children array if strict)
                    // If we want to show ALL children if parent matches:
                    // if (matches) return [...acc, option]; 
                    // But that defeats finding specific tags. 

                    acc.push({
                        ...option,
                        children: filteredChildren
                    });
                }
            } else {
                if (matches) {
                    acc.push(option);
                }
            }
            return acc;
        }, []);
    };

    const filteredOptions = getFilteredOptions(options, searchTerm);

    // Recursive render function
    const renderOption = (option, depth = 0) => {
        const isParent = option.children && option.children.length > 0; // Note: children might be empty after filtering
        const value = typeof option === 'string' ? option : option.label;
        const selectedState = isSelected(value);

        // Ensure we don't render parents with empty children if they only exist because of children matching
        // Actually typical behavior: Show parent if label matches OR children match.
        // If children array exists (even if empty) it's a parent node structure.

        return (
            <div key={value}>
                <button
                    onClick={() => handleOptionClick(value)}
                    role="option"
                    aria-selected={selectedState}
                    className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm transition-colors
                        ${selectedState
                            ? 'bg-blue-500/10 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5'
                        }
                    `}
                    style={{ paddingLeft: `${0.75 + (depth * 1.5)}rem` }}
                >
                    <span className="truncate">
                        {/* Highlight match? Maybe overkill for now. */}
                        {value}
                    </span>
                    {selectedState && <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />}
                </button>
                {/* Always render children container if it was originaly a parent, even if empty now? 
                    No, only if filteredChildren has items. 
                */}
                {option.children && option.children.length > 0 && (
                    <div>
                        {option.children.map(child => renderOption(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-haspopup="listbox"
                ref={buttonRef}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isOpen || selected.length > 0
                    ? 'bg-blue-500/10 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50'
                    : 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-sm text-slate-700 dark:text-slate-300 border-white/20 dark:border-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-800/40'
                    }`}
            >
                <span>{title}</span>
                {selected.length > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[1.25rem]">
                        {selected.length}
                    </span>
                )}
                <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.1 }}
                        className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/20 dark:border-slate-700/50 z-50 flex flex-col"
                        id={listId}
                        role="listbox"
                        tabIndex={-1}
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700/50 sticky top-0 bg-inherit z-10">
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-md px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 outline-none"
                                placeholder={`Search ${title.toLowerCase()}...`}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="overflow-y-auto py-2 flex-1">
                            {filteredOptions.length === 0 ? (
                                <p className="text-xs text-slate-400 p-2 text-center">No matching options</p>
                            ) : (
                                filteredOptions.map(option => renderOption(option))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function ProjectFilters({
    allYears,
    allCompanies,
    allClients,
    allCategories,
    allRoles,
    allTags,
    selectedYears,
    selectedCompanies,
    selectedClients,
    selectedCategories,
    selectedRoles,
    selectedTags,
    onYearChange,
    onCompanyChange,
    onClientChange,
    onCategoryChange,
    onRoleChange,
    onTagChange,
    onReset,
    filterText
}) {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const toggleDropdown = (name) => {
        setActiveDropdown(prev => prev === name ? null : name);
    };

    const closeDropdown = () => {
        setActiveDropdown(null);
    };

    const hasFilters = selectedYears.length > 0 ||
        selectedCompanies.length > 0 ||
        selectedClients.length > 0 ||
        selectedCategories.length > 0 ||
        selectedRoles.length > 0 ||
        selectedTags.length > 0 ||
        (filterText && filterText.length > 0);

    return (
        <div className="flex flex-wrap items-center gap-3 pb-4">
            <div className="flex items-center text-slate-500 gap-2 mr-2">
                <Filter size={18} />
                <span className="font-semibold text-sm">Filter by:</span>
            </div>

            <FilterDropdown
                title="Year"
                options={allYears}
                selected={selectedYears}
                onChange={onYearChange}
                isOpen={activeDropdown === 'year'}
                onToggle={() => toggleDropdown('year')}
                close={closeDropdown}
            />

            <FilterDropdown
                title="Category"
                options={allCategories}
                selected={selectedCategories}
                onChange={onCategoryChange}
                isOpen={activeDropdown === 'category'}
                onToggle={() => toggleDropdown('category')}
                close={closeDropdown}
            />

            <FilterDropdown
                title="Role"
                options={allRoles}
                selected={selectedRoles}
                onChange={onRoleChange}
                isOpen={activeDropdown === 'role'}
                onToggle={() => toggleDropdown('role')}
                close={closeDropdown}
            />

            <FilterDropdown
                title="Company"
                options={allCompanies}
                selected={selectedCompanies}
                onChange={onCompanyChange}
                isOpen={activeDropdown === 'company'}
                onToggle={() => toggleDropdown('company')}
                close={closeDropdown}
            />

            <FilterDropdown
                title="Client"
                options={allClients}
                selected={selectedClients}
                onChange={onClientChange}
                isOpen={activeDropdown === 'client'}
                onToggle={() => toggleDropdown('client')}
                close={closeDropdown}
            />

            <FilterDropdown
                title="Tags"
                options={allTags}
                selected={selectedTags}
                onChange={onTagChange}
                isOpen={activeDropdown === 'tags'}
                onToggle={() => toggleDropdown('tags')}
                close={closeDropdown}
            />

            {hasFilters && (
                <button
                    onClick={onReset}
                    className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                >
                    <X size={14} />
                    <span>Clear all</span>
                </button>
            )}
        </div>
    );
}
