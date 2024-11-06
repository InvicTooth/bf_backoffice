import { defineRoute } from "$fresh/server.ts";
import AdminTopBar from "../../../components/admin/AdminTopBar.tsx";
import CharactersList from "../../../components/admin/CharactersList.tsx";
import { supabase } from "../../../supabase/supabase.ts";

export default defineRoute(async (_req, _ctx) => {
  const { data } = await supabase
    .from("characters")
    .select("id, name")
    .order('id', { ascending: false });

  return (
    <>
      <CharactersList characters={data}></CharactersList>
      <div class="flex flex-col flex-grow">
        <AdminTopBar></AdminTopBar>
        <div class="flex-grow p-6 overflow-auto bg-gray-200">
          <div class="grid grid-cols-3 gap-6">
            {data?.map((character) => (
              <a href={`/admin/characters/${character.id}`}>
                <div class="h-24 col-span-1 row-span-2 bg-white border border-gray-300 shadow-md flex items-center justify-center text-center" key={character.id}>
                  <h2>{character.name}</h2>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
});