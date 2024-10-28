import { FreshContext } from "$fresh/server.ts";
import { supabaseClient } from "../../supabaseClient.ts"
import { AuthState } from '../_middleware.ts';

export async function handler(
  _req: Request,
  ctx: FreshContext<AuthState>,
) {
  const headers = new Headers();
  headers.set('location', '/signin');

  if (!ctx.state.token) {
    return new Response(null, {
      status: 303,
      headers,
    });
  }
  const { error } = await supabaseClient.auth.getUser(ctx.state.token);

  if (error) {
    return new Response(null, {
      status: 303,
      headers,
    });
  }
  return ctx.next();
}