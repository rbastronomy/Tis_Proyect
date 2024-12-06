import { BaseModel } from "../core/BaseModel.js";
import { ServiceModel } from './ServiceModel.js';
import { TarifaModel } from './TarifaModel.js';

export class OfferingModel extends BaseModel {
    static defaultData = {
        oferta_id: null,      // ID de la oferta
        idtarifa: null,       // ID de la tarifa
        codigos: null,        // ID del servicio
        created_at: null,     // Fecha de creación
        updated_at: null,     // Fecha de actualización
        
        // Modelos relacionados
        service: null,        // Servicio (ServiceModel)
        rate: null,          // Tarifa (TarifaModel)
    };

    constructor(data = {}) {
        const modelData = {
            ...data,
            service: data.service instanceof ServiceModel ? data.service : null,
            rate: data.rate instanceof TarifaModel ? data.rate : null
        };

        super(modelData, OfferingModel.defaultData);

        // Inicializar modelos si se proporcionan datos crudos
        if (data.service && !(data.service instanceof ServiceModel)) {
            this._data.service = new ServiceModel(data.service);
        }
        if (data.rate && !(data.rate instanceof TarifaModel)) {
            this._data.rate = new TarifaModel(data.rate);
        }
    }

    // Getters
    get oferta_id() { return this._data.oferta_id; }
    get idtarifa() { return this._data.idtarifa; }
    get codigos() { return this._data.codigos; }
    get service() { return this._data.service; }
    get rate() { return this._data.rate; }

    toJSON() {
        const json = {
            oferta_id: this._data.oferta_id,
            idtarifa: this._data.idtarifa,
            codigos: this._data.codigos,
            created_at: this._data.created_at,
            updated_at: this._data.updated_at
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