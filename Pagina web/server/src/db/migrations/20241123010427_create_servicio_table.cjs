exports.up = function(knex) {
    return knex.schema.createTable('servicio', function(table) {
        table.integer('codigos').primary();
        table.string('tipo', 256);
        table.string('descripciont', 256);
        table.string('estados', 256);
        table.timestamp('deleteats');

        // Unique constraints
        table.unique('tipo');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('servicio');
};
