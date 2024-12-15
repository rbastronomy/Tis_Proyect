exports.up = function(knex) {
    return knex.schema.createTable('boleta', function(table) {
        table.increments('codigo_boleta').primary();
        table.float('total');
        table.timestamp('fecha_emision');
        table.string('metodo_pago', 256);
        table.string('descripcion_boleta', 256);
        table.string('estado_boleta', 256);
        table.timestamp('deleted_at_boleta');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('boleta');
};
