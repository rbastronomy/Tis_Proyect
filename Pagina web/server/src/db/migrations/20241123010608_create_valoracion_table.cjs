exports.up = function(knex) {
    return knex.schema.createTable('valoracion', function(table) {
        table.integer('idvaloracion').primary();
        table.string('comentario', 256);
        table.integer('calificacion');
        table.timestamp('fvaloracion');
        table.string('estadov', 256);
        table.timestamp('deletedatvj');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('valoracion');
};
