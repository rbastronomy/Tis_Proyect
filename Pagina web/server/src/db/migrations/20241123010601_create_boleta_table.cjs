exports.up = function(knex) {
    return knex.schema.createTable('boleta', function(table) {
        table.integer('codigoboleta').primary();
        table.float('total');
        table.date('femision');
        table.string('metodopago', 256);
        table.string('descripciont', 256);
        table.string('estadob', 256);
        table.date('deletedatbo');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('boleta');
};
