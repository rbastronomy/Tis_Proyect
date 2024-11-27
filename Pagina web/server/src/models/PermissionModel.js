export class PermissionModel{
    constructor({
        idpermiso,
        nombrepermiso,
        descripcionpermiso,
        fechacreacion,
        estadop,
        deleteatp,
    }){
        this.idpermiso = idpermiso;
        this.nombrepermiso = nombrepermiso;
        this.descripcionpermiso = descripcionpermiso;
        this.fechacreacion = fechacreacion;
        this.estadop = estadop;
        this.deleteatp = deleteatp;
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            idpermiso: this.idpermiso,
            nombrepermiso: this.nombrepermiso,
            descripcionpermiso: this.descripcionpermiso,
            fechacreacion: this.fechacreacion,
            estadop: this.estadop,
            deleteatp: this.deleteatp,
        };
    }

    static fromDB(data){
        return new PermissionModel(data);
    }
}