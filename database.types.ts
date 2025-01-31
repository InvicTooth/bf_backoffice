export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      characters: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: number
          metadata: Json | null
          name: string
          small_avatar_url: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: number
          metadata?: Json | null
          name: string
          small_avatar_url?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: number
          metadata?: Json | null
          name?: string
          small_avatar_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          character_id: number | null
          content: string
          created_at: string | null
          id: number
          is_user: boolean | null
          metadata: Json | null
          profile_id: number | null
          thread_id: number | null
        }
        Insert: {
          character_id?: number | null
          content: string
          created_at?: string | null
          id?: number
          is_user?: boolean | null
          metadata?: Json | null
          profile_id?: number | null
          thread_id?: number | null
        }
        Update: {
          character_id?: number | null
          content?: string
          created_at?: string | null
          id?: number
          is_user?: boolean | null
          metadata?: Json | null
          profile_id?: number | null
          thread_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string | null
          id: number
          is_deleted: boolean
          name: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          id?: number
          is_deleted?: boolean
          name?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          id?: number
          is_deleted?: boolean
          name?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          content: Json | null
          created_at: string
          id: number
          metadata: Json | null
          title: string
          unlockable_character_id: number | null
          updated_at: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: number
          metadata?: Json | null
          title: string
          unlockable_character_id?: number | null
          updated_at?: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: number
          metadata?: Json | null
          title?: string
          unlockable_character_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_unlockable_character_id_fkey"
            columns: ["unlockable_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          character_id: number | null
          created_at: string | null
          id: number
          last_message: string | null
          metadata: Json | null
          profile_id: number | null
          updated_at: string | null
        }
        Insert: {
          character_id?: number | null
          created_at?: string | null
          id?: number
          last_message?: string | null
          metadata?: Json | null
          profile_id?: number | null
          updated_at?: string | null
        }
        Update: {
          character_id?: number | null
          created_at?: string | null
          id?: number
          last_message?: string | null
          metadata?: Json | null
          profile_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_acquired_characters: {
        Row: {
          acquired_at: string
          character_id: number
          profile_id: number
        }
        Insert: {
          acquired_at?: string
          character_id: number
          profile_id: number
        }
        Update: {
          acquired_at?: string
          character_id?: number
          profile_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_acquired_characters_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_acquired_characters_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_completed_stories: {
        Row: {
          completed_at: string
          profile_id: number
          story_id: number
        }
        Insert: {
          completed_at?: string
          profile_id: number
          story_id: number
        }
        Update: {
          completed_at?: string
          profile_id?: number
          story_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_completed_stories_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_completed_stories_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_kakao_atmc: {
        Args: {
          _kakao_bot_id: string
          _user_id: string
        }
        Returns: {
          _assistant_id: string
          _name: string
          _thread_id: string
          today_message_count: number
          last_message_created_at: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
