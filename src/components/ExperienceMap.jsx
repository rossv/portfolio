import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef, useEffect } from 'react';
import projects from '../data/project.json';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function ExperienceMap() {
  const [selectedProject, setSelectedProject] = useState(null);
  const mapRef = useRef(null);
  const projectsWithCoords = projects.filter(
    (project) =>
      Array.isArray(project.coords) &&
      project.coords.length === 2 &&
      project.coords.every((value) => typeof value === 'number' && Number.isFinite(value))
  );

  useEffect(() => {
    if (mapRef.current) {
      // Fly to initial view on load for dynamic effect
      mapRef.current.flyTo({ center: [-80, 38], zoom: 4, duration: 4000 });
    }
  }, []);

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group">
      <div className="absolute inset-0 border-[8px] border-white/20 dark:border-slate-950/80 z-10 pointer-events-none rounded-2xl"></div>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -95,
          latitude: 38,
          zoom: 2
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11" // Switch to Dark mode for consistent theme
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        {projectsWithCoords.map(project => (
          <Marker
            key={project.name}
            longitude={project.coords[0]}
            latitude={project.coords[1]}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedProject(project);
              mapRef.current?.flyTo({ center: project.coords, zoom: 9, duration: 2000 });
            }}
          >
            <div className="cursor-pointer group/marker relative">
              <div className="w-4 h-4 bg-indigo-500 rounded-full border-2 border-white shadow-lg z-20 relative transform transition-transform group-hover/marker:scale-125"></div>
              <div className="absolute -inset-2 bg-indigo-500/40 rounded-full animate-ping"></div>
            </div>
          </Marker>
        ))}

        {selectedProject && (
          <Popup
            anchor="top"
            longitude={selectedProject.coords[0]}
            latitude={selectedProject.coords[1]}
            onClose={() => setSelectedProject(null)}
            closeButton={false}
            className="z-50"
          >
            <div className="p-3 font-sans min-w-[200px]">
              <h4 className="font-bold text-slate-900 text-lg mb-1">{selectedProject.name}</h4>
              <div className="mb-2">
                {selectedProject.company && <p className="text-sm font-bold text-slate-800">{selectedProject.company}</p>}
                {selectedProject.client && selectedProject.client !== selectedProject.company && (
                  <p className="text-xs font-mono text-indigo-600 font-semibold">{selectedProject.client}</p>
                )}
              </div>
              <p className="text-xs text-slate-500 leading-tight">Click outside to close</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
