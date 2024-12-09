exports.up = function(knex) {
    return knex.schema.createTable('viaje', function(table) {
        table.integer('codigo_viaje').primary();
        table.string('origen_viaje', 256);
        table.string('destino_viaje', 256);
        table.float('duracion');
        table.integer('pasajeros');
        table.string('observacion_viaje', 256);
        table.timestamp('fecha_viaje');
        table.string('estado_viaje', 256);
        table.timestamp('deleted_at_viaje');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('viaje');
};
