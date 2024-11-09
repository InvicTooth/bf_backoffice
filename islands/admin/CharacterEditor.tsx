import { useSignal } from "@preact/signals";
import { Character } from "../../entities/character.ts";

export default function CharacterEditor({ id, character }: { id: string, character: Character }) {
  const name = useSignal(character?.name);
  const avatarFile = useSignal<File | null>(null);
  const avatarUrl = useSignal(character?.avatar_url ?? '');
  const smallAvatarFile = useSignal<File | null>(null);
  const smallAvatarUrl = useSignal(character?.small_avatar_url ?? '');
  const assistantId = useSignal(character?.metadata?.assistantId);
  const kakaoBotId = useSignal(character?.metadata?.kakaoBotId);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const saveCharacter = async () => {
    try {
      loading.value = true;
      error.value = null;
      const formData = new FormData();
      // 기본 데이터
      const characterData: Character = {
        name: name.value ?? '',
        avatar_url: !avatarFile.value ? avatarUrl.value : '',
        small_avatar_url: !smallAvatarFile.value ? smallAvatarUrl.value : '',
        metadata: {
          model: 'gpt-4o-mini',
          provider: 'openai',
          kakaoBotId: assistantId.value ?? '',
          assistantId: kakaoBotId.value ?? '',
        }
      };
      formData.append("characterData", JSON.stringify(characterData));
      console.log(JSON.stringify(characterData));
      // 이미지 파일들 추가
      if (avatarFile.value)
        formData.append("avatar", avatarFile.value);
      
      if (smallAvatarFile.value)
        formData.append("smallAvatar", smallAvatarFile.value);

      // API 호출
      const url = id != 'new' ? `/api/admin/characters/${id}` : "/api/admin/characters";
      const method = id != 'new' ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        body: formData
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      // 성공 후 리디렉션
      globalThis.location.href = `/admin/characters/`;
    } catch (err:any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const deleteCharacter = async () => {
    if (id == 'new') return;
    if (!confirm("정말로 이 스토리를 삭제하시겠습니까?")) return;
    try {
      loading.value = true;
      const response = await fetch(`/api/admin/characters/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      globalThis.location.href = `/admin/characters/`;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  const handleAvatarUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    avatarFile.value = file;
    avatarUrl.value = URL.createObjectURL(file);
  };

  const handleSmallAvatarUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    smallAvatarFile.value = file;
    smallAvatarUrl.value = URL.createObjectURL(file);
  };


  if (loading.value) {
    return <div class="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div class="max-w-4xl mx-auto p-6">
      {error.value && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error.value}
        </div>
      )}
      
      {/* 캐릭터 이름 */}
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium mb-2">캐릭터 이름</label>
          <input
            type="text"
            value={name.value}
            onInput={(e) => name.value = ((e.target as HTMLInputElement).value)}
            class="w-full p-2 border rounded"
          />
        </div>

        {/* openai 어시스턴트 id */}
        <div>
          <label class="block text-sm font-medium mb-2">openai 어시스턴트 id</label>
          <input
            type="text"
            value={assistantId.value}
            onInput={(e) => assistantId.value = ((e.target as HTMLInputElement).value)}
            class="w-full p-2 border rounded"
          />
        </div>

        {/* 카카오 봇 id */}
        <div>
          <label class="block text-sm font-medium mb-2">카카오 봇 id</label>
          <input
            type="text"
            value={kakaoBotId.value}
            onInput={(e) => kakaoBotId.value = ((e.target as HTMLInputElement).value)}
            class="w-full p-2 border rounded"
          />
        </div>

        {/* 아바타 이미지 업로드 */}
        <div>
          <label class="block text-sm font-medium mb-2">아바타 이미지</label>
          <div class="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              class="hidden"
              id="thumbnail-upload"
            />
            <label
              for="thumbnail-upload"
              class="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              파일 선택
            </label>
            {avatarUrl.value.length > 0 && (
              <img src={avatarUrl.value} alt="이미지 미리보기" class="w-24 h-24 object-cover rounded" />
            )}
          </div>
        </div>

        {/* 작은 아바타 이미지 업로드 */}
        <div>
          <label class="block text-sm font-medium mb-2">작은 이미지</label>
          <div class="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleSmallAvatarUpload}
              class="hidden"
              id="ending-upload"
            />
            <label
              for="ending-upload"
              class="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              파일 선택
            </label>
            {smallAvatarUrl.value.length > 0 && (
              <img src={smallAvatarUrl.value} alt="작은 이미지 미리보기" class="w-24 h-24 object-cover rounded" />
            )}
          </div>
        </div>

        {/* 저장 버튼 추가 */}
        <div class="flex justify-end">
          <button
            onClick={saveCharacter}
            disabled={loading.value}
            class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.value ? "저장 중..." : (id != 'new' ? "수정하기" : "저장하기")}
          </button>
          
          {id != 'new' && <button
            onClick={deleteCharacter}
            disabled={loading.value}
            class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4 disabled:opacity-50"
          >
            {loading.value ? "저장 중..." : "삭제하기"}
          </button>}
        </div>
      </div>
    </div>
  );
}