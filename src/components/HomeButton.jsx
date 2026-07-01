import React from 'react';

// Scrolls back to the top of the single-page site. Sits beside ThemeToggle and
// mirrors its pill styling for a consistent toolbar.
export default function HomeButton() {
    const scrollToTop = () => {
        const prefersReduced =
            typeof window !== 'undefined' &&
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    };

    return (
        <button
            onClick={scrollToTop}
            className="group flex items-center px-2 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm backdrop-blur-sm"
            title="Back to top"
            aria-label="Back to top"
        >
            <div className="p-1.5 rounded-full text-slate-500 dark:text-slate-400 transition-colors duration-300 group-hover:text-indigo-600 dark:group-hover:text-sky-400">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </div>
        </button>
    );
}
