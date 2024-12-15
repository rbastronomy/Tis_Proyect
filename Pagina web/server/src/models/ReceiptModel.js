import { BaseModel } from '../core/BaseModel.js';

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
}

export default ReceiptModel;

