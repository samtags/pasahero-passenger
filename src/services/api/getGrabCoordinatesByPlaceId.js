import axios from "axios";

/**
 *
 * @param {string} place_id
 */
export default async function getGrabCoordinatesByPlaceId(place_id) {
  const response = await axios.get(
    "https://maps-93954675246.asia-southeast2.run.app/grab-maps/get_place",
    {
      params: {
        place_id,
      },
    }
  );

  return response.data;
}

export function extractCoordinates(data) {
  return data?.map((item) => ({
    placeId: item.place_id,
    shortAddress: item.structured_formatting?.main_text,
    longAddress: item.description,
  }));
}
