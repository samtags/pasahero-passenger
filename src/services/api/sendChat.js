import axios from "axios";
import log from "../log";

/**
 *
 * @param {Payload} payload
 */
export default async function sendChat(payload) {
  const req = await axios.post(
    "https://comms-93954675246.asia-southeast2.run.app/chat",
    payload
  );

  if (req.data?.clientRef) {
    log.debug("Successfully sent chat.", { payload, response: req.data });
  } else {
    log.warn("Unable to send chat.", { payload, response: req.data });
    return Promise.reject(req.data);
  }
}

/**
 * @typedef Payload
 * @property {string} matchId
 * @property {string} senderId
 * @property {string} receiverId
 * @property {string} message
 * @property {string | undefined} driverProfileId
 */
