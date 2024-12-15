import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import TaxiMarker from './TaxiMarker';
import PropTypes from 'prop-types';

export function FleetMap({ activeTaxis = [] }) {
  const [mapCenter] = useState([-20.2133, -70.1503]); // Iquique center

  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ width: '100%', height: '500px' }}
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {activeTaxis.map((taxi) => (
        <TaxiMarker
          key={taxi.patente}
          data={taxi}
        />
      ))}
    </MapContainer>
  );
}

FleetMap.propTypes = {
  activeTaxis: PropTypes.arrayOf(PropTypes.shape({
    patente: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    estado: PropTypes.string.isRequired
  })).isRequired
}; 