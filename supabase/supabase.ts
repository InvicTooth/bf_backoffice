// supabaseClient.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export { supabase };

export async function uploadToStorage(file: File, bucket:string, path: string) {
  // const filename = `${crypto.randomUUID()}-${file.name}`;
  const filename = `${crypto.randomUUID()}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(`${path}/${filename}`, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(`${path}/${filename}`);

  // return `${path}/${filename}`;
  return publicUrl;
}

export function getStorageRelativeUrl(bucket: string, path: string) {
  return path.replace(`${supabaseUrl}/storage/v1/object/public/${bucket}/`, '');
}