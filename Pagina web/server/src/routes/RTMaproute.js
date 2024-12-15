const { handleWebSocketConnection } = require('../controllers/RTMapController');

const setupWebSocketRoutes = (server) => {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ server });

    wss.on('connection', handleWebSocketConnection);
};

module.exports = setupWebSocketRoutes;
