const RealTimeTrackingService = require('../services/RealTimeTrackingService.js');

class RealTimeTrackingController {
    static handleConnection(ws, req) {
        console.log('Nueva conexión establecida');

        ws.send(JSON.stringify({ message: "Conexión exitosa" }));

        ws.on('message', (data) => {
            const { type, payload } = JSON.parse(data);
            if (type === 'update_location') {
                RealTimeTrackingService.updateLocation(payload);
            }
        });

        ws.on('close', () => {
            console.log('Conexión cerrada');
        });
    }
}

module.exports = RealTimeTrackingController;
