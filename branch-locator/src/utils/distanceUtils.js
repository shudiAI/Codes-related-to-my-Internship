const EARTH_RADIUS_KM = 6371.0088;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export function calculateDistance(pointA, pointB) {
  const latitudeDelta = toRadians(pointB.latitude - pointA.latitude);
  const longitudeDelta = toRadians(pointB.longitude - pointA.longitude);
  const latitudeA = toRadians(pointA.latitude);
  const latitudeB = toRadians(pointB.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeA) * Math.cos(latitudeB) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function formatDistance(distance) {
  return `${distance.toFixed(1)} km`;
}
