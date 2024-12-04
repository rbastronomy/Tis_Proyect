import { BaseRepository } from "../core/BaseRepository";
import { BoletaModel } from "../models/BoletaModel";
import { ReservaModel } from "../models/ReservaModel";

export class BoletaRepository extends BaseRepository {
    constructor() {
      super('boleta', BoletaModel, 'codigoboleta');
    }

    async findById(codigoboleta){
      try {
        const result = await this.db(this.tableName)
          .where('codigoboleta', codigoboleta)
          .first();
        return BoletaModel.fromDB(result);
      } catch (error) {
        throw new error('Error buscando boleta por ID: ${error.message}');
      }
    }

    async createBoleta(boleta){
      try {
        const [created] = await this.db(this.tableName)
          .insert(boleta)
          .returning('*');
        return created;
      } catch (error) {
        throw new error('Error creando boleta: ${error.message}');
      }
    }

    async updateBoleta(codigoboleta, boleta){
      try {
        const [updated] = await this.db(this.tableName)
          .where('codigoboleta', codigoboleta)
          .update(boleta)
          .returning('*');
        return updated;
      } catch (error) {
        throw new error('Error actualizando boleta: ${error.message}');
      }
    }

    async findByViaje(codigo){
      try{
        const resut = await this.db(this.tableName)
          .where('codigo', codigo)
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

    async findWithDetails(codigoboleta){
      try {
        const resut = await this.db(this.tableName)
          .select( 'boleta.*',
            'viaje.duracionv',
            'viaje.fechav',
            'reserva.origenv',
            'reserva.destinov')
          .leftJoin('viaje', 'boleta.codigo','viaje.codigo')
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