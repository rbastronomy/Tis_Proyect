exports.up = function(knex) {
    return knex.schema.createTable('persona', function(table) {
        // Primary key as string to match Lucia's expectations
        table.integer('rut').primary();
        
        // Personal information
        table.string('nombre', 256).notNullable();
        table.string('apellidop', 256);
        table.string('apellidom', 256);
        table.date('fnacimiento');
        table.string('correo', 256).notNullable();
        table.string('ntelefono', 20);
        table.string('nacionalidad', 256);
        table.string('genero', 256);
        table.string('contrasena', 256).notNullable();
        table.string('estadop', 256).defaultTo('ACTIVO');
        
        // Role reference
        table.integer('idroles')
            .unsigned()
            .references('idroles')
            .inTable('roles')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE')
            .defaultTo(2);
        
        // Employment information
        table.date('fcontratacion');
        table.date('licenciaconducir');
        table.date('adm_fcontratacion');
        table.integer('cviajes').defaultTo(0);

        table.timestamps(true, true);
    }).then(function() {
        // Add unique constraint in a separate step
        return knex.schema.alterTable('persona', function(table) {
            table.unique('correo', 'persona_correo_unique_idx');
        });
    });
};

exports.down = function(knex) {
    return knex.schema.hasTable('persona').then(function(exists) {
        if (exists) {
            return knex.schema.alterTable('persona', function(table) {
                table.dropUnique('correo', 'persona_correo_unique_idx');
            }).then(function() {
                return knex.schema.dropTable('persona');
            });
        }
    });
};
  