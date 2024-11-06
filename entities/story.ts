export type Story = {
  content: {
    thumbnailUrl: string;
    scenes: {
      imageUrl: string,
      texts: string[]
    }[];
    endingImageUrl: string;
  } | null;
  title: string;
  unlockable_character_id: number | null;
} | null;