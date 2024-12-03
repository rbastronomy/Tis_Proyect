import { BaseModel } from "../core/BaseModel";

export class BoletaModel extends BaseModel {
    static boletaData = {
        codigoboleta: null,
        codigoviaje: null,
        coidgoreserva: null,
        total: 0,
        femision: new Date(),
        metodopago: "",
        descripciont: "",
        estadob: "ACTIVO",
        deletedatbo: null,
        viaje_info: null,
        reserva_info: null
    };

    constructor(data = {}) {
        super(data, BoletaModel.boletaData);
    }

    get codigoboleta() { return this._data.codigoboleta; }
    get total() { return this._data.total; }
    get femision() { return this._data.femision; }
    get metodopago() { return this._data.metodopago; }
    get descripciont() { return this._data.descripciont; }
    get estadob() { return this._data.estadob; }
    get deletedatbo() { return this._data.deletedatbo; }

    isDeleted(){
        return this._data.deletedatbo !== null;
    }

    itsFullyPaid(){
        return this._data.estadob ==='PAGADO'; 
    }

    associateViaje (viajeModel){
        this._data.codigoviaje = viajeModel.codigoviaje;
        this._data.viaje_info = {
            duracion: viajeModel.duracionv,
            observacion: viajeModel.observacionv,
            fecha: viajeModel.fechav
        };
    }

    associateReserva (reservaModel){
        this._data.codigoreserva = reservaModel.codigoreserva;
        this._data.reserva_info = {
            origen: reservaModel.origenv,
            destino: reservaModel.destinov,
            freserva: reservaModel.freserva,
            tipo: reservaModel.tipo,
            observacion: reservaModel.observacion
        };
    }

    generateRelationship(){
        return {
            codigoboleta: this._data.codigoboleta,
            codigo: this._data.codigoviaje,
            codigoreserva: this._data.codigoreserva,
            fechagenerada: new Date()
        };
    }
    
    toJSON(){
        return {
            codigoboleta: this._data.codigoboleta,
            codigoviaje: this._data.codigoviaje,
            coidgoreserva: this._data.coidgoreserva,
            total: this._data.total,
            femision: this._data.femision,
            metodopago: this._data.metodopago,
            descripciont: this._data.descripciont,
            estadob: this._data.estadob,
            deletedatbo: this._data.deletedatbo,
            viaje: this._data.viaje_info,
            reserva: this._data.reserva_info
        };
    }

    static fromDB(data) {
        return new BoletaModel(data);
    }
}