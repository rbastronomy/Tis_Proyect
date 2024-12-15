import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
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
function MapUpdater({ position, isTracking }) {
  const map = useMap();

  useEffect(() => {
    if (position?.lat && position?.lon && isTracking) {
      map.setView([position.lat, position.lon], map.getZoom(), { animate: true });
    }
  }, [position, map, isTracking]);

  return null;
}

MapUpdater.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  isTracking: PropTypes.bool.isRequired,
};

function Map({ position, startCoords, endCoords, routeCoordinates, isTracking }) {
  const defaultPosition = { lat: -20.2133, lon: -70.1503 }; // Iquique default position
  const mapPosition = position || defaultPosition;

  return (
    <MapContainer 
      center={[mapPosition.lat, mapPosition.lon]} 
      zoom={13} 
      style={{ width: '100%', height: '100%' }} 
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {/* Show position marker only if we have valid coordinates */}
      {position?.lat && position?.lon && (
        <Marker position={[position.lat, position.lon]}>
          {/* Popup opcional que puedes agregar aquí */}
        </Marker>
      )}

      {/* Optional start/end markers */}
      {startCoords?.lat && startCoords?.lon && (
        <Marker position={[startCoords.lat, startCoords.lon]} />
      )}
      {endCoords?.lat && endCoords?.lon && (
        <Marker position={[endCoords.lat, endCoords.lon]} />
      )}
      
      {/* Route polyline */}
      {routeCoordinates && routeCoordinates.length > 0 && (
        <Polyline 
          positions={routeCoordinates.map(coord => [coord.lat, coord.lon])} 
          color="blue" 
        />
      )}

      {/* Map updater */}
      <MapUpdater position={position} isTracking={isTracking} />
    </MapContainer>
  );
}

Map.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
    accuracy: PropTypes.number,
    speed: PropTypes.number
  }),
  startCoords: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  endCoords: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
  }),
  routeCoordinates: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number,
      lon: PropTypes.number,
    })
  ),
  isTracking: PropTypes.bool.isRequired,
};

Map.defaultProps = {
  isTracking: false
};

export default React.memo(Map);
