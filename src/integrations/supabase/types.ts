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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      academic_courses: {
        Row: {
          code: string | null
          credits: number
          cycle: number | null
          id: string
          name: string
          plan_id: string
        }
        Insert: {
          code?: string | null
          credits: number
          cycle?: number | null
          id?: string
          name: string
          plan_id: string
        }
        Update: {
          code?: string | null
          credits?: number
          cycle?: number | null
          id?: string
          name?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_courses_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "academic_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_plans: {
        Row: {
          created_at: string
          id: string
          name: string
          total_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          total_credits: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          total_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      academic_records: {
        Row: {
          course_id: string
          grade: number | null
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          grade?: number | null
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          grade?: number | null
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "academic_records_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academic_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      badges_earned: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          id: string
          joined_at: string
          progress: number
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          id?: string
          joined_at?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string
          ends_at: string
          icon: string
          id: string
          starts_at: string
          target_value: number
          title: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description: string
          ends_at: string
          icon?: string
          id?: string
          starts_at?: string
          target_value?: number
          title: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string
          ends_at?: string
          icon?: string
          id?: string
          starts_at?: string
          target_value?: number
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string | null
          color: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          name: string
          professor: string | null
          room: string | null
          start_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          code?: string | null
          color?: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          name: string
          professor?: string | null
          room?: string | null
          start_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string | null
          color?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          name?: string
          professor?: string | null
          room?: string | null
          start_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          motivation_level: number
          skipped_breaks: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date: string
          motivation_level: number
          skipped_breaks?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          motivation_level?: number
          skipped_breaks?: number
          user_id?: string
        }
        Relationships: []
      }
      google_calendar_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mentoring_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          relationship_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          relationship_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          relationship_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_messages_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentoring_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_projects: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          relationship_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          relationship_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          relationship_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_projects_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentoring_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      mentoring_relationships: {
        Row: {
          created_at: string
          id: string
          mentee_id: string
          mentor_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentee_id: string
          mentor_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          mentee_id?: string
          mentor_id?: string
          status?: string
        }
        Relationships: []
      }
      mentoring_sessions: {
        Row: {
          created_at: string
          created_by: string
          duration_minutes: number
          id: string
          jitsi_room_name: string
          notes: string | null
          relationship_id: string
          scheduled_at: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          duration_minutes?: number
          id?: string
          jitsi_room_name: string
          notes?: string | null
          relationship_id: string
          scheduled_at: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          duration_minutes?: number
          id?: string
          jitsi_room_name?: string
          notes?: string | null
          relationship_id?: string
          scheduled_at?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentoring_sessions_relationship_id_fkey"
            columns: ["relationship_id"]
            isOneToOne: false
            referencedRelation: "mentoring_relationships"
            referencedColumns: ["id"]
          },
        ]
      }
      pomodoro_sessions: {
        Row: {
          completed: boolean
          ended_at: string | null
          id: string
          session_type: string
          skipped_break: boolean
          started_at: string
          task_id: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean
          ended_at?: string | null
          id?: string
          session_type: string
          skipped_break?: boolean
          started_at?: string
          task_id?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean
          ended_at?: string | null
          id?: string
          session_type?: string
          skipped_break?: boolean
          started_at?: string
          task_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pomodoro_sessions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          academic_level: number
          academic_progress: number
          academic_track: string | null
          avatar_emoji: string | null
          created_at: string
          display_name: string | null
          id: string
          last_active_date: string | null
          level: number
          max_daily_hours: number
          streak_days: number
          total_points: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          academic_level?: number
          academic_progress?: number
          academic_track?: string | null
          avatar_emoji?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          level?: number
          max_daily_hours?: number
          streak_days?: number
          total_points?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          academic_level?: number
          academic_progress?: number
          academic_track?: string | null
          avatar_emoji?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_date?: string | null
          level?: number
          max_daily_hours?: number
          streak_days?: number
          total_points?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      spotify_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          completed_pomodoros: number
          created_at: string
          difficulty: Database["public"]["Enums"]["task_difficulty"]
          estimated_hours: number
          google_calendar_event_id: string | null
          id: string
          name: string
          pomodoro_sessions: number
          scheduled_day: string
          status: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_pomodoros?: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["task_difficulty"]
          estimated_hours: number
          google_calendar_event_id?: string | null
          id?: string
          name: string
          pomodoro_sessions?: number
          scheduled_day: string
          status?: Database["public"]["Enums"]["task_status"]
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_pomodoros?: number
          created_at?: string
          difficulty?: Database["public"]["Enums"]["task_difficulty"]
          estimated_hours?: number
          google_calendar_event_id?: string | null
          id?: string
          name?: string
          pomodoro_sessions?: number
          scheduled_day?: string
          status?: Database["public"]["Enums"]["task_status"]
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
      task_difficulty: "low" | "medium" | "high"
      task_status: "pending" | "in-progress" | "completed"
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
      task_difficulty: ["low", "medium", "high"],
      task_status: ["pending", "in-progress", "completed"],
    },
  },
} as const
