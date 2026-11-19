/**
 * Settings, User Profile, Office and Team RBAC Types
 * Strictly in English. Maps to PostgreSQL Supabase schemas.
 */

export type MemberType = 'LAWYER' | 'ASSISTANT' | 'INTERN';

export interface TeamPermissions {
  receptionDesk: boolean;          // Access reception, queue and intake desk
  clientsManage: boolean;          // Create, view and edit client dossiers
  casesManage: boolean;            // Process updates, court movements, calendar
  contractsAndFinancial: boolean;  // Fee ledger, quota litis, installments settlement
  templatesManage: boolean;        // Create and edit OAB standard templates
  adminSettings: boolean;          // Manage office data, team members and permissions
  securityAudit: boolean;          // View security audit logs, sessions, and LGPD compliance
}

export interface TeamMember {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone?: string;
  memberType: MemberType;
  oabNumber?: string;              // Required when memberType === 'LAWYER'
  isAdminLawyer?: boolean;         // Partner / Admin Lawyer flag
  active: boolean;
  avatarUrl?: string;
  lastLoginAt?: string;
  temporaryPassword?: string;
  mustChangePassword?: boolean;
  permissions: TeamPermissions;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phone: string;
  memberType: MemberType;
  oabNumber?: string;
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'AUTHENTICATOR_APP' | 'SMS_WHATSAPP';
}

export interface OfficeSettings {
  tenantId: string;
  officeName: string;
  tradeName: string;
  cnpj: string;
  oabSocietyNumber: string;
  email: string;
  phone: string;
  whatsapp: string;
  street: string;
  streetNumber: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  logoUrl?: string;
  updatedAt: string;
}
