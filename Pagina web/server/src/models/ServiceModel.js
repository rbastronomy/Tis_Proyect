import { BaseModel } from '../core/BaseModel.js';

export class ServiceModel extends BaseModel{

    static serviceData = {
        codigos: null,
        id: null,
        tipo: '',
        descripciont: '',
        estados: 'ACTIVO',
        deleteats: null,
        tarifa: null
    }

    constructor(data = {}){
        super(data, ServiceModel.serviceData);
    }

    get codigos() { return this._data.codigos; }
    get descripciont() { return this._data.descripciont; }
    get estados() { return this._data.estados; }
    get tipo() { return this._data.tipo; }

    getTarifa(){
        return this._data.tarifa;
    }

    isAvailable(){
        return this._data.estados === 'DISPONIBLE';
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            codigos: this._data.codigos,
            descripciont: this._data.descripciont,
            estados: this._data.estados,
            deleteats: this._data.deleteats,
        };
    }

    static fromDB(data){
        return new ServiceModel(data);
    }
}