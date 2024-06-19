import { useEffect, useState } from "react";
import log from "../../log";
import subscribe from "../subscribe";
import supabase from "../index";

/**
 *
 * @param {*} id
 * @returns { Match | undefined }
 */
export default function useMatch(id) {
  const [match, setMatch] = useState(undefined);

  if (!id) return undefined;

  useEffect(() => {
    (async () => {
      if (id) {
        const match = await handleGetMatch(id);
        if (match) setMatch(match);
      }
    })();

    const unsubscribe = subscribe("matches", id, (data) => {
      if (data) {
        setMatch(data);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [id]);

  return match;
}

async function handleGetMatch(id) {
  const { data, error } = await supabase
    .from("matches")
    .select(
      "id, driver_id, status, first_point, last_point, services, estimatePreview, driver_id, service_charge, profile_id, platform"
    )
    .eq("id", id)
    .single();

  if (error) {
    log.debug("Unable to get match details", { error, id });
    return;
  }

  return data;
}

/**
 *
 * @typedef Match
 * @property {string} id
 * @property {string} created_at
 * @property {string} passenger_id
 * @property {string} driver_id
 * @property { "REQUESTED" | "FOUND" | "ARRIVED" | "STARTED" | "COMPLETED" | "PASSENGER_CANCELED" | "DRIVER_CANCELED" } status
 * @property {"JoyRideMcTaxi" | "MoveItMotoTaxi" | "AngkasPassenger"} services
 * @property {string} estimatePreview
 * @property {string} driver_id
 * @property {string} profile_id
 * @property {string} platform
 */
