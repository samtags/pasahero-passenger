import axios from "axios";
import log from "../log";

export default async function rebook(match_id) {
  try {
    log.debug("Initiating find nearby drivers from rebook.", { match_id });

    const res = await axios.patch("https://demand-2h6pkmfalq-et.a.run.app", {
      match_id,
    });

    log.debug("Successfully rebook trip request.", { res });
    return res?.data;
  } catch (error) {
    log.debug("Unable to find nearby drivers from rebook", { error });
    return null;
  }
}
