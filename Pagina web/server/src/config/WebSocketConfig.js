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

    // Monitoreo solo cuando hay conexiones activas
    setInterval(() => {
      if (this.io.sockets.sockets.size > 0) {
        const sockets = this.io.sockets.sockets;
        console.log('Conexiones activas:', {
          total: sockets.size,
          sockets: Array.from(sockets).map(([id, socket]) => ({
            id,
            taxiId: socket.taxiId,
            rooms: Array.from(socket.rooms)
          }))
        });
      }
    }, 5000);
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id);
      
      socket.on('taxi:auth', (data) => 
        this.wsController.handleTaxiAuth(this.io, socket, data));
      
      socket.on('location:update', (data) => 
        this.wsController.handleLocationUpdate(this.io, socket, data));
      
      socket.on('disconnect', () => 
        this.wsController.handleDisconnect(this.io, socket));
    });

    return this.io;
  }
} 