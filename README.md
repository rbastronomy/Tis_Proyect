# Tis_Proyect
# Indice:
- [Introducción](#Introducción)
- [Como instalar Node.js y React](#Como-instalar-Node.js-y-React)
  - [Instalar Node.js](##Instalar-Node.js)
  - [Configurar un nuevo proyecto](##Configurar-un-nuevo-proyecto)
  - [Instalar dependencias necesarias](##Instalar-dependencias-necesarias)
- [Verifica si npm está correctamente instalado](#Verifica-si-npm-está-correctamente-instalado)
  - [Recrea la carpeta npm](##Recrea-la-carpeta-npm)
  - [Limpiar la caché de npm](##Limpiar-la-caché-de-npm)
  - [Reinstalar npm globalmente](##Reinstalar-npm-globalmente)
  - [Ejecuta npm con permisos de administrador](##Verifica-permisos-del-directorio-npm)
  - [Verifica permisos del directorio npm](##Verifica-permisos-del-directorio-npm)
- [Comentarios](#Comentarios)
# Introducción
Este repositorio tiene como funcion demostrar avances de nuestro proyecto de Taller de Ingenieria de Software, consistira en una aplicación similar a Uber basado en el contexto de una empresa de Taxis del Aeropuerto Internacional General Diego Aracena Aguilar.
- - - -


# Como instalar Node.js y React
  ## Instalar Node.js
  - Descarga Node.js: Ve al sitio oficial de Node.js y descarga la versión recomendada (LTS).
  - Verifica la instalación: Después de la instalación, abre una terminal (cmd o PowerShell en Windows) y ejecuta:
    node -v
    npm -v
  ## Configurar un nuevo proyecto
  - Crea una carpeta para tu proyecto donde quieras guardarlo.
  - Abre la carpeta en VS Code.
  - Abre una terminal en VS Code y corre el siguiente comando para inicializar un nuevo proyecto de Node.js:
    npm init -y
  - Esto generará un archivo package.json con la configuración básica del proyecto.
  ## Instalar dependencias necesarias
  - Para un proyecto con Node.js (para el backend) y React (para el frontend), vamos a instalar algunas dependencias.
  - Primero, instala Express (un framework para crear el servidor con Node.js) en tu terminal:
    npm install express
  - Para instalar React y configurar la parte del frontend, puedes usar Create React App, una herramienta que facilita la creación de proyectos de React
    npx create-react-app client
  - Esto creará una carpeta client con todo el código necesario de React.

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
- Asegúrate de que tienes los permisos adecuados para acceder a la carpeta C:\Users\Renat\AppData\Roaming\npm. Si no tienes permisos, debes ajustarlos o intentar instalar globalmente con:
  npm config set prefix "C:\Users\"Nombre del usuario"\AppData\Local\npm"
- Prueba estas soluciones y verifica si alguna de ellas resuelve el error. Si el problema persiste, por favor comparte el contenido del archivo de registro que mencionas para obtener más detalles (C:\Users\Renat\AppData\Local\npm-cache\_logs\...).
    
## Comentarios
