import { BaseRepository } from "../core/BaseRepository";
import { HistoryModel } from "../models/HistoryModel";

class HistoryRepository extends BaseRepository {
    constructor() {
        super("historial");
    }
    
    async create(historyData) {
        try {
        const [createdHistory] = await this.db(this.tableName)
            .insert(historyData)
            .returning("*");
        return HistoryModel.fromDB(createdHistory);
        } catch (error) {
        throw new Error(`Error creating history: ${error.message}`);
        }
    }
    
    async update(codigohistorial, updateData) {
        try {
        const [updatedHistory] = await this.db(this.tableName)
            .where({ codigohistorial })
            .update(updateData)
            .returning("*");
        return updatedHistory ? HistoryModel.fromDB(updateData) : null;
        } catch (error) {
        throw new Error(`Error updating data: ${error.message}`);
        }
    }
    
    async softDelete(codigohistorial) {
        try {
        const [deletedHistory] = await this.db(this.tableName)
            .where({ codigohistorial })
            .update({
            estado: "eliminado",
            deleted_at: new Date(),
            })
            .returning("*");
        return deletedHistory ? HistoryModel.fromDB(deletedHistory) : null;
        } catch (error) {
        throw new Error(`Error softdeleting data: ${error.message}`);
        }
    }
    }