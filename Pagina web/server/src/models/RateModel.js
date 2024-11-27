//tarifa

export class RateModel{
    constructor({
        id,
        descripciont,
        precio,
        tipo,
        fcreada,
        estadot,
        deleteatt
    }){
        this.id = id;
        this.descripciont = descripciont;
        this.precio = precio;
        this.tipo = tipo;
        this.fcreada = fcreada;
        this.estadot = estadot;
        this.deleteatt = deleteatt;
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            id: this.id,
            descripciont: this.descripciont,
            precio: this.precio,
            tipo: this.tipo,
            fcreada: this.fcreada,
            estadot: this.estadot,
            deleteatt: this.deleteatt,
        };
    }

    static fromDB(data){
        return new RateModel(data);
    }

}