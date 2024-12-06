exports.up = function(knex) {
    return knex.schema.createTable('servicio', function(table) {
        table.integer('codigo_servicio').primary();
        table.string('tipo_servicio', 256);
        table.string('descripcion_servicio', 256);
        table.string('estado_servicio', 256);
        table.timestamp('delete_at');

        // Unique constraints
        table.unique('tipo_servicio');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('servicio');
};
