import { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Filter, Check } from 'lucide-react';

const FilterDropdown = ({ title, options, selected, onChange, isOpen, onToggle, close }) => {
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const optionRefs = useRef([]);
    const prevOpenRef = useRef(isOpen);
    const openFocusIndexRef = useRef(0);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const listId = useId();
    const optionIdBase = useId();

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

    useEffect(() => {
        if (isOpen) {
            if (options.length === 0) {
                return;
            }
            const selectedIndex = selected.length > 0
                ? options.findIndex((option) => option === selected[0])
                : -1;
            const nextIndex = openFocusIndexRef.current;
            const fallbackIndex = selectedIndex >= 0 ? selectedIndex : 0;
            const targetIndex = Math.max(0, Math.min(options.length - 1, nextIndex ?? fallbackIndex));
            setFocusedIndex(targetIndex);
            requestAnimationFrame(() => {
                optionRefs.current[targetIndex]?.focus();
            });
            openFocusIndexRef.current = null;
        } else if (prevOpenRef.current) {
            buttonRef.current?.focus();
        }
        prevOpenRef.current = isOpen;
    }, [isOpen, options, selected]);

    const handleToggleKeyDown = (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            if (options.length === 0) {
                return;
            }
            const targetIndex = event.key === 'ArrowUp' ? options.length - 1 : 0;
            if (isOpen) {
                setFocusedIndex(targetIndex);
                optionRefs.current[targetIndex]?.focus();
            } else {
                openFocusIndexRef.current = targetIndex;
                onToggle();
            }
        }
    };

    const handleListKeyDown = (event) => {
        if (!isOpen) {
            return;
        }
        if (options.length === 0) {
            return;
        }
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            const nextIndex = (focusedIndex + 1) % options.length;
            setFocusedIndex(nextIndex);
            optionRefs.current[nextIndex]?.focus();
        }
        if (event.key === 'ArrowUp') {
            event.preventDefault();
            const nextIndex = (focusedIndex - 1 + options.length) % options.length;
            setFocusedIndex(nextIndex);
            optionRefs.current[nextIndex]?.focus();
        }
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const option = options[focusedIndex];
            if (option) {
                onChange(option);
            }
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            close();
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    openFocusIndexRef.current = null;
                    onToggle();
                }}
                onKeyDown={handleToggleKeyDown}
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-haspopup="listbox"
                ref={buttonRef}
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
                        id={listId}
                        role="listbox"
                        tabIndex={-1}
                        onKeyDown={handleListKeyDown}
                    >
                        <div className="p-2 space-y-1">
                            {options.length === 0 ? (
                                <p className="text-xs text-slate-400 p-2 text-center">No options available</p>
                            ) : (
                                options.map((option, index) => {
                                    const isSelected = selected.includes(option);
                                    const optionId = `${optionIdBase}-${index}`;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => onChange(option)}
                                            ref={(node) => {
                                                optionRefs.current[index] = node;
                                            }}
                                            role="option"
                                            aria-selected={isSelected}
                                            id={optionId}
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
