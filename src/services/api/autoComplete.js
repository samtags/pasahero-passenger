import axios from "../axios";

/**
 *s
 * @param {string} input
 */
export default async function autoComplete(input) {
  const response = await axios.get(
    "https://passenger-93954675246.asia-southeast1.run.app/locations/autocomplete",
    {
      params: {
        q: input,
      },
    },
  );

  const predictions = normalizePredictions(response?.data);

  return {
    ...response,
    data: {
      predictions,
    },
  };
}

function normalizePredictions(data = []) {
  if (!Array.isArray(data)) return [];

  return data.map((item) => {
    const placeId = item?.place_id || item?.PlaceId || item?.id || "";
    const text = item?.description || item?.Description || item?.Text || "";
    const parts = String(text).split(",").map((part) => part.trim());
    const mainText = item?.structured_formatting?.main_text || parts[0] || "";

    return {
      ...item,
      place_id: placeId,
      description: text,
      structured_formatting: {
        ...item?.structured_formatting,
        main_text: mainText,
      },
    };
  });
}
