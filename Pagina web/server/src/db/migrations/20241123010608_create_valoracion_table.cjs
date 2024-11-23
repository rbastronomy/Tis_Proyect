exports.up = function(knex) {
    return knex.schema.createTable('valoracion', function(table) {
        table.integer('idvaloracion').primary();
        table.string('comentario', 256);
        table.integer('calificacion');
        table.date('fvaloracion');
        table.string('estadov', 256);
        table.date('deletedatvj');

        // Unique constraints
        table.unique('calificacion');
        table.unique('fvaloracion');
        table.unique('estadov');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('valoracion');
};
