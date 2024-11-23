exports.up = function(knex) {
    return knex.schema.createTable('user_session', function(table) {
        table.text('id').primary();
        table.integer('user_id')
            .unsigned()
            .notNullable()
            .references('rut')
            .inTable('persona')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.index('user_id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('user_session');
};