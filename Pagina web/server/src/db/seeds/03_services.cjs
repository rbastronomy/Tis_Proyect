exports.seed = async function(knex) {
  // Clean the table
  await knex('servicio').del();

  // Insert seed data
  await knex('servicio').insert([
    {
      codigos: 1,
      id: 1, // Reference to normal tarifa
      tipo: 'NORMAL',
      descripciont: 'Servicio inmediato - Llegada en 30 minutos',
      estados: 'ACTIVO'
    },
    {
      codigos: 2,
      id: 2, // Reference to programmed tarifa
      tipo: 'PROGRAMADO',
      descripciont: 'Servicio programado - Reserve con anticipación',
      estados: 'ACTIVO'
    }
  ]);
}; 