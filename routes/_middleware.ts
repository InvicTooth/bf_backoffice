import { FreshContext } from "$fresh/server.ts";
import { supabase } from "../supabase/supabase.ts"
import { getCookies } from "$std/http/cookie.ts";
import type { AuthState } from "../providers/AuthState.ts";


export async function handler(
  req: Request,
  ctx: FreshContext<AuthState>,
) {
  if (ctx.destination != "route") return ctx.next();

  const cookie = getCookies(req.headers);
  const supabaseAccessToken = cookie['supabase_access_token'];
  const supabaseRefreshToken = cookie['supabase_refresh_token'];
  // console.log("supabase access token : ", supabaseAccessToken);
  // console.log("supabase refresh token : ", supabaseRefreshToken);
  if (!supabaseAccessToken || !supabaseRefreshToken) {
    ctx.state.session = null;
    return ctx.next();
  }
  
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    ctx.state.session = data.session;
    return ctx.next();
  } else {
    // console.log('session unlinked : ',currentSessionResponse.error?.message);
    ctx.state.session = null;
    const { data } = await supabase.auth.setSession({ access_token: supabaseAccessToken, refresh_token: supabaseRefreshToken });
    if (data.session) {
      ctx.state.session = data.session;
    }
  }

  return ctx.next();
}