import dotenv from 'dotenv';
import process from 'process'; // Add this line to make process available

dotenv.config();

export default {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    },
    migrations: {
      getNewMigrationName: (migrationName) => {
        return `${+new Date()}-${migrationName}.js`;
      },
      directory: './src/db/migrations',
      extension: 'cjs',
    },
    seeds: {
      directory: './src/db/seeds',
      seedOrder: [
        '00_roles_permissions.cjs',
        '01_admin_user.cjs',
        '02_services.cjs',
        '03_tarifas.cjs'
      ]
    }
  },
};