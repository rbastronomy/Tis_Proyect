import { GeolocalizationService } from './GeolocalizationService.js';

export class WebSocketService {
  constructor() {
    this.geoService = new GeolocalizationService();
    this.connectedTaxis = new Map();
  }

  async authenticateTaxi(patente) {
    if (!patente) {
      throw new Error('Patente is required');
    }

    // Here you would typically validate the taxi exists in your database
    // For now, we'll just track it in memory
    this.connectedTaxis.set(patente, {
      connectedAt: Date.now(),
      lastUpdate: Date.now()
    });

    return true;
  }

  async updateTaxiLocation(locationData) {
    const { patente, lat, lng, accuracy, speed } = locationData;
    
    if (!this.connectedTaxis.has(patente)) {
      throw new Error('Taxi not authenticated');
    }

    const location = await this.geoService.updateLocation(patente, {
      latitude: lat,
      longitude: lng,
      accuracy,
      speed
    });

    this.connectedTaxis.get(patente).lastUpdate = Date.now();

    return {
      patente,
      location: locationData
    };
  }

  async handleTaxiDisconnection(patente) {
    this.connectedTaxis.delete(patente);
  }
} 