import { BaseRepository } from '../core/BaseRepository.js';
import { OfferingModel } from '../models/OfferingModel.js';

export class OfferingRepository extends BaseRepository {
    constructor() {
        super('oferta', OfferingModel, 'oferta_id');
    }

    /**
     * Encuentra ofertas de servicios activos con sus tarifas
     * @param {number} codigos - ID del servicio
     * @returns {Promise<Array>} Lista de ofertas con sus tarifas de servicios activos
     */
    async findActiveServicesWithRates(codigos) {
        const results = await this.db(this.tableName)
            .select(
                'oferta.*',
                'tarifa.id as rate_id',
                'tarifa.descripciont',
                'tarifa.precio',
                'tarifa.tipo as rate_tipo',
                'tarifa.estadot',
                'servicio.tipo as service_nombre',
                'servicio.estados as service_estado'
            )
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id_tarifa')
            .join('servicio', 'oferta.codigos', 'servicio.codigos')
            .where({
                'oferta.codigos': codigos,
                'tarifa.estadot': 'ACTIVO',
                'servicio.estados': 'ACTIVO'
            })
            .whereNull('tarifa.deleteatt')
            .whereNull('servicio.deleteats');

        return results.map(result => {
            const offeringData = {
                oferta_id: result.oferta_id,
                idtarifa: result.idtarifa,
                codigos: result.codigos,
                created_at: result.created_at,
                updated_at: result.updated_at,
                rate: {
                    id_tarifa: result.rate_id,
                    descripciont: result.descripciont,
                    precio: result.precio,
                    tipo: result.rate_tipo,
                    estadot: result.estadot
                },
                service: {
                    tipo: result.service_nombre,
                    estados: result.service_estado
                }
            };
            return this._toModel(offeringData);
        });
    }

    /**
     * Encuentra ofertas por tipo de viaje
     * @param {string} rideType - Tipo de viaje (CITY o AIRPORT)
     * @returns {Promise<Array>} Lista de ofertas filtradas
     */
    async findByRideType(rideType) {
        const query = this.db(this.tableName)
            .select(
                'oferta.*',
                'tarifa.id_tarifa as rate_id',
                'tarifa.descripciont',
                'tarifa.precio',
                'tarifa.tipo as rate_tipo',
                'tarifa.estadot'
            )
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id_tarifa')
            .where('tarifa.estadot', 'ACTIVO')
            .whereNull('tarifa.deleteatt');

        if (rideType === 'CITY') {
            query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
        } else {
            query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
        }

        const results = await query;
        return results.map(result => {
            const offeringData = {
                oferta_id: result.oferta_id,
                idtarifa: result.idtarifa,
                codigos: result.codigos,
                created_at: result.created_at,
                updated_at: result.updated_at,
                rate: {
                    id_tarifa: result.rate_id,
                    descripciont: result.descripciont,
                    precio: result.precio,
                    tipo: result.rate_tipo,
                    estadot: result.estadot
                }
            };
            return this._toModel(offeringData);
        });
    }
} 