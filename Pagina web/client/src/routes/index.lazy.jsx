import { createLazyFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import Map from '../components/Map';
import AddressAutocomplete from '../components/AddressAutocomplete';

export const Route = createLazyFileRoute('/')({
  component: Index,
});

function Index() {
  const [position, setPosition] = useState({ lat: -20.2133, lon: -70.1503 }); // Default to Iquique
  const [isTracking, setIsTracking] = useState(false);

  const handleSelect = (coords) => {
    console.log('Updating position to:', coords); // Verificar coordenadas
    setPosition(coords);
    setIsTracking(true); // Activa el seguimiento para centrar el mapa en la posición seleccionada

    // Desactiva el seguimiento después de centrar el mapa
    setTimeout(() => setIsTracking(false), 500);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Contenedor del buscador */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-1/4 max-w-md p-3 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Taxi Aeropuerto Tarapacá</h1>
        <AddressAutocomplete onSelect={handleSelect} />
      </div>

      {/* Contenedor del mapa */}
      <div className="absolute inset-0 z-0 flex">
        <Map position={position} isTracking={isTracking} className="w-full h-full" />
      </div>
    </div>
  );
}

export default Index;
