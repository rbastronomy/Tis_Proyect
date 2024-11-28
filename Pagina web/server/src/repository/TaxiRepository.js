import { BaseRepository } from '../core/BaseRepository.js';
import { TaxiModel } from '../models/TaxiModel.js';

class TaxiRepository extends BaseRepository{
  constructor(){
    super('taxi')
  }

  async create(taxiData){
    try{
      const[createdTaxi] = await this.db(this.table)
        .insert(taxiData)
        .returning('*');
      return TaxiModel.fromDB(createdTaxi)
    } catch (error){
      throw new Error(`Error creating taxi: ${error.message}`);
    }
  }

  async update(patente, updateData){
    try {
      const[updatedTaxi] = await this.db(this.table)
        .where({patente})
        .update(updateData)
        .returning('*');
      return updatedTaxi ? TaxiModel.fromDB(updatedTaxi) : null
    } catch (error) {
      throw new Error(`Error updating taxi: ${error.message}`);    
    }
  }

  async softDelete(patente){
    try {
      const[deletedTaxi] = await this.db(this.table)
        .where({patente})
        .update({
          estadotx: 'eliminado',
          deleted_at: new Date()
        })
        .returning('*');
      return deletedTaxi ? TaxiModel.fromDB(deletedTaxi) : null
    } catch (error) {
      throw new Error(`Error softdeleting data: ${error.message}`);     
    }
  }
}

export default TaxiRepository;