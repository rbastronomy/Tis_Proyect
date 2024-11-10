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
            css={{
              backgroundColor: 'black',
              border: 'none',
            }}
          >
            <DropdownItem
              key="inicio"
              as="a"
              href="/"
              css={{
                backgroundColor: 'yellow',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'yellow',
                },
              }}
            >
              Inicio
            </DropdownItem>
            <DropdownItem
              key="contacto"
              as="a"
              href="/contacto"
              css={{
                backgroundColor: 'yellow',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'yellow',
                },
              }}
            >
              Contacto
            </DropdownItem>
            <DropdownItem
              key="sobre"
              as="a"
              href="/sobre"
              css={{
                backgroundColor: 'yellow',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'yellow',
                },
              }}
            >
              Sobre Nosotros
            </DropdownItem>
            <DropdownItem
              key="ayuda"
              as="a"
              href="/ayuda"
              css={{
                backgroundColor: 'yellow',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'yellow',
                },
              }}
            >
              Ayuda
            </DropdownItem>
            <DropdownItem
              key="login"
              as="a"
              href="/login"
              css={{
                backgroundColor: 'yellow',
                color: 'black',
                '&:hover': {
                  backgroundColor: 'black',
                  color: 'yellow',
                },
              }}
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