import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Map from '../components/Map'
import AddressAutocomplete from '../components/AddressAutocomplete'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const [position, setPosition] = useState({ lat: -20.2133, lon: -70.1503 }); // Default to Iquique

  const handleSelect = (coords) => {
    console.log('Updating position to:', coords); // Debugging log
    setPosition(coords);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex flex-col items-center p-6">
        <h1 className="text-4xl font-bold mb-6">Bienvenido a Taxi Aeropuerto Tarapacá</h1>
        <div className="search-bar flex mb-6">
          <AddressAutocomplete onSelect={handleSelect} />
        </div>
        <div id="map-container" className="w-full max-w-4xl">
          <Map startCoords={position} />
        </div>
      </main>
    </div>
  )
}
