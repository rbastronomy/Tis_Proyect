const argon2 = require('argon2');

exports.seed = async function(knex) {
  // Clean only the user table
  await knex('persona').del();
  
  // Hash password for admin
  const hashedPassword = await argon2.hash('admin123');

  // Insert admin user with direct role reference
  const [adminUser] = await knex('persona').insert([
    {
      rut: 1,
      nombre: 'Admin',
      correo: 'admin@taxiapp.com',
      contrasena: hashedPassword,
      ntelefono: '123456789',
      estadop: 'ACTIVO',
      idroles: 1, // Direct reference to ADMINISTRADOR role
      created_at: new Date(),
      updated_at: new Date()
    }
  ]).returning('*');

  console.log('Admin user seeded:', {
    email: 'admin@taxiapp.com',
    password: 'admin123', // This is just for development
    role: 'ADMINISTRADOR'
  });
}; 