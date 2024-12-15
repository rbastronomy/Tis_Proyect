exports.up = function(knex) {
    return knex.schema.createTable('viaje', function(table) {
        table.increments('codigo_viaje').primary();
        table.string('origen_viaje').notNullable();
        table.string('destino_viaje').notNullable();
        table.integer('duracion').notNullable();
        table.integer('pasajeros').notNullable();
        table.string('observacion_viaje');
        table.timestamp('fecha_viaje').notNullable();
        table.string('estado_viaje').notNullable();
        table.timestamp('deleted_at_viaje');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('viaje');
};
