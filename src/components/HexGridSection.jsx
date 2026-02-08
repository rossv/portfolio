import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Database } from 'lucide-react';

// --- IMPORTS (Verified Paths) ---

// 1. Coding (src/assets/icons/coding/)
import pythonIcon from '../assets/icons/coding/python.png';
import jsIcon from '../assets/icons/coding/javascript.png';
import vbaIcon from '../assets/icons/coding/vba.png';
import gasIcon from '../assets/icons/coding/google_apps_script.png';
import githubIcon from '../assets/icons/coding/github.png';
import chatgptIcon from '../assets/icons/coding/chatgpt.png';
import antigravityIcon from '../assets/icons/coding/antigravity.png';

// 2. Data (src/assets/icons/data/)
import excelIcon from '../assets/icons/data/excel.png';
import powerBiIcon from '../assets/icons/data/powerbi.png';

// 3. Eng-Viz (src/assets/icons/eng-viz/)
import hydrantIcon from '../assets/icons/eng-viz/Hydrant_testing.png';
import flowMonIcon from '../assets/icons/eng-viz/flow_monitoring.png';
import c3dIcon from '../assets/icons/eng-viz/c3d.png';
import i360Icon from '../assets/icons/eng-viz/infraworks360.png';
import lumionIcon from '../assets/icons/eng-viz/lumion.png';
import navisworksIcon from '../assets/icons/eng-viz/navisworks.png';
import sketchupIcon from '../assets/icons/eng-viz/sketchup.png';
import wincanIcon from '../assets/icons/eng-viz/wincan.png';

// 4. GIS (src/assets/icons/gis/)
import dashboardsIcon from '../assets/icons/gis/arcgis_dashbaords.png';
import enterpriseIcon from '../assets/icons/gis/arcgis_enterprise.png';
import quickCaptureIcon from '../assets/icons/gis/arcgis_quickcapture.png';
import storyMapsIcon from '../assets/icons/gis/arcgis_storymaps.png';
import agolIcon from '../assets/icons/gis/arcgisonline.png';
import arcgisProIcon from '../assets/icons/gis/arcgispro.png';
import arcMapIcon from '../assets/icons/gis/arcmap.png';
import expBuilderIcon from '../assets/icons/gis/expereincebuilder.png';
import fieldMapsIcon from '../assets/icons/gis/fieldmaps.png';
import qgisIcon from '../assets/icons/gis/qgis.png';
import survey123Icon from '../assets/icons/gis/survey123.png';
import trimbleIcon from '../assets/icons/gis/trimble_r2.png';

// 5. HH (src/assets/icons/hh/)
import epanetIcon from '../assets/icons/hh/epanet.png';
import epaSwmmIcon from '../assets/icons/hh/epaswmm.png';
import hecHmsIcon from '../assets/icons/hh/hechms.png';
import hecRasIcon from '../assets/icons/hh/hecras.png';
import hydroCadIcon from '../assets/icons/hh/hydrocad.png';
import icmIcon from '../assets/icons/hh/icm.png';
import infoSwmmIcon from '../assets/icons/hh/infoswmm.png';
import infoWaterIcon from '../assets/icons/hh/infowaterpro.png';
import optimizerIcon from '../assets/icons/hh/optimizer.png';
import pcswmmIcon from '../assets/icons/hh/pcswmm.png';
import ssoapIcon from '../assets/icons/hh/ssoap.png';
import waterGemsIcon from '../assets/icons/hh/watergems.png';


const icons = [
    // --- Group: H&H (Hydrology & Hydraulics) ---
    { id: 'icm', icon: icmIcon, label: "InfoWorks ICM", group: "hh", isImage: true },
    { id: 'pcswmm', icon: pcswmmIcon, label: "PCSWMM", group: "hh", isImage: true },
    { id: 'epas', icon: epaSwmmIcon, label: "EPA SWMM 5", group: "hh", isImage: true },
    { id: 'infos', icon: infoSwmmIcon, label: "InfoSWMM", group: "hh", isImage: true },
    { id: 'ras', icon: hecRasIcon, label: "HEC-RAS", group: "hh", isImage: true },
    { id: 'hms', icon: hecHmsIcon, label: "HEC-HMS", group: "hh", isImage: true },
    { id: 'epanet', icon: epanetIcon, label: "EPANET", group: "hh", isImage: true },
    { id: 'infow', icon: infoWaterIcon, label: "InfoWater Pro", group: "hh", isImage: true },
    { id: 'wg', icon: waterGemsIcon, label: "WaterGEMS", group: "hh", isImage: true },
    { id: 'hc', icon: hydroCadIcon, label: "HydroCAD", group: "hh", isImage: true },
    { id: 'ssoap', icon: ssoapIcon, label: "SSOAP Tool", group: "hh", isImage: true },
    { id: 'opt', icon: optimizerIcon, label: "Optimizer", group: "hh", isImage: true },

    // --- Group: GIS ---
    { id: 'pro', icon: arcgisProIcon, label: "ArcGIS Pro", group: "gis", isImage: true },
    { id: 'arcmap', icon: arcMapIcon, label: "ArcMap", group: "gis", isImage: true },
    { id: 'qgis', icon: qgisIcon, label: "QGIS", group: "gis", isImage: true },
    { id: 'agol', icon: agolIcon, label: "ArcGIS Online", group: "gis", isImage: true },
    { id: 'ent', icon: enterpriseIcon, label: "ArcGIS Enterprise", group: "gis", isImage: true },
    { id: 'dash', icon: dashboardsIcon, label: "ArcGIS Dashboards", group: "gis", isImage: true },
    { id: 'exp', icon: expBuilderIcon, label: "Experience Builder", group: "gis", isImage: true },
    { id: 'story', icon: storyMapsIcon, label: "StoryMaps", group: "gis", isImage: true },
    { id: 'field', icon: fieldMapsIcon, label: "Field Maps", group: "gis", isImage: true },
    { id: 'surv', icon: survey123Icon, label: "Survey123", group: "gis", isImage: true },
    { id: 'quick', icon: quickCaptureIcon, label: "QuickCapture", group: "gis", isImage: true },
    { id: 'trim', icon: trimbleIcon, label: "Trimble GPS", group: "gis", isImage: true },

    // --- Group: Coding ---
    { id: 'py', icon: pythonIcon, label: "Python", group: "coding", isImage: true },
    { id: 'js', icon: jsIcon, label: "JavaScript", group: "coding", isImage: true },
    { id: 'sql', icon: Database, label: "SQL", group: "coding", isImage: false },
    { id: 'git', icon: githubIcon, label: "GitHub", group: "coding", isImage: true },
    { id: 'vba', icon: vbaIcon, label: "VBA", group: "coding", isImage: true },
    { id: 'gas', icon: gasIcon, label: "Google Apps Script", group: "coding", isImage: true },
    { id: 'ai', icon: chatgptIcon, label: "Generative AI", group: "coding", isImage: true },
    { id: 'anti', icon: antigravityIcon, label: "Antigravity", group: "coding", isImage: true },

    // --- Group: Engineering / Viz / Data (Eng) ---
    { id: 'excel', icon: excelIcon, label: "Advanced Excel", group: "eng", isImage: true },
    { id: 'pbi', icon: powerBiIcon, label: "Power BI", group: "eng", isImage: true },
    { id: 'sketch', icon: sketchupIcon, label: "SketchUp", group: "eng", isImage: true },
    { id: 'lum', icon: lumionIcon, label: "Lumion", group: "eng", isImage: true },
    { id: 'navis', icon: navisworksIcon, label: "Navisworks", group: "eng", isImage: true },
    { id: 'wincan', icon: wincanIcon, label: "WinCan", group: "eng", isImage: true },
    { id: 'c3d', icon: c3dIcon, label: "Civil 3D", group: "eng", isImage: true },
    { id: 'i360', icon: i360Icon, label: "Infraworks", group: "eng", isImage: true }, // Moved to Eng group
    { id: 'flow', icon: flowMonIcon, label: "Flow Monitoring", group: "eng", isImage: true },
    { id: 'hyd', icon: hydrantIcon, label: "Hydrant Testing", group: "eng", isImage: true },
];

const Hexagon = ({ icon: IconOrImage, id, label, delay, isImage, group, activeGroup, setActiveGroup, lockedGroup, setLockedGroup, activeTileId, setActiveTileId }) => {
    const isHoveredGroup = activeGroup === group;
    const isDimmed = activeGroup && activeGroup !== group;
    const showActiveTooltip = activeTileId === id;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: delay * 0.03, type: "spring" }}
            viewport={{ once: true, margin: "-50px" }}
            // Increased size for mobile from w-20/h-24 to w-24/h-28
            className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-28 md:h-32 flex-shrink-0 group cursor-pointer"
            onMouseEnter={() => setActiveGroup(group)}
            onClick={(e) => {
                e.stopPropagation();
                // Toggle group active on click for mobile
                if (lockedGroup === group && activeTileId === id) {
                    setLockedGroup(null);
                    setActiveGroup(null);
                    setActiveTileId(null);
                } else {
                    setLockedGroup(group);
                    setActiveGroup(group);
                    setActiveTileId(id);
                }
            }}
        >
            <div
                className="absolute inset-0 w-full h-full transition-all duration-300"
                style={{
                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
            >
                <div className={`w-full h-full transition-all duration-300 flex items-center justify-center relative
            ${isHoveredGroup
                        ? 'bg-indigo-500/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]'
                        : 'bg-slate-100/10 dark:bg-slate-900/40 backdrop-blur-md'}
        `}>

                    {isImage ? (
                        <img
                            src={IconOrImage.src || IconOrImage}
                            alt={label}
                            className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain transition-all duration-300
                 ${isHoveredGroup || activeGroup === group ? 'scale-110 grayscale-0 opacity-100' : ''}
                 ${isDimmed ? 'scale-90 grayscale opacity-40' : ''}
                 ${!activeGroup ? 'opacity-90 dark:brightness-110' : ''}
               `}
                        />
                    ) : (
                        <IconOrImage size={32}
                            className={`transition-all duration-300 w-6 h-6 sm:w-8 sm:h-8 md:w-8 md:h-8
                 ${isHoveredGroup ? 'text-indigo-400 scale-110' : ''}
                 ${isDimmed ? 'text-slate-600 dark:text-slate-600 scale-90' : ''}
                 ${!activeGroup ? 'text-slate-700 dark:text-slate-200' : ''}
                `}
                            strokeWidth={1.5}
                        />
                    )}
                </div>
            </div>

            <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 transition-opacity duration-300 z-50 pointer-events-none translate-y-2 group-hover:translate-y-0
                ${showActiveTooltip ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
                <div className="bg-slate-900/95 text-white text-[10px] md:text-sm py-1 px-2 rounded backdrop-blur-sm whitespace-nowrap shadow-xl border border-slate-700 font-mono tracking-tight">
                    {label}
                </div>
            </div>
        </motion.div>
    );
};

export default function HexGridSection() {
    const [activeGroup, setActiveGroup] = useState(null);
    const [lockedGroup, setLockedGroup] = useState(null);
    const [activeTileId, setActiveTileId] = useState(null);
    const sectionRef = useRef(null);

    useEffect(() => {
        const sectionNode = sectionRef.current;
        if (!sectionNode) {
            return undefined;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) {
                    setActiveGroup(null);
                    setLockedGroup(null);
                    setActiveTileId(null);
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(sectionNode);

        return () => {
            observer.disconnect();
        };
    }, []);

    const chunks = [];
    let i = 0;
    let rowPattern = [6, 5, 6, 5, 6, 5, 6, 5, 6, 5];
    let pIndex = 0;

    while (i < icons.length) {
        const size = rowPattern[pIndex % rowPattern.length];
        chunks.push(icons.slice(i, i + size));
        i += size;
        pIndex++;
    }

    return (
        <section ref={sectionRef} className="py-8 md:py-24 relative z-10 w-full overflow-hidden">
            <div className="container mx-auto px-2 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-wider uppercase"
                >
                    Technical Toolkit
                </motion.h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6 md:mb-12 max-w-xl mx-auto">
                    Set of tools, platforms, and technologies.
                </p>

                <div
                    className="flex flex-col items-center justify-center w-full max-w-6xl mx-auto select-none"
                    onMouseLeave={() => {
                        setActiveGroup(lockedGroup);
                        if (!lockedGroup) {
                            setActiveTileId(null);
                        }
                    }}
                >
                    {chunks.map((rowIcons, rowIndex) => (
                        <div
                            key={rowIndex}
                            // Adjusted margins to relax vertical overlap slightly
                            className={`flex justify-center gap-1 sm:gap-2 md:gap-3 z-10 ${rowIndex > 0 ? '-mt-3 sm:-mt-5 md:-mt-6' : ''}`}
                            // Flipping Z-index: classic "stacking down" feel where lower rows might overlap upper ones?
                            // Or keep top on top? User said "bottom row overlapping above row".
                            // If bottom overlaps above, that means bottom is ON TOP.
                            // If that was the COMPLAINT ("overlapping the above row"), then currently top is on top.
                            // ... Wait, if the user complained "bottom row overlapping above row", they might mean "Bottom row is cutting into the top row".
                            // If I originally had Top on Top (50-index), then Top cuts into Bottom.
                            // If user thinks Bottom cuts into Top, maybe my z-index was wrong?
                            // Let's stick with 50-index (Top on Top) but relax margins so the cut isn't as deep.
                            style={{ position: 'relative', zIndex: 10 + rowIndex }}
                        >
                            {rowIcons.map((icon, iconIndex) => (
                                <Hexagon
                                    key={icon.id}
                                    {...icon}
                                    delay={rowIndex * 2 + iconIndex}
                                    activeGroup={activeGroup}
                                    setActiveGroup={setActiveGroup}
                                    lockedGroup={lockedGroup}
                                    setLockedGroup={setLockedGroup}
                                    activeTileId={activeTileId}
                                    setActiveTileId={setActiveTileId}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Group Label - Below grid on mobile, fixed on desktop */}
                <div className={`mt-6 flex justify-center md:hidden transition-all duration-300 transform ${activeGroup ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                    <div className="bg-slate-900/90 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md font-mono text-sm font-bold tracking-widest uppercase flex items-center gap-3">
                        <span className="block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        {activeGroup === 'hh' && "Hydrology & Hydraulics"}
                        {activeGroup === 'gis' && "Geographic Information Systems"}
                        {activeGroup === 'coding' && "Development & Automation"}
                        {activeGroup === 'eng' && "Engineering & Visuualization"}
                    </div>
                </div>
                <div className={`fixed bottom-8 right-8 z-50 hidden md:flex transition-all duration-300 transform ${activeGroup ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
                    <div className="bg-slate-900/90 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md font-mono text-sm md:text-base font-bold tracking-widest uppercase flex items-center gap-3">
                        <span className="block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        {activeGroup === 'hh' && "Hydrology & Hydraulics"}
                        {activeGroup === 'gis' && "Geographic Information Systems"}
                        {activeGroup === 'coding' && "Development & Automation"}
                        {activeGroup === 'eng' && "Engineering & Visuualization"}
                    </div>
                </div>

            </div>
        </section>
    );
}
