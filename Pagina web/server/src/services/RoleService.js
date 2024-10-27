import { BaseService } from '../core/BaseService.js';
import { RoleModel } from '../models/RoleModel.js';

export class RoleService extends BaseService {
    constructor() {
        const roleModel = new RoleModel();
        super(roleModel);
    }

    async getPermissions(roleId) {
        return this.model.getPermissions(roleId);
    }

    async assignPermission(roleId, permissionId) {
        return this.model.assignPermission(roleId, permissionId);
    }

    async removePermission(roleId, permissionId) {
        return this.model.removePermission(roleId, permissionId);
    }
}
