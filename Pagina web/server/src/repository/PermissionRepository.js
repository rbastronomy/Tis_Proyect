import { BaseRepository } from '../core/BaseRepository.js';
import { PermissionModel } from '../models/PermissionModel.js';

class PermissionRepository extends BaseRepository {
    constructor() {
        super('permiso', PermissionModel, 'idpermisos');
    }

    _toModel(data) {
        if (!data) return null;
        return new PermissionModel(data);
    }

    async findById(permissionId) {
        try {
            const permission = await this.db(this.tableName)
                .where('idpermisos', permissionId)
                .first();
            return this._toModel(permission);
        } catch (error) {
            throw new Error(`Error finding permission by ID: ${error.message}`);
        }
    }

    async findByName(name) {
        try {
            const permission = await this.db(this.tableName)
                .where('nombrepermiso', name)
                .first();
            return this._toModel(permission);
        } catch (error) {
            throw new Error(`Error finding permission by name: ${error.message}`);
        }
    }

    async create(permissionData) {
        try {
            const [permissionId] = await this.db(this.tableName)
                .insert({
                    ...permissionData,
                    fechacreacion: new Date(),
                })
                .returning('idpermisos');

            return this.findById(permissionId);
        } catch (error) {
            throw new Error(`Error creating permission: ${error.message}`);
        }
    }
}

export default PermissionRepository;