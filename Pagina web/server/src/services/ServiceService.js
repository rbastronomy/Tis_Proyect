import { BaseService } from '../core/BaseService.js';
import { ServiceModel } from '../models/ServiceModel.js';

export class ServiceService extends BaseService {
    constructor() {
        const serviceModel = new ServiceModel();
        super(serviceModel);
    }
}