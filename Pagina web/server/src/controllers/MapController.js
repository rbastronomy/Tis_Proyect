import process from 'process';

export class MapsController {
  async getDirections(req, reply) {
    console.log('Recibido consulta:', req.query);
    
    const { origin, destination } = req.query || {};

    if (!origin || !destination) {
      return reply.code(400).send({
        status: 'ERROR',
        message: 'Faltan los parámetros origin o destination.'
      });
    }

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.error('API key no configurada');
        return reply.code(500).send({
          status: 'ERROR',
          message: 'Error de configuración del servidor'
        });
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'REQUEST_DENIED') {
        console.error('Error de API key:', data);
        return reply.code(400).send({
          status: 'ERROR',
          message: 'Error de autenticación con el servicio de mapas'
        });
      }

      if (data.status === 'OK' && data.routes.length > 0) {
        const decodedCoordinates = this.decodePolyline(data.routes[0].overview_polyline.points);
        return reply.send({
          status: data.status,
          routes: data.routes.map(route => ({
            ...route,
            decodedCoordinates,
          })),
        });
      } else {
        return reply.code(200).send({ 
          status: data.status,
          message: 'No se encontró una ruta válida'
        });
      }
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      return reply.code(500).send({
        status: 'ERROR',
        message: 'Error Interno del Servidor'
      });
    }
  }

  decodePolyline(encoded) {
    if (!encoded) return [];
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({ 
        lat: lat / 1E5, 
        lng: lng / 1E5 
      });
    }
    return points;
  }
}

export const mapsController = new MapsController(); 