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
      calendar_events: {
        Row: {
          all_day: boolean | null
          category: string | null
          color: string | null
          created_at: string
          description: string | null
          end_time: string | null
          id: string
          is_recurring: boolean | null
          location: string | null
          recurrence_rule: string | null
          reminder_minutes: number | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          all_day?: boolean | null
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          all_day?: boolean | null
          category?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          end_time?: string | null
          id?: string
          is_recurring?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          reminder_minutes?: number | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          email: string
          id: string
          name: string | null
          sent_at: string | null
          status: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_type: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          client_type?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          client_type?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
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
      customers: {
        Row: {
          address: string | null
          contact_person: string | null
          contract_type: string | null
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          monthly_value: number | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          contract_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          monthly_value?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          contract_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          monthly_value?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          content: string | null
          created_at: string
          entry_date: string
          id: string
          mood: string | null
          tags: string[] | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          mood?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      director_costs: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          id: string
          notes: string | null
          project_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "director_costs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "director_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      director_notes: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          id: string
          is_pinned: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      director_notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          source: string | null
          source_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          source?: string | null
          source_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          source?: string | null
          source_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      director_projects: {
        Row: {
          client: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_value: number | null
          id: string
          notes: string | null
          priority: string
          start_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: string
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: string
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      director_sent_emails: {
        Row: {
          body: string
          created_at: string
          id: string
          status: string
          subject: string
          to_email: string
          to_name: string | null
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          status?: string
          subject: string
          to_email: string
          to_name?: string | null
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          status?: string
          subject?: string
          to_email?: string
          to_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          body_html: string | null
          body_text: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
          sent_count: number | null
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
          sent_count?: number | null
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
          sent_count?: number | null
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      engineer_certificates: {
        Row: {
          created_at: string
          engineer_id: string
          expiry_date: string | null
          file_name: string | null
          file_path: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          engineer_id: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          engineer_id?: string
          expiry_date?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "engineer_certificates_engineer_id_fkey"
            columns: ["engineer_id"]
            isOneToOne: false
            referencedRelation: "partner_engineers"
            referencedColumns: ["id"]
          },
        ]
      }
      future_projects: {
        Row: {
          client: string | null
          created_at: string
          description: string | null
          estimated_value: number | null
          id: string
          notes: string | null
          priority: string
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client?: string | null
          created_at?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          notes?: string | null
          priority?: string
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      internet_providers: {
        Row: {
          account_manager: string | null
          contact_person: string | null
          coverage_areas: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_manager?: string | null
          contact_person?: string | null
          coverage_areas?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_manager?: string | null
          contact_person?: string | null
          coverage_areas?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          address: string | null
          budget_range: string | null
          company_size: string | null
          created_at: string | null
          email: string | null
          flagged_reason: string | null
          id: string
          industry: string | null
          location: string | null
          name: string
          notes: string | null
          phone: string | null
          reviewed_at: string | null
          source: string | null
          status: string | null
          updated_at: string | null
          verified: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          budget_range?: string | null
          company_size?: string | null
          created_at?: string | null
          email?: string | null
          flagged_reason?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          budget_range?: string | null
          company_size?: string | null
          created_at?: string | null
          email?: string | null
          flagged_reason?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          reviewed_at?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
          verified?: string | null
          website?: string | null
        }
        Relationships: []
      }
      packages: {
        Row: {
          billing_cycle: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          description: string | null
          id: string
          notes: string | null
          package_name: string
          package_type: string | null
          price: number | null
          provider_id: string | null
          provider_name: string
          provider_type: string
          speed: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          package_name: string
          package_type?: string | null
          price?: number | null
          provider_id?: string | null
          provider_name: string
          provider_type?: string
          speed?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          description?: string | null
          id?: string
          notes?: string | null
          package_name?: string
          package_type?: string | null
          price?: number | null
          provider_id?: string | null
          provider_name?: string
          provider_type?: string
          speed?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partner_engineers: {
        Row: {
          address: string | null
          bio: string | null
          city: string | null
          company_name: string
          company_registration: string | null
          contact_person: string
          country: string | null
          created_at: string
          email: string
          id: string
          notes: string | null
          phone: string
          service_regions: string[]
          skills: string[]
          status: string
          updated_at: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company_name: string
          company_registration?: string | null
          contact_person: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          phone: string
          service_regions?: string[]
          skills?: string[]
          status?: string
          updated_at?: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string
          company_registration?: string | null
          contact_person?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          phone?: string
          service_regions?: string[]
          skills?: string[]
          status?: string
          updated_at?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      portal_boq_activity: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          boq_id: string
          created_at: string
          detail: string | null
          id: string
        }
        Insert: {
          action: string
          actor_type?: string
          actor_user_id?: string | null
          boq_id: string
          created_at?: string
          detail?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          boq_id?: string
          created_at?: string
          detail?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_boq_activity_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_boq_comments: {
        Row: {
          admin_response: string | null
          author_name: string | null
          author_type: string
          author_user_id: string | null
          body: string
          boq_id: string
          created_at: string
          id: string
          item_id: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          author_name?: string | null
          author_type?: string
          author_user_id?: string | null
          body: string
          boq_id: string
          created_at?: string
          id?: string
          item_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          author_name?: string | null
          author_type?: string
          author_user_id?: string | null
          body?: string
          boq_id?: string
          created_at?: string
          id?: string
          item_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_boq_comments_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_boq_comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "portal_boq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_boq_decisions: {
        Row: {
          boq_id: string
          created_at: string
          decided_by_name: string | null
          decided_by_user_id: string | null
          decision: string
          id: string
          message: string | null
        }
        Insert: {
          boq_id: string
          created_at?: string
          decided_by_name?: string | null
          decided_by_user_id?: string | null
          decision: string
          id?: string
          message?: string | null
        }
        Update: {
          boq_id?: string
          created_at?: string
          decided_by_name?: string | null
          decided_by_user_id?: string | null
          decision?: string
          id?: string
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_boq_decisions_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_boq_item_costs: {
        Row: {
          created_at: string
          id: string
          internal_notes: string | null
          item_id: string
          markup_percent: number
          supplier: string | null
          supplier_unit_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_notes?: string | null
          item_id: string
          markup_percent?: number
          supplier?: string | null
          supplier_unit_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_notes?: string | null
          item_id?: string
          markup_percent?: number
          supplier?: string | null
          supplier_unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_boq_item_costs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: true
            referencedRelation: "portal_boq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_boq_items: {
        Row: {
          boq_id: string
          created_at: string
          customer_unit_rate: number
          description: string
          id: string
          is_included: boolean
          item_code: string | null
          line_total: number | null
          notes: string | null
          quantity: number
          reference: string | null
          section_id: string
          sort_order: number
          specification: string | null
          unit: string
          updated_at: string
          vat_applicable: boolean
        }
        Insert: {
          boq_id: string
          created_at?: string
          customer_unit_rate?: number
          description: string
          id?: string
          is_included?: boolean
          item_code?: string | null
          line_total?: number | null
          notes?: string | null
          quantity?: number
          reference?: string | null
          section_id: string
          sort_order?: number
          specification?: string | null
          unit?: string
          updated_at?: string
          vat_applicable?: boolean
        }
        Update: {
          boq_id?: string
          created_at?: string
          customer_unit_rate?: number
          description?: string
          id?: string
          is_included?: boolean
          item_code?: string | null
          line_total?: number | null
          notes?: string | null
          quantity?: number
          reference?: string | null
          section_id?: string
          sort_order?: number
          specification?: string | null
          unit?: string
          updated_at?: string
          vat_applicable?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "portal_boq_items_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_boq_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "portal_boq_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_boq_sections: {
        Row: {
          boq_id: string
          created_at: string
          description: string | null
          id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          boq_id: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          boq_id?: string
          created_at?: string
          description?: string | null
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_boq_sections_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_boqs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          created_by: string | null
          currency: string
          id: string
          notes: string | null
          project_id: string
          published_at: string | null
          published_by: string | null
          revision_label: string
          status: string
          superseded_by: string | null
          title: string
          updated_at: string
          valid_until: string | null
          vat_enabled: boolean
          vat_rate: number
          version_no: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          notes?: string | null
          project_id: string
          published_at?: string | null
          published_by?: string | null
          revision_label?: string
          status?: string
          superseded_by?: string | null
          title: string
          updated_at?: string
          valid_until?: string | null
          vat_enabled?: boolean
          vat_rate?: number
          version_no?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          id?: string
          notes?: string | null
          project_id?: string
          published_at?: string | null
          published_by?: string | null
          revision_label?: string
          status?: string
          superseded_by?: string | null
          title?: string
          updated_at?: string
          valid_until?: string | null
          vat_enabled?: boolean
          vat_rate?: number
          version_no?: number
        }
        Relationships: [
          {
            foreignKeyName: "portal_boqs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_boqs_superseded_by_fkey"
            columns: ["superseded_by"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_client_users: {
        Row: {
          activated_at: string | null
          client_id: string
          created_at: string
          email: string
          full_name: string | null
          id: string
          invited_at: string | null
          portal_role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          client_id: string
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          portal_role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          client_id?: string
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          invited_at?: string | null
          portal_role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_client_users_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_clients: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          created_at: string
          display_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          display_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          display_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      portal_documents: {
        Row: {
          category: string
          created_at: string
          document_date: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          notes: string | null
          phase_id: string | null
          project_id: string
          reference: string | null
          storage_path: string | null
          title: string
          updated_at: string
          uploaded_by: string | null
          version: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          document_date?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          phase_id?: string | null
          project_id: string
          reference?: string | null
          storage_path?: string | null
          title: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          document_date?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          notes?: string | null
          phase_id?: string | null
          project_id?: string
          reference?: string | null
          storage_path?: string | null
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_documents_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "portal_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_floor_marker_comments: {
        Row: {
          admin_response: string | null
          author_name: string | null
          author_type: string
          author_user_id: string | null
          body: string
          created_at: string
          floor_id: string
          id: string
          marker_id: string | null
          responded_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          author_name?: string | null
          author_type?: string
          author_user_id?: string | null
          body: string
          created_at?: string
          floor_id: string
          id?: string
          marker_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          author_name?: string | null
          author_type?: string
          author_user_id?: string | null
          body?: string
          created_at?: string
          floor_id?: string
          id?: string
          marker_id?: string | null
          responded_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_floor_marker_comments_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_floor_marker_comments_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: false
            referencedRelation: "portal_floor_markers"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_floor_marker_history: {
        Row: {
          action: string
          actor_role: string | null
          actor_type: string
          actor_user_id: string | null
          created_at: string
          detail: string | null
          floor_id: string | null
          id: string
          marker_id: string | null
          new_x_norm: number | null
          new_y_norm: number | null
          prev_x_norm: number | null
          prev_y_norm: number | null
        }
        Insert: {
          action: string
          actor_role?: string | null
          actor_type?: string
          actor_user_id?: string | null
          created_at?: string
          detail?: string | null
          floor_id?: string | null
          id?: string
          marker_id?: string | null
          new_x_norm?: number | null
          new_y_norm?: number | null
          prev_x_norm?: number | null
          prev_y_norm?: number | null
        }
        Update: {
          action?: string
          actor_role?: string | null
          actor_type?: string
          actor_user_id?: string | null
          created_at?: string
          detail?: string | null
          floor_id?: string | null
          id?: string
          marker_id?: string | null
          new_x_norm?: number | null
          new_y_norm?: number | null
          prev_x_norm?: number | null
          prev_y_norm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_floor_marker_history_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_floor_marker_history_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: false
            referencedRelation: "portal_floor_markers"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_floor_markers: {
        Row: {
          client_visible: boolean
          coverage_range: string
          created_at: string
          created_by: string | null
          description: string | null
          direction_deg: number
          equipment: string | null
          evidence_note: string | null
          evidence_path: string | null
          floor_id: string
          fov_deg: number
          id: string
          installed_on: string | null
          label: string
          mac_address: string | null
          marker_type: Database["public"]["Enums"]["portal_marker_kind"]
          model: string | null
          notes: string | null
          project_id: string
          serial_number: string | null
          sort_order: number
          status: Database["public"]["Enums"]["portal_marker_state"]
          tested_on: string | null
          updated_at: string
          x_norm: number
          y_norm: number
        }
        Insert: {
          client_visible?: boolean
          coverage_range?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_deg?: number
          equipment?: string | null
          evidence_note?: string | null
          evidence_path?: string | null
          floor_id: string
          fov_deg?: number
          id?: string
          installed_on?: string | null
          label: string
          mac_address?: string | null
          marker_type?: Database["public"]["Enums"]["portal_marker_kind"]
          model?: string | null
          notes?: string | null
          project_id: string
          serial_number?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["portal_marker_state"]
          tested_on?: string | null
          updated_at?: string
          x_norm?: number
          y_norm?: number
        }
        Update: {
          client_visible?: boolean
          coverage_range?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          direction_deg?: number
          equipment?: string | null
          evidence_note?: string | null
          evidence_path?: string | null
          floor_id?: string
          fov_deg?: number
          id?: string
          installed_on?: string | null
          label?: string
          mac_address?: string | null
          marker_type?: Database["public"]["Enums"]["portal_marker_kind"]
          model?: string | null
          notes?: string | null
          project_id?: string
          serial_number?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["portal_marker_state"]
          tested_on?: string | null
          updated_at?: string
          x_norm?: number
          y_norm?: number
        }
        Relationships: [
          {
            foreignKeyName: "portal_floor_markers_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_floor_markers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_floors: {
        Row: {
          client_visible: boolean
          created_at: string
          display_name: string
          floor_use: string
          id: string
          level_number: number
          notes: string | null
          plan_image_path: string | null
          plan_type: string
          project_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          client_visible?: boolean
          created_at?: string
          display_name: string
          floor_use?: string
          id?: string
          level_number: number
          notes?: string | null
          plan_image_path?: string | null
          plan_type?: string
          project_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          client_visible?: boolean
          created_at?: string
          display_name?: string
          floor_use?: string
          id?: string
          level_number?: number
          notes?: string | null
          plan_image_path?: string | null
          plan_type?: string
          project_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_floors_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_milestones: {
        Row: {
          created_at: string
          detail: string | null
          due_date: string | null
          id: string
          phase_id: string | null
          project_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          due_date?: string | null
          id?: string
          phase_id?: string | null
          project_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          due_date?: string | null
          id?: string
          phase_id?: string | null
          project_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_milestones_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "portal_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_milestones_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_phases: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_id: string
          sort_order: number
          start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_id: string
          sort_order?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_id?: string
          sort_order?: number
          start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_phases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_photos: {
        Row: {
          caption: string | null
          created_at: string
          file_size: number | null
          id: string
          mime_type: string | null
          phase_id: string | null
          project_id: string
          storage_path: string
          taken_at: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          phase_id?: string | null
          project_id: string
          storage_path: string
          taken_at?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          phase_id?: string | null
          project_id?: string
          storage_path?: string
          taken_at?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_photos_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "portal_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_project_assignments: {
        Row: {
          client_user_id: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_project_assignments_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "portal_client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_project_assignments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_projects: {
        Row: {
          address: string | null
          client_id: string
          consultant: string | null
          created_at: string
          description: string | null
          id: string
          objectives: string | null
          planning_narrative: string | null
          reference: string | null
          risks_notes: string | null
          site_context: string | null
          stakeholders: string | null
          start_date: string | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          client_id: string
          consultant?: string | null
          created_at?: string
          description?: string | null
          id?: string
          objectives?: string | null
          planning_narrative?: string | null
          reference?: string | null
          risks_notes?: string | null
          site_context?: string | null
          stakeholders?: string | null
          start_date?: string | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          client_id?: string
          consultant?: string | null
          created_at?: string
          description?: string | null
          id?: string
          objectives?: string | null
          planning_narrative?: string | null
          reference?: string | null
          risks_notes?: string | null
          site_context?: string | null
          stakeholders?: string | null
          start_date?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_queries: {
        Row: {
          admin_response: string | null
          client_user_id: string | null
          created_at: string
          id: string
          message: string
          project_id: string
          responded_at: string | null
          status: string
          subject: string
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          message: string
          project_id: string
          responded_at?: string | null
          status?: string
          subject: string
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          message?: string
          project_id?: string
          responded_at?: string | null
          status?: string
          subject?: string
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_queries_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "portal_client_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_queries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_site_images: {
        Row: {
          area: string | null
          caption: string | null
          captured_on: string | null
          category: string
          client_visible: boolean
          created_at: string
          id: string
          original_filename: string
          project_id: string
          sort_order: number
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          area?: string | null
          caption?: string | null
          captured_on?: string | null
          category?: string
          client_visible?: boolean
          created_at?: string
          id?: string
          original_filename: string
          project_id: string
          sort_order?: number
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          area?: string | null
          caption?: string | null
          captured_on?: string | null
          category?: string
          client_visible?: boolean
          created_at?: string
          id?: string
          original_filename?: string
          project_id?: string
          sort_order?: number
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_site_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_tasks: {
        Row: {
          created_at: string
          due_date: string | null
          evidence_notes: string | null
          id: string
          owner: string | null
          phase_id: string | null
          priority: string
          project_id: string
          sort_order: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          due_date?: string | null
          evidence_notes?: string | null
          id?: string
          owner?: string | null
          phase_id?: string | null
          priority?: string
          project_id: string
          sort_order?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          due_date?: string | null
          evidence_notes?: string | null
          id?: string
          owner?: string | null
          phase_id?: string | null
          priority?: string
          project_id?: string
          sort_order?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_tasks_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "portal_phases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_updates: {
        Row: {
          author_name: string | null
          body: string | null
          created_at: string
          id: string
          posted_at: string
          project_id: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          created_at?: string
          id?: string
          posted_at?: string
          project_id: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          body?: string | null
          created_at?: string
          id?: string
          posted_at?: string
          project_id?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_updates_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      site_performance: {
        Row: {
          client_name: string
          created_at: string
          id: string
          issues: string | null
          next_review: string | null
          notes: string | null
          site_name: string
          status: string
          update_date: string
          updated_at: string
          uptime_percent: number | null
          user_id: string
        }
        Insert: {
          client_name: string
          created_at?: string
          id?: string
          issues?: string | null
          next_review?: string | null
          notes?: string | null
          site_name: string
          status?: string
          update_date?: string
          updated_at?: string
          uptime_percent?: number | null
          user_id: string
        }
        Update: {
          client_name?: string
          created_at?: string
          id?: string
          issues?: string | null
          next_review?: string | null
          notes?: string | null
          site_name?: string
          status?: string
          update_date?: string
          updated_at?: string
          uptime_percent?: number | null
          user_id?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          account_number: string | null
          address: string | null
          category: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          address?: string | null
          category?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      technicians: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string | null
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
      ticket_notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          ticket_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          ticket_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_notes_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_technician_id: string | null
          caller_company: string | null
          caller_email: string | null
          caller_name: string | null
          caller_phone: string | null
          category: string | null
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
          assigned_technician_id?: string | null
          caller_company?: string | null
          caller_email?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          category?: string | null
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
          assigned_technician_id?: string | null
          caller_company?: string | null
          caller_email?: string | null
          caller_name?: string | null
          caller_phone?: string | null
          category?: string | null
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
      voip_providers: {
        Row: {
          account_manager: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          phone: string | null
          services: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          account_manager?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          phone?: string | null
          services?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          account_manager?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          phone?: string | null
          services?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      portal_add_floor_cameras: {
        Args: { _cameras: Json; _floor_id: string }
        Returns: number
      }
      portal_move_floor_markers: { Args: { _moves: Json }; Returns: number }
      portal_update_camera_optics: { Args: { _updates: Json }; Returns: number }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "siyakha_admin"
        | "partner_engineer"
      portal_marker_kind:
        | "wifi_ap"
        | "camera"
        | "rack"
        | "cable_route"
        | "other"
      portal_marker_state: "planned" | "installed" | "tested" | "active"
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
        "admin",
        "moderator",
        "user",
        "siyakha_admin",
        "partner_engineer",
      ],
      portal_marker_kind: ["wifi_ap", "camera", "rack", "cable_route", "other"],
      portal_marker_state: ["planned", "installed", "tested", "active"],
    },
  },
} as const
