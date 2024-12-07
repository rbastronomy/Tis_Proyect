import { BaseModel } from '../core/BaseModel.js';
import { BookingModel } from './BookingModel.js';
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { ReceiptModel } from './ReceiptModel.js';

export class TripModel extends BaseModel {
    static defaultData = {
        // Campos de la tabla 'viaje'
        codigo_viaje: null,           // ID del viaje
        origen_viaje: '',            // Origen del viaje
        destino_viaje: '',           // Destino del viaje
        duracion: 0,                 // Duración del viaje
        pasajeros: 0,                // Número de pasajeros
        observacion_viaje: '',       // Observaciones del viaje
        fecha_viaje: null,           // Fecha del viaje
        estado_viaje: 'PENDIENTE',   // Estado del viaje
        deleted_at_viaje: null,      // Soft delete

        // Relaciones
        booking: null,          // Reserva asociada (BookingModel)
        driver: null,           // Conductor (UserModel)
        taxi: null,             // Taxi (TaxiModel)
        invoice: null,          // Boleta (InvoiceModel)

        // Relaciones ternarias
        generates: [],          // Relación viaje-reserva-boleta
        ratings: []             // Relación persona-viaje-valoración
    };

    constructor(data = {}) {
        const modelData = {
            ...data,
            booking: data.booking instanceof BookingModel ? data.booking : null,
            driver: data.driver instanceof UserModel ? data.driver : null,
            taxi: data.taxi instanceof TaxiModel ? data.taxi : null,
            invoice: data.invoice instanceof ReceiptModel ? data.invoice : null
        };

        super(modelData, TripModel.defaultData);

        // Inicializar modelos si se proporcionan datos crudos
        if (data.booking && !(data.booking instanceof BookingModel)) {
            this._data.booking = new BookingModel(data.booking);
        }
        if (data.driver && !(data.driver instanceof UserModel)) {
            this._data.driver = new UserModel(data.driver);
        }
        if (data.taxi && !(data.taxi instanceof TaxiModel)) {
            this._data.taxi = new TaxiModel(data.taxi);
        }
        if (data.invoice && !(data.invoice instanceof ReceiptModel)) {
            this._data.invoice = new ReceiptModel(data.invoice);
        }

        // Inicializar arreglos de relaciones
        this._data.generates = Array.isArray(data.generates) ? data.generates : [];
        this._data.ratings = Array.isArray(data.ratings) ? data.ratings : [];
    }

    // Getters básicos (mantienen nombres de BD)
    get codigo_viaje() { return this._data.codigo_viaje; }
    get origen_viaje() { return this._data.origen_viaje; }
    get destino_viaje() { return this._data.destino_viaje; }
    get duracion() { return this._data.duracion; }
    get pasajeros() { return this._data.pasajeros; }
    get observacion_viaje() { return this._data.observacion_viaje; }
    get fecha_viaje() { return this._data.fecha_viaje; }
    get estado_viaje() { return this._data.estado_viaje; }
    get deleted_at_viaje() { return this._data.deleted_at_viaje; }

    // Getters de relaciones (nombres en inglés)
    get booking() { return this._data.booking; }
    get driver() { return this._data.driver; }
    get taxi() { return this._data.taxi; }
    get invoice() { return this._data.invoice; }
    get generates() { return this._data.generates; }
    get ratings() { return this._data.ratings; }

    // Métodos de estado
    isPending() { return this._data.estado_viaje === 'PENDIENTE'; }
    isInProgress() { return this._data.estado_viaje === 'EN_CURSO'; }
    isCompleted() { return this._data.estado_viaje === 'COMPLETADO'; }
    isCancelled() { return this._data.estado_viaje === 'CANCELADO'; }

    // Métodos de relaciones
    hasBooking() { return !!this._data.booking; }
    hasDriver() { return !!this._data.driver; }
    hasTaxi() { return !!this._data.taxi; }
    hasInvoice() { return !!this._data.invoice; }

    // Métodos para relaciones ternarias
    addGenerate(booking, invoice = null) {
        const generateRecord = {
            codigo_viaje: this.codigo_viaje,
            codigoreserva: booking.codigoreserva,
            codigoboleta: invoice?.codigoboleta || null,
            fechagenerada: new Date()
        };
        this._data.generates.push(generateRecord);
        return generateRecord;
    }

    addRating(userId, ratingId) {
        const ratingRecord = {
            rut: userId,
            codigo_viaje: this.codigo_viaje,
            idvaloracion: ratingId,
            fechavaloracion: new Date()
        };
        this._data.ratings.push(ratingRecord);
        return ratingRecord;
    }

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
            generates: this._data.generates,
            ratings: this._data.ratings
        };

        // Agregar relaciones si existen
        if (this._data.booking) json.booking = this._data.booking.toJSON();
        if (this._data.driver) json.driver = this._data.driver.toJSON();
        if (this._data.taxi) json.taxi = this._data.taxi.toJSON();
        if (this._data.invoice) json.invoice = this._data.invoice.toJSON();

        return json;
    }

    static fromDB(data) {
        if (!data) return null;
        return new TripModel(data);
    }
}