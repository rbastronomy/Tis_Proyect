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
  const [routeCoordinates, setRouteCoordinates] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const handleStartSelect = (coords) => {
    console.log("Inicio seleccionado:", coords)
    setStartCoords(coords)
  }

  const handleEndSelect = (coords) => {
    console.log("Destino seleccionado:", coords)
    setEndCoords(coords)
  }

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

      points.push({ lat: lat / 1E5, lon: lng / 1E5 });
    }
    return points;
  };

  const fetchRoute = async () => {
    if (!startCoords || !endCoords) {
      setErrorMessage("Por favor, selecciona tanto el inicio como el destino.")
      return
    }

    try {
      const origin = `${startCoords.lat},${startCoords.lon}`
      const destination = `${endCoords.lat},${endCoords.lon}`

      console.log(`Calculando ruta desde ${origin} hasta ${destination}`)
      
      // Llama a la API de direcciones (por ejemplo, Google Maps Directions API o similar)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=YOUR_GOOGLE_MAPS_API_KEY`
      )

      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status}`)
      }

      const data = await response.json()
      console.log('Datos recibidos de la API:', data)

      if (data.status === 'OK' && data.routes?.length > 0) {
        const decodedCoordinates = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(decodedCoordinates);
        setErrorMessage(null);
        console.log("Ruta establecida correctamente")
      } else {
        setErrorMessage("No se encontró una ruta entre los puntos seleccionados.")
      }
    } catch (error) {
      console.error('Error al obtener la ruta:', error)
      setErrorMessage("Ocurrió un error al calcular la ruta.")
    }
  }

  return (
    <div className="relative min-h-screen">
      <div id="map-container" className="absolute inset-0 w-full h-full z-0">
        {/* Pasa las coordenadas al componente Map */}
        <Map 
          startCoords={startCoords} 
          endCoords={endCoords} 
          routeCoordinates={routeCoordinates} 
          isTracking={true} // Ajusta si es necesario
        />
      </div>

      <div className="relative z-10 p-4 bg-opacity-75 bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mb-4 text-center">Ruta Recomendada</h1>
        <div className="flex items-center justify-center gap-2">
          <AddressAutocomplete onSelect={handleStartSelect} />
          <AddressAutocomplete onSelect={handleEndSelect} />
          <button onClick={fetchRoute} className="bg-blue-500 text-white p-2 rounded">
            Calcular Ruta
          </button>
        </div>
        {errorMessage && (
          <div className="mt-4 text-red-500 text-center">
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  )
}

export default Ruta
