import axios from "axios";
import Const from "expo-constants";

const key = Const.expoConfig.extra.googleApiKey;

/** @param {string} latlng */
export default async function reverseGeocode(latlng) {
  return await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
    params: {
      key,
      latlng,
      result_type: "street_address|route|colloquial_area|establishment|lodging",
    },
  });
}
