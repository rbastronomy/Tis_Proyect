import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';

// Fix for default marker icon issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapUpdater({ position, isTracking }) {
  const map = useMap();

  useEffect(() => {
    if (position && isTracking) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map, isTracking]);

  return null;
}

MapUpdater.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  isTracking: PropTypes.bool,
};

function Map({ position, startCoords, endCoords, route, isTracking }) {
  const decodePolyline = (encoded) => {
    if (!encoded) return [];
    
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push([lat / 1E5, lng / 1E5]);
    }
    return points;
  };

  const routeCoordinates = route ? decodePolyline(route) : [];
  const defaultPosition = [-20.2133, -70.1503]; // Iquique default position

  return (
    <MapContainer 
      center={position || defaultPosition} 
      zoom={13} 
      style={{ width: '100%', height: '400px' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      {/* Current position marker */}
      {position && (
        <Marker position={position}>
          {/* Opcional: Puedes agregar un popup aquí si es necesario */}
        </Marker>
      )}

      {/* Route markers and polyline */}
      {startCoords && <Marker position={[startCoords.lat, startCoords.lon]} />}
      {endCoords && <Marker position={[endCoords.lat, endCoords.lon]} />}
      {route && <Polyline positions={routeCoordinates} color="blue" />}

      {/* Pass the position as an array to MapUpdater */}
      {position && <MapUpdater position={position} isTracking={isTracking} />}
    </MapContainer>
  );
}

Map.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  startCoords: PropTypes.object,
  endCoords: PropTypes.object,
  route: PropTypes.string,
  isTracking: PropTypes.bool,
};

export default React.memo(Map);
