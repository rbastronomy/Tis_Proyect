import { BaseModel } from '../core/BaseModel.js';

/**
 * Represents history data from the database
 * @typedef {Object} HistoryData
 * @property {number} id_historial - History entry unique identifier
 * @property {string} estado_historial - Status of the history entry
 * @property {string} observacion_historial - Observations or notes
 * @property {Date} fecha_cambio - Date of the change
 * @property {string} accion - Action performed
 * @property {number} codigo_reserva - Associated booking code
 * @property {Date} created_at - Record creation timestamp
 * @property {Date} updated_at - Record update timestamp
 */

/**
 * Class representing a History entry in the system
 * @extends {BaseModel}
 */
export class HistoryModel extends BaseModel {
    static VALID_ESTADOS = [
        'RESERVA_EN_REVISION', 
        'RESERVA_CONFIRMADA', 
        'RESERVA_CANCELADA', 
        'RESERVA_COMPLETADA', 
        'RESERVA_RECHAZADA', 
        'RESERVA_EN_PROGRESO',
        'ENTRADA_VACIA'
    ];
    static VALID_ACCIONES = ['CREACION', 'MODIFICACION', 'CANCELACION', 'CONFIRMACION', 'COMPLETADO'];

    /**
     * Default values for a new history instance
     * @type {HistoryData}
     */
    static defaultData = {
        id_historial: null,
        estado_historial: 'ENTRADA_VACIA',
        observacion_historial: '',
        fecha_cambio: null,
        accion: 'CREACION',
        codigo_reserva: null,
        created_at: null,
        updated_at: null
    };

    /**
     * Creates a new HistoryModel instance
     * @param {Partial<HistoryData>} data - Initial history data
     * @throws {Error} If validation fails
     */
    constructor(data = {}) {
        super(data, HistoryModel.defaultData);
        this.validate();
    }

    /**
     * Validates the history data
     * @private
     * @throws {Error} If validation fails
     */
    validate() {
        this.clearErrors();

        this.validateEnum('estado_historial', this._data.estado_historial, HistoryModel.VALID_ESTADOS);
        this.validateEnum('accion', this._data.accion, HistoryModel.VALID_ACCIONES);
        this.validateString('observacion_historial', this._data.observacion_historial);
        this.validateDate('fecha_cambio', this._data.fecha_cambio);
        
        if (!this._data.codigo_reserva) {
            this.addError('codigo_reserva', 'Código de reserva es requerido');
        }

        this.throwIfErrors();
    }

    // Setters with validation
    /** @param {string} value */
    set estado_historial(value) {
        if (!HistoryModel.VALID_ESTADOS.includes(value)) {
            throw new Error(`Estado de historial debe ser uno de: ${HistoryModel.VALID_ESTADOS.join(', ')}`);
        }
        this._data.estado_historial = value;
    }

    /** @param {string} value */
    set accion(value) {
        if (!HistoryModel.VALID_ACCIONES.includes(value)) {
            throw new Error(`Acción debe ser una de: ${HistoryModel.VALID_ACCIONES.join(', ')}`);
        }
        this._data.accion = value;
    }

    /** @param {string} value */
    set observacion_historial(value) {
        if (typeof value !== 'string') {
            throw new Error('Observación debe ser un texto válido');
        }
        this._data.observacion_historial = value.trim();
    }

    /** @param {Date|string} value */
    set fecha_cambio(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Fecha de cambio debe ser una fecha válida');
        }
        this._data.fecha_cambio = date;
    }

    // Getters
    /** @returns {number} History entry ID */
    get id_historial() { return this._data.id_historial; }
    /** @returns {string} History status */
    get estado_historial() { return this._data.estado_historial; }
    /** @returns {string} Observations */
    get observacion_historial() { return this._data.observacion_historial; }
    /** @returns {Date} Change date */
    get fecha_cambio() { return this._data.fecha_cambio; }
    /** @returns {string} Action performed */
    get accion() { return this._data.accion; }
    /** @returns {number} Associated booking code */
    get codigo_reserva() { return this._data.codigo_reserva; }

    /**
     * Gets the time elapsed since the change in days
     * @returns {number} Days since change
     */
    getTimeSinceChange() {
        const changeDate = new Date(this._data.fecha_cambio);
        const now = new Date();
        return (now - changeDate) / (1000 * 60 * 60 * 24);
    }

    /**
     * Checks if the change was made recently (less than 24 hours ago)
     * @returns {boolean} True if change is recent
     */
    isRecentChange() {
        return this.getTimeSinceChange() < 1;
    }

    /**
     * Converts the history model to a JSON object
     * @returns {Object} History data as JSON
     */
    toJSON() {
        return {
            id_historial: this._data.id_historial,
            estado_historial: this._data.estado_historial,
            observacion_historial: this._data.observacion_historial,
            fecha_cambio: this._data.fecha_cambio,
            accion: this._data.accion,
            codigo_reserva: this._data.codigo_reserva,
            created_at: this._data.created_at,
            updated_at: this._data.updated_at
        };
    }
}