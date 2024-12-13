import { createLazyFileRoute } from '@tanstack/react-router'
import PropTypes from 'prop-types'
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Chip, 
  Button,
  Divider,
  Spinner
} from "@nextui-org/react"
import { MapPin, Calendar, DollarSign, Phone, Car, User } from 'lucide-react'

export const Route = createLazyFileRoute('/viajes/$codigoViaje')({
  component: TripDetails,
})

const getStatusColor = (status) => {
  switch (status) {
    case 'EN_CURSO':
      return 'warning'
    case 'COMPLETADO':
      return 'success'
    case 'CANCELADO':
      return 'danger'
    case 'PENDIENTE':
      return 'primary'
    default:
      return 'default'
  }
}

function TripDetails({ trip, onBack, isDriverView = false, loading = false }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader className="flex justify-between items-center">
        <div className="flex justify-between items-center w-full">
          <div>
            <Button
              variant="light"
              onClick={onBack}
              className="mb-2"
            >
              ← Volver
            </Button>
            <h1 className="text-2xl font-bold">
              Viaje #{trip.codigo_viaje}
            </h1>
          </div>
          <Chip color={getStatusColor(trip.estado_viaje)} variant="flat">
            {trip.estado_viaje}
          </Chip>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid gap-6">
          {/* Información básica */}
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">
                {new Date(trip.fecha_viaje).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Origen:</span>
                <span>{trip.origen}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Destino:</span>
                <span>{trip.destino}</span>
              </div>
            </div>
          </div>

          <Divider />

          {/* Información del conductor o cliente según la vista */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">
              {isDriverView ? 'Información del Cliente' : 'Información del Conductor'}
            </h3>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" />
              <span>
                {isDriverView ? trip.cliente : trip.conductor}
              </span>
            </div>
            {isDriverView && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{trip.telefono_cliente}</span>
              </div>
            )}
          </div>

          <Divider />

          {/* Información del vehículo */}
          {trip.patente && (
            <>
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Vehículo</h3>
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-gray-400" />
                  <span>Patente: {trip.patente}</span>
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* Información de pago */}
          <div className="grid gap-4">
            <h3 className="text-lg font-semibold">Pago</h3>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-gray-400" />
              <span>${trip.precio.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

TripDetails.propTypes = {
  trip: PropTypes.shape({
    codigo_viaje: PropTypes.number.isRequired,
    fecha_viaje: PropTypes.string.isRequired,
    origen: PropTypes.string.isRequired,
    destino: PropTypes.string.isRequired,
    estado_viaje: PropTypes.string.isRequired,
    conductor: PropTypes.string,
    cliente: PropTypes.string,
    telefono_cliente: PropTypes.string,
    patente: PropTypes.string,
    precio: PropTypes.number.isRequired
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  isDriverView: PropTypes.bool,
  loading: PropTypes.bool
}

export default TripDetails 