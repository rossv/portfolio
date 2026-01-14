import { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'H&H Modeling', A: 1670, fullMark: 2000 },
  { subject: 'GIS / Mapping', A: 1190, fullMark: 2000 },
  { subject: 'Python / Coding', A: 800, fullMark: 2000 },
  { subject: 'Design/Drafting', A: 522, fullMark: 2000 },
  { subject: 'Data Science', A: 600, fullMark: 2000 },
];

export default function SkillsRadar({ className = "" }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={`bg-white/10 dark:bg-slate-950/80 backdrop-blur-md p-2 sm:p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 relative group hover:border-indigo-500 transition-colors duration-500 w-full max-w-2xl mx-auto aspect-square flex flex-col justify-center ${className}`}>

      {/* Decorative HUD corners */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-indigo-500 rounded-tl-lg"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-indigo-500 rounded-tr-lg"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-indigo-500 rounded-bl-lg"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-indigo-500 rounded-br-lg"></div>

      <h3 className="text-slate-800 dark:text-white text-center font-bold mb-2 font-mono tracking-widest uppercase text-lg">Expertise Profile <span className="text-sm text-slate-500">(Hrs)</span></h3>

      <div className="w-full h-full relative z-10 min-h-[250px] [&_:focus]:outline-none" style={{ WebkitTapHighlightColor: 'transparent' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "55%" : "70%"} data={data}>
            <PolarGrid stroke="#64748b" strokeOpacity={0.2} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 10 : 14, fontFamily: 'monospace', fontWeight: 'bold' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 2000]} tick={false} axisLine={false} />
            <Radar
              name="Ross"
              dataKey="A"
              stroke="#6366f1" // indigo-500
              strokeWidth={2}
              fill="#6366f1"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 bg-indigo-500/5 rounded-2xl -z-10 blur-xl group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
    </div>
  );
}
