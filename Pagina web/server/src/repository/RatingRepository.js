import { BaseRepository } from "../core/BaseRepository.js";
import { RatingModel } from "../models/RatingModel.js";

export class RatingRepository extends BaseRepository{
    constructor(){
        super('valoracion', 'id_valoracion');
    }

    async create(ratingData){
        try {
            const [created] = await this.db(this.tableName)
                .insert(ratingData)
                .returning('*');
            return RatingModel.fromDB(created);
        } catch (error) {
            throw new Error(`Error creating rating: ${error.message}`);
        }
    }

    async update(id_valoracion, updateData){
        try {
            const [updated] = await this.db(this.tableName)
                .where('id_valoracion', id_valoracion)
                .update(updateData)
                .returning('*');
            return updated ? RatingModel.fromDB(updated) : null;
        } catch (error) {
            throw new Error(`Error updating rating: ${error.message}`);
        }
    }

    async softDelete(id_valoracion){
        try {
            const [deletedRating] = await this.db(this.tableName)
                .where('id_valoracion', id_valoracion)
                .update({
                    estado_valoracion: 'ELIMINADO',
                    deleted_at_valoracion: new Date()
                })
                .returning('*');
            return deletedRating ? RatingModel.fromDB(deletedRating) : null;
        } catch (error) {
            throw new Error(`Error soft deleting rating: ${error.message}`);
        }
    }

    async findAll() {
        try {
          const ratings = await this.db(this.tableName)
            .select("*")
            .whereNull("deleted_at_valoracion");
          return ratings.map((rating) => RatingModel.fromDB(rating));
        } catch (error) {
          throw new Error(`Error getting all ratings: ${error.message}`);
        }
    }

    async findByTrip(codigo_viaje) {
        try {
            const ratings = await this.db(this.tableName)
                .select('*')
                .where('codigo_viaje', codigo_viaje)
                .whereNull('deleted_at_valoracion');
            return ratings.map((rating) => RatingModel.fromDB(rating));
        } catch (error) {
            throw new Error(`Error getting ratings for trip: ${error.message}`);
        }
    }
}