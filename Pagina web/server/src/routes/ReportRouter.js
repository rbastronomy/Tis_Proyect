import { BaseRouter } from '../core/BaseRouter.js';
import { ReportController } from '../controllers/ReportController.js';

/**
 * Router for report-related endpoints
 * @extends {BaseRouter}
 */
export class ReportRouter extends BaseRouter {
    /**
     * Initialize report router
     * @param {import('fastify').FastifyInstance} fastify - Fastify instance
     */
    constructor(fastify) {
        super(fastify, '/api/reports');
        this.reportController = new ReportController();
        this.setupRoutes();
    }

    /**
     * Setup report routes
     * @private
     */
    setupRoutes() {
        // Generate report in JSON format
        this.addRoute('POST', '/', {
            handler: this.withAuth(
                this.reportController.generateReport.bind(this.reportController),
                ['generate_reports'],
                ['ADMINISTRADOR']
            )
        });

        // Generate and download report as PDF
        this.addRoute('POST', '/pdf', {
            handler: this.withAuth(
                this.reportController.downloadReportPDF.bind(this.reportController),
                ['generate_reports'],
                ['ADMINISTRADOR']
            )
        });
    }
}

export default ReportRouter;