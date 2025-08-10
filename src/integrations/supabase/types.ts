export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          access_instructions: string | null
          address: string | null
          arrival_notification_recipients: string[]
          billing_email: string | null
          company_type: Database["public"]["Enums"]["company_type"] | null
          created_at: string
          id: string
          logo_url: string | null
          metadata: Json
          name: string
          phone: string | null
          preferred_comms: string | null
          sla_tier: string | null
          updated_at: string
          vat_number: string | null
          working_hours: Json
        }
        Insert: {
          access_instructions?: string | null
          address?: string | null
          arrival_notification_recipients?: string[]
          billing_email?: string | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json
          name: string
          phone?: string | null
          preferred_comms?: string | null
          sla_tier?: string | null
          updated_at?: string
          vat_number?: string | null
          working_hours?: Json
        }
        Update: {
          access_instructions?: string | null
          address?: string | null
          arrival_notification_recipients?: string[]
          billing_email?: string | null
          company_type?: Database["public"]["Enums"]["company_type"] | null
          created_at?: string
          id?: string
          logo_url?: string | null
          metadata?: Json
          name?: string
          phone?: string | null
          preferred_comms?: string | null
          sla_tier?: string | null
          updated_at?: string
          vat_number?: string | null
          working_hours?: Json
        }
        Relationships: []
      }
      company_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["company_role"]
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
      donations: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          donor_email: string | null
          donor_name: string | null
          id: string
          item_name: string | null
          merchant_reference: string | null
          metadata: Json
          monthly: boolean
          pf_payment_id: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          item_name?: string | null
          merchant_reference?: string | null
          metadata?: Json
          monthly?: boolean
          pf_payment_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          donor_email?: string | null
          donor_name?: string | null
          id?: string
          item_name?: string | null
          merchant_reference?: string | null
          metadata?: Json
          monthly?: boolean
          pf_payment_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_sends: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          subject: string | null
          to_emails: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          subject?: string | null
          to_emails?: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          subject?: string | null
          to_emails?: string[]
          user_id?: string
        }
        Relationships: []
      }
      payfast_itn_logs: {
        Row: {
          created_at: string
          donation_id: string | null
          id: number
          ip: string | null
          payload: Json
          payment_status: string | null
          pf_payment_id: string | null
          valid: boolean | null
        }
        Insert: {
          created_at?: string
          donation_id?: string | null
          id?: number
          ip?: string | null
          payload: Json
          payment_status?: string | null
          pf_payment_id?: string | null
          valid?: boolean | null
        }
        Update: {
          created_at?: string
          donation_id?: string | null
          id?: number
          ip?: string | null
          payload?: Json
          payment_status?: string | null
          pf_payment_id?: string | null
          valid?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "payfast_itn_logs_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          amount_cents: number | null
          company_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          metadata: Json
          requested_by: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_cents?: number | null
          company_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          requested_by: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number | null
          company_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          metadata?: Json
          requested_by?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json
          name: string
          postal_code: string | null
          site_ref: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          name: string
          postal_code?: string | null
          site_ref?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json
          name?: string
          postal_code?: string | null
          site_ref?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      support_calls: {
        Row: {
          client_status: string | null
          company_id: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          issues: string[]
          location: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_status?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issues?: string[]
          location?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_status?: string | null
          company_id?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          issues?: string[]
          location?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      add_company_member_by_email: {
        Args: {
          _company_id: string
          _email: string
          _role?: Database["public"]["Enums"]["company_role"]
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_company_admin: {
        Args: { _company_id: string; _user_id?: string }
        Returns: boolean
      }
      is_company_member: {
        Args: { _company_id: string; _user_id?: string }
        Returns: boolean
      }
      remove_company_member: {
        Args: { _company_id: string; _member_id: string }
        Returns: undefined
      }
      set_company_member_role: {
        Args: {
          _company_id: string
          _member_id: string
          _role: Database["public"]["Enums"]["company_role"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "siyakha_admin"
        | "dispatcher"
        | "technician"
        | "client_msp"
        | "client_non_msp"
        | "team_member"
      company_role: "owner" | "admin" | "member"
      company_type:
        | "msp"
        | "isp"
        | "school"
        | "enterprise"
        | "government"
        | "healthcare"
        | "hospitality"
        | "retail"
        | "nonprofit"
        | "manufacturing"
        | "finance"
        | "other"
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
      app_role: [
        "siyakha_admin",
        "dispatcher",
        "technician",
        "client_msp",
        "client_non_msp",
        "team_member",
      ],
      company_role: ["owner", "admin", "member"],
      company_type: [
        "msp",
        "isp",
        "school",
        "enterprise",
        "government",
        "healthcare",
        "hospitality",
        "retail",
        "nonprofit",
        "manufacturing",
        "finance",
        "other",
      ],
    },
  },
} as const
