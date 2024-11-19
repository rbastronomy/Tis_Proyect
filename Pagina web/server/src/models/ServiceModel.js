import { BaseModel } from '../core/BaseModel.js';

export class ServiceModel extends BaseModel {
    constructor() {
        super('servicios');
    }

    /**
     * Create a new service
     * @param {Object} serviceData - The service data to insert
     * @returns {Promise} - Inserted service record
     */
    async createService(serviceData) {
        return this.db(this.tableName).insert(serviceData).returning('*');
    }

    /**
     * Get service by its code
     * @param {number} serviceCode - The service code
     * @returns {Promise} - Service record
     */
    async getServiceByCode(serviceCode) {
        return this.db(this.tableName)
            .where({ codigos: serviceCode })
            .first();
    }

    /**
     * Update a service
     * @param {number} serviceCode - The service code to update
     * @param {Object} updateData - The data to update
     * @returns {Promise} - Updated service record
     */
    async updateService(serviceCode, updateData) {
        return this.db(this.tableName)
            .where({ codigos: serviceCode })
            .update(updateData)
            .returning('*');
    }

    /**
     * Delete a service (soft delete)
     * @param {number} serviceCode - The service code to delete
     * @returns {Promise} - Updated service record
     */
    async deleteService(serviceCode) {
        return this.db(this.tableName)
            .where({ codigos: serviceCode })
            .update({ 
                estados: 'INACTIVE', 
                deleteats: new Date() 
            })
            .returning('*');
    }

    /**
     * List services with optional filtering
     * @param {Object} filters - Optional filtering parameters
     * @returns {Promise} - List of services
     */
    async listServices(filters = {}) {
        return this.db(this.tableName)
            .where(filters)
            .whereNull('deleteats');
    }

    /**
     * Get services requested by a person
     * @param {number} rut - RUT of the person
     * @returns {Promise} - List of services requested
     */
    async getRequestedServicesByPerson(rut) {
        return this.db('solicita')
            .join('servicio', 'solicita.codigos', 'servicio.codigos')
            .where('solicita.rut', rut)
            .select('servicio.*', 'solicita.fechasolicitud');
    }
}

export default ServiceModel;