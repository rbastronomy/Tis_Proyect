import { BaseRepository } from '../core/BaseRepository.js';

export class GeneraRepository extends BaseRepository {
    constructor() {
        super('genera', 'id_genera');
    }

    /**
     * Creates a new junction record
     * @param {Object} data - Junction data
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<Object>} Created junction record
     */
    async create(data, trx = null) {
        try {
            const query = (trx || this.db)(this.tableName)
                .insert({
                    codigo_viaje: data.codigo_viaje,
                    codigo_reserva: data.codigo_reserva,
                    codigo_boleta: data.codigo_boleta,
                    fecha_generada: new Date()
                })
                .returning('*');

            const [created] = await query;
            return created;
        } catch (error) {
            throw new Error(`Error creating junction record: ${error.message}`);
        }
    }

    /**
     * Finds all records for a booking
     * @param {number} codigo_reserva - Booking ID
     * @returns {Promise<Array>} Junction records
     */
    async findByBooking(codigo_reserva) {
        try {
            return await this.db(this.tableName)
                .where({ codigo_reserva })
                .select('*')
                .orderBy('fecha_generada', 'desc');
        } catch (error) {
            throw new Error(`Error finding junction records by booking: ${error.message}`);
        }
    }

    /**
     * Finds all records for a trip
     * @param {number} codigo_viaje - Trip ID
     * @returns {Promise<Array>} Junction records
     */
    async findByTrip(codigo_viaje) {
        try {
            return await this.db(this.tableName)
                .where({ codigo_viaje })
                .select('*')
                .orderBy('fecha_generada', 'desc');
        } catch (error) {
            throw new Error(`Error finding junction records by trip: ${error.message}`);
        }
    }

    /**
     * Finds all records for a receipt
     * @param {number} codigo_boleta - Receipt ID
     * @returns {Promise<Array>} Junction records
     */
    async findByReceipt(codigo_boleta) {
        try {
            return await this.db(this.tableName)
                .where({ codigo_boleta })
                .select('*')
                .orderBy('fecha_generada', 'desc');
        } catch (error) {
            throw new Error(`Error finding junction records by receipt: ${error.message}`);
        }
    }

    /**
     * Finds complete record with all references
     * @param {Object} where - Where conditions
     * @returns {Promise<Object|null>} Junction record with references
     */
    async findOneWithRefs(where) {
        try {
            return await this.db(this.tableName)
                .where(where)
                .select('*')
                .first();
        } catch (error) {
            throw new Error(`Error finding junction record: ${error.message}`);
        }
    }
}

export default GeneraRepository; 