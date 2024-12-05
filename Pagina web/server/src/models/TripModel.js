import { BaseModel } from '../core/BaseModel.js';
import { BookingModel } from './BookingModel.js';
import { UserModel } from './UserModel.js';
import { TaxiModel } from './TaxiModel.js';
import { InvoiceModel } from './InvoiceModel.js';

export class TripModel extends BaseModel {
    static defaultData = {
        // Campos de la tabla 'viaje'
        codigo: null,           // ID del viaje
        codigoreserva: null,    // ID de la reserva asociada
        duracionv: 0,           // Duración del viaje
        observacionv: '',       // Observaciones del viaje
        fechav: null,           // Fecha del viaje
        estadov: 'PENDIENTE',   // Estado del viaje
        deletedatvj: null,      // Soft delete

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
            invoice: data.invoice instanceof InvoiceModel ? data.invoice : null
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
        if (data.invoice && !(data.invoice instanceof InvoiceModel)) {
            this._data.invoice = new InvoiceModel(data.invoice);
        }

        // Inicializar arreglos de relaciones
        this._data.generates = Array.isArray(data.generates) ? data.generates : [];
        this._data.ratings = Array.isArray(data.ratings) ? data.ratings : [];
    }

    // Getters básicos (mantienen nombres de BD)
    get codigo() { return this._data.codigo; }
    get codigoreserva() { return this._data.codigoreserva; }
    get duracionv() { return this._data.duracionv; }
    get observacionv() { return this._data.observacionv; }
    get fechav() { return this._data.fechav; }
    get estadov() { return this._data.estadov; }
    get deletedatvj() { return this._data.deletedatvj; }

    // Getters de relaciones (nombres en inglés)
    get booking() { return this._data.booking; }
    get driver() { return this._data.driver; }
    get taxi() { return this._data.taxi; }
    get invoice() { return this._data.invoice; }
    get generates() { return this._data.generates; }
    get ratings() { return this._data.ratings; }

    // Métodos de estado
    isPending() { return this._data.estadov === 'PENDIENTE'; }
    isInProgress() { return this._data.estadov === 'EN_CURSO'; }
    isCompleted() { return this._data.estadov === 'COMPLETADO'; }
    isCancelled() { return this._data.estadov === 'CANCELADO'; }

    // Métodos de relaciones
    hasBooking() { return !!this._data.booking; }
    hasDriver() { return !!this._data.driver; }
    hasTaxi() { return !!this._data.taxi; }
    hasInvoice() { return !!this._data.invoice; }

    // Métodos para relaciones ternarias
    addGenerate(booking, invoice = null) {
        const generateRecord = {
            codigo: this.codigo,
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
            codigo: this.codigo,
            idvaloracion: ratingId,
            fechavaloracion: new Date()
        };
        this._data.ratings.push(ratingRecord);
        return ratingRecord;
    }

    toJSON() {
        const json = {
            codigo: this._data.codigo,
            codigoreserva: this._data.codigoreserva,
            duracionv: this._data.duracionv,
            observacionv: this._data.observacionv,
            fechav: this._data.fechav,
            estadov: this._data.estadov,
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