const RTMapService = require('../services/RTMapService');

const handleWebSocketConnection = (ws, req) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'subscribe') {
            RTMapService.addSubscriber(ws, data.clientId);
        }
    });

    ws.on('close', () => {
        RTMapService.removeSubscriber(ws);
    });
};

module.exports = { handleWebSocketConnection };
