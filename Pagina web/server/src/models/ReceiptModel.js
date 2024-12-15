import { BaseModel } from '../core/BaseModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} ReceiptModelData
 * @property {number|null} codigo_boleta - Receipt ID
 * @property {number} total - Total amount
 * @property {Date|null} fecha_emision - Issue date
 * @property {string} metodo_pago - Payment method
 * @property {string} descripcion_boleta - Receipt description
 * @property {string} estado_boleta - Receipt status
 * @property {Date|null} deleted_at_boleta - Soft delete timestamp
 */

export class ReceiptModel extends BaseModel {
    static VALID_ESTADOS = [
        'PAGADO',      // Receipt is paid
        'ANULADO'      // Receipt was voided
    ];

    static VALID_METODOS = [
        'EFECTIVO',
        'TARJETA',
        'TRANSFERENCIA'
    ];

    /**
     * Default values for a new receipt
     * @type {ReceiptModelData}
     */
    static defaultData = {
        codigo_boleta: null,
        total: 0,
        fecha_emision: null,
        metodo_pago: 'EFECTIVO',
        descripcion_boleta: '',
        estado_boleta: 'PAGADO',
        deleted_at_boleta: null,
        created_at: null,
        updated_at: null
    };

    /**
     * Creates a new ReceiptModel instance
     * @param {Partial<ReceiptModelData>} data - Initial receipt data
     */
    constructor(data = {}) {
        super(data, ReceiptModel.defaultData);
        this.validate();
    }

    /**
     * Validates receipt data
     * @private
     * @throws {Error} If validation fails
     */
    validate() {
        this.clearErrors();

        this.validateNumber('total', this._data.total, { min: 0 });
        this.validateDate('fecha_emision', this._data.fecha_emision);
        this.validateEnum('metodo_pago', this._data.metodo_pago, ReceiptModel.VALID_METODOS);
        this.validateString('descripcion_boleta', this._data.descripcion_boleta, { required: false });
        this.validateEnum('estado_boleta', this._data.estado_boleta, ReceiptModel.VALID_ESTADOS);

        this.throwIfErrors();
    }

    // Getters
    get codigo_boleta() { return this._data.codigo_boleta; }
    get total() { return this._data.total; }
    get fecha_emision() { return this._data.fecha_emision; }
    get metodo_pago() { return this._data.metodo_pago; }
    get descripcion_boleta() { return this._data.descripcion_boleta; }
    get estado_boleta() { return this._data.estado_boleta; }

    // Status check methods
    isPaid() { return this._data.estado_boleta === 'PAGADO'; }
    isVoided() { return this._data.estado_boleta === 'ANULADO'; }

    /**
     * Converts receipt to JSON
     * @returns {Object} Receipt data as JSON
     */
    toJSON() {
        return {
            codigo_boleta: this._data.codigo_boleta,
            total: this._data.total,
            fecha_emision: this._data.fecha_emision,
            metodo_pago: this._data.metodo_pago,
            descripcion_boleta: this._data.descripcion_boleta,
            estado_boleta: this._data.estado_boleta,
            created_at: this._data.created_at,
            updated_at: this._data.updated_at
        };
    }

    /**
     * Generates a PDF version of this receipt
     * @returns {Promise<string>} Path to the generated PDF file
     */
    async generatePDF() {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });

            // Create PDF directory if it doesn't exist
            const pdfDir = path.join(__dirname, '../../temp/pdfs');
            await fsPromises.mkdir(pdfDir, { recursive: true });

            const filePath = path.join(pdfDir, `boleta_${this.codigo_boleta}.pdf`);
            const writeStream = fs.createWriteStream(filePath);

            // Pipe the PDF to the file
            doc.pipe(writeStream);

            // Add content to the PDF
            doc
                .fontSize(20)
                .text('BOLETA ELECTRÓNICA', { align: 'center' })
                .moveDown();

            // Add company info
            doc
                .fontSize(12)
                .text('TAXI SERVICE', { align: 'center' })
                .text('RUT: 76.XXX.XXX-X', { align: 'center' })
                .text('Dirección: Av. Arturo Prat 2120, Iquique', { align: 'center' })
                .moveDown();

            // Add receipt details
            doc
                .fontSize(14)
                .text(`Boleta N°: ${this.codigo_boleta}`)
                .text(`Fecha: ${new Date(this.fecha_emision).toLocaleString()}`)
                .moveDown()
                .text('DETALLES DEL SERVICIO')
                .moveDown();

            // Add service details
            doc
                .fontSize(12)
                .text(this.descripcion_boleta)
                .moveDown();

            // Add payment details
            doc
                .text('DETALLES DEL PAGO')
                .text(`Método de Pago: ${this.metodo_pago}`)
                .text(`Total: $${this.total.toLocaleString()}`)
                .text(`Estado: ${this.estado_boleta}`)
                .moveDown();

            // Add footer
            doc
                .fontSize(10)
                .text('Este documento es una representación impresa de una boleta electrónica', {
                    align: 'center',
                    color: 'gray'
                });

            // Finalize the PDF
            doc.end();

            // Wait for the file to be written
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
            });

            return filePath;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error(`Error generating receipt PDF: ${error.message}`);
        }
    }

    /**
     * Cleans up old PDF files
     * @static
     * @private
     */
    static async _cleanupOldPDFs() {
        try {
            const pdfDir = path.join(__dirname, '../../temp/pdfs');
            const files = await fsPromises.readdir(pdfDir);
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);

            for (const file of files) {
                const filePath = path.join(pdfDir, file);
                const stats = await fsPromises.stat(filePath);
                if (stats.ctimeMs < oneHourAgo) {
                    await fsPromises.unlink(filePath);
                }
            }
        } catch (error) {
            console.error('Error cleaning up PDFs:', error);
        }
    }
}

export default ReceiptModel;

