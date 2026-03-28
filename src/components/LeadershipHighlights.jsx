import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Award } from 'lucide-react';

import wetWeatherLeadImg from '../assets/projects/pwsa-wet-weather-program-manager.webp';
import stPeteLosImg from '../assets/projects/stpete_LOS.webp';
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
    periods: [{ start: '2024-01', end: null, label: 'Since Jan 2024' }],
    details:
      "Lead hydraulic modeling strategy, technical review, and delivery coordination for one of Pittsburgh's most complex wet-weather initiatives.",
    image: wetWeatherLeadImg,
    emphasis: 'Project Leadership',
    group: 'Notable Project and Program Leads',
  },
  {
    title: 'St. Pete LOS Project Lead',
    context: 'City of St. Petersburg, FL',
    timeframe: 'Since Aug 2025',
    periods: [{ start: '2025-08', end: null, label: 'Since Aug 2025' }],
    details:
      'Lead level-of-service and resiliency analysis initiatives for municipal water systems, including optimization-focused technical delivery.',
    image: stPeteLosImg,
    emphasis: 'Project Leadership',
    group: 'Notable Project and Program Leads',
  },
  {
    title: 'Lead Modeler',
    context: 'KLH Engineers',
    timeframe: '2012 – 2021',
    periods: [{ start: '2012-12', end: '2021-03', label: '2012 – 2021' }],
    details:
      'Served as the go-to engineer for all H&H modeling. Directed modeling strategy, QA, and delivery for municipal systems across multiple clients.',
    image: wetWeatherLeadImg,
    emphasis: 'Technical Leadership',
    group: 'Formal Roles',
  },
  {
    title: 'GIS Technical Lead',
    context: 'Advanced Design Practice',
    timeframe: 'Since Dec 2022',
    periods: [{ start: '2022-12', end: null, label: 'Since Dec 2022' }],
    details: 'Set GIS direction, standards, and implementation support across projects and teams.',
    image: gisTechnicalLeadImg,
    emphasis: 'Formal Role',
    group: 'Formal Roles',
  },
  {
    title: 'Optimization & Data Science Lead',
    context: 'Office of Applied Technology',
    timeframe: 'Since Jun 2024',
    periods: [{ start: '2024-06', end: null, label: 'Since Jun 2024' }],
    details: 'Drive automation, optimization workflows, and data-informed engineering decisions.',
    image: optimizationDataScienceImg,
    emphasis: 'Formal Role',
    group: 'Formal Roles',
  },
  {
    title: 'Sewers of the Future Lead',
    context: 'Wet Weather Practice',
    timeframe: 'Since Jun 2024',
    periods: [{ start: '2024-06', end: null, label: 'Since Jun 2024' }],
    details: 'Advance strategy and technical pilots that modernize sewer system planning and operations.',
    image: sewersFutureImg,
    emphasis: 'Formal Role',
    group: 'Formal Roles',
  },
  {
    title: 'GIS Manager',
    context: 'KLH Engineers',
    timeframe: '2016 – 2021',
    periods: [{ start: '2016-05', end: '2021-03', label: '2016 – 2021' }],
    details:
      'Managed all GIS systems and staff. Drove adoption of modern tools and maintained spatial asset management for municipal clients.',
    image: gisTechnicalLeadImg,
    emphasis: 'Technical & People Leadership',
    group: 'Formal Roles',
  },
  {
    title: 'IT Coordinator',
    context: 'KLH Engineers',
    timeframe: '2016 – 2021',
    periods: [{ start: '2016-05', end: '2021-03', label: '2016 – 2021' }],
    details:
      'Managed company-wide IT infrastructure and deployed new services, modernizing business processes and internal tooling.',
    image: aiTaskForceImg,
    emphasis: 'Operations Leadership',
    group: 'Formal Roles',
  },
  {
    title: 'Supervisor',
    context: 'Pittsburgh Office',
    legacyTimeframe: 'Jan 2017 – Apr 2021, resumed Apr 2024',
    legacyPeriods: [
      { start: '2017-01', end: '2021-04', label: 'Jan 2017 – Apr 2021' },
      { start: '2024-04', end: null, label: 'Resumed Apr 2024' },
    ],
    legacyDetails: 'Mentor staff, guide technical growth, and support team performance through project delivery and career development.',
    timeframe: '2017-2021, 2024-present',
    periods: [
      { start: '2017-01', end: '2021-04', label: '2017-2021', showBar: true },
      { start: '2024-04', end: null, label: '2024-present', showBar: true },
    ],
    details:
      'Mentor staff, guide technical growth, and support team performance through project delivery and career development, with six direct reports.',
    image: leadershipAcademyImg,
    emphasis: 'People Leadership',
    group: 'Other Roles',
  },
  {
    title: 'AI Task Force Member',
    context: 'Wade Trim',
    timeframe: 'Since Sep 2023',
    periods: [{ start: '2023-09', end: null, label: 'Since Sep 2023' }],
    details: 'Support responsible adoption of AI tools and practical use cases for engineering teams.',
    image: aiTaskForceImg,
    emphasis: 'Emerging Technology',
    group: 'Other Roles',
  },
  {
    title: 'Standards Committee Member',
    context: 'GIS Subcommittee',
    timeframe: 'Since Jun 2024',
    periods: [{ start: '2024-06', end: null, label: 'Since Jun 2024' }],
    details: 'Help define and refine standards that improve delivery consistency, QA, and technical alignment across teams.',
    image: leadershipAcademyImg,
    emphasis: 'Standards & Governance',
    group: 'Other Roles',
  },
];

const groupOrder = ['Notable Project and Program Leads', 'Formal Roles', 'Other Roles'];
const barGradient = 'from-cyan-500 via-blue-500 to-indigo-500';

function parseMonth(value) {
  const [year, month] = value.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function monthDiff(startDate, endDate) {
  return (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
}

export default function LeadershipHighlights() {
  const [activeRoleIndex, setActiveRoleIndex] = useState(0);

  const timelineMeta = useMemo(() => {
    const starts = leadershipRoles.flatMap((role) => role.periods.map((period) => parseMonth(period.start)));
    const timelineStart = new Date(Math.min(...starts.map((date) => date.getTime())));
    const timelineEnd = new Date();
    const totalMonths = Math.max(monthDiff(timelineStart, timelineEnd) + 1, 1);

    return { timelineStart, timelineEnd, totalMonths };
  }, []);

  const groupedRoles = useMemo(
    () =>
      groupOrder
        .map((group) => ({
          group,
          roles: leadershipRoles
            .map((role, index) => ({ role, index }))
            .filter(({ role }) => role.group === group),
        }))
        .filter((entry) => entry.roles.length > 0),
    [],
  );

  const activeRole = leadershipRoles[activeRoleIndex];

  const renderRoleDetails = (role) => (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-[340px] overflow-hidden rounded-3xl border border-slate-200/70 bg-white text-slate-900 shadow-[0_24px_70px_rgba(148,163,184,0.2)] dark:border-slate-700/60 dark:bg-slate-900 dark:text-white dark:shadow-none"
    >
      <img
        src={role.image.src || role.image}
        alt={`${role.title} visual`}
        className="absolute inset-0 h-full w-full object-cover opacity-45 dark:opacity-45"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/88 via-white/68 to-cyan-100/58 dark:from-slate-900/95 dark:via-slate-900/75 dark:to-indigo-900/40" />
      <div className="relative z-10 p-8 h-full flex flex-col justify-end gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700 dark:text-cyan-300">{role.emphasis}</span>
        <h3 className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white">{role.title}</h3>
        <p className="font-semibold text-cyan-900 dark:text-cyan-100">{role.context}</p>
        <p className="text-slate-700 dark:text-slate-200">{role.details}</p>
        <div className="flex flex-wrap gap-2">
          {role.periods.map((period) => (
            <span
              key={`${role.title}-${period.start}-${period.end ?? 'current'}-label`}
              className="rounded-full border border-cyan-500/25 bg-cyan-500/12 px-2.5 py-1 text-[11px] font-semibold text-cyan-900 dark:border-cyan-300/30 dark:bg-cyan-500/20 dark:text-cyan-100"
            >
              {period.label}
            </span>
          ))}
        </div>
      </div>
    </motion.article>
  );

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
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Leadership, Built Over Time
            </h2>
            <motion.div
              whileHover={{ y: -3, scale: 1.03 }}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/30 border border-amber-300/60 dark:border-amber-700/50"
            >
              <Award className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-200">Leadership Academy Alumni</span>
            </motion.div>
          </div>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-lg">
            Project and formal roles leading others in tasks, technical advances, and technology management.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5">
          <div className="rounded-3xl border border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-5 md:p-7">
            {groupedRoles.map((groupBlock) => (
              <div key={groupBlock.group} className="mb-6 last:mb-0">
                <p className="text-xs uppercase tracking-[0.15em] font-bold text-indigo-700 dark:text-indigo-300 mb-3">{groupBlock.group}</p>
                <div className="space-y-3">
                  {groupBlock.roles.map(({ role, index }) => {
                    const isActive = index === activeRoleIndex;

                    return (
                      <div key={role.title}>
                        <motion.button
                          type="button"
                          onClick={() => setActiveRoleIndex(index)}
                          onMouseEnter={() => setActiveRoleIndex(index)}
                          whileHover={{ scale: 1.01, x: 3 }}
                          className={`w-full text-left rounded-2xl p-3 border transition ${
                            isActive
                              ? 'border-cyan-400/80 dark:border-cyan-500/80 bg-cyan-50/80 dark:bg-cyan-900/20'
                              : 'border-slate-200/70 dark:border-slate-700/70 hover:border-cyan-300/70 dark:hover:border-cyan-700/70'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100">{role.title}</h3>
                            <span className="text-[10px] md:text-xs uppercase tracking-wider font-mono text-slate-500 dark:text-slate-400">{role.timeframe}</span>
                          </div>
                          <div className="relative h-8 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            {role.periods
                              .filter((period) => period.showBar !== false)
                              .map((period, periodIndex) => {
                                const startDate = parseMonth(period.start);
                                const periodEnd = period.end ? parseMonth(period.end) : timelineMeta.timelineEnd;
                                const leftOffset = (monthDiff(timelineMeta.timelineStart, startDate) / timelineMeta.totalMonths) * 100;
                                const width = ((monthDiff(startDate, periodEnd) + 1) / timelineMeta.totalMonths) * 100;

                                return (
                                <motion.div
                                  key={`${role.title}-${period.start}-${period.end ?? 'current'}`}
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${width}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.65, delay: 0.06 * (index + periodIndex), ease: 'easeOut' }}
                                  className={`absolute top-1 bottom-1 rounded-md bg-gradient-to-r ${barGradient} ${
                                    isActive ? 'opacity-100' : 'opacity-75'
                                  }`}
                                  style={{ left: `${leftOffset}%` }}
                                />
                              );
                            })}
                            <div className="absolute inset-0 flex items-center px-2">
                              <span className="text-[11px] md:text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{role.context}</span>
                            </div>
                          </div>
                        </motion.button>

                        <div className="xl:hidden">
                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.div
                                key={`${role.title}-mobile-details`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                                className="overflow-hidden"
                              >
                                <div className="pt-3">
                                  {renderRoleDetails(role)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="hidden xl:block">
            {renderRoleDetails(activeRole)}
          </div>
        </div>
      </div>
    </section>
  );
}
