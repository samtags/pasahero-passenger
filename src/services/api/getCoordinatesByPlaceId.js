import axios from "../axios";

/**
 *s
 * @param {string} place_id
 */
export default async function getCoordinatesByPlaceId(place_id) {
  const response = await axios.get(
    "https://passenger-93954675246.asia-southeast1.run.app/locations/search",
    {
      params: {
        id: place_id,
      },
    },
  );

  const location = normalizeLocation(response?.data);

  return {
    ...response,
    data: {
      ...response?.data,
      status: location ? "OK" : "ZERO_RESULTS",
      result: {
        geometry: {
          location: location || { lat: 0, lng: 0 },
        },
      },
    },
  };
}

export function extractCoordinates(data) {
  return data?.map((item) => ({
    placeId: item.place_id,
    shortAddress: item.structured_formatting?.main_text,
    longAddress: item.description,
  }));
}

function normalizeLocation(data) {
  const point =
    data?.Geometry?.Point ||
    data?.Place?.Geometry?.Point ||
    data?.result?.geometry?.location;

  if (!point) return null;

  if (Array.isArray(point)) {
    const [lng, lat] = point;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }

    return null;
  }

  const lat = Number(point?.lat);
  const lng = Number(point?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return { lat, lng };
}
