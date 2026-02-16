import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check current theme
        const isDark = document.documentElement.classList.contains('dark');
        setTheme(isDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    // return null on server to avoid hydration mismatch if possible, 
    // or just render a placeholder. But standard react logic is fine here 
    // as long as we handle mounting.
    if (!mounted) {
        return <div className="w-[84px] h-[44px]"></div>; // Placeholder space
    }

    return (
        <button
            onClick={toggleTheme}
            className="group relative flex items-center gap-2 px-2 py-1.5 rounded-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm backdrop-blur-sm"
            title="Toggle Theme"
            aria-label="Toggle Theme"
        >
            {/* Sun Wrapper */}
            <div
                className={`p-1.5 rounded-full transition-all duration-500 ${theme === 'light'
                    ? 'rotate-0 bg-white shadow-sm text-amber-500'
                    : 'rotate-90 bg-transparent text-slate-400'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            </div>

            {/* Moon Wrapper */}
            <div
                className={`p-1.5 rounded-full transition-all duration-500 ${theme === 'dark'
                    ? 'rotate-0 bg-slate-700 text-sky-400 shadow-sm'
                    : '-rotate-90 bg-transparent text-slate-400'
                    }`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            </div>
        </button>
    );
}
