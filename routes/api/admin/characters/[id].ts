import { Handlers } from "$fresh/server.ts";
import type { PostgrestError } from "@supabase/supabase-js";
import { getStorageRelativeUrl, supabase, uploadToStorage } from "../../../../supabase/supabase.ts";
import { Character } from "../../../../entities/character.ts";

export const handler: Handlers = {
  // 캐릭터 수정
  async PUT(req, ctx) {
    const id = ctx.params.id;
    const formData = await req.formData();
    const dateTimePath = new Date().toISOString().replace(/[-:.]/g, '');
    
    try {
      // 이미지 파일들 처리
      const avatarFile = formData.get("avatar") as File;
      const smallAvatarFile = formData.get("smallAvatar") as File;
      const characterData = JSON.parse(formData.get("characterData") as string);

      // 아바타 업로드
      if (avatarFile?.size > 0) {
        const avatarUrl = await uploadToStorage(avatarFile, 'characters', dateTimePath);
        characterData.avatar_url = avatarUrl;
      }

      // 결말 이미지 업로드
      if (smallAvatarFile?.size > 0) {
        const smallAvatarUrl = await uploadToStorage(smallAvatarFile, 'characters', dateTimePath);
        characterData.small_avatar_url = smallAvatarUrl;
      }

      // DB 업데이트
      let { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', id)
        .single()!;
      const oldData = { ...data } as Character;

      ({ data, error } = await supabase
        .from("characters")
        .update(characterData)
        .eq("id", id)
        .select()
        .single());
      const newData = { ...data } as Character;
      // 이전 파일 삭제
      const toDelete: string[] = [];
      if (oldData?.avatar_url && oldData.avatar_url !== newData?.avatar_url)
        toDelete.push(getStorageRelativeUrl('characters', oldData.avatar_url));
      if (oldData?.small_avatar_url && oldData.small_avatar_url !== newData?.small_avatar_url)
      toDelete.push(getStorageRelativeUrl('characters', oldData.small_avatar_url));
      await supabase.storage.from('characters').remove(toDelete);

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
        .from('characters')
        .delete()
        .eq('id', id)
        .select()
        .single();
      if (error)
        throw error;
      const character = data as Character;
      const toDelete: string[] = [];
      if (character?.avatar_url)
        toDelete.push(character?.avatar_url);
      if(character?.small_avatar_url)
        toDelete.push(character?.small_avatar_url);
      await supabase.storage.from('characters').remove(toDelete.map(str => getStorageRelativeUrl('characters', str)));
      return new Response(JSON.stringify({ success: true }));
    } catch (err: unknown) {
      return new Response(JSON.stringify({ error: (err as PostgrestError).message }));
    }
  }
};