exports.up = function(knex) {
    return knex.schema.createTable('roles', function(table) {
        table.increments('id').primary();
        table.string('name').unique().notNullable();
        table.string('description').nullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('roles');
};
