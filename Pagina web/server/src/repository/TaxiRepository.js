import { BaseRepository } from '../core/BaseRepository.js';
import { TaxiModel } from '../models/TaxiModel.js';

class TaxiRepository extends BaseRepository{
  constructor(knex){
    super(knex, 'taxi')
  }

  async create(taxiData){
    const[createdTaxi] = await this.knex(this.table)
      .insert(taxiData)
      .returning('*');
    return TaxiModel.fromDB(createdTaxi)
  }

  async update(patente, updateData){
    const[updatedTaxi] = await this.knex(this.table)
      .where({patente})
      .update(updateData)
      .returning('*');
    return updatedTaxi ? TaxiModel.fromDB(updatedTaxi) : null

  }
}

module.exports = TaxiRepository