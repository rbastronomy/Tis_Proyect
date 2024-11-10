export class MapsController {
  async getDirections(origin, destination) {
    if (!process.env.GOOGLE_MAPS_API_KEY) {
      throw new Error('Google Maps API key is not configured')
    }

    try {
      const apiKey = process.env.GOOGLE_MAPS_API_KEY
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${encodeURIComponent(origin)}` +
        `&destination=${encodeURIComponent(destination)}` +
        `&key=${apiKey}`
      )
      
      if (!response.ok) {
        throw new Error(`Google Maps API responded with status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.status !== 'OK') {
        throw new Error(`Directions API error: ${data.status}`)
      }

      return data
    } catch (error) {
      console.error('Error fetching directions:', error)
      throw error
    }
  }
} 