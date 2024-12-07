import { BaseModel } from '../core/BaseModel.js';

export class PermissionModel extends BaseModel {
    static defaultData = {
        id_permiso: null,
        nombre_permiso: '',
        descripcion_permiso: '',
        fecha_creacion: new Date(),
        deleted_at_permiso: null
    };

    constructor(data = {}) {
        super(data, PermissionModel.defaultData);
    }

    // Getters for common properties
    get id_permiso() { return this._data.id_permiso; }
    get nombre_permiso() { return this._data.nombre_permiso; }
    get descripcion_permiso() { return this._data.descripcion_permiso; }
    get fecha_creacion() { return this._data.fecha_creacion; }
    get deleted_at_permiso() { return this._data.deleted_at_permiso; }

    // Domain methods
    isDeleted() {
        return this._data.deleted_at_permiso !== null;
    }

    toJSON() {
        return {
            idpermiso: this._data.idpermiso,
            nombre_permiso: this._data.nombre_permiso,
            descripcion_permiso: this._data.descripcion_permiso,
            fecha_creacion: this._data.fecha_creacion,
            deleted_at_permiso: this._data.deleted_at_permiso,
        };
    }
}