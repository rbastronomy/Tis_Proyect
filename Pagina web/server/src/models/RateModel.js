import { BaseModel } from "../core/BaseModel.js";

export class RateModel extends BaseModel{

    static rateData = {
        id_tarifa: null,
        rut: null,
        descrdescripcion_tarifaipciont: '',
        precio: 0,
        tipo_tarifa: '',
        fecha_creacion_tarifa: new Date(),
        estado_tarifa: 'ACTIVO',
        fecha_eliminacion_tarifa: null,
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
            fecha_creacion_tarifa: this._data.fecha_creacion_tarifa,
            estado_tarifa: this._data.estado_tarifa,
            fecha_eliminacion_tarifa: this._data.fecha_eliminacion_tarifa,
        };
    }

    static fromDB(data){
        return new RateModel(data);
    }

}