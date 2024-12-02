import { BaseService } from "../core/BaseService";
import BookingRepository from "../repository/BookingRepository";
import { PersonaService } from "./PersonaPersonaService";
import { TaxiService } from "./TaxiRPersonaService";
import { BookingModel } from "../models/BookingModel";

export class BookingService extends BaseService {
    constructor(){
        const bookingRepository = new BookingRepository();
        super(bookingRepository);
        this.personaService = new PersonaService();
        this.taxiService = new TaxiService();
    }

    async createBooking(bookingData){

        this.validarDatosBooking(bookingData);

        const trx = await this.repository.transaction();

        try {
            //Crear entrada en historial y agregar el id del historial a la reserva
            const historial = await this.crearEntradaHistorial(trx, 'creada');
            reservaData.historial = historial.codigoreserva;
            reservaData.estados = 'pendiente';
            
            const createdBooking = await this.repository.create(bookingData);
            await trx.commit();
            return createdBooking;
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    async assignTaxiToBooking(codigoreserva, taxiRut) {
        // Verificar disponibilidad del taxi
        const taxi = await this.taxiService.findByRut(taxiRut);
        if (!taxi || taxi.estado !== 'disponible') {
          throw new Error('Taxi no disponible');
        }
    
        // Actualizar estado de la reserva
        const reservaActualizada = await this.repository.updateReservaEstado(
          codigoreserva, 
          'asignada'
        );
    
        // Actualizar estado del taxi
        await this.taxiService.updateEstado(taxiRut, 'ocupado');
    
        return reservaActualizada;
    }

    async cancelBooking(codigoreserva) {

        const booking = await this.repository.findByCodigoReserva(codigoreserva);
        
        if (!booking) {
          throw new Error('Reserva no encontrada');
        }
        // Actualizar estado de la reserva
        const bookingCanceled = await this.repository.updateReservaEstado(
          codigoreserva, 
          'cancelada'
        );

        if (booking.taxi_rut){
            // Actualizar estado del taxi
            await this.taxiService.updateEstado(booking.taxi_rut, 'disponible');
        }
    
        // Actualizar estado del taxi
        const reserva = await this.repository.findByCodigoReserva(codigoreserva);
        await this.taxiService.updateEstado(reserva.taxiRut, 'disponible');
    
        return reservaActualizada;
    }

    async obtenerReservasPendientes(){
        return this.repository.findReservasPending();
    }

    validarDatosBooking(datos){

        if (!datos.origenv || !datos.destinov){
            throw new Error('Origen y destino son obligatorios');
        }
        if (!datos.freserva){
            throw new Error('Fecha de reserva es obligatoria');
        }
        if (!datos.tipo){
            throw new Error('Tipo de reserva es obligatorio');
        }

        const fechaReserva = new Date(datos.freserva);
        const fechaActual = new Date();

        if(fechaReserva < fechaActual){
            throw new Error('Fecha de reserva no puede ser en el pasado');
        }  
    }

    async crearEntradaHistorial(trx, estado){
        const [historial] = await trx('historial')
        .insert({
            fcambio: new Date(),
            estadoh: estado
        })
        .retuning('*');
        return historial;
    }

}