export class RatingModel{
    constructor({
        idvaloracion,
        comentario,
        calificacion,
        fvaloracion,
        estadov,
        deletedatvj
    }){
        this.idvaloracion = idvaloracion;
        this.comentario = comentario;
        this.calificacion = calificacion;
        this.fvaloracion = fvaloracion;
        this.estadov = estadov;
        this.deletedatvj = deletedatvj;
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            idvaloracion: this.idvaloracion,
            comentario: this.comentario,
            calificacion: this.calificacion,
            fvaloracion: this.fvaloracion,
            estadov: this.estadov,
            deletedatvj: this.deletedatvj,
        };
    }

    static fromDB(data){
        return new RatingModel(data);
    }
    
}