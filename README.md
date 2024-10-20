# Tis_Proyect
# Indice:
- [Introducción](#Introducción)
- [Como instalar Nodejs y React](#Como-instalar-Nodejs-y-React)
  - [Instalar Nodejs](#Instalar-Nodejs)
  - [Configurar un nuevo proyecto](#Configurar-un-nuevo-proyecto)
  - [Instalar dependencias necesarias](#Instalar-dependencias-necesarias)
- [Verifica si npm está correctamente instalado](#Verifica-si-npm-está-correctamente-instalado)
  - [Recrea la carpeta npm](#Recrea-la-carpeta-npm)
  - [Limpiar la caché de npm](#Limpiar-la-caché-de-npm)
  - [Reinstalar npm globalmente](#Reinstalar-npm-globalmente)
  - [Ejecuta npm con permisos de administrador](#Verifica-permisos-del-directorio-npm)
  - [Verifica permisos del directorio npm](#Verifica-permisos-del-directorio-npm)
  - [Ejecuta ambos servidores](#Ejecuta-ambos-servidores)
- [Comentarios](#Comentarios)
# Introducción
Este repositorio tiene como funcion demostrar avances de nuestro proyecto de Taller de Ingenieria de Software para la empresa de Taxis del Aeropuerto Internacional General Diego Aracena Aguilar. Este es un proyecto web completo para la gestión de taxis en tiempo real, que incluye tanto el frontend como el backend. El proyecto está dividido en dos carpetas principales: una para el frontend y otra para el backend, ambas dentro de la carpeta `Pagina web`.
- - - -

## Estructura del proyecto
### 1. **Frontend** (`client/`)

El frontend está construido con **React**, **Vite** y **TanStack Router**. Proporciona una interfaz de usuario para interactuar con el sistema de gestión de taxis, mostrando la geolocalización y recomendación de rutas en tiempo real.

Para más detalles sobre cómo configurar y ejecutar el frontend, consulta el [README de client](./client/README.md).

### 2. **Backend** (`server/`)

El backend está desarrollado utilizando **Node.js**, **Fastify** para manejar las consultas HTTP, **Knex** para las migraciones y consultas de base de datos, y **Lucia Auth** para la autenticación de usuarios. Provee la API que alimenta al frontend con datos en tiempo real sobre taxis y rutas.

Para más información sobre la configuración del backend, revisa el [README de server](./server/README.md).


## Como instalar Nodejs y React
Sigue los pasos a continuación para instalar y ejecutar el proyecto completo en tu entorno local.

  ### Instalar Nodejs
  - Descarga Node.js: Ve al sitio oficial de Node.js y descarga la versión recomendada (LTS).
  - Verifica la instalación: Después de la instalación, abre una terminal (cmd o PowerShell en Windows) y ejecuta:
    ```bash
    node -v
    npm -v
    ```
  ## 1. Configuracion del proyecto
  ### Configurar un nuevo proyecto
  - Crea una carpeta para tu proyecto donde quieras guardarlo.
  - Abre la carpeta en VS Code.
  - Abre una terminal en VS Code y corre el siguiente comando para inicializar un nuevo proyecto de Node.js:
    ```bash
    npm init -y
    ```
  - Esto generará un archivo package.json con la configuración básica del proyecto.

  ### Clonar el repositorio
  - O puedes clonar el repositorio en tu máquina local:
    ```bash
    git clone <url-del-repositorio>
    cd Pagina web
    ```

  ## 2. Instalar dependencias necesarias
  - Para un proyecto con Node.js (para el backend) y React (para el frontend), vamos a instalar algunas dependencias.

  ### Configuración del Frontend:
  - Navega a la carpeta client e instala las dependencias del frontend:
    ```bash
    cd client
    npm install
    ```
  - Inicia el servidor de desarrollo para el frontend:
    ```bash
    npm run dev
    ```
El frontend estará disponible en http://localhost:3000.

### Configuración del Backend:
  - Navega a la carpeta server e instala las dependencias del backend:
    ```bash
    cd server
    npm install
    ```
    Configura las variables de entorno necesarias en el archivo .env dentro de la carpeta server, por ejemplo:
    ```bash
    DB_HOST=your_db_host
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name
    ```
    Realiza las migraciones de base de datos con Knex:
    ```bash
    npx knex migrate:latest
    ```
    Inicia el servidor de desarrollo para el backend:
    ```bash
    npm run dev
    ```
El backend estará disponible en http://localhost:4000.


# Verifica si npm está correctamente instalado
- Abre una terminal o consola en VS Code y verifica la instalación de npm y node ejecutando estos comandos:
  node -v
  npm -v
- Si alguno de estos comandos no devuelve una versión, puede que tengas un problema con la instalación de Node.js. Intenta reinstalarlo desde nodejs.org.

## Recrea la carpeta npm
- A veces, el directorio npm en la carpeta AppData\Roaming puede estar dañado o faltando. Puedes intentar crearla manualmente:
- Navega a la ruta: C:\Users\"nombre del usuario"\AppData\Roaming\.
- Si no existe la carpeta npm, créala manualmente.
- Luego, ejecuta el siguiente comando para asegurarte de que npm esté bien configurado:
  npm install -g npm
- Esto actualizará npm a la última versión.

## Limpiar la caché de npm
- Puede ser útil limpiar la caché de npm en caso de que esté corrupta:
  npm cache clean --force

## Reinstalar npm globalmente
- Si las soluciones anteriores no funcionan, intenta reinstalar npm globalmente:
  npm install -g npm

## Ejecuta npm con permisos de administrador
- Si el problema persiste, ejecuta VS Code como administrador:
- Cierra VS Code.
- Haz clic derecho en el icono de VS Code y selecciona "Ejecutar como administrador".
- Luego intenta nuevamente instalar React con:
  npx create-react-app client

## Verifica permisos del directorio npm
- Asegúrate de que tienes los permisos adecuados para acceder a la carpeta C:\Users\"Nombre del usuario"\AppData\Roaming\npm. Si no tienes permisos, debes ajustarlos o intentar instalar globalmente con:
  npm config set prefix "C:\Users\"Nombre del usuario"\AppData\Local\npm"
- Prueba estas soluciones y verifica si alguna de ellas resuelve el error. Si el problema persiste, por favor comparte el contenido del archivo de registro que mencionas para obtener más detalles (C:\Users\"Nombre del usuario"\AppData\Local\npm-cache\_logs\...).

## Ejecuta ambos servidores
- Con ambos servidores corriendo, el frontend y el backend estarán conectados, permitiendo que la aplicación funcione correctamente en desarrollo.
- Estará disponible en http://localhost:3000, mientras que tu backend estará en http://localhost:4000.

## Licencia
Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

