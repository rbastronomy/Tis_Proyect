# Frontend - Aplicación Web de Gestión de Taxis

Este es el frontend de una aplicación web para la gestión de taxis en tiempo real. El frontend está construido con React, Vite y TanStack Router. Proporciona una interfaz fácil de usar para visualizar la geolocalización de los taxis y las rutas recomendadas.

## Estructura del Proyecto

- **React**: Para construir los componentes de la interfaz de usuario.
- **Vite**: Para un desarrollo rápido con construcción eficiente.
- **TanStack Router**: Para manejar el enrutamiento del lado del cliente.

## Instalación

Para configurar y ejecutar el frontend localmente, sigue estos pasos:

### Requisitos Previos

Asegúrate de tener instalados:

- [Node.js](https://nodejs.org/) (se recomienda la versión 18.x.x o superior)
- npm (viene con Node.js)

### Pasos

1. Clona el repositorio y navega al directorio `client`:
   ```bash
   git clone <url-del-repositorio>
   cd cliente

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crear el archivo `.env` y agregar las variables de entorno de PostgreSQL como se muestra a continuación:

```bash
VITE_GOOGLE_MAPS_API_KEY=api de google maps
```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre la aplicación en tu navegador en http://localhost:3000.

## Comandos Disponibles

- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run build`: Construye la aplicación para producción.
- `npm run preview`: Previsualiza la aplicación construida.
