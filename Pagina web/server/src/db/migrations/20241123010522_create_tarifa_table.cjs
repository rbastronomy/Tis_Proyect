exports.up = function(knex) {
    return knex.schema.createTable('tarifa', function(table) {
        table.integer('id').primary();
        
        // Foreign key to persona (admin)
        table.integer('rut')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('descripciont', 256);
        table.float('precio');
        table.string('tipo', 256);
        table.date('fcreada');
        table.string('estadot', 256);
        table.string('deletedatt', 256);

        // Unique constraints
        table.unique('precio');
        table.unique('tipo');
        table.unique('fcreada');
        table.unique('estadot');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('tarifa');
};
