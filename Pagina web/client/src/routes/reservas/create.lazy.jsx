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

function CreateBooking() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [services, setServices] = useState([])
  const [loadingServices, setLoadingServices] = useState(true)
  const [selectedService, setSelectedService] = useState('')
  const [rideType, setRideType] = useState(null) // 'CITY' or 'AIRPORT'
  const [availableTariffs, setAvailableTariffs] = useState([])
  const [loadingTariffs, setLoadingTariffs] = useState(false)

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      origenv: '',
      destinov: '',
      freserva: new Date(Date.now() + 30 * 60000).toISOString(),
      codigos: '',
      oferta_id: '',
      observacion: ''
    }
  });

  // Watch for service changes
  const selectedServiceId = watch('codigos');

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
            setValue('codigos', '');
            setSelectedService('');
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

  // Fetch tariffs when service is selected
  useEffect(() => {
    if (selectedServiceId && rideType) {
      const fetchTariffs = async () => {
        setLoadingTariffs(true);
        try {
          const response = await fetch(
            `/api/offerings/by-service/${selectedServiceId}/${rideType}`
          );
          if (response.ok) {
            const data = await response.json();
            setAvailableTariffs(data);
            setValue('oferta_id', '');
          }
        } catch (error) {
          console.error('Error fetching tariffs:', error);
        } finally {
          setLoadingTariffs(false);
        }
      };

      fetchTariffs();
    }
  }, [selectedServiceId, rideType, setValue]);

  const selectedServiceData = services.find(s => s.codigos.toString() === selectedService);
  const bookingType = selectedServiceData?.tipo;

  // Set destination when ride type changes
  useEffect(() => {
    if (rideType === 'AIRPORT') {
      setValue('destinov', AIRPORT_ADDRESS.label);
    } else {
      setValue('destinov', '');
    }
  }, [rideType, setValue]);

  if (!isAuthenticated || !['ADMINISTRADOR', 'USUARIO'].includes(user?.role?.nombre_rol)) {
    return <div>Loading...</div>
  }

  /**
   * Handles form submission.
   * @param {Object} data - Form data.
   * @returns {Promise<void>}
   */
  const onSubmit = async (data) => {
    console.log('Form submitted with data:', data)
    setLoading(true)
    setSubmitError('')
    try {
      const response = await fetch('/api/reservas/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          codigos: parseInt(data.codigos),
          oferta_id: parseInt(data.oferta_id),
          freserva: new Date(data.freserva).toISOString()
        })
      })

      if (response.ok) {
        navigate({ to: '/reservas' })
      } else {
        const errorData = await response.json()
        setSubmitError(errorData.message || 'Error al crear la reserva')
      }
    } catch (error) {
      console.error('Error:', error)
      setSubmitError('Error de conexión al servidor')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Generates time options for selection.
   * @returns {Array<Object>} Array of time option objects.
   */
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

  /**
   * Gets the minimum datetime value for the picker.
   * @returns {string} ISO string representing the minimum datetime.
   */
  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    return now.toISOString().slice(0, 16)
  }

  const TimeOptionsSelect = ({ field, error }) => {
    const [selectedTimeOption, setSelectedTimeOption] = useState('ASAP')
    
    useEffect(() => {
      const option = getTimeOptions().find(opt => opt.key === 'ASAP');
      if (option) {
        field.onChange(option.value);
      }
    }, []);

    return (
      <div className="relative">
        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Select
          aria-label="Hora de llegada"
          selectedKeys={new Set([selectedTimeOption])}
          defaultSelectedKeys={new Set(['ASAP'])}
          disallowEmptySelection={true}
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0];
            setSelectedTimeOption(selectedKey);
            field.onChange(selectedKey);
          }}
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
    );
  };

  TimeOptionsSelect.propTypes = {
    field: PropTypes.shape({
      onChange: PropTypes.func.isRequired,
      value: PropTypes.string
    }).isRequired,
    error: PropTypes.shape({
      message: PropTypes.string
    })
  };

  const DateTimePicker = ({ field, error }) => {
    return (
      <div className="relative">
        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="datetime-local"
          {...field}
          min={getMinDateTime()}
          className="pl-10"
          classNames={{
            input: "bg-transparent",
            inputWrapper: ["bg-default-100", error && "border-danger"]
          }}
          isInvalid={!!error}
          errorMessage={error?.message}
        />
      </div>
    );
  };

  DateTimePicker.propTypes = {
    field: PropTypes.shape({
      onChange: PropTypes.func.isRequired,
      value: PropTypes.string
    }).isRequired,
    error: PropTypes.shape({
      message: PropTypes.string
    })
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
                name="codigos"
                control={control}
                rules={{ required: "El tipo de servicio es requerido" }}
                render={({ field, fieldState: { error } }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Tipo de Servicio
                    </label>
                    <Select
                      selectedKeys={selectedService ? new Set([selectedService]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selectedKey = Array.from(keys)[0];
                        setSelectedService(selectedKey);
                        field.onChange(selectedKey);
                      }}
                      isLoading={loadingServices}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                    >
                      {services.map((service) => (
                        <SelectItem 
                          key={service.codigos.toString()} 
                          value={service.codigos.toString()}
                        >
                          {service.tipo === 'NORMAL' ? 'Servicio Normal' : 'Servicio Programado'}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              />
            )}

            {/* Tariff Selection */}
            {selectedService && (
              <Controller
                name="oferta_id"
                control={control}
                rules={{ required: "La tarifa es requerida" }}
                render={({ field, fieldState: { error } }) => (
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
                      isLoading={loadingTariffs}
                      isInvalid={!!error}
                      errorMessage={error?.message}
                    >
                      {availableTariffs.map((tariff) => (
                        <SelectItem 
                          key={tariff.id.toString()} 
                          value={tariff.id.toString()}
                          description={`$${tariff.precio}`}
                        >
                          {tariff.descripciont}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
              />
            )}

            {/* Rest of the form (addresses, time, observations) only show if tariff is selected */}
            {watch('oferta_id') && (
              <>
                {/* Origin Address */}
                <Controller
                  name="origenv"
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
                  name="destinov"
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

                {/* Time Selection */}
                {bookingType && (
                  <Controller
                    name="freserva"
                    control={control}
                    rules={{ required: "La hora es requerida" }}
                    render={({ field, fieldState: { error } }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {bookingType === 'NORMAL' ? 'Hora Estimada de Llegada' : 'Fecha y Hora del Servicio'}
                        </label>
                        {bookingType === 'NORMAL' ? (
                          <TimeOptionsSelect field={field} error={error} />
                        ) : (
                          <DateTimePicker field={field} error={error} />
                        )}
                      </div>
                    )}
                  />
                )}

                {/* Observations */}
                <Controller
                  name="observacion"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Observaciones
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
              isDisabled={!watch('oferta_id') || Object.keys(errors).length > 0}
            >
              {loading ? "Procesando..." : "Solicitar Servicio"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
} 