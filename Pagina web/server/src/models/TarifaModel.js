import { BaseModel } from "../core/BaseModel.js";

export class RateModel extends BaseModel{

    static tarifaData = {
        id: null,
        rut: null,
        descripciont: '',
        precio: 0,
        tipo: '',
        fcreada: new Date(),
        estadot: 'ACTIVO',
        deletedatt: null,
        persona: null  
    }

    constructor(data = {}){
        super(data, RateModel.tarifaData);
    }

    get id() { return this._data.id; }
    get descripciont() { return this._data.descripciont; }
    get precio() { return this._data.precio; }
    get tipo() { return this._data.tipo; }
    get estadot() { return this._data.estadot; }

    getPersona(){
        return this._data.persona;
    }

    isActive(){
        return this._data.estadot === 'ACTIVO';
    }

    toJSON(){
        return {
            id: this._data.id,
            descripciont: this._data.descripciont,
            precio: this._data.precio,
            tipo: this._data.tipo,
            fcreada: this._data.fcreada,
            estadot: this._data.estadot,
            deletedatt: this._data.deletedatt,
        };
    }

    static fromDB(data){
        return new RateModel(data);
    }
}
