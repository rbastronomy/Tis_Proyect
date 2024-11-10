import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/contacto')({
  component: Contacto,
});

function Contacto() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Contacto</h1>
        <p className="text-lg">
          Si tienes alguna pregunta o deseas comunicarte con nosotros, utiliza el formulario en la página de ayuda o contáctanos a través de nuestro número de teléfono.
        </p>
      </main>
    </div>
  );
} 