import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import projects from '../data/project.json';

export default function ProjectGrid() {
  const [filter, setFilter] = useState('');
  const filtered = projects.filter(p => {
    const search = filter.toLowerCase();
    return (
      p.name.toLowerCase().includes(search) ||
      (p.client && p.client.toLowerCase().includes(search)) ||
      (p.role && p.role.toLowerCase().includes(search)) ||
      (p.year && p.year.toLowerCase().includes(search)) ||
      (p.description && p.description.toLowerCase().includes(search)) ||
      p.tags.some(t => t.toLowerCase().includes(search))
    );
  });

  return (
    <div className="p-8">
      <input
        type="text"
        placeholder="Search projects by skill, client, year, or location..."
        className="w-full p-4 mb-8 text-slate-900 dark:text-slate-100 dark:bg-slate-950 border dark:border-slate-600 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        onChange={(e) => setFilter(e.target.value)}
      />

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filtered.map((project) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -5 }}
              key={`${project.name}-${project.client}`}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-t-4 border-blue-600 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{project.category}</span>
                {project.year && <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{project.year}</span>}
              </div>

              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{project.name}</h3>

              {(project.client || project.role) && (
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-3 font-medium">
                  {project.client && <span className="text-indigo-600 dark:text-indigo-400">{project.client}</span>}
                  {project.client && project.role && <span className="mx-2">•</span>}
                  {project.role && <span>{project.role}</span>}
                </div>
              )}

              {project.location && <p className="text-sm text-slate-500 dark:text-slate-500 mb-4 italic">{project.location}</p>}

              <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 flex-grow">{project.description}</p>

              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs">#{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
