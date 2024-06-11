export default function calculateBoundingBox(coordinates) {
  let minLat, minLon, maxLat, maxLon;

  coordinates.forEach((point) => {
    const { latitude, longitude } = point;

    if (minLat === undefined || latitude < minLat) {
      minLat = latitude;
    }

    if (minLon === undefined || longitude < minLon) {
      minLon = longitude;
    }

    if (maxLat === undefined || latitude > maxLat) {
      maxLat = latitude;
    }

    if (maxLon === undefined || longitude > maxLon) {
      maxLon = longitude;
    }
  });

  return [
    [minLon, minLat],
    [maxLon, maxLat],
  ];
}
