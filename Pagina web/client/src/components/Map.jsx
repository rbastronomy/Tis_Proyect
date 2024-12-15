import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Componente para actualizar la posición del mapa cuando el seguimiento está activo
function MapUpdater({ position, isTracking, children }) {
  const map = useMap();

  useEffect(() => {
    if (position?.lat && position?.lng && isTracking) {
      console.log('Updating map position:', position);
      map.setView([position.lat, position.lng], map.getZoom(), { animate: true });
    }
  }, [position, map, isTracking]);

  // Add debug log for children props
  console.log('MapUpdater children:', children);

  return <>{children}</>;
}

MapUpdater.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  isTracking: PropTypes.bool.isRequired,
  children: PropTypes.node
};

function Map({ position, isTracking, children }) {
  const defaultPosition = { lat: -20.2133, lng: -70.1503 }; // Iquique default position
  const mapPosition = position || defaultPosition;

  // Add debug log for incoming props
  console.log('Map component props:', { position, isTracking, children });

  return (
    <MapContainer 
      center={[mapPosition.lat, mapPosition.lng]} 
      zoom={13} 
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      <MapUpdater position={position} isTracking={isTracking}>
        {children}
        {position && (
          <Marker position={[position.lat, position.lng]} />
        )}
      </MapUpdater>
    </MapContainer>
  );
}

Map.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
    accuracy: PropTypes.number,
    speed: PropTypes.number
  }),
  isTracking: PropTypes.bool.isRequired,
  children: PropTypes.node
};

Map.defaultProps = {
  isTracking: false
};

export default React.memo(Map);
