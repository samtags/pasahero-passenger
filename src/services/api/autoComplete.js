import axios from "axios";
import Const from "expo-constants";

const key = Const.expoConfig.extra.googleApiKey;

/**
 *s
 * @param {string} input
 */
export default async function autoComplete(input) {
  return await axios.get(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json",
    {
      params: {
        key,
        input,
        components: "country:PH",
      },
    }
  );
}
