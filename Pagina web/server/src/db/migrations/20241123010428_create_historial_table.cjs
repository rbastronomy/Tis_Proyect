exports.up = function(knex) {
    return knex.schema.createTable('historial', function(table) {
        table.integer('idhistorial').primary();
        table.date('fcambio');
        table.string('estadoh', 256);

        // Unique constraints
        table.unique('fcambio');
        table.unique('estadoh');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('historial');
};
