import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/contacto')({
  component: Contacto,
});

function Contacto() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Sección de contacto con fondo amarillo oscuro */}
      <main className="p-6 bg-yellow-800 text-white">
        <h1 className="text-3xl font-bold mb-4">Contacto</h1>
        <p className="text-lg mb-4">
          Si tienes alguna pregunta, consulta o necesitas más información sobre nuestros servicios, no dudes en ponerte en contacto con nosotros. Estamos aquí para ayudarte.
        </p>
        <p className="text-lg mb-4">
          Puedes llamarnos, escribirnos a nuestro correo, o seguirnos en nuestras redes sociales para estar al tanto de las últimas noticias y promociones.
        </p>

        {/* Imagen de contacto */}
        <div className="mt-6">
          <img 
            src="/src/assets/contacto.jpg"  // Ruta de la imagen
            alt="Contacto Taxi Aeropuerto"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </main>

      {/* Footer con las plataformas de contacto */}
      <footer className="bg-gray-900 text-white py-6 mt-6">
        <div className="container mx-auto text-center">
          <h3 className="text-xl font-bold mb-2">¡Conéctate con nosotros!</h3>
          <div className="flex justify-center space-x-6 mb-4">
            {/* Instagram */}
            <a href="https://www.instagram.com/taxi_tarapaca" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500">
              Instagram: @taxi_tarapaca
            </a>
            {/* Facebook */}
            <a href="https://www.facebook.com/TAXITARAPACA" target="_blank" rel="noopener noreferrer" className="text-white hover:text-yellow-500">
              Facebook: TAXITARAPACA
            </a>
          </div>
          <div className="flex justify-center space-x-6 mb-4">
            {/* Teléfono */}
            <a href="tel:+5752419004" className="text-white hover:text-yellow-500">
              Teléfono: (57) 241 9004
            </a>
            {/* Correo */}
            <a href="mailto:reservas@taxistarapaca.cl" className="text-white hover:text-yellow-500">
              Correo: reservas@taxistarapaca.cl
            </a>
          </div>
          <div className="mt-4 text-sm">
            <p>&copy; 2024 Taxi Aeropuerto Tarapacá. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Contacto;
