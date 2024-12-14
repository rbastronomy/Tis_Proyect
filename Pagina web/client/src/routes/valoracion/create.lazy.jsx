import { useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Button,
  Select,
  SelectItem,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Text,
  useToast,
} from '@nextui-org/react'
import { createLazyFileRoute } from '@tanstack/react-router'
import { useAuth } from '../contexts/AuthContext' // Adjust the import path as needed

export const Rating = createLazyFileRoute('/valoracion/create')({
  component: CreateRating,
})

function CreateRating() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [completedTrips, setCompletedTrips] = useState([])

  // Fetch completed trips for the current user
  useEffect(() => {
    const fetchCompletedTrips = async () => {
      if (!isAuthenticated) return

      try {
        const response = await fetch('/api/ratings/viajes/completados', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })

        if (response.ok) {
          const trips = await response.json()
          setCompletedTrips(trips)
        } else {
          toast({
            title: 'Error fetching trips',
            status: 'error',
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        toast({
          title: 'Network Error',
          description: 'Unable to fetch completed trips',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }

    fetchCompletedTrips()
  }, [isAuthenticated, user])

  // Redirect or show access denied if not authenticated
  if (
    !isAuthenticated ||
    !['ADMINISTRADOR', 'CLIENTE'].includes(user?.role?.nombre_rol)
  ) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gradient-to-b from-gray-50 to-white p-4 text-center">
        <Card className="w-full max-w-xl">
          <CardBody>
            <p className="justify-center items-center text-center">
              No tienes permisos para acceder a esta página
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }

  // Form handling
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      codigo_viaje: '',
      comentario_valoracion: '',
      calificacion: 0,
    },
  })

  // Submit handler
  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          ...data,
          rut: user.rut, // Add user's RUT to the rating
        }),
      })

      if (response.ok) {
        toast({
          title: 'Rating created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate({ to: '/ratings' }) // Adjust navigation as needed
      } else {
        const errorData = await response.json()
        toast({
          title: 'Error creating rating',
          description: errorData.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: 'Error creating rating',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Card>
        <CardHeader>
          <Text h2>Crear Valoración de Viaje</Text>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isRequired>
              <FormLabel>Seleccionar Viaje Completado</FormLabel>
              <Controller
                name="codigo_viaje"
                control={control}
                rules={{ required: 'Por favor selecciona un viaje' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    items={completedTrips}
                    placeholder="Selecciona un viaje que hayas completado"
                  >
                    {(trip) => (
                      <SelectItem
                        key={trip.codigo_viaje}
                        value={trip.codigo_viaje}
                      >
                        {trip.nombre_viaje} -{' '}
                        {new Date(trip.fecha_fin).toLocaleDateString()}
                      </SelectItem>
                    )}
                  </Select>
                )}
              />
              {errors.codigo_viaje && (
                <Text color="error" size="sm">
                  {errors.codigo_viaje.message}
                </Text>
              )}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Comentario</FormLabel>
              <Controller
                name="comentario_valoracion"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    placeholder="Comparte tu experiencia del viaje"
                  />
                )}
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Calificación (1-5)</FormLabel>
              <Controller
                name="calificacion"
                control={control}
                rules={{
                  required: 'La calificación es requerida',
                  min: {
                    value: 1,
                    message: 'La calificación debe ser al menos 1',
                  },
                  max: {
                    value: 5,
                    message: 'La calificación debe ser como máximo 5',
                  },
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min={1}
                    max={5}
                    placeholder="¿Qué tan satisfecho estás con tu viaje? (1-5)"
                  />
                )}
              />
              {errors.calificacion && (
                <Text color="error" size="sm">
                  {errors.calificacion.message}
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              color="primary"
              isLoading={loading}
              className="mt-4 w-full"
            >
              Enviar Valoración
            </Button>
          </form>
        </CardBody>
      </Card>
    </Box>
  )
}

export default CreateRating
