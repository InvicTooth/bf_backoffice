export type Story = {
  content: {
    thumbnailUrl: string;
    scenes: {
      imageUrl: string,
      texts: string[]
    }[];
    endingImageUrl: string;
  } | null;
  id: number | null;
  metadata: Record<string, never> | null;
  title: string;
  unlockable_character_id: number | null;
} | null;