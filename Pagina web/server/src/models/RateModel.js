import { BaseModel } from "../core/BaseModel.js";

export class RateModel extends BaseModel{

    static rateData = {
        id_tarifa: null,
        rut_admin: null,
        descripcion_tarifa: '',
        precio: 0,
        tipo_tarifa: '',
        created_at_tarifa: new Date(),
        estado_tarifa: 'ACTIVO',
        delete_at_tarifa: null,
        persona: null
    }

    constructor(data = {}){
        super(data, RateModel.rateData);
    }

    get id_tarifa() { return this._data.id_tarifa; }
    get descripcion_tarifa() { return this._data.descripcion_tarifa; }
    get precio() { return this._data.precio; }
    get tipo_tarifa() { return this._data.tipo_tarifa; }
    get estado_tarifa() { return this._data.estado_tarifa; }

    getPersona(){
        return this._data.persona;
    }

    isActive(){
        return this._data.estado_tarifa === 'ACTIVO';
    }

    getPrecio(){
        return this._data.precio;
    }

    toJSON(){
        return {
            id_tarifa: this._data.id_tarifa,
            descripcion_tarifa: this._data.descripcion_tarifa,
            precio: this._data.precio,
            tipo_tarifa: this._data.tipo_tarifa,
            created_at_tarifa: this._data.created_at_tarifa,
            estado_tarifa: this._data.estado_tarifa,
            delete_at_tarifa: this._data.delete_at_tarifa,
        };
    }

    static fromDB(data){
        return new RateModel(data);
    }

}