import { BaseRepository } from '../core/BaseRepository.js';
import { PermissionModel } from '../models/PermissionModel.js'


class PermissionRepository extends BaseRepository{
    constructor(){
        super('permiso')
    }

    async create(PermissionData){
        try {
            const[createdPermission] = await this.db(this.table)
                .insert(PermissionData)
                .returning('*');
            return PermissionModel.fromDB(createdPermission) 
        } catch (error) {
            throw new Error(`Error creating permission: ${error.message}`);
        }
    }

    async update(idpermiso, updateData){
        try {
            const[updatedPermission] = await this.db(this.table)
                .where({idpermiso})
                .update(updateData)
                .returning('*');
            return updatedPermission? PermissionModel.fromDB(updatedPermission) : null
        } catch (error) {
            throw new Error(`Error updating permission: ${error.message}`);
        }
    }

    async softDelete(idpermiso){
        try {
            const[deletedPermission] = await this.db(this.table)
                .where({idpermiso})
                .update({
                    estadop: 'eliminado',
                    deleted_at: new Date()
                })
                .returning('*');
            return deletedPermission ? PermissionModel.fromDB(deletedPermission) : null
        } catch (error) {
            throw new Error(`Error softdeleting data: ${error.message}`);
        }
    }

}

export default PermissionRepository;