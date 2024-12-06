import { BaseRepository } from "../core/BaseRepository.js";
import { BookingModel } from "../models/BookingModel.js";

export class BookingRepository extends BaseRepository {
    constructor() {
        super("reserva");
    }
    
    async create(bookingData) {
        try {
        const [createdBooking] = await this.db(this.tableName)
            .insert(bookingData)
            .returning("*");
        return BookingModel.fromDB(createdBooking);
        } catch (error) {
        throw new Error(`Error creating booking: ${error.message}`);
        }
    }
    
    async update(codigoreserva, updateData) {
        try {
        const [updatedBooking] = await this.db(this.tableName)
            .where({ codigoreserva })
            .update(updateData)
            .returning("*");
        return updatedBooking ? BookingModel.fromDB(updateData) : null;
        } catch (error) {
        throw new Error(`Error updating data: ${error.message}`);
        }
    }
    
    async softDelete(codigoreserva) {
        try {
        const [deletedBooking] = await this.db(this.tableName)
            .where({ codigoreserva })
            .update({
            estado: "eliminado",
            deleted_at: new Date(),
            })
            .returning("*");
        return deletedBooking ? BookingModel.fromDB(deletedBooking) : null;
        } catch (error) {
        throw new Error(`Error softdeleting data: ${error.message}`);
        }
    }

    async findReservasPending() {
        try {
        const reservas = await this.db(this.tableName)
            .where({ estado: "pendiente" })
            .select("*");
        return reservas.map((reserva) => BookingModel.fromDB(reserva));
        } catch (error) {
        throw new Error(`Error getting data: ${error.message}`);
        }
    }

    async findByEstado(estado) {
        try {
        const reservas = await this.db(this.tableName)
            .where({ estado })
            .select("*");
        return reservas.map((reserva) => BookingModel.fromDB(reserva));
        } catch (error) {
        throw new Error(`Error getting data: ${error.message}`);
        }
    }

    async findAll() {
        try {
        const reservas = await this.db(this.tableName).select("*");
        return reservas.map((reserva) => BookingModel.fromDB(reserva));
        } catch (error) {
        throw new Error(`Error getting data: ${error.message}`);
        }
    }
    
}

export default BookingRepository;
