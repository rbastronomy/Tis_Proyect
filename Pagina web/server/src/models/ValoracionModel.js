import { BaseModel } from "../core/BaseModel";

export class ValoracionModel extends BaseModel{

    static valoracionData = {
        idvaloracion: null,
        comentario: '',
        calificacion: 0,
        fvaloracion: new Date(),
        estadov: 'ACTIVO',
        deletedatvj: null
    }

    constructor(data = {}){
        super(data, ValoracionModel.valoracionData);
    }

    get idvaloracion() { return this._data.idvaloracion; }
    get comentario() { return this._data.comentario; }
    get calificacion() { return this._data.calificacion; }
    get fvaloracion() { return this._data.fvaloracion; }

    isPositive(){
        return this._data.calificacion >= 4;
    }

    isNegative(){
        return this._data.calificacion <= 2;
    }

    getQualitativeRating(){
        if(this._data.calificacion >=4) return 'EXCELENTE';
        if(this._data.calificacion <=3) return 'BUENO';
        if(this._data.calificacion <=2) return 'REGULAR';
        return 'NEUTRO';
    }

    toJSON(){
        return {
            idvaloracion: this._data_idvaloracion,
            comentario: this._data.comentario,
            calificacion: this._data.calificacion,
            fvaloracion: this._data.fvaloracion,
            estadov: this._data.estadov,
            deletedatvj: this._data.deletedatvj,
        };
    }

    static fromDB(data){
        return new ValoracionModel(data);
    }

}