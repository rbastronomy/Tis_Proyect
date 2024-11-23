exports.up = function(knex) {
    return knex.schema.createTable('boleta', function(table) {
        table.integer('codigoboleta').primary();
        table.float('total');
        table.date('femision');
        table.string('metodopago', 256);
        table.string('descripciont', 256);
        table.string('estadob', 256);
        table.date('deletedatbo');

        // Unique constraints
        table.unique('femision');
        table.unique('estadob');
        table.unique('metodopago');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('boleta');
};
