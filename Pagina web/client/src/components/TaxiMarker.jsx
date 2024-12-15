import { useEffect, useState } from "react";
import { LeafletTrackingMarker } from "react-leaflet-tracking-marker";
import L from "leaflet";
import { Tooltip } from "react-leaflet";
import PropTypes from 'prop-types';

const icon = L.icon({
  iconUrl: '/taxi.svg',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
  // Add rotation origin for smooth rotation
  rotationOrigin: "center center"
});

export default function TaxiMarker({ data }) {
  const { lat, lng, patente, estado, heading } = data;
  const [prevPos, setPrevPos] = useState([lat, lng]);
  const [rotation, setRotation] = useState(heading || 0);

  useEffect(() => {
    if (prevPos[1] !== lng && prevPos[0] !== lat) {
      // Calculate rotation based on movement direction if heading is not provided
      if (!heading && prevPos[0] !== lat && prevPos[1] !== lng) {
        const dx = lng - prevPos[1];
        const dy = lat - prevPos[0];
        const angle = Math.atan2(dx, dy) * (180 / Math.PI);
        setRotation(angle);
      } else if (heading) {
        setRotation(heading);
      }
      setPrevPos([lat, lng]);
    }
  }, [lat, lng, prevPos, heading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'DISPONIBLE':
        return 'text-green-500';
      case 'EN SERVICIO':
        return 'text-blue-500';
      case 'OFFLINE':
        return 'text-gray-500';
      default:
        return 'text-blue-500';
    }
  };

  // Create rotated icon instance
  const rotatedIcon = L.divIcon({
    className: 'custom-taxi-marker',
    html: `
      <div style="transform: rotate(${rotation}deg);">
        <img src="/taxi.svg" style="width: 42px; height: 42px;" />
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 21]
  });

  return (
    <LeafletTrackingMarker
      icon={rotatedIcon}
      position={[lat, lng]}
      previousPosition={prevPos}
      duration={1000}
      keepAtCenter={true}
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
    estado: PropTypes.string.isRequired,
    heading: PropTypes.number
  }).isRequired
};
