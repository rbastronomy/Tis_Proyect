const locations = {};

class RealTimeTrackingService {
    static updateLocation({ userId, lat, lng }) {
        locations[userId] = { lat, lng };
        console.log(`Ubicación actualizada: ${userId} -> (${lat}, ${lng})`);
    }

    static getAllLocations() {
        return locations;
    }
}

module.exports = RealTimeTrackingService;
