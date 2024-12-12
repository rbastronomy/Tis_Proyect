import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminLayout } from '../../components/AdminLayout';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Button,
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Select,
  SelectItem,
  Chip
} from "@nextui-org/react";
import { useNavigate } from '@tanstack/react-router';
import { FleetMap } from '../../components/FleetMap';
import { Card, CardBody, CardHeader } from "@nextui-org/react";

export const Route = createLazyFileRoute('/admin/dashboard')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [drivers, setDrivers] = useState([]);
  const [taxis, setTaxis] = useState([]);
  const [assignmentData, setAssignmentData] = useState({
    estados: 'APROBAR',
    rut_conductor: '',
    patente_taxi: '',
    observacion: ''
  });
  const [activeTaxis, setActiveTaxis] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' });
      return;
    }

    fetchBookings();
    fetchDrivers();
    fetchTaxis();
    fetchActiveTaxis();
  }, [isAuthenticated, user, navigate]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/reservas', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setBookings(data.reservas);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    // Mock data until we create the conductores endpoint
    setDrivers([
      { rut: 123456789, nombre: "Juan Conductor" },
      { rut: 987654321, nombre: "Maria Conductora" }
    ]);
  };

  const fetchTaxis = async () => {
    // Mock data until we create the taxis endpoint
    setTaxis([
      { patente: "ABC123", modelo: "Toyota Corolla" },
      { patente: "XYZ789", modelo: "Hyundai Accent" }
    ]);
  };

  const fetchActiveTaxis = async () => {
    try {
      // This will be replaced with actual API call when backend is ready
      setActiveTaxis([
        { 
          patente: "ABC123", 
          location: { lat: 40, lng: 50 },
          status: "OCCUPIED" 
        },
        { 
          patente: "XYZ789", 
          location: { lat: 45, lng: 55 },
          status: "AVAILABLE" 
        }
      ]);
    } catch (error) {
      console.error('Error fetching active taxis:', error);
    }
  };

  const handleAssignDriver = (booking) => {
    setSelectedBooking(booking);
    setAssignmentData({
      estados: 'APROBAR',
      rut_conductor: '',
      patente_taxi: '',
      observacion: ''
    });
    onOpen();
  };

  const handleSubmitAssignment = async () => {
    try {
      const response = await fetch(`/api/reservas/${selectedBooking.codigoreserva}/validate`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (response.ok) {
        await fetchBookings();
        onClose();
      } else {
        const error = await response.json();
        console.error('Error assigning driver:', error);
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'EN_REVISION': 'warning',
      'PENDIENTE': 'primary',
      'EN_CAMINO': 'secondary',
      'COMPLETADO': 'success',
      'RECHAZADO': 'danger'
    };
    return colors[status] || 'default';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fleet Map Section */}
          <Card className="col-span-full">
            <CardHeader className="px-6 py-4">
              <h2 className="text-xl font-semibold">Flota Activa</h2>
            </CardHeader>
            <CardBody>
              <FleetMap activeTaxis={activeTaxis} />
            </CardBody>
          </Card>

          {/* Bookings Table Section */}
          <Card className="col-span-full">
            <CardHeader className="px-6 py-4">
              <h2 className="text-xl font-semibold">Reservas Pendientes</h2>
            </CardHeader>
            <CardBody>
              <Table aria-label="Reservas de taxi">
                <TableHeader>
                  <TableColumn>CÓDIGO</TableColumn>
                  <TableColumn>ORIGEN</TableColumn>
                  <TableColumn>DESTINO</TableColumn>
                  <TableColumn>FECHA</TableColumn>
                  <TableColumn>ESTADO</TableColumn>
                  <TableColumn>TIPO</TableColumn>
                  <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.codigoreserva}>
                      <TableCell>{booking.codigoreserva}</TableCell>
                      <TableCell>{booking.origenv}</TableCell>
                      <TableCell>{booking.destinov}</TableCell>
                      <TableCell>{new Date(booking.freserva).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip color={getStatusColor(booking.estados)} variant="flat">
                          {booking.estados}
                        </Chip>
                      </TableCell>
                      <TableCell>{booking.tipo}</TableCell>
                      <TableCell>
                        {booking.estados === 'EN_REVISION' && (
                          <Button 
                            color="primary" 
                            size="sm"
                            onClick={() => handleAssignDriver(booking)}
                          >
                            Asignar Conductor
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>

        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalContent>
            <ModalHeader>Asignar Conductor y Taxi</ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                <Select
                  label="Acción"
                  value={assignmentData.estados}
                  onChange={(e) => setAssignmentData({
                    ...assignmentData,
                    estados: e.target.value
                  })}
                >
                  <SelectItem key="APROBAR" value="APROBAR">Aprobar</SelectItem>
                  <SelectItem key="RECHAZAR" value="RECHAZAR">Rechazar</SelectItem>
                </Select>

                {assignmentData.estados === 'APROBAR' && (
                  <>
                    <Select
                      label="Conductor"
                      value={assignmentData.rut_conductor}
                      onChange={(e) => setAssignmentData({
                        ...assignmentData,
                        rut_conductor: e.target.value
                      })}
                    >
                      {drivers.map(driver => (
                        <SelectItem key={driver.rut} value={driver.rut}>
                          {driver.nombre}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      label="Taxi"
                      value={assignmentData.patente_taxi}
                      onChange={(e) => setAssignmentData({
                        ...assignmentData,
                        patente_taxi: e.target.value
                      })}
                    >
                      {taxis.map(taxi => (
                        <SelectItem key={taxi.patente} value={taxi.patente}>
                          {taxi.patente} - {taxi.modelo}
                        </SelectItem>
                      ))}
                    </Select>
                  </>
                )}

                <Input
                  label="Observación"
                  value={assignmentData.observacion}
                  onChange={(e) => setAssignmentData({
                    ...assignmentData,
                    observacion: e.target.value
                  })}
                  required={assignmentData.estados === 'RECHAZAR'}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button color="primary" onPress={handleSubmitAssignment}>
                Confirmar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </AdminLayout>
  );
} 