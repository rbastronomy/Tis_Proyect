/**
 * Calculates the distance between two points in meters using the Haversine formula
 * @param {Object} point1 - First point with lat and lng properties
 * @param {Object} point2 - Second point with lat and lng properties
 * @returns {number} Distance in meters
 */
export function calculateDistance(point1, point2) {
  if (!point1 || !point2) return 0;
  
  const R = 6371e3; // Earth's radius in meters
  const φ1 = point1.lat * Math.PI/180;
  const φ2 = point2.lat * Math.PI/180;
  const Δφ = (point2.lat - point1.lat) * Math.PI/180;
  const Δλ = (point2.lng - point1.lng) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

/**
 * Finds the closest point in a route to a given position
 * @param {Object} point - Current position with lat and lng
 * @param {Array} points - Array of route points
 * @returns {number} Index of the closest point
 */
export function findClosestPointIndex(point, points) {
  if (!points?.length) return -1;
  
  let minDist = Infinity;
  let closestIndex = 0;

  points.forEach((routePoint, index) => {
    const dist = calculateDistance(point, routePoint);
    if (dist < minDist) {
      minDist = dist;
      closestIndex = index;
    }
  });

  return closestIndex;
} 