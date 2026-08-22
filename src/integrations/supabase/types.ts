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
          assigned_to: string | null
          client: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          deal_source: string | null
          description: string | null
          due_date: string | null
          estimated_value: number | null
          id: string
          lost_reason: string | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          portal_client_id: string | null
          portal_project_id: string | null
          priority: string
          probability_percent: number | null
          site_name: string | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          won_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          client?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deal_source?: string | null
          description?: string | null
          due_date?: string | null
          estimated_value?: number | null
          id?: string
          lost_reason?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          portal_client_id?: string | null
          portal_project_id?: string | null
          priority?: string
          probability_percent?: number | null
          site_name?: string | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          won_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          client?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          deal_source?: string | null
          description?: string | null
          due_date?: string | null
          estimated_value?: number | null
          id?: string
          lost_reason?: string | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          portal_client_id?: string | null
          portal_project_id?: string | null
          priority?: string
          probability_percent?: number | null
          site_name?: string | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          won_at?: string | null
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
      portal_activity: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          client_id: string | null
          created_at: string
          detail: string | null
          entity_id: string | null
          entity_type: string
          id: string
          project_id: string | null
          site_id: string | null
        }
        Insert: {
          action: string
          actor_type?: string
          actor_user_id?: string | null
          client_id?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          project_id?: string | null
          site_id?: string | null
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          client_id?: string | null
          created_at?: string
          detail?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          project_id?: string | null
          site_id?: string | null
        }
        Relationships: []
      }
      portal_admin_audit: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          notes: string | null
          outcome: string
          target_client_user_id: string | null
          target_email: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          outcome: string
          target_client_user_id?: string | null
          target_email?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          outcome?: string
          target_client_user_id?: string | null
          target_email?: string | null
        }
        Relationships: []
      }
      portal_assets: {
        Row: {
          area: string | null
          asset_tag: string | null
          commissioned_on: string | null
          created_at: string
          created_by: string | null
          document_path: string | null
          evidence_path: string | null
          floor_id: string | null
          id: string
          installed_on: string | null
          installer: string | null
          ip_address: string | null
          lifecycle_status: string
          mac_address: string | null
          manufacturer: string | null
          marker_id: string | null
          model: string | null
          notes: string | null
          nvr_channel: number | null
          nvr_label: string | null
          patch_panel: string | null
          patch_panel_port: number | null
          po_reference: string | null
          project_id: string
          purchase_date: string | null
          rack_label: string | null
          serial_number: string | null
          supplier: string | null
          switch_label: string | null
          switch_port: number | null
          test_result: string | null
          tested_on: string | null
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          area?: string | null
          asset_tag?: string | null
          commissioned_on?: string | null
          created_at?: string
          created_by?: string | null
          document_path?: string | null
          evidence_path?: string | null
          floor_id?: string | null
          id?: string
          installed_on?: string | null
          installer?: string | null
          ip_address?: string | null
          lifecycle_status?: string
          mac_address?: string | null
          manufacturer?: string | null
          marker_id?: string | null
          model?: string | null
          notes?: string | null
          nvr_channel?: number | null
          nvr_label?: string | null
          patch_panel?: string | null
          patch_panel_port?: number | null
          po_reference?: string | null
          project_id: string
          purchase_date?: string | null
          rack_label?: string | null
          serial_number?: string | null
          supplier?: string | null
          switch_label?: string | null
          switch_port?: number | null
          test_result?: string | null
          tested_on?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          area?: string | null
          asset_tag?: string | null
          commissioned_on?: string | null
          created_at?: string
          created_by?: string | null
          document_path?: string | null
          evidence_path?: string | null
          floor_id?: string | null
          id?: string
          installed_on?: string | null
          installer?: string | null
          ip_address?: string | null
          lifecycle_status?: string
          mac_address?: string | null
          manufacturer?: string | null
          marker_id?: string | null
          model?: string | null
          notes?: string | null
          nvr_channel?: number | null
          nvr_label?: string | null
          patch_panel?: string | null
          patch_panel_port?: number | null
          po_reference?: string | null
          project_id?: string
          purchase_date?: string | null
          rack_label?: string | null
          serial_number?: string | null
          supplier?: string | null
          switch_label?: string | null
          switch_port?: number | null
          test_result?: string | null
          tested_on?: string | null
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_assets_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_assets_marker_id_fkey"
            columns: ["marker_id"]
            isOneToOne: true
            referencedRelation: "portal_floor_markers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
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
          discipline: string | null
          floor_id: string | null
          id: string
          is_included: boolean
          item_code: string | null
          line_kind: string
          line_total: number | null
          notes: string | null
          qty_commissioned: number
          qty_installed: number
          qty_procured: number
          qty_received: number
          qty_tested: number
          quantity: number
          reference: string | null
          section_id: string
          sort_order: number
          specification: string | null
          unit: string
          updated_at: string
          vat_applicable: boolean
          work_package: string | null
        }
        Insert: {
          boq_id: string
          created_at?: string
          customer_unit_rate?: number
          description: string
          discipline?: string | null
          floor_id?: string | null
          id?: string
          is_included?: boolean
          item_code?: string | null
          line_kind?: string
          line_total?: number | null
          notes?: string | null
          qty_commissioned?: number
          qty_installed?: number
          qty_procured?: number
          qty_received?: number
          qty_tested?: number
          quantity?: number
          reference?: string | null
          section_id: string
          sort_order?: number
          specification?: string | null
          unit?: string
          updated_at?: string
          vat_applicable?: boolean
          work_package?: string | null
        }
        Update: {
          boq_id?: string
          created_at?: string
          customer_unit_rate?: number
          description?: string
          discipline?: string | null
          floor_id?: string | null
          id?: string
          is_included?: boolean
          item_code?: string | null
          line_kind?: string
          line_total?: number | null
          notes?: string | null
          qty_commissioned?: number
          qty_installed?: number
          qty_procured?: number
          qty_received?: number
          qty_tested?: number
          quantity?: number
          reference?: string | null
          section_id?: string
          sort_order?: number
          specification?: string | null
          unit?: string
          updated_at?: string
          vat_applicable?: boolean
          work_package?: string | null
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
            foreignKeyName: "portal_boq_items_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
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
      portal_cable_route_history: {
        Row: {
          action: string
          actor_role: string | null
          actor_type: string
          actor_user_id: string | null
          created_at: string
          detail: string | null
          floor_id: string | null
          id: string
          new_waypoints: Json | null
          prev_waypoints: Json | null
          project_id: string | null
          route_id: string | null
        }
        Insert: {
          action: string
          actor_role?: string | null
          actor_type: string
          actor_user_id?: string | null
          created_at?: string
          detail?: string | null
          floor_id?: string | null
          id?: string
          new_waypoints?: Json | null
          prev_waypoints?: Json | null
          project_id?: string | null
          route_id?: string | null
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
          new_waypoints?: Json | null
          prev_waypoints?: Json | null
          project_id?: string | null
          route_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_cable_route_history_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "portal_cable_routes"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_cable_routes: {
        Row: {
          cable_type: string
          client_visible: boolean
          created_at: string
          created_by: string | null
          destination_label: string | null
          device_marker_id: string
          estimated_length_m: number | null
          fibre_strands: number | null
          floor_id: string
          id: string
          max_length_m: number
          measured_length_m: number | null
          notes: string | null
          patch_panel: string | null
          patch_panel_port: number | null
          project_id: string
          rack_marker_id: string
          route_kind: string
          route_label: string
          service_type: string
          sfp_detail: string | null
          source_label: string | null
          status: Database["public"]["Enums"]["portal_marker_state"]
          switch_port: number | null
          test_result: string | null
          updated_at: string
          waypoints: Json
        }
        Insert: {
          cable_type?: string
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          destination_label?: string | null
          device_marker_id: string
          estimated_length_m?: number | null
          fibre_strands?: number | null
          floor_id: string
          id?: string
          max_length_m?: number
          measured_length_m?: number | null
          notes?: string | null
          patch_panel?: string | null
          patch_panel_port?: number | null
          project_id: string
          rack_marker_id: string
          route_kind?: string
          route_label: string
          service_type: string
          sfp_detail?: string | null
          source_label?: string | null
          status?: Database["public"]["Enums"]["portal_marker_state"]
          switch_port?: number | null
          test_result?: string | null
          updated_at?: string
          waypoints?: Json
        }
        Update: {
          cable_type?: string
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          destination_label?: string | null
          device_marker_id?: string
          estimated_length_m?: number | null
          fibre_strands?: number | null
          floor_id?: string
          id?: string
          max_length_m?: number
          measured_length_m?: number | null
          notes?: string | null
          patch_panel?: string | null
          patch_panel_port?: number | null
          project_id?: string
          rack_marker_id?: string
          route_kind?: string
          route_label?: string
          service_type?: string
          sfp_detail?: string | null
          source_label?: string | null
          status?: Database["public"]["Enums"]["portal_marker_state"]
          switch_port?: number | null
          test_result?: string | null
          updated_at?: string
          waypoints?: Json
        }
        Relationships: [
          {
            foreignKeyName: "portal_cable_routes_device_marker_id_fkey"
            columns: ["device_marker_id"]
            isOneToOne: false
            referencedRelation: "portal_floor_markers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_cable_routes_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_cable_routes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_cable_routes_rack_marker_id_fkey"
            columns: ["rack_marker_id"]
            isOneToOne: false
            referencedRelation: "portal_floor_markers"
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
          approved_at: string | null
          approved_by: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          display_name: string
          id: string
          notes: string | null
          parent_reference: string | null
          phone: string | null
          review_status: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          display_name: string
          id?: string
          notes?: string | null
          parent_reference?: string | null
          phone?: string | null
          review_status?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          display_name?: string
          id?: string
          notes?: string | null
          parent_reference?: string | null
          phone?: string | null
          review_status?: string
          status?: string
          submitted_at?: string | null
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
          area: string | null
          capacity_u: number | null
          client_visible: boolean
          coverage_radius_m: number | null
          coverage_range: string
          created_at: string
          created_by: string | null
          description: string | null
          design_hold: string | null
          direction_deg: number
          environment: string | null
          equipment: string | null
          evidence_note: string | null
          evidence_path: string | null
          floor_id: string
          fov_deg: number
          id: string
          installed_on: string | null
          is_placed: boolean
          label: string
          lens_model: string | null
          mac_address: string | null
          marker_type: Database["public"]["Enums"]["portal_marker_kind"]
          model: string | null
          mount_type: string | null
          mounting_height_m: number | null
          notes: string | null
          nvr_channel: number | null
          nvr_id: string | null
          poe_class: string | null
          project_id: string
          radio_band: string | null
          serial_number: string | null
          sort_order: number
          ssid: string | null
          status: Database["public"]["Enums"]["portal_marker_state"]
          switch_marker_id: string | null
          switch_port: number | null
          tested_on: string | null
          updated_at: string
          vlan: string | null
          x_norm: number | null
          y_norm: number | null
        }
        Insert: {
          area?: string | null
          capacity_u?: number | null
          client_visible?: boolean
          coverage_radius_m?: number | null
          coverage_range?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_hold?: string | null
          direction_deg?: number
          environment?: string | null
          equipment?: string | null
          evidence_note?: string | null
          evidence_path?: string | null
          floor_id: string
          fov_deg?: number
          id?: string
          installed_on?: string | null
          is_placed?: boolean
          label: string
          lens_model?: string | null
          mac_address?: string | null
          marker_type?: Database["public"]["Enums"]["portal_marker_kind"]
          model?: string | null
          mount_type?: string | null
          mounting_height_m?: number | null
          notes?: string | null
          nvr_channel?: number | null
          nvr_id?: string | null
          poe_class?: string | null
          project_id: string
          radio_band?: string | null
          serial_number?: string | null
          sort_order?: number
          ssid?: string | null
          status?: Database["public"]["Enums"]["portal_marker_state"]
          switch_marker_id?: string | null
          switch_port?: number | null
          tested_on?: string | null
          updated_at?: string
          vlan?: string | null
          x_norm?: number | null
          y_norm?: number | null
        }
        Update: {
          area?: string | null
          capacity_u?: number | null
          client_visible?: boolean
          coverage_radius_m?: number | null
          coverage_range?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          design_hold?: string | null
          direction_deg?: number
          environment?: string | null
          equipment?: string | null
          evidence_note?: string | null
          evidence_path?: string | null
          floor_id?: string
          fov_deg?: number
          id?: string
          installed_on?: string | null
          is_placed?: boolean
          label?: string
          lens_model?: string | null
          mac_address?: string | null
          marker_type?: Database["public"]["Enums"]["portal_marker_kind"]
          model?: string | null
          mount_type?: string | null
          mounting_height_m?: number | null
          notes?: string | null
          nvr_channel?: number | null
          nvr_id?: string | null
          poe_class?: string | null
          project_id?: string
          radio_band?: string | null
          serial_number?: string | null
          sort_order?: number
          ssid?: string | null
          status?: Database["public"]["Enums"]["portal_marker_state"]
          switch_marker_id?: string | null
          switch_port?: number | null
          tested_on?: string | null
          updated_at?: string
          vlan?: string | null
          x_norm?: number | null
          y_norm?: number | null
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
      portal_login_notifications: {
        Row: {
          client_id: string | null
          client_name: string | null
          client_user_id: string | null
          created_at: string
          delivery_status: string
          error_message: string | null
          event_kind: string
          full_name: string | null
          id: string
          project_summary: string | null
          recipient_email: string | null
          signed_in_at: string
          site_summary: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          client_name?: string | null
          client_user_id?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          event_kind?: string
          full_name?: string | null
          id?: string
          project_summary?: string | null
          recipient_email?: string | null
          signed_in_at?: string
          site_summary?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string | null
          client_user_id?: string | null
          created_at?: string
          delivery_status?: string
          error_message?: string | null
          event_kind?: string
          full_name?: string | null
          id?: string
          project_summary?: string | null
          recipient_email?: string | null
          signed_in_at?: string
          site_summary?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_login_notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_login_notifications_client_user_id_fkey"
            columns: ["client_user_id"]
            isOneToOne: false
            referencedRelation: "portal_client_users"
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
      portal_notification_settings: {
        Row: {
          client_emails_enabled: boolean
          created_at: string
          id: string
          login_notify_enabled: boolean
          recipient_email: string
          singleton: boolean
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          client_emails_enabled?: boolean
          created_at?: string
          id?: string
          login_notify_enabled?: boolean
          recipient_email?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          client_emails_enabled?: boolean
          created_at?: string
          id?: string
          login_notify_enabled?: boolean
          recipient_email?: string
          singleton?: boolean
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      portal_nvrs: {
        Row: {
          channel_count: number
          channel_from: number | null
          channel_to: number | null
          client_visible: boolean
          created_at: string
          id: string
          label: string
          manufacturer: string
          model: string | null
          notes: string | null
          project_id: string
          rack_marker_id: string | null
          sort_order: number
          status: Database["public"]["Enums"]["portal_marker_state"]
          updated_at: string
        }
        Insert: {
          channel_count?: number
          channel_from?: number | null
          channel_to?: number | null
          client_visible?: boolean
          created_at?: string
          id?: string
          label: string
          manufacturer?: string
          model?: string | null
          notes?: string | null
          project_id: string
          rack_marker_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["portal_marker_state"]
          updated_at?: string
        }
        Update: {
          channel_count?: number
          channel_from?: number | null
          channel_to?: number | null
          client_visible?: boolean
          created_at?: string
          id?: string
          label?: string
          manufacturer?: string
          model?: string | null
          notes?: string | null
          project_id?: string
          rack_marker_id?: string | null
          sort_order?: number
          status?: Database["public"]["Enums"]["portal_marker_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_nvrs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_nvrs_rack_marker_id_fkey"
            columns: ["rack_marker_id"]
            isOneToOne: false
            referencedRelation: "portal_floor_markers"
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
      portal_plan_revisions: {
        Row: {
          archived_at: string | null
          checksum: string | null
          client_visible: boolean
          created_at: string
          file_size: number | null
          floor_id: string | null
          id: string
          image_path: string | null
          is_current: boolean
          mime_type: string | null
          notes: string | null
          original_filename: string | null
          page_count: number
          page_number: number
          project_id: string
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          revision_label: string
          rotation_deg: number
          source_path: string | null
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          archived_at?: string | null
          checksum?: string | null
          client_visible?: boolean
          created_at?: string
          file_size?: number | null
          floor_id?: string | null
          id?: string
          image_path?: string | null
          is_current?: boolean
          mime_type?: string | null
          notes?: string | null
          original_filename?: string | null
          page_count?: number
          page_number?: number
          project_id: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_label: string
          rotation_deg?: number
          source_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          archived_at?: string | null
          checksum?: string | null
          client_visible?: boolean
          created_at?: string
          file_size?: number | null
          floor_id?: string | null
          id?: string
          image_path?: string | null
          is_current?: boolean
          mime_type?: string | null
          notes?: string | null
          original_filename?: string | null
          page_count?: number
          page_number?: number
          project_id?: string
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          revision_label?: string
          rotation_deg?: number
          source_path?: string | null
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_plan_revisions_floor_id_fkey"
            columns: ["floor_id"]
            isOneToOne: false
            referencedRelation: "portal_floors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_plan_revisions_project_id_fkey"
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
      portal_project_packs: {
        Row: {
          client_visible: boolean
          id: string
          issued_at: string
          issued_by: string | null
          lifecycle_stage: string | null
          pack_kind: string
          pack_number: string
          project_id: string
          revision_no: number
          snapshot: Json
          title: string
        }
        Insert: {
          client_visible?: boolean
          id?: string
          issued_at?: string
          issued_by?: string | null
          lifecycle_stage?: string | null
          pack_kind?: string
          pack_number: string
          project_id: string
          revision_no?: number
          snapshot: Json
          title: string
        }
        Update: {
          client_visible?: boolean
          id?: string
          issued_at?: string
          issued_by?: string | null
          lifecycle_stage?: string | null
          pack_kind?: string
          pack_number?: string
          project_id?: string
          revision_no?: number
          snapshot?: Json
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_project_packs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_project_stage_history: {
        Row: {
          changed_by: string | null
          created_at: string
          from_stage: string | null
          id: string
          note: string | null
          project_id: string
          to_stage: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          from_stage?: string | null
          id?: string
          note?: string | null
          project_id: string
          to_stage: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          from_stage?: string | null
          id?: string
          note?: string | null
          project_id?: string
          to_stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_project_stage_history_project_id_fkey"
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
          design_concept: string | null
          id: string
          lifecycle_note: string | null
          lifecycle_stage: string | null
          objectives: string | null
          planning_narrative: string | null
          project_approach: string | null
          reference: string | null
          risks_notes: string | null
          site_context: string | null
          site_id: string | null
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
          design_concept?: string | null
          id?: string
          lifecycle_note?: string | null
          lifecycle_stage?: string | null
          objectives?: string | null
          planning_narrative?: string | null
          project_approach?: string | null
          reference?: string | null
          risks_notes?: string | null
          site_context?: string | null
          site_id?: string | null
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
          design_concept?: string | null
          id?: string
          lifecycle_note?: string | null
          lifecycle_stage?: string | null
          objectives?: string | null
          planning_narrative?: string | null
          project_approach?: string | null
          reference?: string | null
          risks_notes?: string | null
          site_context?: string | null
          site_id?: string | null
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
          {
            foreignKeyName: "portal_projects_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "portal_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_proposals: {
        Row: {
          accepted_at: string | null
          assumptions: string | null
          boq_id: string | null
          created_at: string
          created_by: string | null
          deliverables: string | null
          exclusions: string | null
          executive_summary: string | null
          id: string
          issued_at: string | null
          methodology: string | null
          payment_terms: string | null
          planned_completion_date: string | null
          planned_start_date: string | null
          prepared_by_email: string | null
          prepared_by_name: string | null
          project_id: string
          project_understanding: string | null
          proposal_number: string
          revision_label: string
          scope_of_work: string | null
          snapshot: Json | null
          status: string
          title: string
          updated_at: string
          validity_days: number
          warranty_terms: string | null
        }
        Insert: {
          accepted_at?: string | null
          assumptions?: string | null
          boq_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverables?: string | null
          exclusions?: string | null
          executive_summary?: string | null
          id?: string
          issued_at?: string | null
          methodology?: string | null
          payment_terms?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          prepared_by_email?: string | null
          prepared_by_name?: string | null
          project_id: string
          project_understanding?: string | null
          proposal_number: string
          revision_label?: string
          scope_of_work?: string | null
          snapshot?: Json | null
          status?: string
          title?: string
          updated_at?: string
          validity_days?: number
          warranty_terms?: string | null
        }
        Update: {
          accepted_at?: string | null
          assumptions?: string | null
          boq_id?: string | null
          created_at?: string
          created_by?: string | null
          deliverables?: string | null
          exclusions?: string | null
          executive_summary?: string | null
          id?: string
          issued_at?: string | null
          methodology?: string | null
          payment_terms?: string | null
          planned_completion_date?: string | null
          planned_start_date?: string | null
          prepared_by_email?: string | null
          prepared_by_name?: string | null
          project_id?: string
          project_understanding?: string | null
          proposal_number?: string
          revision_label?: string
          scope_of_work?: string | null
          snapshot?: Json | null
          status?: string
          title?: string
          updated_at?: string
          validity_days?: number
          warranty_terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_proposals_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
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
      portal_rack_equipment: {
        Row: {
          client_visible: boolean
          created_at: string
          description: string | null
          equipment_type: string
          id: string
          layer3_capable: boolean
          manufacturer: string
          model: string
          notes: string | null
          poe_capable: boolean
          port_count: number | null
          port_type: string | null
          project_id: string
          quantity: number
          rack_marker_id: string
          rack_units: number
          sort_order: number
          status: Database["public"]["Enums"]["portal_marker_state"]
          updated_at: string
        }
        Insert: {
          client_visible?: boolean
          created_at?: string
          description?: string | null
          equipment_type?: string
          id?: string
          layer3_capable?: boolean
          manufacturer: string
          model: string
          notes?: string | null
          poe_capable?: boolean
          port_count?: number | null
          port_type?: string | null
          project_id: string
          quantity?: number
          rack_marker_id: string
          rack_units?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["portal_marker_state"]
          updated_at?: string
        }
        Update: {
          client_visible?: boolean
          created_at?: string
          description?: string | null
          equipment_type?: string
          id?: string
          layer3_capable?: boolean
          manufacturer?: string
          model?: string
          notes?: string | null
          poe_capable?: boolean
          port_count?: number | null
          port_type?: string | null
          project_id?: string
          quantity?: number
          rack_marker_id?: string
          rack_units?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["portal_marker_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_rack_equipment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "portal_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_rack_equipment_rack_marker_id_fkey"
            columns: ["rack_marker_id"]
            isOneToOne: false
            referencedRelation: "portal_floor_markers"
            referencedColumns: ["id"]
          },
        ]
      }
      portal_registrations: {
        Row: {
          client_id: string | null
          collaborators: string[]
          contact_email: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          notes: string | null
          organisation_name: string
          page_labels: string[]
          parent_reference: string | null
          plan_paths: string[]
          reviewed_at: string | null
          reviewed_by: string | null
          services: string[]
          site_address: string | null
          site_city: string | null
          site_name: string | null
          site_postal_code: string | null
          site_province: string | null
          status: string
          submitted_by: string | null
          updated_at: string
          venue_type: string | null
        }
        Insert: {
          client_id?: string | null
          collaborators?: string[]
          contact_email: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organisation_name: string
          page_labels?: string[]
          parent_reference?: string | null
          plan_paths?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          services?: string[]
          site_address?: string | null
          site_city?: string | null
          site_name?: string | null
          site_postal_code?: string | null
          site_province?: string | null
          status?: string
          submitted_by?: string | null
          updated_at?: string
          venue_type?: string | null
        }
        Update: {
          client_id?: string | null
          collaborators?: string[]
          contact_email?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          organisation_name?: string
          page_labels?: string[]
          parent_reference?: string | null
          plan_paths?: string[]
          reviewed_at?: string | null
          reviewed_by?: string | null
          services?: string[]
          site_address?: string | null
          site_city?: string | null
          site_name?: string | null
          site_postal_code?: string | null
          site_province?: string | null
          status?: string
          submitted_by?: string | null
          updated_at?: string
          venue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_registrations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
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
      portal_sites: {
        Row: {
          address: string | null
          archived_at: string | null
          budget_client_visible: boolean
          budget_currency: string
          budget_includes_vat: boolean
          budget_reference: number | null
          city: string | null
          client_id: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          postal_code: string | null
          province: string | null
          sort_order: number
          status: string
          updated_at: string
          venue_type: string | null
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          budget_client_visible?: boolean
          budget_currency?: string
          budget_includes_vat?: boolean
          budget_reference?: number | null
          city?: string | null
          client_id: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          postal_code?: string | null
          province?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          venue_type?: string | null
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          budget_client_visible?: boolean
          budget_currency?: string
          budget_includes_vat?: boolean
          budget_reference?: number | null
          city?: string | null
          client_id?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          postal_code?: string | null
          province?: string | null
          sort_order?: number
          status?: string
          updated_at?: string
          venue_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portal_sites_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "portal_clients"
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
      portal_variations: {
        Row: {
          boq_id: string | null
          client_visible: boolean
          created_at: string
          created_by: string | null
          customer_amount: number
          decided_on: string | null
          description: string | null
          discipline: string | null
          id: string
          notes: string | null
          project_id: string
          raised_on: string
          reference: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          boq_id?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          customer_amount?: number
          decided_on?: string | null
          description?: string | null
          discipline?: string | null
          id?: string
          notes?: string | null
          project_id: string
          raised_on?: string
          reference: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          boq_id?: string | null
          client_visible?: boolean
          created_at?: string
          created_by?: string | null
          customer_amount?: number
          decided_on?: string | null
          description?: string | null
          discipline?: string | null
          id?: string
          notes?: string | null
          project_id?: string
          raised_on?: string
          reference?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "portal_variations_boq_id_fkey"
            columns: ["boq_id"]
            isOneToOne: false
            referencedRelation: "portal_boqs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portal_variations_project_id_fkey"
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
      portal_can_manage_project: {
        Args: { _project_id: string }
        Returns: boolean
      }
      portal_delete_floor_marker: {
        Args: { _marker_id: string }
        Returns: boolean
      }
      portal_generate_missing_cable_routes: {
        Args: { _floor_id?: string; _project_id: string }
        Returns: number
      }
      portal_move_floor_markers: { Args: { _moves: Json }; Returns: number }
      portal_next_pack_revision: {
        Args: { _pack_kind: string; _project_id: string }
        Returns: number
      }
      portal_next_proposal_number: { Args: never; Returns: string }
      portal_save_floor_marker: { Args: { _payload: Json }; Returns: string }
      portal_update_cable_route_waypoints: {
        Args: { _route_id: string; _waypoints: Json }
        Returns: number
      }
      portal_update_camera_optics: { Args: { _updates: Json }; Returns: number }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "siyakha_admin"
        | "partner_engineer"
        | "super_admin"
        | "project_manager"
        | "engineer"
        | "client_admin"
        | "client_editor"
        | "client_viewer"
      portal_marker_kind:
        | "wifi_ap"
        | "camera"
        | "rack"
        | "cable_route"
        | "other"
        | "switch"
        | "nvr"
        | "router_firewall"
        | "data_point"
        | "fibre_agg_switch"
        | "fibre_liu"
        | "fibre_splice"
        | "patch_panel"
        | "access_control"
        | "note_marker"
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
        "super_admin",
        "project_manager",
        "engineer",
        "client_admin",
        "client_editor",
        "client_viewer",
      ],
      portal_marker_kind: [
        "wifi_ap",
        "camera",
        "rack",
        "cable_route",
        "other",
        "switch",
        "nvr",
        "router_firewall",
        "data_point",
        "fibre_agg_switch",
        "fibre_liu",
        "fibre_splice",
        "patch_panel",
        "access_control",
        "note_marker",
      ],
      portal_marker_state: ["planned", "installed", "tested", "active"],
    },
  },
} as const
