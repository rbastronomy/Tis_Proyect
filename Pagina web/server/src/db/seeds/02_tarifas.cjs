module.exports.seed = async function(knex) {
  // Clean the table
  await knex('tarifa').del();

  // Insert seed data
  await knex('tarifa').insert([
    {
      rut: 1, // Admin user RUT
      descripciont: 'Tarifa para viajes inmediatos',
      precio: 1000,
      tipo: 'NORMAL',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      rut: 1,
      descripciont: 'Tarifa para viajes programados',
      precio: 1200,
      tipo: 'PROGRAMADO',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    }
  ]);
}; 