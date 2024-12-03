import { BaseRepository } from "../core/BaseRepository";
import { BoletaModel } from "../models/BoletaModel";
import { ReservaModel } from "../models/ReservaModel";

export class BoletaRepository extends BaseRepository {
    constructor() {
      super('boleta', BoletaModel, 'codigoboleta');
    }

    async findByViaje(codigoviaje){
      try{
        const resut = await this.db(this.tableName)
          .where('codigoviaje', codigoviaje)
          .first();
        return BoletaModel.fromDB(resut);
      } catch (error){
        throw new error('Error buscando boleta por viaje: ${error.message}');
      }
    }

    async findByReserva(codigoreserva){
      try {
        const resut = await this.db(this.tableName)
          .where('codigoreserva', codigoreserva)
          .first();
        return BoletaModel.fromDB(resut);
      } catch (error) {
        throw new error('Error buscando boleta por reserva: ${error.message}');
      }
    }

    async findWithDetails(codigoreserva){
      try {
        const resut = await this.db(this.tableName)
          .select( 'boleta.*',
            'viaje.duracionv',
            'viaje.fechav',
            'reserva.origenv',
            'reserva.destinov')
          .leftJoin('viaje', 'boleta.codigoviaje','viaje.codigoviaje')
          .leftJoin('reserva', 'boleta.codigoreserva', 'reserva.codigoreserva')
          .where('boleta.codigoboleta', codigoboleta)  
          .first();

        return BoletaModel.fromDB(resut);
      } catch (error) {
        throw new error('Error buscando boleta con detalles: ${error.message}');
      }
    }

    async findByStatus(status) {
      const results = await this.db(this.tableName)
        .select('*')
        .where('estadob', status)
        .whereNull('deletedatbo');
  
      return results.map(result => new this.modelClass(result));
    }

    

}  