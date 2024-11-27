import { BaseRepository } from '../core/BaseRepository.js';
import { ServiceModel } from '../models/ServiceModel.js';

class ServiceRepository extends BaseRepository{
    constructor(knex){
        super(knex, 'servicio')
    }

    async create(serviceData){
        const[createdService] = await this.knex(this.tableName)
            .insert(serviceData)
            .returning('*');
        return ServiceModel.fromDB(createdService)
    }

    async update(codigos, updateData){
        const[updatedService] = await this.knex(this.tableName)
            .where({codigos})
            .update(updateData)
            .returning('*');
        return updatedService ? ServiceModel.fromDB(updateData) : null
    }
}