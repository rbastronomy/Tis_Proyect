import { createLazyFileRoute } from '@tanstack/react-router'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm, Controller } from "react-hook-form"
import { MapPin, Calendar } from 'lucide-react'
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

function CreateBooking() {
  console.log('CreateBooking component rendering')

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [selectedTimeOption, setSelectedTimeOption] = useState('ASAP');
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    console.log('Auth state:', { isAuthenticated, user })
  }, [isAuthenticated, user])

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      origenv: '',
      destinov: '',
      freserva: new Date(Date.now() + 30 * 60000).toISOString(),
      codigos: null,
      observacion: ''
    }
  });

  const selectedService = watch('codigos');
  const selectedServiceData = services.find(s => s.codigos === selectedService);
  const bookingType = selectedServiceData?.tipo;

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/servicios/');
        if (response.ok) {
          const data = await response.json();
          setServices(data.services);
          const normalService = data.services.find(s => s.tipo === 'NORMAL');
          if (normalService) {
            setValue('codigos', normalService.codigos);
          }
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, [setValue]);

  if (!isAuthenticated || !['ADMINISTRADOR', 'USUARIO'].includes(user?.role?.nombrerol)) {
    return <div>Loading...</div>
  }

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
          freserva: new Date(data.freserva).toISOString()
        })
      })

      if (response.ok) {
        navigate({ to: '/reservas/list' })
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

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30)
    return now.toISOString().slice(0, 16)
  }

  const getTimeOptions = () => {
    const now = Date.now();
    const options = [
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
    return options;
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
            <Controller
              name="origenv"
              control={control}
              rules={{ 
                required: "La dirección de origen es requerida",
                validate: value => {
                  console.log('Validating origin address:', value);
                  const isValid = value?.trim().length > 0;
                  console.log('Origin address validation result:', isValid);
                  return isValid || "La dirección de origen es requerida";
                }
              }}
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

            <Controller
              name="destinov"
              control={control}
              rules={{ 
                required: "La dirección de destino es requerida",
                validate: value => {
                  console.log('Validating destination address:', value);
                  const isValid = value?.trim().length > 0;
                  console.log('Destination address validation result:', isValid);
                  return isValid || "La dirección de destino es requerida";
                }
              }}
              render={({ field, fieldState: { error } }) => (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Dirección de Destino
                  </label>
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
                  {error && (
                    <p className="text-danger text-xs">{error.message}</p>
                  )}
                </div>
              )}
            />

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
                    selectedKeys={field.value ? [field.value.toString()] : []}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      field.onChange(value);
                      const service = services.find(s => s.codigos === value);
                      if (service?.tipo === 'NORMAL') {
                        setValue('freserva', new Date(Date.now() + 30 * 60000).toISOString());
                      }
                    }}
                    aria-label="Tipo de Servicio"
                    placeholder={loadingServices ? "Cargando servicios..." : "Seleccione un servicio"}
                    isLoading={loadingServices}
                    classNames={{
                      trigger: "bg-default-100",
                      base: error && "border-danger"
                    }}
                    isInvalid={!!error}
                    errorMessage={error?.message}
                  >
                    {services.map((service) => (
                      <SelectItem 
                        key={service.codigos.toString()} 
                        value={service.codigos}
                        description={service.descripciont}
                      >
                        {service.tipo === 'NORMAL' ? 'Servicio Inmediato' : 'Servicio Programado'}
                        {service.tarifa && ` - $${service.tarifa.precio}`}
                      </SelectItem>
                    ))}
                  </Select>
                  {selectedServiceData && (
                    <p className="text-sm text-gray-600">
                      {selectedServiceData.descripciont}
                    </p>
                  )}
                </div>
              )}
            />

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

            <Button
              type="submit"
              color="primary"
              className="w-full"
              size="lg"
              isLoading={loading}
              isDisabled={Object.keys(errors).length > 0}
            >
              {loading ? "Procesando..." : "Solicitar Servicio"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}

const TimeOptionsSelect = ({ field, error }) => {
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
          const option = getTimeOptions().find(opt => opt.key === selectedKey);
          if (option) {
            field.onChange(option.value);
          }
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