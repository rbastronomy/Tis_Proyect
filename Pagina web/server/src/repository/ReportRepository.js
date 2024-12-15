const knex = require('../db/knex');

export class ReportRepository {

    async getViajesMensuales() {
        return knex('viaje')
            .select(
                knex.raw('MONTH(deleted_at_viaje) as mes'),
                knex.raw('COUNT(*) as cantidad'),
                knex.raw('SUM(pasajeros) as total_pasajeros'),
                knex.raw('AVG(duracion) as duracion_promedio')
            )
            .whereRaw('YEAR(deleted_at_viaje) = ? AND MONTH (deleted_at_viaje)=?',{year,month} )
            .firts();
    }

    async getIngresosPorViajes(){
        return knex('genera')
            .join('viaje','genera.codigo_viaje','viaje.codigo_viaje')
            .join('boleta','genera.codigo_boleta','boleta.codigo_boleta')
            .select(
                'viaje.origen_viaje',
                'viaje.destino_viaje',
            knex.raw('SUM(boleta.total) as total_ingresos'),
            knex.raw('COUNT(viaje.codigo_viaje) as cantidad_viajes')
            )
            .groupBy('viaje.origen_viaje','viaje.destino_viaje')
            .orderBy('total_ingresos','desc')
    }

    async getValoracionViajes(){
        return knex('valoracion')
            .join('valora', 'valoracion.codigo_valoracion', 'valora.codigo_valoracion')
            .join('viaje', 'valora.codigo_viaje', 'viaje.codigo_viaje')
            .select(
                'viaje.origen_viaje',
                'viaje.destino_viaje',
                knex.raw('AVG(valoracion.puntaje) as puntaje_promedio'),
                knex.raw('COUNT(valoracion.id_valoracion) as total_valoraciones')
            )
            .groupBy('viaje.origen_viaje', 'viaje.destino_viaje')
            .orderBy('puntaje_promedio', 'desc');
    }
}

module.exports = ReportRepository();