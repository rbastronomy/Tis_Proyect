exports.up = function(knex) {
    return knex.schema.createTable('user_session', function(table) {
        table.text('id').primary(); // Primary key
        table.integer('user_id').unsigned().notNullable(); // Foreign key to the users table
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE'); // Add reference to users table
        //table.string('token').notNullable(); // This should be a string
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('expires_at').notNullable();
    });
};

exports.down = function(knex) {
    
    return knex.schema.dropTable('user_session');
};