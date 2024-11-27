export class ServiceModel{
    constructor({
        codigos,
        descripciont,
        estados,
        deleteats,
    }){
        this.codigos = codigos;
        this.descripciont = descripciont;
        this.estados = estados;
        this.deleteats = deleteats;
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            codigos: this.codigos,
            descripciont: this.descripciont,
            estados: this.estados,
            deleteats: this.deleteats,
        };
    }

    static fromDB(data){
        return new ServiceModel(data);
    }
}