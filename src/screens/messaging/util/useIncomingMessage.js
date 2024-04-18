import { useEffect, useState } from "react";
import supabase from "../../../services/supabase";

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
          console.debug("Incoming message", payload.new);
          setMessage(payload.new);
        }
      )
      .subscribe();

    console.debug("Subscribed to incoming messages");

    return () => {
      channel.unsubscribe();
      console.debug("Unsubscribed from incoming messages");
    };
  }, []);

  return message;
}
