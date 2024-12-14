import { createLazyFileRoute } from '@tanstack/react-router';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea
} from "@nextui-org/react";
import AddressAutocomplete from '../../components/AddressAutocomplete';

export const Route = createLazyFileRoute('/admin/create-booking')({
  component: CreateBooking,
});

function CreateBooking() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    origen_reserva: '',
    destino_reserva: '',
    fecha_reserva: '',
    fecha_realizado: '',
    tipo_reserva: 'NORMAL',
    observacion_reserva: '',
    codigo_servicio: 1 // Default service code
  });

  // Protect the route but allow CLIENTE and ADMINISTRADOR roles
  if (!isAuthenticated || !['ADMINISTRADOR', 'CLIENTE'].includes(user?.role?.nombre_rol)) {
    navigate({ to: '/login' });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const bookingPayload = {
        ...bookingData,
        fecha_reserva: new Date(bookingData.fecha_reserva).toISOString(),
        estado_reserva: 'EN_REVISION',
        observacion_reserva: bookingData.observacion_reserva || ''
      };

      const response = await fetch('/api/reservas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(bookingPayload)
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect based on role
        const redirectPath = user?.role?.nombre_rol === 'ADMINISTRADOR' 
          ? '/admin/dashboard'
          : '/mis-reservas';
        navigate({ to: redirectPath });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // Get min datetime for the reservation (current time + 30 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
          <h2 className="text-2xl font-bold">Nueva Reserva de Taxi</h2>
          <p className="text-sm text-gray-500">
            Complete los datos para solicitar un servicio de taxi
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
            
            <AddressAutocomplete
              label="Dirección de origen"
              onSelect={(coords) => {
                setBookingData(prev => ({
                  ...prev,
                  origenv: coords.label
                }));
              }}
              error={error && !bookingData.origenv ? 'Origen requerido' : ''}
            />

            <AddressAutocomplete
              label="Dirección de destino"
              onSelect={(coords) => {
                setBookingData(prev => ({
                  ...prev,
                  destinov: coords.label
                }));
              }}
              error={error && !bookingData.destinov ? 'Destino requerido' : ''}
            />

            <Input
              type="datetime-local"
              label="Fecha y hora del servicio"
              value={bookingData.freserva}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                freserva: e.target.value
              }))}
              min={getMinDateTime()}
              isRequired
              errorMessage={error && !bookingData.freserva ? 'Fecha requerida' : ''}
            />

            <Select
              label="Tipo de servicio"
              value={bookingData.tipo}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                tipo: e.target.value
              }))}
              errorMessage={error && !bookingData.tipo ? 'Tipo requerido' : ''}
            >
              <SelectItem key="NORMAL" value="NORMAL">
                Normal - Servicio estándar
              </SelectItem>
              <SelectItem key="URGENTE" value="URGENTE">
                Urgente - Servicio prioritario
              </SelectItem>
              <SelectItem key="PROGRAMADO" value="PROGRAMADO">
                Programado - Reserva anticipada
              </SelectItem>
            </Select>

            <Textarea
              label="Observaciones"
              value={bookingData.observacion}
              onChange={(e) => setBookingData(prev => ({
                ...prev,
                observacion: e.target.value
              }))}
              placeholder="Detalles adicionales para el conductor..."
              maxLength={256}
            />

            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              Solicitar Servicio
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
