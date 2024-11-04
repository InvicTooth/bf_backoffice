// routes/api/stories/index.ts
import { Handlers } from "$fresh/server.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, uploadToStorage } from "../../../../supabase/supabase.ts";

export const handler: Handlers = {
  // 스토리 삽입
  async POST(req) {
    const formData = await req.formData();
    const dateTimePath = new Date().toISOString().replace(/[-:.]/g, '');

    try {
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
        
        sceneFiles.forEach((_file, index) => {
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

      // DB에 저장
      const { error } = await supabase
        .from("stories")
        .insert(storyData)
        .select();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }));
    } catch (error:unknown) {
      return new Response(JSON.stringify({ error: (error as PostgrestError).message }), {
        status: 400,
      });
    }
  }
};
