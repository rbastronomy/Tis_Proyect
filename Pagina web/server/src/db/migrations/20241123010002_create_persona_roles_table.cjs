exports.up = function(knex) {
    return knex.schema
        .createTable('posee', function(table) {
            // Foreign keys
            table.integer('id_permiso')
            .unsigned()
            .references('id_permiso')
            .inTable('permiso')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
            
        table.integer('id_roles')
            .unsigned()
            .references('id_roles')
            .inTable('roles')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        // Additional fields
        table.date('fecha_cambio_permiso');

        // Timestamps for record keeping
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('posee');
};
