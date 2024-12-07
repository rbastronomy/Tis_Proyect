exports.seed = async function(knex) {
  // Clean the services table
  await knex('servicio').del();

  // Insert services
  const services = [
    {
      codigo_servicio: 1,
      tipo_servicio: 'NORMAL',
      descripcion_servicio: 'Servicio normal de transporte al aeropuerto y dentro de la ciudad',
      estado_servicio: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      codigo_servicio: 2,
      tipo_servicio: 'PROGRAMADO',
      descripcion_servicio: 'Servicio programado - Reserve con anticipación para obtener mejores tarifas',
      estado_servicio: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('servicio').insert(services);
}; 