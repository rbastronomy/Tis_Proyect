import { useState, useEffect } from 'react';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@nextui-org/react";
import AddressAutocomplete from './AddressAutocomplete';
import { toast } from 'react-hot-toast';

export default function AdminEditBookingModal({ isOpen, onClose, onSubmit, reservation }) {
  const [formData, setFormData] = useState({
    origen_reserva: reservation?.origen_reserva || '',
    destino_reserva: reservation?.destino_reserva || '',
    fecha_reserva: reservation?.fecha_reserva ? 
      new Date(reservation.fecha_reserva).toISOString().slice(0, 16) : '',
    observacion_reserva: reservation?.observacion_reserva || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Determine editability based on reservation type
  const isAirportRide = reservation?.tipo_reserva === 'AEROPUERTO';
  const isAirportDestination = reservation?.destino_reserva?.includes('Aeropuerto');
  const direction = isAirportDestination ? 'IDA' : 'VUELTA';

  // Determine which fields can be edited
  const editableFields = {
    origen_reserva: isAirportRide ? 
      (direction === 'VUELTA' ? false : true) : true,
    destino_reserva: isAirportRide ? 
      (direction === 'IDA' ? false : true) : true,
    fecha_reserva: true,
    observacion_reserva: true
  };

  // Get current tariff details
  const currentTariff = reservation?.servicio?.tarifas?.[0];
  const isNightTariff = currentTariff?.tipo_tarifa?.includes('NOCHE');

  // Validate time based on tariff type and ensure tariff compatibility
  const validateTimeAndTariff = (dateString) => {
    const hours = new Date(dateString).getHours();
    const isNightHours = hours >= 22 || hours < 6;

    if (isNightTariff && !isNightHours) {
      return 'El horario debe ser entre 22:00 y 06:00 para tarifa nocturna';
    }
    if (!isNightTariff && isNightHours) {
      return 'El horario debe ser entre 06:00 y 22:00 para tarifa diurna';
    }

    if (isAirportRide) {
      const tariffDirection = currentTariff?.tipo_tarifa?.includes('IDA') ? 'IDA' : 'VUELTA';
      if (tariffDirection !== direction) {
        return 'La tarifa no corresponde con la dirección del viaje';
      }
    }

    return '';
  };

  const validateForm = () => {
    const requiredFields = Object.entries(editableFields)
      .filter(([_, editable]) => editable)
      .map(([field]) => field)
      .filter(field => field !== 'observacion_reserva');

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setValidationError('Todos los campos obligatorios deben ser completados');
      return false;
    }

    const selectedDate = new Date(formData.fecha_reserva);
    if (selectedDate < new Date()) {
      setValidationError('La fecha no puede ser en el pasado');
      return false;
    }

    const timeError = validateTimeAndTariff(formData.fecha_reserva);
    if (timeError) {
      setValidationError(timeError);
      return false;
    }

    setValidationError('');
    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) return;

      setIsSubmitting(true);

      const response = await fetch(`/api/bookings/${reservation.codigo_reserva}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          fecha_reserva: new Date(formData.fecha_reserva).toISOString()
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la reserva');
      }

      toast.success('Reserva actualizada exitosamente');
      onSubmit();
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error(error.message || 'Error al actualizar la reserva');
      setValidationError(error.message || 'Error al actualizar la reserva');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen && reservation) {
      setFormData({
        origen_reserva: reservation.origen_reserva,
        destino_reserva: reservation.destino_reserva,
        fecha_reserva: new Date(reservation.fecha_reserva).toISOString().slice(0, 16),
        observacion_reserva: reservation.observacion_reserva || ''
      });
      setValidationError('');
    }
  }, [isOpen, reservation]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" backdrop="blur">
      <ModalContent>
        <ModalHeader>
          <h2 className="text-xl font-bold">Editar Reserva</h2>
          {isAirportRide && (
            <p className="text-sm text-gray-500">
              Viaje {direction === 'IDA' ? 'hacia el' : 'desde el'} aeropuerto
              {isNightTariff ? ' (Tarifa nocturna)' : ' (Tarifa diurna)'}
            </p>
          )}
        </ModalHeader>
        <ModalBody>
          {validationError && (
            <div className="mb-4 px-4 py-2 bg-danger-50 text-danger rounded-lg text-sm">
              {validationError}
            </div>
          )}

          <div className="space-y-4">
            {editableFields.origen_reserva ? (
              <AddressAutocomplete
                defaultValue={formData.origen_reserva}
                onSelect={(coords) => {
                  setFormData(prev => ({
                    ...prev,
                    origen_reserva: coords.label
                  }));
                }}
                error={validationError}
                isInvalid={!!validationError}
              />
            ) : (
              <Input
                label="Origen"
                value={formData.origen_reserva}
                isReadOnly
                isDisabled
              />
            )}

            {editableFields.destino_reserva ? (
              <AddressAutocomplete
                defaultValue={formData.destino_reserva}
                onSelect={(coords) => {
                  setFormData(prev => ({
                    ...prev,
                    destino_reserva: coords.label
                  }));
                }}
                error={validationError}
                isInvalid={!!validationError}
              />
            ) : (
              <Input
                label="Destino"
                value={formData.destino_reserva}
                isReadOnly
                isDisabled
              />
            )}

            <Input
              type="datetime-local"
              label={`Fecha y Hora ${isNightTariff ? '(22:00 - 06:00)' : '(06:00 - 22:00)'}`}
              value={formData.fecha_reserva}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                fecha_reserva: e.target.value
              }))}
              isRequired
            />

            <Textarea
              label="Observaciones"
              value={formData.observacion_reserva}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                observacion_reserva: e.target.value
              }))}
              maxLength={256}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            isDisabled={isSubmitting}
          >
            Guardar Cambios
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}