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
      dopamine_rewards: {
        Row: {
          amount: number
          claimed: boolean | null
          claimed_at: string | null
          created_at: string | null
          id: string
          reward_type: string
          transaction_hash: string | null
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          amount: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reward_type: string
          transaction_hash?: string | null
          user_id: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          amount?: number
          claimed?: boolean | null
          claimed_at?: string | null
          created_at?: string | null
          id?: string
          reward_type?: string
          transaction_hash?: string | null
          user_id?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: []
      }
      escrow_payments: {
        Row: {
          amount_cents: number
          booking_id: string
          client_user_id: string
          created_at: string
          currency: string
          deposit_tx_hash: string | null
          id: string
          payout_tx_hash: string | null
          platform_fee_cents: number
          refund_tx_hash: string | null
          released_at: string | null
          status: string
          therapist_payout_cents: number
          therapist_user_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          booking_id: string
          client_user_id: string
          created_at?: string
          currency?: string
          deposit_tx_hash?: string | null
          id?: string
          payout_tx_hash?: string | null
          platform_fee_cents: number
          refund_tx_hash?: string | null
          released_at?: string | null
          status?: string
          therapist_payout_cents: number
          therapist_user_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          booking_id?: string
          client_user_id?: string
          created_at?: string
          currency?: string
          deposit_tx_hash?: string | null
          id?: string
          payout_tx_hash?: string | null
          platform_fee_cents?: number
          refund_tx_hash?: string | null
          released_at?: string | null
          status?: string
          therapist_payout_cents?: number
          therapist_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "therapist_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          created_at: string
          duration: number
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration: number
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration?: number
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      mood_entries: {
        Row: {
          activities: Json | null
          created_at: string
          date: string
          id: string
          intensity: number
          mood: string
          note: string | null
          user_id: string
        }
        Insert: {
          activities?: Json | null
          created_at?: string
          date?: string
          id?: string
          intensity: number
          mood: string
          note?: string | null
          user_id: string
        }
        Update: {
          activities?: Json | null
          created_at?: string
          date?: string
          id?: string
          intensity?: number
          mood?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      session_messages: {
        Row: {
          body: string | null
          booking_id: string
          created_at: string
          id: string
          recipient_user_id: string
          sender_user_id: string
          voice_note_path: string | null
          voice_note_seconds: number | null
        }
        Insert: {
          body?: string | null
          booking_id: string
          created_at?: string
          id?: string
          recipient_user_id: string
          sender_user_id: string
          voice_note_path?: string | null
          voice_note_seconds?: number | null
        }
        Update: {
          body?: string | null
          booking_id?: string
          created_at?: string
          id?: string
          recipient_user_id?: string
          sender_user_id?: string
          voice_note_path?: string | null
          voice_note_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "therapist_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      sleep_entries: {
        Row: {
          created_at: string
          date: string
          hours: number
          id: string
          note: string | null
          quality: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          hours: number
          id?: string
          note?: string | null
          quality: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          hours?: number
          id?: string
          note?: string | null
          quality?: number
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json
          id: string
          interval: string
          name: string
          price_cents: number
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json
          id: string
          interval?: string
          name: string
          price_cents: number
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json
          id?: string
          interval?: string
          name?: string
          price_cents?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          paystack_customer_id: string | null
          paystack_subscription_id: string | null
          plan_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_id?: string | null
          paystack_subscription_id?: string | null
          plan_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          paystack_customer_id?: string | null
          paystack_subscription_id?: string | null
          plan_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_applications: {
        Row: {
          additional_document_path: string | null
          bio: string
          created_at: string
          credentials: string
          email: string
          full_name: string
          government_id_path: string
          id: string
          kyc_selfie_path: string | null
          kyc_status: string
          languages: string
          license_document_path: string
          license_number: string
          license_state: string
          linkedin_url: string | null
          location: string
          persona_completed_at: string | null
          persona_inquiry_id: string | null
          persona_status: string | null
          phone: string | null
          price_range: string
          profile_picture_path: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          session_types: string[]
          specialties: string[]
          status: Database["public"]["Enums"]["therapist_application_status"]
          title: string
          updated_at: string
          user_id: string
          years_of_experience: number
        }
        Insert: {
          additional_document_path?: string | null
          bio: string
          created_at?: string
          credentials: string
          email: string
          full_name: string
          government_id_path: string
          id?: string
          kyc_selfie_path?: string | null
          kyc_status?: string
          languages: string
          license_document_path: string
          license_number: string
          license_state: string
          linkedin_url?: string | null
          location: string
          persona_completed_at?: string | null
          persona_inquiry_id?: string | null
          persona_status?: string | null
          phone?: string | null
          price_range: string
          profile_picture_path: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_types?: string[]
          specialties?: string[]
          status?: Database["public"]["Enums"]["therapist_application_status"]
          title: string
          updated_at?: string
          user_id: string
          years_of_experience?: number
        }
        Update: {
          additional_document_path?: string | null
          bio?: string
          created_at?: string
          credentials?: string
          email?: string
          full_name?: string
          government_id_path?: string
          id?: string
          kyc_selfie_path?: string | null
          kyc_status?: string
          languages?: string
          license_document_path?: string
          license_number?: string
          license_state?: string
          linkedin_url?: string | null
          location?: string
          persona_completed_at?: string | null
          persona_inquiry_id?: string | null
          persona_status?: string | null
          phone?: string | null
          price_range?: string
          profile_picture_path?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          session_types?: string[]
          specialties?: string[]
          status?: Database["public"]["Enums"]["therapist_application_status"]
          title?: string
          updated_at?: string
          user_id?: string
          years_of_experience?: number
        }
        Relationships: []
      }
      therapist_bookings: {
        Row: {
          amount_cents: number
          client_user_id: string
          created_at: string
          daily_room_name: string | null
          daily_room_url: string | null
          duration_minutes: number
          ended_at: string | null
          id: string
          platform_fee_cents: number
          scheduled_start: string
          session_mode: string
          started_at: string | null
          status: string
          therapist_id: string
          therapist_user_id: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          client_user_id: string
          created_at?: string
          daily_room_name?: string | null
          daily_room_url?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          platform_fee_cents?: number
          scheduled_start: string
          session_mode?: string
          started_at?: string | null
          status?: string
          therapist_id: string
          therapist_user_id: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          client_user_id?: string
          created_at?: string
          daily_room_name?: string | null
          daily_room_url?: string | null
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          platform_fee_cents?: number
          scheduled_start?: string
          session_mode?: string
          started_at?: string | null
          status?: string
          therapist_id?: string
          therapist_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_bookings_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_likes: {
        Row: {
          created_at: string
          id: string
          therapist_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          therapist_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          therapist_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_likes_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_user_id: string
          status: string
          therapist_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_user_id: string
          status?: string
          therapist_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_user_id?: string
          status?: string
          therapist_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_reports_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapist_reviews: {
        Row: {
          booking_id: string | null
          client_user_id: string
          created_at: string
          id: string
          rating: number
          review: string | null
          therapist_id: string
          updated_at: string
        }
        Insert: {
          booking_id?: string | null
          client_user_id: string
          created_at?: string
          id?: string
          rating: number
          review?: string | null
          therapist_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string | null
          client_user_id?: string
          created_at?: string
          id?: string
          rating?: number
          review?: string | null
          therapist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "therapist_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "therapist_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapist_reviews_therapist_id_fkey"
            columns: ["therapist_id"]
            isOneToOne: false
            referencedRelation: "therapists"
            referencedColumns: ["id"]
          },
        ]
      }
      therapists: {
        Row: {
          application_id: string | null
          avatar_url: string | null
          bio: string
          cancelled_sessions: number
          completed_sessions: number
          created_at: string
          credentials: string
          full_name: string
          id: string
          is_accepting_clients: boolean
          is_published: boolean
          languages: string
          likes_count: number
          location: string
          payout_wallet_address: string | null
          rate_cents_per_30min: number
          rating_avg: number
          rating_count: number
          score: number
          session_types: string[]
          specialties: string[]
          title: string
          updated_at: string
          user_id: string
          years_of_experience: number
        }
        Insert: {
          application_id?: string | null
          avatar_url?: string | null
          bio?: string
          cancelled_sessions?: number
          completed_sessions?: number
          created_at?: string
          credentials: string
          full_name: string
          id?: string
          is_accepting_clients?: boolean
          is_published?: boolean
          languages?: string
          likes_count?: number
          location?: string
          payout_wallet_address?: string | null
          rate_cents_per_30min?: number
          rating_avg?: number
          rating_count?: number
          score?: number
          session_types?: string[]
          specialties?: string[]
          title: string
          updated_at?: string
          user_id: string
          years_of_experience?: number
        }
        Update: {
          application_id?: string | null
          avatar_url?: string | null
          bio?: string
          cancelled_sessions?: number
          completed_sessions?: number
          created_at?: string
          credentials?: string
          full_name?: string
          id?: string
          is_accepting_clients?: boolean
          is_published?: boolean
          languages?: string
          likes_count?: number
          location?: string
          payout_wallet_address?: string | null
          rate_cents_per_30min?: number
          rating_avg?: number
          rating_count?: number
          score?: number
          session_types?: string[]
          specialties?: string[]
          title?: string
          updated_at?: string
          user_id?: string
          years_of_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "therapists_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "therapist_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          current_streak: number
          last_session_date: string | null
          total_focus_minutes: number
          total_mood_entries: number | null
          total_sessions: number
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_session_date?: string | null
          total_focus_minutes?: number
          total_mood_entries?: number | null
          total_sessions?: number
          user_id: string
        }
        Update: {
          current_streak?: number
          last_session_date?: string | null
          total_focus_minutes?: number
          total_mood_entries?: number | null
          total_sessions?: number
          user_id?: string
        }
        Relationships: []
      }
      user_task_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_completed_date: string | null
          task_type: string
          total_completions: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_completed_date?: string | null
          task_type: string
          total_completions?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_completed_date?: string | null
          task_type?: string
          total_completions?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_wallets: {
        Row: {
          created_at: string | null
          id: string
          privy_did: string | null
          updated_at: string | null
          user_id: string
          wallet_address: string | null
          wallet_provider: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          privy_did?: string | null
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          privy_did?: string | null
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
          wallet_provider?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_weekly_rewards: { Args: never; Returns: undefined }
      get_user_focus_stats: {
        Args: never
        Returns: Database["public"]["CompositeTypes"]["focus_stats"]
        SetofOptions: {
          from: "*"
          to: "focus_stats"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_subscription: {
        Args: never
        Returns: {
          cancel_at_period_end: boolean
          current_period_end: string
          plan_id: string
          status: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_mood_entries_count: { Args: never; Returns: undefined }
      recompute_therapist_score: {
        Args: { _therapist_id: string }
        Returns: undefined
      }
      update_task_streak: {
        Args: { completion_date?: string; task_type_param: string }
        Returns: undefined
      }
      update_user_stats_on_session_complete: {
        Args: { session_duration: number }
        Returns: undefined
      }
      user_has_active_subscription: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      therapist_application_status:
        | "draft"
        | "submitted"
        | "kyc_pending"
        | "kyc_passed"
        | "kyc_failed"
        | "approved"
        | "rejected"
        | "pending_review"
    }
    CompositeTypes: {
      focus_stats: {
        total_sessions: number | null
        total_focus_minutes: number | null
        current_streak: number | null
        today_sessions_count: number | null
      }
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
      app_role: ["admin", "moderator", "user"],
      therapist_application_status: [
        "draft",
        "submitted",
        "kyc_pending",
        "kyc_passed",
        "kyc_failed",
        "approved",
        "rejected",
        "pending_review",
      ],
    },
  },
} as const
