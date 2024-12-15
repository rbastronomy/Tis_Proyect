const subscribers = new Map();

const addSubscriber = (ws, clientId) => {
    subscribers.set(ws, clientId);
    console.log(`Client ${clientId} subscribed.`);
};

const removeSubscriber = (ws) => {
    subscribers.delete(ws);
    console.log('Client disconnected.');
};

const broadcastLocationUpdate = (locationData) => {
    for (const [ws] of subscribers) {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'location-update', payload: locationData }));
        }
    }
};

module.exports = { addSubscriber, removeSubscriber, broadcastLocationUpdate };
