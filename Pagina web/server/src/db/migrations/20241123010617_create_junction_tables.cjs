exports.up = function(knex) {
    return knex.schema
        // GENERA table (viaje-reserva-boleta)
        .createTable('genera', function(table) {
            table.integer('codigo_viaje')
                .unsigned()
                .references('codigo_viaje')
                .inTable('viaje')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('codigo_reserva')
                .unsigned()
                .references('codigo_reserva')
                .inTable('reserva')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('codigo_boleta')
                .unsigned()
                .references('codigo_boleta')
                .inTable('boleta')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.date('fecha_generada');
            table.increments('id_genera').primary();
        })
        
        // VALORA table (persona-viaje-valoracion)
        .createTable('valora', function(table) {
            table.integer('rut_persona')
                .unsigned()
                .references('rut')
                .inTable('persona')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('codigo_viaje')
                .unsigned()
                .references('codigo_viaje')
                .inTable('viaje')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('id_valoracion')
                .unsigned()
                .references('id_valoracion')
                .inTable('valoracion')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.date('fecha_valoracion');
            table.increments('id_valora').primary();
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('valora')
        .dropTable('genera');
}; 