import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import PropTypes from 'prop-types';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapUpdater({ position, isTracking, children }) {
  const map = useMap();
  const [userPanned, setUserPanned] = useState(false);
  const lastPosition = useRef(position);
  const zoomLevel = useRef(map.getZoom());
  const isInitialMount = useRef(true);

  useMapEvents({
    zoom: () => {
      zoomLevel.current = map.getZoom();
    },
    dragstart: () => {
      setUserPanned(true);
    },
    moveend: () => {
      if (!isInitialMount.current) {
        setUserPanned(true);
      }
    }
  });

  useEffect(() => {
    isInitialMount.current = false;
    zoomLevel.current = map.getZoom();
  }, [map]);

  useEffect(() => {
    if (!position?.lat || !position?.lng) return;

    const hasPositionChanged = 
      lastPosition.current?.lat !== position.lat || 
      lastPosition.current?.lng !== position.lng;

    if (hasPositionChanged) {
      if (isTracking && !userPanned) {
        map.setView(
          [position.lat, position.lng],
          map.getZoom(),
          {
            animate: true,
            duration: 0.5,
            easeLinearity: 0.25,
            noMoveStart: true
          }
        );
      }
      lastPosition.current = position;
    }
  }, [position, map, isTracking, userPanned]);

  useEffect(() => {
    if (!isTracking) return;

    const recenterControl = L.control({ position: 'bottomright' });
    
    recenterControl.onAdd = () => {
      const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      container.innerHTML = `
        <button
          class="bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 focus:outline-none transition-opacity duration-200"
          style="width: 40px; height: 40px; opacity: ${userPanned ? '1' : '0'}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l-4 4m0 0l-4-4m4 4V3m0 0v11" />
          </svg>
        </button>
      `;
      
      container.onclick = () => {
        if (position) {
          map.setView(
            [position.lat, position.lng],
            map.getZoom(),
            {
              animate: true,
              duration: 0.5,
              easeLinearity: 0.25
            }
          );
          setUserPanned(false);
        }
      };
      
      return container;
    };

    recenterControl.addTo(map);
    return () => recenterControl.remove();
  }, [map, isTracking, position, userPanned]);

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
  const defaultPosition = { lat: -20.2133, lng: -70.1503 };
  const mapPosition = position || defaultPosition;

  return (
    <MapContainer 
      center={[mapPosition.lat, mapPosition.lng]} 
      zoom={13} 
      style={{ width: '100%', height: '100%' }}
      zoomAnimation={true}
      markerZoomAnimation={true}
      fadeAnimation={true}
      dragging={true}
      doubleClickZoom={true}
      scrollWheelZoom={true}
      preferCanvas={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      
      <MapUpdater position={position} isTracking={isTracking}>
        {children}
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
