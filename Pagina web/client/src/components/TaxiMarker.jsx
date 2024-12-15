import { useEffect, useState } from "react";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import { Tooltip } from "react-leaflet";
import PropTypes from 'prop-types';

// Create a taxi icon - you'll need to add a taxi icon image to your assets
const icon = L.icon({
  iconUrl: '/taxi.svg', // Add this image to your public folder
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21]
});

export default function TaxiMarker({ data }) {
  const { lat, lng, patente, estado } = data;
  const [prevPos, setPrevPos] = useState([lat, lng]);

  useEffect(() => {
    if (prevPos[1] !== lng && prevPos[0] !== lat) {
      setPrevPos([lat, lng]);
    }
  }, [lat, lng, prevPos]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPONIBLE':
        return 'text-green-500';
      case 'OCUPADO':
        return 'text-yellow-500';
      case 'OFFLINE':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <LeafletTrackingMarker
      icon={icon}
      position={[lat, lng]}
      previousPosition={prevPos}
    >
      <Tooltip permanent direction="top" offset={[0, -20]}>
        <div className="text-sm font-medium">
          <div>{patente}</div>
          <div className={`text-xs ${getStatusColor(estado)}`}>
            {estado}
          </div>
        </div>
      </Tooltip>
    </LeafletTrackingMarker>
  );
}

TaxiMarker.propTypes = {
  data: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    patente: PropTypes.string.isRequired,
    estado: PropTypes.string.isRequired
  }).isRequired
};
