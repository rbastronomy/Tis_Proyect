import { BaseModel } from "../core/BaseModel.js";
import { ServiceModel } from './ServiceModel.js';
import { RateModel } from './RateModel.js';

export class OfferingModel extends BaseModel {
    static defaultData = {
        oferta_id: null,      // ID de la oferta

        // Modelos relacionados
        service: null,        // Servicio (ServiceModel)
        rate: null,          // Tarifa (RateModel)
    };

    constructor(data = {}) {
        const modelData = {
            ...data,
            service: data.service instanceof ServiceModel ? data.service : null,
            rate: data.rate instanceof RateModel ? data.rate : null
        };

        super(modelData, OfferingModel.defaultData);

        // Inicializar modelos si se proporcionan datos crudos
        if (data.service && !(data.service instanceof ServiceModel)) {
            this._data.service = new ServiceModel(data.service);
        }
        if (data.rate && !(data.rate instanceof RateModel)) {
            this._data.rate = new RateModel(data.rate);
        }
    }

    // Getters
    get oferta_id() { return this._data.oferta_id; }
    get service() { return this._data.service; }
    get rate() { return this._data.rate; }

    toJSON() {
        const json = {
            oferta_id: this._data.oferta_id,

        };

        if (this._data.service) json.service = this._data.service.toJSON();
        if (this._data.rate) json.rate = this._data.rate.toJSON();

        return json;
    }

    static fromDB(data) {
        if (!data) return null;
        return new OfferingModel(data);
    }
} 