import { createLazyFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
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
  Chip,
  Card,
  CardBody,
  CardHeader
} from "@nextui-org/react";
import { useNavigate } from '@tanstack/react-router';
import { FleetMap } from '../../components/FleetMap';
import { useSocketContext } from '../../context/SocketContext';
import { WS_EVENTS } from '../../constants/WebSocketEvents';

export const Route = createLazyFileRoute('/admin/dashboard')({
  component: DashboardPage
});

function DashboardPage() {
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
  const [activeTaxis, setActiveTaxis] = useState(new Map());
  const { socket } = useSocketContext();

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' });
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Load initial data
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchBookings(),
          fetchDrivers(),
          fetchTaxis()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Socket connection for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Join admin room
    socket.emit(WS_EVENTS.JOIN_ADMIN_ROOM);

    // Listen for taxi location updates
    socket.on(WS_EVENTS.TAXI_LOCATION_UPDATE, (data) => {
      console.log('Received taxi location update:', data);
      setActiveTaxis(prev => {
        const updated = new Map(prev);
        updated.set(data.patente, data);
        return updated;
      });
    });

    // Listen for taxi disconnections
    socket.on(WS_EVENTS.TAXI_OFFLINE, ({ patente }) => {
      console.log('Taxi went offline:', patente);
      setActiveTaxis(prev => {
        const updated = new Map(prev);
        updated.delete(patente);
        return updated;
      });
    });

    return () => {
      socket.off(WS_EVENTS.TAXI_LOCATION_UPDATE);
      socket.off(WS_EVENTS.TAXI_OFFLINE);
    };
  }, [socket]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching bookings');
      const data = await response.json();
      setBookings(data.reservas || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/conductores', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching drivers');
      const data = await response.json();
      setDrivers(data.conductores || []);
    } catch (error) {
      console.error('Error:', error);
      // Fallback to mock data if API fails
      setDrivers([
        { rut: "123456789", nombre: "Juan Conductor" },
        { rut: "987654321", nombre: "Maria Conductora" }
      ]);
    }
  };

  const fetchTaxis = async () => {
    try {
      const response = await fetch('/api/taxis', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error fetching taxis');
      const data = await response.json();
      setTaxis(data.taxis || []);
    } catch (error) {
      console.error('Error:', error);
      // Fallback to mock data if API fails
      setTaxis([
        { patente: "ABC123", modelo: "Toyota Corolla" },
        { patente: "XYZ789", modelo: "Hyundai Accent" }
      ]);
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

      if (!response.ok) throw new Error('Error assigning driver');
      
      await fetchBookings();
      onClose();
    } catch (error) {
      console.error('Error:', error);
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
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando panel de administración...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Fleet Map Section */}
      <Card className="w-full">
        <CardHeader className="px-6 py-4">
          <h2 className="text-xl font-semibold">Flota Activa</h2>
        </CardHeader>
        <CardBody className="p-0" style={{ height: '500px' }}>
          <FleetMap activeTaxis={Array.from(activeTaxis.values())} />
        </CardBody>
      </Card>

      {/* Bookings Table Section */}
      <Card>
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
              <TableColumn>ACCIONES</TableColumn>
            </TableHeader>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.codigoreserva}>
                  <TableCell>{booking.codigoreserva}</TableCell>
                  <TableCell>{booking.origenv}</TableCell>
                  <TableCell>{booking.destinov}</TableCell>
                  <TableCell>
                    {new Date(booking.freserva).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip color={getStatusColor(booking.estados)} variant="flat">
                      {booking.estados}
                    </Chip>
                  </TableCell>
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

      {/* Assignment Modal */}
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
  );
}

export default DashboardPage; 