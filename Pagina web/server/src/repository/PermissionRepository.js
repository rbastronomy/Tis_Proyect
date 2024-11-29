import { BaseRepository } from '../core/BaseRepository.js';
import { PermissionModel } from '../models/PermissionModel.js';

class PermissionRepository extends BaseRepository {
    constructor() {
        super('permiso');
    }

    _toModel(data) {
        if (!data) return null;
        return new PermissionModel(data);
    }

    /**
     * Create new permission
     * @param {Object} permissionData - Permission data
     * @returns {Promise<PermissionModel>}
     */
    async create(permissionData) {
        try {
            const [createdPermission] = await this.db(this.tableName)
                .insert(permissionData)
                .returning('*');
            return this._toModel(createdPermission);
        } catch (error) {
            throw new Error(`Error creating permission: ${error.message}`);
        }
    }

    /**
     * Update permission
     * @param {string} idpermiso - Permission ID
     * @param {Object} updateData - Data to update
     * @returns {Promise<PermissionModel|null>}
     */
    async update(idpermiso, updateData) {
        try {
            const [updatedPermission] = await this.db(this.tableName)
                .where({ idpermiso })
                .update(updateData)
                .returning('*');
            return updatedPermission ? this._toModel(updatedPermission) : null;
        } catch (error) {
            throw new Error(`Error updating permission: ${error.message}`);
        }
    }

    /**
     * Find permission by name
     * @param {string} name - Permission name
     * @returns {Promise<PermissionModel|null>}
     */
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

    /**
     * Soft delete permission
     * @param {string} idpermiso - Permission ID
     * @returns {Promise<PermissionModel|null>}
     */
    async softDelete(idpermiso) {
        try {
            const [deletedPermission] = await this.db(this.tableName)
                .where({ idpermiso })
                .update({
                    estadop: 'ELIMINADO',
                    deleteatp: new Date()
                })
                .returning('*');
            return deletedPermission ? this._toModel(deletedPermission) : null;
        } catch (error) {
            throw new Error(`Error soft deleting permission: ${error.message}`);
        }
    }
}

export default PermissionRepository;