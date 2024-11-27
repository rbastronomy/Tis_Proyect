export class BookingModel{
    constructor({
        codigoreserva,
        origenv,
        destinov,
        freserva,
        frealizado,
        tipo,
        observacion,
        estados,
        deletedatre
    }){
        this.codigoreserva = codigoreserva;
        this.origenv = origenv;
        this.destinov = destinov;
        this.freserva = freserva;
        this.frealizado = frealizado;
        this.tipo = tipo;
        this.observacion = observacion;
        this.estados = estados;
        this.deletedatre = deletedatre;
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            codigoreserva: this.codigoreserva,
            origenv: this.origenv,
            destinov: this.destinov,
            freserva: this.freserva,
            frealizado: this.frealizado,
            tipo: this.tipo,
            observacion: this.observacion,
            estados: this.estados,
            deletedatre: this.deletedatre,
        };
    }

    static fromDB(data){
        return new BookingModel(data);
    }
}