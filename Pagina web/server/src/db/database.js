import knex from 'knex';
import knexfile from '../../knexfile.js';

const db = knex(knexfile.development);

const connectDB = async () => {
  try {
    await db.raw('SELECT 1');
    console.log('Database connection established');
  } catch (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
};

export { db, connectDB };