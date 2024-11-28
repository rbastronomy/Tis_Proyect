import { BaseRepository } from '../core/BaseRepository.js';
import { RoleModel } from '../models/RoleModel.js'


class RoleRepository extends BaseRepository{
    constructor(){
        super('roles')
    }

    async create(RoleData){
        try {
            const[createdRole] = await this.db(this.table)
                .insert(RoleData)
                .returning('*');
            return RoleModel.fromDB(createdRole)          
        } catch (error) {
            throw new Error(`Error creating role: ${error.message}`);
        }
    }

    
    async update(codigo, updateData){
        try {
            const[updatedRole] = await this.db(this.table)
                .where({codigo})
                .update(updateData)
                .returning('*');
            return updatedRole ? RoleModel.fromDB(updatedRole) : null
        } catch (error) {
            throw new Error(`Error updating role: ${error.message}`);
        }
    }

    async softDelete(codigo){
        try {
            const[deletedRole] = await this.db(this.table)
                .where({codigo})
                .update({
                    estado: 'eliminado',
                    deleted_at: new Date()
                })
                .returning('*');
            return deletedRole ? RoleModel.fromDB(deletedRole) : null
        } catch (error) {
            throw new Error(`Error softdeleting data: ${error.message}`);
        }
    }

}

export default RoleRepository;