exports.up = function(knex) {
    return knex.schema.createTable('historial', function(table) {
        table.increments('idhistorial').primary();
        table.string('estadoh', 256).notNullable();
        table.timestamp('fcambio').defaultTo(knex.fn.now());

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('historial');
};
