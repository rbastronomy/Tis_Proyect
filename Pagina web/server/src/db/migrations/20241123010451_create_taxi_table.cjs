exports.up = function(knex) {
    return knex.schema.createTable('taxi', function(table) {
        table.string('patente', 256).primary();
        
        // Foreign key to persona (driver)
        table.integer('rut')
            .unsigned()
            .references('rut')
            .inTable('persona')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');

        // Taxi information
        table.string('modelo', 256);
        table.string('marco', 256);
        table.float('ano');
        table.string('color', 256);
        table.date('revisiontecnica');
        table.date('permisocirculacion');
        table.integer('codigotaxi').notNullable();
        table.string('estadotx', 256);
        table.string('deletedattx', 256);

        // Unique constraints
        table.unique('modelo');
        table.unique('ano');
        table.unique('revisiontecnica');
        table.unique('codigotaxi');
        table.unique('estadotx');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('taxi');
};
