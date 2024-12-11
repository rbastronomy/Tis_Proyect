import { BaseRepository } from '../core/BaseRepository.js';
import { ReceiptModel } from '../models/ReceiptModel.js';

export class ReceiptRepository extends BaseRepository {
  constructor() {
    super('boleta', 'codigo_boleta');
  }

  /**
   * Find invoice by ID
   * @param {number} codigo_boleta - Invoice ID
   * @returns {Promise<ReceiptModel>} Invoice instance
   */
  async findById(codigo_boleta) {
    try {
      const result = await this.db(this.tableName)
        .where('codigo_boleta', codigo_boleta)
        .first();
      return ReceiptModel.toModel(result);
    } catch (error) {
      throw new Error(`Error buscando boleta por id: ${error.message}`);
    }
  }

  /**
   * Create new invoice
   * @param {Object} receiptData - Invoice data
   * @returns {Promise<Object>} Created invoice
   */
  async create(receiptData) {
    try {
      const [created] = await this.db(this.tableName)
        .insert(receiptData)
        .returning('*');
      return ReceiptModel.toModel(created);
    } catch (error) {
      throw new Error(`Error creando boleta: ${error.message}`);
    }
  }

  /**
   * Update invoice
   * @param {number} codigo_boleta - Invoice ID
   * @param {Object} updateData - Updated invoice data
   * @returns {Promise<Object|null>} Updated invoice or null
   */
  async update(codigo_boleta, updateData) {
    try {
      const [updated] = await this.db(this.tableName)
        .where('codigo_boleta', codigo_boleta)
        .update(updateData)
        .returning('*');
      return updated ? ReceiptModel.toModel(updated) : null;
    } catch (error) {
      throw new Error(`Error actualizando una boleta: ${error.message}`);
    }
  }

  /**
   * Soft delete invoice
   * @param {number} codigo_boleta - Invoice ID
   * @returns {Promise<Object|null>} Deleted invoice or null
   */
  async softDelete(codigo_boleta) {
    try {
      const [deletedInvoice] = await this.db(this.tableName)
        .where('codigo_boleta', codigo_boleta)
        .update({
          estado_boleta: 'ELIMINADO',
          deleted_at_boleta: new Date()
        })
        .returning('*');
      return deletedInvoice ? ReceiptModel.toModel(deletedInvoice) : null;
    } catch (error) {
      throw new Error(`Error soft deleting invoice: ${error.message}`);
    }
  }

  /**
   * Find invoice by trip
   * @param {number} codigo_viaje - Trip ID
   * @returns {Promise<InvoiceModel|null>} Invoice instance or null
   */
  async findByTrip(codigo_viaje) {
    try {
      const result = await this.db(this.tableName)
        .where('codigo_viaje', codigo_viaje)
        .first();
      return result ? ReceiptModel.toModel(result) : null;
    } catch (error) {
      throw new Error(`Error finding invoice by trip: ${error.message}`);
    }
  }

  /**
   * Find invoice by reservation
   * @param {number} codigo_reserva - Reservation ID
   * @returns {Promise<InvoiceModel|null>} Invoice instance or null
   */
  async findByReservation(codigo_reserva) {
    try {
      const result = await this.db(this.tableName)
        .where('codigo_reserva', codigo_reserva)
        .first();
      return result ? ReceiptModel.toModel(result) : null;
    } catch (error) {
      throw new Error(`Error finding invoice by reservation: ${error.message}`);
    }
  }

  /**
   * Find invoice with full details
   * @param {number} codigo_boleta - Invoice ID
   * @returns {Promise<InvoiceModel|null>} Invoice with details or null
   */
  async findWithDetails(codigo_boleta) {
    try {
      const result = await this.db(this.tableName)
        .select(
          'boleta.*',
          'viaje.duracion',
          'viaje.fecha_viaje',
          'reserva.origen_reserva',
          'reserva.destino_reserva'
        )
        .leftJoin('viaje', 'boleta.codigo_viaje', 'viaje.codigo_viaje')
        .leftJoin('reserva', 'boleta.codigo_reserva', 'reserva.codigo_reserva')
        .where('boleta.codigo_boleta', codigo_boleta)
        .first();

      return result ? ReceiptModel.toModel(result) : null;
    } catch (error) {
      throw new Error(`Error finding invoice with details: ${error.message}`);
    }
  }

  /**
   * Find invoices by status
   * @param {string} status - Invoice status
   * @returns {Promise<Array>} List of invoices
   */
  async findByStatus(status) {
    try {
      const results = await this.db(this.tableName)
        .select('*')
        .where('estado_boleta', status)
        .whereNull('deleted_at_boleta');

      return results.map(result => ReceiptModel.toModel(result));
    } catch (error) {
      throw new Error(`Error finding invoices by status: ${error.message}`);
    }
  }
}

export default ReceiptRepository;
