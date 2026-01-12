import { motion } from 'framer-motion';

const careerData = [
    {
        title: "Professional Engineer",
        company: "Wade Trim",
        year: "2021 - Present",
        description: "Leading Hydrologic & Hydraulic modeling for large utilities. Developing innovative tools under the Office of Applied Technology and leading GIS Community of Practice."
    },
    {
        title: "Senior Project Engineer",
        company: "KLH Engineers",
        year: "2016-2021",
        description: "Principle engineer for H&H modeling, flow monitoring plans, and GIS asset management. Modernized company software and methods for efficiency."
    },
    {
        title: "Project Consultant",
        company: "Civil & Environmental Consultants",
        year: "2015-2016",
        description: "Civil/Site development including grading, utilities, and stormwater design. Facilitated regulatory submissions (NPDES, HOP, PCSM)."
    },
    {
        title: "Project Engineer",
        company: "KLH Engineers",
        year: "2012-2015",
        description: "Experience in water, wastewater, and stormwater from site-scale to system-wide. Developed flow monitoring plans and performed data QA/QC."
    },
    {
        title: "Research Assistant",
        company: "University of Pittsburgh",
        year: "2010-2012",
        description: "Conducted research for the Earth Processes & Environmental Flows Group. Comparison and Analysis of Hydrodynamic Models for Restoration Projects."
    },
    {
        title: "Intern",
        company: "National Energy Technology Laboratory (U.S. DOE)",
        year: "2009 - 2010",
        description: "Conducted methane gas surveys in the Allegheny National Forest. Used GIS to process and visualize air quality data sets. Assembled and integrated a $200,000 visualization lab."
    }
];

export default function CareerTimeline() {
    return (
        <div className="max-w-4xl mx-auto py-20 px-6 font-sans">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-16 uppercase tracking-tight"
            >
                Professional Journey
            </motion.h2>

            <div className="relative text-left">
                {/* Vertical Line Container */}
                <div className="absolute left-[39px] md:left-[49px] top-4 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800">
                    <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: "100%" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="w-full bg-indigo-500 absolute top-0"
                    />
                </div>

                {careerData.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: index * 0.3 }}
                        className="mb-12 ml-6 md:ml-10 relative pl-12 md:pl-16 group"
                    >
                        {/* Node Dot */}
                        <div className="absolute left-[26px] md:left-[36px] top-6 w-7 h-7 -ml-3.5 z-10 flex items-center justify-center">
                            <span className="w-3 h-3 bg-indigo-600 rounded-full group-hover:scale-150 transition-transform duration-300"></span>
                            <span className="absolute w-full h-full border-2 border-indigo-600 rounded-full animate-ping opacity-20"></span>
                        </div>

                        {/* Card */}
                        <div className="bg-white/80 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 p-6 rounded-2xl shadow-lg hover:shadow-xl hover:translate-x-1 transition-all duration-300">
                            <span className="inline-block px-3 py-1 mb-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 rounded-full font-mono tracking-widest">{item.year}</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">{item.title}</h3>
                            <p className="text-indigo-600 dark:text-indigo-400 font-bold mb-3">{item.company}</p>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-mono text-sm">{item.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
