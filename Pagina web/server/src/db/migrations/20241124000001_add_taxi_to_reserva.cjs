exports.up = function(knex) {
    return knex.schema.alterTable('reserva', function(table) {
        // Add the new foreign key columns
        table.integer('rut_conductor')
            .references('rut')
            .inTable('persona')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE')
            .nullable()
            .after('idhistorial'); // Places column after idhistorial

        table.string('patente_taxi')
            .references('patente')
            .inTable('taxi')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE')
            .nullable()
            .after('rut_conductor'); // Places column after rut_conductor
    });
};

exports.down = function(knex) {
    return knex.schema.alterTable('reserva', function(table) {
        // Remove the columns in reverse order
        table.dropColumn('patente_taxi');
        table.dropColumn('rut_conductor');
    });
}; 