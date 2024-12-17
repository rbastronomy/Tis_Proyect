import { ReportService } from "../services/ReportService.js";

/**
 * Controller for handling report-related requests
 */
export class ReportController {
    /**
     * Initialize report controller
     */
    constructor() {
        this.reportService = new ReportService();
    }

    /**
     * Generate report based on request parameters
     * @param {import('fastify').FastifyRequest} request - Fastify request object
     * @param {import('fastify').FastifyReply} reply - Fastify reply object
     */
    async generateReport(request, reply) {
        try {
            const { type, startDate, endDate } = request.body;
            
            // Validate required type
            if (!type) {
                return reply.code(400).send({
                    success: false,
                    message: 'El tipo de reporte es requerido'
                });
            }

            const filters = {};
            if (startDate) filters.startDate = startDate;
            if (endDate) filters.endDate = endDate;

            const report = await this.reportService.generateReport({
                type,
                filters,
                user: request.user
            });

            return reply.code(200).send({
                success: true,
                message: 'Reporte generado exitosamente',
                data: report.toJSON()
            });

        } catch (error) {
            console.error('Error in generateReport:', error);
            
            // Handle specific error types
            if (error.message.includes('no tienes permisos')) {
                return reply.code(403).send({
                    success: false,
                    message: error.message
                });
            }

            if (error.message.includes('tipo de reporte no soportado')) {
                return reply.code(400).send({
                    success: false,
                    message: error.message
                });
            }

            // Generic error response
            return reply.code(500).send({
                success: false,
                message: 'Error al generar reporte',
                error: error.message
            });
        }
    }

    /**
     * Download PDF report based on request parameters
     * @param {import('fastify').FastifyRequest} request - Fastify request object
     * @param {import('fastify').FastifyReply} reply - Fastify reply object
     */
    async downloadReportPDF(request, reply) {
        try {
            const report = await this.reportService.generateReport({
                type: request.body.type,
                filters: request.body.filters,
                user: request.user
            });

            const pdfBuffer = await report.generatePDF();
            
            return reply
                .code(200)
                .header('Content-Type', 'application/pdf')
                .header('Content-Disposition', `attachment; filename=reporte_${report._data.type}_${Date.now()}.pdf`)
                .send(pdfBuffer);
                
        } catch (error) {
            console.error('Error generating PDF report:', error);
            return reply.code(500).send({
                success: false,
                message: 'Error al generar PDF del reporte',
                error: error.message
            });
        }
    }
}