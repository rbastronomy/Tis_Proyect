import { WebSocketService } from '../services/WebSocketService.js';

export class WebSocketController {
  constructor() {
    this.wsService = new WebSocketService();
  }

  async handleTaxiAuth(io, socket, data) {
    try {
      console.log('Autenticación recibida:', { socketId: socket.id, ...data });
      await this.wsService.authenticateTaxi(data.patente);
      socket.taxiId = data.patente;
      socket.join(`taxi:${data.patente}`);
      io.emit('taxi:online', { patente: data.patente });
      console.log('Taxi autenticado:', data.patente);
    } catch (error) {
      console.error('Error en autenticación:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleLocationUpdate(io, socket, data) {
    try {
      const location = await this.wsService.updateTaxiLocation(data);
      io.emit('taxi:location', location);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  handleDisconnect(io, socket) {
    if (socket.taxiId) {
      this.wsService.handleTaxiDisconnection(socket.taxiId);
      io.emit('taxi:offline', { patente: socket.taxiId });
    }
  }
} 