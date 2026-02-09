import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Map, { Marker } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

import wadeTrimLogo from '../assets/logos/wade-trim.png';
import klhLogo from '../assets/logos/klh.png';
import cecLogo from '../assets/logos/cec.png';
import pittLogo from '../assets/logos/pitt.png';
import netlLogo from '../assets/logos/netl.png';

const careerData = [
    {
        id: 'wade-trim',
        title: "Professional Engineer",
        company: "Wade Trim",
        logo: wadeTrimLogo,
        year: "April 2021 – Present",
        location: "Pittsburgh, PA",
        fullAddress: "444 Liberty Avenue, Suite 300, Pittsburgh, PA 15222",
        coords: [-80.00485997060412, 40.44081394317524], // Approx coords for address
        description: "Leading Hydrologic & Hydraulic modeling projects for large utilities. Developing innovative tools under the Office of Applied Technology and leading technical groups for Advanced Design Technology and Wet Weather Practices.",
        details: [
            "Conduct Hydrologic and Hydraulic modeling for large utilities in multiple metro areas.",
            "Plan and manage flow monitoring program comprised of 130 flow monitors.",
            "Collaborate with staff and consultants to build tools under the Office of Applied Technology.",
            "Establish and lead new GIS Community of Practice to promote and implement the latest technology.",
            "Develop time-saving scripting tools and applications for use company-wide.",
            "Supervise, instruct and develop staff."
        ],
        highlights: [
            "2024 Innovator of the Year 🏆",
            "GIS Tech Lead",
            "Optimization & Data Science Lead",
            "Sewers of the Future Lead",
            "Leadership Academy Alumni",
            "Supervisor"
        ],
        color: "#43b02a"
    },
    {
        id: 'klh-senior',
        title: "Senior Project Engineer",
        company: "KLH Engineers",
        logo: klhLogo,
        year: "May 2016 – March 2021",
        location: "Pittsburgh, PA",
        fullAddress: "5173 Campbell's Run Road, Pittsburgh, PA 15205",
        coords: [-80.15526074663305, 40.44078119201674],
        description: "Principal engineer for H&H modeling, flow monitoring plans, and GIS systems. Modernized company software and methods for efficiency.",
        details: [
            "Principal engineer for developing, updating, and maintaining H&H models.",
            "Develop flow monitoring plans and perform flow data QA/QC and calibration.",
            "Develop and maintain asset management for clients utilizing latest GIS tools.",
            "Manage all GIS systems and staff.",
            "Manage IT infrastructure and technology, deploy new services and business processes.",
            "MS4 program management and permitting including PRPs.",
            "3D modeling and rendering for business development and presentations."
        ],
        highlights: [
            "GIS Manager",
            "IT Coordinator",
            "Principal Modeler",
            "Two-time Employee of the Month"
        ],
        color: "#496980"
    },
    {
        id: 'cec',
        title: "Project Consultant",
        company: "Civil & Environmental Consultants",
        logo: cecLogo,
        year: "Jan 2015 - Apr 2016",
        location: "Pittsburgh, PA",
        fullAddress: "333 Baldwin Road, Pittsburgh, PA 15205",
        coords: [-80.10060670990161, 40.424593291706955],
        description: "Civil/Site development including grading, utilities, and stormwater design. Facilitated regulatory submissions (NPDES, HOP, PCSM). Provided new tools and workflows to improve efficiencies.",
        details: [
            "Prepare land development plans in C3D including layout, grading, utilities, and E&S controls.",
            "Stormwater design and modeling using HydroCAD and Hydraflow.",
            "Facilitate timely regulatory submissions (SFPM, HOP, PCSM, NPDES).",
            "Collaborate with leadership to conceptualize innovative tools and workflows."
        ],
        highlights: [
            "Built first Concept of a Site Intelligence and Project Digital Delivery tool that evolved to CEC Go!"
        ],
        color: "#fcb900"
    },
    {
        id: 'klh-project',
        title: "Project Engineer",
        company: "KLH Engineers",
        logo: klhLogo,
        year: "Dec 2012 – Jan 2015",
        location: "Pittsburgh, PA",
        fullAddress: "5173 Campbell's Run Road, Pittsburgh, PA 15205",
        coords: [-80.15526074663305, 40.44078119201674],
        description: "Experience in water, wastewater, and stormwater from site-scale to system-wide. NPDES and other permitting for construction.",
        details: [
            "Provide H&H modeling for municipal systems to support design and long-term planning and permitting.",
            "NPDES and other permitting for construction including stormwater and E&S design.",
            "Modernized company software and methods for efficiency and quality.",
            "Automate routine GIS and engineering tasks with Python and other scripting tools."
        ],
        highlights: [
            "Became lead modeler",
            "Built company's first internal intranet"
        ],
        color: "#496980"
    },
    {
        id: 'pitt',
        title: "Research Assistant",
        company: "University of Pittsburgh",
        logo: pittLogo,
        year: "May 2010 – Dec 2012",
        location: "Pittsburgh, PA",
        fullAddress: "University of Pittsburgh, Pittsburgh, PA",
        coords: [-79.95863716325252, 40.44363087984247],
        description: "Conducted research for the Earth Processes & Environmental Flows Group. Comparison and Analysis of Hydrodynamic Models for Restoration Projects.",
        details: [
            "Research under Dr. Jorge D. Abad, Earth Processes & Environmental Flows Group.",
            "Built and maintained hydraulics lab including construction of physical flumes for hydraulic and sediment analysis."
        ],
        color: "#083b97"
    },
    {
        id: 'pitt-ms',
        title: "M.S. Civil & Environmental Engineering",
        company: "University of Pittsburgh",
        logo: pittLogo,
        year: "2011 – 2012",
        location: "Pittsburgh, PA",
        fullAddress: "University of Pittsburgh, Pittsburgh, PA",
        coords: [-79.95863716325252, 40.44363087984247],
        description: "Master of Science in Civil & Environmental Engineering.",
        details: [
            "Specialization in environmental engineering and water resources.",
            "Concurrent research with the Earth Processes & Environmental Flows Group.",
            "Comparison and Analysis of Hydrodynamic Models for Restoration Projects: The Case of Pool-Riffle Structures."
        ],
        color: "#083b97"
    },
    {
        id: 'netl',
        title: "Intern",
        company: "National Energy Technology Laboratory (U.S. DOE)",
        logo: netlLogo,
        year: "2009 – 2010",
        location: "Pittsburgh, PA",
        fullAddress: "626 Cochrans Mill Rd, Pittsburgh, PA 15236",
        coords: [-79.9780268797734, 40.30597821094191], // NETL Pittsburgh
        description: "Conducted methane gas surveys in the Allegheny National Forest. Used GIS to process and visualize air quality data sets.",
        details: [
            "Conducted methane gas surveys in the Allegheny National Forest.",
            "Used GIS to process and visualize air quality data sets.",
            "Assembled and integrated a $200,000 visualization lab."
        ],
        color: "#3e3e3e"
    },
    {
        id: 'pitt-bs',
        title: "B.S. Civil & Environmental Engineering",
        company: "University of Pittsburgh",
        logo: pittLogo,
        year: "2007 – 2011",
        location: "Pittsburgh, PA",
        fullAddress: "University of Pittsburgh, Pittsburgh, PA",
        coords: [-79.95863716325252, 40.44363087984247],
        description: "Bachelor of Science in Civil & Environmental Engineering.",
        details: [
            "Foundation in civil and environmental engineering principles.",
            "Focus on fluid mechanics, hydraulics, and environmental systems.",
            "Certificate in Sustainability."
        ],
        color: "#083b97"
    }
];

const JobDetails = ({ job, mapRef, mapToken }) => {
    const hasMapToken = Boolean(mapToken);

    return (
        <div className="flex flex-col h-full bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl overflow-hidden shadow-sm border border-white/30 dark:border-slate-700/60">
        {/* Map Header */}
        <div className="h-64 md:h-80 w-full relative z-0 shrink-0">
            {hasMapToken ? (
                <Map
                    ref={mapRef}
                    initialViewState={{
                        longitude: job.coords[0],
                        latitude: job.coords[1],
                        zoom: 14,
                        pitch: 45
                    }}
                    mapStyle="mapbox://styles/mapbox/dark-v11"
                    mapboxAccessToken={mapToken}
                    attributionControl={false}
                    scrollZoom={false}
                >
                    <Marker
                        longitude={job.coords[0]}
                        latitude={job.coords[1]}
                        anchor="bottom"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-4 border-white shadow-xl z-20 relative flex items-center justify-center bg-white overflow-hidden p-1">
                                <img src={job.logo.src || job.logo} alt="marker" className="w-full h-full object-contain" />
                            </div>
                            <div className="absolute -inset-4 rounded-full animate-ping opacity-30" style={{ backgroundColor: job.color }}></div>
                            {/* Pin Stand */}
                            <div className="w-1 h-4 bg-white/80 absolute left-1/2 -bottom-3 -translate-x-1/2 rounded-full" />
                        </div>
                    </Marker>
                </Map>
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-slate-100/80 dark:bg-slate-900/70">
                    <div className="mx-6 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 px-6 py-8 text-center shadow-sm backdrop-blur">
                        <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
                            Map unavailable
                        </p>
                        <p className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">
                            {job.location}
                        </p>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            {job.fullAddress}
                        </p>
                    </div>
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white/40 dark:from-slate-900/60 via-transparent to-transparent h-full z-10" />

            <div className="absolute bottom-4 left-6 z-20 pr-4">
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm">{job.company}</h3>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs md:text-sm font-bold bg-white/80 dark:bg-black/50 backdrop-blur px-3 py-1 rounded-full w-fit mt-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="truncate max-w-[200px] md:max-w-none">{job.fullAddress}</span>
                </div>
            </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar">
            <div className="mb-6">
                <h4 className="text-xs md:text-sm uppercase tracking-wider font-bold mb-2 transition-colors duration-300" style={{ color: job.color }}>Role Overview</h4>
                <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {job.description}
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                    <h4 className="text-xs md:text-sm uppercase tracking-wider font-bold mb-3 transition-colors duration-300" style={{ color: job.color }}>Key Achievements & Responsibilities</h4>
                    <ul className="space-y-3">
                        {job.details.map((point, i) => (
                            <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base group/item">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 group-hover/item:bg-indigo-500" style={{ backgroundColor: job.color }}></span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {job.highlights && (
                    <div className="md:w-1/3 shrink-0">
                        <h4 className="text-xs md:text-sm uppercase tracking-wider font-bold mb-3 transition-colors duration-300" style={{ color: job.color }}>Roles & Highlights</h4>
                        <ul className="space-y-3">
                            {job.highlights.map((highlight, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 opacity-60" style={{ backgroundColor: job.color }}></span>
                                    <span>{highlight}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default function CareerTimeline() {
    const [selectedJob, setSelectedJob] = useState(careerData[0]);
    const mapRef = useRef(null);

    const handleJobClick = (job) => {
        setSelectedJob(job);
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('job-open', { detail: { id: job.id, total: careerData.length } }));
        }
    };

    // Update map view when selection changes
    useEffect(() => {
        if (mapRef.current && selectedJob) {
            mapRef.current.flyTo({
                center: selectedJob.coords,
                zoom: 14,
                pitch: 45,
                duration: 2000
            });
        }
    }, [selectedJob]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('job-open', { detail: { id: selectedJob.id, total: careerData.length } })
            );
        }
    }, []);



    return (
        <div className="w-full py-20 px-6 font-sans">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-20 uppercase tracking-tight"
            >
                Professional Journey
            </motion.h2>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Column: Timeline List */}
                <div className="lg:w-1/2 relative pr-4 lg:max-h-full h-auto">
                    <div className="space-y-6 lg:space-y-12 pb-12">
                        {careerData.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleJobClick(item)}
                                    aria-pressed={selectedJob.id === item.id}
                                    className={`
                                        relative cursor-pointer group transition-all duration-300 mb-4
                                        w-full text-left
                                        ${selectedJob.id === item.id ? 'opacity-100 scale-[1.01]' : 'opacity-70 hover:opacity-100'}
                                    `}
                                >
                                    {/* Card */}
                                    <div
                                        className={`
                                        p-6 rounded-2xl border transition-all duration-300 border-l-4 shadow-sm relative overflow-hidden
                                        ${selectedJob.id === item.id
                                                ? 'bg-white/70 dark:bg-slate-900/70 shadow-xl border-white/40 dark:border-slate-700/70 lg:translate-x-2'
                                                : 'bg-white/30 dark:bg-slate-900/40 border-transparent hover:bg-white/60 hover:dark:bg-slate-900/60 hover:shadow-md'
                                            }
                                    `}
                                        style={{ borderLeftColor: item.color }}
                                    >
                                        <div className="flex justify-between items-center gap-4">
                                            <div className="flex-1">
                                                <span className="inline-block px-3 py-1 mb-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 rounded-full font-mono tracking-widest">
                                                    {item.year}
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">{item.title}</h3>
                                                <p className="font-bold text-base mt-2" style={{ color: item.color }}>{item.company}</p>
                                            </div>
                                            <div className="w-28 h-20 hidden md:flex bg-slate-100 dark:bg-slate-300 p-2 rounded-xl items-center justify-center shrink-0 ml-4 shadow-sm border border-slate-200 dark:border-slate-500">
                                                <img
                                                    src={item.logo.src || item.logo}
                                                    alt={item.company}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                            <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-300 p-2 flex md:hidden items-center justify-center shadow-sm shrink-0 border border-slate-200 dark:border-slate-500">
                                                <img
                                                    src={item.logo.src || item.logo}
                                                    alt={item.company}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </button>

                                {/* Mobile/Tablet Details (Accordion style) */}
                                <div className="lg:!hidden">
                                    <AnimatePresence>
                                        {selectedJob.id === item.id && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden rounded-3xl mt-4 mb-8 border border-slate-200 dark:border-slate-800 shadow-lg"
                                            >
                                                <JobDetails job={selectedJob} mapRef={mapRef} mapToken={MAPBOX_TOKEN} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Sticky Details Panel (Desktop) */}
                <div className="hidden lg:block lg:w-1/2 relative h-auto">
                    <div
                        className="sticky top-24 h-fit bg-white/40 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border-2 overflow-hidden shadow-2xl flex flex-col transition-colors duration-300"
                        style={{ borderColor: selectedJob.color }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedJob.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                <JobDetails job={selectedJob} mapRef={mapRef} mapToken={MAPBOX_TOKEN} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
