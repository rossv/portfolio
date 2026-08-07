/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    darkMode: 'class',
    theme: {
        extend: {
            // The width at which the hero can hold its two-column composition.
            // It is not a device size, it is the hero's own arithmetic: the
            // wordmark is set at text-9xl there and "VOLKWEIN" will not break,
            // so the text column takes a fixed ~1142px whatever the viewport
            // does, and the portrait only ever gets the remainder. Below this
            // the remainder is too thin to put a face in, so the hero stacks
            // and the portrait moves under the copy at its own full size.
            screens: {
                hero: '1620px',
            },
            // A new screen would otherwise give .container another step and
            // widen it by 84px on large monitors. The hero breakpoint is for
            // the hero, so the container keeps the set it already had.
            container: {
                screens: {
                    sm: '640px',
                    md: '768px',
                    lg: '1024px',
                    xl: '1280px',
                    '2xl': '1536px',
                },
            },
            colors: {
                slate: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                sky: {
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                },
                indigo: {
                    600: '#4f46e5',
                    700: '#4338ca',
                },
                canvas: '#F4F3F1',
            },
            fontFamily: {
                sans: ['Syne', 'sans-serif'],
                mono: ['Space Mono', 'monospace'],
            },
            backgroundImage: {
                'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2394a3b8' fill-opacity='0.1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
            }
        },
    },
    plugins: [],
}
