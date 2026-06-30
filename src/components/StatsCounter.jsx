import { motion, useSpring, useTransform, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import projects from "../data/project.json";
import wadeTrimLogo from "../assets/logos/wade-trim.png";
import klhLogo from "../assets/logos/klh.png";
import cecLogo from "../assets/logos/cec.png";
import pittLogo from "../assets/logos/pitt.png";
import netlLogo from "../assets/logos/netl.png";

// Astro's image imports resolve to an object ({ src, ... }); plain bundlers give a string.
const resolveSrc = (img) => (img && img.src) || img;

// Career history → tiny company logos for the "Years Exp." fan-out.
const COMPANIES = [
    { label: "Wade Trim", logo: wadeTrimLogo },
    { label: "KLH Engineers", logo: klhLogo },
    { label: "CEC", logo: cecLogo },
    { label: "Univ. of Pittsburgh", logo: pittLogo },
    { label: "NETL · U.S. DOE", logo: netlLogo },
];

// Real entries from the portfolio, split into delivered projects vs. tools built.
const ALL_PROJECTS = projects.filter((p) => !p.isTool && p.name).map((p) => p.name);
const ALL_TOOLS = projects.filter((p) => p.isTool && p.name).map((p) => p.name);

const FAN_COUNT = 5;

// Fisher–Yates sample — run on the client only (see useEffect) to avoid SSR hydration drift.
function sample(arr, n) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a.slice(0, Math.min(n, a.length));
}

// macOS Dock-style fan: items cascade downward with even spacing and a gentle arc lean.
function fanPosition(i, n) {
    const first = 14;
    const gap = 40;
    const ty = first + gap * i;
    const t = n <= 1 ? 0 : i / (n - 1);
    const tx = 26 * (1 - Math.cos((t * Math.PI) / 2));
    return { tx, ty };
}

function scrollToSection(id) {
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Counter({ value, suffix = "" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) =>
        Math.round(current).toLocaleString() + suffix
    );

    useEffect(() => {
        if (inView) {
            spring.set(value);
        }
    }, [inView, value, spring]);

    return <motion.span ref={ref}>{display}</motion.span>;
}

function Stat({ value, suffix, label, numberClass, items, renderItem, onClick, ariaLabel, delay }) {
    const reduced = useReducedMotion();
    const [open, setOpen] = useState(false);
    const n = items.length;
    const bridgeHeight = n ? fanPosition(n - 1, n).ty + 48 : 0;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            aria-label={ariaLabel}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            className="group relative flex flex-col items-center sm:items-start text-center sm:text-left appearance-none bg-transparent border-0 p-0 m-0 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70"
        >
            <span className={`text-4xl md:text-5xl font-extrabold mb-1 font-sans transition-transform duration-300 group-hover:-translate-y-0.5 ${numberClass}`}>
                <Counter value={value} suffix={suffix} />
            </span>
            <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                {label}
            </span>

            {/* Fan-out: an invisible bridge keeps hover alive across the gap to the pills. */}
            <span
                aria-hidden="true"
                className="absolute left-1/2 top-full z-40 -translate-x-1/2"
                style={{ width: 300, height: bridgeHeight, pointerEvents: open ? "auto" : "none" }}
            >
                {items.map((item, i) => {
                    const { tx, ty } = fanPosition(i, n);
                    return (
                        <span key={i} className="absolute left-1/2 top-0 -translate-x-1/2">
                            <motion.span
                                initial={false}
                                animate={
                                    open
                                        ? { x: tx, y: ty, opacity: 1, scale: 1 }
                                        : { x: 0, y: -10, opacity: 0, scale: 0.6 }
                                }
                                transition={
                                    reduced
                                        ? { duration: 0 }
                                        : { duration: 0.4, ease: [0.2, 0.72, 0.28, 1], delay: open ? i * 0.045 : 0 }
                                }
                                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/20 dark:border-slate-700/50 bg-white/85 dark:bg-slate-900/75 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-900/10"
                            >
                                {renderItem(item)}
                            </motion.span>
                        </span>
                    );
                })}
            </span>
        </motion.button>
    );
}

export default function StatsCounter({ className = "" }) {
    const yearsOfExperience = new Date().getFullYear() - 2012;

    // Pick fresh random projects/tools on each load, client-side to avoid hydration mismatch.
    const [projectItems, setProjectItems] = useState([]);
    const [toolItems, setToolItems] = useState([]);
    useEffect(() => {
        setProjectItems(sample(ALL_PROJECTS, FAN_COUNT));
        setToolItems(sample(ALL_TOOLS, FAN_COUNT));
    }, []);

    const showTools = () => {
        // ProjectPortfolio hydrates lazily (client:visible), so persist intent via a flag
        // in case its listener isn't attached yet, plus an event for the already-mounted case.
        if (typeof window !== "undefined") {
            window.__wtShowTools = true;
            window.dispatchEvent(new CustomEvent("wt:show-tools"));
        }
        scrollToSection("projects");
    };

    const companyItem = (item) => (
        <>
            <img
                src={resolveSrc(item.logo)}
                alt=""
                className="h-4 w-4 shrink-0 rounded-sm object-contain"
                width={16}
                height={16}
            />
            {item.label}
        </>
    );

    const dotItem = (dotClass) => (name) => (
        <>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span className="max-w-[200px] truncate" title={name}>{name}</span>
        </>
    );

    return (
        <div className={`flex flex-row gap-4 sm:gap-12 items-start justify-center ${className}`}>
            <Stat
                value={yearsOfExperience}
                suffix="+"
                label="Years Exp."
                numberClass="text-indigo-600 dark:text-indigo-400"
                items={COMPANIES}
                renderItem={companyItem}
                onClick={() => scrollToSection("timeline")}
                ariaLabel={`${yearsOfExperience}+ years of experience — view the career timeline`}
                delay={0}
            />

            <div className="h-8 sm:h-12 w-px bg-slate-300 dark:bg-slate-700 mt-1 self-start" />

            <Stat
                value={100}
                suffix="+"
                label="Projects Delivered"
                numberClass="text-sky-500"
                items={projectItems}
                renderItem={dotItem("bg-sky-400/80")}
                onClick={() => scrollToSection("projects")}
                ariaLabel="100+ projects delivered — view the project portfolio"
                delay={0.1}
            />

            <div className="h-8 sm:h-12 w-px bg-slate-300 dark:bg-slate-700 mt-1 self-start" />

            <Stat
                value={20}
                suffix="+"
                label="Tools Architected"
                numberClass="text-indigo-600 dark:text-indigo-400"
                items={toolItems}
                renderItem={dotItem("bg-indigo-400/80")}
                onClick={showTools}
                ariaLabel="20+ tools architected — view the tools I built"
                delay={0.2}
            />
        </div>
    );
}
