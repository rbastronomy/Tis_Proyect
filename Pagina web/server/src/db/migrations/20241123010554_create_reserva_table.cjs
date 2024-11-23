exports.up = function(knex) {
    return knex.schema.createTable('reserva', function(table) {
        table.integer('codigoreserva').primary();
        
        // Foreign key to historial
        table.integer('idhistorial')
            .references('idhistorial')
            .inTable('historial')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('origenv', 256);
        table.string('destinov', 256);
        table.date('freserva');
        table.date('frealizado');
        table.string('tipo', 256);
        table.string('observacion', 256);
        table.string('estados', 256);
        table.date('deletedatre');

        // Unique constraints
        table.unique('origenv');
        table.unique('destinov');
        table.unique('freserva');
        table.unique('frealizado');
        table.unique('estados');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('reserva');
};
