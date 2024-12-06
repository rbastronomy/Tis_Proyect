exports.up = function(knex) {
    return knex.schema
        // GENERA table (viaje-reserva-boleta)
        .createTable('genera', function(table) {
            table.integer('codigo')
                .references('codigo')
                .inTable('viaje')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('codigoreserva')
                .references('codigoreserva')
                .inTable('reserva')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('codigoboleta')
                .references('codigoboleta')
                .inTable('boleta')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.date('fechagenerada');
            table.primary(['codigo', 'codigoreserva']);
        })
        
        // VALORA table (persona-viaje-valoracion)
        .createTable('valora', function(table) {
            table.integer('rut')
                .references('rut')
                .inTable('persona')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('codigo')
                .references('codigo')
                .inTable('viaje')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.integer('idvaloracion')
                .references('idvaloracion')
                .inTable('valoracion')
                .onDelete('RESTRICT')
                .onUpdate('CASCADE');
                
            table.date('fechavaloracion');
            table.primary(['rut', 'codigo', 'idvaloracion']);
        });
};

exports.down = function(knex) {
    return knex.schema
        .dropTable('valora')
        .dropTable('genera');
}; 