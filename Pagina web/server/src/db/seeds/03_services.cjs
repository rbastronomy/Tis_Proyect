exports.seed = async function(knex) {
  // Clean the tables in correct order
  await knex('servicio_tarifa').del();
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

  // Insert service-tarifa relationships
  const servicioTarifaRelations = [
    // Normal service gets regular, night and city transfer tariffs
    { servicio_id: 1, tarifa_id: 1 }, // Regular IDA
    { servicio_id: 1, tarifa_id: 2 }, // Regular IDA_VUELTA
    { servicio_id: 1, tarifa_id: 3 }, // NOCTURNO_IDA
    { servicio_id: 1, tarifa_id: 4 }, // NOCTURNO_IDA_VUELTA
    { servicio_id: 1, tarifa_id: 7 }, // TRASLADO_CIUDAD
    
    // Programmed service gets programmed tariffs
    { servicio_id: 2, tarifa_id: 5 }, // PROGRAMADO_IDA
    { servicio_id: 2, tarifa_id: 6 }  // PROGRAMADO_IDA_VUELTA
  ];

  await knex('servicio_tarifa').insert(servicioTarifaRelations);
}; 