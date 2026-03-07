import { motion } from 'framer-motion';

import wetWeatherLeadImg from '../assets/projects/pwsa-wet-weather-program-manager.webp';
import gisTechnicalLeadImg from '../assets/recognition/recognition-gis-technical-lead.webp';
import optimizationDataScienceImg from '../assets/recognition/recognition-optimization-data-science.webp';
import sewersFutureImg from '../assets/recognition/recognition-sewers-future.webp';
import aiTaskForceImg from '../assets/recognition/recognition-ai-task-force.webp';
import leadershipAcademyImg from '../assets/recognition/recognition-leadership-academy.webp';

const leadershipRoles = [
  {
    title: 'Hydraulic Modeling Task Lead',
    context: 'Pittsburgh Water Wet Weather Program',
    timeframe: 'Current Role',
    details:
      'Lead hydraulic modeling strategy, technical review, and delivery coordination for one of Pittsburgh\'s most complex wet-weather initiatives.',
    image: wetWeatherLeadImg,
    emphasis: 'Project Leadership',
  },
  {
    title: 'Supervisor',
    context: 'Wade Trim',
    timeframe: 'Current Role',
    details: 'Mentor staff, guide technical growth, and support team performance through project delivery and career development.',
    image: leadershipAcademyImg,
    emphasis: 'People Leadership',
  },
  {
    title: 'GIS Technical Lead',
    context: 'Advanced Design Practice',
    timeframe: 'Since 2022',
    details: 'Set GIS direction, standards, and implementation support across projects and teams.',
    image: gisTechnicalLeadImg,
    emphasis: 'Technical Leadership',
  },
  {
    title: 'Optimization & Data Science Lead',
    context: 'Office of Applied Technology',
    timeframe: 'Since 2024',
    details: 'Drive automation, optimization workflows, and data-informed engineering decisions.',
    image: optimizationDataScienceImg,
    emphasis: 'Innovation Leadership',
  },
  {
    title: 'Sewers of the Future Lead',
    context: 'Wet Weather Practice',
    timeframe: 'Since 2024',
    details: 'Advance strategy and technical pilots that modernize sewer system planning and operations.',
    image: sewersFutureImg,
    emphasis: 'Strategic Leadership',
  },
  {
    title: 'AI Task Force Member',
    context: 'Wade Trim',
    timeframe: 'Since 2023',
    details: 'Support responsible adoption of AI tools and practical use cases for engineering teams.',
    image: aiTaskForceImg,
    emphasis: 'Emerging Technology',
  },
];

export default function LeadershipHighlights() {
  const [featuredRole, ...supportingRoles] = leadershipRoles;

  return (
    <section id="leadership" className="section-shell section-shell--alt relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[420px] h-[420px] rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[520px] h-[520px] rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
            Leadership Roles
          </h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-lg">
            Key project, people, and innovation leadership responsibilities across wet weather, GIS, optimization, and AI initiatives.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl overflow-hidden border border-slate-200/70 dark:border-slate-700/60 bg-slate-900 text-white relative min-h-[360px]"
          >
            <img
              src={featuredRole.image.src || featuredRole.image}
              alt={`${featuredRole.title} visual`}
              className="absolute inset-0 w-full h-full object-cover opacity-45"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-900/75 to-indigo-900/40" />
            <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-end gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">{featuredRole.emphasis}</span>
              <h3 className="text-3xl md:text-4xl font-extrabold leading-tight">{featuredRole.title}</h3>
              <p className="text-cyan-100 font-semibold">{featuredRole.context}</p>
              <p className="text-slate-200 max-w-2xl">{featuredRole.details}</p>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300">{featuredRole.timeframe}</span>
            </div>
          </motion.article>

          <div className="space-y-4">
            {supportingRoles.map((role, index) => (
              <motion.article
                key={role.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl p-4 md:p-5 border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={role.image.src || role.image} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300 mb-1">{role.emphasis}</p>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-tight">{role.title}</h4>
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{role.context}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{role.details}</p>
                  <p className="text-[10px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-500 mt-2">{role.timeframe}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
