import axios from "../axios";
import log from "../log";

/** @param {string} trip_id  */
export default async function getChats(trip_id) {
  log.debug("Retrieving chat messages for trip", { trip_id });

  const req = await axios.get(
    "https://passenger-93954675246.asia-southeast1.run.app/notifications/chat",
    {
      params: {
        trip_id,
      },
    },
  );

  log.debug("Chat messages retrieved.", req?.data);

  return normalizeMessages(req?.data || []);
}

function normalizeMessages(messages = []) {
  if (!Array.isArray(messages)) return [];

  return messages.map((message) => ({
    ...message,
    clientRef:
      message?.clientRef || message?.message_id || message?.messageId || "",
    matchId: message?.matchId || message?.trip_id || message?.tripId || "",
    senderId: message?.senderId || message?.sender_id || "",
    receiverId: message?.receiverId || message?.receiver_id || "",
  }));
}
