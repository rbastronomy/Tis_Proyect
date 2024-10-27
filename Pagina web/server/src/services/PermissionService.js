import { BaseService } from '../core/BaseService.js';
import { PermissionModel } from '../models/PermissionModel.js';

export class PermissionService extends BaseService {
    constructor() {
        const permissionModel = new PermissionModel();
        super(permissionModel);
    }

    // Additional methods if needed
}
