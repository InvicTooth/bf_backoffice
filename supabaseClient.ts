// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
