import { BaseModel } from "../core/BaseModel.js";
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';

import { ServiceModel } from './ServiceModel.js';

/**
 * Represents the internal data structure of BookingModel
 * @typedef {Object} BookingModelData
 * @property {number|null} codigo_reserva - Booking ID
 * @property {string} origen_reserva - Origin location
 * @property {string} destino_reserva - Destination location
 * @property {Date|null} fecha_reserva - Booking date
 * @property {Date|null} fecha_realizado - Completion date
 * @property {string} tipo_reserva - Booking type
 * @property {string} observacion_reserva - Observations
 * @property {string} estado_reserva - Status
 * @property {Date|null} deleted_at_reserva - Soft delete timestamp
 * @property {Date|null} created_at - Creation timestamp
 * @property {Date|null} updated_at - Last update timestamp
 * @property {UserModel|null} driver - Associated driver
 * @property {TaxiModel|null} taxi - Associated taxi
 * @property {UserModel|null} cliente - Associated cliente
 * @property {ServiceModel|null} service - Associated service
 * @property {import('./HistoryModel.js').HistoryModel[]} history - Booking history records
 * @property {Object} tarifa - Rate information
 * @property {number} tarifa.id_tarifa - Rate ID
 * @property {number} tarifa.precio - Rate price
 * @property {string} tarifa.descripcion - Rate description
 * @property {string} tarifa.tipo - Rate type
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - The field that failed validation
 * @property {string} message - The error message
 */

/**
 * Class representing a Booking in the system
 * @extends {BaseModel<BookingModelData>}
 */
export class BookingModel extends BaseModel {
    static VALID_TIPOS = ['NORMAL', 'PROGRAMADO'];
    static VALID_ESTADOS = [
        'EN_REVISION',      // Initial state when booking is created
        'PENDIENTE',        // After admin approves and assigns driver
        'CONFIRMADO',       // When driver starts trip and is heading to pickup
        'RECOGIDO',        // Changed from EN_RUTA - When passenger is picked up
        'CANCELADO',        // If booking is cancelled
        'COMPLETADO'        // When trip is finished
    ];
    static VALID_RIDE_TYPES = ['CIUDAD', 'AEROPUERTO'];

    /**
     * Default values for a new booking instance
     * @type {BookingModelData}
     */
    static defaultData = {
        codigo_reserva: null,
        origen_reserva: '',
        destino_reserva: '',
        fecha_reserva: null,
        fecha_realizado: null,
        tipo_reserva: 'NORMAL',
        observacion_reserva: '',
        estado_reserva: 'EN_REVISION',
        deleted_at_reserva: null,
        created_at: null,
        updated_at: null,
        driver: null,
        taxi: null,
        cliente: null,
        servicio: {
            codigo_servicio: null,
            tipo_servicio: '',
            descripcion_servicio: '',
            tarifas: []
        },
        history: []
    };

    /**
     * Creates a new BookingModel instance
     * @param {Partial<BookingModelData>} data - Initial booking data
     * @throws {Error} If validation fails
     */
    constructor(data = {}) {
        super(data, BookingModel.defaultData);
        this.validate();
        
        // Initialize related models if raw data is provided
        if (data.driver) {
            this.driver = data.driver;
        }
        if (data.taxi) {
            this.taxi = data.taxi instanceof TaxiModel ? 
                data.taxi : 
                new TaxiModel(data.taxi);
        }
        if (data.cliente) {
            this.cliente = data.cliente;
        }
        if (data.servicio) {
            this._data.servicio = {
                codigo_servicio: data.servicio.codigo_servicio,
                tipo_servicio: data.servicio.tipo_servicio,
                descripcion_servicio: data.servicio.descripcion_servicio,
                tarifas: data.servicio.tarifas || []
            };
        }
    }

    /**
     * Validates the booking data
     * @private
     * @throws {Error} If validation fails
     */
    validate() {
        this.clearErrors();

        this.validateEnum('tipo_reserva', this._data.tipo_reserva, BookingModel.VALID_RIDE_TYPES);
        this.validateEnum('estado_reserva', this._data.estado_reserva, BookingModel.VALID_ESTADOS);
        this.validateDate('fecha_reserva', this._data.fecha_reserva);
        this.validateString('origen_reserva', this._data.origen_reserva);
        this.validateString('destino_reserva', this._data.destino_reserva);

        this.throwIfErrors();
    }

    // Setters with validation
    /** @param {string} value */
    set origen_reserva(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Origen debe ser una dirección válida');
        }
        this._data.origen_reserva = value.trim();
    }

    /** @param {string} value */
    set destino_reserva(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Destino debe ser una dirección válida');
        }
        this._data.destino_reserva = value.trim();
    }

    /** @param {Date|string} value */
    set fecha_reserva(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Fecha de reserva debe ser una fecha válida');
        }
        this._data.fecha_reserva = date;
    }

    /** @param {string} value */
    set tipo_reserva(value) {
        if (!BookingModel.VALID_RIDE_TYPES.includes(value)) {
            throw new Error(`Tipo de reserva debe ser uno de: ${BookingModel.VALID_RIDE_TYPES.join(', ')}`);
        }
        this._data.tipo_reserva = value;
    }

    /** @param {string} value */
    set estado_reserva(value) {
        if (!BookingModel.VALID_ESTADOS.includes(value)) {
            throw new Error(`Estado de reserva debe ser uno de: ${BookingModel.VALID_ESTADOS.join(', ')}`);
        }
        this._data.estado_reserva = value;
    }

    /** @param {UserModel|Object} value */
    set driver(value) {
        this._data.driver = value instanceof UserModel ? value : new UserModel(value);
        if (!this._data.driver.isDriver()) {
            throw new Error('El conductor asignado debe tener rol de conductor');
        }
    }

    /** @param {TaxiModel|Object} value */
    set taxi(value) {
        this._data.taxi = value instanceof TaxiModel ? value : new TaxiModel(value);
        this._data.patente_taxi = this._data.taxi.patente;
    }

    /** @param {ServiceModel|Object} value */
    set service(value) {
        this._data.service = value instanceof ServiceModel ? value : new ServiceModel(value);
    }

    /** @param {UserModel|Object} value */
    set cliente(value) {
        this._data.cliente = value instanceof UserModel ? value : new UserModel(value);
    }

    // Getters
    /** @returns {number} Booking ID */
    get codigo_reserva() { return this._data.codigo_reserva; }
    /** @returns {string} Origin location */
    get origen_reserva() { return this._data.origen_reserva; }
    /** @returns {string} Destination location */
    get destino_reserva() { return this._data.destino_reserva; }
    /** @returns {Date} Booking date */
    get fecha_reserva() { return this._data.fecha_reserva; }
    /** @returns {Date} Completion date */
    get fecha_realizado() { return this._data.fecha_realizado; }
    /** @returns {string} Booking type */
    get tipo_reserva() { return this._data.tipo_reserva; }
    /** @returns {string} Booking status */
    get estado_reserva() { return this._data.estado_reserva; }
    /** @returns {UserModel} Associated driver */
    get driver() { return this._data.driver; }
    /** @returns {TaxiModel} Associated taxi */
    get taxi() { return this._data.taxi; }
    /** @returns {TripModel} Associated trip */
    get trip() { return this._data.trip; }
    /** @returns {UserModel} Associated cliente */
    get cliente() { return this._data.cliente; }
    /** @returns {ServiceModel} Associated service */
    get service() { return this._data.service; }
    /** @returns {import('./HistoryModel.js').HistoryModel[]} Booking history */
    get history() { return this._data.history; }

    // Status check methods
    /**
     * Checks if the booking is pending
     * @returns {boolean} True if booking is pending
     */
    isPending() { return this._data.estado_reserva === 'PENDIENTE'; }

    /**
     * Checks if the booking is confirmed
     * @returns {boolean} True if booking is confirmed
     */
    isConfirmed() { return this._data.estado_reserva === 'CONFIRMADO'; }

    /**
     * Checks if the booking can be assigned
     * @returns {boolean} True if booking can be assigned
     */
    canBeAssigned() { return this._data.estado_reserva === 'EN_REVISION'; }

    /**
     * Checks if the booking is in route (passenger picked up)
     * @returns {boolean} True if booking is in route
     */
    isInRoute() { 
        return this._data.estado_reserva === 'EN_RUTA'; 
    }

    /**
     * Checks if the passenger has been picked up
     * @returns {boolean} True if passenger has been picked up
     */
    isPassengerPickedUp() { 
        return this._data.estado_reserva === 'RECOGIDO'; 
    }

    /**
     * Converts the booking model to a JSON object
     * @returns {Object} Booking data as JSON
     */
    toJSON() {
        const json = {
            codigo_reserva: this._data.codigo_reserva,
            origen_reserva: this._data.origen_reserva,
            destino_reserva: this._data.destino_reserva,
            fecha_reserva: this._data.fecha_reserva,
            fecha_realizado: this._data.fecha_realizado,
            tipo_reserva: this._data.tipo_reserva,
            observacion_reserva: this._data.observacion_reserva,
            estado_reserva: this._data.estado_reserva,
            deleted_at_reserva: this._data.deleted_at_reserva,
            created_at: this._data.created_at,
            updated_at: this._data.updated_at,
            patente_taxi: this._data.patente_taxi,
            rut_conductor: this._data.rut_conductor,
            servicio: this._data.servicio ? {
                codigo_servicio: this._data.servicio.codigo_servicio,
                tipo_servicio: this._data.servicio.tipo_servicio,
                descripcion_servicio: this._data.servicio.descripcion_servicio,
                tarifas: this._data.servicio.tarifas?.map(tarifa => ({
                    id_tarifa: tarifa.id_tarifa,
                    precio: tarifa.precio,
                    descripcion_tarifa: tarifa.descripcion_tarifa,
                    tipo_tarifa: tarifa.tipo_tarifa
                })) || []
            } : null
        };

        if (this._data.driver) json.driver = this._data.driver.toJSON();
        if (this._data.taxi) json.taxi = this._data.taxi.toJSON();
        if (this._data.cliente) json.cliente = this._data.cliente.toJSON();
        if (this._data.history?.length) {
            json.history = this._data.history.map(h => h.toJSON());
        }

        return json;
    }
}