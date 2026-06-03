import axios from "../axios";
import log from "../log";

/**
 *
 * @param {Payload} payload
 */
export default async function sendChat(payload) {
  const body = {
    message: payload?.message,
    message_id:
      payload?.message_id ||
      payload?.messageId ||
      payload?.clientRef ||
      payload?.id,
    sender_id: payload?.sender_id || payload?.senderId,
    receiver_id: payload?.receiver_id || payload?.receiverId,
    trip_id: payload?.trip_id || payload?.tripId || payload?.matchId || payload?.transit, // prettier-ignore
  };

  const req = await axios.post(
    "https://passenger-93954675246.asia-southeast1.run.app/notifications/chat",
    body,
  );

  if (req.status === 200) {
    log.debug("Successfully sent chat.", { payload: body, response: req.data });
    return req.data;
  }

  log.warn("Unable to send chat.", { payload: body, response: req.data });
  return Promise.reject(req.data);
}

/**
 * @typedef Payload
 * @property {string} message
 * @property {string} message_id
 * @property {string} sender_id
 * @property {string} receiver_id
 * @property {string} trip_id
 * @property {string} matchId
 * @property {string} senderId
 * @property {string} receiverId
 * @property {string | undefined} driverProfileId
 */
