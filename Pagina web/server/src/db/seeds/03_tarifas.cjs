module.exports.seed = async function(knex) {
  // Clean the tables
  await knex('tarifa').del();

  // Insert seed data
  const tarifas = [
    {
      id_tarifa: 1,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Ida',
      precio: 15000,
      tipo_tarifa: 'IDA',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 2,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Ida y Vuelta',
      precio: 28000,
      tipo_tarifa: 'IDA_VUELTA',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 3,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Nocturno Ida (22:00 - 06:00)',
      precio: 18000,
      tipo_tarifa: 'NOCTURNO_IDA',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 4,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Nocturno Ida y Vuelta',
      precio: 34000,
      tipo_tarifa: 'NOCTURNO_IDA_VUELTA',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 7,
      rut_admin: 1,
      descripcion_tarifa: 'Traslado dentro de Iquique',
      precio: 5000,
      tipo_tarifa: 'TRASLADO_CIUDAD',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 5,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Programado Anticipado - Ida',
      precio: 14000,
      tipo_tarifa: 'PROGRAMADO_IDA',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 6,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Programado Anticipado - Ida y Vuelta',
      precio: 26000,
      tipo_tarifa: 'PROGRAMADO_IDA_VUELTA',
      
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('tarifa').insert(tarifas);
}; 