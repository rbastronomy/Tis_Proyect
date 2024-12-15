import { ReportRepository } from "../repository/ReportRepository.js";

export class ReportController {
    constructor(){
        this.reportRepository = new ReportRepository();
    }

    async getViajesMensuales(request,reply){
        try{
            const {year,month} = request.params;
            const reportViajes = await this.reportRepository.getViajesMensuales(year,month);
            reply.status(200).json({
                success:true,
                message:'Reporte de viajes mensuales',
                data:reportViajes
            });
        } catch(error){
            console.error('Error en getViajesMensuales',error);
            reply.status(500).json({
                success:false,
                message:'Error al obtener reporte de viajes mensuales',
                error:error.message
            });
        }
    }

    async getIngresosPorViajes(request,reply){
        try{
            const reportIngresos = await this.reportRepository.getIngresosPorViajes();
            const totalIngresos = reportIngresos.reduce((sum,item)=>sum+item.total_ingresos,0);
            reply.status(200).json({
                success:true,
                message:'Reporte de ingresos por viajes',
                data:reportIngresos,
                totalIngresos
            });
        } catch(error){
            console.error('Error en getIngresosPorViajes',error);
            reply.status(500).json({
                success:false,
                message:'Error al obtener reporte de ingresos por viajes',
                error:error.message
            });
        }
    }

    async getValoracionViajes(request,reply){
        try{
            const reportValoracion = await this.reportRepository.getValoracionViajes();
            reply.status(200).json({
                success:true,
                message:'Reporte de valoración de viajes',
                data:reportValoracion
            });
        } catch(error){
            console.error('Error en getValoracionViajes',error);
            reply.status(500).json({
                success:false,
                message:'Error al obtener reporte de valoración de viajes',
                error:error.message
            });
        }
    }
}