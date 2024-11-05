export type Character = {
  id: number | null;
  name:string;
  avatarUrl: string;
  metadata: Record<string, never> | null;
} | null;