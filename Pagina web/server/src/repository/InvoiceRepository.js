import { BaseRepository } from '../core/BaseRepository.js';
import { InvoiceModel } from '../models/InvoiceModel.js';

class InvoiceRepository extends BaseRepository{
    constructor(){
        super('boleta')
    }

    async create(InvoiceData){
        try {
            const[createdInvoice] = await this.db(this.tableName)
                .insert(InvoiceData)
                .returning('*');
            return InvoiceModel.fromDB(createdInvoice)   
        } catch (error) {
            throw new Error(`Error creating invoice: ${error.message}`);    
        }
    }

    async update(codigoboleta, updateData){
        try {
            const[updatedInvoice] = await this.db(this.tableName)
                .where({codigoboleta})
                .update(updateData)
                .returning('*');
            return updatedInvoice ? InvoiceModel.fromDB(updateData) : null
        } catch (error) {
            throw new Error(`Error updating invoice: ${error.message}`);
        }
    }

    async softDelete(codigoboleta){
        try {
            const[deletedInvoice] = await this.db(this.tableName)
                .where({codigoboleta})
                .update({
                    estado: 'eliminado',
                    deleted_at: new Date()
                })
                .returning('*');
            return deletedInvoice ? InvoiceModel.fromDB(deletedInvoice) : null
        } catch (error) {
            throw new Error(`Error softdeleting data: ${error.message}`);
        }
    }
}