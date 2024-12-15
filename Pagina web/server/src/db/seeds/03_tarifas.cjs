module.exports.seed = async function(knex) {
  // Clean the tables
  await knex('tarifa').del();

  // Insert seed data
  const tarifas = [
    // NORMAL SERVICE TARIFFS
    // Airport - To Airport (Ida)
    {
      id_tarifa: 1,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto',
      precio: 15000,
      tipo_tarifa: 'AEROPUERTO_IDA_DIA',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport - From Airport (Vuelta)
    {
      id_tarifa: 2,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje desde el aeropuerto',
      precio: 15000,
      tipo_tarifa: 'AEROPUERTO_VUELTA_DIA',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport Night - To Airport (Ida)
    {
      id_tarifa: 3,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Nocturno (22:00 - 06:00)',
      precio: 18000,
      tipo_tarifa: 'AEROPUERTO_IDA_NOCHE',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport Night - From Airport (Vuelta)
    {
      id_tarifa: 4,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje desde el aeropuerto - Nocturno (22:00 - 06:00)',
      precio: 18000,
      tipo_tarifa: 'AEROPUERTO_VUELTA_NOCHE',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // City - Day
    {
      id_tarifa: 5,
      rut_admin: 1,
      descripcion_tarifa: 'Traslado dentro de Iquique',
      precio: 5000,
      tipo_tarifa: 'CIUDAD_DIA',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // City - Night
    {
      id_tarifa: 6,
      rut_admin: 1,
      descripcion_tarifa: 'Traslado dentro de Iquique - Nocturno (22:00 - 06:00)',
      precio: 6000,
      tipo_tarifa: 'CIUDAD_NOCHE',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },

    // PROGRAMMED SERVICE TARIFFS (10% discount)
    // Airport - To Airport (Ida)
    {
      id_tarifa: 7,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto (Programado)',
      precio: 13500,
      tipo_tarifa: 'AEROPUERTO_IDA_DIA_PROG',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport - From Airport (Vuelta)
    {
      id_tarifa: 8,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje desde el aeropuerto (Programado)',
      precio: 13500,
      tipo_tarifa: 'AEROPUERTO_VUELTA_DIA_PROG',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport Night - To Airport (Ida)
    {
      id_tarifa: 9,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje al aeropuerto - Nocturno (22:00 - 06:00) (Programado)',
      precio: 16200,
      tipo_tarifa: 'AEROPUERTO_IDA_NOCHE_PROG',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport Night - From Airport (Vuelta)
    {
      id_tarifa: 10,
      rut_admin: 1,
      descripcion_tarifa: 'Viaje desde el aeropuerto - Nocturno (22:00 - 06:00) (Programado)',
      precio: 16200,
      tipo_tarifa: 'AEROPUERTO_VUELTA_NOCHE_PROG',
      estado_tarifa: 'ACTIVO',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  await knex('tarifa').insert(tarifas);
}; 