import { BaseRepository } from '../core/BaseRepository.js';
import { ServiceModel } from '../models/ServiceModel.js';

class ServiceRepository extends BaseRepository{
    constructor(){
        super('servicio')
    }
    
    async create(serviceData){
        try {
            const[createdService] = await this.db(this.tableName)
                .insert(serviceData)
                .returning('*');
            return ServiceModel.fromDB(createdService)
        } catch (error) {
            throw new Error(`Error creating services: ${error.message}`);
        }
    }

    async update(codigos, updateData){
        try {
            const[updatedService] = await this.db(this.tableName)
                .where({codigos})
                .update(updateData)
                .returning('*');
            return updatedService ? ServiceModel.fromDB(updateData) : null
        } catch (error) {
            throw new Error(`Error updating data: ${error.message}`);          
        }
    }

    async softDelete(codigos){
        try {
            const[deletedService] = await this.db(this.tableName)
                .where({codigos})
                .update({
                    estado: 'eliminado',
                    deleted_at: new Date()
                })
                .returning('*');
            return deletedService ? ServiceModel.fromDB(deletedService) : null
        } catch (error) {
            throw new Error(`Error softdeleting data: ${error.message}`);          
        }
    }
}

export default ServiceRepository;