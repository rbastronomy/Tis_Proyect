import { BaseService } from "../core/BaseService.js"
import { TaxiRepository } from "../repository/TaxiRepository.js";
import { TaxiModel } from '../models/TaxiModel.js';
import { UserService } from './UserService.js';

export class TaxiService extends BaseService {
    constructor() {
        const taxiRepository = new TaxiRepository();
        super(taxiRepository);
        this.userService = new UserService();
    }

    /**
     * Creates a new taxi
     * @param {Object} taxiData - Raw taxi data
     * @returns {Promise<TaxiModel>} Created taxi model
     * @throws {Error} If creation fails
     */
    async createTaxi(taxiData) {
        try {
            // Create model instance (validation happens in constructor)
            const taxiModel = new TaxiModel(taxiData);
            
            // Save raw data to database
            const createdTaxi = await this.repository.create(taxiModel.toJSON());
            
            // Return as model instance
            return new TaxiModel(createdTaxi);
        } catch (error) {
            throw new Error(`Error creating taxi: ${error.message}`);
        }
    }

    /**
     * Updates a taxi
     * @param {string} patente - License plate
     * @param {Object} taxiData - Updated taxi data
     * @returns {Promise<TaxiModel>} Updated taxi model
     * @throws {Error} If update fails
     */
    async updateTaxi(patente, taxiData) {
        try {
            // Get existing taxi
            const existingTaxi = await this.repository.findByPatente(patente);
            if (!existingTaxi) {
                throw new Error('Taxi not found');
            }

            // Create model with merged data (validation happens in constructor)
            const taxiModel = new TaxiModel({
                ...existingTaxi,
                ...taxiData
            });

            // Save to database
            const updatedTaxi = await this.repository.update(patente, taxiModel.toJSON());
            
            return new TaxiModel(updatedTaxi);
        } catch (error) {
            throw new Error(`Error updating taxi: ${error.message}`);
        }
    }

    /**
     * Soft deletes a taxi
     * @param {string} patente - License plate
     * @returns {Promise<TaxiModel>} Deleted taxi model
     * @throws {Error} If deletion fails
     */
    async deleteTaxi(patente) {
        try {
            const deletedTaxi = await this.repository.softDelete(patente);
            if (!deletedTaxi) {
                throw new Error('Taxi not found');
            }
            return new TaxiModel(deletedTaxi);
        } catch (error) {
            throw new Error(`Error deleting taxi: ${error.message}`);
        }
    }

    /**
     * Gets a taxi by license plate with driver info
     * @param {string} patente - License plate
     * @returns {Promise<TaxiModel>} Taxi model with driver info
     * @throws {Error} If taxi not found
     */
    async getTaxiByLicensePlate(patente) {
        try {
            console.log('TaxiService - Getting taxi with patente:', patente);
            
            const taxiData = await this.repository.findByPatente(patente);
            console.log('TaxiService - Raw taxi data:', taxiData);
            
            if (!taxiData) {
                throw new Error('Taxi not found');
            }

            // If taxi has a driver assigned, get driver info from UserService
            let driverData = null;
            if (taxiData.rut_conductor) {
                console.log('TaxiService - Fetching driver info for RUT:', taxiData.rut_conductor);
                driverData = await this.userService.findDriverByRut(taxiData.rut_conductor);
                console.log('TaxiService - Driver data:', driverData);
            }

            // Create taxi model with driver info
            const taxiModel = new TaxiModel({
                ...taxiData,
                conductor: driverData
            });

            console.log('TaxiService - Created TaxiModel:', taxiModel.toJSON());
            return taxiModel;
        } catch (error) {
            console.error('TaxiService - Error:', error);
            throw new Error(`Error fetching taxi: ${error.message}`);
        }
    }

    /**
     * Checks technical review status
     * @param {string} patente - License plate
     * @returns {Promise<boolean>} True if review is current
     * @throws {Error} If check fails
     */
    async checkTechnicalReview(patente) {
        try {
            const taxi = await this.getTaxiByLicensePlate(patente);
            const currentDate = new Date();
            const reviewDate = new Date(taxi.vencimiento_revision_tecnica);
            return reviewDate >= currentDate;
        } catch (error) {
            throw new Error(`Error checking technical review: ${error.message}`);
        }
    }

    /**
     * Gets all taxis
     * @param {Object} query - Query parameters
     * @returns {Promise<TaxiModel[]>} Array of taxi models
     * @throws {Error} If fetch fails
     */
    async getAll(query = {}) {
        try {
            const taxis = await this.repository.getAll(query);
            return taxis.map(taxi => new TaxiModel(taxi));
        } catch (error) {
            throw new Error(`Error fetching taxis: ${error.message}`);
        }
    }

    /**
     * Get all taxis assigned to a specific driver
     * @param {string} rut - Driver's RUT
     * @returns {Promise<Array>} Array of taxi objects
     */
    async getTaxisByDriver(rut) {
        try {
            const taxis = await this.repository.getTaxisByDriver(rut);
            return taxis.map(taxi => new TaxiModel(taxi));
        } catch (error) {
            throw new Error(`Error getting taxis for driver: ${error.message}`);
        }
    }

    /**
     * Assign a taxi to a driver
     * @param {string} patente - Taxi's license plate
     * @param {string} rut - Driver's RUT
     * @returns {Promise<TaxiModel>} Updated taxi model
     */
    async assignTaxiToDriver(patente, rut) {
        try {
            // First check if the taxi is available
            const taxiData = await this.repository.findById(patente);
            if (!taxiData) {
                throw new Error('Taxi not found');
            }
            const taxi = new TaxiModel(taxiData);
            if (taxi.rut_conductor) {
                throw new Error('Taxi is already assigned to a driver');
            }
            if (taxi.estado_taxi !== 'DISPONIBLE') {
                throw new Error('Taxi is not available for assignment');
            }

            // Update the taxi with the driver's RUT and change status
            const updatedTaxiData = await this.repository.update(patente, {
                rut_conductor: rut,
                estado_taxi: 'EN SERVICIO'
            });

            return new TaxiModel(updatedTaxiData);
        } catch (error) {
            throw new Error(`Error assigning taxi: ${error.message}`);
        }
    }

    /**
     * Unassign a taxi from a driver
     * @param {string} patente - Taxi's license plate
     * @param {string} rut - Driver's RUT
     * @returns {Promise<TaxiModel>} Updated taxi model
     */
    async unassignTaxiFromDriver(patente, rut) {
        try {
            // Check if the taxi exists and is assigned to this driver
            const taxiData = await this.repository.findById(patente);
            if (!taxiData) {
                throw new Error('Taxi not found');
            }
            const taxi = new TaxiModel(taxiData);
            if (taxi.rut_conductor !== rut) {
                throw new Error('Taxi is not assigned to this driver');
            }

            // Update the taxi to remove driver assignment and change status
            const updatedTaxiData = await this.repository.update(patente, {
                rut_conductor: null,
                estado_taxi: 'DISPONIBLE'
            });

            return new TaxiModel(updatedTaxiData);
        } catch (error) {
            throw new Error(`Error unassigning taxi: ${error.message}`);
        }
    }

    /**
     * Get available taxis with their assigned drivers
     * @param {Date} [bookingTime=new Date()] - The time of the booking
     * @returns {Promise<Array>} List of available taxis with driver information
     */
    async getAvailableTaxisWithDrivers(bookingTime = new Date()) {
        try {
            console.log('TaxiService - Booking Time:', {
                isDefault: bookingTime.getTime() === new Date().getTime(),
                bookingTime: bookingTime.toISOString()
            });

            // Get raw taxi data
            const rawTaxis = await this.repository.findAll({
                estado_taxi: 'EN SERVICIO'
            });

            // Create taxi models
            const taxiModels = rawTaxis.map(rawTaxi => new TaxiModel(rawTaxi));
            
            // Get unique driver RUTs
            const driverRuts = [...new Set(
                taxiModels
                    .map(taxi => taxi._data.rut_conductor)
                    .filter(rut => rut != null)
            )];

            // Fetch all available drivers for the given time
            const driversMap = await this.userService.findDriversByRuts(driverRuts, bookingTime);

            // Attach drivers to taxi models
            const taxisWithDrivers = taxiModels.map(taxiModel => {
                const driverRut = taxiModel._data.rut_conductor;
                if (driverRut && driversMap[driverRut]) {
                    taxiModel.conductor = driversMap[driverRut];
                }
                return taxiModel;
            });

            // Only return taxis that have available drivers
            return taxisWithDrivers
                .filter(taxi => taxi.conductor)
                .map(taxi => ({
                    patente: taxi.patente,
                    modelo: taxi.modelo,
                    marca: taxi.marca,
                    estado_taxi: taxi.estado_taxi,
                    conductor: {
                        rut: taxi.conductor.rut,
                        nombre: taxi.conductor.nombre
                    }
                }));
        } catch (error) {
            console.error('Error in getAvailableTaxisWithDrivers:', error);
            throw new Error('Failed to get available taxis with drivers');
        }
    }

    /**
     * Gets driver information by RUT
     * @param {string} rut - Driver's RUT
     * @returns {Promise<UserModel>} Driver information
     */
    async getDriverInfo(rut) {
        try {
            const driver = await this.userService.findDriverByRut(rut);
            if (!driver) {
                throw new Error('Driver not found');
            }
            return driver;
        } catch (error) {
            console.error('Error getting driver info:', error);
            throw new Error(`Error getting driver info: ${error.message}`);
        }
    }
}