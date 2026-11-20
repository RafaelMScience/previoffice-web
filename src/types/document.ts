/**
 * Document & Media Metadata Domain Types
 * Captures encrypted media (.apimg / .apdoc) and legal documents generated.
 */

export type DocumentCategory = 
  | 'IDENTIFICATION'
  | 'ADDRESS_PROOF'
  | 'EMPLOYMENT_BOOK' // CTPS
  | 'PPP_LTCAT'        // Special hazardous activity proofs
  | 'MEDICAL_REPORT'   // Doctor disability reports with ICD/CID
  | 'CNIS_EXTRACT'     // Social security contribution records
  | 'POWER_OF_ATTORNEY'// Procuracao Ad Judicia
  | 'FEE_CONTRACT'     // Contrato de Honorarios
  | 'OTHER';

export interface LegalDocument {
  id: string; // UUID
  tenantId: string;
  clientId: string;
  attendanceId?: string; // Optional link to specific visit

  originalName: string;
  displayName: string;
  category: DocumentCategory;
  mimeType: string;
  extension: string;
  sizeBytes: number;
  storagePath: string; // Cloudflare R2 or Supabase Storage key

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  deletedByName?: string;
  deletedByUserId?: string;
}
