import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Map from '../../components/Map'
import AddressAutocomplete from '../../components/AddressAutocomplete'

export const Route = createFileRoute('/taxi/ruta')({
  component: Ruta,
})

function Ruta() {
  const [startCoords, setStartCoords] = useState(null)
  const [endCoords, setEndCoords] = useState(null)
  const [route, setRoute] = useState(null)

  const handleStartSelect = (coords) => {
    setStartCoords(coords)
  }

  const handleEndSelect = (coords) => {
    setEndCoords(coords)
  }

  const fetchRoute = async () => {
    if (!startCoords || !endCoords) return

    try {
      const origin = `${startCoords.lat},${startCoords.lon}`
      const destination = `${endCoords.lat},${endCoords.lon}`
      
      const response = await fetch(
        `/api/directions?origin=${origin}&destination=${destination}`
      )
      const data = await response.json()

      if (data.status === 'OK') {
        setRoute(data.routes[0].overview_polyline.points)
      } else {
        console.error('Error fetching route:', data.status)
      }
    } catch (error) {
      console.error('Error fetching route:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <main className="flex flex-col items-center p-6">
        <h1 className="text-4xl font-bold mb-6">Ruta Recomendada</h1>
        <div className="flex items-center gap-2 mb-6">
          <AddressAutocomplete onSelect={handleStartSelect} />
          <AddressAutocomplete onSelect={handleEndSelect} />
          <button onClick={fetchRoute} className="bg-blue-500 text-white p-2 rounded">
            Calcular Ruta
          </button>
        </div>
        <div id="map-container" className="w-full max-w-4xl">
          <Map startCoords={startCoords} endCoords={endCoords} route={route} />
        </div>
      </main>
    </div>
  )
}
