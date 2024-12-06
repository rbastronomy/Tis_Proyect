exports.up = function(knex) {
    return knex.schema.createTable('reserva', function(table) {
        table.increments('codigoreserva').primary();
        table.integer('rut_cliente')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');


        //fk for oferta
        table.integer('id_combinacion')
            .unsigned()
            .references('id_combinacion')
            .inTable('oferta')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('origenv', 256);
        table.string('destinov', 256);
        table.timestamp('freserva');
        table.timestamp('frealizado');
        table.string('tipo', 256);
        table.text('observacion', 256);
        table.string('estados', 256);
        table.timestamp('deletedatre');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('reserva');
};
