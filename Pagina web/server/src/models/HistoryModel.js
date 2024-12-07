import { BaseModel } from '../core/BaseModel.js';

export class HistoryModel extends BaseModel {
    static defaultData = {
        id_historial: null,
        estado_historial: '',
        observacion_historial: '',
        fecha_cambio: null,
        accion: 'CREACION'
    };

    constructor(data = {}){
        super(data, HistoryModel.defaultData);
    }

    get idhistorial() { return this._data.idhistorial; }
    get fecha_cambio() { return this._data.fecha_cambio; }
    get estado_historial() { return this._data.estado_historial; }
    get observacion_historial() { return this._data.observacion_historial; }
    get accion() { return this._data.accion; }

    getTimeSinceChange(){
        const changeData = new Date(this._data.fecha_cambio);
        const now = new Date();
        return (now - changeData) / (1000 * 60 * 60 * 24);
    }

    isRecentChange() {
        return this.getTimeSinceChange() < 1;
      }

    toJSON(){
        return {
            idhistorial: this._data.idhistorial,
            fecha_cambio: this._data.fecha_cambio,
            estado_historial: this._data.estado_historial,
            observacion_historial: this._data.observacion_historial,
            accion: this._data.accion
        };
    }

    static fromDB(data){
        if(!data) return null;
        return new HistoryModel(data);
    }
}