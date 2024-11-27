import { BaseRepository } from '../core/BaseRepository.js';
import { InvoiceModel } from '../models/InvoiceModel.js';

class InvoiceRepository extends BaseRepository{
    constructor(knex){
        super(knex, 'boleta')
    }

    async create(InvoiceData){
        const[createdInvoice] = await this.knex(this.tableName)
            .insert(InvoiceData)
            .returning('*');
        return InvoiceModel.fromDB(createdInvoice)
    }

    async update(codigoboleta, updateData){
        const[updatedInvoice] = await this.knex(this.tableName)
            .where({codigoboleta})
            .update(updateData)
            .returning('*');
        return updatedInvoice ? InvoiceModel.fromDB(updateData) : null
    }
}