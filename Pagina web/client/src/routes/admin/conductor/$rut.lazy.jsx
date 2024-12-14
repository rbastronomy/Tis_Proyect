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
  Button
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
  ArrowLeft
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

  useEffect(() => {
    if (!isAuthenticated || user?.role?.nombre_rol !== 'ADMINISTRADOR') {
      navigate({ to: '/login' });
      return;
    }
    fetchConductor();
  }, [isAuthenticated, user, navigate, params.rut]);

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
    </div>
  );
} 