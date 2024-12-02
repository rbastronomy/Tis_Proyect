import { BaseModel } from '../core/BaseModel.js';

export class InvoiceModel extends BaseModel {
    static invoiceData = {
        codigoboleta: null,
        total: 0,
        femision: new Date(),
        metodopago: '',
        descripciont: '',
        estadob: 'ACTIVO',
        deletedatbo: null
    };

    constructor(data = {}) {
        super(data, InvoiceModel.invoiceData);
    }

    // Getters
    get codigoboleta() { return this._data.codigoboleta; }
    get total() { return this._data.total; }
    get femision() { return this._data.femision; }
    get metodopago() { return this._data.metodopago; }
    get descripciont() { return this._data.descripciont; }
    get estadob() { return this._data.estadob; }
    get deletedatbo() { return this._data.deletedatbo; }

    // Domain methods
    isDeleted() {
        return this._data.deletedatbo !== null;
    }

    itsFullyPaid(){
        return this._data.estadob ==='PAGADO'; 
    }

    isActive() {
        return this._data.estadob === 'ACTIVO';
    }

    toJSON() {
        return {
            codigoboleta: this._data.codigoboleta,
            total: this._data.total,
            femision: this._data.femision,
            metodopago: this._data.metodopago,
            descripciont: this._data.descripciont,
            estadob: this._data.estadob,
            deletedatbo: this._data.deletedatbo,
        };
    }

    static fromDB(data) {
        return new InvoiceModel(data);
    }
}

