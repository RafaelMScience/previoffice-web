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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      attendances: {
        Row: {
          attendance_type: string
          attendant_name: string | null
          attendant_user_id: string | null
          attended_at: string
          client_id: string
          created_at: string
          id: string
          initial_intake_notes: string | null
          narrative_history: string | null
          notes: string | null
          objective: string
          pending_documents: Json | null
          physical_file_location: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attendance_type?: string
          attendant_name?: string | null
          attendant_user_id?: string | null
          attended_at?: string
          client_id: string
          created_at?: string
          id?: string
          initial_intake_notes?: string | null
          narrative_history?: string | null
          notes?: string | null
          objective: string
          pending_documents?: Json | null
          physical_file_location?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attendance_type?: string
          attendant_name?: string | null
          attendant_user_id?: string | null
          attended_at?: string
          client_id?: string
          created_at?: string
          id?: string
          initial_intake_notes?: string | null
          narrative_history?: string | null
          notes?: string | null
          objective?: string
          pending_documents?: Json | null
          physical_file_location?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendances_attendant_user_id_fkey"
            columns: ["attendant_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendances_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          active: boolean
          benefit_number: string | null
          benefit_type: string | null
          birth_date: string | null
          city: string | null
          complement: string | null
          cpf: string | null
          created_at: string
          deleted_at: string | null
          dependent_count: number | null
          email: string | null
          encrypted_inss_password: string | null
          father_name: string | null
          full_name: string
          has_active_benefit: boolean | null
          id: string
          inactivation_reason: string | null
          last_attendant_name: string | null
          last_visit_at: string | null
          marital_status: string | null
          mobile_phone: string | null
          monthly_income: number | null
          mother_name: string | null
          nationality: string | null
          neighborhood: string | null
          normalized_cpf: string | null
          normalized_name: string
          notes: string | null
          phone: string | null
          photo_reference: string | null
          place_of_birth: string | null
          postal_code: string | null
          profession: string | null
          recent_contributions_summary: string | null
          rg: string | null
          special_categories: string[] | null
          state: string | null
          status: string
          street: string | null
          street_number: string | null
          tenant_id: string
          updated_at: string
          visit_count: number
        }
        Insert: {
          active?: boolean
          benefit_number?: string | null
          benefit_type?: string | null
          birth_date?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          deleted_at?: string | null
          dependent_count?: number | null
          email?: string | null
          encrypted_inss_password?: string | null
          father_name?: string | null
          full_name: string
          has_active_benefit?: boolean | null
          id?: string
          inactivation_reason?: string | null
          last_attendant_name?: string | null
          last_visit_at?: string | null
          marital_status?: string | null
          mobile_phone?: string | null
          monthly_income?: number | null
          mother_name?: string | null
          nationality?: string | null
          neighborhood?: string | null
          normalized_cpf?: string | null
          normalized_name: string
          notes?: string | null
          phone?: string | null
          photo_reference?: string | null
          place_of_birth?: string | null
          postal_code?: string | null
          profession?: string | null
          recent_contributions_summary?: string | null
          rg?: string | null
          special_categories?: string[] | null
          state?: string | null
          status?: string
          street?: string | null
          street_number?: string | null
          tenant_id: string
          updated_at?: string
          visit_count?: number
        }
        Update: {
          active?: boolean
          benefit_number?: string | null
          benefit_type?: string | null
          birth_date?: string | null
          city?: string | null
          complement?: string | null
          cpf?: string | null
          created_at?: string
          deleted_at?: string | null
          dependent_count?: number | null
          email?: string | null
          encrypted_inss_password?: string | null
          father_name?: string | null
          full_name?: string
          has_active_benefit?: boolean | null
          id?: string
          inactivation_reason?: string | null
          last_attendant_name?: string | null
          last_visit_at?: string | null
          marital_status?: string | null
          mobile_phone?: string | null
          monthly_income?: number | null
          mother_name?: string | null
          nationality?: string | null
          neighborhood?: string | null
          normalized_cpf?: string | null
          normalized_name?: string
          notes?: string | null
          phone?: string | null
          photo_reference?: string | null
          place_of_birth?: string | null
          postal_code?: string | null
          profession?: string | null
          recent_contributions_summary?: string | null
          rg?: string | null
          special_categories?: string[] | null
          state?: string | null
          status?: string
          street?: string | null
          street_number?: string | null
          tenant_id?: string
          updated_at?: string
          visit_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          attendance_id: string | null
          category: string
          client_id: string
          created_at: string
          deleted_at: string | null
          display_name: string
          extension: string
          id: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          attendance_id?: string | null
          category: string
          client_id: string
          created_at?: string
          deleted_at?: string | null
          display_name: string
          extension: string
          id?: string
          mime_type: string
          original_name: string
          size_bytes: number
          storage_path: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          attendance_id?: string | null
          category?: string
          client_id?: string
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          extension?: string
          id?: string
          mime_type?: string
          original_name?: string
          size_bytes?: number
          storage_path?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          last_login_at: string | null
          oab_number: string | null
          phone: string | null
          role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          last_login_at?: string | null
          oab_number?: string | null
          phone?: string | null
          role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          oab_number?: string | null
          phone?: string | null
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          lead_lawyer_name: string
          logo_url: string | null
          oab_number: string
          office_name: string
          phone: string | null
          plan_type: string
          tax_id: string | null
          trial_ends_at: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          lead_lawyer_name: string
          logo_url?: string | null
          oab_number: string
          office_name: string
          phone?: string | null
          plan_type?: string
          tax_id?: string | null
          trial_ends_at?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          lead_lawyer_name?: string
          logo_url?: string | null
          oab_number?: string
          office_name?: string
          phone?: string | null
          plan_type?: string
          tax_id?: string | null
          trial_ends_at?: string
          updated_at?: string
          whatsapp?: string | null
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
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
