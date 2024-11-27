//factura/boleta


export class InvoiceModel{
    constructor({
        codigoboleta,
        total,
        femision,
        metodopago,
        descripciont,
        estadob,
        deletedatbo
    }){
        this.codigoboleta = codigoboleta;
        this.total = total;
        this.femision = femision;
        this.metodopago = metodopago;
        this.descripciont = descripciont;
        this.estadob = estadob;
        this.deletedatbo = deletedatbo;
    }
    
    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            codigoboleta: this.codigoboleta,
            total: this.total,
            femision: this.femision,
            metodopago: this.metodopago,
            descripciont: this.descripciont,
            estadob: this.estadob,
            deletedatbo: this.deletedatbo,
        };
    }

    static fromDB(data){
        return new InvoiceModel(data);
    }
}

