exports.up = function(knex) {
    return knex.schema.createTable('posee', function(table) {
        // Foreign keys
        table.integer('idpermisos')
            .unsigned()
            .references('idpermisos')
            .inTable('permiso')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
            
        table.integer('idroles')
            .unsigned()
            .references('idroles')
            .inTable('roles')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        // Additional fields
        table.date('fcambio');

        // Timestamps for record keeping
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('posee');
};
