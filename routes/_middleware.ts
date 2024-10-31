import { FreshContext } from "$fresh/server.ts";
import { supabase } from "../supabase/supabase.ts"
import { getCookies } from "$std/http/cookie.ts";
import type { AuthState } from "../components/providers/AuthState.ts";
import { delay } from "$std/async/delay.ts";
let x = 1;
export async function handler(
  req: Request,
  ctx: FreshContext<AuthState>,
) {
  const supabaseCredentials = getCookies(req.headers)["supabaseCredentials"];
  if (!supabaseCredentials) {
    return ctx.next();
  }
  
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.log(error?.message);
    ctx.state.session = null;
  } else {
    ctx.state.session = data.session;
  }
  console.log(`middleware root ${x++}`);
  return ctx.next();
}