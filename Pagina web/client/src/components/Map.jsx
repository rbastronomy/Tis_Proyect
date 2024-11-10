import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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

function Map({ position }) {
  console.log('Map component received position:', position); // Debugging log

  const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
      console.log('MapUpdater is setting view to:', position); // Debugging log
      map.setView(position, 13);
    }, [position, map]);
    return null;
  };

  return (
    <MapContainer center={position} zoom={13} style={{ width: '100%', height: '400px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <Marker position={position} />
      <MapUpdater position={position} />
    </MapContainer>
  );
}

Map.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired,
};

export default React.memo(Map);
