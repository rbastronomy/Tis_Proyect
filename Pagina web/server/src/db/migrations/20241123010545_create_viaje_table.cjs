exports.up = function(knex) {
    return knex.schema.createTable('viaje', function(table) {
        table.integer('codigo').primary();
        table.string('origenv', 256);
        table.string('destinov', 256);
        table.float('duracion');
        table.integer('pasajeros');
        table.string('observacion', 256);
        table.string('estadov', 256);
        table.timestamp('deletedatvj');

        // Unique constraints
        table.unique('origenv');
        table.unique('destinov');
        table.unique('estadov');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('viaje');
};
