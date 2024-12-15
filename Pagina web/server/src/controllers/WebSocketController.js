import { BaseSocketHandler } from '../core/BaseSocketHandler.js';
import { WebSocketService } from '../services/WebSocketService.js';
import { GeolocalizationService } from '../services/GeolocalizationService.js';
import { WS_EVENTS } from '../constants/WebSocketEvents.js';

export class WebSocketController extends BaseSocketHandler {
  constructor(io) {
    super(io);
    this.wsService = new WebSocketService();
    this.geoService = new GeolocalizationService();
    
    // Register all event handlers
    this.registerHandlers();
  }

  registerHandlers() {
    this
      .on(WS_EVENTS.TAXI_AUTH, this.handleTaxiAuth)
      .on(WS_EVENTS.TAXI_LOCATION, this.handleLocationUpdate)
      .on(WS_EVENTS.DRIVER_OFFLINE, this.handleDriverOffline)
      .on(WS_EVENTS.DISCONNECT, this.handleDisconnect)
      .on(WS_EVENTS.JOIN_ADMIN_ROOM, this.handleJoinAdminRoom);
  }

  async handleTaxiAuth(socket, data) {
    const { patente } = data;
    await this.wsService.authenticateTaxi(patente);
    
    socket.taxiData = { patente };
    socket.join(`taxi:${patente}`);
    
    socket.emit(WS_EVENTS.TAXI_AUTH_SUCCESS, { 
      patente,
      timestamp: Date.now()
    });
    
    this.io.emit(WS_EVENTS.TAXI_ONLINE, { 
      patente,
      timestamp: Date.now()
    });
  }

  async handleLocationUpdate(socket, data) {
    console.log('Received location update:', data);

    const location = await this.geoService.updateLocation(data.patente, {
      latitude: data.lat,
      longitude: data.lng,
      accuracy: data.accuracy,
      speed: data.speed,
      timestamp: data.timestamp
    });

    const updateData = {
      patente: data.patente,
      lat: data.lat,
      lng: data.lng,
      estado: data.estado,
      timestamp: data.timestamp
    };

    console.log('Broadcasting location to admin room:', updateData);
    
    this.emitToRoom('admin', WS_EVENTS.TAXI_LOCATION_UPDATE, updateData);
  }

  handleDriverOffline(socket) {
    if (socket.taxiData?.patente) {
      this.handleTaxiOffline(socket);
    }
  }

  handleDisconnect(socket) {
    if (socket.taxiData?.patente) {
      this.handleTaxiOffline(socket);
    }
  }

  handleTaxiOffline(socket) {
    const { patente } = socket.taxiData;
    this.emitToRoom('admin', WS_EVENTS.TAXI_OFFLINE, { patente });
    this.wsService.handleTaxiDisconnection(patente);
  }

  async handleJoinAdminRoom(socket) {
    console.log('Client joining admin room:', socket.id);
    socket.join('admin');
    console.log('Current rooms for socket:', socket.rooms);
  }

  initialize() {
    this.io.on(WS_EVENTS.CONNECT, (socket) => {
      console.log('🔌 New client connected:', socket.id);
      super.initialize(socket);
    });
  }
} 