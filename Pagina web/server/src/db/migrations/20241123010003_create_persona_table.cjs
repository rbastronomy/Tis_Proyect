exports.up = function(knex) {
    return knex.schema.createTable('persona', function(table) {
        // Primary key as string to match Lucia's expectations
        table.integer('rut').primary();
        
        // Personal information
        table.string('nombre', 256).notNullable();
        table.string('apellido_paterno', 256);
        table.string('apellido_materno', 256);
        table.date('fecha_nacimiento');
        table.string('correo', 256).notNullable();
        table.string('telefono', 20);
        table.string('nacionalidad', 256);
        table.string('genero', 256);
        table.string('contrasena', 256).notNullable();
        table.string('estado_persona', 256).defaultTo('ACTIVO');
        
        // Role reference
        table.integer('id_roles')
            .unsigned()
            .references('id_roles')
            .inTable('roles')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE')
            .defaultTo(2);
        
        // Employment information
        table.timestamp('fecha_contratacion');
        table.timestamp('licencia_conducir');

        table.timestamps(true, true);
        table.timestamp('deleted_at_persona');
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
  