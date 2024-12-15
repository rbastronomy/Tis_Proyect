import { ReportController } from "../controllers/ReportController.js";

export class ReportRouter {
    constructor(provider){
        super(provider,'/api/reports');
        this.reportController = new ReportController();
        this.setupRoutes();
    }
    setupRoutes(){
        this.addRoute('GET','/viajes-mensuales/:year/:month',{
            handler:this.reportController.getViajesMensuales.bind(this.reportController)
        });
        this.addRoute('GET','/ingresos-por-viajes',{
            handler:this.reportController.getIngresosPorViajes.bind(this.reportController)
        });
        this.addRoute('GET','/valoracion-viajes',{
            handler:this.reportController.getValoracionViajes.bind(this.reportController)
        });
    }
}