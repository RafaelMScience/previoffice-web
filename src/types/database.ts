/**
 * Database Schema Mapping (Supabase PostgreSQL)
 * Direct table row definitions matching PostgreSQL types.
 */

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          office_name: string;
          lead_lawyer_name: string;
          oab_number: string;
          tax_id: string | null;
          phone: string | null;
          whatsapp: string | null;
          email: string;
          address: string | null;
          logo_url: string | null;
          plan_type: string;
          trial_ends_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>;
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          email: string;
          role: string;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      clients: {
        Row: {
          id: string;
          tenant_id: string;
          full_name: string;
          normalized_name: string;
          cpf: string | null;
          normalized_cpf: string | null;
          rg: string | null;
          birth_date: string | null;
          marital_status: string | null;
          profession: string | null;
          nationality: string | null;
          place_of_birth: string | null;
          mother_name: string | null;
          father_name: string | null;
          postal_code: string | null;
          street: string | null;
          street_number: string | null;
          complement: string | null;
          neighborhood: string | null;
          city: string | null;
          state: string | null;
          phone: string | null;
          mobile_phone: string | null;
          email: string | null;
          monthly_income: number | null;
          dependent_count: number | null;
          has_active_benefit: boolean | null;
          benefit_type: string | null;
          benefit_number: string | null;
          recent_contributions_summary: string | null;
          special_categories: string[] | null;
          encrypted_inss_password: string | null;
          photo_reference: string | null;
          notes: string | null;
          visit_count: number;
          last_visit_at: string | null;
          last_attendant_name: string | null;
          status: string;
          active: boolean;
          inactivation_reason: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['clients']['Insert']>;
      };
      attendances: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string;
          attendance_type: string;
          attended_at: string;
          objective: string;
          narrative_history: string | null;
          initial_intake_notes: string | null;
          notes: string | null;
          attendant_name: string | null;
          attendant_user_id: string | null;
          pending_documents: any | null;
          physical_file_location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendances']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['attendances']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          tenant_id: string;
          client_id: string;
          attendance_id: string | null;
          original_name: string;
          display_name: string;
          category: string;
          mime_type: string;
          extension: string;
          size_bytes: number;
          storage_path: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
    };
  };
}
