exports.up = function(knex) {
    return knex.schema.createTable('user_session', function(table) {
        table.string('id', 255).primary();
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('rut')
            .inTable('persona')
            .onDelete('CASCADE');
        table.timestamp('expires_at', { useTz: true }).notNullable();
        table.index('user_id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user_session');
};