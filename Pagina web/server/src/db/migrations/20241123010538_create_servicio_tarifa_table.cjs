exports.up = function(knex) {
    return knex.schema.createTable('servicio_tarifa', function(table) {
        table.integer('servicio_id')
            .notNullable()
            .references('codigos')
            .inTable('servicio')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');
            
        table.integer('tarifa_id')
            .notNullable()
            .references('id')
            .inTable('tarifa')
            .onDelete('CASCADE')
            .onUpdate('CASCADE');

        // Composite primary key
        table.primary(['servicio_id', 'tarifa_id']);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('servicio_tarifa');
}; 