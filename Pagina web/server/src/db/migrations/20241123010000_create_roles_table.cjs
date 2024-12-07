exports.up = function(knex) {
    return knex.schema.createTable('roles', function(table) {
        table.increments('id_roles').primary();
        table.string('nombre_rol', 256);
        table.string('descripcion_rol', 256);
        table.timestamp('fecha_creada_rol');
        table.string('estado_rol', 256);
        
        table.unique('id_roles');
        table.unique('nombre_rol');
        
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('roles');
};
