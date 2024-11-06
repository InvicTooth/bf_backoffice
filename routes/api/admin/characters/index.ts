import { Handlers } from "$fresh/server.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase, uploadToStorage } from "../../../../supabase/supabase.ts";

export const handler: Handlers = {
  // 스토리 삽입
  async POST(req) {
    const formData = await req.formData();
    const dateTimePath = new Date().toISOString().replace(/[-:.]/g, '');

    try {
      const avatarFile = formData.get("avatar") as File;
      const smallAvatarFile = formData.get("smallAvatar") as File;
      const characterData = JSON.parse(formData.get("characterData") as string);

      // 썸네일 업로드
      if (avatarFile?.size > 0) {
        const avatarUrl = await uploadToStorage(avatarFile, 'characters', dateTimePath);
        characterData.avatar_url = avatarUrl;
      }

      // 결말 이미지 업로드
      if (smallAvatarFile?.size > 0) {
        const smallAvatarUrl = await uploadToStorage(smallAvatarFile, 'characters', dateTimePath);
        characterData.small_avatar_url = smallAvatarUrl;
      }

      // DB에 저장
      const { error } = await supabase
        .from("characters")
        .insert(characterData);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }));
    } catch (error:unknown) {
      return new Response(JSON.stringify({ error: (error as PostgrestError).message }), {
        status: 400,
      });
    }
  }
};
