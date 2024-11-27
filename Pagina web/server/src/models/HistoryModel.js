export class HistoryModel{
    constructor({
        idhistorial,
        fcambio,
        estadoh
    }){
        this.idhistorial = idhistorial;
        this.fcambio = fcambio;
        this.estadoh = estadoh;
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            idhistorial: this.idhistorial,
            fcambio: this.fcambio,
            estadoh: this.estadoh,
        };
    }

    static fromDB(data){
        return new HistoryModel(data);
    }
}