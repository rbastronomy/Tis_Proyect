exports.up = function(knex) {
    return knex.schema.createTable('permiso', function(table) {
        table.integer('id_permisos').primary();
        table.string('nombre_permiso', 256);
        table.string('descripcion_permiso', 256);
        table.timestamp('fecha_creacion');
        table.unique('id_permisos');
        table.unique('nombre_permiso');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('permiso');
};
