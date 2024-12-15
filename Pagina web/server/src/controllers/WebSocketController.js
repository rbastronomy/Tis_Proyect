import { WebSocketService } from '../services/WebSocketService.js';

export class WebSocketController {
  constructor() {
    this.wsService = new WebSocketService();
  }

  async handleTaxiAuth(io, socket, data) {
    try {
      console.log('🚕 Auth request received:', { 
        socketId: socket.id, 
        data,
        rooms: Array.from(socket.rooms),
        currentTaxiId: socket.taxiId,
        timestamp: Date.now()
      });

      await this.wsService.authenticateTaxi(data.patente);
      
      socket.taxiId = data.patente;
      socket.join(`taxi:${data.patente}`);
      
      // Send success event back to the client
      console.log('🚕 Emitting auth success to:', socket.id);
      
      // Emit both events with acknowledgment
      socket.emit('taxi:auth:success', { 
        patente: data.patente,
        socketId: socket.id,
        timestamp: Date.now()
      }, (error) => {
        if (error) {
          console.error('🚕 Error in auth success acknowledgment:', error);
        } else {
          console.log('🚕 Auth success acknowledged by client');
        }
      });
      
      io.emit('taxi:online', { 
        patente: data.patente,
        timestamp: Date.now()
      });

      console.log('🚕 Taxi fully authenticated:', {
        patente: data.patente,
        socketId: socket.id,
        rooms: Array.from(socket.rooms),
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('❌ Error in authentication:', {
        error: error.message,
        socketId: socket.id,
        data,
        timestamp: Date.now()
      });
      socket.emit('error', { 
        message: error.message,
        timestamp: Date.now()
      });
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