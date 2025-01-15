import { useSignal } from "@preact/signals";
import { Story } from "../../entities/story.ts";

export default function StoryEditor(
  { id, story, characters }: {
    id: string;
    story: Story;
    characters: { id: number; name: string }[];
  },
) {
  const title = useSignal(story?.title ?? "");
  const thumbnailUrl = useSignal(story?.content?.thumbnailUrl ?? "");
  const thumbnailFile = useSignal<File | null>(null);
  const endingImageUrl = useSignal(story?.content?.endingImageUrl ?? "");
  const endingImageFile = useSignal<File | null>(null);
  const scenes = useSignal<
    { imageUrl: string; imageFile: File | null; texts: string[] }[]
  >(
    story?.content?.scenes.map((scene) => ({
      imageUrl: scene?.imageUrl,
      imageFile: null,
      texts: scene.texts,
    })) || [],
  );
  const unlockable_character_id = useSignal(
    story?.unlockable_character_id ?? "",
  );
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const saveStory = async () => {
    try {
      loading.value = true;
      error.value = null;
      const formData = new FormData();
      // 기본 데이터
      const storyData: Story = {
        title: title.value,
        content: {
          thumbnailUrl: !thumbnailFile.value ? thumbnailUrl.value : "",
          scenes: scenes.value?.map((scene) => ({
            imageUrl: !scene.imageFile ? scene.imageUrl : "",
            texts: scene.texts,
          })),
          endingImageUrl: !endingImageFile.value ? endingImageUrl.value : "",
        },
        unlockable_character_id: unlockable_character_id.value == ""
          ? null
          : unlockable_character_id.value as number,
      };
      formData.append("storyData", JSON.stringify(storyData));

      // 이미지 파일들 추가
      if (thumbnailFile.value) {
        formData.append("thumbnail", thumbnailFile.value);
      }

      if (endingImageFile.value) {
        formData.append("endingImage", endingImageFile.value);
      }

      scenes.value.forEach((scene, index) => {
        if (scene.imageFile) {
          formData.append("sceneImages", scene.imageFile);
          formData.append(
            `sceneIndex_${formData.getAll("sceneImages").length - 1}`,
            index.toString(),
          );
        }
      });

      // API 호출
      const url = id != "new"
        ? `/api/admin/stories/${id}`
        : "/api/admin/stories";
      const method = id != "new" ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      // 성공 후 리디렉션
      globalThis.location.href = `/admin/stories/`;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const deleteStory = async () => {
    if (id == "new") return;
    if (!confirm("정말로 이 스토리를 삭제하시겠습니까?")) return;
    try {
      loading.value = true;
      const response = await fetch(`/api/admin/stories/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      globalThis.location.href = `/admin/stories/`;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // 썸네일 이미지 처리
  const handleThumbnailUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    thumbnailFile.value = file;
    thumbnailUrl.value = URL.createObjectURL(file);
  };

  // 씬 이미지 다중 선택 처리
  const handleSceneImages = (e: Event, sceneIndex: number) => {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const addedScenes = files.map((file) => ({
      imageUrl: URL.createObjectURL(file),
      imageFile: file,
      texts: [""],
    }));
    const newScenes = [...scenes.value];
    newScenes.splice(sceneIndex, 0, ...addedScenes);
    scenes.value = newScenes;
    input.files = null;
  };

  // 결말 이미지 처리
  const handleEndingImageUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    endingImageFile.value = file;
    endingImageUrl.value = URL.createObjectURL(file);
  };

  const handleUnlockableCharacterChange = (e: Event) => {
    const target = e.target as HTMLSelectElement;
    unlockable_character_id.value = parseInt(target.value);
  };

  const moveToPrevScene = (sceneIndex: number) => {
    const newScenes = [...scenes.value];
    const scene = newScenes[sceneIndex];
    newScenes[sceneIndex] = newScenes[sceneIndex - 1];
    newScenes[sceneIndex - 1] = scene;
    scenes.value = newScenes;
  }

  const moveToNextScene = (sceneIndex: number) => {
    const newScenes = [...scenes.value];
    const scene = newScenes[sceneIndex];
    newScenes[sceneIndex] = newScenes[sceneIndex + 1];
    newScenes[sceneIndex + 1] = scene;
    scenes.value = newScenes;
  }

  const removeScene = (sceIndex: number) => {
    const newScenes = [...scenes.value];
    newScenes.splice(sceIndex, 1);
    scenes.value = newScenes;
  };

  // 특정 씬에 텍스트 추가
  const addTextToScene = (sceneIndex: number) => {
    const newScenes = [...scenes.value];
    newScenes[sceneIndex].texts.push("");
    scenes.value = newScenes;
  };

  // 텍스트 수정
  const updateSceneText = (
    sceneIndex: number,
    textIndex: number,
    value: string,
  ) => {
    const newScenes = [...scenes.value];
    newScenes[sceneIndex].texts[textIndex] = value;
    scenes.value = newScenes;
  };

  // 텍스트 삭제
  const removeSceneText = (sceneIndex: number, textIndex: number) => {
    const newScenes = [...scenes.value];
    newScenes[sceneIndex].texts.splice(textIndex, 1);
    scenes.value = newScenes;
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

      <div class="space-y-6">
        {/* 제목 입력 */}
        <div>
          <label class="block text-xl font-bold mb-2">동화 제목</label>
          <input
            type="text"
            value={title.value}
            onInput={(e) => title.value = (e.target as HTMLInputElement).value}
            class="w-full p-2 border rounded"
          />
        </div>

        {/* 썸네일 이미지 업로드 */}
        <div class="border-t-4 pt-4">
          <div class="flex items-center justify-between space-x-4">
            <label class="block text-xl font-bold mb-2">썸네일 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              class="hidden"
              id="thumbnail-upload"
            />
            <label
              for="thumbnail-upload"
              class="flex items-center px-4 py-2 border rounded cursor-pointer text-blue-600 hover:text-blue-700"
            >
              +
            </label>
          </div>
          {thumbnailUrl.value.length > 0 && (
            <img
              src={thumbnailUrl.value}
              alt="썸네일 미리보기"
              class="w-full h-48 object-contain rounded"
            />
          )}
        </div>

        {/* 씬 이미지 다중 업로드 */}
        <div class="border-t-4 pt-4">
          <label class="block text-xl font-bold mb-2">씬 이미지 추가</label>
        </div>

        {/* 씬 목록 */}
        <div class="space-y-8">
          {scenes.value.map((scene, sceneIndex) => (
            <>
              <div key={`add_${sceneIndex}`}>
                {/* 씬 이미지 업로드 */}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleSceneImages(e, sceneIndex)}
                  class="hidden"
                  id={`scene-images-upload-${sceneIndex}`}
                />
                <label
                  for={`scene-images-upload-${sceneIndex}`}
                  class="flex items-center justify-center px-4 py-2 border rounded cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  +
                </label>
              </div>
              <div key={sceneIndex} class="flex space-x-6 p-4 border rounded">
                <div>
                  {sceneIndex > 0 && (
                    <button
                      onClick={() => moveToPrevScene(sceneIndex)}
                      class="flex items-center text-orange-600 hover:text-orange-700 border rounded px-4 py-2"
                    >
                      ↑
                    </button>
                  )}
                  {sceneIndex < scenes.value.length - 1 && (
                    <button
                      onClick={() => moveToNextScene(sceneIndex)}
                      class="flex items-center text-green-600 hover:text-green-700 border rounded px-4 py-2"
                    >
                      ↓
                    </button>
                  )}
                </div>
                {/* 씬 이미지 */}
                <div class="w-64 flex-shrink-0">
                  <img
                    src={scene.imageUrl}
                    alt={`씬 ${sceneIndex + 1}`}
                    class="w-full h-48 object-cover rounded"
                  />
                </div>

                {/* 텍스트 입력 영역 */}
                <div class="flex-grow space-y-4">
                  <div class="flex justify-between items-center">
                    <button
                      onClick={() => removeScene(sceneIndex)}
                      class="text-red-600 hover:text-red-700 border rounded px-4 py-2"
                    >
                      x
                    </button>
                    <h3 class="font-medium">씬 {sceneIndex + 1} 텍스트</h3>
                    <button
                      onClick={() => addTextToScene(sceneIndex)}
                      class="flex items-center text-blue-600 hover:text-blue-700 border rounded px-4 py-2"
                    >
                      +
                    </button>
                  </div>

                  {scene.texts.map((text, textIndex) => (
                    <div key={textIndex} class="flex space-x-2">
                      <textarea
                        value={text}
                        onInput={(e) =>
                          updateSceneText(
                            sceneIndex,
                            textIndex,
                            (e.target as HTMLTextAreaElement).value,
                          )}
                        class="p-2 border rounded w-96"
                        rows={3}
                      />
                      {textIndex != 0 && (<button
                        onClick={() =>
                          removeSceneText(sceneIndex, textIndex)}
                        class="text-red-600 hover:text-red-700 border rounded px-4 py-2"
                      >
                        x
                      </button>)}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ))}
          <div key={`add_last_scene}`}>
            {/* 씬 이미지 업로드 */}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleSceneImages(e, scenes.value.length)}
              class="hidden"
              id={`scene-images-upload-${scenes.value.length}`}
            />
            <label
              for={`scene-images-upload-${scenes.value.length}`}
              class="flex items-center justify-center px-4 py-2 border rounded cursor-pointer text-blue-600 hover:text-blue-700"
            >
              +
            </label>
          </div>
        </div>

        {/* 결말 이미지 업로드 */}
        <div class="border-t-4 pt-4">
          <div class="flex items-center justify-between space-x-4">
            <label class="block text-xl font-bold mb-2">결말 이미지</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleEndingImageUpload}
              class="hidden"
              id="ending-upload"
            />
            <label
              for="ending-upload"
              class="flex items-center px-4 py-2 border rounded cursor-pointer text-blue-600 hover:text-blue-700"
            >
              +
            </label>
          </div>
          {endingImageUrl.value.length > 0 && (
            <img
              src={endingImageUrl.value}
              alt="결말 이미지 미리보기"
              class="w-full h-48 object-contain rounded"
            />
          )}
        </div>

        <div class="border-t-4 pt-4">
          <label
            class="block text-xl font-bold mb-2"
            for="unlockable_character"
          >
            해제 가능한 캐릭터
          </label>
          <select
            id="unlockable_character"
            onChange={handleUnlockableCharacterChange}
            value={unlockable_character_id.value}
            class="w-full p-2 border rounded"
          >
            <option value="" selected>미선택</option>
            {characters?.map((character) => (
              <option value={character?.id ?? ""}>{character?.name}</option>
            ))}
          </select>
        </div>

        {/* 저장 버튼 추가 */}
        <div class="flex justify-end">
          <button
            onClick={saveStory}
            disabled={loading.value}
            class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.value
              ? "저장 중..."
              : (id != "new" ? "수정하기" : "저장하기")}
          </button>

          {id != "new" && (
            <button
              onClick={deleteStory}
              disabled={loading.value}
              class="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-4 disabled:opacity-50"
            >
              {loading.value ? "저장 중..." : "삭제하기"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
