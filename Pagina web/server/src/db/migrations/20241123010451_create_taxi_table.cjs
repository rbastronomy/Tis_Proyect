exports.up = function(knex) {
    return knex.schema.createTable('taxi', function(table) {
        table.string('patente', 256).primary();
        
        // Foreign key to persona (driver)
        table.integer('rut_conductor')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        // Taxi information
        table.string('modelo', 256);
        table.string('marca', 256);
        table.float('ano');
        table.string('color', 256);
        table.timestamp('vencimiento_revision_tecnica');
        table.timestamp('vencimiento_permiso_circulacion');
        table.integer('codigo_taxi').notNullable();
        table.string('estado_taxi', 256);
        table.timestamp('deleted_at_taxi');

        // Unique constraints
        table.unique('codigo_taxi');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('taxi');
};
