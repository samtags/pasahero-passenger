import supabase from "../supabase";

export default async function getMatches(id) {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, passenger_id, created_at, status")
    .eq("passenger_id", id)
    .neq("status", "DONE");

  if (error) return [];

  return matches || [];
}
