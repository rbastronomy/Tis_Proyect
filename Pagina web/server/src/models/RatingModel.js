import { BaseModel } from "../core/BaseModel.js";
import { TripModel } from "./TripModel.js";
import { UserModel } from "./UserModel.js";

export class RatingModel extends BaseModel{

    static ratingData = {
        id_valoracion: null,
        comentario_valoracion: '',
        calificacion: 0,
        fecha_valoracion: null,
        estado_valoracion: 'ACTIVO',
        deleted_at_valoracion: null,
        // Relaciones
        user: null,
        trip: null,
        // Relaciones ternarias
        ratings: []
    }

    constructor(data = {}) {
        const modelData = {
            ...data,
            trip: data.trip instanceof TripModel ? data.trip : null,
            user: data.user instanceof UserModel ? data.user : null
        };

        super(modelData, RatingModel.defaultData);

        // Inicializar modelos si se proporcionan datos crudos
        if (data.trip && !(data.trip instanceof TripModel)) {
            this._data.trip = new TripModel(data.trip);
        }
        if (data.user && !(data.user instanceof UserModel)) {
            this._data.user = new UserModel(data.user);
        }

        // Inicializar detalles de valoración
        this._data.rating_details = Array.isArray(data.rating_details) 
            ? data.rating_details 
            : [];
    }

    get id_valoracion() { return this._data.id_valoracion; }
    get comentario_valoracion() { return this._data.comentario_valoracion; }
    get calificacion() { return this._data.calificacion; }
    get fecha_valoracion() { return this._data.fecha_valoracion; }
    get estado_valoracion() { return this._data.estado_valoracion; }

    // Relaciones
    get trip() { return this._data.trip; }
    get user() { return this._data.user; }
    get rating_details() { return this._data.rating_details; }

    isPositive(){
        return this._data.calificacion >= 4;
    }

    isNegative(){
        return this._data.calificacion <= 2;
    }

    addRatingDetail(detail) {
        this._data.rating_details.push({
            ...detail,
            fecha_detalle: new Date()
        });
        return this._data.rating_details[this._data.rating_details.length - 1];
    }

    getQualitativeRating(){
        if(this._data.calificacion >=5) return 'EXCELENTE';
        if(this._data.calificacion <=4) return 'BUENO';
        if(this._data.calificacion <=3) return 'REGULAR';
        return 'NEUTRO';
    }

    toJSON() {
        const json = {
            id_valoracion: this._data.id_valoracion,
            comentario_valoracion: this._data.comentario_valoracion,
            calificacion: this._data.calificacion,
            fecha_valoracion: this._data.fecha_valoracion,
            estado_valoracion: this._data.estado_valoracion,
            rating_details: this._data.rating_details
        };

        // Incluir relaciones si existen
        if (this._data.trip) json.trip = this._data.trip.toJSON();
        if (this._data.user) json.user = this._data.user.toJSON();

        return json;
    }

    static fromDB(data) {
        if (!data) return null;
        return new RatingModel(data);
    }
    
}