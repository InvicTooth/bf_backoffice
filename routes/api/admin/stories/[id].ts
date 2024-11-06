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

      // 썸네일 업로드
      if (thumbnailFile?.size > 0) {
        const thumbnail = await uploadToStorage(thumbnailFile, 'stories', dateTimePath);
        storyData.content.thumbnailUrl = thumbnail;
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
            storyData.content.scenes[sceneIndex].imageUrl = sceneUrls[index];
          }
        });
      }

      // 결말 이미지 업로드
      if (endingFile?.size > 0) {
        const endingImage = await uploadToStorage(endingFile, 'stories', dateTimePath);
        storyData.content.endingImageUrl = endingImage;
      }

      // DB 업데이트
      let { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()!;
      const oldData = { ...data } as Story;

      ({ data, error } = await supabase
        .from("stories")
        .update(storyData)
        .eq("id", id)
        .select()
        .single());
      const newData = { ...data } as Story;
      // 이전 파일 삭제
      const toDelete: string[] = [];
      if (oldData?.content?.thumbnailUrl &&
        oldData?.content?.thumbnailUrl != newData?.content?.thumbnailUrl)
        toDelete.push(oldData?.content?.thumbnailUrl);
      const oldScenes = oldData?.content?.scenes
        .map((scene) => getStorageRelativeUrl('stories', scene.imageUrl)) || [];
      const newScenes = newData?.content?.scenes
        .map((scene) => getStorageRelativeUrl('stories', scene.imageUrl)) || [];
      toDelete.push(...oldScenes.filter(scene => !newScenes.includes(scene)));
      if (oldData?.content?.endingImageUrl &&
        oldData?.content?.endingImageUrl != newData?.content?.endingImageUrl)
        toDelete.push(oldData?.content?.endingImageUrl);
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
      const { data, error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error)
        throw error;
      const story = data as Story;
      const toDelete: string[] = [];
      if (story?.content?.thumbnailUrl)
        toDelete.push(story?.content?.thumbnailUrl);
      toDelete.push(...story?.content?.scenes
        .map((scene) => getStorageRelativeUrl('stories', scene.imageUrl)) || []);
      if(story?.content?.endingImageUrl)
        toDelete.push(story?.content?.endingImageUrl);
      await supabase.storage.from('stories').remove(toDelete.map(str => getStorageRelativeUrl('stories', str)));
      return new Response(JSON.stringify({ success: true }));
    } catch (err: unknown) {
      return new Response(JSON.stringify({ error: (err as PostgrestError).message }));
    }
  }
};