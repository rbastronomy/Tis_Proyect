import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useRut } from '../../hooks/useRut';
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
} from "@nextui-org/react";
import { Plus, Pencil, Trash2, Phone, Mail, IdCard } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { FormModal } from '../../components/FormModal';

export const Route = createLazyFileRoute('/admin/conductores')({
  component: Conductores,
});

function Conductores() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [conductores, setConductores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    nacionalidad: '',
    genero: '',
    contrasena: '',
    confirmPassword: '',
    fecha_contratacion: '',
    licencia_conducir: '',
    estado_persona: 'ACTIVO'
  });
  const { rut, updateRut, isValid: isRutValid } = useRut();
  const { 
    isOpen: isDeleteModalOpen, 
    onOpen: onDeleteModalOpen, 
    onClose: onDeleteModalClose 
  } = useDisclosure();
  const [driverToDelete, setDriverToDelete] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' });
      return;
    }
    fetchConductores();
  }, [isAuthenticated, user, navigate]);

  const fetchConductores = async () => {
    try {
      const response = await fetch('/api/users/drivers', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setConductores(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching conductores:', error);
      setConductores([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (driver = null) => {
    if (driver) {
      setSelectedDriver(driver);
      updateRut(driver.rut);
      setFormData({
        nombre: driver.nombre,
        correo: driver.correo,
        telefono: driver.telefono,
        nacionalidad: driver.nacionalidad,
        genero: driver.genero,
        fecha_contratacion: driver.fecha_contratacion,
        licencia_conducir: driver.licencia_conducir,
        estado_persona: driver.estado_persona,
        contrasena: '',
        confirmPassword: ''
      });
    } else {
      setSelectedDriver(null);
      updateRut('');
      setFormData({
        nombre: '',
        correo: '',
        telefono: '',
        nacionalidad: '',
        genero: '',
        contrasena: '',
        confirmPassword: '',
        fecha_contratacion: '',
        licencia_conducir: '',
        estado_persona: 'ACTIVO'
      });
    }
    onOpen();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isRutValid) {
      console.error('RUT inválido');
      return;
    }

    const requiredFields = [
      'nombre', 
      'correo', 
      'telefono', 
      'nacionalidad', 
      'genero',
      'fecha_contratacion',
      'licencia_conducir'
    ];

    if (!selectedDriver) {
      requiredFields.push('contrasena', 'confirmPassword');
    }

    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      console.error('Campos requeridos faltantes:', missingFields);
      return;
    }

    if (!selectedDriver && formData.contrasena !== formData.confirmPassword) {
      console.error('Las contraseñas no coinciden');
      return;
    }

    try {
      onClose();

      if (!selectedDriver) {
        const accountResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            rut: rut.raw,
            nombre: formData.nombre,
            correo: formData.correo,
            telefono: formData.telefono,
            nacionalidad: formData.nacionalidad,
            genero: formData.genero,
            contrasena: formData.contrasena,
            fecha_contratacion: formData.fecha_contratacion,
            licencia_conducir: formData.licencia_conducir,
            estado_persona: formData.estado_persona,
            id_roles: 3,
            createSession: false
          })
        });

        if (!accountResponse.ok) {
          const error = await accountResponse.json();
          throw new Error(error.message || 'Error creating user account');
        }

        await fetchConductores();
        
        setFormData({
          nombre: '',
          correo: '',
          telefono: '',
          nacionalidad: '',
          genero: '',
          contrasena: '',
          confirmPassword: '',
          fecha_contratacion: '',
          licencia_conducir: '',
          estado_persona: 'ACTIVO'
        });
        updateRut('');
        
        return;
      }

      const url = `/api/users/drivers/${selectedDriver.rut}`;
      const driverResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          rut: rut.raw,
          nombre: formData.nombre,
          correo: formData.correo,
          telefono: formData.telefono,
          nacionalidad: formData.nacionalidad,
          genero: formData.genero,
          fecha_contratacion: formData.fecha_contratacion,
          licencia_conducir: formData.licencia_conducir,
          estado_persona: formData.estado_persona
        })
      });

      if (!driverResponse.ok) {
        const error = await driverResponse.json();
        throw new Error(error.message || 'Error updating driver');
      }

      await fetchConductores();

    } catch (error) {
      console.error('Error:', error);
      onOpen();
    }
  };

  const handleDelete = async (rut) => {
    setDriverToDelete(rut);
    onDeleteModalOpen();
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/users/drivers/${driverToDelete}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await fetchConductores();
      } else {
        const error = await response.json();
        console.error('Error deleting driver:', error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      onDeleteModalClose();
      setDriverToDelete(null);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }
  console.log(conductores);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Conductores</h1>
        <Button 
          color="primary"
          className="font-semibold shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          startContent={<Plus size={20} />}
          onPress={() => handleOpenModal()}
        >
          Nuevo Conductor
        </Button>
      </div>

      {conductores && conductores.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conductores.map((conductor) => (
            <motion.div
              key={conductor.rut}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-200"
              whileHover={{ scale: 1.03 }}
              onMouseEnter={() => setHoveredCard(conductor.rut)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="p-6 relative">
                {hoveredCard === conductor.rut && (
                  <motion.div
                    className="absolute inset-0 bg-black bg-opacity-5 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                      boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)',
                    }}
                  />
                )}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-semibold text-blue-600">
                    {conductor.rut}
                  </span>
                  <Chip
                    className="capitalize"
                    color={conductor.estado_persona === 'ACTIVO' ? 'success' : 'danger'}
                    variant="flat"
                    size="sm"
                  >
                    {conductor.estado_persona.toLowerCase()}
                  </Chip>
                </div>

                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  {`${conductor.nombre} ${conductor.apellido_paterno || ''} ${conductor.apellido_materno || ''}`}
                </h2>

                <div className="space-y-3 text-sm text-gray-600">
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span><strong className="text-gray-700">Teléfono:</strong> {conductor.telefono}</span>
                  </p>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span><strong className="text-gray-700">Email:</strong> {conductor.correo}</span>
                  </p>
                  <p className="flex items-center">
                    <IdCard className="w-4 h-4 mr-2 text-gray-400" />
                    <span><strong className="text-gray-700">Licencia hasta:</strong> {new Date(conductor.licencia_conducir).toLocaleDateString()}</span>
                  </p>
                  <p className="flex items-center">
                    <span><strong className="text-gray-700">Contratado:</strong> {new Date(conductor.fecha_contratacion).toLocaleDateString()}</span>
                  </p>
                  <p className="flex items-center">
                    <span><strong className="text-gray-700">Nacionalidad:</strong> {conductor.nacionalidad}</span>
                  </p>
                </div>

                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button 
                    isIconOnly 
                    size="sm" 
                    variant="light"
                    onPress={() => handleOpenModal(conductor)}
                  >
                    <Pencil size={18} />
                  </Button>
                  <Button 
                    isIconOnly 
                    size="sm" 
                    color="danger" 
                    variant="light"
                    onPress={() => handleDelete(conductor.rut)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No hay conductores para mostrar
        </div>
      )}

      <FormModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
        title={selectedDriver ? 'Editar Conductor' : 'Nuevo Conductor'}
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="RUT"
            value={rut.formatted}
            onChange={(e) => updateRut(e.target.value)}
            isInvalid={!isRutValid && rut.formatted !== ''}
            errorMessage={!isRutValid && rut.formatted !== '' ? "RUT inválido" : ""}
            isRequired
            disabled={!!selectedDriver}
          />
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
            isRequired
          />
          <Input
            label="Correo"
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData({...formData, correo: e.target.value})}
            isRequired
          />
          <Input
            label="Teléfono"
            value={formData.telefono}
            onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            isRequired
          />
          <Input
            label="Nacionalidad"
            value={formData.nacionalidad}
            onChange={(e) => setFormData({...formData, nacionalidad: e.target.value})}
            isRequired
          />
          <Select
            label="Género"
            value={formData.genero}
            onChange={(e) => setFormData({...formData, genero: e.target.value})}
            isRequired
          >
            <SelectItem key="MASCULINO" value="MASCULINO">Masculino</SelectItem>
            <SelectItem key="FEMENINO" value="FEMENINO">Femenino</SelectItem>
            <SelectItem key="OTRO" value="OTRO">Otro</SelectItem>
          </Select>
          <Input
            type="date"
            label="Fecha de Contratación"
            value={formData.fecha_contratacion}
            onChange={(e) => setFormData({...formData, fecha_contratacion: e.target.value})}
            isRequired
          />
          <Input
            type="date"
            label="Vencimiento Licencia de Conducir"
            value={formData.licencia_conducir}
            onChange={(e) => setFormData({...formData, licencia_conducir: e.target.value})}
            isRequired
          />
          <Select
            label="Estado"
            value={formData.estado_persona}
            onChange={(e) => setFormData({...formData, estado_persona: e.target.value})}
            isRequired
          >
            <SelectItem key="ACTIVO" value="ACTIVO">Activo</SelectItem>
            <SelectItem key="INACTIVO" value="INACTIVO">Inactivo</SelectItem>
          </Select>

          {!selectedDriver && (
            <>
              <Input
                type="password"
                label="Contraseña"
                value={formData.contrasena}
                onChange={(e) => setFormData({...formData, contrasena: e.target.value})}
                isRequired
              />
              <Input
                type="password"
                label="Confirmar Contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                isRequired
              />
            </>
          )}
        </div>
      </FormModal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={onDeleteModalClose}
        size="sm"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Confirmar Eliminación</ModalHeader>
          <ModalBody>
            <p>¿Está seguro que desea eliminar este conductor? Esta acción no se puede deshacer.</p>
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
  );
} 