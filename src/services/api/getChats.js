import axios from "axios";
import log from "../log";

/** @param {string} matchId  */
export default async function getChats(matchId) {
  log.debug("Retrieving chat messages", { matchId });

  const req = await axios.get(
    "https://comms-93954675246.asia-southeast2.run.app/chats",
    {
      params: {
        matchId,
      },
    }
  );

  log.debug("Chat messages retrieved.", req?.data);

  return req?.data || [];
}
