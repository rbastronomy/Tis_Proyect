exports.seed = async function(knex) {
  // Limpiar la tabla oferta
  await knex('oferta').del();

  // Crear las ofertas basadas en las tarifas y servicios existentes
  const ofertas = [
    // Servicio NORMAL (codigo_servicio: 1)
    {
      id_tarifa: 1,  // Viaje al aeropuerto - Ida
      codigo_servicio: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 2,  // Viaje al aeropuerto - Ida y Vuelta
      codigo_servicio: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 3,  // Viaje al aeropuerto - Nocturno Ida
      codigo_servicio: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 4,  // Viaje al aeropuerto - Nocturno Ida y Vuelta
      codigo_servicio: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 7,  // Traslado dentro de Iquique
      codigo_servicio: 1,   // Servicio NORMAL
      created_at: new Date(),
      updated_at: new Date()
    },

    // Servicio PROGRAMADO (codigo_servicio: 2)
    {
      id_tarifa: 5,  // Viaje al aeropuerto - Programado Anticipado - Ida
      codigo_servicio: 2,   // Servicio PROGRAMADO
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id_tarifa: 6,  // Viaje al aeropuerto - Programado Anticipado - Ida y Vuelta
      codigo_servicio: 2,   // Servicio PROGRAMADO
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  // Insertar las ofertas
  await knex('oferta').insert(ofertas);
}; 