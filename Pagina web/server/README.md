# Backend - Aplicación Web de Gestión de Taxis

Este es el backend de una aplicación web para la gestión de taxis en tiempo real, que forma parte de la carpeta "Pagina web". Está desarrollado utilizando Node.js, Fastify para el manejo de las consultas HTTP, Knex para migraciones de base de datos y Lucia Auth para la autenticación de usuarios.

## Estructura del Proyecto

- **Node.js**: Ejecuta el servidor backend.
- **Fastify**: Para manejar las consultas HTTP (GET, POST).
- **Knex**: Para manejar las migraciones y consultas de la base de datos.
- **Lucia Auth**: Para gestionar la autenticación de usuarios.

## Instalación

Para instalar y ejecutar el backend localmente, sigue los pasos a continuación.

### Requisitos Previos

Debes tener instalado lo siguiente:

- [Node.js](https://nodejs.org/) (se recomienda la versión 18.x.x o superior)
- npm (que se instala automáticamente con Node.js)
- Una base de datos compatible con Knex (PostgreSQL)

### Pasos

1. Clona el repositorio y navega al directorio `server`:
   ```bash
   git clone <url-del-repositorio>
   cd Pagina web/server
   ```


## Configuración de la base de datos

1. Descargar e instalar postgres en el siguiente enlace (https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

2. Crear una base de datos y usuario en postgres

3. Agregar las variables de entorno en el archivo .env

```bash
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

## Instalación

1. Instalar dependencias

```bash
npm install
```
2. Crear el archivo `.env` y agregar las variables de entorno de PostgreSQL como se muestra arriba.

3. Realiza las migraciones de base de datos con Knex:

```bash
npx knex migrate:latest
```
4. Iniciar el servidor con nodemon (asegúrate de tener nodemon instalado globalmente, https://www.npmjs.com/package/nodemon):

```bash
npm run dev
```


## Crear y ejecutar migraciones con Knex

1. Instalar Knex globalmente (una para el proyecto y otra global):

```bash
npm install -g knex
```

2. Crear una migración

```bash
knex migrate:make nombre_de_la_migracion
```

3. Ejecutar las migraciones

```bash
knex migrate:latest
```

4. Alternativamente, hacer rollback de la última migración:

```bash
knex migrate:rollback
```


5. Para hacer rollback de todas las migraciones:

```bash
knex migrate:rollback --all
```


6. También es posible utilizar los comandos `up` y `down` para ejecutar la siguiente migración o regresar a la anterior:

```bash
knex migrate:up
knex migrate:down
```

## Comandos Disponibles 

- `npm run dev`: Inicia el servidor en modo desarrollo utilizando Nodemon.
- `npm run build`: Compila el backend para producción.
- `npm run migrate`: Ejecuta las migraciones de la base de datos.
