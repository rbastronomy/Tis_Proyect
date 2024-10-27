exports.up = function(knex) {
    return knex.schema.createTable('role_permissions', function(table) {
        table.increments('id').primary();
        table.integer('role_id').unsigned().notNullable();
        table.integer('permission_id').unsigned().notNullable();
        table.foreign('role_id').references('id').inTable('roles').onDelete('CASCADE');
        table.foreign('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('role_permissions');
};
