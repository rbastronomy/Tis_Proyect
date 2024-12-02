import { BaseModel } from "../core/BaseModel";

export class BookingModel extends BaseModel{
    static bookingData = {
        codigoreserva: null,
        idhistorial: null,
        origenv: '',
        destinov: '',
        freserva: null,
        frealizado: null,
        tipo: '',
        observacion: '',
        estados: 'ACTIVO',
        deletedatre: null,
        historial: null
    }

    
    constructor(data = {}){
        super(data, BookingModel.bookingData);
    }

    get codigoreserva() { return this._data.codigoreserva; }
    get origenv() { return this._data.origenv; }
    get destinov() { return this._data.destinov; }
    get freserva() { return this._data.freserva; }
    get estados() { return this._data.estados; }
    get deletedatre() { return this._data.deletedatre; }

    getHistorial(){
        return this._data.historial;
    }

    isPending(){
        return this._data.estados === 'PENDIENTE';
    }

    isConfirmed(){
        return this._data.estados === 'CONFIRMADO';
    }

    //Agregar metodos necesarios para el manejo de la clase

    toJSON(){
        return {
            codigoreserva: this._data.codigoreserva,
            origenv: this._data.origenv,
            destinov: this._data.destinov,
            freserva: this._data.freserva,
            frealizado: this._data.frealizado,
            tipo: this._data.tipo,
            observacion: this._data.observacion,
            estados: this._data.estados,
            deletedatre: this._data.deletedatre,
        };
    }

    static fromDB(data){
        return new BookingModel(data);
    }
}