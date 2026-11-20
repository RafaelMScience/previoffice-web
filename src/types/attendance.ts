/**
 * Attendance & Visit Domain Types
 * Captures the reception check-in, repeat visits, return consultations, and document checklists.
 */

export type AttendanceType = 
  | 'FIRST_CONSULTATION'
  | 'FIRST_VISIT'
  | 'BENEFIT_ANALYSIS'
  | 'PROCESS_TRACKING'
  | 'GUIDANCE'
  | 'RETURN'
  | 'RETURN_DOCUMENTS'
  | 'CONTRACT_SIGNING'
  | 'BENEFIT_INQUIRY'
  | 'GENERAL_QUERY'
  | 'OTHER';

export interface PendingPhysicalDocument {
  id: string;
  description: string;
  isDelivered: boolean;
  deliveredAt?: string;
}

export interface Attendance {
  id: string; // UUID
  tenantId: string;
  clientId: string;

  attendanceType: AttendanceType;
  attendedAt: string; // ISO datetime
  objective: string; // Benefit goal e.g. "Rural Retirement by Age"
  narrativeHistory?: string;
  initialIntakeNotes?: string;
  notes?: string;
  attendantName?: string; // Captured from current logged-in profile
  attendantUserId?: string; // Foreign key with ON DELETE SET NULL

  // Physical document tracking for return visits
  pendingDocuments?: PendingPhysicalDocument[];
  physicalFileLocation?: string; // e.g. "Cabinet B - Drawer 03 - Folder 2026-042"

  createdAt: string;
  updatedAt: string;
}

export interface AttendanceItemSummary {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientCpf?: string;
  benefitType: string;
  visitCount: number;
  attendedAt: string;
  attendantName: string;
  notes: string;
  status: string;
}

export interface AttendanceWithClient extends Attendance {
  clientName: string;
  clientCpf: string;
  clientPhone?: string;
  clientBenefitType?: string;
}
