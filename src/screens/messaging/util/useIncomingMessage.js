import { useEffect, useState } from "react";
import supabase from "../../../services/supabase";
import log from "../../../services/log";

/**
 *
 * @param {string} transit
 */
export default function useIncomingMessage(transit) {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const channel = supabase
      .channel("changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "msg",
          filter: `transit=eq.${transit}`,
        },
        (payload) => {
          log.debug("Incoming message", payload.new);
          setMessage(payload.new);
        }
      )
      .subscribe();

    log.debug("Subscribed to incoming messages");

    return () => {
      channel.unsubscribe();
      log.debug("Unsubscribed from incoming messages");
    };
  }, []);

  return message;
}
