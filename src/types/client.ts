/**
 * Client Domain Types
 * Maps strictly to the SQLite Drift schema from the mobile app (E:\PIA\AlexandrePontes\app)
 * and the PostgreSQL Supabase schema. All domain fields are in English.
 */

export type MaritalStatus = 
  | 'SINGLE'
  | 'MARRIED'
  | 'STABLE_UNION'
  | 'DIVORCED'
  | 'SEPARATED'
  | 'WIDOWED'
  | 'OTHER';

export type SpecialCategory = 
  | 'RURAL'
  | 'SPECIAL_HAZARDOUS'
  | 'PCD'
  | 'URBAN_COMMON';

export type ClientStatus = 
  | 'PROSPECT'      // First consultation / Initial intake
  | 'PENDING'       // Maturation / Waiting for physical documents
  | 'CLOSED'        // Contract signed / Power of attorney issued
  | 'INACTIVE';     // Archived / Concluded

export interface Client {
  id: string; // UUID in Supabase
  tenantId: string; // Law office multi-tenant identifier

  // Personal Identification
  fullName: string;
  normalizedName: string;
  cpf?: string;
  normalizedCpf?: string; // Digits only (11 chars)
  rg?: string;
  birthDate?: string; // ISO date string (YYYY-MM-DD)
  maritalStatus?: MaritalStatus;
  profession?: string;
  nationality?: string;
  placeOfBirth?: string;
  motherName?: string;
  fatherName?: string;

  // Address
  postalCode?: string; // CEP
  normalizedPostalCode?: string;
  street?: string;
  streetNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string; // UF (2 chars, e.g. DF, SP, MG)

  // Contacts
  phone?: string;
  mobilePhone?: string; // WhatsApp
  email?: string;

  // Socioeconomic Profile
  monthlyIncome?: number;
  dependentCount?: number;

  // Social Security (INSS) Data
  hasActiveBenefit?: boolean;
  benefitType?: string; // e.g. "Rural Retirement", "BPC/LOAS", "Disability"
  benefitNumber?: string; // NB (10 digits)
  recentContributionsSummary?: string;
  specialCategories?: SpecialCategory[];

  // Sensitive & Security
  encryptedInssPassword?: string; // AES-256-GCM encrypted column
  photoReference?: string; // Path or cloud storage reference (.apimg)
  notes?: string;

  // Visit & Maturation Counters
  visitCount: number;
  lastVisitAt?: string; // ISO datetime
  lastAttendantName?: string;

  // Status & Audit
  status?: ClientStatus;
  active: boolean;
  inactivationReason?: string;
  inactivatedAt?: string;
  reactivatedAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string; // Soft delete
}

export interface ClientQuickIntake {
  fullName: string;
  mobilePhone: string;
  cpf?: string;
  benefitType: string;
  notes: string;
  status: ClientStatus;
}
