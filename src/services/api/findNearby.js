import axios from "axios";

/**
 *
 * @param {Payload} param0
 * @returns
 */
export default async function findNearby({ user_id, first_point, last_point }) {
  try {
    const res = await axios.post("https://demand-2h6pkmfalq-et.a.run.app", {
      user_id,
      latitude: first_point.latitude,
      longitude: first_point.longitude,
      first_point,
      last_point,
    });

    return res?.data;
  } catch (error) {
    // todo: log
    return null;
  }
}

/**
 *
 * @typedef Transit
 * @property {latitude} number
 * @property {longitude} number
 * @property {short_address} string
 * @property {long_address} string
 *
 * @typedef Payload
 * @property {string} user_id
 * @property {Transit} first_point
 * @property {Transit} last_point
 */
