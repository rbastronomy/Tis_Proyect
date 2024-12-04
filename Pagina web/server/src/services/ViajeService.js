import { ViajeRepository } from '../repositories/ViajeRepository.js';

export class ViajeService extends BaseService {
  constructor() {
    this.viajeRepository = new ViajeRepository();
  }

  async getViajesByDriver(rut) {
    try {
      return await this.viajeRepository.findByDriver(rut);
    } catch (error) {
      console.error('Error getting viajes by driver:', error);
      throw new Error('Failed to retrieve viajes for the driver');
    }
  }

  async getViajesByDateRange(startDate, endDate) {
    try {
      // Validate date range
      if (startDate > endDate) {
        throw new Error('Start date must be before or equal to end date');
      }
      return await this.viajeRepository.findByDateRange(startDate, endDate);
    } catch (error) {
      console.error('Error getting viajes by date range:', error);
      throw new Error('Failed to retrieve viajes for the specified date range');
    }
  }

  /**
   * Get detailed information for a specific viaje
   * @param {number} codigoviaje - Viaje ID
   * @returns {Promise<ViajeModel|null>} Viaje details
   */
  async getViajeDetails(codigo) {
    try {
      const viaje = await this.viajeRepository.findWithDetails(codigo);
      if (!viaje) {
        throw new Error('Viaje not found');
      }
      return viaje;
    } catch (error) {
      console.error('Error getting viaje details:', error);
      throw new Error('Failed to retrieve viaje details');
    }
  }

  /**
   * Get all completed viajes for a specific reserva
   * @param {number} codigoreserva - Reserva ID
   * @returns {Promise<Array>} Completed viajes
   */
  async getViajesByReserva(codigoreserva) {
    try {
      return await this.viajeRepository.findByReserva(codigoreserva);
    } catch (error) {
      console.error('Error getting viajes by reserva:', error);
      throw new Error('Failed to retrieve viajes for the reserva');
    }
  }
}