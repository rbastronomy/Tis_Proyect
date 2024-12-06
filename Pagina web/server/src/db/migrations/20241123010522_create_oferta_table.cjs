exports.up = function(knex) {
    return knex.schema.createTable('oferta', function(table) {     
                table.integer('idtarifa')
                    .references('id')
                    .inTable('tarifa')
                    .onDelete('RESTRICT')
                    .onUpdate('CASCADE');
                    
                table.integer('codigos')
                    .references('codigos')
                    .inTable('servicio')
                    .onDelete('RESTRICT')
                    .onUpdate('CASCADE');
                    
                table.timestamps(true, true);
        table.increments('oferta_id').primary();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('oferta');
};


