// Document https://fresh.deno.dev/docs/concepts/routes#define-helper

import { defineRoute } from "$fresh/server.ts";
import { supabase } from "../../../supabase/supabase.ts";

export default defineRoute(async (req, ctx) => {
  

  return (
    <div class="page">
      <h1>Hello</h1>
    </div>
  );
});