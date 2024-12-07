import { BaseModel } from '../core/BaseModel.js';

export class HistoryModel extends BaseModel {

    static historyData = {
        id_historial: null,
        codigo_reserva: null,
        fecha_cambio: new Date(),
        observacion_historial: '',
        estado_historial: ''
    }

    constructor(data = {}){
        super(data, HistoryModel.historyData);
    }

    get id_historial() { return this._data.id_historial; }
    get fecha_cambio() { return this._data.fecha_cambio; }
    get estado_historial() { return this._data.estado_historial; }
    get observacion_historial() { return this._data.observacion_historial; }    

    getTimeSinceChange(){
        const changeData = new Date(this._data.fecha_cambio);
        const now = new Date();
        return (now - changeData) / (1000 * 60 * 60 * 24);
    }

    toJSON(){
        return {
            id_historial: this._data.id_historial,
            fecha_cambio: this._data.fecha_cambio,
            observacion_historial: this._data.observacion_historial,
            estado_historial: this._data.estado_historial,
        };
    }

    static fromDB(data){
        return new HistoryModel(data);
    }
}