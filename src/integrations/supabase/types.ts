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
      companies: {
        Row: {
          address: string | null
          billing_email: string | null
          company_type: string | null
          created_at: string
          id: string
          logo_url: string | null
          metadata: Json | null
          name: string
          phone: string | null
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          billing_email?: string | null
          company_type?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          billing_email?: string | null
          company_type?: string | null
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          cover_letter: string | null
          created_at: string
          current_employer: string | null
          cv_url: string
          email: string
          full_name: string
          id: string
          job_id: string
          linkedin_url: string | null
          phone: string | null
          status: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          cover_letter?: string | null
          created_at?: string
          current_employer?: string | null
          cv_url: string
          email: string
          full_name: string
          id?: string
          job_id: string
          linkedin_url?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          cover_letter?: string | null
          created_at?: string
          current_employer?: string | null
          cv_url?: string
          email?: string
          full_name?: string
          id?: string
          job_id?: string
          linkedin_url?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          benefits: string[] | null
          created_at: string
          department: string
          description: string
          employment_type: string
          id: string
          is_active: boolean
          location: string
          requirements: string[]
          title: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          created_at?: string
          department: string
          description: string
          employment_type?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          created_at?: string
          department?: string
          description?: string
          employment_type?: string
          id?: string
          is_active?: boolean
          location?: string
          requirements?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          body: string | null
          channel: string | null
          created_at: string
          direction: string
          id: string
          metadata: Json | null
          status: string | null
          subject: string | null
          ticket_id: string
          to_from: string | null
        }
        Insert: {
          body?: string | null
          channel?: string | null
          created_at?: string
          direction: string
          id?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          ticket_id: string
          to_from?: string | null
        }
        Update: {
          body?: string | null
          channel?: string | null
          created_at?: string
          direction?: string
          id?: string
          metadata?: Json | null
          status?: string | null
          subject?: string | null
          ticket_id?: string
          to_from?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          channel: string
          company_id: string | null
          created_at: string
          created_by_user_id: string
          details: string | null
          id: string
          location: string | null
          priority: string
          service_category_id: string | null
          status: string
          summary: string
          tracking_ref: string
          updated_at: string
        }
        Insert: {
          channel?: string
          company_id?: string | null
          created_at?: string
          created_by_user_id: string
          details?: string | null
          id?: string
          location?: string | null
          priority?: string
          service_category_id?: string | null
          status?: string
          summary: string
          tracking_ref: string
          updated_at?: string
        }
        Update: {
          channel?: string
          company_id?: string | null
          created_at?: string
          created_by_user_id?: string
          details?: string | null
          id?: string
          location?: string | null
          priority?: string
          service_category_id?: string | null
          status?: string
          summary?: string
          tracking_ref?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "siyakha_admin"
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
      app_role: ["admin", "moderator", "user", "siyakha_admin"],
    },
  },
} as const
