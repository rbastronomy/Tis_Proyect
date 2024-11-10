import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/sobre')({
  component: Sobre,
});

function Sobre() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Sobre Nosotros</h1>
        <p className="text-lg">
          Taxi aeropuerto Tarapacá es una empresa de servicios de transporte de pasajeros que opera en Iquique. fue creada en el año 1997 y desde entonces servicios transporte especializado y capacitado que ofrece al turista nacional y extranjero un servicio que inicia y finaliza sus servicios en el Aeropuerto; dando de esta forma la primera imagen de orden, atención y seguridad a todo visitante que llega al país a través del Aeropuerto Internacional Diego Aracena.
        </p>
      </main>
    </div>
  );
} 