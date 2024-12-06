exports.seed = async function(knex) {
  // Limpiar la tabla oferta
  await knex('oferta').del();

  // Crear las ofertas basadas en las tarifas y servicios existentes
  const ofertas = [
    // Servicio NORMAL (codigos: 1)
    {
      idtarifa: 1,  // Viaje al aeropuerto - Ida
      codigos: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      idtarifa: 2,  // Viaje al aeropuerto - Ida y Vuelta
      codigos: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      idtarifa: 3,  // Viaje al aeropuerto - Nocturno Ida
      codigos: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      idtarifa: 4,  // Viaje al aeropuerto - Nocturno Ida y Vuelta
      codigos: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      idtarifa: 7,  // Traslado dentro de Iquique
      codigos: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },

    // Servicio PROGRAMADO (codigos: 2)
    {
      idtarifa: 5,  // Viaje al aeropuerto - Programado Anticipado - Ida
      codigos: 2,   // Servicio PROGRAMADO
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      idtarifa: 6,  // Viaje al aeropuerto - Programado Anticipado - Ida y Vuelta
      codigos: 2,   // Servicio PROGRAMADO
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Insertar las ofertas
  await knex('oferta').insert(ofertas);
}; 