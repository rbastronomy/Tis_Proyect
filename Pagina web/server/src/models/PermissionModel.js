import { BaseModel } from '../core/BaseModel.js';

export class PermissionModel extends BaseModel {
    static defaultData = {
        id_permisos: null,
        nombre_permiso: '',
        descripcion_permiso: '',
        fecha_creacion: new Date(),
        //deleteatp: null
    };

    constructor(data = {}) {
        super(data, PermissionModel.defaultData);
    }

    // Getters for common properties
    get id_permisos() { return this._data.id_permisos; }
    get nombre_permiso() { return this._data.nombre_permiso; }
    get descripcion_permiso() { return this._data.descripcion_permiso; }
    get fecha_creacion() { return this._data.fecha_creacion; }
    //get deleteatp() { return this._data.deleteatp; }

    // Domain methods
    isDeleted() {
        return this._data.deleteatp !== null;
    }

    toJSON() {
        return {
            id_permisos: this._data.id_permisos,
            nombre_permiso: this._data.nombre_permiso,
            descripcion_permiso: this._data.descripcion_permiso,
            fecha_creacion: this._data.fechacrefecha_creacionacion,
            //deleteatp: this._data.deleteatp,
        };
    }
    static fromDB(data) {
        if (!data) return null;
        return new PermissionModel(data);
      }
}