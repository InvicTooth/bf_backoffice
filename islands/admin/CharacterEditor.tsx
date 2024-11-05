import { useSignal } from "@preact/signals";

export default function CharacterEditor({ character }:any) {
  const characterSignal = useSignal({ ...character });
  const thumbnailFile = useSignal<File | null>(null);
  const endingImageFile = useSignal<File | null>(null);
  const scenes = useSignal<{image:string, imageFile:File, texts:string[]}[]>([...character?.content?.scenes]);
  const loading = useSignal(false);
  const error = useSignal<string | null>(null);

  const savecharacter = async () => {
    try {
      loading.value = true;
      error.value = null;
      const formData = new FormData();
      // 기본 데이터
      const characterData = {
        title: characterSignal.value.title,
        content: {
          thumbnail: !thumbnailFile.value ? characterSignal.value.content.thumbnail : '',
          scenes: scenes.value.map(scene => ({
            image: !scene.imageFile ? scene.image : '',
            texts: scene.texts
          })),
          endingImage: !endingImageFile.value ? characterSignal.value.content?.endingImage : ''
        },
      };
      formData.append("characterData", JSON.stringify(characterData));
      console.log(JSON.stringify(characterData));
      // 이미지 파일들 추가
      if (thumbnailFile.value)
        formData.append("thumbnail", thumbnailFile.value);
      
      if (endingImageFile.value)
        formData.append("endingImage", endingImageFile.value);

      scenes.value.forEach((scene, index) => {
        if (scene.imageFile) {
          formData.append("sceneImages", scene.imageFile);
          formData.append(`sceneIndex_${formData.getAll("sceneImages").length - 1}`, index.toString());
        }
      });

      // API 호출
      const url = character?.id ? `/api/admin/stories/${character.id}` : "/api/admin/stories";
      const method = character?.id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        body: formData
      });
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error);

      // 성공 후 리디렉션
      globalThis.location.href = `/admin/stories/`;
    } catch (err:any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const deletecharacter = async () => {
    if (!character?.id) return;
    if (!confirm("정말로 이 스토리를 삭제하시겠습니까?")) return;
    try {
      loading.value = true;
            
      const response = await fetch(`/api/admin/stories/${character.id}`, { method: "DELETE" });

      const result = await response.json();
      console.log(result);
      if (!response.ok) throw new Error(result.error);
      globalThis.location.href = `/admin/stories/`;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  // 썸네일 이미지 처리
  const handleThumbnailUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    thumbnailFile.value = file;
    const newcharacter = { ...characterSignal.value };
    newcharacter.content.thumbnail = URL.createObjectURL(file);
    characterSignal.value = newcharacter;
  };

  // 씬 이미지 다중 선택 처리
  const handleSceneImages = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const newScenes = files.map((file) => ({
      image: URL.createObjectURL(file),
      imageFile: file,
      texts: [""]
    }));
    scenes.value = [...scenes.value, ...newScenes];
  };

  // 결말 이미지 처리
  const handleEndingImageUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    endingImageFile.value = file;
    const newcharacter = { ...characterSignal.value };
    newcharacter.content.endingImage = URL.createObjectURL(file);
    characterSignal.value = newcharacter;
  };

  const removeScene = (sceIndex: number) => {
    const newScenes = [...scenes.value];
    newScenes.splice(sceIndex, 1);
    scenes.value = newScenes;
  }

  // 특정 씬에 텍스트 추가
  const addTextToScene = (sceneIndex: number) => {
    const newScenes = [ ...scenes.value ];
    newScenes[sceneIndex].texts.push('');
    scenes.value = newScenes;
  };

  // 텍스트 수정
  const updateSceneText = (sceneIndex: number, textIndex: number, value: string) => {
    const newScenes = [ ...scenes.value ];
    newScenes[sceneIndex].texts[textIndex] = value;
    scenes.value = newScenes;
  };

  // 텍스트 삭제
  const removeSceneText = (sceneIndex: number, textIndex: number) => {
    const newScenes = [ ...scenes.value ];
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
          <label class="block text-sm font-medium mb-2">동화 제목</label>
          <input
            type="text"
            value={characterSignal.value.title}
            onInput={(e) => characterSignal.value.title = ((e.target as HTMLInputElement).value)}
            class="w-full p-2 border rounded"
          />
        </div>

        {/* 썸네일 이미지 업로드 */}
        <div>
          <label class="block text-sm font-medium mb-2">썸네일 이미지</label>
          <div class="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              class="hidden"
              id="thumbnail-upload"
            />
            <label
              for="thumbnail-upload"
              class="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              썸네일 선택
            </label>
            {characterSignal.value.content?.thumbnail && (
              <img src={characterSignal.value.content?.thumbnail} alt="썸네일 미리보기" class="w-24 h-24 object-cover rounded" />
            )}
          </div>
        </div>

        {/* 씬 이미지 다중 업로드 */}
        <div>
          <label class="block text-sm font-medium mb-2">씬 이미지 추가</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleSceneImages}
            class="hidden"
            id="scene-images-upload"
          />
          <label
            for="scene-images-upload"
            class="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
          >
            씬 이미지 선택
          </label>
        </div>

        {/* 씬 목록 */}
        <div class="space-y-8">
          {scenes.value.map((scene, sceneIndex) => (
            <div key={sceneIndex} class="flex space-x-6 p-4 border rounded">
              {/* 씬 이미지 */}
              <div class="w-64 flex-shrink-0">
                <img
                  src={scene.image}
                  alt={`씬 ${sceneIndex + 1}`}
                  class="w-full h-48 object-cover rounded"
                />
              </div>

              {/* 텍스트 입력 영역 */}
              <div class="flex-grow space-y-4">
                <div class="flex justify-between items-center">
                  <button
                      onClick={() => removeScene(sceneIndex)}
                      class="text-red-600 hover:text-red-700"
                    >
                      x
                    </button>
                  <h3 class="font-medium">씬 {sceneIndex + 1} 텍스트</h3>
                  <button
                    onClick={() => addTextToScene(sceneIndex)}
                    class="flex items-center text-blue-600 hover:text-blue-700"
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
                          (e.target as HTMLTextAreaElement).value
                        )
                      }
                      class="flex-grow p-2 border rounded"
                      rows={2}
                    />
                    <button
                      onClick={() => removeSceneText(sceneIndex, textIndex)}
                      class="text-red-600 hover:text-red-700"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 결말 이미지 업로드 */}
        <div>
          <label class="block text-sm font-medium mb-2">결말 이미지</label>
          <div class="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleEndingImageUpload}
              class="hidden"
              id="ending-upload"
            />
            <label
              for="ending-upload"
              class="flex items-center px-4 py-2 border rounded cursor-pointer hover:bg-gray-50"
            >
              결말 이미지 선택
            </label>
            {characterSignal.value.content?.endingImage && (
              <img src={characterSignal.value.content?.endingImage} alt="결말 이미지 미리보기" class="w-24 h-24 object-cover rounded" />
            )}
          </div>
        </div>

        {/* 저장 버튼 추가 */}
        <div class="flex justify-end">
          <button
            onClick={savecharacter}
            disabled={loading.value}
            class="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading.value ? "저장 중..." : (character?.id ? "수정하기" : "저장하기")}
          </button>
          
          {character?.id && <button
            onClick={deletecharacter}
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