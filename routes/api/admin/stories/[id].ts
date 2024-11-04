// routes/api/stories/[id].ts
import { Handlers } from "$fresh/server.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import { getStorageRelativeUrl, supabase, uploadToStorage } from "../../../../supabase/supabase.ts";
import type { Story } from "../../../../entities/story.ts";

export const handler: Handlers = {
  // 스토리 수정
  async PUT(req, ctx) {
    const id = ctx.params.id;
    const formData = await req.formData();
    const dateTimePath = new Date().toISOString().replace(/[-:.]/g, '');
    
    try {
      // 이미지 파일들 처리
      const thumbnailFile = formData.get("thumbnail") as File;
      const endingFile = formData.get("endingImage") as File;
      const sceneFiles = formData.getAll("sceneImages") as File[];
      const storyData = JSON.parse(formData.get("storyData") as string);

      if (storyData.unlockable_character_id == "") storyData.unlockable_character_id = null;

      // 썸네일 업로드
      if (thumbnailFile?.size > 0) {
        const thumbnail = await uploadToStorage(thumbnailFile, 'stories', dateTimePath);
        storyData.content.thumbnail = thumbnail;
      }

      // 씬 이미지 업로드
      if (sceneFiles?.length > 0) {
        const sceneUrls = await Promise.all(
          sceneFiles.map((file) => uploadToStorage(file, 'stories', dateTimePath))
        );
        
        // sceneUrls의 인덱스를 기반으로 새 이미지 URL 매핑
        sceneFiles?.forEach((_file, index) => {
          const sceneIndex = parseInt(formData.get(`sceneIndex_${index}`) as string);
          if (sceneUrls[index]) {
            storyData.content.scenes[sceneIndex].image = sceneUrls[index];
          }
        });
      }

      // 결말 이미지 업로드
      if (endingFile?.size > 0) {
        const endingImage = await uploadToStorage(endingFile, 'stories', dateTimePath);
        storyData.content.endingImage = endingImage;
      }

      // DB 업데이트
      let { data, error } = await supabase.from('stories').select('*').eq('id', id).single()!;
      const oldData = { ...data } as Story;

      ({ data, error } = await supabase.from("stories").update(storyData).eq("id", id).select().single());
      const newData = { ...data } as Story;
      // 이전 파일 삭제
      const toDelete: string[] = [];
      if (oldData?.content?.thumbnail && oldData?.content?.thumbnail != newData?.content?.thumbnail)
        toDelete.push(oldData?.content?.thumbnail);
      const oldScenes = oldData?.content?.scenes
        .map((scene) => getStorageRelativeUrl('stories', scene.image)) || [];
      const newScenes = newData?.content?.scenes
        .map((scene) => getStorageRelativeUrl('stories', scene.image)) || [];
      toDelete.push(...oldScenes.filter(scene => !newScenes.includes(scene)));
      if (oldData?.content?.endingImage && oldData?.content?.endingImage != newData?.content?.endingImage)
        toDelete.push(oldData?.content?.endingImage);
      await supabase.storage.from('stories').remove(toDelete);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }));
    } catch (error:unknown) {
      return new Response(JSON.stringify({ error: (error as PostgrestError).message }), {
        status: 400,
      });
    }
  },

  async DELETE(_req, ctx) {
    const id = ctx.params.id;
    try {
      const { data, error } = await supabase.from('stories').delete().eq('id', id).select().single();
      if (error)
        throw error;
      const story = data as Story;
      const toDelete: string[] = [];
      if (story?.content?.thumbnail)
        toDelete.push(story?.content?.thumbnail);
      toDelete.push(...story?.content?.scenes
        .map((scene) => getStorageRelativeUrl('stories', scene.image)) || []);
      if(story?.content?.endingImage)
        toDelete.push(story?.content?.endingImage);
      await supabase.storage.from('stories').remove(toDelete.map(str => getStorageRelativeUrl('stories', str)));
      return new Response(JSON.stringify({ success: true }));
    } catch (err: unknown) {
      return new Response(JSON.stringify({ error: (err as PostgrestError).message }));
    }
  }
};