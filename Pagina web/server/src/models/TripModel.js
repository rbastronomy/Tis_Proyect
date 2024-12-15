import { BaseModel } from '../core/BaseModel.js';
import { BookingModel } from './BookingModel.js';
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { ReceiptModel } from './ReceiptModel.js';

/**
 * @typedef {Object} TripModelData
 * @property {number|null} codigo_viaje - Trip ID
 * @property {string} origen_viaje - Trip origin location
 * @property {string} destino_viaje - Trip destination location
 * @property {number} duracion - Trip duration in minutes
 * @property {number} pasajeros - Number of passengers
 * @property {string} observacion_viaje - Trip observations
 * @property {Date|null} fecha_viaje - Trip completion date
 * @property {string} estado_viaje - Trip status (always COMPLETADO for valid trips)
 * @property {Date|null} deleted_at_viaje - Soft delete timestamp
 * @property {Date|null} created_at - Creation timestamp
 * @property {Date|null} updated_at - Last update timestamp
 */

export class TripModel extends BaseModel {
    static VALID_ESTADOS = [
        'COMPLETADO',    // Trip record is valid and complete
        'ANULADO'       // Trip record was voided/cancelled after creation
    ];

    /**
     * Default values for a new trip instance
     * @type {TripModelData}
     */
    static defaultData = {
        codigo_viaje: null,
        origen_viaje: '',
        destino_viaje: '',
        duracion: 0,
        pasajeros: 1,
        observacion_viaje: '',
        fecha_viaje: null,
        estado_viaje: 'COMPLETADO',
        deleted_at_viaje: null,
        created_at: null,
        updated_at: null,
        booking: null,
        driver: null,
        taxi: null,
        receipt: null
    };

    /**
     * Creates a new TripModel instance representing a completed trip
     * @param {Partial<TripModelData>} data - Initial trip data
     * @throws {Error} If validation fails
     */
    constructor(data = {}) {
        // Ensure fecha_viaje is set to completion time if not provided
        if (!data.fecha_viaje) {
            data.fecha_viaje = new Date();
        }
        
        super(data, TripModel.defaultData);

        // Initialize related models if raw data is provided
        if (data.booking) {
            this.booking = data.booking;
        }
        if (data.receipt) {
            this.receipt = data.receipt;
        }

        this.validate();
    }

    /**
     * Validates the trip record data
     * @private
     * @throws {Error} If validation fails
     */
    validate() {
        this.clearErrors();

        this.validateString('origen_viaje', this._data.origen_viaje);
        this.validateString('destino_viaje', this._data.destino_viaje);
        this.validateNumber('duracion', this._data.duracion, { min: 1 });
        this.validateNumber('pasajeros', this._data.pasajeros, { min: 1 });
        this.validateString('observacion_viaje', this._data.observacion_viaje, { required: false });
        this.validateDate('fecha_viaje', this._data.fecha_viaje);
        this.validateEnum('estado_viaje', this._data.estado_viaje, TripModel.VALID_ESTADOS);

        // Modified validation to check booking instead of driver/taxi directly
        if (!this._data.booking) {
            this.addError('booking', 'El viaje debe estar asociado a una reserva');
        } else {
            // Access booking data through _data property since it's a BookingModel instance
            const bookingData = this._data.booking._data;
            
            // Validate that booking has driver and taxi info
            if (!bookingData.rut_conductor) {
                this.addError('driver', 'La reserva debe tener un conductor asignado');
            }
            if (!bookingData.patente_taxi) {
                this.addError('taxi', 'La reserva debe tener un taxi asignado');
            }
        }

        this.throwIfErrors();
    }

    // Setters with validation
    /** @param {string} value */
    set origen_viaje(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Origen debe ser una dirección válida');
        }
        this._data.origen_viaje = value.trim();
    }

    /** @param {string} value */
    set destino_viaje(value) {
        if (typeof value !== 'string' || value.trim().length === 0) {
            throw new Error('Destino debe ser una dirección válida');
        }
        this._data.destino_viaje = value.trim();
    }

    /** @param {number} value */
    set duracion(value) {
        const duration = Number(value);
        if (isNaN(duration) || duration < 1) {
            throw new Error('Duración debe ser al menos 1 minuto');
        }
        this._data.duracion = duration;
    }

    /** @param {number} value */
    set pasajeros(value) {
        const passengers = Number(value);
        if (isNaN(passengers) || passengers < 1) {
            throw new Error('Debe haber al menos un pasajero');
        }
        this._data.pasajeros = passengers;
    }

    /** @param {Date|string} value */
    set fecha_viaje(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (isNaN(date.getTime())) {
            throw new Error('Fecha de viaje debe ser una fecha válida');
        }
        this._data.fecha_viaje = date;
    }

    /** @param {BookingModel|Object} value */
    set booking(value) {
        if (value instanceof BookingModel) {
            this._data.booking = value;
        } else {
            this._data.booking = new BookingModel(value);
        }
    }

    /** @param {ReceiptModel|Object} value */
    set receipt(value) {
        if (value instanceof ReceiptModel) {
            this._data.receipt = value;
        } else {
            this._data.receipt = new ReceiptModel(value);
        }
    }

    // Getters
    get codigo_viaje() { return this._data.codigo_viaje; }
    get origen_viaje() { return this._data.origen_viaje; }
    get destino_viaje() { return this._data.destino_viaje; }
    get duracion() { return this._data.duracion; }
    get pasajeros() { return this._data.pasajeros; }
    get observacion_viaje() { return this._data.observacion_viaje; }
    get fecha_viaje() { return this._data.fecha_viaje; }
    get estado_viaje() { return this._data.estado_viaje; }
    get booking() { return this._data.booking; }
    get driver() { return this._data.driver; }
    get taxi() { return this._data.taxi; }
    get receipt() { return this._data.receipt; }

    /**
     * Converts the trip record to a JSON object
     * @returns {Object} Trip data as JSON
     */
    toJSON() {
        const json = {
            codigo_viaje: this._data.codigo_viaje,
            origen_viaje: this._data.origen_viaje,
            destino_viaje: this._data.destino_viaje,
            duracion: this._data.duracion,
            pasajeros: this._data.pasajeros,
            observacion_viaje: this._data.observacion_viaje,
            fecha_viaje: this._data.fecha_viaje,
            estado_viaje: this._data.estado_viaje,
            deleted_at_viaje: this._data.deleted_at_viaje,
            created_at: this._data.created_at,
            updated_at: this._data.updated_at
        };

        if (this._data.booking) json.booking = this._data.booking.toJSON();
        if (this._data.driver) json.driver = this._data.driver.toJSON();
        if (this._data.taxi) json.taxi = this._data.taxi.toJSON();
        if (this._data.receipt) json.receipt = this._data.receipt.toJSON();

        return json;
    }
}