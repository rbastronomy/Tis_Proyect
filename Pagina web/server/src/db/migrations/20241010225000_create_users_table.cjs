exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
      table.increments('id').primary(); // Creates an auto-incrementing "id" column as the primary key
      table.string('username').notNullable();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      // Add other columns as needed
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('users');
  };
  