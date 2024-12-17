import { BaseRepository } from "../core/BaseRepository.js";
import { RatingModel } from "../models/RatingModel.js";

export class RatingRepository extends BaseRepository {
    constructor() {
        super('valoracion', 'id_valoracion');
    }

    async create(ratingData) {
        try {
            const trx = await this.db.transaction();

            try {
                // First create the rating
                const [rating] = await this.db('valoracion')
                    .insert({
                        comentario_valoracion: ratingData.comentario_valoracion,
                        calificacion: ratingData.calificacion,
                        fecha_valoracion: ratingData.fecha_valoracion,
                        estado_valoracion: ratingData.estado_valoracion
                    })
                    .returning('*')
                    .transacting(trx);

                // Then create the relationship in the valora table
                await this.db('valora')
                    .insert({
                        rut_persona: ratingData.rut_usuario,
                        codigo_viaje: ratingData.codigo_viaje,
                        id_valoracion: rating.id_valoracion,
                        fecha_valoracion: ratingData.fecha_valoracion
                    })
                    .transacting(trx);

                await trx.commit();
                return RatingModel.toModel(rating);
            } catch (error) {
                await trx.rollback();
                throw error;
            }
        } catch (error) {
            throw new Error(`Error creating rating: ${error.message}`);
        }
    }

    async findByTrip(codigo_viaje) {
        try {
            const ratings = await this.db('valoracion as v')
                .join('valora as va', 'v.id_valoracion', 'va.id_valoracion')
                .where('va.codigo_viaje', codigo_viaje)
                .whereNull('v.deleted_at_valoracion')
                .select('v.*', 'va.rut_persona', 'va.codigo_viaje');
            return ratings.map((rating) => RatingModel.toModel(rating));
        } catch (error) {
            throw new Error(`Error getting ratings for trip: ${error.message}`);
        }
    }

    async findByUser(rut) {
        try {
            const ratings = await this.db('valoracion as v')
                .join('valora as va', 'v.id_valoracion', 'va.id_valoracion')
                .where('va.rut_persona', rut)
                .whereNull('v.deleted_at_valoracion')
                .select('v.*', 'va.rut_persona', 'va.codigo_viaje');
            return ratings.map((rating) => RatingModel.toModel(rating));
        } catch (error) {
            throw new Error(`Error getting ratings for user: ${error.message}`);
        }
    }

    async findById(id_valoracion) {
        try {
            const rating = await this.db('valoracion as v')
                .join('valora as va', 'v.id_valoracion', 'va.id_valoracion')
                .where('v.id_valoracion', id_valoracion)
                .whereNull('v.deleted_at_valoracion')
                .select('v.*', 'va.rut_persona', 'va.codigo_viaje')
                .first();
            return rating ? RatingModel.toModel(rating) : null;
        } catch (error) {
            throw new Error(`Error getting rating by id: ${error.message}`);
        }
    }

    async update(id_valoracion, updateData) {
        try {
            const [updated] = await this.db(this.tableName)
                .where('id_valoracion', id_valoracion)
                .update({
                    comentario_valoracion: updateData.comentario_valoracion,
                    calificacion: updateData.calificacion,
                    estado_valoracion: updateData.estado_valoracion
                })
                .returning('*');
            return updated ? RatingModel.toModel(updated) : null;
        } catch (error) {
            throw new Error(`Error updating rating: ${error.message}`);
        }
    }

    async softDelete(id_valoracion) {
        try {
            const [deletedRating] = await this.db(this.tableName)
                .where('id_valoracion', id_valoracion)
                .update({
                    estado_valoracion: 'ELIMINADO',
                    deleted_at_valoracion: new Date()
                })
                .returning('*');
            return deletedRating ? RatingModel.toModel(deletedRating) : null;
        } catch (error) {
            throw new Error(`Error soft deleting rating: ${error.message}`);
        }
    }

    async findTripCompleted(codigo_viaje) {
        try {
            const ratings = await this.db('valoracion as v')
                .join('valora as va', 'v.id_valoracion', 'va.id_valoracion')
                .join('viaje as vj', 'va.codigo_viaje', 'vj.codigo_viaje')
                .where('va.codigo_viaje', codigo_viaje)
                .where('vj.estado_viaje', 'COMPLETADO')
                .whereNull('v.deleted_at_valoracion')
                .select('v.*', 'va.rut_persona', 'va.codigo_viaje');
            return ratings.map((rating) => RatingModel.toModel(rating));
        } catch (error) {
            throw new Error(`Error getting ratings for completed trip: ${error.message}`);
        }
    }
}