import { useState, useEffect, useRef } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const data = [
  {
    subject: 'H&H Modeling',
    A: 1670,
    fullMark: 2000,
    details: ['Combined & Sanitary Systems', 'Storm Systems', 'Water Distribution', 'Open Channel']
  },
  {
    subject: 'GIS',
    A: 1450,
    fullMark: 2000,
    details: ['Mapping', 'Data Analysis', 'Applications & Dashboards', 'Data Collection']
  },
  {
    subject: 'Coding',
    A: 1300,
    fullMark: 2000,
    details: ['Scripting', 'App Development', 'Automation', 'Integration']
  },
  {
    subject: 'Design',
    A: 750,
    fullMark: 2000,
    details: ['Hydraulic Structures', 'Conveyance', 'Stormwater', 'Site Development']
  },
  {
    subject: 'Data Science',
    A: 600,
    fullMark: 2000,
    details: ['Tool Development', 'Python', 'Large Data']
  },
];

export default function SkillsRadar({ className = "" }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(pointer: coarse)').matches
      );
    };

    checkMobile();
    checkTouch();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isTouchMode = isTouch || isMobile;

  const handleSkillSelect = (skill, event) => {
    if (event) {
      event.stopPropagation();
    }
    setHoveredSkill((prev) => (prev?.subject === skill.subject ? null : skill));
  };

  const handleSkillClear = () => {
    setHoveredSkill(null);
  };

  const handleContainerClick = (event) => {
    if (overlayRef.current && overlayRef.current.contains(event.target)) {
      return;
    }
    handleSkillClear();
  };

  // Custom Tick Component for interactivity
  const CustomTick = ({ payload, x, y, textAnchor, stroke, radius }) => {
    const skill = data.find(d => d.subject === payload.value);
    return (
      <g
        className="cursor-pointer group"
        onMouseEnter={isTouchMode ? undefined : () => setHoveredSkill(skill)}
        onMouseLeave={isTouchMode ? undefined : () => setHoveredSkill(null)}
        onClick={isTouchMode ? (event) => handleSkillSelect(skill, event) : undefined}
        style={{ pointerEvents: 'all' }} // Force pointer events
      >
        {/* Invisible hit area to make hovering easier */}
        <rect
          x={x - 40}
          y={y - 15}
          width={80}
          height={30}
          fill="transparent"
          className="z-50"
        />
        <text
          radius={radius}
          stroke={stroke}
          x={x}
          y={y}
          className="fill-slate-400 group-hover:fill-indigo-400 dark:group-hover:fill-indigo-300 transition-colors duration-300 select-none"
          textAnchor={textAnchor}
          style={{
            fontSize: isMobile ? 10 : 12,
            fontFamily: 'monospace',
            fontWeight: 'bold',
          }}
        >
          <tspan x={x} dy="0em">
            {payload.value}
          </tspan>
        </text>
      </g>
    );
  };

  return (
    <div className={`bg-white/10 dark:bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 relative group hover:border-indigo-500 transition-colors duration-500 w-full max-w-2xl mx-auto aspect-auto sm:aspect-square flex flex-col justify-center ${className}`}>

      {/* Decorative HUD corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-500 rounded-br-lg"></div>

      <h3 className="text-slate-800 dark:text-white text-center font-bold mb-3 sm:mb-2 font-mono tracking-widest uppercase text-base sm:text-lg leading-snug">
        Expertise Profile <span className="block sm:inline text-xs sm:text-sm text-slate-500">(Hrs)</span>
      </h3>

      <div
        className="w-full h-[320px] sm:h-full relative z-10 min-h-[250px] [&_:focus]:outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
        onClick={handleContainerClick}
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "55%" : "65%"} data={data}>
            <PolarGrid stroke="#64748b" strokeOpacity={0.2} />
            <PolarAngleAxis
              dataKey="subject"
              tick={<CustomTick />}
            />
            <PolarRadiusAxis angle={30} domain={[0, 2000]} tick={false} axisLine={false} />
            <Radar
              name="Ross"
              dataKey="A"
              stroke="#6366f1" // indigo-500
              strokeWidth={2}
              fill="#6366f1"
              fillOpacity={0.3}
              dot={(props) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={24}
                    fill="transparent"
                    stroke="transparent"
                    className="cursor-pointer"
                    onMouseEnter={isTouchMode ? undefined : () => setHoveredSkill(payload)}
                    onMouseLeave={isTouchMode ? undefined : () => setHoveredSkill(null)}
                    onClick={isTouchMode ? (event) => handleSkillSelect(payload, event) : undefined}
                  />
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Hover Details Overlay */}
        <AnimatePresence>
          {hoveredSkill && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.2 }}
              className={
                isTouchMode
                  ? 'relative mt-4 pointer-events-auto flex justify-center z-20'
                  : 'absolute inset-0 pointer-events-none flex items-center justify-center z-20'
              }
            >
              <div
                ref={overlayRef}
                className={
                  isTouchMode
                    ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-indigo-500/30 shadow-2xl w-full max-w-[260px] text-center pointer-events-auto'
                    : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-xl border border-indigo-500/30 shadow-2xl max-w-[200px] text-center pointer-events-auto'
                }
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="absolute top-2 right-2 text-slate-500 hover:text-indigo-500 transition-colors text-xs font-mono"
                  onClick={handleSkillClear}
                >
                  Close
                </button>
                <h4 className="text-indigo-600 dark:text-indigo-400 font-bold mb-2 font-mono text-sm border-b border-indigo-500/20 pb-1">
                  {hoveredSkill.subject}
                </h4>
                <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  {hoveredSkill.details.map((item, idx) => (
                    <li key={idx} className="leading-tight">{item}</li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl -z-10 blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
    </div>
  );
}
