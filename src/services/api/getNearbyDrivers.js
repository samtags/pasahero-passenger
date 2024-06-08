import axios from "axios";
import log from "../log";

export default async function getNearbyDrivers(latitude, longitude) {
  const req = await axios
    .get("https://supply-2h6pkmfalq-et.a.run.app", {
      params: {
        latitude,
        longitude,
        km: 2.5,
      },
    })
    .catch((err) => {
      log.debug("Unable to get nearby drivers", { error: err });
      return { data: [] };
    });

  return req.data;
}
