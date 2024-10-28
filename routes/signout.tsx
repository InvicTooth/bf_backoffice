import { Handlers } from "$fresh/server.ts";
import { deleteCookie } from "$std/http/cookie.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const headers = new Headers();
    deleteCookie(headers, "supabaseCredentials");
    headers.set('location', '/');
    return new Response(null, {
      status: 303,
      headers
    });
  },
};