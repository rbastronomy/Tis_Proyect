import { BaseModel } from '../core/BaseModel.js';

export class TripModel extends BaseModel {
    static tripData = {
        codigo: null,
        origenv: '',
        destinov: '',
        duracion: 0,
        pasajeros: 0,
        observacion: '',
        estadov: 'ACTIVO',
        deletedatvj: null,
    };

    constructor(data = {}) {
        super(data, TripModel.tripData);
    }

    // Getters
    get codigo() { return this._data.codigo; }
    get origenv() { return this._data.origenv; }
    get destinov() { return this._data.destinov; }
    get duracion() { return this._data.duracion; }
    get pasajeros() { return this._data.pasajeros; }
    get observacion() { return this._data.observacion; }
    get estadov() { return this._data.estadov; }
    get deletedatvj() { return this._data.deletedatvj; }

    // Domain methods
    isCompleted() {
        return this._data.estadov === 'COMPLETADO';
    }

    isActive() {
        return this._data.estadov === 'ACTIVO';
    }

    get

    toJSON() {
        return {
            codigo: this._data.codigo,
            origenv: this._data.origenv,
            destinov: this._data.destinov,
            duracion: this._data.duracion,
            pasajeros: this._data.pasajeros,
            observacion: this._data.observacion,
            estadov: this._data.estadov,
            deletedatvj: this._data.deletedatvj,
        };
    }
}