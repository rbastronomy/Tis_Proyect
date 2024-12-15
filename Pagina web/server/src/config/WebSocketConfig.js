import { Server } from 'socket.io';
import { WebSocketController } from '../controllers/WebSocketController.js';
import process from 'process';

export class WebSocketConfig {
  constructor(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
      }
    });
    
    this.wsController = new WebSocketController();

    // Debug: Log all registered events
    console.log('🔧 WebSocket events registered:', {
      events: Object.keys(this.wsController)
    });
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('🔌 New client connected:', {
        socketId: socket.id,
        events: socket.eventNames()
      });
      
      // Only listen for taxi:auth event
      socket.on('taxi:auth', (data) => {
        if (!data.patente) {
          console.error('🚕 Missing patente in auth request:', data);
          socket.emit('error', { message: 'Patente is required for authentication' });
          return;
        }

        console.log('🚕 taxi:auth event received:', { 
          socketId: socket.id, 
          data,
          currentTaxiId: socket.taxiId
        });

        this.wsController.handleTaxiAuth(this.io, socket, data);
      });
      
      socket.on('location:update', (data) => {
        console.log('📍 location:update event received:', { 
          socketId: socket.id, 
          data,
          taxiId: socket.taxiId
        });
        this.wsController.handleLocationUpdate(this.io, socket, data);
      });
      
      socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', { 
          socketId: socket.id,
          taxiId: socket.taxiId
        });
        this.wsController.handleDisconnect(this.io, socket);
      });

      // Debug: Log bound events
      console.log('🔧 Socket events bound:', {
        socketId: socket.id,
        events: socket.eventNames()
      });
    });

    return this.io;
  }
} 