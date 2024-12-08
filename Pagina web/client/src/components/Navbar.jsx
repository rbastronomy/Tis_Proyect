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

      {/* Desktop Navigation */}
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
        {isAuthenticated && (
          <>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
              as="a"
              href="/reservas"
            >
              Mis Reservas
            </Button>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
              as="a"
              href="/reservas/create"
            >
              Nueva Reserva
            </Button>
          </>
        )}
        <Dropdown>
          <DropdownTrigger>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
            >
              Taxi
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Taxi Options"
            className="bg-black border border-yellow-500 dark:border-yellow-500"
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
              Capturar posición
            </DropdownItem>
            <DropdownItem
              key="ruta"
              as="a"
              href="/taxi/ruta"
              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Ver Ruta
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Button
          auto
          bordered
          color="warning"
          className="hover:bg-yellow-500 hover:text-black"
          as="a"
          href="/contacto"
        >
          Contacto
        </Button>
        <Button
          auto
          bordered
          color="warning"
          className="hover:bg-yellow-500 hover:text-black"
          as="a"
          href="/sobre"
        >
          Sobre Nosotros
        </Button>
        <Button
          auto
          bordered
          color="warning"
          className="hover:bg-yellow-500 hover:text-black"
          as="a"
          href="/ayuda"
        >
          Ayuda
        </Button>
        {isAuthenticated && user?.role?.nombre_rol === 'ADMINISTRADOR' && (
          <Button
            auto
            bordered
            color="warning"
            className="hover:bg-yellow-500 hover:text-black"
            as="a"
            href="/admin/dashboard"
          >
            Panel Admin
          </Button>
        )}
        {isAuthenticated && isUserValid ? (
          <>
            <Button
              auto
              bordered
              color="warning"
              className="hover:bg-yellow-500 hover:text-black"
              as="a"
              href="/dashboard"
            >
              Dashboard
            </Button>
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
                className="bg-black border border-yellow-500 dark:border-yellow-500"
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
          </>
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