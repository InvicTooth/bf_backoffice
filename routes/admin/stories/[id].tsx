import { defineRoute } from "$fresh/server.ts";
import AdminTopBar from "../../../components/admin/AdminTopBar.tsx";
import Stories from "../../../components/admin/StoriesList.tsx";
import type { Story } from "../../../entities/story.ts";
import StoryEditor from "../../../islands/admin/StoryEditor.tsx";
import { supabase } from "../../../supabase/supabase.ts";

export default defineRoute(async (_req, ctx) => {
  const storiesListResponse = await supabase.from("stories").select("id, title").order('id', { ascending: false });
  const stories = storiesListResponse?.data;
  let story: Story = {
    title: "",
    content: {
      thumbnailUrl: '',
      endingImageUrl: '',
      scenes: []
    },
    unlockable_character_id: null
  };
  if (ctx.params.id != 'new') {
    const { data } = await supabase
      .from('stories')
      .select('*')
      .eq('id', parseInt(ctx.params.id))
      .single();
    if (data) story = data as Story;
  }
  const charactersResponse = await supabase
    .from('characters')
    .select('id, name')
    .order('id', { ascending: false });
  const characters = charactersResponse?.data || [];
  return (
    <>
      <Stories stories={stories}></Stories>
      <div class="flex flex-col flex-grow overflow-auto">
        <AdminTopBar ></AdminTopBar>
        <StoryEditor id={ctx.params.id} story={story} characters={characters} key={ctx.params.id} />
      </div>
    </>
  );
});