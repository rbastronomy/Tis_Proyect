exports.up = function(knex) {
    return knex.schema.createTable('oferta', function(table) {     
                table.integer('id_tarifa')
                    .references('id_tarifa')
                    .inTable('tarifa')
                    .onDelete('RESTRICT')
                    .onUpdate('CASCADE');
                    
                table.integer('codigo_servicio')
                    .references('codigo_servicio')
                    .inTable('servicio')
                    .onDelete('RESTRICT')
                    .onUpdate('CASCADE');
                    
        table.timestamps(true, true);
        table.increments('id_oferta').primary();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('oferta');
};


