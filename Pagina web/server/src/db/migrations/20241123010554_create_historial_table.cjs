exports.up = function(knex) {
    return knex.schema.createTable('historial', function(table) {
        table.increments('id_historial').primary();
        table.string('estado_historial', 256).notNullable();
        table.text('observacion_historial', 256).notNullable();
        table.timestamp('fecha_cambio').defaultTo(knex.fn.now());
        table.string('accion', 256).notNullable();
        //fk to reserva
        table.integer('codigo_reserva')
            .unsigned()
            .references('codigo_reserva')
            .inTable('reserva')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('historial');
};
