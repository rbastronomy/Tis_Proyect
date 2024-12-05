exports.seed = async function(knex) {
  // Clean the services table
  await knex('servicio').del();

  // Insert services
  const services = [
    {
      codigos: 1,
      tipo: 'NORMAL',
      descripciont: 'Servicio normal de transporte al aeropuerto y dentro de la ciudad',
      estados: 'ACTIVO'
    },
    {
      codigos: 2,
      tipo: 'PROGRAMADO',
      descripciont: 'Servicio programado - Reserve con anticipación para obtener mejores tarifas',
      estados: 'ACTIVO'
    }
  ];

  await knex('servicio').insert(services);
}; 