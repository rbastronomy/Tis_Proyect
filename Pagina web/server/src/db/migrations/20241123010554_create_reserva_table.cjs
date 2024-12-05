exports.up = function(knex) {
    return knex.schema.createTable('reserva', function(table) {
        table.increments('codigoreserva').primary();
        
        // Foreign key to historial
        table.integer('idhistorial')
            .references('idhistorial')
            .inTable('historial')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('origenv', 256);
        table.string('destinov', 256);
        table.timestamp('freserva');
        table.timestamp('frealizado');
        table.string('tipo', 256);
        table.string('observacion', 256);
        table.string('estados', 256);
        table.timestamp('deletedatre');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('reserva');
};
