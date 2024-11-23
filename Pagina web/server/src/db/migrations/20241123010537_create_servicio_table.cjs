exports.up = function(knex) {
    return knex.schema.createTable('servicio', function(table) {
        table.integer('codigos').primary();
        
        // Foreign key to tarifa
        table.integer('id')
            .notNullable()
            .references('id')
            .inTable('tarifa')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('tipo', 256);
        table.string('descripciont', 256);
        table.string('estados', 256);
        table.date('deleteats');

        // Unique constraints
        table.unique('estados');
        table.unique('tipo');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('servicio');
};
