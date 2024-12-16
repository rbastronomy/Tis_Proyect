import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { useAuth } from '../hooks/useAuth.jsx';
import { useNavigate } from '@tanstack/react-router';

function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Navbar render state:', {
    isAuthenticated,
    user,
    loading
  });

  const isUserValid = user && typeof user === 'object' && 'nombre' in user;

  const handleNavigation = (path) => {
    navigate({ to: path });
  };

  const handleLogout = async () => {
    console.log('Logout clicked');
    await logout();
  };

  console.log(user?.role?.nombre_rol);

  const menuItems = [
    { key: "/", label: "Inicio" },
    ...(isAuthenticated ? [
      { key: "/reservas", label: "Mis Reservas" },
      { key: "/reservas/create", label: "Nueva Reserva" }
    ] : []),
    { key: "/taxi", label: "Capturar posición" },
    { key: "/taxi/ruta", label: "Ver Ruta" },
    { key: "/contacto", label: "Contacto" },
    { key: "/sobre", label: "Sobre Nosotros" },
    { key: "/ayuda", label: "Ayuda" },
    ...(isAuthenticated && user?.role?.nombre_rol === 'ADMINISTRADOR' 
      ? [{ key: "/admin/dashboard", label: "Panel Admin" }] 
      : []
    ),
    // Nuevo botón para ADMINISTRADOR y CONDUCTOR
    ...(isAuthenticated && (user?.role?.nombre_rol === 'ADMINISTRADOR' || user?.role?.nombre_rol === 'CONDUCTOR')
    ? [{ key: "/viajes", label: "Mis Viajes" }]
    : []
    ),
  ];

  const authMenuItems = isAuthenticated && isUserValid
    ? [
        { key: "logout", label: "Cerrar Sesión" }
      ]
    : [
        { key: "/login", label: "Iniciar Sesión" },
        { key: "/registro", label: "Registrarse" }
      ];

  return (
    <header className="bg-black text-white flex justify-between items-center p-4">
      <div id="logo-container" className="flex items-center">
        <img src="/logo.png" alt="Logo de Taxi Aeropuerto Tarapacá" id="logo-image" className="h-10 mr-2" />
        <div id="logo-text" className="text-lg font-bold">Aeropuerto Iquique Tarapacá</div>
      </div>

      {/* Desktop Navigation - Reorganized with grouped dropdowns */}
      <nav className="hidden md:flex space-x-4">
        <Button
          auto
          bordered
          color="warning"
          className="hover:bg-yellow-500 hover:text-black"
          as="a"
          href="/"
        >
          Inicio
        </Button>

        {/* Reservas Dropdown */}
        {isAuthenticated && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                auto
                bordered
                color="warning"
                className="hover:bg-yellow-500 hover:text-black"
              >
                Reservas
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Reservas Options"
              className="bg-black border border-yellow-500"
              itemClasses={{
                base: "data-[hover=true]:bg-yellow-500 data-[hover=true]:text-black",
              }}
            >
              <DropdownItem
                key="mis-reservas"
                as="a"
                href="/reservas"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Mis Reservas
              </DropdownItem>
              <DropdownItem
                key="nueva-reserva"
                as="a"
                href="/reservas/create"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Nueva Reserva
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        {/* Taxi/Driver Dropdown - Updated labels */}
        {isAuthenticated && user?.role?.nombre_rol === 'CONDUCTOR' ? (
          <Dropdown>
            <DropdownTrigger>
              <Button
                auto
                bordered
                color="warning"
                className="hover:bg-yellow-500 hover:text-black"
              >
                Panel Conductor
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Driver Options"
              className="bg-black border border-yellow-500"
              itemClasses={{
                base: "data-[hover=true]:bg-yellow-500 data-[hover=true]:text-black",
              }}
            >
              <DropdownItem
                key="taxi"
                as="a"
                href="/taxi"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Panel de Control
              </DropdownItem>
              <DropdownItem
                key="ruta"
                as="a"
                href="/taxi/ruta"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Calcular Ruta
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : null}

        {/* Información Dropdown */}
        <Dropdown>
          <DropdownTrigger>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
            >
              Información
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Information Options"
            className="bg-black border border-yellow-500"
            itemClasses={{
              base: "data-[hover=true]:bg-yellow-500 data-[hover=true]:text-black",
            }}
          >
            <DropdownItem
              key="contacto"
              as="a"
              href="/contacto"
              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Contacto
            </DropdownItem>
            <DropdownItem
              key="sobre"
              as="a"
              href="/sobre"
              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Sobre Nosotros
            </DropdownItem>
            <DropdownItem
              key="ayuda"
              as="a"
              href="/ayuda"
              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Ayuda
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Admin/Driver Section */}
        {isAuthenticated && (user?.role?.nombre_rol === 'ADMINISTRADOR' || user?.role?.nombre_rol === 'CONDUCTOR') && (
          <Dropdown>
            <DropdownTrigger>
              <Button
                auto
                bordered
                color="warning"
                className="hover:bg-yellow-500 hover:text-black"
              >
                Gestión
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Management Options"
              className="bg-black border border-yellow-500"
              itemClasses={{
                base: "data-[hover=true]:bg-yellow-500 data-[hover=true]:text-black",
              }}
            >
              {user?.role?.nombre_rol === 'ADMINISTRADOR' && 
                <DropdownItem
                  key="admin"
                  as="a"
                  href="/admin/dashboard"
                  className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  Panel Admin
                </DropdownItem>
              }
              {user?.role?.nombre_rol === 'ADMINISTRADOR' && 
                <DropdownItem
                  key="reports"
                  as="a"
                  href="/admin/report"
                  className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  Reportes
                </DropdownItem>
              }
              <DropdownItem
                key="viajes"
                as="a"
                href="/viajes"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Mis Viajes
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        )}

        {/* User Menu - Already exists, remains mostly the same */}
        {isAuthenticated && isUserValid ? (
          <Dropdown>
            <DropdownTrigger>
              <Button
                auto
                bordered
                color="warning"
                className="hover:bg-yellow-500 hover:text-black"
              >
                {user.nombre}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="User Options"
              className="bg-black border border-yellow-500"
              itemClasses={{
                base: "data-[hover=true]:bg-yellow-500 data-[hover=true]:text-black",
              }}
            >
              <DropdownItem
                key="profile"
                as="a"
                href="/profile"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Perfil
              </DropdownItem>
              <DropdownItem
                key="settings"
                as="a"
                href="/settings"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
              >
                Configuración
              </DropdownItem>
              <DropdownItem
                key="logout"
                className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                onClick={logout}
              >
                Cerrar Sesión
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        ) : (
          <>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
              as="a"
              href="/login"
            >
              Iniciar Sesión
            </Button>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
              as="a"
              href="/registro"
            >
              Registrarse
            </Button>
          </>
        )}
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Dropdown
          showArrow={true}
          classNames={{
            base: "before:bg-black",
            content: "bg-black/90 backdrop-blur-sm border border-yellow-500",
          }}
        >
          <DropdownTrigger>
            <Button 
              auto 
              bordered 
              color="warning"
              className="hover:bg-yellow-500 hover:text-black transition-colors"
            >
              Menú
            </Button>
          </DropdownTrigger>
          <DropdownMenu 
            aria-label="Mobile Navigation"
            itemClasses={{
              base: [
                "rounded-lg",
                "text-yellow-500",
                "transition-colors",
                "hover:bg-yellow-500",
                "hover:text-black",
                "data-[hover=true]:bg-yellow-500",
                "data-[hover=true]:text-black",
                "data-[selectable=true]:focus:bg-yellow-500",
                "data-[selectable=true]:focus:text-black",
                "data-[pressed=true]:opacity-70",
                "data-[focus-visible=true]:ring-yellow-500"
              ],
              description: "text-yellow-400",
              divider: "bg-yellow-500/20",
              title: [
                "text-yellow-500",
                "font-bold",
                "group-hover:text-black",
                "data-[hover=true]:text-black"
              ],
              shortcut: "text-yellow-500/50",
            }}
            variant="flat"
            selectionMode="single"
            selectedKeys={new Set([])}
            onSelectionChange={(keys) => {
              const key = Array.from(keys)[0];
              if (key === "logout") {
                handleLogout();
              } else {
                handleNavigation(key);
              }
            }}
          >
            {[...menuItems, ...authMenuItems].map((item) => (
              <DropdownItem 
                key={item.key} 
                textValue={item.label}
                className="px-4 py-3 my-1 first:mt-2 last:mb-2 group"
                classNames={{
                  base: "rounded-lg transition-colors",
                  title: "font-semibold text-base"
                }}
              >
                {item.label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Navbar; 