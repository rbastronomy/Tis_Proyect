import { report } from 'process';
import { ReportRepository } from '../repository/ReportRepository.js';


export class ReportServices {
    constructor(){
        this.reportRepository = new ReportRepository();
    }
    
    async generarReporteViajesMensuales(year,month){
        try{
            const reportViajes = await this.reportRepository.getViajesMensuales(year,month);
            return{
                success:true,
                message:'Reporte de viajes mensuales',
                data:reportViajes
            };
        } catch(error){
            console.error('Error en generarReporteViajesMensuales',error);
            return{
                success:false,
                message:'Error al generar reporte de viajes mensuales',
                error:error.message
            };
        }
    }

    async generarReporteIngresosPorViajes(){
        try{
            const reportIngresos = await this.reportRepository.getIngresosPorViajes();
            const totalIngresos = reportIngresos.reduce((sum,item)=>sum+item.ingreso.total_ingresos,0);
            return{
                success:true,
                message:'Reporte de ingresos por viajes',
                data:reportIngresos,
                totalIngresos
            };
        } catch(error){
            console.error('Error en generarReporteIngresosPorViajes',error);
            return{
                success:false,
                message:'Error al generar reporte de ingresos por viajes',
                error:error.message
            };
        }
    }

    async generarReportesValoracionViajes(){
        try{
            const reportValoracion = await this.reportRepository.getValoracionViajes();
            return{
                success:true,
                message:'Reporte de valoración de viajes',
                data:reportValoracion
            };
        } catch(error){
            console.error('Error en generarReportesValoracionViajes',error);
            return{
                success:false,
                message:'Error al generar reporte de valoración de viajes',
                error:error.message
            };
        }
    }


}