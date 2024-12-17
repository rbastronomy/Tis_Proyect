import { BaseModel } from '../core/BaseModel.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} ReportData
 * @property {string} type - Report type
 * @property {Object} filters - Applied filters
 * @property {Array} data - Report data
 * @property {Date} generatedAt - Generation date
 */

/**
 * Model for representing a generated report
 */
export class ReportModel extends BaseModel {
    static REPORT_TYPES = {
        TRIPS_BY_TAXI: 'TRIPS_BY_TAXI',
        MONTHLY_INCOME_BY_DRIVER: 'MONTHLY_INCOME_BY_DRIVER'
    };

    /**
     * @param {Object} params - Report parameters
     * @param {string} params.type - Report type
     * @param {Array} params.data - Report data
     * @param {Date} params.generatedAt - Generation date
     * @param {string} params.generatedBy - RUT of user who generated the report
     * @param {Object} params.generatedByUser - User who generated the report
     * @param {string} params.generatedByUser.nombre - User's first name
     * @param {string} params.generatedByUser.apellido_paterno - User's last name
     * @param {Object} params.filters - Applied filters
     */
    constructor({ type, data, generatedAt, generatedBy, generatedByUser, filters }) {
        super({ type, data, generatedAt, generatedBy, generatedByUser, filters });
        this.validate();
    }

    /**
     * Validates report data
     * @throws {Error} If validation fails
     */
    validate() {
        // Validate report type
        this.validateEnum('type', this._data.type, Object.values(ReportModel.REPORT_TYPES));
        
        // Validate data is an array
        if (!Array.isArray(this._data.data)) {
            throw new Error('Los datos del reporte deben ser un array');
        }

        // Validate dates
        if (!(this._data.generatedAt instanceof Date)) {
            throw new Error('La fecha de generación debe ser una fecha válida');
        }

        // Validate filters if present
        if (this._data.filters) {
            if (this._data.filters.startDate && !(this._data.filters.startDate instanceof Date)) {
                throw new Error('La fecha inicial debe ser una fecha válida');
            }
            if (this._data.filters.endDate && !(this._data.filters.endDate instanceof Date)) {
                throw new Error('La fecha final debe ser una fecha válida');
            }
        }
    }

    /**
     * Converts model to plain object for JSON response
     * @returns {Object} Plain object representation
     */
    toJSON() {
        return {
            type: this._data.type,
            data: this._data.data,
            generatedAt: this._data.generatedAt.toISOString(),
            generatedBy: this._data.generatedBy,
            filters: this._data.filters ? {
                startDate: this._data.filters.startDate?.toISOString(),
                endDate: this._data.filters.endDate?.toISOString()
            } : {}
        };
    }

    /**
     * Gets the report title based on type
     * @private
     * @returns {string} Report title
     */
    _getReportTitle() {
        switch (this._data.type) {
            case ReportModel.REPORT_TYPES.TRIPS_BY_TAXI:
                return 'Reporte de Viajes por Taxi';
            case ReportModel.REPORT_TYPES.MONTHLY_INCOME_BY_DRIVER:
                return 'Reporte de Ingresos Mensuales por Conductor';
            default:
                return 'Reporte';
        }
    }

    /**
     * Formats currency values for display
     * @private
     * @param {number} amount - Amount to format
     * @returns {string} Formatted amount
     */
    _formatCurrency(amount) {
        return `$${amount.toLocaleString('es-CL')}`;
    }

    /**
     * Generates a PDF version of this report
     * @returns {Promise<Buffer>} PDF buffer that can be streamed to client
     */
    async generatePDF() {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            // Instead of writing to file, collect chunks in memory
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));

            // Add header
            doc
                .fontSize(20)
                .text(this._getReportTitle(), { align: 'center' })
                .moveDown();

            // Add report metadata
            doc
                .fontSize(12)
                .text(`Generado el: ${this._data.generatedAt.toLocaleString('es-CL')}`)
                .text(`Generado por: ${this._data.generatedByUser?.nombre}${
                    this._data.generatedByUser?.apellido_paterno 
                        ? ` ${this._data.generatedByUser.apellido_paterno}` 
                        : ''
                } (${this._data.generatedBy})`)
                .moveDown();

            // Add filters if present
            if (this._data.filters) {
                doc.text('Filtros Aplicados:')
                if (this._data.filters.startDate && this._data.filters.endDate) {
                    doc
                        .text(`Período: ${new Date(this._data.filters.startDate).toLocaleDateString('es-CL')} al ${new Date(this._data.filters.endDate).toLocaleDateString('es-CL')}`)
                } else {
                    doc.text('Período: Reporte histórico (todas las fechas)')
                }
                doc.moveDown();
            }

            // Add report data based on type
            switch (this._data.type) {
                case ReportModel.REPORT_TYPES.TRIPS_BY_TAXI:
                    this._addTripsByTaxiData(doc);
                    break;
                case ReportModel.REPORT_TYPES.MONTHLY_INCOME_BY_DRIVER:
                    this._addMonthlyIncomeData(doc);
                    break;
            }

            // Add footer with page numbers
            const pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc
                    .fontSize(10)
                    .text(
                        `Página ${i + 1} de ${pages.count}`,
                        50,
                        doc.page.height - 50,
                        { align: 'center' }
                    );
            }

            // Finalize the PDF
            doc.end();

            // Return promise that resolves with the complete PDF buffer
            return new Promise((resolve, reject) => {
                doc.on('end', () => {
                    resolve(Buffer.concat(chunks));
                });
                doc.on('error', reject);
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error(`Error generating report PDF: ${error.message}`);
        }
    }

    /**
     * Adds trips by taxi data to the PDF
     * @private
     * @param {PDFDocument} doc - PDF document
     */
    _addTripsByTaxiData(doc) {
        doc
            .fontSize(14)
            .text('Resumen de Viajes por Taxi', { underline: true })
            .moveDown();

        this._data.data.forEach((item, index) => {
            doc
                .fontSize(12)
                .text(`${index + 1}. Taxi: ${item.patente} - ${item.vehiculo}`)
                .text(`   • Total de Viajes: ${item.total_viajes}`)
                .text(`   • Duración Promedio: ${item.duracion_promedio} minutos`)
                .text(`   • Total de Conductores: ${item.total_conductores}`)
                .text(`   • Ingreso Promedio por Viaje: ${this._formatCurrency(item.ingreso_promedio_por_viaje)}`)
                .moveDown();
        });
    }

    /**
     * Adds monthly income data to the PDF
     * @private
     * @param {PDFDocument} doc - PDF document
     */
    _addMonthlyIncomeData(doc) {
        doc
            .fontSize(14)
            .text('Resumen de Ingresos Mensuales por Conductor', { underline: true })
            .moveDown();

        let currentDriver = null;
        this._data.data.forEach(item => {
            if (currentDriver !== item.rut) {
                currentDriver = item.rut;
                doc
                    .fontSize(12)
                    .text(`Conductor: ${item.conductor} (RUT: ${item.rut})`)
                    .moveDown(0.5);
            }

            doc
                .fontSize(11)
                .text(`   • ${item.mes}:`)
                .text(`     - Total Viajes: ${item.total_viajes}`)
                .text(`     - Ingreso Total: ${this._formatCurrency(item.ingreso_total)}`)
                .text(`     - Taxis Conducidos: ${item.total_taxis_conducidos}`)
                .moveDown(0.5);
        });
    }
} 