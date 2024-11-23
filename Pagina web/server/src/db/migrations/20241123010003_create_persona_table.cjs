exports.up = function(knex) {
    return knex.schema.createTable('persona', function(table) {
        // Primary key
        table.integer('rut').primary();
        
        // Personal information
        table.string('nombre', 256);
        table.string('apellidop', 256);
        table.string('apellidom', 256);
        table.date('fnacimiento');
        table.string('correo', 256);
        table.integer('ntelefono');
        table.string('nacionalidad', 256);
        table.string('genero', 256);
        table.string('contrasena', 256);
        table.string('estadop', 256);
        
        // Role reference
        table.integer('idroles')
            .unsigned()
            .references('idroles')
            .inTable('roles')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');
        
        // Employment information
        table.date('fcontratacion');
        table.date('licenciaconducir');
        table.date('adm_fcontratacion');
        table.integer('cviajes');

        // Unique constraints
        table.unique('nombre');
        table.unique('apellidop');
        table.unique('apellidom');
        table.unique('genero');
        table.unique('estadop');

        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('persona');
};
  