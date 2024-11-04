import { FreshContext } from "$fresh/server.ts";
import type { AuthState } from "../../providers/AuthState.ts";


export function handler(
  _req: Request,
  ctx: FreshContext<AuthState>,
) {
  const headers = new Headers();
  headers.set('location', '/');
  // console.log(JSON.stringify(ctx.state?.session?.user));
  if (!ctx.state?.session) {
    return new Response(null, {
      status: 303,
      headers,
    });
  }

  const user = ctx.state.session.user;
  if ((user.email != 'pjhkaka@gmail.com') && (user.email != '0lovedodam0@gmail.com')) {
    return new Response(null, {
      status: 303,
      headers,
    });
  }
  return ctx.next();
}