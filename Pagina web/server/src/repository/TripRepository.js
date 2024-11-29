import { BaseRepository } from '../core/BaseRepository.js';
import { TripModel } from '../models/TripModel.js';


class TripRepository extends BaseRepository{
    constructor(){
        super('viaje')
    }

    async create(tripData){
        try{
            const[createdTrip] = await this.db(this.table)
                .insert(tripData)
                .returning('*');
            return TripModel.db(createdTrip);
        } catch (error){
            throw new Error(`Error creating trip: ${error.message}`);
        }        
    }

    async update(codigo, updateData){
        try {
            const[updatedTrip] = await this.db(this.table)
                .where({codigo})
                .update(updateData)
                .returning('*');
            return updatedTrip ? TripModel.db(updatedTrip) : null
        } catch (error) {
            throw new Error(`Error updating data: ${error.message}`);           
        }  
    }

    async softDelete(codigo){
        try {
            const[deletedTrip] = await this.db(this.table)
                .where({codigo})
                .update({
                    estadov: 'eliminado',
                    deletedatvj: new Date()
                })
                .returning('*');
            return deletedTrip ? TripModel.db(deletedTrip) : null
        } catch (error) {
            throw new Error(`Error softdeleting data: ${error.message}`);          
        }  
    }
}

export default TripRepository;