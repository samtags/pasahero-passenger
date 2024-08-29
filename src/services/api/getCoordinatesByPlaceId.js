import axios from "axios";
import Const from "expo-constants";

const key = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

/**
 *s
 * @param {string} place_id
 */
export default async function getCoordinatesByPlaceId(place_id) {
  return await axios.get(
    "https://maps.googleapis.com/maps/api/place/details/json",
    {
      params: {
        key,
        place_id,
      },
    }
  );
}

export function extractCoordinates(data) {
  return data?.map((item) => ({
    placeId: item.place_id,
    shortAddress: item.structured_formatting?.main_text,
    longAddress: item.description,
  }));
}
