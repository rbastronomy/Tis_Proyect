import { BaseRepository } from '../core/BaseRepository.js';
import { RateModel } from '../models/RateModel.js'


class RateRepository extends BaseRepository{
    constructor(knex){
        super(knex, 'tarifa')
    }

    async create(RateData){
        const[createdRate] = await this.kenx(this.table)
            .insert(RateData)
            .returning('*');
        return RateModel.fromDB(createdRate)
    }

    async update(id, updateData){
        const[updatedRate] = await this.knex(this.table)
            .where({id})
            .update(updateData)
            .returning('*');
        return updatedRate ? RateModel.fromDB(updatedTrip) : null
    }

}

module.export = RateRepository