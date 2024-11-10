import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/ayuda')({
  component: Ayuda,
});

function Ayuda() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <main className="p-6">
        <h1 className="text-3xl font-bold mb-4">Formulario de Ayuda</h1>
        <div className="form-container bg-white p-6 rounded shadow-md">
          <form className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium">Nombre</label>
              <input type="text" id="nombre" name="nombre" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium">Número de Teléfono</label>
              <input type="tel" id="telefono" name="telefono" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">Correo Electrónico</label>
              <input type="email" id="email" name="email" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="asunto" className="block text-sm font-medium">Asunto</label>
              <input type="text" id="asunto" name="asunto" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
            </div>
            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium">Mensaje</label>
              <textarea id="mensaje" name="mensaje" rows="4" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Enviar</button>
          </form>
        </div>
      </main>
    </div>
  );
} 