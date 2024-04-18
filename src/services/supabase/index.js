import { createClient } from "@supabase/supabase-js";
import Const from "expo-constants";

const supabase = createClient(
  Const.expoConfig.extra.supabaseUrl,
  Const.expoConfig.extra.supabaseAnonKey
);

export default supabase;
