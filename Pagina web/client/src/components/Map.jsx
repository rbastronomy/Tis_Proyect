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
    if (position && isTracking) {
      map.setView([position.lat, position.lon], map.getZoom(), { animate: true });
    }
  }, [position, map, isTracking]);

  return null;
}

MapUpdater.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
  }).isRequired,
  isTracking: PropTypes.bool.isRequired,
};

function Map({ position, startCoords, endCoords, routeCoordinates, isTracking }) {
  const defaultPosition = { lat: -20.2133, lon: -70.1503 }; // Iquique default position

  return (
    <MapContainer 
      center={position || defaultPosition} 
      zoom={13} 
      style={{ width: '100%', height: '100%' }} 
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {/* Mostrar el marcador para la ubicación del usuario si está disponible */}
      {position && (
        <Marker position={[position.lat, position.lon]}>
          {/* Popup opcional que puedes agregar aquí */}
        </Marker>
      )}

      {/* Opcionalmente, agregar marcadores para las coordenadas de inicio y fin */}
      {startCoords && <Marker position={[startCoords.lat, startCoords.lon]} />}
      {endCoords && <Marker position={[endCoords.lat, endCoords.lon]} />}
      
      {/* Renderiza la polilínea de la ruta */}
      {routeCoordinates && <Polyline positions={routeCoordinates.map(coord => [coord.lat, coord.lon])} color="blue" />}

      {/* Actualiza la vista del mapa cuando cambia la posición */}
      <MapUpdater position={position} isTracking={isTracking} />
    </MapContainer>
  );
}

Map.propTypes = {
  position: PropTypes.shape({
    lat: PropTypes.number,
    lon: PropTypes.number,
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
      lat: PropTypes.number.isRequired,
      lon: PropTypes.number.isRequired,
    })
  ),
  isTracking: PropTypes.bool.isRequired,
};

export default React.memo(Map);
