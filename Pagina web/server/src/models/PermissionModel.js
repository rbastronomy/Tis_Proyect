import { BaseModel } from '../core/BaseModel.js';

export class PermissionModel extends BaseModel {
    static defaultData = {
        idpermiso: null,
        nombrepermiso: '',
        descripcionpermiso: '',
        fechacreacion: new Date(),
        deleteatp: null
    };

    constructor(data = {}) {
        super(data, PermissionModel.defaultData);
    }

    // Getters for common properties
    get idpermiso() { return this._data.idpermiso; }
    get nombrepermiso() { return this._data.nombrepermiso; }
    get descripcionpermiso() { return this._data.descripcionpermiso; }
    get fechacreacion() { return this._data.fechacreacion; }
    get deleteatp() { return this._data.deleteatp; }

    // Domain methods
    isDeleted() {
        return this._data.deleteatp !== null;
    }

    toJSON() {
        return {
            idpermiso: this._data.idpermiso,
            nombrepermiso: this._data.nombrepermiso,
            descripcionpermiso: this._data.descripcionpermiso,
            fechacreacion: this._data.fechacreacion,
            deleteatp: this._data.deleteatp,
        };
    }
}