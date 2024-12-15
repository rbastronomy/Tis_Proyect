import { BaseRepository } from '../core/BaseRepository.js';

export class ReceiptRepository extends BaseRepository {
    constructor() {
        super('boleta', 'codigo_boleta');
    }

    /**
     * Creates a new receipt
     * @param {Object} receiptData - Receipt data
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<Object>} Created receipt
     */
    async create(receiptData, trx = null) {
        try {
            const query = (trx || this.db)(this.tableName)
                .insert({
                    ...receiptData,
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('*');

            const [created] = await query;
            return created;
        } catch (error) {
            throw new Error(`Error creating receipt: ${error.message}`);
        }
    }

    /**
     * Finds receipt by ID
     * @param {number} codigo_boleta - Receipt ID
     * @returns {Promise<Object|null>} Receipt data or null
     */
    async findById(codigo_boleta) {
        try {
            return await this.db(this.tableName)
                .where('codigo_boleta', codigo_boleta)
                .whereNull('deleted_at_boleta')
                .first();
        } catch (error) {
            throw new Error(`Error finding receipt: ${error.message}`);
        }
    }

    /**
     * Updates receipt
     * @param {number} codigo_boleta - Receipt ID
     * @param {Object} updateData - Updated data
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<Object|null>} Updated receipt or null
     */
    async update(codigo_boleta, updateData, trx = null) {
        try {
            const query = (trx || this.db)(this.tableName)
                .where('codigo_boleta', codigo_boleta)
                .whereNull('deleted_at_boleta')
                .update({
                    ...updateData,
                    updated_at: new Date()
                })
                .returning('*');

            const [updated] = await query;
            return updated || null;
        } catch (error) {
            throw new Error(`Error updating receipt: ${error.message}`);
        }
    }

    /**
     * Soft deletes receipt
     * @param {number} codigo_boleta - Receipt ID
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<Object|null>} Deleted receipt or null
     */
    async softDelete(codigo_boleta, trx = null) {
        try {
            const query = (trx || this.db)(this.tableName)
                .where('codigo_boleta', codigo_boleta)
                .whereNull('deleted_at_boleta')
                .update({
                    deleted_at_boleta: new Date(),
                    updated_at: new Date()
                })
                .returning('*');

            const [deleted] = await query;
            return deleted || null;
        } catch (error) {
            throw new Error(`Error soft deleting receipt: ${error.message}`);
        }
    }

    /**
     * Find receipt by trip through junction table
     * @param {number} codigo_viaje - Trip ID
     * @returns {Promise<Object|null>} Receipt data or null
     */
    async findByTrip(codigo_viaje) {
        try {
            return await this.db(this.tableName)
                .select('boleta.*')
                .join('genera', 'boleta.codigo_boleta', 'genera.codigo_boleta')
                .where('genera.codigo_viaje', codigo_viaje)
                .whereNull('boleta.deleted_at_boleta')
                .first();
        } catch (error) {
            throw new Error(`Error finding receipt by trip: ${error.message}`);
        }
    }

    /**
     * Find receipt by booking through junction table
     * @param {number} codigo_reserva - Booking ID
     * @returns {Promise<Object|null>} Receipt data or null
     */
    async findByBooking(codigo_reserva) {
        try {
            return await this.db(this.tableName)
                .select('boleta.*')
                .join('genera', 'boleta.codigo_boleta', 'genera.codigo_boleta')
                .where('genera.codigo_reserva', codigo_reserva)
                .whereNull('boleta.deleted_at_boleta')
                .first();
        } catch (error) {
            throw new Error(`Error finding receipt by booking: ${error.message}`);
        }
    }

    /**
     * Find receipt with full details including trip and booking data
     * @param {number} codigo_boleta - Receipt ID
     * @returns {Promise<Object|null>} Receipt with details or null
     */
    async findWithDetails(codigo_boleta) {
        try {
            return await this.db(this.tableName)
                .select(
                    'boleta.*',
                    'viaje.duracion',
                    'viaje.fecha_viaje',
                    'reserva.origen_reserva',
                    'reserva.destino_reserva'
                )
                .join('genera', 'boleta.codigo_boleta', 'genera.codigo_boleta')
                .join('viaje', 'genera.codigo_viaje', 'viaje.codigo_viaje')
                .join('reserva', 'genera.codigo_reserva', 'reserva.codigo_reserva')
                .where('boleta.codigo_boleta', codigo_boleta)
                .whereNull('boleta.deleted_at_boleta')
                .first();
        } catch (error) {
            throw new Error(`Error finding receipt with details: ${error.message}`);
        }
    }

    /**
     * Find receipts by status
     * @param {string} estado_boleta - Receipt status
     * @returns {Promise<Array>} List of receipts
     */
    async findByStatus(estado_boleta) {
        try {
            return await this.db(this.tableName)
                .where({ estado_boleta })
                .whereNull('deleted_at_boleta')
                .orderBy('fecha_emision', 'desc');
        } catch (error) {
            throw new Error(`Error finding receipts by status: ${error.message}`);
        }
    }
}

export default ReceiptRepository;
