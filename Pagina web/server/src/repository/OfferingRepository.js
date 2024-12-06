import { BaseRepository } from '../core/BaseRepository.js';
import { OfferingModel } from '../models/OfferingModel.js';

export class OfferingRepository extends BaseRepository {
    constructor() {
        super('oferta', OfferingModel, 'oferta_id');
    }

    /**
     * Encuentra ofertas por servicio con sus tarifas
     * @param {number} codigos - ID del servicio
     * @returns {Promise<Array>} Lista de ofertas con sus tarifas
     */
    async findByServiceWithRates(codigos) {
        const results = await this.db(this.tableName)
            .select(
                'oferta.*',
                'tarifa.id as rate_id',
                'tarifa.descripciont',
                'tarifa.precio',
                'tarifa.tipo as rate_tipo',
                'tarifa.estadot'
            )
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id')
            .where({
                'oferta.codigos': codigos,
                'tarifa.estadot': 'ACTIVO'
            })
            .whereNull('tarifa.deleteatt');

        return results.map(result => {
            // Restructure data to match model expectations
            const offeringData = {
                oferta_id: result.oferta_id,
                idtarifa: result.idtarifa,
                codigos: result.codigos,
                created_at: result.created_at,
                updated_at: result.updated_at,
                rate: {
                    id: result.rate_id,
                    descripciont: result.descripciont,
                    precio: result.precio,
                    tipo: result.rate_tipo,
                    estadot: result.estadot
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
                'tarifa.id as rate_id',
                'tarifa.descripciont',
                'tarifa.precio',
                'tarifa.tipo as rate_tipo',
                'tarifa.estadot'
            )
            .join('tarifa', 'oferta.idtarifa', 'tarifa.id')
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
                    id: result.rate_id,
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