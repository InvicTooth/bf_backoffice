export type Story = {
  content: {
    thumbnail: string;
    scenes: {
      image: string,
      texts: string[]
    }[];
    endingImage: string;
  } | null;
  id: number | null;
  metadata: Record<string, never> | null;
  title: string;
  unlockable_character_id: number | null;
} | null;