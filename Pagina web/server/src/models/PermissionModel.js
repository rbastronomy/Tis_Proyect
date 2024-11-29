export class PermissionModel {
    constructor({
        idpermiso = null,
        nombrepermiso = '',
        descripcionpermiso = '',
        fechacreacion = new Date(),
        estadop = 'ACTIVO',
        deleteatp = null
    } = {}) {
        this.idpermiso = idpermiso;
        this.nombrepermiso = nombrepermiso;
        this.descripcionpermiso = descripcionpermiso;
        this.fechacreacion = fechacreacion;
        this.estadop = estadop;
        this.deleteatp = deleteatp;
    }

    // Domain methods
    isActive() {
        return this.estadop === 'ACTIVO';
    }

    isDeleted() {
        return this.deleteatp !== null;
    }

    toJSON() {
        return {
            idpermiso: this.idpermiso,
            nombrepermiso: this.nombrepermiso,
            descripcionpermiso: this.descripcionpermiso,
            fechacreacion: this.fechacreacion,
            estadop: this.estadop,
            deleteatp: this.deleteatp,
        };
    }

    static fromDB(data) {
        return new PermissionModel(data);
    }
}