module.exports.seed = async function(knex) {
  // Clean the tables
  await knex('tarifa').del();

  // Insert seed data
  const tarifas = [
    {
      id: 1,
      rut: 1,
      descripciont: 'Viaje al aeropuerto - Ida',
      precio: 15000,
      tipo: 'IDA',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      id: 2,
      rut: 1,
      descripciont: 'Viaje al aeropuerto - Ida y Vuelta',
      precio: 28000,
      tipo: 'IDA_VUELTA',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      id: 3,
      rut: 1,
      descripciont: 'Viaje al aeropuerto - Nocturno Ida (22:00 - 06:00)',
      precio: 18000,
      tipo: 'NOCTURNO_IDA',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      id: 4,
      rut: 1,
      descripciont: 'Viaje al aeropuerto - Nocturno Ida y Vuelta',
      precio: 34000,
      tipo: 'NOCTURNO_IDA_VUELTA',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      id: 7,
      rut: 1,
      descripciont: 'Traslado dentro de Iquique',
      precio: 5000,
      tipo: 'TRASLADO_CIUDAD',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      id: 5,
      rut: 1,
      descripciont: 'Viaje al aeropuerto - Programado Anticipado - Ida',
      precio: 14000,
      tipo: 'PROGRAMADO_IDA',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    },
    {
      id: 6,
      rut: 1,
      descripciont: 'Viaje al aeropuerto - Programado Anticipado - Ida y Vuelta',
      precio: 26000,
      tipo: 'PROGRAMADO_IDA_VUELTA',
      fcreada: new Date(),
      estadot: 'ACTIVO'
    }
  ];

  await knex('tarifa').insert(tarifas);
}; 