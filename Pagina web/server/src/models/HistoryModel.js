import { BaseModel } from "../core/BaseModel";

export class HistoryModel extends BaseModel{

    static historyData = {
        idhistorial: null,
        fcambio: new Date(),
        estadoh: ''
    }

    constructor(data = {}){
        super(data, HistoryModel.historyData);
    }

    get idhistorial() { return this._data.idhistorial; }
    get fcambio() { return this._data.fcambio; }
    get estadoh() { return this._data.estadoh; }

    getTimeSinceChange(){
        const changeData = new Date(this._data.fcambio);
        const now = new Date();
        return (now - changeData) / (1000 * 60 * 60 * 24);
    }

    toJSON(){
        return {
            idhistorial: this._data.idhistorial,
            fcambio: this._data.fcambio,
            estadoh: this._data.estadoh,
        };
    }

    static fromDB(data){
        return new HistoryModel(data);
    }
}