export class TripModel{
    constructor({
        codigo,
        origenv,
        destinov,
        duracion,
        pasajeros,
        observacion,
        estadov,
        deletedatvj,
    }){
        this.codigo = codigo;
        this.origenv = origenv;
        this.destinov = destinov;
        this.duracion = duracion;
        this.pasajeros = pasajeros;
        this.observacion = observacion;
        this.estadov = estadov;
        this.deletedatvj = deletedatvj;
    }

    //Agregar metodos necesarios para el manejo de la clase
       
    toJSON(){
        return {
            codigo: this.codigo,
            origenv: this.origenv,
            destinov: this.destinov,
            duracion: this.duracion,
            pasajeros: this.pasajeros,
            observacion: this.observacion,
            estadov: this.estadov,
            deletedatvj: this.deletedatvj,
        };
    }

    static fromDB(data){
        return new TripModel(data);
    }

}