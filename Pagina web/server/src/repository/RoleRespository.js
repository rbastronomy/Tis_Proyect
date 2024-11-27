import { BaseRepository } from '../core/BaseRepository.js';
import { RoleModel } from '../models/RoleModel.js'


class RoleRepository extends BaseRepository{
    constructor(knex){
        super(knex, 'roles')
    }

    async create(RoleData){
        const[createdRole] = await this.kenx(this.table)
            .insert(RoleData)
            .returning('*');
        return RoleModel.fromDB(createdRole)
    }

    async update(codigo, updateData){
        const[updatedRole] = await this.knex(this.table)
            .where({codigo})
            .update(updateData)
            .returning('*');
        return updatedRole ? RoleModel.fromDB(updatedRole) : null
    }

}

module.export = RoleRepository