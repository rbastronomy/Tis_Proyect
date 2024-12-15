import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Chip,
  Divider,
  Avatar,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Tooltip,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { 
  User, 
  Calendar, 
  Phone, 
  Mail, 
  Flag, 
  IdCard, 
  Shield, 
  Clock,
  ArrowLeft,
  Car,
  Link,
  UnlinkIcon
} from 'lucide-react';

export const Route = createLazyFileRoute('/admin/conductor/$rut')({
  component: ConductorDetail
});

function ConductorDetail() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [conductor, setConductor] = useState(null);
  const [loading, setLoading] = useState(true);
  const params = Route.useParams();
  const [availableTaxis, setAvailableTaxis] = useState([]);
  const [assignedTaxis, setAssignedTaxis] = useState([]);
  const { 
    isOpen: isAssignModalOpen, 
    onOpen: onAssignModalOpen, 
    onClose: onAssignModalClose 
  } = useDisclosure();
  const [selectedTaxiToAssign, setSelectedTaxiToAssign] = useState(null);
  const [isLoadingTaxis, setIsLoadingTaxis] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' });
      return;
    }
    fetchConductor();
  }, [isAuthenticated, user, navigate, params.rut]);

  useEffect(() => {
    if (conductor) {
      fetchAssignedTaxis();
      fetchAvailableTaxis();
    }
  }, [conductor, params.rut]);

  const fetchConductor = async () => {
    try {
      const response = await fetch(`/api/users/drivers/${params.rut}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setConductor(data);
      }
    } catch (error) {
      console.error('Error fetching conductor:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedTaxis = async () => {
    setIsLoadingTaxis(true);
    try {
      const response = await fetch(`/api/taxis/driver/${params.rut}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAssignedTaxis(data || []);
      }
    } catch (error) {
      console.error('Error fetching assigned taxis:', error);
    } finally {
      setIsLoadingTaxis(false);
    }
  };

  const fetchAvailableTaxis = async () => {
    try {
      const response = await fetch('/api/taxis?status=DISPONIBLE', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTaxis(data.taxis || data || []);
      }
    } catch (error) {
      console.error('Error fetching available taxis:', error);
    }
  };

  const refreshTaxiData = () => {
    fetchAssignedTaxis();
    fetchAvailableTaxis();
  };

  const handleAssignTaxi = async () => {
    try {
      const response = await fetch(`/api/taxis/driver/${params.rut}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ patente: selectedTaxiToAssign }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to assign taxi');
      }

      refreshTaxiData();
      onAssignModalClose();
      setSelectedTaxiToAssign(null);
    } catch (error) {
      console.error('Error assigning taxi:', error);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'DISPONIBLE': 'success',
      'EN SERVICIO': 'primary',
      'FUERA DE SERVICIO': 'danger',
      'MANTENIMIENTO': 'warning'
    }
    return statusColors[status] || 'default'
  }

  const handleUnassignTaxi = async (patente) => {
    try {
      const response = await fetch(`/api/taxis/driver/${params.rut}/${patente}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to unassign taxi');
      }

      refreshTaxiData();
    } catch (error) {
      console.error('Error unassigning taxi:', error);
    }
  };

  const renderTaxisSection = () => (
    <Card className="mt-6">
      <CardHeader className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Taxis Asignados</h2>
        </div>
        <Button
          color="primary"
          variant="flat"
          startContent={<Link />}
          onPress={onAssignModalOpen}
        >
          Asignar Taxi
        </Button>
      </CardHeader>
      <Divider/>
      <CardBody>
        <Table aria-label="Taxis asignados">
          <TableHeader>
            <TableColumn>PATENTE</TableColumn>
            <TableColumn>MARCA</TableColumn>
            <TableColumn>MODELO</TableColumn>
            <TableColumn>ESTADO</TableColumn>
            <TableColumn>ACCIONES</TableColumn>
          </TableHeader>
          <TableBody>
            {isLoadingTaxis ? (
              <TableRow key="loading">
                <TableCell aria-colspan={5} colSpan={5} className="text-center">
                  Cargando...
                </TableCell>
                <TableCell className="hidden"></TableCell>
                <TableCell className="hidden"></TableCell>
                <TableCell className="hidden"></TableCell>
                <TableCell className="hidden"></TableCell>
              </TableRow>
            ) : assignedTaxis && assignedTaxis.length > 0 ? (
              assignedTaxis.map((taxi) => (
                <TableRow key={taxi.patente}>
                  <TableCell>{taxi.patente}</TableCell>
                  <TableCell>{taxi.marca}</TableCell>
                  <TableCell>{taxi.modelo}</TableCell>
                  <TableCell>
                    <Chip
                      color={getStatusColor(taxi.estado_taxi)}
                      variant="flat"
                      size="sm"
                    >
                      {taxi.estado_taxi}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Tooltip content="Desasignar taxi">
                      <Button
                        isIconOnly
                        color="danger"
                        variant="light"
                        onPress={() => handleUnassignTaxi(taxi.patente)}
                      >
                        <UnlinkIcon className="w-4 h-4" />
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow key="empty">
                <TableCell aria-colspan={5} colSpan={5} className="text-center">
                  No hay taxis asignados
                </TableCell>
                <TableCell className="hidden"></TableCell>
                <TableCell className="hidden"></TableCell>
                <TableCell className="hidden"></TableCell>
                <TableCell className="hidden"></TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!conductor) {
    return <div>Conductor no encontrado</div>;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        color="primary"
        variant="light"
        startContent={<ArrowLeft />}
        onPress={() => navigate({ to: '/admin/conductores' })}
        className="mb-6"
      >
        Volver a Conductores
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex gap-4 items-center">
            <Avatar
              name={conductor.nombre}
              size="lg"
              className="bg-primary text-white"
            />
            <div className="flex flex-col flex-grow">
              <h1 className="text-2xl font-bold">
                {conductor.nombre} {conductor.apellido_paterno} {conductor.apellido_materno}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">{conductor.rut}</span>
                <Chip
                  color={conductor.estado_persona === 'ACTIVO' ? 'success' : 'danger'}
                  variant="flat"
                  size="sm"
                >
                  {conductor.estado_persona}
                </Chip>
              </div>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{conductor.telefono}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Correo</p>
                    <p className="font-medium">{conductor.correo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nacionalidad</p>
                    <p className="font-medium">{conductor.nacionalidad}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Género</p>
                    <p className="font-medium">{conductor.genero}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha de Contratación</p>
                    <p className="font-medium">{formatDate(conductor.fecha_contratacion)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <IdCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Licencia de Conducir</p>
                    <p className="font-medium">Vence: {formatDate(conductor.licencia_conducir)}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Role & Permissions Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Rol y Permisos</h2>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{conductor.role.nombre_rol}</h3>
                <p className="text-sm text-gray-500">{conductor.role.descripcion_rol}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Permisos:</h4>
                <div className="space-y-2">
                  {conductor.role.permissions.map((permission) => (
                    <div key={permission.id_permiso} className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{permission.descripcion_permiso}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {renderTaxisSection()}

      <Modal isOpen={isAssignModalOpen} onClose={onAssignModalClose}>
        <ModalContent>
          <ModalHeader>Asignar Taxi</ModalHeader>
          <ModalBody>
            <Select
              label="Seleccionar Taxi"
              placeholder="Seleccione un taxi disponible"
              selectedKeys={selectedTaxiToAssign ? [selectedTaxiToAssign] : []}
              onChange={(e) => setSelectedTaxiToAssign(e.target.value)}
              classNames={{
                value: "text-default-700"
              }}
            >
              {availableTaxis.map((taxi) => (
                <SelectItem 
                  key={taxi.patente} 
                  value={taxi.patente}
                  textValue={`${taxi.patente} - ${taxi.marca} ${taxi.modelo}`}
                >
                  {taxi.patente} - {taxi.marca} {taxi.modelo}
                </SelectItem>
              ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={onAssignModalClose}>
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleAssignTaxi}
              isDisabled={!selectedTaxiToAssign}
            >
              Asignar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
} 