exports.up = function(knex) {
    return knex.schema.createTable('permiso', function(table) {
        table.integer('idpermisos').primary();
        table.string('nombrepermiso', 256);
        table.string('descripcionpermiso', 256);
        table.timestamp('fechacreacion');
        table.unique('idpermisos');
        table.unique('nombrepermiso');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('permiso');
};
