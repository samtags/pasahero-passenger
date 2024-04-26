import axios from "axios";

export default async function findNearby({ user_id, latitude, longitude }) {
  try {
    const res = await axios.post("https://demand-2h6pkmfalq-et.a.run.app", {
      user_id,
      latitude,
      longitude,
    });

    return res?.data;
  } catch (error) {
    // todo: log
    return null;
  }
}
