import { defineRoute } from "$fresh/server.ts";
import AdminTopBar from "../../../components/admin/AdminTopBar.tsx";
import CharactersList from "../../../components/admin/CharactersList.tsx";
import { Character } from "../../../entities/character.ts";
import CharacterEditor from "../../../islands/admin/CharacterEditor.tsx";
import { supabase } from "../../../supabase/supabase.ts";

export default defineRoute(async (_req, ctx) => {
  const charactersListResponse = await supabase.from("characters").select("id, name").order('id', { ascending: false });
  const characters = charactersListResponse?.data;
  let character: Character = {
    name: "",
    avatar_url: '',
    small_avatar_url: '',
    metadata: {
        model: 'gpt-4o-mini',
        provider: 'openai',
        kakaoBotId: '',
        assistantId: '',
      }
  };
  if (ctx.params.id != 'new') {
    const { data } = await supabase
      .from('characters')
      .select('*')
      .eq('id', parseInt(ctx.params.id))
      .single();
    if (data) character = data as unknown as Character;
  }
  return (
    <>
      <CharactersList characters={characters}></CharactersList>
      <div class="flex flex-col flex-grow overflow-auto">
        <AdminTopBar ></AdminTopBar>
        <CharacterEditor id={ctx.params.id} character={character} key={ctx.params.id} />
      </div>
    </>
  );
});