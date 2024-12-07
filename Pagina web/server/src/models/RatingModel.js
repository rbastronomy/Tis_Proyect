import { BaseModel } from "../core/BaseModel";

export class RatingModel extends BaseModel{

    static ratingData = {
        id_valoracion: null,
        comentario_valoracion: '',
        calificacion: 0,
        fecha_valoracion: null,
        estado_valoracion: 'ACTIVO',
        deleted_at_valoracion: null
    }

    constructor(data = {}){
        super(data, RatingModel.ratingData);
    }

    get id_valoracion() { return this._data.id_valoracion; }
    get comentario_valoracion() { return this._data.comentario_valoracion; }
    get calificacion() { return this._data.calificacion; }
    get fecha_valoracion() { return this._data.fecha_valoracion; }

    isPositive(){
        return this._data.calificacion >= 4;
    }

    isNegative(){
        return this._data.calificacion <= 2;
    }

    getQualitativeRating(){
        if(this._data.calificacion >=5) return 'EXCELENTE';
        if(this._data.calificacion <=4) return 'BUENO';
        if(this._data.calificacion <=3) return 'REGULAR';
        return 'NEUTRO';
    }

    toJSON(){
        return {
            id_valoracion: this._data.id_valoracion,
            comentario_valoracion: this._data.comentario_valoracion,
            calificacion: this._data.calificacion,
            fecha_valoracion: this._data.fecha_valoracion,
            estado_valoracion: this._data.estado_valoracion,
            deleted_at_valoracion: this._data.deleted_at_valoracion,
        };
    }

    static fromDB(data){
        return new RatingModel(data);
    }
    
}