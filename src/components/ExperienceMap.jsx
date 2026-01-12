import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import projects from '../data/projects.json';

const MAPBOX_TOKEN = 'YOUR_MAPBOX_ACCESS_TOKEN'; // Recommend using an .env file later

export default function ExperienceMap() {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
      <Map
        initialViewState={{
          longitude: -85,
          latitude: 38,
          zoom: 3.5
        }}
        mapStyle="mapbox://styles/mapbox/light-v11" // Clean, professional "engineering" style
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        {projects.map(project => (
          <Marker 
            key={project.name}
            longitude={project.coords[0]} 
            latitude={project.coords[1]}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setSelectedProject(project);
            }}
          >
            <div className="cursor-pointer text-2xl animate-bounce">📍</div>
          </Marker>
        ))}

        {selectedProject && (
          <Popup
            anchor="top"
            longitude={selectedProject.coords[0]}
            latitude={selectedProject.coords[1]}
            onClose={() => setSelectedProject(null)}
          >
            <div className="p-2 font-sans">
              <h4 className="font-bold text-blue-700">{selectedProject.name}</h4>
              <p className="text-xs">{selectedProject.client}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
