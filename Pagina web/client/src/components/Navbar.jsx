import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/react";

function Navbar() {
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
            <DropdownItem
              key="login"
              as="a"
              href="/login"
              className="text-yellow-500 hover:bg-yellow-500 hover:text-black"
            >
              Iniciar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </header>
  );
}

export default Navbar; 