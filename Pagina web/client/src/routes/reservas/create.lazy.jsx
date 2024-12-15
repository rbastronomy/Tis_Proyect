import { createLazyFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form"
import { MapPin, Calendar, Plane } from 'lucide-react'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from '@nextui-org/react'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import PropTypes from 'prop-types'

export const Route = createLazyFileRoute('/reservas/create')({
  component: CreateBooking,
})

const formatTimeOption = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}

const AIRPORT_ADDRESS = {
  label: "Aeropuerto Internacional Diego Aracena Iquique",
  value: {
    lat: -20.547668,
    lng: -70.1786242
  }
};

const isNightTime = (date) => {
  const hours = new Date(date).getHours();
  return hours >= 22 || hours < 6;
};

const getTimeOptions = () => {
  const now = Date.now();
  return [
    {
      key: 'ASAP',
      label: 'Lo antes posible (30 minutos)',
      value: new Date(now + 30 * 60000).toISOString()
    },
    {
      key: 'HOUR_1',
      label: 'En 1 hora',
      value: new Date(now + 60 * 60000).toISOString()
    },
    {
      key: 'HOUR_2',
      label: 'En 2 horas',
      value: new Date(now + 120 * 60000).toISOString()
    },
    {
      key: 'HOUR_3',
      label: 'En 3 horas',
      value: new Date(now + 180 * 60000).toISOString()
    }
  ];
};

const getMinDateTime = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now;
};

const toLocalISOString = (date) => {
  const tzOffset = new Date().getTimezoneOffset() * 60000; // offset in milliseconds
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

const TimeSelector = ({ field, error, bookingType }) => {
  const [selectedTimeKey, setSelectedTimeKey] = useState(() => {
    if (field.value) {
      const option = getTimeOptions().find(opt => 
        Math.abs(new Date(opt.value) - new Date(field.value)) < 1000
      );
      return option?.key || 'ASAP';
    }
    return 'ASAP';
  });

  useEffect(() => {
    if (!field.value && bookingType === 'NORMAL') {
      const asapOption = getTimeOptions().find(opt => opt.key === 'ASAP');
      if (asapOption) {
        field.onChange(asapOption.value);
        setSelectedTimeKey('ASAP');
      }
    }
  }, [field, bookingType]);

  useEffect(() => {
    if (field.value) {
      const option = getTimeOptions().find(opt => 
        Math.abs(new Date(opt.value) - new Date(field.value)) < 1000
      );
      if (option && option.key !== selectedTimeKey) {
        setSelectedTimeKey(option.key);
      }
    }
  }, [field.value, selectedTimeKey]);

  const handleTimeSelection = (keys) => {
    const selectedKey = Array.from(keys)[0];
    const option = getTimeOptions().find(opt => opt.key === selectedKey);
    if (option) {
      setSelectedTimeKey(selectedKey);
      field.onChange(option.value);
    }
  };

  const handleDateTimeChange = (e) => {
    const selectedDateTime = e.target.value;
    if (!selectedDateTime) {
      field.onChange('');
      return;
    }
    
    try {
      // Create a date object in local time
      const localDate = new Date(selectedDateTime);
      if (isNaN(localDate.getTime())) {
        field.onChange('');
        return;
      }
      
      // Convert to UTC ISO string
      field.onChange(localDate.toISOString());
      
      // Trigger blur to help with form validation
      field.onBlur();
    } catch (error) {
      console.error('Error parsing date:', error);
      field.onChange('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {bookingType === 'NORMAL' ? 'Hora de recogida' : 'Fecha y hora programada'}
      </label>
      {bookingType === 'NORMAL' ? (
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Select
            aria-label="Hora de recogida"
            selectedKeys={new Set([selectedTimeKey])}
            disallowEmptySelection={true}
            onSelectionChange={handleTimeSelection}
            classNames={{
              trigger: "bg-default-100 pl-10",
              base: error && "border-danger"
            }}
            isInvalid={!!error}
            errorMessage={error?.message}
          >
            {getTimeOptions().map(option => (
              <SelectItem 
                key={option.key}
                value={option.key}
              >
                {option.label}
              </SelectItem>
            ))}
          </Select>
          {field.value && (
            <div className="text-sm text-gray-600 mt-1">
              Hora seleccionada: {formatTimeOption(field.value)}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="datetime-local"
            value={field.value ? toLocalISOString(new Date(field.value)) : ''}
            onChange={handleDateTimeChange}
            onBlur={field.onBlur}
            min={toLocalISOString(getMinDateTime())}
            className="pl-10"
            classNames={{
              input: "bg-transparent",
              inputWrapper: ["bg-default-100", error && "border-danger"]
            }}
            isInvalid={!!error}
            errorMessage={error?.message}
          />
        </div>
      )}
    </div>
  );
};

TimeSelector.propTypes = {
  field: PropTypes.shape({
    onChange: PropTypes.func.isRequired,
    value: PropTypes.string
  }).isRequired,
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  bookingType: PropTypes.string.isRequired
};

function CreateBooking() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [rideType, setRideType] = useState(null) // 'CITY' or 'AIRPORT'

  const { control, handleSubmit, watch, setValue, formState: { errors, isValid } } = useForm({
    defaultValues: {
      origen_reserva: '',
      destino_reserva: '',
      fecha_reserva: new Date(Date.now() + 30 * 60000).toISOString(),
      codigo_servicio: '',
      id_tarifa: '',
      observacion_reserva: ''
    },
    mode: 'onChange'
  });

  // Check for specific permission in the nested structure
  const hasCreatePermission = user?.role?.permissions?.some(
    permission => permission.nombre_permiso === 'crear_reserva'
  );

  if (!isAuthenticated || !hasCreatePermission) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white p-4 text-center"> 
        <Card className="w-full max-w-xl">
          <CardBody>
            <p className='justify-center items-center text-center'>No tienes permisos para crear reservas</p>
            <Button 
              color="primary" 
              className="mt-4"
              onClick={() => navigate({ to: '/' })}
            >
              Volver al inicio
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Fetch services when ride type changes
  useEffect(() => {
    if (rideType) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const response = await fetch(`/api/services/by-type/${rideType}`);
          if (response.ok) {
            const data = await response.json();
            setServices(data);
            // Reset service selection when ride type changes
            setValue('codigo_servicio', '');
            setValue('id_tarifa', '');
          }
        } catch (error) {
          console.error('Error fetching services:', error);
        } finally {
          setLoadingServices(false);
        }
      };

      fetchServices();
    }
  }, [rideType, setValue]);

  const selectedServiceData = services.find(s => s.codigo_servicio.toString() === watch('codigo_servicio'));
  const bookingType = selectedServiceData?.tipo_servicio;
  const availableTariffs = selectedServiceData?.tarifas || [];

  // Set destination when ride type changes
  useEffect(() => {
    if (rideType === 'AIRPORT') {
      setValue('destino_reserva', AIRPORT_ADDRESS.label);
    } else {
      setValue('destino_reserva', '');
    }
  }, [rideType, setValue]);

  /**
   * Handles form submission.
   * @param {Object} data - Form data.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data);
    
    try {
      // Validate fecha_reserva
      const selectedDate = new Date(data.fecha_reserva);
      if (isNaN(selectedDate.getTime())) {
        setSubmitError('Fecha de reserva inválida');
        return;
      }

      setLoading(true);
      setSubmitError('');
      
      const response = await fetch('/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          codigo_servicio: parseInt(data.codigo_servicio),
          id_tarifa: parseInt(data.id_tarifa),
          fecha_reserva: selectedDate.toISOString(),
          tipo_reserva: rideType === 'CITY' ? 'CIUDAD' : 'AEROPUERTO'
        })
      });

      if (response.ok) {
        navigate({ to: '/reservas' });
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.message || 'Error al crear la reserva');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('Error de conexión al servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6">
          <h1 className="text-2xl font-bold">Nueva Reserva de Taxi</h1>
          <p className="text-sm text-gray-500">
            Complete los datos para solicitar un servicio de taxi
          </p>
        </CardHeader>
        <CardBody className="px-6 py-4">
          {submitError && (
            <div className="mb-4 p-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-lg">
              {submitError}
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Ride Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tipo de Viaje
              </label>
              <Select
                label="Seleccione el tipo de viaje"
                selectedKeys={rideType ? new Set([rideType]) : new Set()}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0];
                  setRideType(selected);
                }}
                className="w-full"
              >
                <SelectItem key="CITY" value="CITY">
                  Viaje dentro de la ciudad
                </SelectItem>
                <SelectItem key="AIRPORT" value="AIRPORT">
                  Viaje al aeropuerto
                </SelectItem>
              </Select>
            </div>

            {/* Service Selection */}
            {rideType && (
              <Controller
                name="codigo_servicio"
                control={control}
                rules={{ required: "El tipo de servicio es requerido" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tipo de Servicio
                    </label>
                    <Select
                      selectedKeys={field.value ? new Set([field.value]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        field.onChange(selectedKey);
                        // Reset tariff selection when service changes
                        setValue('id_tarifa', '');
                      }}
                      isLoading={loadingServices}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                      aria-label="Seleccione el tipo de servicio"
                      label="Tipo de Servicio"
                    >
                      {services.map((service) => (
                        <SelectItem 
                          key={service.codigo_servicio.toString()} 
                          value={service.codigo_servicio.toString()}
                        >
                          {service.tipo_servicio === 'NORMAL' ? 'Servicio Normal' : 'Servicio Programado'}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              />
            )}

            {/* Show all other fields after service selection */}
            {watch('codigo_servicio') && (
              <>
                {/* Time Selection */}
                <Controller
                  name="fecha_reserva"
                  control={control}
                  rules={{ 
                    required: "La hora es requerida",
                    validate: value => {
                      if (!value) return "La hora es requerida";
                      const selectedDate = new Date(value);
                      if (isNaN(selectedDate.getTime())) return "Fecha inválida";
                      
                      const minDate = getMinDateTime();
                      // Compare timestamps in milliseconds
                      return selectedDate.getTime() >= minDate.getTime() || 
                        "La fecha y hora debe ser al menos 30 minutos en el futuro";
                    }
                  }}
                  render={({ field, fieldState: { error } }) => (
                    <TimeSelector 
                      field={field} 
                      error={error} 
                      bookingType={selectedServiceData?.tipo_servicio} 
                    />
                  )}
                />

                {/* Tariff Selection */}
                <Controller
                  name="id_tarifa"
                  control={control}
                  rules={{ required: "La tarifa es requerida" }}
                  render={({ field, fieldState: { error } }) => {
                    const selectedTime = watch('fecha_reserva');
                    const isNight = selectedTime ? isNightTime(selectedTime) : false;
                    
                    // Filter tariffs based on time
                    const filteredTariffs = availableTariffs.filter(tariff => {
                      if (!selectedTime) return true;
                      const isNightTariff = tariff.tipo_tarifa.includes('NOCTURNO');
                      return isNight ? isNightTariff : !isNightTariff;
                    });

                    return (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Tarifa
                        </label>
                        <Select
                          selectedKeys={field.value ? new Set([field.value.toString()]) : new Set()}
                          onSelectionChange={(keys) => {
                            const selectedKey = Array.from(keys)[0];
                            field.onChange(selectedKey);
                          }}
                          isInvalid={!!error}
                          errorMessage={error?.message}
                          isDisabled={!selectedTime}
                          aria-label="Seleccione la tarifa"
                          label="Tarifa"
                        >
                          {filteredTariffs.map((tariff) => (
                            <SelectItem 
                              key={tariff.id_tarifa.toString()} 
                              value={tariff.id_tarifa.toString()}
                            >
                              {tariff.descripcion_tarifa}
                            </SelectItem>
                          ))}
                        </Select>
                        {selectedTime && filteredTariffs.length === 0 && (
                          <p className="text-sm text-danger">
                            No hay tarifas disponibles para el horario seleccionado
                          </p>
                        )}
                        {!selectedTime && (
                          <p className="text-sm text-gray-500">
                            Seleccione primero la hora de recogida
                          </p>
                        )}
                      </div>
                    );
                  }}
                />

                {/* Origin Address */}
                <Controller
                  name="origen_reserva"
                  control={control}
                  rules={{ required: "La dirección de origen es requerida" }}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Dirección de Origen
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <AddressAutocomplete
                          defaultValue={field.value}
                          onSelect={(coords) => {
                            console.log('Origin address selected:', coords);
                            field.onChange(coords.label);
                            field.onBlur();
                            console.log('Origin field after selection:', field.value);
                          }}
                          error={error?.message}
                          isInvalid={!!error}
                        />
                      </div>
                      {error && (
                        <p className="text-danger text-xs">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                {/* Destination Address */}
                <Controller
                  name="destino_reserva"
                  control={control}
                  rules={{ required: "La dirección de destino es requerida" }}
                  render={({ field, fieldState: { error } }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Dirección de Destino
                      </label>
                      {rideType === 'AIRPORT' ? (
                        // Read-only airport address display
                        <div className="relative">
                          <Plane />
                          <Input
                            value={AIRPORT_ADDRESS.label}
                            isReadOnly
                            classNames={{
                              input: "bg-transparent pl-10",
                              inputWrapper: "bg-default-100"
                            }}
                          />
                        </div>
                      ) : (
                        // Normal address autocomplete for city rides
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <AddressAutocomplete
                            defaultValue={field.value}
                            onSelect={(coords) => {
                              console.log('Destination address selected:', coords);
                              field.onChange(coords.label);
                              field.onBlur();
                              console.log('Destination field after selection:', field.value);
                            }}
                            error={error?.message}
                            isInvalid={!!error}
                          />
                        </div>
                      )}
                      {error && (
                        <p className="text-danger text-xs">{error.message}</p>
                      )}
                    </div>
                  )}
                />

                {/* Observations */}
                <Controller
                  name="observacion_reserva"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        observacion_reservaes
                      </label>
                      <Textarea
                        {...field}
                        placeholder="Detalles adicionales para el conductor..."
                        classNames={{
                          input: "bg-transparent",
                          inputWrapper: "bg-default-100"
                        }}
                        maxLength={256}
                      />
                    </div>
                  )}
                />
              </>
            )}

            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isLoading={loading}
              isDisabled={!isValid || loading || Object.keys(errors).length > 0}
            >
              {loading ? "Procesando..." : "Solicitar Servicio"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
} 