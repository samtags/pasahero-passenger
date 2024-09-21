import axios from "axios";
import log from "../log";
import { gb } from "../growthbook";

export default async function getNearbyDrivers(latitude, longitude) {
  const km = gb.getFeatureValue("passenger-nearby-drivers-radius-in-km", 1);
  const limit = gb.getFeatureValue("passenger-nearby-drivers-limit", 5);

  const url = "https://supply-2h6pkmfalq-et.a.run.app";
  const params = {
    latitude,
    longitude,
    km,
    limit,
  };

  log.debug("[Network] Getting nearby drivers.", { url, params });

  const req = await axios
    .get(url, {
      params,
    })
    .catch((err) => {
      log.debug("Unable to get nearby drivers", { error: err });
      return { data: [] };
    });

  log.debug("[Network] Nearby drivers retrieved.", { url, params, data: req.data }); // prettier-ignore

  return req.data;
}
