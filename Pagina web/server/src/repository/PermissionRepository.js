import { BaseRepository } from '../core/BaseRepository.js';
import { PermissionModel } from '../models/PermissionModel.js'


class PermissionRepository extends BaseRepository{
    constructor(knex){
        super(knex, 'permiso')
    }

    async create(PermissionData){
        const[createdPermission] = await this.kenx(this.table)
            .insert(PermissionData)
            .returning('*');
        return PermissionModel.fromDB(createdPermission)
    }

    async update(idpermiso, updateData){
        const[updatedPermission] = await this.knex(this.table)
            .where({codigo})
            .update(updateData)
            .returning('*');
        return updatedPermission? PermissionModel.fromDB(updatedPermission) : null
    }

}

module.export = PermissionRepository