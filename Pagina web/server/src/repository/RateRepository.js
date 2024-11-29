import { BaseRepository } from '../core/BaseRepository.js';
import { RateModel } from '../models/RateModel.js'


class RateRepository extends BaseRepository{
    constructor(){
        super('tarifa')
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
        return updatedRate ? RateModel.fromDB(updatedTrip) : null
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

}

export default RateRepository;