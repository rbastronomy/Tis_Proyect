exports.seed = async function(knex) {
  // Clean the table
  await knex('oferta').del();

  // Create offers based on services and tariffs
  const ofertas = [
    // NORMAL SERVICE (codigo_servicio: 1)
    // Airport Day Tariffs
    {
      id_tarifa: 1,  // To Airport - Day
      codigo_servicio: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 2,  // From Airport - Day
      codigo_servicio: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport Night Tariffs
    {
      id_tarifa: 3,  // To Airport - Night
      codigo_servicio: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 4,  // From Airport - Night
      codigo_servicio: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    // City Tariffs
    {
      id_tarifa: 5,  // City - Day
      codigo_servicio: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 6,  // City - Night
      codigo_servicio: 1,
      created_at: new Date(),
      updated_at: new Date()
    },

    // PROGRAMMED SERVICE (codigo_servicio: 2)
    // Airport Day Tariffs
    {
      id_tarifa: 7,  // To Airport - Day (Programmed)
      codigo_servicio: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 8,  // From Airport - Day (Programmed)
      codigo_servicio: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    // Airport Night Tariffs
    {
      id_tarifa: 9,  // To Airport - Night (Programmed)
      codigo_servicio: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 10,  // From Airport - Night (Programmed)
      codigo_servicio: 2,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Insert the offers
  await knex('oferta').insert(ofertas);
}; 