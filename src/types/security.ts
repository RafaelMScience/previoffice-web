/**
 * PreviOffice Security & Audit Types
 * Strictly in English. Maps to PostgreSQL Supabase audit tables.
 */

export type AuditAction =
  | 'VIEW_CLIENT'
  | 'EDIT_CLIENT'
  | 'CREATE_CLIENT'
  | 'VIEW_INSS_PASSWORD'
  | 'PRINT_CONTRACT'
  | 'DISCHARGE_FEE'
  | 'EXPORT_REPORT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'UPDATE_PERMISSIONS'
  | 'RESET_PASSWORD'
  | 'FIRST_ACCESS_PASSWORD_SET';

export type AuditSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  actorId: string;
  actorName: string;
  actorRole: string; // e.g. "Advogado Titular", "Advogada Associada", "Assistente de Recepção"
  action: AuditAction;
  actionDescription: string;
  targetResource: string;
  clientId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: AuditSeverity;
  integrityHash: string; // SHA-256 tamper-evident digital seal
}

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  startedAt: string;
  lastActivity: string;
  isCurrent: boolean;
}

export interface SecurityStats {
  totalLogsToday: number;
  activeSessionsCount: number;
  sensitiveDataAccessCount: number; // e.g. INSS password reveals
  securityAlertsCount: number;
  integritySealStatus: 'VERIFIED' | 'WARNING';
}

export interface LgpdConsentRecord {
  id: string;
  clientId: string;
  clientName: string;
  cpf: string;
  consentType: 'PREVIDENCIARIO_REPRESENTATION' | 'DATA_PROCESSING';
  signedAt: string;
  status: 'ACTIVE' | 'REVOKED';
  physicalDocumentLocation: string; // Armário / Gaveta
}
