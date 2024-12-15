exports.up = function(knex) {
    return knex.schema.createTable('valoracion', function(table) {
        table.increments('id_valoracion').primary();
        table.string('comentario_valoracion', 256);
        table.integer('calificacion');
        table.timestamp('fecha_valoracion');
        table.string('estado_valoracion', 256);
        table.timestamp('deleted_at_valoracion');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('valoracion');
};
