exports.up = function(knex) {
    return knex.schema.createTable('reserva', function(table) {
        table.increments('codigo_reserva').primary();
        table.integer('rut_cliente')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');


        //fk for oferta
        table.integer('id_oferta')
            .unsigned()
            .references('id_oferta')
            .inTable('oferta')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('origen_reserva', 256);
        table.string('destino_reserva', 256);
        table.timestamp('fecha_reserva');
        table.timestamp('fecha_realizado');
        table.string('tipo_reserva', 256);
        table.text('observacion_reserva', 256);
        table.string('estado_reserva', 256);
        table.timestamp('deleted_at_reserva');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('reserva');
};
