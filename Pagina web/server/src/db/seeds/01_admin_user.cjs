const argon2 = require('argon2');

exports.seed = async function(knex) {
  // Clean only the user table
  await knex('persona').del();
  
  // Hash password for admin
  const hashedPassword = await argon2.hash('admin123');

  // Insert admin user with direct role reference
  await knex('persona').insert([
    {
      rut: 1,
      nombre: 'Admin',
      correo: 'admin@taxiapp.com',
      contrasena: hashedPassword,
      telefono: '123456789',
      estado_persona: 'ACTIVO',
      id_roles: 1, // Reference to ADMINISTRADOR role
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('Admin user seeded:', {
    email: 'admin@taxiapp.com',
    password: 'admin123', // This is just for development
    role: 'ADMINISTRADOR'
  });
}; 