# Backend del proyecto taxis tarapoca

## Configuración de la base de datos

1. Descargar e instalar postgres en el siguiente enlace (https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

2. Crear una base de datos y usuario en postgres

3. Agregar las variables de entorno en el archivo .env


## Instalación

1. Instalar dependencias

```bash
npm install
```

2. Crear archivo .env y agregar las variables de entorno de postgres

```bash
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

3. Iniciar servidor con nodemon (https://www.npmjs.com/package/nodemon)

```bash
npm run dev
```

## Crear y ejecutar migraciones con knex

Para esto hace falta instalar de forma aparte knex de forma global, es decir una para el proyecto y otra global.

```bash
npm install -g knex
```

1. Crear una migración

```bash
knex migrate:make nombre_de_la_migracion
```

2. Ejecutar las migraciones

```bash
knex migrate:latest
```

Alternativamente se puede hacer un rollback de la ultima migración

```bash
knex migrate:rollback
```

Para hacer rollback de todas las migraciones

```bash
knex migrate:rollback --all
```

También es posible utilizar los comandos up y down para ejecutar la siguiente migración o regresar a la anterior

```bash
knex migrate:up
knex migrate:down
```


