import { BaseController } from '../core/BaseController.js';
import { ServiceService } from '../services/ServiceService.js';

export class ServicioController extends BaseController {
  constructor() {
    const serviceService = new ServiceService();
    super(serviceService);
  }

  async getActiveServices(req, res) {
    try {
      const services = await this.service.findActive();
      return res.json({ services });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
} 