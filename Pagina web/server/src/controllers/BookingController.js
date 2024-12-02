import { BaseController } from "../core/BaseController";
import { BookingService } from "../services/BookingService";

class BookingController extends BaseController {
    constructor() {
        const bookingService = new BookingService();
        super(bookingService);
    }

    async createBooking(request, reply) {
        try {
            const bookingData = request.body;
            const createdBooking = await this.service.createBooking(bookingData);
            return reply.send({ booking: createdBooking.toJSON() });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to create booking' });
        }
    }

    async cancelBooking(request, reply) {
        try {
            const { codigoreserva } = request.params;
            const canceledBooking = await this.service.cancelarBooking(codigoreserva);
            return reply.send({ booking: canceledBooking.toJSON() });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to cancel booking' });
        }
    }

    async assignTaxiToBooking(request, reply) {
        try {
            const { codigoreserva } = request.params;
            const { rut } = request.body;
            const updatedBooking = await this.service.asignarTaxiAReserva(codigoreserva, rut);
            return reply.send({ booking: updatedBooking.toJSON() });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to assign taxi to booking' });
        }
    }

    async getReservasPendientes(request, reply) {
        try {
            const reservas = await this.service.findReservasPendientes();
            return reply.send({ reservas });
        } catch (error) {
            request.log.error(error);
            return reply.status(500).send({ error: 'Failed to get pending bookings' });
        }
    }

}
