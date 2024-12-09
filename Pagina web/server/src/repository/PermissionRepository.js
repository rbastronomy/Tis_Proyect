import { BaseRepository } from '../core/BaseRepository.js';
import { PermissionModel } from '../models/PermissionModel.js';

export class PermissionRepository extends BaseRepository {
    constructor() {
        super('permiso', PermissionModel, 'id_permiso');
    }

    _toModel(data) {
        if (!data) return null;
        return new PermissionModel(data);
    }

    /**
     * Find permission by ID
     * @param {number} id_permiso - Permission ID
     * @returns {Promise<PermissionModel|null>} Permission instance or null
     */
    async findById(id_permiso) {
        try {
            const permission = await this.db(this.tableName)
                .where('id_permiso', id_permiso)
                .first();
            return this._toModel(permission);
        } catch (error) {
            throw new Error(`Error finding permission by ID: ${error.message}`);
        }
    }

    /**
     * Find permission by name
     * @param {string} nombre_permiso - Permission name
     * @returns {Promise<PermissionModel|null>} Permission instance or null
     */
    async findByName(nombre_permiso) {
        try {
            const permission = await this.db(this.tableName)
                .where('nombre_permiso', nombre_permiso)
                .first();
            return this._toModel(permission);
        } catch (error) {
            throw new Error(`Error finding permission by name: ${error.message}`);
        }
    }

    /**
     * Create new permission
     * @param {Object} permissionData - Permission data
     * @returns {Promise<PermissionModel>} Created permission
     */
    async create(permissionData) {
        try {
            const [permissionId] = await this.db(this.tableName)
                .insert({
                    ...permissionData,
                    fecha_creacion: new Date(),
                    created_at: new Date(),
                    updated_at: new Date()
                })
                .returning('id_permiso');

            return this.findById(permissionId);
        } catch (error) {
            throw new Error(`Error creating permission: ${error.message}`);
        }
    }

    /**
     * Update permission
     * @param {number} id_permiso - Permission ID
     * @param {Object} updateData - Updated permission data
     * @returns {Promise<PermissionModel|null>} Updated permission or null
     */
    async update(id_permiso, updateData) {
        try {
            const [updated] = await this.db(this.tableName)
                .where('id_permiso', id_permiso)
                .update({
                    ...updateData,
                    updated_at: new Date()
                })
                .returning('*');

            return updated ? this._toModel(updated) : null;
        } catch (error) {
            throw new Error(`Error updating permission: ${error.message}`);
        }
    }

    /**
     * Find all permissions
     * @returns {Promise<PermissionModel[]>} Array of permissions
     */
    async findAll() {
        try {
            const permissions = await this.db(this.tableName)
                .select('*')
                .orderBy('nombre_permiso');

            return permissions.map(permission => this._toModel(permission));
        } catch (error) {
            throw new Error(`Error finding all permissions: ${error.message}`);
        }
    }

    /**
     * Find permissions by role
     * @param {number} id_roles - Role ID
     * @returns {Promise<PermissionModel[]>} Array of permissions
     */
    async findByRole(id_roles) {
        console.log(id_roles);
        try {
            const permissions = await this.db(this.tableName)
                .select(`${this.tableName}.*`)
                .join('posee', `${this.tableName}.${this.primaryKey}`, 'posee.id_permiso')
                .where('posee.id_roles', id_roles)
                .orderBy(`${this.tableName}.nombre_permiso`);

            return permissions
        } catch (error) {
            throw new Error(`Error finding permissions by role: ${error.message}`);
        }
    }
}

export default PermissionRepository;