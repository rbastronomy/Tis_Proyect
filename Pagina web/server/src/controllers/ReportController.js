import { ReportService } from "../services/ReportService.js";

export class ReportController {
    constructor(){
        this.reportService = new ReportService();
    }

    async generateReport(request,reply){
        try{
            const report = await this.reportService.generateReport(request.body);
            reply.status(200).json({
                success:true,
                message:'Reporte generado exitosamente',
                data:report
            });
        } catch(error){
            console.error('Error en generateReport',error);
            reply.status(500).json({
                success:false,
                message:'Error al generar reporte',
                error:error.message
            });
        }
    }
}