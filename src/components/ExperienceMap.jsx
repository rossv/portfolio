import Map, { Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef, useMemo, useEffect } from 'react';

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;

const clusterLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'projects',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#818cf8', 10, '#4f46e5', 50, '#312e81'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
};

const clusterCountLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'projects',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
};

const unclusteredPointLayer = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'projects',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#6366f1', // indigo-500
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#fff'
  }
};

export default function ExperienceMap({ projects = [], className = "", onProjectClick }) {
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Function to check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Observer to watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const geojsonData = useMemo(() => {
    const features = projects
      .filter(
        (project) =>
          Array.isArray(project.coords) &&
          project.coords.length === 2 &&
          project.coords.every((value) => typeof value === 'number' && Number.isFinite(value))
      )
      .map((project) => ({
        type: 'Feature',
        properties: { ...project, id: project.name }, // Ensure properties are passed
        geometry: {
          type: 'Point',
          coordinates: project.coords
        }
      }));

    return {
      type: 'FeatureCollection',
      features
    };
  }, [projects]);

  // Helper to parse Mapbox properties which might be stringified
  const parseProjectProperties = (properties) => {
    const parsed = { ...properties };
    // Mapbox GL JS stringifies arrays/objects in GeoJSON properties
    // We need to parse them back
    ['tags', 'coords', 'links'].forEach(key => {
      if (typeof parsed[key] === 'string' && (parsed[key].startsWith('[') || parsed[key].startsWith('{'))) {
        try {
          parsed[key] = JSON.parse(parsed[key]);
        } catch (e) {
          // Keep as string if parse fails
        }
      }
    });
    return parsed;
  };

  const onClick = (event) => {
    const feature = event.features?.[0];

    // Always clear popup regarding what we clicked to ensure state consistency.
    // If we clicked a feature, it will be reopened/overwritten below.
    // If background, it closes.
    // This replaces implicit close behavior and prevents stuck states.
    if (!feature) {
      setPopupInfo(null);
      return;
    }

    const clusterId = feature.properties.cluster_id;
    const coordinates = feature.geometry.coordinates.slice();

    // If it's a cluster
    if (clusterId) {
      const mapboxSource = mapRef.current.getSource('projects');

      mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        // If expansion zoom is reachable and reasonable, fly there.
        // We set 20 as threshold (since we'll set clusterMaxZoom to 20 or higher).
        // If expansion suggests zooming beyond ~20, we assume it's a tight cluster (identical points).
        if (zoom <= 20) {
          mapRef.current.easeTo({
            center: coordinates,
            zoom,
            duration: 500
          });
        } else {
          // Terminal cluster (points at same location) -> Show popup
          mapboxSource.getClusterLeaves(clusterId, 100, 0, (err, leaves) => {
            if (err) return;

            // Deduplicate leaves based on project name to avoid UI duplicates
            const uniqueLeaves = leaves.filter((leaf, index, self) =>
              index === self.findIndex((t) => (
                t.properties.name === leaf.properties.name
              ))
            );

            setPopupInfo({
              longitude: coordinates[0],
              latitude: coordinates[1],
              clusterLeaves: uniqueLeaves
            });
          });
        }
      });
    } else {
      // Unclustered point (single project)
      // With high clusterMaxZoom, we assume this is a truly single point (or we are at max zoom).
      const projectData = parseProjectProperties(feature.properties);

      setPopupInfo({
        longitude: coordinates[0],
        latitude: coordinates[1],
        project: projectData
      });

      // Also notify parent directly if they want to handle it (like opening modal)
      if (onProjectClick) {
        onProjectClick(projectData);
      }
    }
  };

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-[500px] w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-2xl flex items-center justify-center text-center px-6">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Map preview unavailable. Configure the Mapbox access token to enable the experience map.
        </p>
      </div>
    );
  }

  return (
    <div className={`h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group ${className}`}>
      <div className="absolute inset-0 border-[8px] border-white/20 dark:border-slate-950/80 z-10 pointer-events-none rounded-2xl"></div>

      {/* Decorative Corner "Book Protectors" */}
      <div className="absolute top-0 left-0 z-20 pointer-events-none -translate-x-px -translate-y-px">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 L 0 16 C 0 7.16 7.16 0 16 0 L 50 0 L 0 50 Z"
            className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 z-20 pointer-events-none rotate-90 translate-x-px -translate-y-px">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 L 0 16 C 0 7.16 7.16 0 16 0 L 50 0 L 0 50 Z"
            className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 z-20 pointer-events-none -rotate-90 -translate-x-px translate-y-px">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 L 0 16 C 0 7.16 7.16 0 16 0 L 50 0 L 0 50 Z"
            className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="0.5" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 z-20 pointer-events-none rotate-180 translate-x-px translate-y-px">
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 L 0 16 C 0 7.16 7.16 0 16 0 L 50 0 L 0 50 Z"
            className="fill-slate-200 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600"
            strokeWidth="0.5" />
        </svg>
      </div>
      <Map
        ref={mapRef}
        style={{ borderRadius: '1rem', overflow: 'hidden' }}
        initialViewState={{
          longitude: -80,
          latitude: 38,
          zoom: 3
        }}
        mapStyle={isDarkMode ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11"}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={[clusterLayer.id, unclusteredPointLayer.id]}
        onClick={onClick}
        attributionControl={false}
      >
        <Source
          id="projects"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={25}
          clusterRadius={30}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
            closeButton={false}
            className="z-50"
            maxWidth="300px"
          >
            <div className="p-3 font-sans min-w-[200px] max-h-[300px] overflow-y-auto">
              {/* Single Project */}
              {popupInfo.project && (
                <div>
                  <h4
                    className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                    onClick={() => onProjectClick && onProjectClick(popupInfo.project)}
                  >
                    {popupInfo.project.name}
                  </h4>
                  <div className="mb-2">
                    {popupInfo.project.company && <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{popupInfo.project.company}</p>}
                    {popupInfo.project.client && popupInfo.project.client !== popupInfo.project.company && (
                      <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">{popupInfo.project.client}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Cluster of Projects (Same Location) */}
              {popupInfo.clusterLeaves && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b dark:border-slate-700 pb-1 mb-2">Projects at this location ({popupInfo.clusterLeaves.length})</h4>
                  {popupInfo.clusterLeaves.map((leaf) => (
                    <div key={leaf.properties.name} className="border-b border-slate-100 dark:border-slate-800 last:border-0 pb-2 last:pb-0">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                        onClick={() => {
                          const parsedProps = parseProjectProperties(leaf.properties);
                          // Notify parent to open modal DIRECTLY when clicking a list item
                          if (onProjectClick) {
                            onProjectClick(parsedProps);
                          }
                          // Also update popup to show single item (optional, but maybe better to just close or let modal take over)
                          setPopupInfo({
                            longitude: popupInfo.longitude,
                            latitude: popupInfo.latitude,
                            project: parsedProps
                          });
                        }}
                      >
                        {leaf.properties.name}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {leaf.properties.company}
                        {leaf.properties.client && leaf.properties.client !== leaf.properties.company && (
                          <span className="block text-indigo-500 dark:text-indigo-400">{leaf.properties.client}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center uppercase tracking-wider">Click outside to close</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
