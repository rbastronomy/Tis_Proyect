import { createLazyFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { 
  Button,
  useDisclosure,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter
} from "@nextui-org/react"
import { Plus, Pencil, Trash2, Car, Calendar, Hash } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { FormModal } from '../../components/FormModal'

export const Route = createLazyFileRoute('/admin/taxis')({
  component: Taxis,
})

function Taxis() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [taxis, setTaxis] = useState([])
  const [loading, setLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedTaxi, setSelectedTaxi] = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [formData, setFormData] = useState({
    patente: '',
    marca: '',
    modelo: '',
    color: '',
    ano: null,
    vencimiento_revision_tecnica: '',
    vencimiento_permiso_circulacion: '',
    codigo_taxi: null,
    estado_taxi: 'DISPONIBLE'
  })

  const [errors, setErrors] = useState({})

  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure()
  const [taxiToDelete, setTaxiToDelete] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' })
      return
    }
    fetchTaxis()
  }, [isAuthenticated, user, navigate])

  const fetchTaxis = async () => {
    try {
      const response = await fetch('/api/taxis', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setTaxis(Array.isArray(data.taxis) ? data.taxis : data)
      } else {
        console.error('Error fetching taxis:', response.statusText)
        setTaxis([])
      }
    } catch (error) {
      console.error('Error fetching taxis:', error)
      setTaxis([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})

    try {
      const url = selectedTaxi 
        ? `/api/taxis/${selectedTaxi.patente}`
        : '/api/taxis/'
      
      const method = selectedTaxi ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la operación')
      }

      onClose()
      fetchTaxis()
      
    } catch (error) {
      console.error('Error:', error)
      setErrors({ submit: error.message })
    }
  }

  const handleDelete = (taxi) => {
    setTaxiToDelete(taxi)
    onDeleteModalOpen()
  }

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/taxis/${taxiToDelete.patente}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al eliminar')
      }

      fetchTaxis()
      onDeleteModalClose()
      
    } catch (error) {
      console.error('Error:', error)
      setErrors({ delete: error.message })
    }
  }

  const handleOpenModal = (taxi = null) => {
    if (taxi) {
      setSelectedTaxi(taxi)
      setFormData({
        patente: taxi.patente,
        marca: taxi.marca,
        modelo: taxi.modelo,
        color: taxi.color,
        ano: taxi.ano,
        vencimiento_revision_tecnica: taxi.vencimiento_revision_tecnica?.split('T')[0],
        vencimiento_permiso_circulacion: taxi.vencimiento_permiso_circulacion?.split('T')[0],
        codigo_taxi: taxi.codigo_taxi,
        estado_taxi: taxi.estado_taxi
      })
    } else {
      setSelectedTaxi(null)
      setFormData({
        patente: '',
        marca: '',
        modelo: '',
        color: '',
        ano: null,
        vencimiento_revision_tecnica: '',
        vencimiento_permiso_circulacion: '',
        codigo_taxi: null,
        estado_taxi: 'DISPONIBLE'
      })
    }
    onOpen()
  }

  const getStatusColor = (status) => {
    const statusColors = {
      'DISPONIBLE': 'success',
      'EN SERVICIO': 'primary',
      'FUERA DE SERVICIO': 'danger',
      'MANTENIMIENTO': 'warning'
    }
    return statusColors[status] || 'default'
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Taxis</h1>
        <Button 
          color="primary"
          className="font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          startContent={<Plus size={20} />}
          onPress={() => handleOpenModal()}
        >
          Nuevo Taxi
        </Button>
      </div>

      {taxis && taxis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {taxis.map((taxi) => (
            <motion.div
              key={taxi.patente}
              className="relative"
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredCard(taxi.patente)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {taxi.marca} {taxi.modelo}
                    </h3>
                    <p className="text-gray-600">{taxi.patente}</p>
                  </div>
                  <Chip 
                    color={getStatusColor(taxi.estado_taxi)}
                    variant="flat"
                    className="capitalize"
                  >
                    {taxi.estado_taxi.toLowerCase()}
                  </Chip>
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-center">
                    <Car className="w-4 h-4 mr-2" />
                    <span>
                      <strong className="text-gray-700">Color:</strong> {taxi.color}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      <strong className="text-gray-700">Año:</strong> {taxi.ano}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <Hash className="w-4 h-4 mr-2" />
                    <span>
                      <strong className="text-gray-700">Código:</strong> {taxi.codigo_taxi}
                    </span>
                  </p>
                </div>

                {hoveredCard === taxi.patente && (
                  <div className="absolute inset-0 bg-white bg-opacity-80 rounded-lg flex items-center justify-center space-x-2">
                    <Button
                      isIconOnly
                      color="warning"
                      variant="solid"
                      onPress={() => handleOpenModal(taxi)}
                      className="shadow-md"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      isIconOnly
                      color="danger"
                      variant="solid"
                      onPress={() => handleDelete(taxi)}
                      className="shadow-md"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay taxis para mostrar
        </div>
      )}

      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={selectedTaxi ? 'Editar Taxi' : 'Nuevo Taxi'}
      >
        <div className="grid grid-cols-2 gap-4">
          {errors.submit && (
            <div className="col-span-2 text-danger text-sm">
              {errors.submit}
            </div>
          )}
          
          <Input
            label="Patente"
            value={formData.patente}
            onChange={(e) => setFormData({...formData, patente: e.target.value.toUpperCase()})}
            isRequired
            isInvalid={!!errors.patente}
            errorMessage={errors.patente}
            disabled={!!selectedTaxi}
          />

          <Input
            label="Marca"
            value={formData.marca}
            onChange={(e) => setFormData({...formData, marca: e.target.value})}
            isRequired
            isInvalid={!!errors.marca}
            errorMessage={errors.marca}
          />

          <Input
            label="Modelo"
            value={formData.modelo}
            onChange={(e) => setFormData({...formData, modelo: e.target.value})}
            isRequired
            isInvalid={!!errors.modelo}
            errorMessage={errors.modelo}
          />

          <Input
            label="Color"
            value={formData.color}
            onChange={(e) => setFormData({...formData, color: e.target.value})}
            isRequired
            isInvalid={!!errors.color}
            errorMessage={errors.color}
          />

          <Input
            label="Año"
            type="number"
            value={formData.ano}
            onChange={(e) => setFormData({...formData, ano: e.target.value})}
            isRequired
            isInvalid={!!errors.ano}
            errorMessage={errors.ano}
          />

          <Input
            type="date"
            label="Vencimiento Revisión Técnica"
            value={formData.vencimiento_revision_tecnica}
            onChange={(e) => setFormData({...formData, vencimiento_revision_tecnica: e.target.value})}
            isRequired
            isInvalid={!!errors.vencimiento_revision_tecnica}
            errorMessage={errors.vencimiento_revision_tecnica}
          />

          <Input
            type="date"
            label="Vencimiento Permiso Circulación"
            value={formData.vencimiento_permiso_circulacion}
            onChange={(e) => setFormData({...formData, vencimiento_permiso_circulacion: e.target.value})}
            isRequired
            isInvalid={!!errors.vencimiento_permiso_circulacion}
            errorMessage={errors.vencimiento_permiso_circulacion}
          />

          <Input
            label="Código Taxi"
            type="number"
            value={formData.codigo_taxi}
            onChange={(e) => setFormData({...formData, codigo_taxi: e.target.value})}
            isRequired
            isInvalid={!!errors.codigo_taxi}
            errorMessage={errors.codigo_taxi}
          />

          <Select
            label="Estado"
            value={formData.estado_taxi}
            onChange={(e) => setFormData({...formData, estado_taxi: e.target.value})}
            isRequired
            isInvalid={!!errors.estado_taxi}
            errorMessage={errors.estado_taxi}
          >
            <SelectItem key="DISPONIBLE" value="DISPONIBLE">Disponible</SelectItem>
            <SelectItem key="EN_SERVICIO" value="EN SERVICIO">En Servicio</SelectItem>
            <SelectItem key="MANTENIMIENTO" value="MANTENIMIENTO">Mantenimiento</SelectItem>
            <SelectItem key="FUERA_DE_SERVICIO" value="FUERA DE SERVICIO">Fuera de Servicio</SelectItem>
          </Select>
        </div>
      </FormModal>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
          <ModalBody>
            <p>¿Está seguro que desea eliminar este taxi? Esta acción no se puede deshacer.</p>
          </ModalBody>
          <ModalFooter>
            <Button 
              color="default" 
              variant="light" 
              onPress={onDeleteModalClose}
            >
              Cancelar
            </Button>
            <Button 
              color="danger" 
              onPress={confirmDelete}
            >
              Eliminar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}
