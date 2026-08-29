import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { formatDistance } from '../utils/distanceUtils';

const DEFAULT_CENTER = [24.2, 45.2];

function markerIcon(type, label) {
  return L.divIcon({
    className: `map-marker map-marker-${type}`,
    html: `<span>${label}</span>`,
    iconSize: [34, 42],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36],
  });
}

function FitMapBounds({ projectLocation, branches }) {
  const map = useMap();

  useEffect(() => {
    if (!projectLocation || branches.length === 0) return;
    const positions = [
      [projectLocation.latitude, projectLocation.longitude],
      ...branches.map((branch) => [branch.latitude, branch.longitude]),
    ];
    map.fitBounds(L.latLngBounds(positions), { padding: [42, 42], maxZoom: 11 });
  }, [map, projectLocation, branches]);

  return null;
}

export default function BranchMap({ projectLocation, branches = [] }) {
  const [showTiles, setShowTiles] = useState(false);
  const projectIcon = useMemo(() => markerIcon('project', 'P'), []);
  const responsibleIcon = useMemo(() => markerIcon('responsible', '1'), []);
  const otherIcon = useMemo(() => markerIcon('other', '•'), []);

  return (
    <section className="map-panel" aria-label="Branch location map">
      <div className="map-toolbar">
        <div>
          <span className="eyebrow">Location overview</span>
          <h2>Branch map</h2>
        </div>
        <label className="tile-toggle">
          <input type="checkbox" checked={showTiles} onChange={(event) => setShowTiles(event.target.checked)} />
          <span>Map detail</span>
        </label>
      </div>

      <div className="map-frame">
        <MapContainer center={DEFAULT_CENTER} zoom={5} minZoom={3} scrollWheelZoom className="leaflet-map">
          {showTiles && (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {projectLocation && (
            <Marker position={[projectLocation.latitude, projectLocation.longitude]} icon={projectIcon}>
              <Popup><strong>Project Location</strong></Popup>
            </Marker>
          )}
          {branches.map((branch, index) => (
            <Marker
              key={branch.id}
              position={[branch.latitude, branch.longitude]}
              icon={index === 0 ? responsibleIcon : otherIcon}
            >
              <Popup>
                <strong>{branch.branchName}</strong><br />
                {branch.city}<br />
                Distance: {formatDistance(branch.distance)}
              </Popup>
            </Marker>
          ))}
          <FitMapBounds projectLocation={projectLocation} branches={branches} />
        </MapContainer>

        {!projectLocation && (
          <div className="map-empty-state">
            <div className="empty-pin">+</div>
            <strong>Your location results will appear here</strong>
            <span>Complete the project details to place branch markers.</span>
          </div>
        )}

        <div className="map-legend">
          <span><i className="legend-dot project" /> Project</span>
          <span><i className="legend-dot responsible" /> Suggested branch</span>
          <span><i className="legend-dot other" /> Other branches</span>
        </div>
      </div>
    </section>
  );
}
