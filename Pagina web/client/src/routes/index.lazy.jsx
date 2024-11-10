import { createLazyFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Map from '../components/Map'
import AddressAutocomplete from '../components/AddressAutocomplete'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

function Index() {
  const [position, setPosition] = useState([-20.2133, -70.1503]); // Default to Iquique

  const handleSelect = (coords) => {
    console.log('Updating position to:', coords); // Debugging log
    setPosition([coords.lat, coords.lon]);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      <header className="w-full flex justify-between items-center p-4 bg-gray-800">
        <div id="logo-container" className="flex items-center">
          <img src="logo.png" alt="Logo de Taxi Aeropuerto Tarapacá" id="logo-image" className="h-10 mr-2" />
          <div id="logo-text" className="text-lg font-bold">Aeropuerto Iquique Tarapacá</div>
        </div>
        <nav className="flex space-x-4">
          <a href="/" className="header-button text-blue-400 hover:text-blue-300">Inicio</a>
          <a href="/contacto" className="header-button text-blue-400 hover:text-blue-300">Contacto</a>
          <a href="/sobre" className="header-button text-blue-400 hover:text-blue-300">Sobre Nosotros</a>
          <a href="/ayuda" className="header-button text-blue-400 hover:text-blue-300">Ayuda</a>
          <a href="/login" className="header-button text-blue-400 hover:text-blue-300">Iniciar Sesion</a>
        </nav>
      </header>

      <main className="flex flex-col items-center p-6">
        <h1 className="text-4xl font-bold mb-6">Bienvenido a Taxi Aeropuerto Tarapacá</h1>
        <div className="search-bar flex mb-6">
          <AddressAutocomplete onSelect={handleSelect} />
        </div>

        <div id="map-container" className="w-full max-w-4xl">
          <Map position={position} />
        </div>
      </main>
    </div>
  )
}
