import supabase from "../supabase";

/** @param {string} id  */
export default async function getWallet(id) {
  const { data, error } = await supabase
    .from("wallet")
    .select("id, user_id, balance")
    .eq("user_id", id)
    .single();

  if (error) {
    return {
      balance: 0,
    };
  }

  return data;
}
