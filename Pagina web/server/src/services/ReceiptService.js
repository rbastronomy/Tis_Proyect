import { BaseService } from "../core/BaseService.js";
import { ReceiptRepository } from "../repository/ReceiptRepository.js";
import { ReceiptModel } from "../models/ReceiptModel.js";
import PDFDocument from 'pdfkit';
import { promises as fsPromises } from 'fs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class ReceiptService extends BaseService {
    constructor() {
        const receiptRepository = new ReceiptRepository();
        super(receiptRepository);
    }

    /**
     * Creates a new receipt
     * @param {Object} receiptData - Receipt data
     * @param {Object} [trx] - Optional transaction object
     * @returns {Promise<Object>} Created receipt
     */
    async create(receiptData, trx = null) {
        try {
            this.validateReceiptData(receiptData);
            const receipt = await this.repository.create(receiptData, trx);
            return receipt;
        } catch (error) {
            throw new Error(`Error al crear boleta: ${error.message}`);
        }
    }

    /**
     * Gets receipt by ID
     * @param {number} codigo_boleta - Receipt ID
     * @returns {Promise<Object>} Receipt data
     */
    async getReceiptById(codigo_boleta) {
        try {
            const receipt = await this.repository.findById(codigo_boleta);
            if (!receipt) {
                throw new Error('Boleta no encontrada');
            }
            return receipt;
        } catch (error) {
            throw new Error(`Error al obtener boleta: ${error.message}`);
        }
    }

    /**
     * Updates receipt status
     * @param {number} codigo_boleta - Receipt ID
     * @param {Object} receiptData - Updated data
     * @returns {Promise<Object>} Updated receipt
     */
    async updateReceipt(codigo_boleta, receiptData) {
        try {
            const receipt = await this.repository.findById(codigo_boleta);
            if (!receipt) {
                throw new Error('Boleta no encontrada');
            }
            return await this.repository.update(codigo_boleta, {
                ...receiptData,
                updated_at: new Date()
            });
        } catch (error) {
            throw new Error(`Error al actualizar boleta: ${error.message}`);
        }
    }

    /**
     * Validates receipt data
     * @private
     * @param {Object} receiptData - Data to validate
     * @throws {Error} If validation fails
     */
    validateReceiptData(receiptData) {
        const requiredFields = ['total', 'fecha_emision', 'metodo_pago'];
        for (const field of requiredFields) {
            if (!receiptData[field]) {
                throw new Error(`Campo ${field} es requerido`);
            }
        }

        if (typeof receiptData.total !== 'number' || receiptData.total <= 0) {
            throw new Error('Total debe ser un número positivo');
        }

        if (!['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(receiptData.metodo_pago)) {
            throw new Error('Método de pago no válido');
        }
    }

    /**
     * Generates a PDF for a receipt
     * @param {Object} receiptData - Receipt data
     * @returns {Promise<string>} Path to generated PDF file
     */
    async generatePDF(receiptData) {
        try {
            const receipt = new ReceiptModel(receiptData);
            return await receipt.generatePDF();
        } catch (error) {
            throw new Error(`Error generating receipt PDF: ${error.message}`);
        }
    }
}

export default ReceiptService;