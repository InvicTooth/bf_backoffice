import { FreshContext } from "$fresh/server.ts";
import type { AuthState } from "../../components/providers/AuthState.ts";

export function handler(
  _req: Request,
  ctx: FreshContext<AuthState>,
) {
  
  const headers = new Headers();
  headers.set('location', '/signin');

  if (!ctx.state!.session) {
    return new Response(null, {
      status: 303,
      headers,
    });
  }

  return ctx.next();
}