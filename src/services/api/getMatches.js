import supabase from "../supabase";

export default async function getMatches(id) {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("id, passenger_id, created_at")
    .eq("passenger_id", id);

  if (error) return [];

  return matches || [];
}
