export type Character = {
  name:string;
  avatar_url: string;
  small_avatar_url: string;
  metadata: {
    model: string;
    provider: string,
    kakaoBotId: string,
    assistantId: string,
  }
} | null;