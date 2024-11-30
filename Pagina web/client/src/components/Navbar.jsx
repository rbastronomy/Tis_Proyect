import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";
import { useAuth } from '../hooks/useAuth.jsx';

function Navbar() {
  const { isAuthenticated, user, logout, loading } = useAuth();

  if (loading) {
    return (
      <header className="bg-black text-white flex justify-between items-center p-4">
        <div id="logo-container" className="flex items-center">
          <img src="/logo.png" alt="Logo de Taxi Aeropuerto Tarapacá" id="logo-image" className="h-10 mr-2" />
          <div id="logo-text" className="text-lg font-bold">Aeropuerto Iquique Tarapacá</div>
        </div>
        <div className="animate-pulse bg-gray-600 h-8 w-24 rounded"></div>
      </header>
    );
  }

  return (
    <header className="bg-black text-white flex justify-between items-center p-4">
      <div id="logo-container" className="flex items-center">
        <img src="/logo.png" alt="Logo de Taxi Aeropuerto Tarapacá" id="logo-image" className="h-10 mr-2" />
        <div id="logo-text" className="text-lg font-bold">Aeropuerto Iquique Tarapacá</div>
      </div>
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
        {isAuthenticated ? (
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
      <div className="md:hidden">
        <Dropdown>
          <DropdownTrigger>
            <Button auto bordered color="warning" className="hover:bg-yellow-500 hover:text-black">
              Menú
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Navigation"
            className="bg-black border border-yellow-500 dark:border-yellow-500"
            itemClasses={{
              base: "data-[hover=true]:bg-yellow-500 data-[hover=true]:text-black",
            }}
          >
            <DropdownItem
              key="inicio"
              as="a"
              href="/"
              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Inicio
            </DropdownItem>
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
            {isAuthenticated ? (
              <>
                <DropdownItem
                  key="dashboard"
                  as="a"
                  href="/dashboard"
                  className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  Dashboard
                </DropdownItem>
                <DropdownItem
                  key="logout"
                  className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                  onClick={logout}
                >
                  Cerrar Sesión
                </DropdownItem>
              </>
            ) : (
              <>
                <DropdownItem
                  key="login"
                  as="a"
                  href="/login"
                  className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  Iniciar Sesión
                </DropdownItem>
                <DropdownItem
                  key="registro"
                  as="a"
                  href="/registro"
                  className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
                >
                  Registrarse
                </DropdownItem>
              </>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Navbar; 