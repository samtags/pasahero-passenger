import { useEffect, useState } from "react";
import supabase from "../../../services/supabase";
import log from "../../../services/log";

/**
 *
 * @param {string} match_id
 */
export default function useIncomingMessages(match_id) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!match_id) {
      return () => {
        log.debug(
          "No match id provided in the incoming message hook. Nothing to subscribe."
        );
      };
    }

    const channel = supabase
      .channel(`matches.${match_id}.messages`)
      .on(
        "broadcast",
        {
          event: "matches_messages",
        },
        (data) => {
          log.debug("Incoming message", data);
          if (data?.payload) {
            setMessage(data?.payload);
          }
        }
      )

      .subscribe();

    log.debug("Subscribed to incoming messages", { match_id });

    return () => {
      channel.unsubscribe();
      log.debug("Unsubscribed from incoming messages", { match_id });
    };
  }, []);

  return message;
}
