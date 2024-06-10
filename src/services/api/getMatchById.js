import log from "../log";
import supabase from "../supabase";

/**
 *
 * @param {string} id
 */
export default async function getMatchById(id) {
  const { error, data } = await supabase
    .from("matches")
    .select("id, first_point, last_point, driver_id, initial_driver_location")
    .eq("id", id)
    .single();

  if (error) {
    log.error("Unable to get match details", { error, id });
    return undefined;
  }

  return data;
}
