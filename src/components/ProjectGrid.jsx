import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import projects from '../data/projects.json';

export default function ProjectGrid() {
  const [filter, setFilter] = useState('');
  const filtered = projects.filter(p => 
    p.name.toLowerCase().includes(filter.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="p-8">
      <input 
        type="text" 
        placeholder="Search projects by skill (e.g. SWMM) or location..."
        className="w-full p-4 mb-8 text-black border rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 outline-none"
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
              key={project.name}
              className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-600"
            >
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{project.category}</span>
              <h3 className="text-xl font-bold mt-2 text-slate-800">{project.name}</h3>
              <p className="text-sm text-slate-500 mb-4">{project.location} • {project.year}</p>
              <p className="text-slate-600 text-sm mb-4 line-clamp-3">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-xs">#{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
