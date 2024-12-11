import { BaseController } from '../core/BaseController.js';
import { GeolocalizationService } from '../services/GeolocalizationService.js';

const geolocalizationService = new GeolocalizationService();
export class GeolocalizationController extends BaseController {
  constructor() {
    super(geolocalizationService);
  }

  async getGeolocalizationByTaxiId(request, reply) {
    const { id_taxi } = request.params;
    const geolocalization = await this.service.findByTaxiId(id_taxi);
    return reply.send(geolocalization);
  }
}