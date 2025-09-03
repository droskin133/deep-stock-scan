export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      ai_interactions: {
        Row: {
          created_at: string
          feedback_notes: string | null
          feedback_rating: number | null
          id: string
          query: string
          response: Json | null
          symbols: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_notes?: string | null
          feedback_rating?: number | null
          id?: string
          query: string
          response?: Json | null
          symbols?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_notes?: string | null
          feedback_rating?: number | null
          id?: string
          query?: string
          response?: Json | null
          symbols?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          conditions: Json | null
          created_at: string
          description: string | null
          id: string
          percentage_value: number | null
          snoozed_until: string | null
          status: Database["public"]["Enums"]["alert_status"]
          symbol: string
          target_value: number | null
          timeframe: Database["public"]["Enums"]["timeframe"] | null
          title: string
          triggered_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          percentage_value?: number | null
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          symbol: string
          target_value?: number | null
          timeframe?: Database["public"]["Enums"]["timeframe"] | null
          title: string
          triggered_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          conditions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          percentage_value?: number | null
          snoozed_until?: string | null
          status?: Database["public"]["Enums"]["alert_status"]
          symbol?: string
          target_value?: number | null
          timeframe?: Database["public"]["Enums"]["timeframe"] | null
          title?: string
          triggered_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          preferences: Json | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          data_sharing_consent: boolean | null
          default_timeframe: Database["public"]["Enums"]["timeframe"] | null
          id: string
          notification_settings: Json | null
          preferred_indicators: string[] | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_sharing_consent?: boolean | null
          default_timeframe?: Database["public"]["Enums"]["timeframe"] | null
          id?: string
          notification_settings?: Json | null
          preferred_indicators?: string[] | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_sharing_consent?: boolean | null
          default_timeframe?: Database["public"]["Enums"]["timeframe"] | null
          id?: string
          notification_settings?: Json | null
          preferred_indicators?: string[] | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist_items: {
        Row: {
          added_at: string
          company_name: string | null
          id: string
          notes: string | null
          sector: string | null
          sort_order: number | null
          symbol: string
          watchlist_id: string
        }
        Insert: {
          added_at?: string
          company_name?: string | null
          id?: string
          notes?: string | null
          sector?: string | null
          sort_order?: number | null
          symbol: string
          watchlist_id: string
        }
        Update: {
          added_at?: string
          company_name?: string | null
          id?: string
          notes?: string | null
          sector?: string | null
          sort_order?: number | null
          symbol?: string
          watchlist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_items_watchlist_id_fkey"
            columns: ["watchlist_id"]
            isOneToOne: false
            referencedRelation: "watchlists"
            referencedColumns: ["id"]
          },
        ]
      }
      watchlists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_status: "active" | "triggered" | "snoozed" | "cancelled"
      alert_type:
        | "price_above"
        | "price_below"
        | "percent_change"
        | "volume_spike"
        | "technical_indicator"
        | "news_event"
        | "earnings"
      timeframe:
        | "1min"
        | "5min"
        | "15min"
        | "30min"
        | "1hr"
        | "daily"
        | "weekly"
        | "monthly"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      alert_status: ["active", "triggered", "snoozed", "cancelled"],
      alert_type: [
        "price_above",
        "price_below",
        "percent_change",
        "volume_spike",
        "technical_indicator",
        "news_event",
        "earnings",
      ],
      timeframe: [
        "1min",
        "5min",
        "15min",
        "30min",
        "1hr",
        "daily",
        "weekly",
        "monthly",
      ],
    },
  },
} as const
