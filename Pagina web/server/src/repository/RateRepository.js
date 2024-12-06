import { BaseRepository } from '../core/BaseRepository.js';
import { RateModel } from '../models/RateModel.js'


class RateRepository extends BaseRepository{
    constructor(){
        super('tarifa', RateModel, 'id_tarifa');
    }

    async create(RateData){
        try {
            const[createdRate] = await this.db(this.table)
                .insert(RateData)
                .returning('*');
            return RateModel.fromDB(createdRate)
        } catch (error) {
            throw new Error(`Error creating rate: ${error.message}`);   
        }
    }

    async update(id, updateData){
        try {
            const[updatedRate] = await this.db(this.table)
            .where({id})
            .update(updateData)
            .returning('*');
        return updatedRate ? RateModel.fromDB(updatedRate) : null
        } catch (error) {
            throw new Error(`Error updating rate: ${error.message}`);    
        }
    }

    async softDelete(id){
        try {
            const[deletedRate] = await this.db(this.table)
                .where({id})
                .update({
                    estado: 'eliminado',
                    deleted_at: new Date()
                })
                .returning('*');
            return deletedRate ? RateModel.fromDB(deletedRate) : null
        } catch (error) {
            throw new Error(`Error softdeleting data: ${error.message}`);    
        }
    }

    
  /**
   * Finds active tariffs
   * @returns {Promise<Array>} List of active tariffs
   */
  async findActive() {
    const results = await this.db(this.tableName)
      .where('estadot', 'ACTIVO')
      .whereNull('deletedatt')
      .select('*');
    return results.map(result => this._toModel(result));
  }

  /**
   * Finds tariffs by ride type (CITY or AIRPORT)
   * @param {string} rideType - Type of ride
   * @returns {Promise<Array>} List of tariffs for the specified ride type
   */
  async findByRideType(rideType) {
    const query = this.db(this.tableName)
      .select(
        'tarifa.*',
        'servicio_tarifa.servicio_id'
      )
      .join('servicio_tarifa', 'tarifa.id', 'servicio_tarifa.tarifa_id')
      .where('tarifa.estadot', 'ACTIVO')
      .whereNull('tarifa.deletedatt');

    if (rideType === 'CITY') {
      query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
    } else {
      query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
    }

    const results = await query;
    return results.map(result => this._toModel(result));
  }

  /**
   * Finds active tariffs for a specific service
   * @param {number} servicioId - Service ID
   * @returns {Promise<Array>} List of active tariffs for the service
   */
  async findActiveByService(servicioId) {
    const results = await this.db(this.tableName)
      .select('tarifa.*')
      .join('servicio_tarifa', 'tarifa.id_tarifa', 'servicio_tarifa.tarifa_id')
      .where({
        'servicio_tarifa.servicio_id': servicioId,
        'tarifa.estadot': 'ACTIVO'
      })
      .whereNull('tarifa.deletedatt');

    return results.map(result => this._toModel(result));
  }

  /**
   * Finds tariffs for a service filtered by ride type
   * @param {number} servicioId - Service ID
   * @param {string} rideType - Type of ride
   * @returns {Promise<Array>} List of filtered tariffs
   */
  async findByServiceAndType(servicioId, rideType) {
    const query = this.db(this.tableName)
      .select('tarifa.*')
      .join('servicio_tarifa', 'tarifa.id_tarifa', 'servicio_tarifa.tarifa_id')
      .where({
        'servicio_tarifa.servicio_id': servicioId,
        'tarifa.estadot': 'ACTIVO'
      })
      .whereNull('tarifa.deletedatt');

    if (rideType === 'CITY') {
      query.where('tarifa.tipo', 'TRASLADO_CIUDAD');
    } else {
      query.whereNot('tarifa.tipo', 'TRASLADO_CIUDAD');
    }

    const results = await query;
    return results.map(result => this._toModel(result));
  }

  /**
   * Finds tariff by type
   * @param {string} tipo - Tariff type
   * @returns {Promise<Object>} Found tariff
   */
  async findByTipo(tipo) {
    const result = await this.db(this.tableName)
      .where({ tipo, estadot: 'ACTIVO' })
      .whereNull('deletedatt')
      .first();
    return result ? this._toModel(result) : null;
  }

}

export default RateRepository;