// Document https://fresh.deno.dev/docs/concepts/routes#define-helper

import { defineRoute } from "$fresh/server.ts";
import { supabase } from "../../../supabase/supabase.ts";

export default defineRoute(async (req, ctx) => {
  const {data, error} = await supabase.from("stories").select("*");

  if (error) {
    return (
      <div class="page">
        <h1>{error.message}</h1>
      </div>
    );
  }

  return (
    <div class="page">
      {data.map((story) => (
        <div key={story.id}>
          <h2>{story.title}</h2>
          <p>{story.content}</p>
        </div>
      ))}
    </div>
  );
});