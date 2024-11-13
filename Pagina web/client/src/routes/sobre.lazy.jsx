import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/sobre')({
  component: Sobre,
});

function Sobre() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Sección 1 */}
      <main className="p-6 flex items-center justify-between bg-yellow-800 text-white">
        {/* Contenedor de texto */}
        <div className="w-1/2 pr-6">
          <h1 className="text-3xl font-bold mb-4">Sobre Nosotros</h1>
          <p className="text-lg">
            Taxi Aeropuerto Tarapacá es una empresa de servicios de transporte de pasajeros que opera en Iquique. Fue creada en el año 1997 y desde entonces ofrece un servicio especializado y capacitado que brinda al turista nacional y extranjero un transporte que inicia y finaliza sus servicios en el Aeropuerto, dando así la primera imagen de orden, atención y seguridad a todo visitante que llega al país a través del Aeropuerto Internacional Diego Aracena.
          </p>
        </div>

        {/* Imagen de propaganda */}
        <div className="w-1/2">
          <img 
            src="/src/assets/propaganda.jpg"  // Ruta de la imagen
            alt="Propaganda Taxi Aeropuerto" 
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>
      </main>

      {/* Sección 2 con el fondo color similar al borde de la imagen */}
      <section className="p-6 flex items-center justify-between bg-[#D4AF37] text-gray-900 border-l-8 border-yellow-800">
        {/* Imagen de viajes */}
        <div className="w-1/2">
          <img 
            src="/src/assets/viajes.jpg"  // Ruta de la nueva imagen
            alt="Viajes Taxi Aeropuerto"
            className="w-full h-auto rounded-lg shadow-lg border-4 border-yellow-800"  // Borde amarillo para la imagen
          />
        </div>

        {/* Textos de Misión y Visión */}
        <div className="w-1/2 pl-6">
          <h2 className="text-2xl font-bold mb-4">Misión</h2>
          <p className="text-lg mb-4">
            Ser una cooperativa de taxis pujante, sostenible y estructurada, para ofrecer el servicio público de transporte individual en la ciudad de Iquique aplicando criterios sociales en la prestación del servicio; con calidad y eficiencia para la comunidad en general. Transformando a nuestros usuarios en aliados estratégicos y comerciales, y generando oportunidades de desarrollo profesional y humano a nuestros colaboradores para contribuir decisivamente al crecimiento económico de la región.
          </p>

          <h2 className="text-2xl font-bold mb-4">Visión</h2>
          <p className="text-lg">
            Ser la empresa de taxis más competitiva y líder en el sector público de transporte individual de pasajeros en la ciudad de Iquique ofreciendo altos estándares de calidad a través de nuestros colaboradores y vehículos, así como la aplicación de tecnología enfocada a la mejora del servicio, para ser reconocida a nivel nacional por nuestro compromiso integral, innovación y excelencia.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Sobre;