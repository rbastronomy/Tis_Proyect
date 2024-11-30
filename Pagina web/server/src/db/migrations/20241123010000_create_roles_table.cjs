exports.up = function(knex) {
    return knex.schema.createTable('roles', function(table) {
        table.integer('idroles').primary();
        table.string('nombrerol', 256);
        table.string('descripcionrol', 256);
        table.date('fechacreadarol');
        table.string('estadorol', 256);
        
        table.unique('idroles');
        table.unique('nombrerol');
        
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('roles');
};
