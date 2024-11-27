import { BaseRepository } from '../core/BaseRepository.js';
import { TripModel } from '../models/TripModel.js'


class TripRepository extends BaseRepository{
    constructor(knex){
        super(knex, 'viaje')
    }

    async create(tripData){
        const[createdTrip] = await this.kenx(this.table)
            .insert(tripData)
            .returning('*');
        return TripModel.fromDB(createdTrip)
    }

    async update(codigo, updateData){
        const[updatedTrip] = await this.knex(this.table)
            .where({codigo})
            .update(updateData)
            .returning('*');
        return updatedTrip ? TripModel.fromDB(updatedTrip) : null
    }

}

module.export = TripRepository