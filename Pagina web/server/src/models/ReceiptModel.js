import { BaseModel } from '../core/BaseModel.js';

export class ReceiptModel extends BaseModel {
    static receiptData = {
        codigo_boleta: null,
        total: 0,
        fecha_emision: null,
        metodo_pago: '',
        descripcion_boleta: '',
        estado_boleta: 'ACTIVO',
        deleted_at_boleta: null
    };

    constructor(data = {}) {
        super(data, ReceiptModel.receiptData);
    };

    // Getters
    get codigo_boleta() { return this._data.codigo_boleta; }
    get total() { return this._data.total; }
    get fecha_emision() { return this._data.fecha_emision; }
    get metodo_pago() { return this._data.metodo_pago; }
    get descripcion_boleta() { return this._data.descripcion_boleta; }
    get estado_boleta() { return this._data.estado_boleta; }
    get deleted_at_boleta() { return this._data.deleted_at_boleta; }

    // Domain methods
    isDeleted() {
        return this._data.deleted_at_boleta !== null;
    }

    itsFullyPaid(){
        return this._data.estado_boleta ==='PAGADO'; 
    }

    isActive() {
        return this._data.estado_boleta === 'ACTIVO';
    }

    toJSON() {
        return {
            codigo_boleta: this._data.codigo_boleta,
            total: this._data.total,
            fecha_emision: this._data.fecha_emision,
            metodo_pago: this._data.metodo_pago,
            descripcion_boleta: this._data.descripcion_boleta,
            estado_boleta: this._data.estado_boleta,
            deleted_at_boleta: this._data.deleted_at_boleta,
        };
    }

    static fromDB(data) {
        return new ReceiptModel(data);
    }
}

