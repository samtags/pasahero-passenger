import { useEffect, useState } from "react";
import supabase from "../../../services/supabase";
import getWallet from "../../../services/api/getWallet";

/** @param {string} id */
export default function useWallet(id) {
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (id) {
      getWallet(id).then((res) => {
        setBalance(res);
      });
    }
  }, [id]);

  useEffect(() => {
    const channel = supabase
      .channel("changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "wallet",
          filter: `user_id=eq.${id}`,
        },
        (payload) => {
          console.debug("Balance", payload.new);
          setBalance(payload.new);
        }
      )
      .subscribe();

    console.debug("Subscribed to wallet");

    return () => {
      channel.unsubscribe();
      console.debug("Unsubscribed from wallet");
    };
  }, []);

  return balance;
}
