import { FreshContext } from "$fresh/server.ts";
import { supabaseClient } from "../supabaseClient.ts"
import { getCookies } from "$std/http/cookie.ts";

export interface AuthState {
  token: string | null;
}

export async function handler(
  req: Request,
  ctx: FreshContext<AuthState>,
) {
  const supabaseCredentials = getCookies(req.headers)["supabaseCredentials"];
  if (!supabaseCredentials) {
    return ctx.next();
  }

  const { data, error } = await supabaseClient.auth.getUser(supabaseCredentials);
  if (error) {
    console.log(error.message);
    ctx.state.token = null;
  } else {
    ctx.state.token = supabaseCredentials;
  }

  return await ctx.next();
}