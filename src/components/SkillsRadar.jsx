import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

const data = [
  { subject: 'H&H Modeling', A: 1670, fullMark: 2000 },
  { subject: 'GIS / Mapping', A: 1190, fullMark: 2000 },
  { subject: 'Python / Coding', A: 800, fullMark: 2000 }, // Scaled for visual impact
  { subject: 'Design/Drafting', A: 522, fullMark: 2000 },
  { subject: 'Data Science', A: 600, fullMark: 2000 },
];

export default function SkillsRadar() {
  return (
    <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-700">
      <h3 className="text-white text-center font-bold mb-4">Expertise Profile (Hours Logged)</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#475569" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Radar
              name="Ross"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
