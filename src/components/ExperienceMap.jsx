import Map, { Source, Layer, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useRef, useMemo } from 'react';

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

export default function ExperienceMap({ projects = [] }) {
  const mapRef = useRef(null);
  const [popupInfo, setPopupInfo] = useState(null);

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

  const onClick = (event) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const clusterId = feature.properties.cluster_id;
    const coordinates = feature.geometry.coordinates.slice();

    // If it's a cluster
    if (clusterId) {
      const mapboxSource = mapRef.current.getSource('projects');

      mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;

        // If we can zoom in further, do so
        if (zoom <= 14) { // Arbitrary max zoom check, usually expansion zoom returns nicely
          mapRef.current.easeTo({
            center: coordinates,
            zoom,
            duration: 500
          });
        } else {
          // If we are deep enough or expansion zoom is same (stacked points)
          // We want to show a popup with all items
          // We need to fetch the leaves of the cluster
          mapboxSource.getClusterLeaves(clusterId, 100, 0, (err, leaves) => {
            if (err) return;
            setPopupInfo({
              longitude: coordinates[0],
              latitude: coordinates[1],
              clusterLeaves: leaves // Array of features
            });
          });
        }
      });
    } else {
      // Unclustered point (single project)
      setPopupInfo({
        longitude: coordinates[0],
        latitude: coordinates[1],
        project: feature.properties
      });
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
    <div className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group">
      <div className="absolute inset-0 border-[8px] border-white/20 dark:border-slate-950/80 z-10 pointer-events-none rounded-2xl"></div>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: -80,
          latitude: 38,
          zoom: 3
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
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
          clusterMaxZoom={12}
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
            closeButton={false}
            className="z-50"
            maxWidth="300px"
          >
            <div className="p-3 font-sans min-w-[200px] max-h-[300px] overflow-y-auto">
              {/* Single Project */}
              {popupInfo.project && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-lg mb-1">{popupInfo.project.name}</h4>
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
                          // Optional: Switch view to single project detail if complex, 
                          // but for now just showing info here is good or expanding.
                          setPopupInfo({
                            longitude: popupInfo.longitude,
                            latitude: popupInfo.latitude,
                            project: leaf.properties
                          })
                        }}
                      >
                        {leaf.properties.name}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{leaf.properties.company}</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center uppercase tracking-wider">Click outside to close</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
