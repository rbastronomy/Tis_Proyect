exports.up = function(knex) {
    return knex.schema.createTable('tarifa', function(table) {
        table.increments('id_tarifa').primary();
        table.integer('rut_admin')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');
        table.string('descripcion_tarifa', 256);
        table.float('precio').notNullable();
        table.string('tipo_tarifa', 256).notNullable();
        table.timestamp('fecha_creacion_tarifa').defaultTo(knex.fn.now());
        table.enum('estado_tarifa', ['ACTIVO', 'INACTIVO']).defaultTo('ACTIVO');
        table.timestamp('fecha_eliminacion_tarifa').nullable();

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('tarifa');
};
