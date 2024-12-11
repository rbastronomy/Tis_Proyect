
exports.up = function(knex) {
    return knex.schema.createTable('geolocalizacion', function(table) { 
        table.increments('id_geolocalizacion').primary();
        table.string('latitud');
        table.string('longitud');
        table.timestamps(true, true);

        //fk to taxi
        table.integer('id_taxi')
            .unsigned()
            .references('id_taxi')
            .inTable('taxi')
            .onDelete('RESTRICT')
            .onUpdate('CASCADE');
    });

};

exports.down = function(knex) {
    return knex.schema.dropTable('geolocalizacion');
};
