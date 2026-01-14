import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Filter, Check } from 'lucide-react';

const FilterDropdown = ({ title, options, selected, onChange, isOpen, onToggle, close }) => {
    const dropdownRef = useRef(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                close();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, close]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={onToggle}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isOpen || selected.length > 0
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
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
                        className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-50"
                    >
                        <div className="p-2 space-y-1">
                            {options.length === 0 ? (
                                <p className="text-xs text-slate-400 p-2 text-center">No options available</p>
                            ) : (
                                options.map((option) => {
                                    const isSelected = selected.includes(option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => onChange(option)}
                                            className={`w-full text-left flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${isSelected
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <span className="truncate">{option}</span>
                                            {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />}
                                        </button>
                                    );
                                })
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
    allTags,
    selectedYears,
    selectedCompanies,
    selectedClients,
    selectedCategories,
    selectedTags,
    onYearChange,
    onCompanyChange,
    onClientChange,
    onCategoryChange,
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
                    className="ml-auto flex items-center gap-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                >
                    <X size={14} />
                    <span>Clear all</span>
                </button>
            )}
        </div>
    );
}
