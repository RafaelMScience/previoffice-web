/**
 * Tenant & User Profile Domain Types
 * Enforces law office multi-tenancy and Role-Based Access Control (RBAC).
 */

export type UserRole = 
  | 'MANAGING_LAWYER'  // Full administrative privileges (owner)
  | 'ASSOCIATE_LAWYER' // Legal operations & client management
  | 'RECEPTIONIST';    // Full client access (intake, returns, visits) without financial/admin settings

export interface Tenant {
  id: string; // UUID
  officeName: string;
  leadLawyerName: string;
  oabNumber: string; // Bar Association registration, e.g. "OAB/DF 123.456"
  taxId?: string; // CNPJ / CPF
  phone?: string;
  whatsapp?: string;
  email: string;
  address?: string;
  logoUrl?: string;

  // Subscription & Beta Trial
  planType: 'TRIAL_90_DAYS' | 'STARTER' | 'PRO';
  trialEndsAt: string; // ISO datetime (90 days from signup)
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string; // References auth.users.id
  tenantId: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}
