exports.up = function(knex) {
    return knex.schema.createTable('tarifa', function(table) {
        table.increments('id').primary();
        
        // Foreign key to persona (admin)
        table.integer('rut')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        table.string('descripciont', 256)
        table.float('precio').notNullable();
        table.enum('tipo', ['NORMAL', 'PROGRAMADO']).notNullable();
        table.timestamp('fcreada').defaultTo(knex.fn.now());
        table.enum('estadot', ['ACTIVO', 'INACTIVO']).defaultTo('ACTIVO');
        table.timestamp('deletedatt').nullable();

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('tarifa');
};
