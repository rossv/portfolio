import { motion, useSpring, useTransform, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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
// Kept compact so all items stay in view below the stats before the fold.
function fanPosition(i, n) {
    const first = 10;
    const gap = 30;
    const ty = first + gap * i;
    const t = n <= 1 ? 0 : i / (n - 1);
    const tx = 22 * (1 - Math.cos((t * Math.PI) / 2));
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
    const [anchor, setAnchor] = useState(null); // { cx, top } in viewport coords
    const [dim, setDim] = useState(1);           // fade when spilling onto the next section
    const btnRef = useRef(null);
    const n = items.length;

    const openFan = () => {
        const el = btnRef.current;
        if (el) {
            const r = el.getBoundingClientRect();
            setAnchor({ cx: r.left + r.width / 2, top: r.bottom });
            // Fade the fan by how much it spills onto the following section, so
            // it's less distracting over that content while staying readable.
            const next = document.getElementById("skills");
            const boundary = next ? next.getBoundingClientRect().top : Infinity;
            const extent = n ? fanPosition(n - 1, n).ty + 28 : 0;
            const overlap = extent > 0 ? Math.max(0, r.bottom + extent - boundary) / extent : 0;
            setDim(1 - 0.35 * Math.min(1, overlap));
        }
        setOpen(true);
    };
    const closeFan = () => setOpen(false);

    // The fan is a fixed overlay pinned to the button's on-screen spot, so any
    // scroll/resize invalidates the anchor — close it (a re-hover recomputes).
    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        window.addEventListener("scroll", close, { passive: true, capture: true });
        window.addEventListener("resize", close);
        return () => {
            window.removeEventListener("scroll", close, { capture: true });
            window.removeEventListener("resize", close);
        };
    }, [open]);

    // Rendered into document.body so the hero's overflow-hidden can't clip it and
    // the next section can't cover it — it floats above everything like a tooltip.
    const fan = anchor && typeof document !== "undefined"
        ? createPortal(
            <div
                aria-hidden="true"
                style={{ position: "fixed", left: anchor.cx, top: anchor.top, zIndex: 70, pointerEvents: "none", opacity: dim, transition: "opacity 0.25s ease" }}
            >
                {items.map((item, i) => {
                    const { tx, ty } = fanPosition(i, n);
                    return (
                        <span key={i} style={{ position: "absolute", left: 0, top: 0, transform: "translateX(-50%)" }}>
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
                                className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/25 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/85 backdrop-blur-md px-2.5 py-0.5 text-[11px] leading-tight font-medium text-slate-700 dark:text-slate-200 shadow-lg shadow-slate-900/25"
                            >
                                {renderItem(item)}
                            </motion.span>
                        </span>
                    );
                })}
            </div>,
            document.body
        )
        : null;

    return (
        <motion.button
            ref={btnRef}
            type="button"
            onClick={onClick}
            onMouseEnter={openFan}
            onMouseLeave={closeFan}
            onFocus={openFan}
            onBlur={closeFan}
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
            {fan}
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
                className="h-3.5 w-3.5 shrink-0 rounded-sm object-contain"
                width={14}
                height={14}
            />
            {item.label}
        </>
    );

    const dotItem = (dotClass) => (name) => (
        <>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            <span className="max-w-[190px] truncate" title={name}>{name}</span>
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
