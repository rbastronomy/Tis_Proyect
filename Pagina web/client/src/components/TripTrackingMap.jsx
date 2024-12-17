import { lazy, Suspense } from 'react'
import { Card, CardHeader, CardBody } from "@nextui-org/react"
import { Marker, Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import TaxiMarker from './TaxiMarker'

const Map = lazy(() => import('./Map'))

export function TripTrackingMap({ 
  reservation, 
  driverLocation, 
  routeCoordinates 
}) {
  if (!reservation || !['CONFIRMADO', 'RECOGIDO'].includes(reservation.estado_reserva)) {
    return null;
  }

  const hasOriginCoords = reservation.origen_lat && reservation.origen_lng;
  const hasDestinationCoords = reservation.destino_lat && reservation.destino_lng;
  const hasRequiredCoords = reservation.estado_reserva === 'CONFIRMADO' ? 
    hasOriginCoords : 
    hasDestinationCoords;

  if (!hasRequiredCoords) {
    return null;
  }

  return (
    <Card className="w-full max-w-3xl mx-auto mb-8">
      <CardHeader>
        <h2 className="text-xl font-bold">
          {reservation.estado_reserva === 'CONFIRMADO' 
            ? 'Conductor en camino al punto de recogida' 
            : 'Conductor en viaje con el pasajero'}
        </h2>
      </CardHeader>
      <CardBody>
        <div className="h-[400px] relative">
          <Suspense fallback={<div>Cargando mapa...</div>}>
            <Map 
              position={driverLocation || { 
                lat: reservation.estado_reserva === 'CONFIRMADO' 
                  ? reservation.origen_lat 
                  : reservation.destino_lat, 
                lng: reservation.estado_reserva === 'CONFIRMADO'
                  ? reservation.origen_lng
                  : reservation.destino_lng 
              }}
              isTracking={!!driverLocation}
            >
              {driverLocation && (
                <TaxiMarker 
                  data={{
                    lat: driverLocation.lat,
                    lng: driverLocation.lng,
                    patente: reservation.taxi.patente,
                    estado: 'EN SERVICIO'
                  }}
                />
              )}
              
              {/* Show pickup marker during CONFIRMADO state */}
              {reservation.estado_reserva === 'CONFIRMADO' && reservation.origen_lat && reservation.origen_lng && (
                <Marker 
                  position={[reservation.origen_lat, reservation.origen_lng]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                    </div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })}
                >
                  <Tooltip permanent>
                    Punto de recogida
                  </Tooltip>
                </Marker>
              )}

              {/* Show destination marker during RECOGIDO state */}
              {reservation.estado_reserva === 'RECOGIDO' && reservation.destino_lat && reservation.destino_lng && (
                <Marker 
                  position={[reservation.destino_lat, reservation.destino_lng]}
                  icon={L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div class="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                      <div class="w-2 h-2 bg-white rounded-full"></div>
                    </div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                  })}
                >
                  <Tooltip permanent>
                    Destino Final
                  </Tooltip>
                </Marker>
              )}

              {routeCoordinates && (
                <Polyline 
                  positions={routeCoordinates.map(coord => [coord.lat, coord.lng])}
                  color="blue"
                  weight={3}
                  opacity={0.7}
                />
              )}
            </Map>
          </Suspense>
        </div>
        {driverLocation && (
          <div className="mt-4 space-y-2">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Estado:</span>{' '}
              {reservation.estado_reserva === 'CONFIRMADO' 
                ? 'Conductor en camino al punto de recogida'
                : 'En viaje hacia el destino'
              }
            </div>
            {reservation.taxi && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Vehículo:</span>{' '}
                {reservation.taxi.marca} {reservation.taxi.modelo} - {reservation.taxi.color} - {reservation.taxi.patente}
              </div>
            )}
            <div className="text-xs text-gray-500">
              Última actualización: {new Date().toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
} 